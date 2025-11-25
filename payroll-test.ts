// Test payroll calculations
import { calculatePayroll } from "./server/payrollCalculator";

// Tennessee example: Single, $2,000/week
const tenneseeTest = calculatePayroll({
  grossPay: 2000,
  w4Data: {
    id: "test-1",
    tenantId: "test",
    workerId: "emp-1",
    filingStatus: "single",
    dependents: 0,
    standardDeduction: true,
    additionalWithholding: 0,
    jobIncome: 2000 * 52, // $104,000 annual
    otherIncome: 0,
    deductions: 0,
    isCurrentW4: true,
    createdAt: new Date(),
  },
  garnishmentOrders: [
    {
      id: "garn-1",
      tenantId: "test",
      employeeId: "emp-1",
      type: "child_support",
      creditorName: "State Child Support",
      orderNumber: "CS-2025-001",
      caseNumber: "2025-CS-001",
      effectiveDate: new Date("2025-01-01"),
      expiryDate: new Date("2026-12-31"),
      amountFixed: null,
      amountPercentage: "50",
      priority: 1,
      paymentInstructions: "Monthly",
      remittanceAddress: "Child Support Department",
      status: "active",
      createdAt: new Date(),
    },
    {
      id: "garn-2",
      tenantId: "test",
      employeeId: "emp-1",
      type: "creditor",
      creditorName: "Capital One",
      orderNumber: "CR-2025-001",
      caseNumber: "2025-CR-001",
      effectiveDate: new Date("2025-01-01"),
      expiryDate: new Date("2026-12-31"),
      amountFixed: null,
      amountPercentage: "25",
      priority: 4,
      paymentInstructions: "Weekly",
      remittanceAddress: "Capital One Collections",
      status: "active",
      createdAt: new Date(),
    },
  ],
  payPeriodDays: 7,
  workState: "TN",
  workCity: "Nashville",
  annualGrossPaid: 0,
});

console.log("=== TENNESSEE EXAMPLE ===");
console.log("Gross Pay:", tenneseeTest.grossPay);
console.log("Federal Income Tax:", tenneseeTest.federalIncomeTax);
console.log("Social Security:", tenneseeTest.socialSecurityTax);
console.log("Medicare:", tenneseeTest.medicareTax);
console.log("State Tax:", tenneseeTest.stateTax);
console.log("Local Tax:", tenneseeTest.localTax);
console.log("Total Mandatory Deductions:", tenneseeTest.totalMandatoryDeductions);
console.log("Disposable Earnings:", tenneseeTest.disposableEarnings);
console.log("Garnishments Applied:", tenneseeTest.garnishmentsApplied);
console.log("Total Garnishments:", tenneseeTest.totalGarnishments);
console.log("Net Pay:", tenneseeTest.netPay);
console.log("\nExpected: Federal ~$155, SS $124, Medicare $29, TN Tax $0, Net after garnish ~$633");
console.log("\nFull Breakdown:", JSON.stringify(tenneseeTest.breakdown, null, 2));

// Kentucky example: Single, $2,000/week, Louisville
const kentuckyTest = calculatePayroll({
  grossPay: 2000,
  w4Data: {
    id: "test-2",
    tenantId: "test",
    workerId: "emp-2",
    filingStatus: "single",
    dependents: 0,
    standardDeduction: true,
    additionalWithholding: 0,
    jobIncome: 2000 * 52, // $104,000 annual
    otherIncome: 0,
    deductions: 0,
    isCurrentW4: true,
    createdAt: new Date(),
  },
  garnishmentOrders: [
    {
      id: "garn-3",
      tenantId: "test",
      employeeId: "emp-2",
      type: "tax_levy",
      creditorName: "IRS",
      orderNumber: "IRS-2025-001",
      caseNumber: "2025-IRS-001",
      effectiveDate: new Date("2025-01-01"),
      expiryDate: new Date("2026-12-31"),
      amountFixed: "400",
      amountPercentage: null,
      priority: 2,
      paymentInstructions: "Weekly",
      remittanceAddress: "IRS Collections",
      status: "active",
      createdAt: new Date(),
    },
    {
      id: "garn-4",
      tenantId: "test",
      employeeId: "emp-2",
      type: "child_support",
      creditorName: "State Child Support",
      orderNumber: "CS-2025-002",
      caseNumber: "2025-CS-002",
      effectiveDate: new Date("2025-01-01"),
      expiryDate: new Date("2026-12-31"),
      amountFixed: null,
      amountPercentage: "50",
      priority: 1,
      paymentInstructions: "Weekly",
      remittanceAddress: "KY Child Support",
      status: "active",
      createdAt: new Date(),
    },
    {
      id: "garn-5",
      tenantId: "test",
      employeeId: "emp-2",
      type: "creditor",
      creditorName: "General Creditor",
      orderNumber: "CR-2025-002",
      caseNumber: "2025-CR-002",
      effectiveDate: new Date("2025-01-01"),
      expiryDate: new Date("2026-12-31"),
      amountFixed: null,
      amountPercentage: "25",
      priority: 4,
      paymentInstructions: "Weekly",
      remittanceAddress: "Creditor Collections",
      status: "active",
      createdAt: new Date(),
    },
  ],
  payPeriodDays: 7,
  workState: "KY",
  workCity: "Louisville",
  annualGrossPaid: 0,
});

console.log("\n\n=== KENTUCKY EXAMPLE (Louisville) ===");
console.log("Gross Pay:", kentuckyTest.grossPay);
console.log("Federal Income Tax:", kentuckyTest.federalIncomeTax);
console.log("Social Security:", kentuckyTest.socialSecurityTax);
console.log("Medicare:", kentuckyTest.medicareTax);
console.log("State Tax:", kentuckyTest.stateTax);
console.log("Local Tax:", kentuckyTest.localTax);
console.log("Total Mandatory Deductions:", kentuckyTest.totalMandatoryDeductions);
console.log("Disposable Earnings:", kentuckyTest.disposableEarnings);
console.log("Garnishments Applied:", kentuckyTest.garnishmentsApplied);
console.log("Total Garnishments:", kentuckyTest.totalGarnishments);
console.log("Net Pay:", kentuckyTest.netPay);
console.log("\nExpected: Federal ~$155, SS $124, Medicare $29, KY Tax ~$70, Louisville Tax ~$44, Net ~$144");
console.log("\nFull Breakdown:", JSON.stringify(kentuckyTest.breakdown, null, 2));
