/**
 * Background Jobs - Onboarding Deadline Enforcement
 * Automatically enforces onboarding deadlines and handles worker reassignment
 * 
 * Deadlines:
 * - 3 business days after application submission
 * - 1 business day after job assignment
 * 
 * Runs every hour to check deadlines and process reassignments
 */

import { storage } from './storage';
import { db } from './db';
import { clients } from '@shared/schema';
import { eq } from 'drizzle-orm';
import {
  sendDeadlineWarning,
  sendDeadlineDayOfReminder,
  sendCustomerTimeoutNotification,
  sendNewAssignment,
  sendNoMatchesNotification,
} from './lib/notifications';
import { isApproaching, getBusinessDaysUntil, addBusinessDays } from './lib/businessDays';

let jobInterval: NodeJS.Timeout | null = null;

// Track last notification sent to prevent spam
const lastNotificationSent = new Map<string, Date>();

/**
 * Main deadline checker - runs every hour
 */
async function checkOnboardingDeadlines() {
  try {
    console.log('[Background Job] ⏰ Checking onboarding deadlines...');
    
    // Get all active tenants
    const tenants = await storage.getAllActiveTenants();
    
    if (tenants.length === 0) {
      console.log('[Background Job] ℹ️ No active tenants found');
      return;
    }
    
    console.log(`[Background Job] 📋 Checking deadlines for ${tenants.length} tenant(s)`);
    
    // Process each tenant separately
    for (const tenant of tenants) {
      try {
        console.log(`[Background Job] Processing tenant: ${tenant.name} (${tenant.id})`);
        
        // Send warnings for approaching deadlines
        await sendDeadlineWarnings(tenant.id);
        
        // Process overdue applications
        await processOverdueApplications(tenant.id);
        
        // Process overdue assignments
        await processOverdueAssignments(tenant.id);
        
      } catch (error) {
        console.error(`[Background Job] ❌ Error processing tenant ${tenant.name}:`, error);
        // Continue with other tenants even if one fails
      }
    }
    
    console.log('[Background Job] ✅ Deadline check completed successfully');
  } catch (error) {
    console.error('[Background Job] ❌ Critical error in deadline check:', error);
  }
}

/**
 * Send deadline warnings to workers approaching their deadlines
 */
async function sendDeadlineWarnings(tenantId: string) {
  try {
    const approaching = await storage.getWorkersApproachingDeadline(tenantId, 1);
    
    // Application deadline warnings
    for (const worker of approaching.application || []) {
      if (!worker.phone || !worker.applicationDeadline) continue;
      
      const notificationKey = `app-warning-${worker.id}`;
      if (shouldSendNotification(notificationKey)) {
        await sendDeadlineWarning(
          worker.phone,
          worker.fullName || 'Worker',
          new Date(worker.applicationDeadline)
        );
        markNotificationSent(notificationKey);
      }
    }
    
    // Assignment deadline warnings
    for (const worker of approaching.assignment || []) {
      if (!worker.phone || !worker.assignmentOnboardingDeadline) continue;
      
      const notificationKey = `assign-warning-${worker.id}`;
      if (shouldSendNotification(notificationKey)) {
        await sendDeadlineWarning(
          worker.phone,
          worker.fullName || 'Worker',
          new Date(worker.assignmentOnboardingDeadline)
        );
        markNotificationSent(notificationKey);
      }
    }
    
    console.log(`[Background Job] Sent warnings to ${(approaching.application?.length || 0) + (approaching.assignment?.length || 0)} workers for tenant ${tenantId}`);
  } catch (error) {
    console.error(`[Background Job] Error sending warnings for tenant ${tenantId}:`, error);
  }
}

/**
 * Process workers with overdue application deadlines (3 business days)
 */
async function processOverdueApplications(tenantId: string) {
  try {
    const overdueWorkers = await storage.getWorkersWithOverdueApplications(tenantId);
    
    console.log(`[Background Job] Found ${overdueWorkers.length} workers with overdue applications for tenant ${tenantId}`);
    
    for (const worker of overdueWorkers) {
      console.log(`[Background Job] Processing overdue application for worker ${worker.id} (${worker.fullName})`);
      
      // Mark worker as timed out
      await storage.markWorkerOnboardingTimedOut(worker.id);
      
      // Get their pending assignments
      const assignments = await storage.getWorkerAssignments(worker.id, 'assigned');
      
      // Reassign each assignment
      for (const assignment of assignments) {
        await autoReassignWorkerRequest(assignment.requestId, worker.id, worker.fullName);
      }
      
      console.log(`[Background Job] ✓ Worker ${worker.id} marked as timed out, ${assignments.length} assignments reassigned`);
    }
  } catch (error) {
    console.error(`[Background Job] Error processing overdue applications for tenant ${tenantId}:`, error);
  }
}

/**
 * Process workers with overdue assignment deadlines (1 business day)
 */
async function processOverdueAssignments(tenantId: string) {
  try {
    const overdueAssignments = await storage.getWorkersWithOverdueAssignments(tenantId);
    
    console.log(`[Background Job] Found ${overdueAssignments.length} overdue assignments for tenant ${tenantId}`);
    
    for (const assignment of overdueAssignments) {
      console.log(`[Background Job] Processing overdue assignment: Request ${assignment.requestNumber}, Worker ${assignment.workerName}`);
      
      // Mark worker as timed out
      await storage.markWorkerOnboardingTimedOut(assignment.workerId);
      
      // Auto-reassign to next match
      await autoReassignWorkerRequest(
        assignment.requestId,
        assignment.workerId,
        assignment.workerName
      );
      
      console.log(`[Background Job] ✓ Assignment ${assignment.requestNumber} reassigned from worker ${assignment.workerId}`);
    }
  } catch (error) {
    console.error(`[Background Job] Error processing overdue assignments for tenant ${tenantId}:`, error);
  }
}

/**
 * Auto-reassign a worker request to the next best match
 */
async function autoReassignWorkerRequest(
  requestId: string,
  excludeWorkerId: string,
  workerName: string | null = null
): Promise<void> {
  try {
    console.log(`[Background Job] Auto-reassigning request ${requestId}, excluding worker ${excludeWorkerId}`);
    
    // Get the worker request
    const request = await storage.getWorkerRequest(requestId);
    if (!request) {
      console.error(`[Background Job] Request ${requestId} not found`);
      return;
    }
    
    // Get all matches for this request
    const matches = await storage.getWorkerRequestMatches(requestId);
    
    // Find next best match (excluding the timed-out worker)
    const nextMatch = matches.find(m => 
      m.workerId !== excludeWorkerId && 
      (m.matchStatus === 'suggested' || m.matchStatus === 'selected')
    );
    
    if (nextMatch) {
      console.log(`[Background Job] Found next match: Worker ${nextMatch.workerId} (score: ${nextMatch.matchScore})`);
      
      // Assign to next match
      await storage.assignWorkerToRequest(requestId, nextMatch.workerId);
      
      // Get the new worker's info
      const newWorker = await storage.getWorker(nextMatch.workerId);
      
      // Send notification to new worker
      if (newWorker && newWorker.phone) {
        const deadline = addBusinessDays(new Date(), 1);
        
        // Get client info for notification
        const client = await db.select()
          .from(clients)
          .where(eq(clients.id, request.clientId))
          .limit(1);
        
        await sendNewAssignment(
          newWorker.phone,
          newWorker.fullName || 'Worker',
          request.jobTitle || 'Position',
          client[0]?.name || 'Client',
          deadline
        );
      }
      
      // Mark old assignment as reassigned
      await storage.markAssignmentReassigned(requestId, excludeWorkerId);
      
      // Notify customer of reassignment
      const client = await db.select()
        .from(clients)
        .where(eq(clients.id, request.clientId))
        .limit(1);
      
      if (client[0] && client[0].contactPhone) {
        await sendCustomerTimeoutNotification(
          client[0].contactPhone,
          workerName || 'Worker',
          request.requestNumber || requestId
        );
      }
      
      console.log(`[Background Job] ✅ Successfully reassigned request ${requestId} to worker ${nextMatch.workerId}`);
    } else {
      // No more matches available
      console.log(`[Background Job] ⚠️ No additional matches available for request ${requestId}`);
      
      // Notify customer that no matches are available
      const client = await db.select()
        .from(clients)
        .where(eq(clients.id, request.clientId))
        .limit(1);
      
      if (client[0] && client[0].contactPhone) {
        await sendNoMatchesNotification(
          client[0].contactPhone,
          request.requestNumber || requestId
        );
      }
      
      // Mark old assignment as reassigned (no replacement)
      await storage.markAssignmentReassigned(requestId, excludeWorkerId);
    }
  } catch (error) {
    console.error('[Background Job] Error in auto-reassignment:', error);
  }
}

/**
 * Check if a notification should be sent (prevent spam)
 * Only send once per 24 hours per notification key
 */
function shouldSendNotification(key: string): boolean {
  const lastSent = lastNotificationSent.get(key);
  
  if (!lastSent) {
    return true;
  }
  
  const hoursSinceLastSent = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
  return hoursSinceLastSent >= 24;
}

/**
 * Mark that a notification was sent
 */
function markNotificationSent(key: string): void {
  lastNotificationSent.set(key, new Date());
}

/**
 * Start the background job scheduler
 */
export function startBackgroundJobs() {
  if (jobInterval) {
    console.log('[Background Job] Jobs already running');
    return;
  }
  
  // Run immediately on startup
  console.log('[Background Job] 🚀 Starting onboarding enforcement system...');
  checkOnboardingDeadlines();
  
  // Run every hour (3600000 ms)
  jobInterval = setInterval(async () => {
    await checkOnboardingDeadlines();
  }, 60 * 60 * 1000);
  
  console.log('[Background Job] ✅ Onboarding enforcement started - checking every hour');
}

/**
 * Stop the background jobs (for graceful shutdown)
 */
export function stopBackgroundJobs() {
  if (jobInterval) {
    clearInterval(jobInterval);
    jobInterval = null;
    console.log('[Background Job] ⏹️ Onboarding enforcement stopped');
  }
}

/**
 * Get background job status (for admin dashboard)
 */
export function getBackgroundJobStatus(): {
  running: boolean;
  lastCheck: Date | null;
  nextCheck: Date | null;
} {
  return {
    running: jobInterval !== null,
    lastCheck: null, // Could track this if needed
    nextCheck: jobInterval ? new Date(Date.now() + 60 * 60 * 1000) : null,
  };
}

// Export for use in other modules
export { checkOnboardingDeadlines };
