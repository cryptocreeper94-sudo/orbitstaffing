import jsPDF from 'jspdf';
import { format } from 'date-fns';

export interface SoftwareLicenseData {
  licenseNumber: string;
  
  licenseeCompanyName: string;
  licenseeContactName: string;
  licenseeEmail: string;
  licenseePhone?: string;
  licenseeAddress?: string;
  licenseeDomain?: string;
  
  productName: string;
  
  licenseFee: number;
  monthlySupportFee: number;
  
  effectiveDate: Date | string;
  termYears: number;
  
  signedByLicensee?: string;
  signedByLicensor?: string;
  signedDate?: Date | string;
}

export function generateSoftwareLicensePDF(data: SoftwareLicenseData): jsPDF {
  const doc = new jsPDF();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'MMMM d, yyyy');
  };

  let yPos = 20;
  const leftMargin = 20;
  const rightMargin = 190;
  const lineHeight = 6;
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SOFTWARE LICENSE AGREEMENT', 105, yPos, { align: 'center' });
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Powered by ORBIT | DarkWave Studios', 105, yPos, { align: 'center' });
  
  yPos += 5;
  doc.setFontSize(9);
  doc.text(`License Number: ${data.licenseNumber}`, 105, yPos, { align: 'center' });
  
  yPos += 12;
  doc.setDrawColor(0);
  doc.line(leftMargin, yPos, rightMargin, yPos);
  
  yPos += 10;
  
  // Parties Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PARTIES', leftMargin, yPos);
  
  yPos += lineHeight + 2;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  doc.text('LICENSOR:', leftMargin, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text('DarkWave Studios, LLC', leftMargin + 25, yPos);
  doc.setFont('helvetica', 'normal');
  
  yPos += lineHeight;
  doc.text('LICENSEE:', leftMargin, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(data.licenseeCompanyName, leftMargin + 25, yPos);
  doc.setFont('helvetica', 'normal');
  
  yPos += lineHeight;
  doc.text(`Contact: ${data.licenseeContactName}`, leftMargin + 25, yPos);
  
  yPos += lineHeight;
  doc.text(`Email: ${data.licenseeEmail}`, leftMargin + 25, yPos);
  
  if (data.licenseePhone) {
    yPos += lineHeight;
    doc.text(`Phone: ${data.licenseePhone}`, leftMargin + 25, yPos);
  }
  
  if (data.licenseeAddress) {
    yPos += lineHeight;
    doc.text(`Address: ${data.licenseeAddress}`, leftMargin + 25, yPos);
  }
  
  yPos += 10;
  
  // Licensed Product Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('LICENSED PRODUCT', leftMargin, yPos);
  
  yPos += lineHeight + 2;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Product Name: ${data.productName}`, leftMargin, yPos);
  
  if (data.licenseeDomain) {
    yPos += lineHeight;
    doc.text(`Licensee Domain: ${data.licenseeDomain}`, leftMargin, yPos);
  }
  
  yPos += 10;
  
  // Financial Terms Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('FINANCIAL TERMS', leftMargin, yPos);
  
  yPos += lineHeight + 2;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  doc.text('One-Time License Fee:', leftMargin, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(data.licenseFee), leftMargin + 50, yPos);
  doc.setFont('helvetica', 'normal');
  
  yPos += lineHeight;
  doc.text('Monthly Support Fee:', leftMargin, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatCurrency(data.monthlySupportFee)}/month`, leftMargin + 50, yPos);
  doc.setFont('helvetica', 'normal');
  
  yPos += lineHeight;
  doc.text('Effective Date:', leftMargin, yPos);
  doc.text(formatDate(data.effectiveDate), leftMargin + 50, yPos);
  
  yPos += lineHeight;
  doc.text('Initial Term:', leftMargin, yPos);
  doc.text(`${data.termYears} year(s)`, leftMargin + 50, yPos);
  
  yPos += 12;
  
  // Terms and Conditions
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS AND CONDITIONS', leftMargin, yPos);
  
  yPos += lineHeight + 2;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const terms = [
    '1. GRANT OF LICENSE: Licensor grants Licensee a non-exclusive, non-transferable license to use the Software for business operations.',
    '2. ORBIT INTEGRATION: The Software operates on the ORBIT platform and includes access to ORBIT staffing, payroll, and hallmark verification systems.',
    '3. SUPPORT SERVICES: Monthly support fee includes software updates, bug fixes, technical support (Mon-Fri 9AM-5PM CST), and platform maintenance.',
    '4. PAYMENT TERMS: One-time license fee due upon execution. Monthly support fees billed on the 1st of each month via the payment method on file.',
    '5. INTELLECTUAL PROPERTY: All intellectual property rights remain with DarkWave Studios. Licensee receives usage rights only.',
    '6. POWERED BY ORBIT: All outputs from the Software shall display the "Powered by ORBIT" hallmark as verification of authenticity.',
    '7. DATA SECURITY: Licensor maintains industry-standard security practices. Licensee data is encrypted and isolated per tenant.',
    '8. TERMINATION: Either party may terminate with 30 days written notice. Upon termination, Licensee loses access to the Software.',
    '9. LIMITATION OF LIABILITY: Licensor liability is limited to the amount paid by Licensee in the preceding 12 months.',
    '10. GOVERNING LAW: This Agreement is governed by the laws of the State of Tennessee.',
  ];
  
  terms.forEach((term) => {
    const lines = doc.splitTextToSize(term, rightMargin - leftMargin);
    lines.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, leftMargin, yPos);
      yPos += 4;
    });
    yPos += 2;
  });
  
  yPos += 8;
  
  // Signature Section
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SIGNATURES', leftMargin, yPos);
  
  yPos += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  // Licensor signature
  doc.text('LICENSOR: DarkWave Studios, LLC', leftMargin, yPos);
  yPos += 12;
  doc.line(leftMargin, yPos, leftMargin + 60, yPos);
  yPos += 4;
  doc.text('Signature', leftMargin, yPos);
  doc.text(data.signedByLicensor || '________________________', leftMargin + 70, yPos - 4);
  
  yPos += 12;
  doc.text('Date: ' + (data.signedDate ? formatDate(data.signedDate) : '________________'), leftMargin, yPos);
  
  yPos += 15;
  
  // Licensee signature
  doc.text(`LICENSEE: ${data.licenseeCompanyName}`, leftMargin, yPos);
  yPos += 12;
  doc.line(leftMargin, yPos, leftMargin + 60, yPos);
  yPos += 4;
  doc.text('Signature', leftMargin, yPos);
  doc.text(data.signedByLicensee || '________________________', leftMargin + 70, yPos - 4);
  
  yPos += 12;
  doc.text(`Print Name: ${data.licenseeContactName}`, leftMargin, yPos);
  
  yPos += 8;
  doc.text('Date: ' + (data.signedDate ? formatDate(data.signedDate) : '________________'), leftMargin, yPos);
  
  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `License #${data.licenseNumber} | Page ${i} of ${pageCount} | Generated ${format(new Date(), 'MM/dd/yyyy')}`,
      105,
      290,
      { align: 'center' }
    );
    doc.setTextColor(0);
  }
  
  return doc;
}

export function downloadLicensePDF(data: SoftwareLicenseData) {
  const doc = generateSoftwareLicensePDF(data);
  doc.save(`Software-License-${data.licenseNumber}.pdf`);
}
