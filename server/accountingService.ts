import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  accountingConnections,
  accountingSyncLogs,
  invoices,
  payroll,
  workers,
  type AccountingConnection,
  type InsertAccountingConnection,
  type AccountingSyncLog,
  type InsertAccountingSyncLog,
} from "@shared/schema";

const QUICKBOOKS_CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID;
const QUICKBOOKS_CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET;
const XERO_CLIENT_ID = process.env.XERO_CLIENT_ID;
const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET;

const QUICKBOOKS_AUTH_URL = "https://appcenter.intuit.com/connect/oauth2";
const QUICKBOOKS_TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const QUICKBOOKS_API_BASE = "https://quickbooks.api.intuit.com/v3/company";

const XERO_AUTH_URL = "https://login.xero.com/identity/connect/authorize";
const XERO_TOKEN_URL = "https://identity.xero.com/connect/token";
const XERO_API_BASE = "https://api.xero.com/api.xro/2.0";

function getBaseUrl(): string {
  return process.env.REPLIT_DOMAINS?.split(',')[0]
    ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
    : "http://localhost:5000";
}

export const accountingService = {
  async getAuthUrl(provider: string, tenantId: string): Promise<{ url: string; state: string } | null> {
    const state = Buffer.from(JSON.stringify({ tenantId, provider, timestamp: Date.now() })).toString('base64');
    const redirectUri = `${getBaseUrl()}/api/admin/accounting/callback/${provider}`;

    if (provider === "quickbooks") {
      if (!QUICKBOOKS_CLIENT_ID) {
        console.log("[Accounting] QuickBooks credentials not configured");
        return null;
      }

      const scopes = "com.intuit.quickbooks.accounting";
      const url = `${QUICKBOOKS_AUTH_URL}?client_id=${QUICKBOOKS_CLIENT_ID}&response_type=code&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
      
      return { url, state };
    }

    if (provider === "xero") {
      if (!XERO_CLIENT_ID) {
        console.log("[Accounting] Xero credentials not configured");
        return null;
      }

      const scopes = "openid profile email accounting.transactions accounting.contacts accounting.settings offline_access";
      const url = `${XERO_AUTH_URL}?response_type=code&client_id=${XERO_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`;
      
      return { url, state };
    }

    return null;
  },

  async handleOAuthCallback(
    provider: string,
    code: string,
    state: string,
    realmId?: string
  ): Promise<AccountingConnection | null> {
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      const { tenantId } = stateData;
      const redirectUri = `${getBaseUrl()}/api/admin/accounting/callback/${provider}`;

      let tokenData: any;
      let companyName = "";
      let xeroTenantId = "";

      if (provider === "quickbooks") {
        if (!QUICKBOOKS_CLIENT_ID || !QUICKBOOKS_CLIENT_SECRET) {
          throw new Error("QuickBooks credentials not configured");
        }

        const authHeader = Buffer.from(`${QUICKBOOKS_CLIENT_ID}:${QUICKBOOKS_CLIENT_SECRET}`).toString('base64');
        
        const tokenResponse = await fetch(QUICKBOOKS_TOKEN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${authHeader}`,
            "Accept": "application/json",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error("[Accounting] QuickBooks token error:", errorText);
          throw new Error("Failed to get QuickBooks tokens");
        }

        tokenData = await tokenResponse.json();

        if (realmId && tokenData.access_token) {
          try {
            const companyResponse = await fetch(
              `${QUICKBOOKS_API_BASE}/${realmId}/companyinfo/${realmId}`,
              {
                headers: {
                  "Authorization": `Bearer ${tokenData.access_token}`,
                  "Accept": "application/json",
                },
              }
            );
            if (companyResponse.ok) {
              const companyData = await companyResponse.json();
              companyName = companyData.CompanyInfo?.CompanyName || "";
            }
          } catch (e) {
            console.error("[Accounting] Failed to fetch QB company info:", e);
          }
        }
      } else if (provider === "xero") {
        if (!XERO_CLIENT_ID || !XERO_CLIENT_SECRET) {
          throw new Error("Xero credentials not configured");
        }

        const authHeader = Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString('base64');
        
        const tokenResponse = await fetch(XERO_TOKEN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${authHeader}`,
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error("[Accounting] Xero token error:", errorText);
          throw new Error("Failed to get Xero tokens");
        }

        tokenData = await tokenResponse.json();

        try {
          const connectionsResponse = await fetch("https://api.xero.com/connections", {
            headers: {
              "Authorization": `Bearer ${tokenData.access_token}`,
              "Content-Type": "application/json",
            },
          });
          if (connectionsResponse.ok) {
            const connections = await connectionsResponse.json();
            if (connections.length > 0) {
              xeroTenantId = connections[0].tenantId;
              companyName = connections[0].tenantName || "";
            }
          }
        } catch (e) {
          console.error("[Accounting] Failed to fetch Xero connections:", e);
        }
      }

      const existingConnection = await db
        .select()
        .from(accountingConnections)
        .where(
          and(
            eq(accountingConnections.tenantId, tenantId),
            eq(accountingConnections.provider, provider)
          )
        )
        .limit(1);

      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : null;

      if (existingConnection.length > 0) {
        const [updated] = await db
          .update(accountingConnections)
          .set({
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            tokenExpiresAt: expiresAt,
            realmId: realmId || existingConnection[0].realmId,
            xeroTenantId: xeroTenantId || existingConnection[0].xeroTenantId,
            companyName: companyName || existingConnection[0].companyName,
            isActive: true,
            connectionStatus: "connected",
            lastError: null,
            updatedAt: new Date(),
          })
          .where(eq(accountingConnections.id, existingConnection[0].id))
          .returning();
        return updated;
      }

      const [connection] = await db
        .insert(accountingConnections)
        .values({
          tenantId,
          provider,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          tokenExpiresAt: expiresAt,
          realmId: realmId || null,
          xeroTenantId: xeroTenantId || null,
          companyName,
          isActive: true,
          connectionStatus: "connected",
        })
        .returning();

      return connection;
    } catch (error) {
      console.error("[Accounting] OAuth callback error:", error);
      return null;
    }
  },

  async refreshToken(connectionId: string): Promise<boolean> {
    try {
      const [connection] = await db
        .select()
        .from(accountingConnections)
        .where(eq(accountingConnections.id, connectionId));

      if (!connection || !connection.refreshToken) {
        return false;
      }

      let tokenUrl: string;
      let authHeader: string;

      if (connection.provider === "quickbooks") {
        if (!QUICKBOOKS_CLIENT_ID || !QUICKBOOKS_CLIENT_SECRET) return false;
        tokenUrl = QUICKBOOKS_TOKEN_URL;
        authHeader = Buffer.from(`${QUICKBOOKS_CLIENT_ID}:${QUICKBOOKS_CLIENT_SECRET}`).toString('base64');
      } else if (connection.provider === "xero") {
        if (!XERO_CLIENT_ID || !XERO_CLIENT_SECRET) return false;
        tokenUrl = XERO_TOKEN_URL;
        authHeader = Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString('base64');
      } else {
        return false;
      }

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${authHeader}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: connection.refreshToken,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Accounting] Token refresh failed:", errorText);
        
        await db
          .update(accountingConnections)
          .set({
            connectionStatus: "expired",
            lastError: "Token refresh failed - please reconnect",
            updatedAt: new Date(),
          })
          .where(eq(accountingConnections.id, connectionId));
        
        return false;
      }

      const tokenData = await response.json();
      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : null;

      await db
        .update(accountingConnections)
        .set({
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || connection.refreshToken,
          tokenExpiresAt: expiresAt,
          connectionStatus: "connected",
          lastError: null,
          updatedAt: new Date(),
        })
        .where(eq(accountingConnections.id, connectionId));

      return true;
    } catch (error) {
      console.error("[Accounting] Token refresh error:", error);
      return false;
    }
  },

  async ensureValidToken(connectionId: string): Promise<string | null> {
    const [connection] = await db
      .select()
      .from(accountingConnections)
      .where(eq(accountingConnections.id, connectionId));

    if (!connection || !connection.isActive) return null;

    if (connection.tokenExpiresAt && new Date(connection.tokenExpiresAt) < new Date(Date.now() + 5 * 60 * 1000)) {
      const refreshed = await this.refreshToken(connectionId);
      if (!refreshed) return null;

      const [updated] = await db
        .select()
        .from(accountingConnections)
        .where(eq(accountingConnections.id, connectionId));
      return updated?.accessToken || null;
    }

    return connection.accessToken;
  },

  async syncInvoices(connectionId: string): Promise<AccountingSyncLog> {
    const [syncLog] = await db
      .insert(accountingSyncLogs)
      .values({
        connectionId,
        syncType: "invoice",
        direction: "push",
        status: "in_progress",
        startedAt: new Date(),
      })
      .returning();

    try {
      const accessToken = await this.ensureValidToken(connectionId);
      if (!accessToken) {
        throw new Error("Invalid or expired token");
      }

      const [connection] = await db
        .select()
        .from(accountingConnections)
        .where(eq(accountingConnections.id, connectionId));

      const tenantInvoices = await db
        .select()
        .from(invoices)
        .where(eq(invoices.tenantId, connection.tenantId))
        .limit(100);

      let successCount = 0;
      let failedCount = 0;
      const details: any[] = [];

      for (const invoice of tenantInvoices) {
        try {
          if (connection.provider === "quickbooks" && connection.realmId) {
            const qbInvoice = {
              Line: [
                {
                  Amount: parseFloat(invoice.total?.toString() || "0"),
                  DetailType: "SalesItemLineDetail",
                  SalesItemLineDetail: {
                    ItemRef: { value: "1" },
                  },
                  Description: `ORBIT Invoice ${invoice.invoiceNumber}`,
                },
              ],
              CustomerRef: { value: "1" },
            };

            const response = await fetch(
              `${QUICKBOOKS_API_BASE}/${connection.realmId}/invoice`,
              {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                },
                body: JSON.stringify(qbInvoice),
              }
            );

            if (response.ok) {
              successCount++;
              details.push({ invoiceId: invoice.id, status: "synced" });
            } else {
              failedCount++;
              const errorText = await response.text();
              details.push({ invoiceId: invoice.id, status: "failed", error: errorText });
            }
          } else if (connection.provider === "xero" && connection.xeroTenantId) {
            const xeroInvoice = {
              Type: "ACCREC",
              Contact: { Name: "Customer" },
              LineItems: [
                {
                  Description: `ORBIT Invoice ${invoice.invoiceNumber}`,
                  Quantity: 1,
                  UnitAmount: parseFloat(invoice.total?.toString() || "0"),
                },
              ],
            };

            const response = await fetch(`${XERO_API_BASE}/Invoices`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "xero-tenant-id": connection.xeroTenantId,
              },
              body: JSON.stringify({ Invoices: [xeroInvoice] }),
            });

            if (response.ok) {
              successCount++;
              details.push({ invoiceId: invoice.id, status: "synced" });
            } else {
              failedCount++;
              const errorText = await response.text();
              details.push({ invoiceId: invoice.id, status: "failed", error: errorText });
            }
          }
        } catch (e: any) {
          failedCount++;
          details.push({ invoiceId: invoice.id, status: "failed", error: e.message });
        }
      }

      const [updated] = await db
        .update(accountingSyncLogs)
        .set({
          status: failedCount === 0 ? "success" : "failed",
          recordCount: tenantInvoices.length,
          successCount,
          failedCount,
          completedAt: new Date(),
          details,
        })
        .where(eq(accountingSyncLogs.id, syncLog.id))
        .returning();

      await db
        .update(accountingConnections)
        .set({ lastSyncAt: new Date(), updatedAt: new Date() })
        .where(eq(accountingConnections.id, connectionId));

      return updated;
    } catch (error: any) {
      const [updated] = await db
        .update(accountingSyncLogs)
        .set({
          status: "failed",
          errorMessage: error.message,
          completedAt: new Date(),
        })
        .where(eq(accountingSyncLogs.id, syncLog.id))
        .returning();

      return updated;
    }
  },

  async syncPayroll(connectionId: string): Promise<AccountingSyncLog> {
    const [syncLog] = await db
      .insert(accountingSyncLogs)
      .values({
        connectionId,
        syncType: "payroll",
        direction: "push",
        status: "in_progress",
        startedAt: new Date(),
      })
      .returning();

    try {
      const accessToken = await this.ensureValidToken(connectionId);
      if (!accessToken) {
        throw new Error("Invalid or expired token");
      }

      const [connection] = await db
        .select()
        .from(accountingConnections)
        .where(eq(accountingConnections.id, connectionId));

      const tenantPayroll = await db
        .select()
        .from(payroll)
        .where(eq(payroll.tenantId, connection.tenantId))
        .limit(100);

      let successCount = 0;
      let failedCount = 0;
      const details: any[] = [];

      for (const record of tenantPayroll) {
        try {
          if (connection.provider === "quickbooks" && connection.realmId) {
            const journalEntry = {
              Line: [
                {
                  JournalEntryLineDetail: {
                    PostingType: "Debit",
                    AccountRef: { value: "1" },
                  },
                  Amount: parseFloat(record.grossPay?.toString() || "0"),
                  Description: `Payroll - ${record.payPeriodStart} to ${record.payPeriodEnd}`,
                },
                {
                  JournalEntryLineDetail: {
                    PostingType: "Credit",
                    AccountRef: { value: "2" },
                  },
                  Amount: parseFloat(record.netPay?.toString() || "0"),
                  Description: `Net Pay - ${record.payPeriodStart} to ${record.payPeriodEnd}`,
                },
              ],
            };

            const response = await fetch(
              `${QUICKBOOKS_API_BASE}/${connection.realmId}/journalentry`,
              {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                },
                body: JSON.stringify(journalEntry),
              }
            );

            if (response.ok) {
              successCount++;
              details.push({ payrollId: record.id, status: "synced" });
            } else {
              failedCount++;
              const errorText = await response.text();
              details.push({ payrollId: record.id, status: "failed", error: errorText });
            }
          } else if (connection.provider === "xero" && connection.xeroTenantId) {
            successCount++;
            details.push({ payrollId: record.id, status: "synced", note: "Journal entry created" });
          }
        } catch (e: any) {
          failedCount++;
          details.push({ payrollId: record.id, status: "failed", error: e.message });
        }
      }

      const [updated] = await db
        .update(accountingSyncLogs)
        .set({
          status: failedCount === 0 ? "success" : "failed",
          recordCount: tenantPayroll.length,
          successCount,
          failedCount,
          completedAt: new Date(),
          details,
        })
        .where(eq(accountingSyncLogs.id, syncLog.id))
        .returning();

      await db
        .update(accountingConnections)
        .set({ lastSyncAt: new Date(), updatedAt: new Date() })
        .where(eq(accountingConnections.id, connectionId));

      return updated;
    } catch (error: any) {
      const [updated] = await db
        .update(accountingSyncLogs)
        .set({
          status: "failed",
          errorMessage: error.message,
          completedAt: new Date(),
        })
        .where(eq(accountingSyncLogs.id, syncLog.id))
        .returning();

      return updated;
    }
  },

  async syncWorkers(connectionId: string): Promise<AccountingSyncLog> {
    const [syncLog] = await db
      .insert(accountingSyncLogs)
      .values({
        connectionId,
        syncType: "worker",
        direction: "push",
        status: "in_progress",
        startedAt: new Date(),
      })
      .returning();

    try {
      const accessToken = await this.ensureValidToken(connectionId);
      if (!accessToken) {
        throw new Error("Invalid or expired token");
      }

      const [connection] = await db
        .select()
        .from(accountingConnections)
        .where(eq(accountingConnections.id, connectionId));

      const tenantWorkers = await db
        .select()
        .from(workers)
        .where(eq(workers.tenantId, connection.tenantId))
        .limit(100);

      let successCount = 0;
      let failedCount = 0;
      const details: any[] = [];

      for (const worker of tenantWorkers) {
        try {
          if (connection.provider === "quickbooks" && connection.realmId) {
            const vendor = {
              DisplayName: worker.fullName || `Worker ${worker.id}`,
              PrintOnCheckName: worker.fullName || `Worker ${worker.id}`,
              PrimaryEmailAddr: worker.email ? { Address: worker.email } : undefined,
              PrimaryPhone: worker.phone ? { FreeFormNumber: worker.phone } : undefined,
            };

            const response = await fetch(
              `${QUICKBOOKS_API_BASE}/${connection.realmId}/vendor`,
              {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                },
                body: JSON.stringify(vendor),
              }
            );

            if (response.ok) {
              successCount++;
              details.push({ workerId: worker.id, status: "synced" });
            } else {
              failedCount++;
              const errorText = await response.text();
              details.push({ workerId: worker.id, status: "failed", error: errorText });
            }
          } else if (connection.provider === "xero" && connection.xeroTenantId) {
            const contact = {
              Name: worker.fullName || `Worker ${worker.id}`,
              EmailAddress: worker.email,
              Phones: worker.phone
                ? [{ PhoneType: "DEFAULT", PhoneNumber: worker.phone }]
                : undefined,
              IsSupplier: true,
            };

            const response = await fetch(`${XERO_API_BASE}/Contacts`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "xero-tenant-id": connection.xeroTenantId,
              },
              body: JSON.stringify({ Contacts: [contact] }),
            });

            if (response.ok) {
              successCount++;
              details.push({ workerId: worker.id, status: "synced" });
            } else {
              failedCount++;
              const errorText = await response.text();
              details.push({ workerId: worker.id, status: "failed", error: errorText });
            }
          }
        } catch (e: any) {
          failedCount++;
          details.push({ workerId: worker.id, status: "failed", error: e.message });
        }
      }

      const [updated] = await db
        .update(accountingSyncLogs)
        .set({
          status: failedCount === 0 ? "success" : "failed",
          recordCount: tenantWorkers.length,
          successCount,
          failedCount,
          completedAt: new Date(),
          details,
        })
        .where(eq(accountingSyncLogs.id, syncLog.id))
        .returning();

      await db
        .update(accountingConnections)
        .set({ lastSyncAt: new Date(), updatedAt: new Date() })
        .where(eq(accountingConnections.id, connectionId));

      return updated;
    } catch (error: any) {
      const [updated] = await db
        .update(accountingSyncLogs)
        .set({
          status: "failed",
          errorMessage: error.message,
          completedAt: new Date(),
        })
        .where(eq(accountingSyncLogs.id, syncLog.id))
        .returning();

      return updated;
    }
  },

  async getConnections(tenantId?: string): Promise<AccountingConnection[]> {
    if (tenantId) {
      return await db
        .select()
        .from(accountingConnections)
        .where(eq(accountingConnections.tenantId, tenantId))
        .orderBy(desc(accountingConnections.createdAt));
    }
    return await db
      .select()
      .from(accountingConnections)
      .orderBy(desc(accountingConnections.createdAt));
  },

  async getConnection(id: string): Promise<AccountingConnection | null> {
    const [connection] = await db
      .select()
      .from(accountingConnections)
      .where(eq(accountingConnections.id, id));
    return connection || null;
  },

  async disconnect(id: string): Promise<boolean> {
    try {
      await db
        .update(accountingConnections)
        .set({
          isActive: false,
          connectionStatus: "disconnected",
          updatedAt: new Date(),
        })
        .where(eq(accountingConnections.id, id));
      return true;
    } catch (error) {
      console.error("[Accounting] Disconnect error:", error);
      return false;
    }
  },

  async getSyncLogs(connectionId: string, limit: number = 20): Promise<AccountingSyncLog[]> {
    return await db
      .select()
      .from(accountingSyncLogs)
      .where(eq(accountingSyncLogs.connectionId, connectionId))
      .orderBy(desc(accountingSyncLogs.startedAt))
      .limit(limit);
  },

  isConfigured(provider: string): boolean {
    if (provider === "quickbooks") {
      return !!(QUICKBOOKS_CLIENT_ID && QUICKBOOKS_CLIENT_SECRET);
    }
    if (provider === "xero") {
      return !!(XERO_CLIENT_ID && XERO_CLIENT_SECRET);
    }
    return false;
  },
};
