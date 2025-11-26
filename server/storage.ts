import { oauthClients } from "./oauthClients";
import { storage } from "./storage";
import { db } from "./db";
import { syncLogs, syncedData } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// ========================
// SYNC ENGINE
// ========================
export class SyncEngine {
  // Data adapters for each provider
  private adapters: Record<string, DataAdapter> = {
    quickbooks: new QuickBooksAdapter(),
    adp: new ADPAdapter(),
    paychex: new PaychexAdapter(),
    ukgpro: new UKGProAdapter(),
    gusto: new GustoAdapter(),
    rippling: new RipplingAdapter(),
    workday: new WorkdayAdapter(),
    paylocity: new PaylocityAdapter(),
    onpay: new OnPayAdapter(),
    bullhorn: new BullhornAdapter(),
    wurknow: new WurkNowAdapter(),
    bamboohr: new BambooHRAdapter(),
    "google-workspace": new GoogleWorkspaceAdapter(),
    "microsoft-365": new Microsoft365Adapter(),
  };

  // Trigger sync for a specific integration
  async triggerSync(tenantId: string, integrationType: string, entityType?: string) {
    console.log(`📊 Sync triggered: ${integrationType} for tenant ${tenantId}`);

    try {
      // Get integration token
      const token = await storage.getIntegrationToken(tenantId, integrationType);
      if (!token) {
        console.warn(`No token found for ${integrationType}`);
        return null;
      }

      // Get adapter
      const adapter = this.adapters[integrationType];
      if (!adapter) {
        throw new Error(`No adapter for ${integrationType}`);
      }

      // Determine entity types to sync
      const entityTypes = entityType ? [entityType] : adapter.getEntityTypes();

      for (const entity of entityTypes) {
        await this.syncEntity(tenantId, integrationType, token, adapter, entity);
      }

      return { status: "completed", entityTypes };
    } catch (error) {
      console.error(`Sync error for ${integrationType}:`, error);
      return { status: "failed", error: String(error) };
    }
  }

  private async syncEntity(
    tenantId: string,
    integrationType: string,
    token: any,
    adapter: DataAdapter,
    entityType: string
  ) {
    const syncLog = await db
      .insert(syncLogs)
      .values({
        tenantId,
        integrationType,
        entityType,
        syncStatus: "in_progress",
        syncStartedAt: new Date(),
      })
      .returning()
      .then((r) => r[0]);

    try {
      // Fetch data from provider
      const externalData = await adapter.fetchData(token.accessToken, token.metadata);

      let recordsSucceeded = 0;
      let recordsFailed = 0;

      // Process each record
      for (const record of externalData) {
        try {
          // Normalize to ORBIT format
          const normalized = adapter.normalizeData(record, entityType);

          // Find or create local entry
          const existingLocal = await db
            .select()
            .from(syncedData)
            .where(
              and(
                eq(syncedData.tenantId, tenantId),
                eq(syncedData.integrationType, integrationType),
                eq(syncedData.entityType, entityType),
                eq(syncedData.externalId, record.id)
              )
            )
            .then((r) => r[0]);

          if (existingLocal) {
            // Update existing
            await db
              .update(syncedData)
              .set({
                sourceData: record,
                normalizedData: normalized,
                externalUpdatedAt: new Date(record.updatedAt || Date.now()),
                updatedAt: new Date(),
              })
              .where(eq(syncedData.id, existingLocal.id));
          } else {
            // Create new
            await db.insert(syncedData).values({
              tenantId,
              integrationType,
              entityType,
              externalId: record.id,
              sourceData: record,
              normalizedData: normalized,
              externalUpdatedAt: new Date(record.updatedAt || Date.now()),
            });
          }

          recordsSucceeded++;
        } catch (err) {
          console.error(`Failed to sync record ${record.id}:`, err);
          recordsFailed++;
        }
      }

      // Update sync log
      await db
        .update(syncLogs)
        .set({
          syncStatus: "completed",
          syncCompletedAt: new Date(),
          recordsProcessed: externalData.length,
          recordsSucceeded,
          recordsFailed,
          nextSyncAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // Next sync in 6 hours
        })
        .where(eq(syncLogs.id, syncLog.id));

      console.log(`✅ Synced ${recordsSucceeded}/${externalData.length} ${entityType} records`);
    } catch (error) {
      await db
        .update(syncLogs)
        .set({
          syncStatus: "failed",
          syncCompletedAt: new Date(),
          errorMessage: String(error),
        })
        .where(eq(syncLogs.id, syncLog.id));

      console.error(`❌ Sync failed:`, error);
    }
  }

  // Get synced data for display
  async getSyncedData(tenantId: string, integrationType: string, entityType: string) {
    return await db
      .select()
      .from(syncedData)
      .where(
        and(
          eq(syncedData.tenantId, tenantId),
          eq(syncedData.integrationType, integrationType),
          eq(syncedData.entityType, entityType)
        )
      );
  }

  // Get sync history
  async getSyncHistory(tenantId: string, limit: number = 20) {
    return await db
      .select()
      .from(syncLogs)
      .where(eq(syncLogs.tenantId, tenantId))
      .orderBy((t) => t.createdAt)
      .limit(limit);
  }
}

// ========================
// DATA ADAPTERS (Per Provider)
// ========================
interface DataAdapter {
  getEntityTypes(): string[];
  fetchData(accessToken: string, metadata?: any): Promise<any[]>;
  normalizeData(data: any, entityType: string): any;
}

class QuickBooksAdapter implements DataAdapter {
  getEntityTypes() {
    return ["customer", "invoice"];
  }

  async fetchData(accessToken: string, metadata?: any) {
    try {
      const customers = await oauthClients.callAPI(
        "quickbooks",
        accessToken,
        "/query?query=select * from Customer",
        "GET"
      );
      return customers?.QueryResponse?.Customer || [];
    } catch (err) {
      console.error("QB fetch failed:", err);
      return [];
    }
  }

  normalizeData(data: any, entityType: string) {
    if (entityType === "customer") {
      return {
        id: data.Id,
        name: data.DisplayName,
        email: data.PrimaryEmailAddr?.Address,
        phone: data.PrimaryPhone?.FreeFormNumber,
        address: data.BillAddr,
        type: "customer",
      };
    }
    return data;
  }
}

class ADPAdapter implements DataAdapter {
  getEntityTypes() {
    return ["worker"];
  }

  async fetchData(accessToken: string, metadata?: any) {
    try {
      const response = await oauthClients.callAPI(
        "adp",
        accessToken,
        "/hr/v2/workers",
        "GET"
      );
      return response?.workers || [];
    } catch (err) {
      console.error("ADP fetch failed:", err);
      return [];
    }
  }

  normalizeData(data: any, entityType: string) {
    if (entityType === "worker") {
      return {
        id: data.associateOID,
        firstName: data.person?.firstName,
        lastName: data.person?.lastName,
        email: data.person?.emailAddress,
        phone: data.person?.phoneNumber,
        hire_date: data.startDate,
        type: "worker",
      };
    }
    return data;
  }
}

class PaychexAdapter implements DataAdapter {
  getEntityTypes() {
    return ["worker", "payroll"];
  }

  async fetchData(accessToken: string, metadata?: any) {
    try {
      const response = await oauthClients.callAPI(
        "paychex",
        accessToken,
        "/employees",
        "GET"
      );
      return response?.data || [];
    } catch (err) {
      console.error("Paychex fetch failed:", err);
      return [];
    }
  }

  normalizeData(data: any, entityType: string) {
    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      type: entityType,
    };
  }
}

class UKGProAdapter implements DataAdapter {
  getEntityTypes() {
    return ["worker", "schedule"];
  }

  async fetchData(accessToken: string, metadata?: any) {
    try {
      const response = await oauthClients.callAPI(
        "ukgpro",
        accessToken,
        "/employees",
        "GET"
      );
      return response?.employees || [];
    } catch (err) {
      console.error("UKG Pro fetch failed:", err);
      return [];
    }
  }

  normalizeData(data: any, entityType: string) {
    return {
      id: data.employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.emailAddress,
      phone: data.phoneNumber,
      type: entityType,
    };
  }
}

// Placeholder adapters for other providers (follow same pattern)
class GustoAdapter implements DataAdapter {
  getEntityTypes() {
    return ["worker", "payroll"];
  }
  async fetchData(accessToken: string, metadata?: any) {
    return [];
  }
  normalizeData(data: any, entityType: string) {
    return { id: data.id, type: entityType };
  }
}

class RipplingAdapter implements DataAdapter {
  getEntityTypes() {
    return ["worker", "payroll"];
  }
  async fetchData(accessToken: string, metadata?: any) {
    return [];
  }
  normalizeData(data: any, entityType: string) {
    return { id: data.id, type: entityType };
  }
}

class WorkdayAdapter implements DataAdapter {
  getEntityTypes() {
    return ["worker", "payroll"];
  }
  async fetchData(accessToken: string, metadata?: any) {
    return [];
  }
  normalizeData(data: any, entityType: string) {
    return { id: data.id, type: entityType };
  }
}

class PaylocityAdapter implements DataAdapter {
  getEntityTypes() {
    return ["worker", "payroll"];
  }
  async fetchData(accessToken: string, metadata?: any) {
    return [];
  }
  normalizeData(data: any, entityType: string) {
    return { id: data.id, type: entityType };
  }
}

class OnPayAdapter implements DataAdapter {
  getEntityTypes() {
    return ["worker", "payroll"];
  }
  async fetchData(accessToken: string, metadata?: any) {
    return [];
  }
  normalizeData(data: any, entityType: string) {
    return { id: data.id, type: entityType };
  }
}

class BullhornAdapter implements DataAdapter {
  getEntityTypes() {
    return ["worker", "placement"];
  }
  async fetchData(accessToken: string, metadata?: any) {
    return [];
  }
  normalizeData(data: any, entityType: string) {
    return { id: data.id, type: entityType };
  }
}

class WurkNowAdapter implements DataAdapter {
  getEntityTypes() {
    return ["worker", "assignment"];
  }
  async fetchData(accessToken: string, metadata?: any) {
    return [];
  }
  normalizeData(data: any, entityType: string) {
    return { id: data.id, type: entityType };
  }
}

class BambooHRAdapter implements DataAdapter {
  getEntityTypes() {
    return ["worker"];
  }
  async fetchData(accessToken: string, metadata?: any) {
    return [];
  }
  normalizeData(data: any, entityType: string) {
    return { id: data.id, type: entityType };
  }
}

class GoogleWorkspaceAdapter implements DataAdapter {
  getEntityTypes() {
    return ["contact", "calendar"];
  }
  async fetchData(accessToken: string, metadata?: any) {
    return [];
  }
  normalizeData(data: any, entityType: string) {
    return { id: data.id, type: entityType };
  }
}

class Microsoft365Adapter implements DataAdapter {
  getEntityTypes() {
    return ["contact", "calendar"];
  }
  async fetchData(accessToken: string, metadata?: any) {
    return [];
  }
  normalizeData(data: any, entityType: string) {
    return { id: data.id, type: entityType };
  }
}

// Export singleton
export const syncEngine = new SyncEngine();
