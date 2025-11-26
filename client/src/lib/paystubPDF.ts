import jsPDF from 'jspdf';
import { format } from 'date-fns';

export interface PaystubPDFData {
  id: string;
  employeeId: string;
  workerName: string;
  workerEmail?: string;
  payPeriodStart: Date | string;
  payPeriodEnd: Date | string;
  payDate: Date | string;
  
  // Hours
  regularHours: string | number;
  overtimeHours: string | number;
  totalHours: string | number;
  
  // Pay
  hourlyRate: string | number;
  regularPay: string | number;
  overtimePay: string | number;
  grossPay: string | number;
  
  // Deductions
  federalIncomeTax: string | number;
  socialSecurityTax: string | number;
  medicareTax: string | number;
  additionalMedicareTax?: string | number;
  stateTax: string | number;
  localTax?: string | number;
  totalMandatoryDeductions: string | number;
  
  // Garnishments
  totalGarnishments?: string | number;
  garnishmentsBreakdown?: any[];
  
  // Net
  netPay: string | number;
  
  // Metadata
  hallmarkAssetNumber?: string;
  workState?: string;
  workCity?: string;
  status?: string;
}

export function generatePaystubPDF(paystub: PaystubPDFData): jsPDF {
  const doc = new jsPDF();
  
  // Helper functions
  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num || 0);
  };

  const formatNumber = (value: string | number, decimals: number = 2) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return (num || 0).toFixed(decimals);
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'MM/dd/yyyy');
  };

  const totalDeductions = 
    parseFloat(paystub.totalMandatoryDeductions?.toString() || '0') +
    parseFloat(paystub.totalGarnishments?.toString() || '0');

  let yPos = 20;
  
  // ==============================
  // HEADER
  // ==============================
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ORBIT STAFFING OS', 105, yPos, { align: 'center' });
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Powered by ORBIT #${paystub.hallmarkAssetNumber || 'N/A'}`, 105, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `PAYSTUB - ${formatDate(paystub.payPeriodStart)} to ${formatDate(paystub.payPeriodEnd)}`,
    105,
    yPos,
    { align: 'center' }
  );
  
  yPos += 3;
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  
  // ==============================
  // EMPLOYEE INFORMATION
  // ==============================
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYEE INFORMATION', 20, yPos);
  yPos += 2;
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Name: ${paystub.workerName}`, 20, yPos);
  doc.text(`ID: ${paystub.employeeId.substring(0, 8)}`, 120, yPos);
  yPos += 6;
  doc.text(`Pay Period: ${formatDate(paystub.payPeriodStart)} - ${formatDate(paystub.payPeriodEnd)}`, 20, yPos);
  doc.text(`Pay Date: ${formatDate(paystub.payDate)}`, 120, yPos);
  yPos += 10;
  
  // ==============================
  // EARNINGS
  // ==============================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('EARNINGS', 20, yPos);
  yPos += 2;
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  // Table header
  doc.text('Description', 20, yPos);
  doc.text('Hours', 100, yPos, { align: 'right' });
  doc.text('Rate', 135, yPos, { align: 'right' });
  doc.text('Amount', 180, yPos, { align: 'right' });
  yPos += 5;
  doc.setLineWidth(0.1);
  doc.line(20, yPos, 190, yPos);
  yPos += 5;
  
  // Regular Pay
  doc.text('Regular Pay', 20, yPos);
  doc.text(formatNumber(paystub.regularHours), 100, yPos, { align: 'right' });
  doc.text(formatCurrency(paystub.hourlyRate), 135, yPos, { align: 'right' });
  doc.text(formatCurrency(paystub.regularPay), 180, yPos, { align: 'right' });
  yPos += 5;
  
  // Overtime Pay (if any)
  if (parseFloat(paystub.overtimeHours?.toString() || '0') > 0) {
    doc.text('Overtime Pay (1.5x)', 20, yPos);
    doc.text(formatNumber(paystub.overtimeHours), 100, yPos, { align: 'right' });
    doc.text(formatCurrency(parseFloat(paystub.hourlyRate?.toString() || '0') * 1.5), 135, yPos, { align: 'right' });
    doc.text(formatCurrency(paystub.overtimePay), 180, yPos, { align: 'right' });
    yPos += 5;
  }
  
  // Gross Pay Total
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Gross Pay', 20, yPos);
  doc.text(formatCurrency(paystub.grossPay), 180, yPos, { align: 'right' });
  yPos += 10;
  
  // ==============================
  // DEDUCTIONS
  // ==============================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DEDUCTIONS', 20, yPos);
  yPos += 2;
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  // Federal Income Tax
  doc.text('Federal Income Tax', 20, yPos);
  doc.text(`-${formatCurrency(paystub.federalIncomeTax)}`, 180, yPos, { align: 'right' });
  yPos += 5;
  
  // State Tax
  doc.text(`State Tax (${paystub.workState || 'N/A'})`, 20, yPos);
  doc.text(`-${formatCurrency(paystub.stateTax)}`, 180, yPos, { align: 'right' });
  yPos += 5;
  
  // Social Security
  doc.text('Social Security (6.2%)', 20, yPos);
  doc.text(`-${formatCurrency(paystub.socialSecurityTax)}`, 180, yPos, { align: 'right' });
  yPos += 5;
  
  // Medicare
  doc.text('Medicare (1.45%)', 20, yPos);
  doc.text(`-${formatCurrency(paystub.medicareTax)}`, 180, yPos, { align: 'right' });
  yPos += 5;
  
  // Additional Medicare (if any)
  if (parseFloat(paystub.additionalMedicareTax?.toString() || '0') > 0) {
    doc.text('Additional Medicare (0.9%)', 20, yPos);
    doc.text(`-${formatCurrency(paystub.additionalMedicareTax)}`, 180, yPos, { align: 'right' });
    yPos += 5;
  }
  
  // Local Tax (if any)
  if (parseFloat(paystub.localTax?.toString() || '0') > 0) {
    doc.text(`Local Tax (${paystub.workCity || 'N/A'})`, 20, yPos);
    doc.text(`-${formatCurrency(paystub.localTax)}`, 180, yPos, { align: 'right' });
    yPos += 5;
  }
  
  // Garnishments (if any)
  if (paystub.garnishmentsBreakdown && paystub.garnishmentsBreakdown.length > 0) {
    paystub.garnishmentsBreakdown.forEach((garnishment: any) => {
      doc.text(`Garnishment (${garnishment.type})`, 20, yPos);
      doc.text(`-${formatCurrency(garnishment.amount)}`, 180, yPos, { align: 'right' });
      yPos += 5;
    });
  }
  
  // Total Deductions
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 190, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Total Deductions', 20, yPos);
  doc.text(`-${formatCurrency(totalDeductions)}`, 180, yPos, { align: 'right' });
  yPos += 10;
  
  // ==============================
  // NET PAY
  // ==============================
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPos - 5, 170, 10, 'F');
  doc.setLineWidth(0.5);
  doc.rect(20, yPos - 5, 170, 10);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('NET PAY', 25, yPos + 2);
  doc.text(formatCurrency(paystub.netPay), 185, yPos + 2, { align: 'right' });
  yPos += 15;
  
  // ==============================
  // FOOTER
  // ==============================
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Payment Method: Direct Deposit', 105, yPos, { align: 'center' });
  yPos += 5;
  doc.text('Account: ****1234', 105, yPos, { align: 'center' });
  yPos += 8;
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('This document is electronically generated and verified.', 105, yPos, { align: 'center' });
  yPos += 4;
  doc.setFont('helvetica', 'bold');
  doc.text(`ORBIT Hallmark: #${paystub.hallmarkAssetNumber || 'N/A'}`, 105, yPos, { align: 'center' });
  
  return doc;
}

export function downloadPaystubPDF(paystub: PaystubPDFData): void {
  const doc = generatePaystubPDF(paystub);
  const fileName = `paystub-${paystub.workerName.replace(/\s+/g, '_')}-${format(new Date(paystub.payPeriodStart), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
