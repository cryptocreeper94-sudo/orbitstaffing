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

// ========================
// PAYROLL AUTOMATION
// ========================

/**
 * Check if payroll should run for any tenants today
 */
async function checkPayrollSchedule() {
  try {
    console.log('[Payroll Job] 🕐 Checking if payroll should run...');
    
    // Get all active tenants
    const tenants = await storage.getAllActiveTenants();
    
    if (tenants.length === 0) {
      console.log('[Payroll Job] ℹ️ No active tenants found');
      return;
    }
    
    for (const tenant of tenants) {
      try {
        // Get tenant's payroll settings (default: weekly, runs Sunday)
        const settings = await storage.getTenantPayrollSettings(tenant.id) || {
          frequency: 'weekly',
          payDay: 0,
          autoRun: true,
        };
        
        if (!settings.autoRun) {
          console.log(`[Payroll Job] ℹ️ Auto-payroll disabled for tenant ${tenant.name}`);
          continue;
        }
        
        // Check if today is pay day
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        if (dayOfWeek === settings.payDay) {
          console.log(`[Payroll Job] 💰 Running automated payroll for tenant ${tenant.name}`);
          
          // Calculate pay period based on frequency
          const endDate = new Date();
          const startDate = new Date();
          
          if (settings.frequency === 'weekly') {
            startDate.setDate(startDate.getDate() - 7);
          } else if (settings.frequency === 'biweekly') {
            startDate.setDate(startDate.getDate() - 14);
          } else if (settings.frequency === 'monthly') {
            startDate.setMonth(startDate.getMonth() - 1);
          }
          
          // Get workers with approved timesheets
          const workersReady = await storage.getWorkersReadyForPayroll(
            tenant.id,
            startDate,
            endDate
          );
          
          console.log(`[Payroll Job] 📋 ${workersReady.length} workers ready for payroll`);
          
          // Process each worker
          for (const worker of workersReady) {
            try {
              await processWorkerPayroll(worker, startDate, endDate, tenant.id);
            } catch (error) {
              console.error(`[Payroll Job] ❌ Error processing payroll for worker ${worker.workerName}:`, error);
              // Continue with other workers
            }
          }
          
          console.log(`[Payroll Job] ✅ Automated payroll completed for ${tenant.name}`);
        } else {
          console.log(`[Payroll Job] ℹ️ Not pay day for tenant ${tenant.name} (today: ${dayOfWeek}, pay day: ${settings.payDay})`);
        }
      } catch (error) {
        console.error(`[Payroll Job] ❌ Error processing tenant ${tenant.name}:`, error);
      }
    }
  } catch (error) {
    console.error('[Payroll Job] ❌ Critical error in payroll check:', error);
  }
}

/**
 * Process payroll for a single worker
 */
async function processWorkerPayroll(
  workerData: any,
  startDate: Date,
  endDate: Date,
  tenantId: string
): Promise<void> {
  try {
    const workerId = workerData.workerId;
    const workerName = workerData.workerName || 'Worker';
    
    console.log(`[Payroll Job] Processing payroll for worker ${workerName} (${workerId})`);
    
    // Get worker details
    const worker = await storage.getWorker(workerId);
    if (!worker) {
      console.error(`[Payroll Job] Worker ${workerId} not found`);
      return;
    }
    
    // Get worker's time entries (from GPS clock-ins)
    const timeEntries = await storage.getWorkerTimeEntries(workerId, startDate, endDate);
    
    if (timeEntries.length === 0) {
      console.log(`[Payroll Job] ℹ️ No approved time entries for worker ${workerName}`);
      return;
    }
    
    // Calculate total hours from timesheets
    let regularHours = 0;
    let overtimeHours = 0;
    
    for (const entry of timeEntries) {
      const hours = parseFloat(entry.totalHours?.toString() || '0');
      
      if (regularHours + hours > 40) {
        // Overtime calculation
        const regularPart = Math.max(0, 40 - regularHours);
        const overtimePart = hours - regularPart;
        regularHours += regularPart;
        overtimeHours += overtimePart;
      } else {
        regularHours += hours;
      }
    }
    
    if (regularHours === 0 && overtimeHours === 0) {
      console.log(`[Payroll Job] ℹ️ No hours worked for worker ${workerName}`);
      return;
    }
    
    // Get hourly rate from worker record
    const hourlyRate = parseFloat(worker.hourlyWage?.toString() || '0');
    if (hourlyRate === 0) {
      console.error(`[Payroll Job] ❌ No hourly rate set for worker ${workerName}`);
      return;
    }
    
    // Calculate gross pay
    const grossPay = (regularHours * hourlyRate) + (overtimeHours * hourlyRate * 1.5);
    
    // Get worker W4 and garnishment data
    const w4Data = await storage.getWorkerW4Data(workerId);
    const garnishments = await storage.getWorkerGarnishments(workerId);
    
    // Calculate payroll using existing payrollCalculator.ts
    const { calculatePayroll } = await import('./payrollCalculator');
    
    const payrollInput = {
      grossPay,
      w4Data: w4Data || {
        id: 'temp',
        workerId,
        tenantId,
        fillingStatus: 'single',
        dependents: 0,
        additionalWithholding: '0',
        extraWithheldPerPaycheck: '0',
        isCurrentW4: true,
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      garnishmentOrders: garnishments || [],
      payPeriodDays: 7,
      workState: worker.state || 'TN',
      workCity: worker.city || undefined,
      annualGrossPaid: 0,
    };
    
    const payrollResult = calculatePayroll(payrollInput);
    
    // Generate hallmark asset number
    const assetNumber = `ORB${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Save payroll record
    await storage.createPayrollRecord({
      employeeId: workerId,
      tenantId,
      payPeriodStart: startDate,
      payPeriodEnd: endDate,
      regularHours: regularHours.toFixed(2),
      overtimeHours: overtimeHours.toFixed(2),
      grossPay: grossPay.toFixed(2),
      federalWithholding: payrollResult.federalIncomeTax.toFixed(2),
      stateWithholding: payrollResult.stateTax.toFixed(2),
      socialSecurityWithholding: payrollResult.socialSecurityTax.toFixed(2),
      medicareWithholding: payrollResult.medicareTax.toFixed(2),
      garnishments: payrollResult.totalGarnishments.toFixed(2),
      totalDeductions: payrollResult.totalMandatoryDeductions.toFixed(2),
      netPay: payrollResult.netPay.toFixed(2),
      payrollAssetNumber: assetNumber,
      processedAt: new Date(),
      status: 'processed',
    });
    
    // Send paystub notification to worker
    await sendPaystubNotification(worker, payrollResult, assetNumber);
    
    console.log(`[Payroll Job] ✅ Processed payroll for ${workerName}: $${payrollResult.netPay.toFixed(2)} net pay`);
  } catch (error) {
    console.error(`[Payroll Job] ❌ Error in processWorkerPayroll:`, error);
    throw error;
  }
}

/**
 * Send paystub notification to worker via SMS and in-app
 */
async function sendPaystubNotification(
  worker: any,
  payroll: any,
  assetNumber: string
): Promise<void> {
  try {
    const workerName = worker.fullName || 'Worker';
    
    const message = `💰 Payroll Processed!

Net Pay: $${payroll.netPay.toFixed(2)}
Gross: $${payroll.grossPay.toFixed(2)}
Deductions: $${payroll.totalMandatoryDeductions.toFixed(2)}

Paystub available in your ORBIT app.
Hallmark: ${assetNumber}`;
    
    // Send SMS if worker has phone
    if (worker.phone) {
      const { sendSMSFromTemplate } = await import('./twilioService');
      await sendSMSFromTemplate(worker.phone, 'payroll_alert', {
        workerName,
        amount: payroll.netPay.toFixed(2),
        date: new Date().toLocaleDateString(),
      });
      
      console.log(`[Payroll Job] 📱 Sent paystub SMS to ${workerName}`);
    }
    
    // Create in-app notification
    if (worker.userId) {
      await storage.createNotification({
        userId: worker.userId,
        type: 'payroll_processed',
        title: 'Payroll Processed',
        message,
        relatedId: assetNumber,
      });
      
      console.log(`[Payroll Job] 🔔 Created in-app notification for ${workerName}`);
    }
  } catch (error) {
    console.error('[Payroll Job] ❌ Error sending paystub notification:', error);
  }
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
  
  // Run onboarding checks every hour (3600000 ms)
  jobInterval = setInterval(async () => {
    await checkOnboardingDeadlines();
  }, 60 * 60 * 1000);
  
  console.log('[Background Job] ✅ Onboarding enforcement started - checking every hour');
  
  // Start payroll automation scheduler
  console.log('[Payroll Job] 🚀 Starting automated payroll scheduler...');
  
  // Run immediately on startup to check if payroll should run today
  checkPayrollSchedule();
  
  // Run payroll check daily at midnight (24 hours)
  // In production, you might want to run this at a specific time (e.g., 12:01 AM)
  setInterval(async () => {
    try {
      await checkPayrollSchedule();
      console.log('[Payroll Job] ⏰ Daily payroll check completed at', new Date().toISOString());
    } catch (error) {
      console.error('[Payroll Job] ❌ Error in daily payroll check:', error);
    }
  }, 24 * 60 * 60 * 1000); // Run daily
  
  console.log('[Payroll Job] ✅ Automated payroll scheduler started - checking daily');
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
