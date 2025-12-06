/**
 * All 50 States Tax Configuration (2025)
 * Includes state income tax rates, local tax info, and special rules
 */

export interface StateTaxConfig {
  code: string;
  name: string;
  hasIncomeTax: boolean;
  flatRate?: number; // For flat-rate states
  brackets?: { min: number; max: number; rate: number }[];
  standardDeduction?: { single: number; married: number };
  personalExemption?: number;
  hasLocalTax?: boolean;
  localTaxNotes?: string;
  supplementalRate?: number; // For bonus/commission
  reciprocityStates?: string[]; // States with tax reciprocity agreements
}

// All 50 States + DC Tax Rates (2025)
export const STATE_TAX_RATES: Record<string, StateTaxConfig> = {
  // No Income Tax States (9 states)
  AK: { code: 'AK', name: 'Alaska', hasIncomeTax: false },
  FL: { code: 'FL', name: 'Florida', hasIncomeTax: false },
  NV: { code: 'NV', name: 'Nevada', hasIncomeTax: false },
  NH: { code: 'NH', name: 'New Hampshire', hasIncomeTax: false }, // Only taxes interest/dividends
  SD: { code: 'SD', name: 'South Dakota', hasIncomeTax: false },
  TN: { code: 'TN', name: 'Tennessee', hasIncomeTax: false }, // No income tax as of 2021
  TX: { code: 'TX', name: 'Texas', hasIncomeTax: false },
  WA: { code: 'WA', name: 'Washington', hasIncomeTax: false },
  WY: { code: 'WY', name: 'Wyoming', hasIncomeTax: false },

  // Flat Rate States (11 states)
  AZ: { code: 'AZ', name: 'Arizona', hasIncomeTax: true, flatRate: 0.025 },
  CO: { code: 'CO', name: 'Colorado', hasIncomeTax: true, flatRate: 0.044 },
  ID: { code: 'ID', name: 'Idaho', hasIncomeTax: true, flatRate: 0.058 },
  IL: { code: 'IL', name: 'Illinois', hasIncomeTax: true, flatRate: 0.0495, hasLocalTax: true },
  IN: { code: 'IN', name: 'Indiana', hasIncomeTax: true, flatRate: 0.0305, hasLocalTax: true },
  KY: { code: 'KY', name: 'Kentucky', hasIncomeTax: true, flatRate: 0.04, hasLocalTax: true, localTaxNotes: 'Local occupational tax varies 1.5-2.2%' },
  MA: { code: 'MA', name: 'Massachusetts', hasIncomeTax: true, flatRate: 0.05 },
  MI: { code: 'MI', name: 'Michigan', hasIncomeTax: true, flatRate: 0.0425, hasLocalTax: true },
  NC: { code: 'NC', name: 'North Carolina', hasIncomeTax: true, flatRate: 0.0475 },
  PA: { code: 'PA', name: 'Pennsylvania', hasIncomeTax: true, flatRate: 0.0307, hasLocalTax: true },
  UT: { code: 'UT', name: 'Utah', hasIncomeTax: true, flatRate: 0.0465 },

  // Graduated Rate States (31 states + DC)
  AL: {
    code: 'AL', name: 'Alabama', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 500, rate: 0.02 },
      { min: 500, max: 3000, rate: 0.04 },
      { min: 3000, max: Infinity, rate: 0.05 },
    ],
    standardDeduction: { single: 2500, married: 7500 },
  },
  AR: {
    code: 'AR', name: 'Arkansas', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 4999, rate: 0.02 },
      { min: 4999, max: 9999, rate: 0.04 },
      { min: 9999, max: Infinity, rate: 0.044 },
    ],
  },
  CA: {
    code: 'CA', name: 'California', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 10099, rate: 0.01 },
      { min: 10099, max: 23942, rate: 0.02 },
      { min: 23942, max: 37788, rate: 0.04 },
      { min: 37788, max: 52455, rate: 0.06 },
      { min: 52455, max: 66295, rate: 0.08 },
      { min: 66295, max: 338639, rate: 0.093 },
      { min: 338639, max: 406364, rate: 0.103 },
      { min: 406364, max: 677275, rate: 0.113 },
      { min: 677275, max: Infinity, rate: 0.123 },
    ],
    standardDeduction: { single: 5202, married: 10404 },
  },
  CT: {
    code: 'CT', name: 'Connecticut', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 10000, rate: 0.03 },
      { min: 10000, max: 50000, rate: 0.05 },
      { min: 50000, max: 100000, rate: 0.055 },
      { min: 100000, max: 200000, rate: 0.06 },
      { min: 200000, max: 250000, rate: 0.065 },
      { min: 250000, max: 500000, rate: 0.069 },
      { min: 500000, max: Infinity, rate: 0.0699 },
    ],
  },
  DC: {
    code: 'DC', name: 'District of Columbia', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 10000, rate: 0.04 },
      { min: 10000, max: 40000, rate: 0.06 },
      { min: 40000, max: 60000, rate: 0.065 },
      { min: 60000, max: 250000, rate: 0.085 },
      { min: 250000, max: 500000, rate: 0.0925 },
      { min: 500000, max: 1000000, rate: 0.0975 },
      { min: 1000000, max: Infinity, rate: 0.1075 },
    ],
    standardDeduction: { single: 12950, married: 25900 },
  },
  DE: {
    code: 'DE', name: 'Delaware', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 2000, rate: 0.0 },
      { min: 2000, max: 5000, rate: 0.022 },
      { min: 5000, max: 10000, rate: 0.039 },
      { min: 10000, max: 20000, rate: 0.048 },
      { min: 20000, max: 25000, rate: 0.052 },
      { min: 25000, max: 60000, rate: 0.0555 },
      { min: 60000, max: Infinity, rate: 0.066 },
    ],
    standardDeduction: { single: 3250, married: 6500 },
  },
  GA: {
    code: 'GA', name: 'Georgia', hasIncomeTax: true,
    flatRate: 0.0549, // Georgia moved to flat rate in 2024
    standardDeduction: { single: 12000, married: 24000 },
  },
  HI: {
    code: 'HI', name: 'Hawaii', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 2400, rate: 0.014 },
      { min: 2400, max: 4800, rate: 0.032 },
      { min: 4800, max: 9600, rate: 0.055 },
      { min: 9600, max: 14400, rate: 0.064 },
      { min: 14400, max: 19200, rate: 0.068 },
      { min: 19200, max: 24000, rate: 0.072 },
      { min: 24000, max: 36000, rate: 0.076 },
      { min: 36000, max: 48000, rate: 0.079 },
      { min: 48000, max: 150000, rate: 0.0825 },
      { min: 150000, max: 175000, rate: 0.09 },
      { min: 175000, max: 200000, rate: 0.10 },
      { min: 200000, max: Infinity, rate: 0.11 },
    ],
    standardDeduction: { single: 2200, married: 4400 },
  },
  IA: {
    code: 'IA', name: 'Iowa', hasIncomeTax: true,
    flatRate: 0.038, // Iowa moving to flat rate, 3.8% for 2025
  },
  KS: {
    code: 'KS', name: 'Kansas', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 15000, rate: 0.031 },
      { min: 15000, max: 30000, rate: 0.0525 },
      { min: 30000, max: Infinity, rate: 0.057 },
    ],
    standardDeduction: { single: 3500, married: 8000 },
  },
  LA: {
    code: 'LA', name: 'Louisiana', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 12500, rate: 0.0185 },
      { min: 12500, max: 50000, rate: 0.035 },
      { min: 50000, max: Infinity, rate: 0.0425 },
    ],
  },
  ME: {
    code: 'ME', name: 'Maine', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 24500, rate: 0.058 },
      { min: 24500, max: 58050, rate: 0.0675 },
      { min: 58050, max: Infinity, rate: 0.0715 },
    ],
    standardDeduction: { single: 13850, married: 27700 },
  },
  MD: {
    code: 'MD', name: 'Maryland', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1000, max: 2000, rate: 0.03 },
      { min: 2000, max: 3000, rate: 0.04 },
      { min: 3000, max: 100000, rate: 0.0475 },
      { min: 100000, max: 125000, rate: 0.05 },
      { min: 125000, max: 150000, rate: 0.0525 },
      { min: 150000, max: 250000, rate: 0.055 },
      { min: 250000, max: Infinity, rate: 0.0575 },
    ],
    hasLocalTax: true,
    standardDeduction: { single: 2400, married: 4850 },
  },
  MN: {
    code: 'MN', name: 'Minnesota', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 30070, rate: 0.0535 },
      { min: 30070, max: 98760, rate: 0.068 },
      { min: 98760, max: 183340, rate: 0.0785 },
      { min: 183340, max: Infinity, rate: 0.0985 },
    ],
    standardDeduction: { single: 13825, married: 27650 },
  },
  MO: {
    code: 'MO', name: 'Missouri', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 1207, rate: 0.0 },
      { min: 1207, max: 2414, rate: 0.02 },
      { min: 2414, max: 3621, rate: 0.025 },
      { min: 3621, max: 4828, rate: 0.03 },
      { min: 4828, max: 6035, rate: 0.035 },
      { min: 6035, max: 7242, rate: 0.04 },
      { min: 7242, max: 8449, rate: 0.045 },
      { min: 8449, max: Infinity, rate: 0.0495 },
    ],
    standardDeduction: { single: 13850, married: 27700 },
    hasLocalTax: true,
  },
  MS: {
    code: 'MS', name: 'Mississippi', hasIncomeTax: true,
    flatRate: 0.05, // Mississippi moving to flat 4% by 2026
    standardDeduction: { single: 2300, married: 4600 },
  },
  MT: {
    code: 'MT', name: 'Montana', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 18700, rate: 0.046 },
      { min: 18700, max: Infinity, rate: 0.059 },
    ],
    standardDeduction: { single: 5540, married: 11080 },
  },
  NE: {
    code: 'NE', name: 'Nebraska', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 3700, rate: 0.0246 },
      { min: 3700, max: 22170, rate: 0.0351 },
      { min: 22170, max: 35730, rate: 0.0501 },
      { min: 35730, max: Infinity, rate: 0.0584 },
    ],
    standardDeduction: { single: 7900, married: 15800 },
  },
  NJ: {
    code: 'NJ', name: 'New Jersey', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20000, max: 35000, rate: 0.0175 },
      { min: 35000, max: 40000, rate: 0.035 },
      { min: 40000, max: 75000, rate: 0.05525 },
      { min: 75000, max: 500000, rate: 0.0637 },
      { min: 500000, max: 1000000, rate: 0.0897 },
      { min: 1000000, max: Infinity, rate: 0.1075 },
    ],
  },
  NM: {
    code: 'NM', name: 'New Mexico', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 5500, rate: 0.017 },
      { min: 5500, max: 11000, rate: 0.032 },
      { min: 11000, max: 16000, rate: 0.047 },
      { min: 16000, max: 210000, rate: 0.049 },
      { min: 210000, max: Infinity, rate: 0.059 },
    ],
    standardDeduction: { single: 13850, married: 27700 },
  },
  NY: {
    code: 'NY', name: 'New York', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 8500, rate: 0.04 },
      { min: 8500, max: 11700, rate: 0.045 },
      { min: 11700, max: 13900, rate: 0.0525 },
      { min: 13900, max: 80650, rate: 0.055 },
      { min: 80650, max: 215400, rate: 0.06 },
      { min: 215400, max: 1077550, rate: 0.0685 },
      { min: 1077550, max: 5000000, rate: 0.0965 },
      { min: 5000000, max: 25000000, rate: 0.103 },
      { min: 25000000, max: Infinity, rate: 0.109 },
    ],
    hasLocalTax: true,
    standardDeduction: { single: 8000, married: 16050 },
  },
  ND: {
    code: 'ND', name: 'North Dakota', hasIncomeTax: true,
    flatRate: 0.0195, // ND has very low flat rate
  },
  OH: {
    code: 'OH', name: 'Ohio', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 26050, rate: 0.0 },
      { min: 26050, max: 100000, rate: 0.02765 },
      { min: 100000, max: Infinity, rate: 0.0375 },
    ],
    hasLocalTax: true,
    localTaxNotes: 'Many cities have local income tax 1-3%',
  },
  OK: {
    code: 'OK', name: 'Oklahoma', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 1000, rate: 0.0025 },
      { min: 1000, max: 2500, rate: 0.0075 },
      { min: 2500, max: 3750, rate: 0.0175 },
      { min: 3750, max: 4900, rate: 0.0275 },
      { min: 4900, max: 7200, rate: 0.0375 },
      { min: 7200, max: Infinity, rate: 0.0475 },
    ],
    standardDeduction: { single: 6350, married: 12700 },
  },
  OR: {
    code: 'OR', name: 'Oregon', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 4050, rate: 0.0475 },
      { min: 4050, max: 10200, rate: 0.0675 },
      { min: 10200, max: 125000, rate: 0.0875 },
      { min: 125000, max: Infinity, rate: 0.099 },
    ],
    standardDeduction: { single: 2605, married: 5210 },
  },
  RI: {
    code: 'RI', name: 'Rhode Island', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 73450, rate: 0.0375 },
      { min: 73450, max: 166950, rate: 0.0475 },
      { min: 166950, max: Infinity, rate: 0.0599 },
    ],
    standardDeduction: { single: 10100, married: 20200 },
  },
  SC: {
    code: 'SC', name: 'South Carolina', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 3200, rate: 0.0 },
      { min: 3200, max: 16040, rate: 0.03 },
      { min: 16040, max: Infinity, rate: 0.064 },
    ],
    standardDeduction: { single: 13850, married: 27700 },
  },
  VT: {
    code: 'VT', name: 'Vermont', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 45400, rate: 0.0335 },
      { min: 45400, max: 110050, rate: 0.066 },
      { min: 110050, max: 229550, rate: 0.076 },
      { min: 229550, max: Infinity, rate: 0.0875 },
    ],
    standardDeduction: { single: 7000, married: 14650 },
  },
  VA: {
    code: 'VA', name: 'Virginia', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 3000, rate: 0.02 },
      { min: 3000, max: 5000, rate: 0.03 },
      { min: 5000, max: 17000, rate: 0.05 },
      { min: 17000, max: Infinity, rate: 0.0575 },
    ],
    standardDeduction: { single: 8500, married: 17000 },
  },
  WV: {
    code: 'WV', name: 'West Virginia', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 10000, rate: 0.0236 },
      { min: 10000, max: 25000, rate: 0.0315 },
      { min: 25000, max: 40000, rate: 0.0354 },
      { min: 40000, max: 60000, rate: 0.0472 },
      { min: 60000, max: Infinity, rate: 0.0512 },
    ],
  },
  WI: {
    code: 'WI', name: 'Wisconsin', hasIncomeTax: true,
    brackets: [
      { min: 0, max: 13810, rate: 0.035 },
      { min: 13810, max: 27630, rate: 0.044 },
      { min: 27630, max: 304170, rate: 0.053 },
      { min: 304170, max: Infinity, rate: 0.0765 },
    ],
    standardDeduction: { single: 12760, married: 23620 },
  },
};

/**
 * Calculate state income tax
 */
export function calculateStateTax(
  annualGross: number,
  stateCode: string,
  filingStatus: 'single' | 'married' = 'single'
): { tax: number; effectiveRate: number } {
  const config = STATE_TAX_RATES[stateCode.toUpperCase()];
  
  if (!config || !config.hasIncomeTax) {
    return { tax: 0, effectiveRate: 0 };
  }

  // Flat rate states
  if (config.flatRate !== undefined) {
    const tax = annualGross * config.flatRate;
    return { tax, effectiveRate: config.flatRate };
  }

  // Graduated rate states
  if (config.brackets) {
    // Apply standard deduction if available
    let taxableIncome = annualGross;
    if (config.standardDeduction) {
      const deduction = filingStatus === 'married' 
        ? config.standardDeduction.married 
        : config.standardDeduction.single;
      taxableIncome = Math.max(0, annualGross - deduction);
    }

    let tax = 0;
    for (const bracket of config.brackets) {
      if (taxableIncome > bracket.min) {
        const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
        tax += taxableInBracket * bracket.rate;
      }
    }

    const effectiveRate = annualGross > 0 ? tax / annualGross : 0;
    return { tax, effectiveRate };
  }

  return { tax: 0, effectiveRate: 0 };
}

/**
 * Get state tax configuration
 */
export function getStateTaxConfig(stateCode: string): StateTaxConfig | null {
  return STATE_TAX_RATES[stateCode.toUpperCase()] || null;
}

/**
 * Get all states (for dropdown)
 */
export function getAllStates(): { code: string; name: string; hasIncomeTax: boolean }[] {
  return Object.values(STATE_TAX_RATES).map(s => ({
    code: s.code,
    name: s.name,
    hasIncomeTax: s.hasIncomeTax,
  })).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Check if state has local income tax
 */
export function stateHasLocalTax(stateCode: string): boolean {
  const config = STATE_TAX_RATES[stateCode.toUpperCase()];
  return config?.hasLocalTax || false;
}
