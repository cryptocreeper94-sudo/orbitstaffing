import { syncEngine } from "./syncEngine";
import { storage } from "./storage";

// ========================
// AUTOMATIC SYNC SCHEDULER
// ========================

// Track which syncs are currently running to prevent overlaps
const runningSyncs = new Set<string>();

export class SyncScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Start automatic sync scheduler (runs every 6 hours)
  start() {
    if (this.isRunning) {
      console.log("⏰ Sync scheduler already running");
      return;
    }

    console.log("⏰ Starting automatic sync scheduler (every 6 hours)");
    this.isRunning = true;

    // Run initial sync after 1 minute
    setTimeout(() => this.runScheduledSyncs(), 60 * 1000);

    // Then run every 6 hours
    this.intervalId = setInterval(
      () => this.runScheduledSyncs(),
      6 * 60 * 60 * 1000
    );
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log("⏰ Sync scheduler stopped");
    }
  }

  private async runScheduledSyncs() {
    console.log("⏰ Running scheduled syncs...");

    try {
      // Get all tenants (simplified - in production, query distinct tenants from integration_tokens)
      const tokens = await this.getAllIntegrationTokens();

      for (const token of tokens) {
        const syncKey = `${token.tenantId}-${token.integrationType}`;

        // Skip if already running
        if (runningSyncs.has(syncKey)) {
          console.log(`⏭️  Skipping ${syncKey} - already running`);
          continue;
        }

        // Mark as running
        runningSyncs.add(syncKey);

        // Run sync in background (don't await - fire and forget)
        this.runSyncInBackground(token.tenantId, token.integrationType, syncKey);
      }
    } catch (error) {
      console.error("❌ Scheduled sync error:", error);
    }
  }

  private async runSyncInBackground(
    tenantId: string,
    integrationType: string,
    syncKey: string
  ) {
    try {
      console.log(`🔄 Auto-syncing ${integrationType} for tenant ${tenantId}`);
      await syncEngine.triggerSync(tenantId, integrationType);
      console.log(`✅ Auto-sync completed: ${syncKey}`);
    } catch (error) {
      console.error(`❌ Auto-sync failed: ${syncKey}:`, error);
    } finally {
      // Remove from running set
      runningSyncs.delete(syncKey);
    }
  }

  private async getAllIntegrationTokens() {
    // In production, this should query the database for all active integration tokens
    // For now, return empty array - will be populated when users connect integrations
    try {
      // This is a simplified query - in production you'd want to:
      // 1. Only get tokens that need syncing (based on lastSyncedAt + interval)
      // 2. Filter by connectionStatus === 'connected'
      // 3. Handle expired tokens
      return [];
    } catch (error) {
      console.error("Failed to fetch integration tokens:", error);
      return [];
    }
  }

  // Manual trigger for testing
  async triggerManualSync(tenantId: string, integrationType: string) {
    const syncKey = `${tenantId}-${integrationType}`;
    
    if (runningSyncs.has(syncKey)) {
      return { status: "error", message: "Sync already in progress" };
    }

    runningSyncs.add(syncKey);
    try {
      const result = await syncEngine.triggerSync(tenantId, integrationType);
      return result;
    } finally {
      runningSyncs.delete(syncKey);
    }
  }
}

// Export singleton
export const syncScheduler = new SyncScheduler();

// Auto-start scheduler when module loads
if (process.env.NODE_ENV !== "test") {
  syncScheduler.start();
}
