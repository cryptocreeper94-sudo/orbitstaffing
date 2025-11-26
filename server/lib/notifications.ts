/**
 * Notification Templates and Sender Functions
 * Handles onboarding deadline notifications via SMS
 */

import { sendSMS, sendSMSFromTemplate } from '../twilioService';
import { formatDeadline } from './businessDays';

// ========================
// Notification Templates
// ========================

/**
 * Worker notification - 1 day before deadline warning
 */
export function getOnboardingDeadlineWarning(workerName: string, deadline: Date): string {
  return `⚠️ ONBOARDING DEADLINE REMINDER

Hi ${workerName}, you have 1 business day remaining to complete onboarding for your assignment.

Complete by: ${formatDeadline(deadline)}

Failure to complete on time will result in automatic reassignment.

Log in to complete your onboarding now.`;
}

/**
 * Worker notification - deadline day reminder
 */
export function getOnboardingDeadlineDayOf(workerName: string, deadline: Date): string {
  return `🚨 URGENT: ONBOARDING DUE TODAY

Hi ${workerName}, your onboarding is due TODAY by ${formatDeadline(deadline)}.

This is your final reminder. Complete onboarding immediately to secure your assignment.

Failure to complete will result in automatic reassignment to another worker.`;
}

/**
 * Customer notification - worker timed out, auto-reassignment
 */
export function getOnboardingTimeoutCustomer(workerName: string, requestNumber: string): string {
  return `ORBIT Staffing Update - Request #${requestNumber}

Worker ${workerName} did not complete required onboarding within the deadline.

✅ We've automatically assigned the next best match from your worker request.

No action needed - the replacement worker has been notified and their onboarding is being tracked automatically.

You'll receive confirmation once the new worker completes onboarding.`;
}

/**
 * Worker notification - new assignment after reassignment
 */
export function getNewAssignmentNotification(
  workerName: string,
  jobTitle: string,
  clientName: string,
  deadline: Date
): string {
  return `🎉 NEW ASSIGNMENT AVAILABLE

Hi ${workerName}, you've been assigned to: ${jobTitle} for ${clientName}

⏰ Complete onboarding by: ${formatDeadline(deadline)}

Log in now to review assignment details and complete onboarding requirements.

Quick action required to secure this opportunity!`;
}

/**
 * Customer notification - no more matches available
 */
export function getNoMatchesAvailable(requestNumber: string): string {
  return `ORBIT Staffing Alert - Request #${requestNumber}

No additional qualified matches are currently available for your worker request.

Recommended actions:
1. Review and adjust job requirements if possible
2. Increase pay rate to attract more candidates
3. Extend deadline to allow more time for matching
4. Post a new request with updated criteria

Our team is monitoring for new qualified workers and will notify you immediately when matches become available.`;
}

/**
 * Admin notification - auto-reassignment occurred
 */
export function getAdminReassignmentAlert(
  workerName: string,
  requestNumber: string,
  newWorkerName: string
): string {
  return `[ADMIN ALERT] Auto-Reassignment

Request: ${requestNumber}
Original Worker: ${workerName} (timed out)
New Worker: ${newWorkerName}

Action: Automatically reassigned to next best match
Time: ${new Date().toLocaleString()}

System is monitoring new worker's onboarding progress.`;
}

// ========================
// Notification Senders
// ========================

/**
 * Send deadline warning to worker (1 day before)
 */
export async function sendDeadlineWarning(
  workerPhone: string,
  workerName: string,
  deadline: Date
): Promise<boolean> {
  try {
    const message = getOnboardingDeadlineWarning(workerName, deadline);
    const result = await sendSMS(workerPhone, message, 'onboarding_deadline_warning');
    
    if (result.success) {
      console.log(`[Notification] Deadline warning sent to ${workerName} (${workerPhone})`);
      return true;
    } else {
      console.error(`[Notification] Failed to send warning to ${workerName}:`, result.error);
      return false;
    }
  } catch (error) {
    console.error('[Notification] Error sending deadline warning:', error);
    return false;
  }
}

/**
 * Send day-of reminder to worker
 */
export async function sendDeadlineDayOfReminder(
  workerPhone: string,
  workerName: string,
  deadline: Date
): Promise<boolean> {
  try {
    const message = getOnboardingDeadlineDayOf(workerName, deadline);
    const result = await sendSMS(workerPhone, message, 'onboarding_deadline_urgent');
    
    if (result.success) {
      console.log(`[Notification] Day-of reminder sent to ${workerName} (${workerPhone})`);
      return true;
    } else {
      console.error(`[Notification] Failed to send day-of reminder to ${workerName}:`, result.error);
      return false;
    }
  } catch (error) {
    console.error('[Notification] Error sending day-of reminder:', error);
    return false;
  }
}

/**
 * Send timeout notification to customer
 */
export async function sendCustomerTimeoutNotification(
  customerPhone: string,
  workerName: string,
  requestNumber: string
): Promise<boolean> {
  try {
    const message = getOnboardingTimeoutCustomer(workerName, requestNumber);
    const result = await sendSMS(customerPhone, message, 'customer_reassignment_notice');
    
    if (result.success) {
      console.log(`[Notification] Timeout notice sent to customer (${customerPhone})`);
      return true;
    } else {
      console.error(`[Notification] Failed to send customer notice:`, result.error);
      return false;
    }
  } catch (error) {
    console.error('[Notification] Error sending customer notification:', error);
    return false;
  }
}

/**
 * Send new assignment notification to worker
 */
export async function sendNewAssignment(
  workerPhone: string,
  workerName: string,
  jobTitle: string,
  clientName: string,
  deadline: Date
): Promise<boolean> {
  try {
    const message = getNewAssignmentNotification(workerName, jobTitle, clientName, deadline);
    const result = await sendSMS(workerPhone, message, 'assignment_notification');
    
    if (result.success) {
      console.log(`[Notification] New assignment sent to ${workerName} (${workerPhone})`);
      return true;
    } else {
      console.error(`[Notification] Failed to send new assignment to ${workerName}:`, result.error);
      return false;
    }
  } catch (error) {
    console.error('[Notification] Error sending new assignment:', error);
    return false;
  }
}

/**
 * Send no matches available notification to customer
 */
export async function sendNoMatchesNotification(
  customerPhone: string,
  requestNumber: string
): Promise<boolean> {
  try {
    const message = getNoMatchesAvailable(requestNumber);
    const result = await sendSMS(customerPhone, message, 'no_matches_alert');
    
    if (result.success) {
      console.log(`[Notification] No matches alert sent to customer (${customerPhone})`);
      return true;
    } else {
      console.error(`[Notification] Failed to send no matches alert:`, result.error);
      return false;
    }
  } catch (error) {
    console.error('[Notification] Error sending no matches notification:', error);
    return false;
  }
}

/**
 * Send admin reassignment alert
 */
export async function sendAdminReassignmentAlert(
  adminPhone: string,
  workerName: string,
  requestNumber: string,
  newWorkerName: string
): Promise<boolean> {
  try {
    const message = getAdminReassignmentAlert(workerName, requestNumber, newWorkerName);
    const result = await sendSMS(adminPhone, message, 'admin_alert');
    
    if (result.success) {
      console.log(`[Notification] Admin alert sent (${adminPhone})`);
      return true;
    } else {
      console.error(`[Notification] Failed to send admin alert:`, result.error);
      return false;
    }
  } catch (error) {
    console.error('[Notification] Error sending admin alert:', error);
    return false;
  }
}
