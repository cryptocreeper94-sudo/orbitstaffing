import { readFile, mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import type { PayrollRecord, Worker, EmployeeW4Data, GarnishmentOrder } from "@shared/schema";

export interface PaystubGenerationInput {
  payrollRecord: PayrollRecord;
  worker: Worker;
  w4Data: EmployeeW4Data;
  garnishmentOrders: GarnishmentOrder[];
  companyName: string;
  companyLogoUrl?: string;
  hallmarkAssetNumber: string;
  verificationUrl: string;
}

/**
 * Generate a professional paystub PDF with hallmark and QR code using jsPDF
 */
export async function generatePaystubPdf(input: PaystubGenerationInput): Promise<{
  pdfUrl: string;
  fileName: string;
  hallmarkAssetNumber: string;
  qrCodeUrl: string;
}> {
  const {
    payrollRecord,
    worker,
    w4Data,
    garnishmentOrders,
    companyName,
    hallmarkAssetNumber,
    verificationUrl,
  } = input;

  // Generate QR code
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

  // Create PDF directly using jsPDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Generate PDF content
  generatePdfContent(pdf, {
    payrollRecord,
    worker,
    w4Data,
    garnishmentOrders,
    companyName,
    hallmarkAssetNumber,
    qrCodeDataUrl,
  });

  // Save PDF locally
  const fileName = generateFileName(payrollRecord, worker);
  const pdfPath = await savePdfLocally(payrollRecord.tenantId, fileName, pdf);

  return {
    pdfUrl: pdfPath,
    fileName,
    hallmarkAssetNumber,
    qrCodeUrl: qrCodeDataUrl,
  };
}

/**
 * Generate PDF content directly using jsPDF methods
 */
function generatePdfContent(
  pdf: jsPDF,
  input: {
    payrollRecord: PayrollRecord;
    worker: Worker;
    w4Data: EmployeeW4Data;
    garnishmentOrders: GarnishmentOrder[];
    companyName: string;
    hallmarkAssetNumber: string;
    qrCodeDataUrl: string;
  }
): void {
  const {
    payrollRecord,
    worker,
    garnishmentOrders,
    companyName,
    hallmarkAssetNumber,
    qrCodeDataUrl,
  } = input;

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 10;

  // Set colors
  const darkBg = "#0f0f0f";
  const accentColor = "#06b6d4";
  
  // Header
  pdf.setFillColor(31, 31, 31);
  pdf.rect(0, 0, pageWidth, 30, "F");
  
  // Company Name
  pdf.setTextColor(6, 182, 212);
  pdf.setFontSize(16);
  pdf.setFont(undefined, "bold");
  pdf.text(companyName, 10, 12);
  
  // Add QR Code
  pdf.addImage(qrCodeDataUrl, "PNG", pageWidth - 35, 5, 25, 25);
  
  // Powered by ORBIT
  pdf.setTextColor(136, 136, 136);
  pdf.setFontSize(8);
  pdf.setFont(undefined, "normal");
  pdf.text("Powered by ORBIT - Staffing & Payroll Management", 10, 20);
  
  yPosition = 32;

  // Hallmark watermark (text-based)
  pdf.setTextColor(6, 182, 212);
  pdf.setFontSize(60);
  pdf.setFont(undefined, "bold");
  pdf.setOpacity(0.08);
  pdf.text("POWERED BY ORBIT", pageWidth / 2, pageHeight / 2, {
    align: "center",
    angle: -45,
  });
  pdf.setOpacity(1);

  // Reset text color
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont(undefined, "normal");

  // Employee Information Section
  pdf.setFillColor(17, 17, 17);
  pdf.rect(10, yPosition, pageWidth - 20, 20, "F");
  
  pdf.setTextColor(6, 182, 212);
  pdf.setFont(undefined, "bold");
  pdf.text("EMPLOYEE INFORMATION", 12, yPosition + 6);
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFont(undefined, "normal");
  const infoX1 = 12;
  const infoX2 = pageWidth / 2;
  
  pdf.text(`Pay Period: ${payrollRecord.payPeriodStart} to ${payrollRecord.payPeriodEnd}`, infoX1, yPosition + 12);
  pdf.text(`Pay Date: ${payrollRecord.payDate || "Not Set"}`, infoX2, yPosition + 12);
  pdf.text(`State: ${payrollRecord.workState || "N/A"}${payrollRecord.workCity ? " - " + payrollRecord.workCity : ""}`, infoX1, yPosition + 18);
  
  yPosition += 25;

  // Earnings Section
  yPosition = addSection(pdf, yPosition, "EARNINGS", [
    ["Gross Pay", `$${Number(payrollRecord.grossPay).toFixed(2)}`],
  ]);

  // Withholdings Section
  const withholdings: [string, string][] = [
    ["Federal Income Tax", `$${Number(payrollRecord.federalIncomeTax || 0).toFixed(2)}`],
    ["Social Security Tax (6.2%)", `$${Number(payrollRecord.socialSecurityTax || 0).toFixed(2)}`],
    ["Medicare Tax (1.45%)", `$${Number(payrollRecord.medicareTax || 0).toFixed(2)}`],
  ];

  if (payrollRecord.additionalMedicareTax) {
    withholdings.push([
      "Additional Medicare Tax",
      `$${Number(payrollRecord.additionalMedicareTax).toFixed(2)}`,
    ]);
  }

  if (payrollRecord.stateTax) {
    withholdings.push([
      `${payrollRecord.workState} State Tax`,
      `$${Number(payrollRecord.stateTax).toFixed(2)}`,
    ]);
  }

  if (payrollRecord.localTax) {
    withholdings.push([
      "Local Occupational Tax",
      `$${Number(payrollRecord.localTax).toFixed(2)}`,
    ]);
  }

  withholdings.push([
    "TOTAL MANDATORY DEDUCTIONS",
    `$${Number(payrollRecord.totalMandatoryDeductions || 0).toFixed(2)}`,
  ]);

  yPosition = addSection(pdf, yPosition, "WITHHOLDINGS & DEDUCTIONS", withholdings);

  // Garnishments Section
  if (garnishmentOrders.length > 0) {
    const garnishData: [string, string][] = (
      payrollRecord.garnishmentsApplied as any[] || []
    )
      .map((g) => {
        const order = garnishmentOrders.find((go) => go.id === g.id);
        return [
          order?.creditorName || g.type,
          `$${g.amount?.toFixed(2) || "0.00"}`,
        ];
      });

    garnishData.push([
      "TOTAL GARNISHMENTS",
      `$${Number(payrollRecord.totalGarnishments || 0).toFixed(2)}`,
    ]);

    yPosition = addSection(pdf, yPosition, "GARNISHMENTS & COURT ORDERS", garnishData);
  }

  // Net Pay Section
  yPosition += 3;
  pdf.setFillColor(6, 182, 212);
  pdf.rect(10, yPosition, pageWidth - 20, 15, "F");
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.setFont(undefined, "bold");
  pdf.text("NET PAY", 12, yPosition + 8);
  
  const netPayAmount = `$${Number(payrollRecord.netPay).toFixed(2)}`;
  pdf.text(netPayAmount, pageWidth - 12, yPosition + 8, { align: "right" });

  yPosition += 18;

  // CCPA Compliance Info
  pdf.setTextColor(136, 136, 136);
  pdf.setFontSize(8);
  pdf.setFont(undefined, "normal");
  const complianceText = `CCPA Compliance: This paystub is generated in compliance with the Fair Labor Standards Act and California Consumer Privacy Act (CCPA). Garnishments applied herein follow federal and state guidelines for wage protection and creditor rights.`;
  const splitText = pdf.splitTextToSize(complianceText, pageWidth - 20);
  pdf.text(splitText, 10, yPosition);

  // Hallmark Badge at bottom
  yPosition = pageHeight - 15;
  pdf.setTextColor(6, 182, 212);
  pdf.setFontSize(8);
  pdf.setFont(undefined, "bold");
  pdf.text(`✓ HALLMARK VERIFIED: ${hallmarkAssetNumber}`, 10, yPosition);

  // Footer
  yPosition += 6;
  pdf.setTextColor(136, 136, 136);
  pdf.setFontSize(7);
  pdf.setFont(undefined, "normal");
  pdf.text("Document ID: " + payrollRecord.id, 10, yPosition);
  pdf.text(`Generated: ${new Date().toISOString()}`, 10, yPosition + 5);
}

/**
 * Add a section to the PDF with a title and data rows
 */
function addSection(
  pdf: jsPDF,
  yPosition: number,
  title: string,
  rows: [string, string][]
): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Section header
  pdf.setFillColor(6, 182, 212);
  pdf.rect(10, yPosition, pageWidth - 20, 6, "F");
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(9);
  pdf.setFont(undefined, "bold");
  pdf.text(title, 12, yPosition + 4.5);
  
  yPosition += 8;

  // Data rows
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont(undefined, "normal");

  for (const [label, amount] of rows) {
    const isTotalRow = label.includes("TOTAL");
    
    if (isTotalRow) {
      pdf.setFillColor(17, 17, 17);
      pdf.rect(10, yPosition - 1, pageWidth - 20, 5, "F");
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(6, 182, 212);
    } else {
      pdf.setFont(undefined, "normal");
      pdf.setTextColor(255, 255, 255);
    }

    pdf.text(label, 12, yPosition + 3);
    pdf.text(amount, pageWidth - 12, yPosition + 3, { align: "right" });
    
    yPosition += 5;
  }

  return yPosition + 3;
}


/**
 * Save PDF to local filesystem
 */
async function savePdfLocally(
  tenantId: string,
  fileName: string,
  pdf: jsPDF
): Promise<string> {
  const paystubDir = join(process.cwd(), "server", "paystubs", tenantId);

  // Create directory if it doesn't exist
  if (!existsSync(paystubDir)) {
    await mkdir(paystubDir, { recursive: true });
  }

  const filePath = join(paystubDir, fileName);
  const pdfBytes = pdf.output("arraybuffer");
  
  await writeFile(filePath, Buffer.from(pdfBytes));

  return `/paystubs/${tenantId}/${fileName}`;
}

/**
 * Generate filename for paystub PDF
 */
function generateFileName(payrollRecord: PayrollRecord, worker: Worker): string {
  const date = new Date().toISOString().split("T")[0];
  const employeeId = worker.employeeNumber || worker.id.substring(0, 8);
  return `paystub_${employeeId}_${payrollRecord.payPeriodStart}_${payrollRecord.payPeriodEnd}_${date}.pdf`;
}

/**
 * Retrieve paystub PDF from filesystem
 */
export async function getPaystubPdf(tenantId: string, fileName: string): Promise<Buffer> {
  const filePath = join(process.cwd(), "server", "paystubs", tenantId, fileName);
  return readFile(filePath);
}

/**
 * Delete paystub PDF from filesystem
 */
export async function deletePaystubPdf(tenantId: string, fileName: string): Promise<void> {
  const filePath = join(process.cwd(), "server", "paystubs", tenantId, fileName);
  if (existsSync(filePath)) {
    await writeFile(filePath, "");
  }
}
