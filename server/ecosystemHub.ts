/**
 * DarkWave Ecosystem Hub
 * Full ecosystem server for receiving and sending cross-app data
 * Compatible with all DarkWave products (ORBIT, Brew & Board, Lot Ops, etc.)
 */

import { db } from "./db";
import { 
  ecosystemConnectedApps, 
  ecosystemCodeSnippets, 
  ecosystemDataSyncs,
  ecosystemActivityLogs,
  ecosystemExternalHubs,
  type EcosystemConnectedApp,
  type EcosystemCodeSnippet,
  type EcosystemDataSync,
  type EcosystemActivityLog,
  type EcosystemExternalHub,
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import crypto from "crypto";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface EcosystemAppRegistration {
  appName: string;
  appSlug: string;
  appUrl?: string;
  description?: string;
  logoUrl?: string;
  permissions: string[];
}

export interface CodeSnippetInput {
  name: string;
  description?: string;
  code: string;
  language: string;
  category: 'component' | 'utility' | 'hook' | 'api' | 'config' | 'style' | 'other';
  tags?: string[];
  isPublic?: boolean;
  version?: string;
}

export interface ContractorSyncData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalPaid?: number;
  status?: string;
}

export interface Payment1099Data {
  payeeId: string;
  payeeName: string;
  amount: number;
  date: string;
  description?: string;
}

export interface WorkerSyncData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: string;
  payRate?: number;
  workState?: string;
  certifications?: string[];
}

export interface TimesheetSyncData {
  id: string;
  workerId: string;
  date: string;
  hoursWorked: number;
  overtimeHours?: number;
  jobId?: string;
  status: string;
}

export interface CertificationSyncData {
  id: string;
  workerId: string;
  name: string;
  issuedBy?: string;
  issueDate?: string;
  expirationDate?: string;
  status: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function generateApiKey(): string {
  return `dw_app_${crypto.randomBytes(24).toString('hex')}`;
}

function generateApiSecret(): string {
  return `dw_secret_${crypto.randomBytes(32).toString('hex')}`;
}

function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

function verifySecret(secret: string, hash: string): boolean {
  return hashSecret(secret) === hash;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ECOSYSTEM HUB CLASS (SERVER-SIDE - Receives connections)
// ═══════════════════════════════════════════════════════════════════════════════

export class DarkWaveEcosystemHub {
  
  // ─────────────────────────────────────────────────────────────────────────────
  // APP REGISTRATION & AUTHENTICATION
  // ─────────────────────────────────────────────────────────────────────────────
  
  async registerApp(registration: EcosystemAppRegistration): Promise<{ app: EcosystemConnectedApp; apiKey: string; apiSecret: string }> {
    const apiKey = generateApiKey();
    const apiSecret = generateApiSecret();
    const apiSecretHash = hashSecret(apiSecret);
    
    const [app] = await db.insert(ecosystemConnectedApps).values({
      appName: registration.appName,
      appSlug: registration.appSlug,
      appUrl: registration.appUrl,
      description: registration.description,
      logoUrl: registration.logoUrl,
      apiKey,
      apiSecretHash,
      permissions: registration.permissions,
      isActive: true,
    }).returning();
    
    await this.logActivity(app.id, app.appName, 'app.registered', 'app', app.id, { permissions: registration.permissions });
    
    return { app, apiKey, apiSecret };
  }
  
  async authenticateApp(apiKey: string, apiSecret: string): Promise<EcosystemConnectedApp | null> {
    const [app] = await db.select().from(ecosystemConnectedApps)
      .where(and(eq(ecosystemConnectedApps.apiKey, apiKey), eq(ecosystemConnectedApps.isActive, true)));
    
    if (!app) return null;
    if (!verifySecret(apiSecret, app.apiSecretHash)) return null;
    
    // Update last sync timestamp
    await db.update(ecosystemConnectedApps)
      .set({ lastSyncAt: new Date(), syncCount: sql`${ecosystemConnectedApps.syncCount} + 1` })
      .where(eq(ecosystemConnectedApps.id, app.id));
    
    return app;
  }
  
  async getConnectedApps(): Promise<EcosystemConnectedApp[]> {
    return db.select().from(ecosystemConnectedApps).orderBy(desc(ecosystemConnectedApps.createdAt));
  }
  
  async getAppById(appId: string): Promise<EcosystemConnectedApp | null> {
    const [app] = await db.select().from(ecosystemConnectedApps).where(eq(ecosystemConnectedApps.id, appId));
    return app || null;
  }
  
  async updateAppPermissions(appId: string, permissions: string[]): Promise<EcosystemConnectedApp | null> {
    const [app] = await db.update(ecosystemConnectedApps)
      .set({ permissions, updatedAt: new Date() })
      .where(eq(ecosystemConnectedApps.id, appId))
      .returning();
    return app || null;
  }
  
  async deactivateApp(appId: string): Promise<boolean> {
    await db.update(ecosystemConnectedApps)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(ecosystemConnectedApps.id, appId));
    return true;
  }
  
  async regenerateAppCredentials(appId: string): Promise<{ apiKey: string; apiSecret: string } | null> {
    const apiKey = generateApiKey();
    const apiSecret = generateApiSecret();
    const apiSecretHash = hashSecret(apiSecret);
    
    const [app] = await db.update(ecosystemConnectedApps)
      .set({ apiKey, apiSecretHash, updatedAt: new Date() })
      .where(eq(ecosystemConnectedApps.id, appId))
      .returning();
    
    if (!app) return null;
    
    await this.logActivity(appId, app.appName, 'credentials.regenerated', 'app', appId);
    
    return { apiKey, apiSecret };
  }
  
  hasPermission(app: EcosystemConnectedApp, permission: string): boolean {
    if (app.permissions?.includes('sync:all')) return true;
    return app.permissions?.includes(permission) || false;
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // CODE SNIPPETS
  // ─────────────────────────────────────────────────────────────────────────────
  
  async pushSnippet(app: EcosystemConnectedApp, snippet: CodeSnippetInput): Promise<EcosystemCodeSnippet> {
    const [created] = await db.insert(ecosystemCodeSnippets).values({
      sourceAppId: app.id,
      sourceAppName: app.appName,
      name: snippet.name,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      category: snippet.category,
      tags: snippet.tags || [],
      isPublic: snippet.isPublic ?? false,
      version: snippet.version || '1.0.0',
    }).returning();
    
    await this.logActivity(app.id, app.appName, 'snippet.pushed', 'snippet', created.id, { name: snippet.name });
    
    return created;
  }
  
  async getSnippets(category?: string, language?: string, publicOnly = false): Promise<EcosystemCodeSnippet[]> {
    let query = db.select().from(ecosystemCodeSnippets);
    
    const conditions = [];
    if (category) conditions.push(eq(ecosystemCodeSnippets.category, category));
    if (language) conditions.push(eq(ecosystemCodeSnippets.language, language));
    if (publicOnly) conditions.push(eq(ecosystemCodeSnippets.isPublic, true));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    
    return query.orderBy(desc(ecosystemCodeSnippets.createdAt));
  }
  
  async getSnippetById(snippetId: string): Promise<EcosystemCodeSnippet | null> {
    const [snippet] = await db.select().from(ecosystemCodeSnippets).where(eq(ecosystemCodeSnippets.id, snippetId));
    
    if (snippet) {
      // Increment usage count
      await db.update(ecosystemCodeSnippets)
        .set({ usageCount: sql`${ecosystemCodeSnippets.usageCount} + 1` })
        .where(eq(ecosystemCodeSnippets.id, snippetId));
    }
    
    return snippet || null;
  }
  
  async deleteSnippet(snippetId: string, appId: string): Promise<boolean> {
    const [snippet] = await db.select().from(ecosystemCodeSnippets).where(eq(ecosystemCodeSnippets.id, snippetId));
    
    // Only allow deletion by source app
    if (!snippet || snippet.sourceAppId !== appId) return false;
    
    await db.delete(ecosystemCodeSnippets).where(eq(ecosystemCodeSnippets.id, snippetId));
    return true;
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // DATA SYNC - ORBIT SPECIFIC
  // ─────────────────────────────────────────────────────────────────────────────
  
  async syncContractors(app: EcosystemConnectedApp, contractors: ContractorSyncData[]): Promise<EcosystemDataSync> {
    const [sync] = await db.insert(ecosystemDataSyncs).values({
      sourceAppId: app.id,
      sourceAppName: app.appName,
      syncType: 'contractors',
      direction: 'inbound',
      recordCount: contractors.length,
      dataPayload: { contractors },
      status: 'completed',
      processedAt: new Date(),
    }).returning();
    
    await this.logActivity(app.id, app.appName, 'sync.contractors', 'sync', sync.id, { count: contractors.length });
    
    return sync;
  }
  
  async sync1099Payments(app: EcosystemConnectedApp, year: number, payments: Payment1099Data[]): Promise<EcosystemDataSync> {
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    
    const [sync] = await db.insert(ecosystemDataSyncs).values({
      sourceAppId: app.id,
      sourceAppName: app.appName,
      syncType: '1099_payments',
      direction: 'inbound',
      recordCount: payments.length,
      dataPayload: { year, payments, totalAmount },
      status: 'completed',
      processedAt: new Date(),
    }).returning();
    
    await this.logActivity(app.id, app.appName, 'sync.1099', 'sync', sync.id, { year, count: payments.length, totalAmount });
    
    return sync;
  }
  
  async syncWorkers(app: EcosystemConnectedApp, workers: WorkerSyncData[]): Promise<EcosystemDataSync> {
    const [sync] = await db.insert(ecosystemDataSyncs).values({
      sourceAppId: app.id,
      sourceAppName: app.appName,
      syncType: 'workers',
      direction: 'inbound',
      recordCount: workers.length,
      dataPayload: { workers },
      status: 'completed',
      processedAt: new Date(),
    }).returning();
    
    await this.logActivity(app.id, app.appName, 'sync.workers', 'sync', sync.id, { count: workers.length });
    
    return sync;
  }
  
  async syncTimesheets(app: EcosystemConnectedApp, timesheets: TimesheetSyncData[]): Promise<EcosystemDataSync> {
    const totalHours = timesheets.reduce((sum, t) => sum + t.hoursWorked + (t.overtimeHours || 0), 0);
    
    const [sync] = await db.insert(ecosystemDataSyncs).values({
      sourceAppId: app.id,
      sourceAppName: app.appName,
      syncType: 'timesheets',
      direction: 'inbound',
      recordCount: timesheets.length,
      dataPayload: { timesheets, totalHours },
      status: 'completed',
      processedAt: new Date(),
    }).returning();
    
    await this.logActivity(app.id, app.appName, 'sync.timesheets', 'sync', sync.id, { count: timesheets.length, totalHours });
    
    return sync;
  }
  
  async syncCertifications(app: EcosystemConnectedApp, certifications: CertificationSyncData[]): Promise<EcosystemDataSync> {
    const [sync] = await db.insert(ecosystemDataSyncs).values({
      sourceAppId: app.id,
      sourceAppName: app.appName,
      syncType: 'certifications',
      direction: 'inbound',
      recordCount: certifications.length,
      dataPayload: { certifications },
      status: 'completed',
      processedAt: new Date(),
    }).returning();
    
    await this.logActivity(app.id, app.appName, 'sync.certifications', 'sync', sync.id, { count: certifications.length });
    
    return sync;
  }
  
  async getSyncHistory(appId?: string, syncType?: string, limit = 50): Promise<EcosystemDataSync[]> {
    let query = db.select().from(ecosystemDataSyncs);
    
    const conditions = [];
    if (appId) conditions.push(eq(ecosystemDataSyncs.sourceAppId, appId));
    if (syncType) conditions.push(eq(ecosystemDataSyncs.syncType, syncType));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    
    return query.orderBy(desc(ecosystemDataSyncs.createdAt)).limit(limit);
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIVITY LOGGING
  // ─────────────────────────────────────────────────────────────────────────────
  
  async logActivity(
    appId: string | null, 
    appName: string, 
    action: string, 
    resource?: string, 
    resourceId?: string, 
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<EcosystemActivityLog> {
    const [log] = await db.insert(ecosystemActivityLogs).values({
      appId,
      appName,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
    }).returning();
    
    return log;
  }
  
  async getActivityLogs(appId?: string, limit = 100): Promise<EcosystemActivityLog[]> {
    let query = db.select().from(ecosystemActivityLogs);
    
    if (appId) {
      query = query.where(eq(ecosystemActivityLogs.appId, appId)) as typeof query;
    }
    
    return query.orderBy(desc(ecosystemActivityLogs.createdAt)).limit(limit);
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // STATISTICS
  // ─────────────────────────────────────────────────────────────────────────────
  
  async getHubStats(): Promise<{
    totalApps: number;
    activeApps: number;
    totalSnippets: number;
    totalSyncs: number;
    recentActivity: EcosystemActivityLog[];
  }> {
    const [appStats] = await db.select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where ${ecosystemConnectedApps.isActive} = true)`,
    }).from(ecosystemConnectedApps);
    
    const [snippetStats] = await db.select({
      total: sql<number>`count(*)`,
    }).from(ecosystemCodeSnippets);
    
    const [syncStats] = await db.select({
      total: sql<number>`count(*)`,
    }).from(ecosystemDataSyncs);
    
    const recentActivity = await db.select()
      .from(ecosystemActivityLogs)
      .orderBy(desc(ecosystemActivityLogs.createdAt))
      .limit(10);
    
    return {
      totalApps: Number(appStats?.total) || 0,
      activeApps: Number(appStats?.active) || 0,
      totalSnippets: Number(snippetStats?.total) || 0,
      totalSyncs: Number(syncStats?.total) || 0,
      recentActivity,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ECOSYSTEM CLIENT CLASS (Connecting TO other hubs like Brew & Board)
// ═══════════════════════════════════════════════════════════════════════════════

export class EcosystemClient {
  private hubUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private appName: string;
  
  constructor(config: { hubUrl: string; apiKey: string; apiSecret: string; appName?: string }) {
    this.hubUrl = config.hubUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.appName = config.appName || 'ORBIT Staffing';
  }
  
  private async request<T>(endpoint: string, method: string, body?: any): Promise<T> {
    const response = await fetch(`${this.hubUrl}/api/ecosystem${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'X-API-Secret': this.apiSecret,
        'X-App-Name': this.appName,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ecosystem request failed: ${response.status} - ${error}`);
    }
    
    return response.json();
  }
  
  async checkConnection(): Promise<{ connected: boolean; permissions: string[]; hubName?: string }> {
    try {
      return await this.request('/status', 'GET');
    } catch {
      return { connected: false, permissions: [] };
    }
  }
  
  async pushSnippet(snippet: CodeSnippetInput): Promise<EcosystemCodeSnippet> {
    return this.request('/snippets', 'POST', snippet);
  }
  
  async getSnippets(category?: string): Promise<EcosystemCodeSnippet[]> {
    const query = category ? `?category=${category}` : '';
    return this.request(`/snippets${query}`, 'GET');
  }
  
  async syncContractors(contractors: ContractorSyncData[]): Promise<EcosystemDataSync> {
    return this.request('/sync/contractors', 'POST', { contractors });
  }
  
  async sync1099Data(year: number, payments: Payment1099Data[]): Promise<EcosystemDataSync> {
    return this.request('/sync/1099', 'POST', { year, payments });
  }
  
  async syncWorkers(workers: WorkerSyncData[]): Promise<EcosystemDataSync> {
    return this.request('/sync/workers', 'POST', { workers });
  }
  
  async syncTimesheets(timesheets: TimesheetSyncData[]): Promise<EcosystemDataSync> {
    return this.request('/sync/timesheets', 'POST', { timesheets });
  }
  
  async syncCertifications(certifications: CertificationSyncData[]): Promise<EcosystemDataSync> {
    return this.request('/sync/certifications', 'POST', { certifications });
  }
  
  async getActivityLogs(): Promise<EcosystemActivityLog[]> {
    return this.request('/logs', 'GET');
  }
  
  async logActivity(action: string, details?: Record<string, any>): Promise<EcosystemActivityLog> {
    return this.request('/logs', 'POST', { action, details });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTERNAL HUB MANAGEMENT (ORBIT connecting to other hubs)
// ═══════════════════════════════════════════════════════════════════════════════

export class ExternalHubManager {
  
  async addExternalHub(config: {
    hubName: string;
    hubUrl: string;
    apiKey: string;
    apiSecret: string;
    permissions?: string[];
    autoSync?: boolean;
    syncFrequency?: string;
  }): Promise<EcosystemExternalHub> {
    // Test connection first
    const client = new EcosystemClient({
      hubUrl: config.hubUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    
    const status = await client.checkConnection();
    if (!status.connected) {
      throw new Error('Unable to connect to external hub. Check credentials.');
    }
    
    const [hub] = await db.insert(ecosystemExternalHubs).values({
      hubName: config.hubName,
      hubUrl: config.hubUrl,
      apiKey: config.apiKey,
      apiSecretEncrypted: config.apiSecret, // In production, encrypt this
      permissions: config.permissions || status.permissions,
      isActive: true,
      autoSync: config.autoSync ?? false,
      syncFrequency: config.syncFrequency || 'manual',
      lastSyncStatus: 'connected',
    }).returning();
    
    return hub;
  }
  
  async getExternalHubs(): Promise<EcosystemExternalHub[]> {
    return db.select().from(ecosystemExternalHubs).orderBy(desc(ecosystemExternalHubs.createdAt));
  }
  
  async getExternalHubById(hubId: string): Promise<EcosystemExternalHub | null> {
    const [hub] = await db.select().from(ecosystemExternalHubs).where(eq(ecosystemExternalHubs.id, hubId));
    return hub || null;
  }
  
  async getClientForHub(hubId: string): Promise<EcosystemClient | null> {
    const hub = await this.getExternalHubById(hubId);
    if (!hub || !hub.apiKey || !hub.apiSecretEncrypted) return null;
    
    return new EcosystemClient({
      hubUrl: hub.hubUrl,
      apiKey: hub.apiKey,
      apiSecret: hub.apiSecretEncrypted,
    });
  }
  
  async testHubConnection(hubId: string): Promise<{ connected: boolean; permissions: string[] }> {
    const client = await this.getClientForHub(hubId);
    if (!client) return { connected: false, permissions: [] };
    
    const status = await client.checkConnection();
    
    // Update last sync status
    await db.update(ecosystemExternalHubs)
      .set({ 
        lastSyncAt: new Date(), 
        lastSyncStatus: status.connected ? 'connected' : 'failed',
        updatedAt: new Date(),
      })
      .where(eq(ecosystemExternalHubs.id, hubId));
    
    return status;
  }
  
  async removeExternalHub(hubId: string): Promise<boolean> {
    await db.delete(ecosystemExternalHubs).where(eq(ecosystemExternalHubs.id, hubId));
    return true;
  }
  
  async updateHubSettings(hubId: string, settings: {
    autoSync?: boolean;
    syncFrequency?: string;
    isActive?: boolean;
  }): Promise<EcosystemExternalHub | null> {
    const [hub] = await db.update(ecosystemExternalHubs)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(ecosystemExternalHubs.id, hubId))
      .returning();
    return hub || null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCES
// ═══════════════════════════════════════════════════════════════════════════════

export const ecosystemHub = new DarkWaveEcosystemHub();
export const externalHubManager = new ExternalHubManager();
