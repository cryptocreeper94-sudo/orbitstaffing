import { describe, it, expect } from 'vitest';
import { calculatePayroll } from '../payrollCalculator';
import type { EmployeeW4Data, GarnishmentOrder } from '@shared/schema';

describe('Payroll Calculator Engine', () => {
  it('calculates correct mandatory deductions for a single filer with no state tax', () => {
    const w4Data: EmployeeW4Data = {
      id: 'w4-1',
      workerId: 'w-1',
      tenantId: 't-1',
      companyId: 't-1',
      fillingStatus: 'single',
      multipleJobs: false,
      claimDependentsAmount: '0',
      otherIncomeAmount: '0',
      deductionsAmount: '0',
      extraWithheldPerPaycheck: '0',
      isCurrentW4: true,
      signatureData: {},
      signedAt: new Date(),
    };

    // $1000/week gross pay
    const result = calculatePayroll({
      grossPay: 1000,
      w4Data,
      garnishmentOrders: [],
      payPeriodDays: 7,
      workState: 'TX', // No state income tax
      annualGrossPaid: 0,
    });

    expect(result.grossPay).toBe(1000);
    expect(result.socialSecurityTax).toBeCloseTo(62.00, 1); // 6.2% of 1000
    expect(result.medicareTax).toBeCloseTo(14.50, 1); // 1.45% of 1000
    expect(result.stateTax).toBe(0); // TX = 0% state tax
    expect(result.totalGarnishments).toBe(0);
    expect(result.netPay).toBeGreaterThan(0);
    expect(result.netPay).toBeLessThan(1000);
  });

  it('calculates CCPA compliant garnishments correctly', () => {
    const w4Data: EmployeeW4Data = {
      id: 'w4-2',
      workerId: 'w-2',
      tenantId: 't-1',
      fillingStatus: 'single',
      isCurrentW4: true,
    } as EmployeeW4Data;

    const garnishments: GarnishmentOrder[] = [
      {
        id: 'g-1',
        employeeId: 'w-2',
        tenantId: 't-1',
        type: 'creditor',
        amountFixed: '500', // Asking for $500/week (very high)
        priority: 1,
        status: 'active',
      } as GarnishmentOrder
    ];

    // Low wage earner ($400/week)
    const result = calculatePayroll({
      grossPay: 400,
      w4Data,
      garnishmentOrders: garnishments,
      payPeriodDays: 7,
      workState: 'TX',
      annualGrossPaid: 0,
    });

    // CCPA limits garnishment to 25% of disposable earnings OR amount over $217.50, whichever is less.
    // Disposable earnings: $400 - (~$30.60 FICA) - (Federal Tax) -> ~ $350
    const disposable = result.disposableEarnings;
    const maxGarnished = Math.min(disposable * 0.25, Math.max(0, disposable - 217.5));
    
    expect(result.totalGarnishments).toBeCloseTo(maxGarnished, 1);
    expect(result.totalGarnishments).toBeLessThan(500); // Should be severely capped by CCPA
    expect(result.breakdown.garnishments.ccpaCompliant).toBe(true);
  });
});
