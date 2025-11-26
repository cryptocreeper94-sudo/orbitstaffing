/**
 * Business Days Calculator
 * Utility functions for calculating business days (excluding weekends)
 */

/**
 * Add business days to a date (skips weekends)
 */
export function addBusinessDays(date: Date, days: number): Date {
  let result = new Date(date);
  let remainingDays = days;
  
  while (remainingDays > 0) {
    result.setDate(result.getDate() + 1);
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      remainingDays--;
    }
  }
  
  return result;
}

/**
 * Check if a deadline has passed
 */
export function isOverdue(deadline: Date): boolean {
  return new Date() > deadline;
}

/**
 * Get number of business days until a deadline
 */
export function getBusinessDaysUntil(deadline: Date): number {
  const now = new Date();
  let days = 0;
  let current = new Date(now);
  
  // If deadline is in the past, return negative
  if (deadline < now) {
    return -1;
  }
  
  while (current < deadline) {
    current.setDate(current.getDate() + 1);
    // Only count weekdays
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      days++;
    }
  }
  
  return days;
}

/**
 * Check if a deadline is approaching (within N business days)
 */
export function isApproaching(deadline: Date, warningDays: number = 1): boolean {
  const daysUntil = getBusinessDaysUntil(deadline);
  return daysUntil >= 0 && daysUntil <= warningDays;
}

/**
 * Format a date for display
 */
export function formatDeadline(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
