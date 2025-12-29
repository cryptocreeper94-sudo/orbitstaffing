/**
 * ORBIT Financial Hub
 * Central financial processing engine for DarkWave Studios ecosystem
 * Tracks 1099/W-2 payments, royalty splits, generates blockchain-stamped statements
 */

import { db } from "./db";
import { 
  partnerProfiles, 
  financialEvents, 
  royaltyLedger, 
  financialStatements,
  payouts,
  documentReceipts,
  type PartnerProfile,
  type FinancialEvent,
  type RoyaltyLedger,
  type FinancialStatement,
  type Payout,
  type DocumentReceipt,
} from "@shared/schema";
import { eq, desc, and, sql, between, gte, lte } from "drizzle-orm";
import crypto from "crypto";

// Financial Hub API authentication
// Supports both ecosystem credentials and external app integrations (PaintPros, etc.)
const VALID_APP_IDS = ['dw_app_orbit', 'dw_app_paintpros', 'dw_app_brewandboard', 'dw_app_garagebot', 'dw_app_darkwavehealth'];

function getApiKey(): string {
  const key = process.env.ORBIT_ECOSYSTEM_API_KEY;
  if (!key) {
    throw new Error('ORBIT_ECOSYSTEM_API_KEY environment variable not set');
  }
  return key;
}

function getApiSecret(): string {
  const secret = process.env.ORBIT_ECOSYSTEM_API_SECRET;
  if (!secret) {
    throw new Error('ORBIT_ECOSYSTEM_API_SECRET environment variable not set');
  }
  return secret;
}

function getFinancialHubSecret(appId: string): string {
  // Each connected app can have its own webhook secret for isolation
  const appSecrets: Record<string, string | undefined> = {
    'dw_app_paintpros': process.env.PAINTPROS_WEBHOOK_SECRET,
    'dw_app_brewandboard': process.env.BREWANDBOARD_ECOSYSTEM_API_SECRET,
    'dw_app_garagebot': process.env.GARAGEBOT_WEBHOOK_SECRET,
    'dw_app_orbit': process.env.ORBIT_ECOSYSTEM_API_SECRET,
    'dw_app_darkwavehealth': process.env.DARKWAVEHEALTH_WEBHOOK_SECRET,
  };
  
  // Try app-specific secret first, fall back to ecosystem secret
  const secret = appSecrets[appId] || process.env.ORBIT_ECOSYSTEM_API_SECRET;
  if (!secret) {
    throw new Error(`No webhook secret configured for ${appId}`);
  }
  return secret;
}

function isValidAppId(apiKey: string): boolean {
  return VALID_APP_IDS.includes(apiKey) || apiKey === getApiKey();
}

export interface FinancialEventInput {
  sourceSystem: string;
  sourceAppId?: string;
  externalRef?: string;
  idempotencyKey?: string;
  eventType: 'revenue' | 'expense' | 'payout' | 'royalty_calculation' | 'adjustment';
  productCode?: string;
  periodStart?: string;
  periodEnd?: string;
  eventDate?: string;
  grossAmount: number;
  netAmount?: number;
  currency?: string;
  description?: string;
  invoiceIds?: string[];
  receiptIds?: string[];
  metadata?: Record<string, any>;
  blockchainStamp?: Record<string, any>;
}

export interface RoyaltySplitResult {
  partnerId: string;
  partnerName: string;
  splitPercentage: number;
  grossAmount: number;
  netAmount: number;
  taxWithholding: number;
  ledgerEntryId: string;
}

export interface StatementSummary {
  id: string;
  statementNumber: string;
  partnerId: string;
  partnerName: string;
  periodStart: string;
  periodEnd: string;
  totalGrossRevenue: number;
  totalExpenses: number;
  totalNetProfit: number;
  partnerShare: number;
  amountDue: number;
  status: string;
  solanaSignature?: string;
  darkwaveHash?: string;
}

function generateHmacSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || typeof signature !== 'string') {
    return false;
  }
  const expected = generateHmacSignature(payload, secret);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuffer, sigBuffer);
}

function hashPayload(payload: string): string {
  return crypto.createHash('sha256').update(payload).digest('hex');
}

export class FinancialHub {
  async getPartners(): Promise<PartnerProfile[]> {
    return await db.select().from(partnerProfiles).orderBy(partnerProfiles.fullName);
  }

  async getPartnerById(id: string): Promise<PartnerProfile | null> {
    const [partner] = await db.select().from(partnerProfiles).where(eq(partnerProfiles.id, id)).limit(1);
    return partner || null;
  }

  async getPartnerByEmail(email: string): Promise<PartnerProfile | null> {
    const [partner] = await db.select().from(partnerProfiles).where(eq(partnerProfiles.email, email)).limit(1);
    return partner || null;
  }

  async createPartner(data: {
    fullName: string;
    email: string;
    phone?: string;
    taxType?: '1099' | 'w2' | 'dual';
    taxId?: string;
    defaultSplitPercentage?: number;
    paymentMethod?: string;
    stripeAccountId?: string;
    venmoHandle?: string;
    cashAppHandle?: string;
    statementFrequency?: string;
    blockchainWallet?: string;
    notes?: string;
  }): Promise<PartnerProfile> {
    const [partner] = await db.insert(partnerProfiles).values({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      taxType: data.taxType || '1099',
      taxId: data.taxId,
      defaultSplitPercentage: data.defaultSplitPercentage?.toString() || '50.00',
      paymentMethod: data.paymentMethod || 'stripe',
      stripeAccountId: data.stripeAccountId,
      venmoHandle: data.venmoHandle,
      cashAppHandle: data.cashAppHandle,
      statementFrequency: data.statementFrequency || 'monthly',
      blockchainWallet: data.blockchainWallet,
      notes: data.notes,
      status: 'active',
    }).returning();
    return partner;
  }

  async updatePartner(id: string, data: Partial<{
    fullName: string;
    email: string;
    phone: string;
    taxType: string;
    taxId: string;
    w9OnFile: boolean;
    w9SignedDate: Date;
    defaultSplitPercentage: string;
    paymentMethod: string;
    stripeAccountId: string;
    bankAccountLast4: string;
    venmoHandle: string;
    cashAppHandle: string;
    statementFrequency: string;
    blockchainWallet: string;
    status: string;
    notes: string;
  }>): Promise<PartnerProfile | null> {
    const [updated] = await db.update(partnerProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(partnerProfiles.id, id))
      .returning();
    return updated || null;
  }

  async ingestFinancialEvent(
    input: FinancialEventInput,
    rawPayload: string,
    hmacSignature?: string
  ): Promise<{ event: FinancialEvent; royaltySplits: RoyaltySplitResult[] }> {
    if (input.idempotencyKey) {
      const [existing] = await db.select()
        .from(financialEvents)
        .where(eq(financialEvents.idempotencyKey, input.idempotencyKey))
        .limit(1);
      
      if (existing) {
        const ledgerEntries = await db.select()
          .from(royaltyLedger)
          .where(eq(royaltyLedger.financialEventId, existing.id));
        
        const splits: RoyaltySplitResult[] = await Promise.all(ledgerEntries.map(async (entry) => {
          const partner = await this.getPartnerById(entry.partnerId);
          return {
            partnerId: entry.partnerId,
            partnerName: partner?.fullName || 'Unknown',
            splitPercentage: parseFloat(entry.splitPercentage || '0'),
            grossAmount: parseFloat(entry.grossAmount || '0'),
            netAmount: parseFloat(entry.netAmount || '0'),
            taxWithholding: parseFloat(entry.taxWithholding || '0'),
            ledgerEntryId: entry.id,
          };
        }));
        
        return { event: existing, royaltySplits: splits };
      }
    }

    const [event] = await db.insert(financialEvents).values({
      sourceSystem: input.sourceSystem,
      sourceAppId: input.sourceAppId,
      externalRef: input.externalRef,
      idempotencyKey: input.idempotencyKey,
      eventType: input.eventType,
      productCode: input.productCode,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      eventDate: input.eventDate ? new Date(input.eventDate) : new Date(),
      grossAmount: input.grossAmount.toString(),
      netAmount: (input.netAmount || input.grossAmount).toString(),
      currency: input.currency || 'USD',
      description: input.description,
      invoiceIds: input.invoiceIds,
      receiptIds: input.receiptIds,
      metadata: input.metadata,
      blockchainStamp: input.blockchainStamp,
      hmacSignature: hmacSignature,
      rawPayloadHash: hashPayload(rawPayload),
      status: 'pending',
    }).returning();

    const royaltySplits = await this.calculateRoyaltySplits(event);

    await db.update(financialEvents)
      .set({ status: 'processed', processedAt: new Date() })
      .where(eq(financialEvents.id, event.id));

    return { event, royaltySplits };
  }

  async calculateRoyaltySplits(event: FinancialEvent): Promise<RoyaltySplitResult[]> {
    const partners = await db.select()
      .from(partnerProfiles)
      .where(eq(partnerProfiles.status, 'active'));

    if (partners.length === 0) {
      return [];
    }

    const grossAmount = parseFloat(event.grossAmount || '0');
    const splits: RoyaltySplitResult[] = [];

    for (const partner of partners) {
      const splitPercentage = parseFloat(partner.defaultSplitPercentage || '50');
      const partnerGross = grossAmount * (splitPercentage / 100);
      
      let taxWithholding = 0;
      if (partner.taxType === '1099' && !partner.w9OnFile) {
        taxWithholding = partnerGross * 0.24;
      }
      
      const netAmount = partnerGross - taxWithholding;

      const [ledgerEntry] = await db.insert(royaltyLedger).values({
        partnerId: partner.id,
        financialEventId: event.id,
        productCode: event.productCode,
        description: event.description,
        periodStart: event.periodStart,
        periodEnd: event.periodEnd,
        grossAmount: partnerGross.toFixed(2),
        splitPercentage: splitPercentage.toFixed(2),
        netAmount: netAmount.toFixed(2),
        taxWithholding: taxWithholding.toFixed(2),
        taxType: partner.taxType,
        auditTrail: {
          createdAt: new Date().toISOString(),
          sourceEvent: event.id,
          sourceSystem: event.sourceSystem,
          calculationMethod: 'percentage_split',
        },
        status: 'pending',
      }).returning();

      splits.push({
        partnerId: partner.id,
        partnerName: partner.fullName,
        splitPercentage,
        grossAmount: partnerGross,
        netAmount,
        taxWithholding,
        ledgerEntryId: ledgerEntry.id,
      });
    }

    return splits;
  }

  async getPartnerLedger(partnerId: string, limit: number = 20): Promise<RoyaltyLedger[]> {
    return await this.getLedgerEntries({ partnerId, limit });
  }

  async getLedgerEntries(filters?: {
    partnerId?: string;
    productCode?: string;
    status?: string;
    periodStart?: string;
    periodEnd?: string;
    limit?: number;
  }): Promise<RoyaltyLedger[]> {
    let query = db.select().from(royaltyLedger);
    
    const conditions = [];
    if (filters?.partnerId) {
      conditions.push(eq(royaltyLedger.partnerId, filters.partnerId));
    }
    if (filters?.productCode) {
      conditions.push(eq(royaltyLedger.productCode, filters.productCode));
    }
    if (filters?.status) {
      conditions.push(eq(royaltyLedger.status, filters.status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    
    return await query.orderBy(desc(royaltyLedger.createdAt)).limit(filters?.limit || 100);
  }

  async getFinancialEvents(filters?: {
    sourceSystem?: string;
    eventType?: string;
    status?: string;
    productCode?: string;
    limit?: number;
  }): Promise<FinancialEvent[]> {
    let query = db.select().from(financialEvents);
    
    const conditions = [];
    if (filters?.sourceSystem) {
      conditions.push(eq(financialEvents.sourceSystem, filters.sourceSystem));
    }
    if (filters?.eventType) {
      conditions.push(eq(financialEvents.eventType, filters.eventType));
    }
    if (filters?.status) {
      conditions.push(eq(financialEvents.status, filters.status));
    }
    if (filters?.productCode) {
      conditions.push(eq(financialEvents.productCode, filters.productCode));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    
    return await query.orderBy(desc(financialEvents.createdAt)).limit(filters?.limit || 100);
  }

  async generateStatement(
    partnerId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<StatementSummary> {
    const partner = await this.getPartnerById(partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }

    const ledgerEntries = await db.select()
      .from(royaltyLedger)
      .where(and(
        eq(royaltyLedger.partnerId, partnerId),
        gte(royaltyLedger.periodStart, periodStart),
        lte(royaltyLedger.periodEnd, periodEnd)
      ));

    let totalGrossRevenue = 0;
    let totalExpenses = 0;
    let partnerShare = 0;
    let taxWithholding = 0;

    const lineItems: any[] = [];

    for (const entry of ledgerEntries) {
      const gross = parseFloat(entry.grossAmount || '0');
      const net = parseFloat(entry.netAmount || '0');
      const tax = parseFloat(entry.taxWithholding || '0');

      totalGrossRevenue += gross;
      partnerShare += net;
      taxWithholding += tax;

      lineItems.push({
        id: entry.id,
        productCode: entry.productCode,
        description: entry.description,
        grossAmount: gross,
        splitPercentage: parseFloat(entry.splitPercentage || '0'),
        netAmount: net,
        taxWithholding: tax,
        status: entry.status,
      });
    }

    const totalNetProfit = totalGrossRevenue - totalExpenses;
    const amountDue = partnerShare - taxWithholding;

    const statementNumber = `STMT-${partner.id.substring(0, 8).toUpperCase()}-${Date.now()}`;

    const [statement] = await db.insert(financialStatements).values({
      partnerId,
      statementNumber,
      periodStart,
      periodEnd,
      totalGrossRevenue: totalGrossRevenue.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      totalNetProfit: totalNetProfit.toFixed(2),
      partnerShare: partnerShare.toFixed(2),
      taxWithholding: taxWithholding.toFixed(2),
      amountDue: amountDue.toFixed(2),
      lineItems,
      status: 'generated',
      generatedAt: new Date(),
    }).returning();

    for (const entry of ledgerEntries) {
      await db.update(royaltyLedger)
        .set({ statementId: statement.id, status: 'approved', approvedAt: new Date() })
        .where(eq(royaltyLedger.id, entry.id));
    }

    return {
      id: statement.id,
      statementNumber: statement.statementNumber!,
      partnerId: statement.partnerId,
      partnerName: partner.fullName,
      periodStart: statement.periodStart,
      periodEnd: statement.periodEnd,
      totalGrossRevenue,
      totalExpenses,
      totalNetProfit,
      partnerShare,
      amountDue,
      status: statement.status || 'generated',
      solanaSignature: statement.solanaSignature || undefined,
      darkwaveHash: statement.darkwaveHash || undefined,
    };
  }

  async getStatements(partnerId?: string): Promise<FinancialStatement[]> {
    if (partnerId) {
      return await db.select()
        .from(financialStatements)
        .where(eq(financialStatements.partnerId, partnerId))
        .orderBy(desc(financialStatements.createdAt));
    }
    return await db.select()
      .from(financialStatements)
      .orderBy(desc(financialStatements.createdAt));
  }

  async getStatementById(id: string): Promise<FinancialStatement | null> {
    const [statement] = await db.select()
      .from(financialStatements)
      .where(eq(financialStatements.id, id))
      .limit(1);
    return statement || null;
  }

  async createPayout(
    partnerId: string,
    statementId: string,
    amount: number,
    paymentMethod: string
  ): Promise<Payout> {
    const [payout] = await db.insert(payouts).values({
      partnerId,
      statementId,
      amount: amount.toFixed(2),
      paymentMethod,
      status: 'pending',
    }).returning();

    return payout;
  }

  async getPayouts(partnerId?: string): Promise<Payout[]> {
    if (partnerId) {
      return await db.select()
        .from(payouts)
        .where(eq(payouts.partnerId, partnerId))
        .orderBy(desc(payouts.createdAt));
    }
    return await db.select()
      .from(payouts)
      .orderBy(desc(payouts.createdAt));
  }

  async getFinancialSummary(): Promise<{
    totalPartners: number;
    totalEvents: number;
    totalPendingLedgerEntries: number;
    totalStatements: number;
    totalPayoutsPending: number;
    revenueThisMonth: number;
    expensesThisMonth: number;
  }> {
    const [partnersCount] = await db.select({ count: sql<number>`count(*)` }).from(partnerProfiles);
    const [eventsCount] = await db.select({ count: sql<number>`count(*)` }).from(financialEvents);
    const [pendingLedger] = await db.select({ count: sql<number>`count(*)` })
      .from(royaltyLedger)
      .where(eq(royaltyLedger.status, 'pending'));
    const [statementsCount] = await db.select({ count: sql<number>`count(*)` }).from(financialStatements);
    const [pendingPayouts] = await db.select({ count: sql<number>`count(*)` })
      .from(payouts)
      .where(eq(payouts.status, 'pending'));

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const [revenueResult] = await db.select({ 
      total: sql<number>`COALESCE(SUM(CAST(gross_amount AS DECIMAL)), 0)` 
    })
      .from(financialEvents)
      .where(and(
        eq(financialEvents.eventType, 'revenue'),
        gte(financialEvents.createdAt, startOfMonth)
      ));

    const [expensesResult] = await db.select({ 
      total: sql<number>`COALESCE(SUM(CAST(gross_amount AS DECIMAL)), 0)` 
    })
      .from(financialEvents)
      .where(and(
        eq(financialEvents.eventType, 'expense'),
        gte(financialEvents.createdAt, startOfMonth)
      ));

    return {
      totalPartners: Number(partnersCount?.count) || 0,
      totalEvents: Number(eventsCount?.count) || 0,
      totalPendingLedgerEntries: Number(pendingLedger?.count) || 0,
      totalStatements: Number(statementsCount?.count) || 0,
      totalPayoutsPending: Number(pendingPayouts?.count) || 0,
      revenueThisMonth: Number(revenueResult?.total) || 0,
      expensesThisMonth: Number(expensesResult?.total) || 0,
    };
  }

  verifyApiCredentials(apiKey: string, signature: string, payload: string): boolean {
    try {
      if (!isValidAppId(apiKey)) {
        console.log(`[Financial Hub] Invalid API key: ${apiKey}`);
        return false;
      }
      const secret = getFinancialHubSecret(apiKey);
      const isValid = verifyHmacSignature(payload, signature, secret);
      if (!isValid) {
        console.log(`[Financial Hub] Invalid HMAC signature from ${apiKey}`);
      }
      return isValid;
    } catch (e) {
      console.error('Financial Hub credential verification failed:', e);
      return false;
    }
  }
}

export const financialHub = new FinancialHub();
