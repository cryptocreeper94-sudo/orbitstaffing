/**
 * Rate Calculation Utilities for ORBIT Staffing OS
 * Handles CSA markup calculations and payment term discounts
 */

export interface CSARateBreakdown {
  workerRate: number;
  markupAmount: number;
  markupPercentage: string;
  totalRate: number;
  CSA_MARKUP: number;
}

/**
 * Calculate CSA rates with 1.45x markup
 * @param workerRate - Base hourly rate paid to worker
 * @returns Detailed rate breakdown including markup
 */
export function calculateCSARates(workerRate: number): CSARateBreakdown {
  const CSA_MARKUP = 1.45;
  const totalRate = workerRate * CSA_MARKUP;
  const markupAmount = totalRate - workerRate;
  const markupPercentage = ((markupAmount / workerRate) * 100).toFixed(0);
  
  return {
    workerRate,
    markupAmount,
    markupPercentage,
    totalRate,
    CSA_MARKUP
  };
}

/**
 * Apply payment terms discount to total amount
 * @param amount - Total invoice amount
 * @param terms - Payment terms (net7, net15, or net30)
 * @returns Discounted amount (2% off for Net 7, no discount otherwise)
 */
export function applyPaymentTermsDiscount(
  amount: number, 
  terms: 'net7' | 'net15' | 'net30'
): number {
  if (terms === 'net7') {
    return amount * 0.98; // 2% discount for Net 7
  }
  return amount;
}

/**
 * Calculate estimated total cost for worker request
 * @param workersNeeded - Number of workers requested
 * @param totalRate - Billing rate per hour (includes markup)
 * @param hoursPerWeek - Expected hours per week
 * @param durationWeeks - Duration in weeks
 * @param paymentTerms - Payment terms for discount calculation
 * @returns Estimated total cost
 */
export function calculateEstimatedCost(
  workersNeeded: number,
  totalRate: number,
  hoursPerWeek: number,
  durationWeeks: number,
  paymentTerms: 'net7' | 'net15' | 'net30' = 'net30'
): number {
  const subtotal = workersNeeded * totalRate * hoursPerWeek * durationWeeks;
  return applyPaymentTermsDiscount(subtotal, paymentTerms);
}

/**
 * Format currency for display
 * @param amount - Dollar amount
 * @returns Formatted string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get payment terms label for display
 * @param terms - Payment terms code
 * @returns Human-readable label
 */
export function getPaymentTermsLabel(terms: 'net7' | 'net15' | 'net30'): string {
  const labels = {
    net7: 'Net 7 - Payment due within 7 days (2% discount)',
    net15: 'Net 15 - Payment due within 15 days (standard)',
    net30: 'Net 30 - Payment due within 30 days',
  };
  return labels[terms];
}
