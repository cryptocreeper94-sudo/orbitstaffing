import { Decimal } from "decimal.js";
import type { EmployeeW4Data, GarnishmentOrder } from "@shared/schema";

// 2025 Federal Income Tax Brackets
const TAX_BRACKETS_2025 = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
  married: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 },
  ],
  hoh: [
    { min: 0, max: 17450, rate: 0.10 },
    { min: 17450, max: 66550, rate: 0.12 },
    { min: 66550, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243700, rate: 0.32 },
    { min: 243700, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
};

// Standard deductions for 2025
const STANDARD_DEDUCTIONS_2025 = {
  single: 15000,
  married: 30000,
  hoh: 22500,
};

// Local occupational tax rates by Kentucky city (2025)
const KY_LOCAL_TAX_RATES: Record<string, number> = {
  louisville: 0.022,
  lexington: 0.0175,
  bowling_green: 0.015,
  owensboro: 0.015,
  covington: 0.018,
  paducah: 0.015,
  default: 0.015,
};

// FICA limits and rates
const SOCIAL_SECURITY_WAGE_BASE = 176100; // 2025
const SOCIAL_SECURITY_RATE = 0.062;
const MEDICARE_RATE = 0.0145;
const ADDITIONAL_MEDICARE_THRESHOLD_SINGLE = 200000;
const ADDITIONAL_MEDICARE_THRESHOLD_MARRIED = 250000;
const ADDITIONAL_MEDICARE_RATE = 0.009;

// CCPA (Consumer Credit Protection Act) limits
const CCPA_MIN_WEEKLY_DISPOSABLE = 217.5; // $217.50/week
const CCPA_MAX_GARNISHMENT_PERCENTAGE = 0.25; // 25% of disposable
const CCPA_CHILD_SUPPORT_MAX_PERCENTAGE = 0.65; // Up to 65% for child support

export interface PayrollCalculationInput {
  grossPay: number;
  w4Data: EmployeeW4Data;
  garnishmentOrders: GarnishmentOrder[];
  payPeriodDays: number; // For annualization
  workState: string; // TN, KY
  workCity?: string; // For local tax
  annualGrossPaid?: number; // Year-to-date gross for FICA limits
}

export interface PayrollCalculationResult {
  grossPay: number;
  federalIncomeTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  additionalMedicareTax: number;
  stateTax: number;
  localTax: number;
  totalMandatoryDeductions: number;
  disposableEarnings: number;
  garnishmentsApplied: GarnishmentDeduction[];
  totalGarnishments: number;
  netPay: number;
  breakdown: PayrollBreakdown;
}

export interface GarnishmentDeduction {
  id: string;
  type: string;
  amount: number;
  percentage?: number;
  priority: number;
}

export interface PayrollBreakdown {
  grossPay: number;
  federalWithholding: {
    grossIncome: number;
    standardDeduction: number;
    taxableIncome: number;
    tax: number;
    rate: string;
  };
  ficaTaxes: {
    socialSecurityTax: number;
    socialSecurityWageBase: number;
    medicareTax: number;
    additionalMedicareTax: number;
  };
  stateTax: {
    rate: string;
    amount: number;
  };
  localTax: {
    rate: string;
    city: string;
    amount: number;
  };
  disposableEarnings: number;
  garnishments: {
    order: GarnishmentDeduction[];
    totalAmount: number;
    ccpaCompliant: boolean;
  };
  netPay: number;
}

/**
 * Calculate federal income tax using 2025 tax brackets
 */
function calculateFederalIncomeTax(
  grossPay: number,
  w4Data: EmployeeW4Data
): { tax: number; breakdown: any } {
  const filingStatus = w4Data.fillingStatus as keyof typeof TAX_BRACKETS_2025;
  const brackets = TAX_BRACKETS_2025[filingStatus] || TAX_BRACKETS_2025.single;
  const standardDeduction =
    STANDARD_DEDUCTIONS_2025[filingStatus] || STANDARD_DEDUCTIONS_2025.single;

  // Annualize the gross pay (assuming weekly for now)
  const annualizedGross = grossPay * 52;

  // Calculate taxable income
  let taxableIncome = annualizedGross - standardDeduction;
  if (taxableIncome < 0) taxableIncome = 0;

  // Calculate tax
  let tax = 0;
  for (const bracket of brackets) {
    if (taxableIncome > bracket.min) {
      const taxableInThisBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      tax += taxableInThisBracket * bracket.rate;
    } else {
      break;
    }
  }

  // De-annualize (divide by 52 weeks)
  const weeklyTax = tax / 52;

  // Add extra withholding if specified in W-4
  const extraWithholding = parseFloat(w4Data.extraWithheldPerPaycheck?.toString() || "0");

  return {
    tax: weeklyTax + extraWithholding,
    breakdown: {
      grossIncome: annualizedGross,
      standardDeduction,
      taxableIncome,
      annualTax: tax,
      weeklyTax,
      extraWithholding,
    },
  };
}

/**
 * Calculate Social Security tax (6.2% up to $176,100 annual base)
 */
function calculateSocialSecurityTax(
  grossPay: number,
  yearToDateGross: number = 0
): number {
  const totalWithThisPay = yearToDateGross + grossPay;

  // If already over the wage base, no SS tax
  if (yearToDateGross >= SOCIAL_SECURITY_WAGE_BASE) {
    return 0;
  }

  // If total would exceed wage base, cap it
  if (totalWithThisPay > SOCIAL_SECURITY_WAGE_BASE) {
    const taxableAmount = SOCIAL_SECURITY_WAGE_BASE - yearToDateGross;
    return taxableAmount * SOCIAL_SECURITY_RATE;
  }

  // Otherwise, normal calculation
  return grossPay * SOCIAL_SECURITY_RATE;
}

/**
 * Calculate Medicare tax (1.45% + 0.9% additional on high earners)
 */
function calculateMedicareTax(
  grossPay: number,
  w4Data: EmployeeW4Data,
  yearToDateGross: number = 0
): { regular: number; additional: number } {
  const regularTax = grossPay * MEDICARE_RATE;

  // Additional Medicare tax (0.9%) on wages over threshold
  const filingStatus = w4Data.fillingStatus as keyof typeof ADDITIONAL_MEDICARE_THRESHOLD_SINGLE;
  const threshold =
    filingStatus === "married"
      ? ADDITIONAL_MEDICARE_THRESHOLD_MARRIED
      : ADDITIONAL_MEDICARE_THRESHOLD_SINGLE;

  const totalWithThisPay = yearToDateGross + grossPay;
  let additionalTax = 0;

  if (totalWithThisPay > threshold) {
    const taxableAmount =
      totalWithThisPay > threshold
        ? Math.min(grossPay, totalWithThisPay - threshold)
        : 0;
    additionalTax = Math.max(0, taxableAmount) * ADDITIONAL_MEDICARE_RATE;
  }

  return {
    regular: regularTax,
    additional: additionalTax,
  };
}

/**
 * Calculate state income tax
 */
function calculateStateTax(grossPay: number, workState: string): number {
  if (workState === "TN") {
    // Tennessee has no state income tax
    return 0;
  }

  if (workState === "KY") {
    // Kentucky: 4% of (annualized gross - $3,270 standard deduction) / 52 weeks
    const annualDeduction = 3270;
    const annualizedGross = grossPay * 52;
    const taxableIncome = Math.max(0, annualizedGross - annualDeduction);
    const annualTax = taxableIncome * 0.04;
    return annualTax / 52;
  }

  return 0;
}

/**
 * Calculate local occupational tax (Kentucky only)
 */
function calculateLocalTax(grossPay: number, workState: string, workCity?: string): number {
  if (workState !== "KY") {
    return 0;
  }

  const cityLower = (workCity || "default").toLowerCase();
  const rate = KY_LOCAL_TAX_RATES[cityLower] || KY_LOCAL_TAX_RATES.default;

  return grossPay * rate;
}

/**
 * Sort garnishment orders by priority (lower number = higher priority)
 */
function sortGarnishmentsByPriority(
  garnishments: GarnishmentOrder[]
): GarnishmentOrder[] {
  return [...garnishments].sort((a, b) => a.priority - b.priority);
}

/**
 * Calculate garnishment amounts respecting CCPA limits and priority
 */
function calculateGarnishments(
  disposableEarnings: number,
  garnishmentOrders: GarnishmentOrder[]
): GarnishmentDeduction[] {
  const garnishments: GarnishmentDeduction[] = [];
  const sorted = sortGarnishmentsByPriority(garnishmentOrders);

  let remainingDisposable = disposableEarnings;
  let totalGarnished = 0;

  for (const order of sorted) {
    if (remainingDisposable <= 0) break;

    let garnishAmount = 0;

    // Calculate amount based on fixed or percentage
    if (order.amountFixed) {
      garnishAmount = Math.min(
        parseFloat(order.amountFixed.toString()),
        remainingDisposable
      );
    } else if (order.amountPercentage) {
      const percentage = parseFloat(order.amountPercentage.toString()) / 100;
      garnishAmount = disposableEarnings * percentage;
    }

    // Apply CCPA limits
    if (order.type === "child_support") {
      // Child support: up to 65% of disposable (or 50% if support obligation for current family)
      const maxChildSupport = disposableEarnings * CCPA_CHILD_SUPPORT_MAX_PERCENTAGE;
      garnishAmount = Math.min(garnishAmount, maxChildSupport);
    } else {
      // Other garnishments: max 25% of disposable or amount over $217.50/week
      const ccpaMaxAmount = disposableEarnings * CCPA_MAX_GARNISHMENT_PERCENTAGE;
      const ccpaMinThreshold = CCPA_MIN_WEEKLY_DISPOSABLE;

      if (disposableEarnings > ccpaMinThreshold) {
        const amountAboveThreshold = disposableEarnings - ccpaMinThreshold;
        garnishAmount = Math.min(garnishAmount, ccpaMaxAmount);
      } else {
        // Below threshold - no garnishment allowed (except child support)
        if (order.type !== "child_support") {
          garnishAmount = 0;
        }
      }
    }

    if (garnishAmount > 0) {
      garnishments.push({
        id: order.id,
        type: order.type,
        amount: garnishAmount,
        percentage: order.amountPercentage
          ? parseFloat(order.amountPercentage.toString())
          : undefined,
        priority: order.priority,
      });

      remainingDisposable -= garnishAmount;
      totalGarnished += garnishAmount;
    }
  }

  return garnishments;
}

/**
 * Main payroll calculation function
 */
export function calculatePayroll(input: PayrollCalculationInput): PayrollCalculationResult {
  const {
    grossPay,
    w4Data,
    garnishmentOrders,
    payPeriodDays = 7,
    workState,
    workCity,
    annualGrossPaid = 0,
  } = input;

  // Calculate mandatory withholdings
  const federalTaxResult = calculateFederalIncomeTax(grossPay, w4Data);
  const federalIncomeTax = federalTaxResult.tax;

  const ssTax = calculateSocialSecurityTax(grossPay, annualGrossPaid);

  const medicareTaxResult = calculateMedicareTax(grossPay, w4Data, annualGrossPaid);
  const medicareTax = medicareTaxResult.regular;
  const additionalMedicareTax = medicareTaxResult.additional;

  const stateTax = calculateStateTax(grossPay, workState);
  const localTax = calculateLocalTax(grossPay, workState, workCity);

  // Total mandatory deductions
  const totalMandatoryDeductions =
    federalIncomeTax +
    ssTax +
    medicareTax +
    additionalMedicareTax +
    stateTax +
    localTax;

  // Disposable earnings (for garnishment calculation)
  const disposableEarnings = Math.max(0, grossPay - totalMandatoryDeductions);

  // Calculate garnishments
  const garnishmentsApplied = calculateGarnishments(
    disposableEarnings,
    garnishmentOrders
  );

  const totalGarnishments = garnishmentsApplied.reduce(
    (sum, g) => sum + g.amount,
    0
  );

  // Final net pay
  const netPay = Math.max(0, grossPay - totalMandatoryDeductions - totalGarnishments);

  // Build breakdown
  const breakdown: PayrollBreakdown = {
    grossPay,
    federalWithholding: {
      grossIncome: federalTaxResult.breakdown.grossIncome,
      standardDeduction: federalTaxResult.breakdown.standardDeduction,
      taxableIncome: federalTaxResult.breakdown.taxableIncome,
      tax: federalIncomeTax,
      rate: `${((federalIncomeTax / grossPay) * 100).toFixed(2)}%`,
    },
    ficaTaxes: {
      socialSecurityTax: ssTax,
      socialSecurityWageBase: SOCIAL_SECURITY_WAGE_BASE,
      medicareTax,
      additionalMedicareTax,
    },
    stateTax: {
      rate: workState === "KY" ? "4%" : "0%",
      amount: stateTax,
    },
    localTax: {
      rate: workCity ? `${(KY_LOCAL_TAX_RATES[workCity.toLowerCase()] || 0) * 100}%` : "0%",
      city: workCity || "N/A",
      amount: localTax,
    },
    disposableEarnings,
    garnishments: {
      order: garnishmentsApplied,
      totalAmount: totalGarnishments,
      ccpaCompliant: validateCCPACompliance(
        disposableEarnings,
        garnishmentsApplied
      ),
    },
    netPay,
  };

  return {
    grossPay,
    federalIncomeTax,
    socialSecurityTax: ssTax,
    medicareTax,
    additionalMedicareTax,
    stateTax,
    localTax,
    totalMandatoryDeductions,
    disposableEarnings,
    garnishmentsApplied,
    totalGarnishments,
    netPay,
    breakdown,
  };
}

/**
 * Validate CCPA compliance
 */
function validateCCPACompliance(
  disposableEarnings: number,
  garnishments: GarnishmentDeduction[]
): boolean {
  const totalGarnished = garnishments.reduce((sum, g) => sum + g.amount, 0);

  // Check total garnishment percentage
  if (disposableEarnings > 0) {
    const garnishmentPercentage = totalGarnished / disposableEarnings;

    // Standard garnishment max is 25%
    let maxPercentage = CCPA_MAX_GARNISHMENT_PERCENTAGE;

    // If there's child support, it can go to 65%
    const hasChildSupport = garnishments.some((g) => g.type === "child_support");
    if (hasChildSupport) {
      maxPercentage = CCPA_CHILD_SUPPORT_MAX_PERCENTAGE;
    }

    if (garnishmentPercentage > maxPercentage) {
      return false;
    }
  }

  return true;
}
