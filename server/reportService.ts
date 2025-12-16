import { db } from "./db";
import { eq, and, gte, lte, desc, sql, count } from "drizzle-orm";
import {
  workers,
  timesheets,
  payroll,
  workerInsurance,
  companyInsurance,
  complianceReports,
  type Worker,
  type ComplianceReport,
  type ComplianceReportType,
  type ReportFormat,
  COMPLIANCE_REPORT_TYPES,
} from "@shared/schema";
import fs from "fs";
import path from "path";

interface ReportParams {
  tenantId: string;
  reportType: ComplianceReportType;
  dateRange?: { startDate: string; endDate: string };
  format: ReportFormat;
  filters?: {
    workerIds?: string[];
    status?: string;
    clientId?: string;
  };
  createdBy?: string;
}

interface ReportTypeInfo {
  id: ComplianceReportType;
  name: string;
  description: string;
  icon: string;
  fields: string[];
}

export const REPORT_TYPE_INFO: ReportTypeInfo[] = [
  {
    id: 'i9_audit',
    name: 'I-9 Audit Report',
    description: 'All workers with I-9 verification status and expiration dates',
    icon: 'Shield',
    fields: ['Worker Name', 'I-9 Status', 'Verification Date', 'Document Type', 'Expiration Date']
  },
  {
    id: 'tax_summary',
    name: 'Tax Summary Report',
    description: 'W-2/1099 summary by reporting period',
    icon: 'FileText',
    fields: ['Worker Name', 'Tax Type', 'Gross Pay', 'Federal Tax', 'State Tax', 'YTD Total']
  },
  {
    id: 'certification_tracker',
    name: 'Certification Tracker',
    description: 'Worker certifications with upcoming expirations',
    icon: 'Award',
    fields: ['Worker Name', 'Certification Type', 'Issue Date', 'Expiration Date', 'Status']
  },
  {
    id: 'worker_status',
    name: 'Worker Status Report',
    description: 'Active/inactive workers with complete details',
    icon: 'Users',
    fields: ['Worker Name', 'Status', 'Hire Date', 'Last Assignment', 'Phone', 'Email']
  },
  {
    id: 'payroll_summary',
    name: 'Payroll Summary Report',
    description: 'Payroll totals by period, client, and worker',
    icon: 'DollarSign',
    fields: ['Worker Name', 'Client', 'Hours', 'Gross Pay', 'Deductions', 'Net Pay']
  },
  {
    id: 'insurance_compliance',
    name: 'Insurance Compliance Report',
    description: "Workers' comp and liability insurance status",
    icon: 'ShieldCheck',
    fields: ['Entity', 'Insurance Type', 'Carrier', 'Policy Number', 'Expiration', 'Status']
  }
];

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'reports');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function generateI9AuditReport(tenantId: string, params: ReportParams): Promise<{ data: any[], findings: number }> {
  const workerList = await db.select({
    id: workers.id,
    fullName: workers.fullName,
    email: workers.email,
    phone: workers.phone,
    i9Verified: workers.i9Verified,
    i9VerifiedDate: workers.i9VerifiedDate,
    status: workers.status,
    onboardingStatus: workers.onboardingStatus,
  })
    .from(workers)
    .where(eq(workers.companyId, tenantId))
    .orderBy(workers.fullName);

  let findings = 0;
  const data = workerList.map(w => {
    const isExpired = false;
    const needsReverification = !w.i9Verified;
    if (needsReverification) findings++;
    
    return {
      workerId: w.id,
      workerName: w.fullName || 'Unknown',
      email: w.email,
      phone: w.phone,
      i9Status: w.i9Verified ? 'Verified' : 'Not Verified',
      verificationDate: w.i9VerifiedDate ? new Date(w.i9VerifiedDate).toLocaleDateString() : 'N/A',
      documentType: 'I-9',
      expirationDate: 'N/A',
      status: w.status,
      needsAction: needsReverification,
    };
  });

  return { data, findings };
}

async function generateTaxSummaryReport(tenantId: string, params: ReportParams): Promise<{ data: any[], findings: number }> {
  const payrollRecords = await db.select({
    workerId: payroll.workerId,
    grossPay: payroll.grossPay,
    netPay: payroll.netPay,
    periodStart: payroll.periodStart,
    periodEnd: payroll.periodEnd,
    status: payroll.status,
  })
    .from(payroll)
    .where(eq(payroll.tenantId, tenantId))
    .orderBy(desc(payroll.periodStart));

  const workerTotals = new Map<string, {
    grossTotal: number;
    netTotal: number;
    federalTax: number;
    stateTax: number;
    periods: number;
  }>();

  for (const record of payrollRecords) {
    const workerId = record.workerId || 'unknown';
    const existing = workerTotals.get(workerId) || { grossTotal: 0, netTotal: 0, federalTax: 0, stateTax: 0, periods: 0 };
    const gross = parseFloat(record.grossPay || '0');
    const net = parseFloat(record.netPay || '0');
    existing.grossTotal += gross;
    existing.netTotal += net;
    existing.federalTax += gross * 0.12;
    existing.stateTax += gross * 0.05;
    existing.periods += 1;
    workerTotals.set(workerId, existing);
  }

  const workerNames = await db.select({ id: workers.id, fullName: workers.fullName })
    .from(workers)
    .where(eq(workers.companyId, tenantId));
  const nameMap = new Map(workerNames.map(w => [w.id, w.fullName]));

  const data = Array.from(workerTotals.entries()).map(([workerId, totals]) => ({
    workerId,
    workerName: nameMap.get(workerId) || 'Unknown Worker',
    taxType: 'W-2',
    grossPay: totals.grossTotal.toFixed(2),
    federalTax: totals.federalTax.toFixed(2),
    stateTax: totals.stateTax.toFixed(2),
    ytdTotal: totals.grossTotal.toFixed(2),
    periods: totals.periods,
  }));

  return { data, findings: 0 };
}

async function generateCertificationTrackerReport(tenantId: string, params: ReportParams): Promise<{ data: any[], findings: number }> {
  const workerList = await db.select({
    id: workers.id,
    fullName: workers.fullName,
    skills: workers.skills,
    status: workers.status,
    backgroundCheckStatus: workers.backgroundCheckStatus,
    i9Verified: workers.i9Verified,
  })
    .from(workers)
    .where(eq(workers.companyId, tenantId))
    .orderBy(workers.fullName);

  let findings = 0;
  const today = new Date();

  const data = workerList.map(w => {
    const hasSkills = Array.isArray(w.skills) && (w.skills as string[]).length > 0;
    const needsCert = !w.i9Verified || w.backgroundCheckStatus !== 'passed';
    
    if (needsCert) findings++;

    return {
      workerId: w.id,
      workerName: w.fullName || 'Unknown',
      certificationType: hasSkills ? 'Skills Certification' : 'General',
      skills: hasSkills ? (w.skills as string[]).join(', ') : 'None',
      i9Status: w.i9Verified ? 'Verified' : 'Not Verified',
      backgroundStatus: w.backgroundCheckStatus || 'Pending',
      status: needsCert ? 'Needs Attention' : 'Valid',
      needsAction: needsCert,
    };
  });

  return { data, findings };
}

async function generateWorkerStatusReport(tenantId: string, params: ReportParams): Promise<{ data: any[], findings: number }> {
  const workerList = await db.select({
    id: workers.id,
    fullName: workers.fullName,
    email: workers.email,
    phone: workers.phone,
    status: workers.status,
    availabilityStatus: workers.availabilityStatus,
    onboardingStatus: workers.onboardingStatus,
    createdAt: workers.createdAt,
    skills: workers.skills,
  })
    .from(workers)
    .where(eq(workers.companyId, tenantId))
    .orderBy(workers.fullName);

  let findings = 0;
  const data = workerList.map(w => {
    const needsReview = w.status === 'pending_review' || w.onboardingStatus === 'not_started';
    if (needsReview) findings++;

    return {
      workerId: w.id,
      workerName: w.fullName || 'Unknown',
      status: w.status || 'Unknown',
      availabilityStatus: w.availabilityStatus || 'Unknown',
      onboardingStatus: w.onboardingStatus || 'not_started',
      hireDate: w.createdAt ? new Date(w.createdAt).toLocaleDateString() : 'N/A',
      lastAssignment: 'N/A',
      phone: w.phone || 'N/A',
      email: w.email || 'N/A',
      skills: Array.isArray(w.skills) ? (w.skills as string[]).join(', ') : 'N/A',
      needsAction: needsReview,
    };
  });

  return { data, findings };
}

async function generatePayrollSummaryReport(tenantId: string, params: ReportParams): Promise<{ data: any[], findings: number }> {
  const startDate = params.dateRange?.startDate ? new Date(params.dateRange.startDate) : new Date(new Date().getFullYear(), 0, 1);
  const endDate = params.dateRange?.endDate ? new Date(params.dateRange.endDate) : new Date();

  const payrollRecords = await db.select({
    id: payroll.id,
    workerId: payroll.workerId,
    grossPay: payroll.grossPay,
    netPay: payroll.netPay,
    periodStart: payroll.periodStart,
    periodEnd: payroll.periodEnd,
    status: payroll.status,
    hoursWorked: payroll.hoursWorked,
    totalDeductions: payroll.totalDeductions,
  })
    .from(payroll)
    .where(
      and(
        eq(payroll.tenantId, tenantId),
        gte(payroll.periodStart, startDate),
        lte(payroll.periodEnd, endDate)
      )
    )
    .orderBy(desc(payroll.periodStart));

  const workerNames = await db.select({ id: workers.id, fullName: workers.fullName })
    .from(workers)
    .where(eq(workers.companyId, tenantId));
  const nameMap = new Map(workerNames.map(w => [w.id, w.fullName]));

  const data = payrollRecords.map(p => ({
    payrollId: p.id,
    workerId: p.workerId,
    workerName: nameMap.get(p.workerId || '') || 'Unknown Worker',
    client: 'All Clients',
    periodStart: p.periodStart ? new Date(p.periodStart).toLocaleDateString() : 'N/A',
    periodEnd: p.periodEnd ? new Date(p.periodEnd).toLocaleDateString() : 'N/A',
    hours: parseFloat(p.hoursWorked || '0').toFixed(2),
    grossPay: parseFloat(p.grossPay || '0').toFixed(2),
    deductions: parseFloat(p.totalDeductions || '0').toFixed(2),
    netPay: parseFloat(p.netPay || '0').toFixed(2),
    status: p.status || 'pending',
  }));

  return { data, findings: 0 };
}

async function generateInsuranceComplianceReport(tenantId: string, params: ReportParams): Promise<{ data: any[], findings: number }> {
  const companyInsuranceRecords = await db.select()
    .from(companyInsurance)
    .where(eq(companyInsurance.tenantId, tenantId));

  const workerInsuranceRecords = await db.select({
    id: workerInsurance.id,
    workerId: workerInsurance.workerId,
    insuranceType: workerInsurance.insuranceType,
    policyNumber: workerInsurance.policyNumber,
    carrier: workerInsurance.carrier,
    expirationDate: workerInsurance.expirationDate,
    status: workerInsurance.status,
  })
    .from(workerInsurance)
    .where(eq(workerInsurance.tenantId, tenantId));

  const workerNames = await db.select({ id: workers.id, fullName: workers.fullName })
    .from(workers)
    .where(eq(workers.companyId, tenantId));
  const nameMap = new Map(workerNames.map(w => [w.id, w.fullName]));

  let findings = 0;
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const data: any[] = [];

  for (const ins of companyInsuranceRecords) {
    const expDate = ins.expirationDate ? new Date(ins.expirationDate) : null;
    const isExpired = expDate && expDate < today;
    const expiringSoon = expDate && expDate <= thirtyDaysFromNow && expDate >= today;
    if (isExpired || expiringSoon) findings++;

    data.push({
      entityType: 'Company',
      entityName: 'Company Policy',
      insuranceType: ins.insuranceType || 'General',
      carrier: ins.carrier || 'N/A',
      policyNumber: ins.policyNumber || 'N/A',
      expirationDate: expDate ? expDate.toLocaleDateString() : 'N/A',
      status: isExpired ? 'Expired' : expiringSoon ? 'Expiring Soon' : ins.status || 'Active',
      needsAction: isExpired || expiringSoon,
    });
  }

  for (const ins of workerInsuranceRecords) {
    const expDate = ins.expirationDate ? new Date(ins.expirationDate) : null;
    const isExpired = expDate && expDate < today;
    const expiringSoon = expDate && expDate <= thirtyDaysFromNow && expDate >= today;
    if (isExpired || expiringSoon) findings++;

    data.push({
      entityType: 'Worker',
      entityName: nameMap.get(ins.workerId || '') || 'Unknown Worker',
      insuranceType: ins.insuranceType || 'General',
      carrier: ins.carrier || 'N/A',
      policyNumber: ins.policyNumber || 'N/A',
      expirationDate: expDate ? expDate.toLocaleDateString() : 'N/A',
      status: isExpired ? 'Expired' : expiringSoon ? 'Expiring Soon' : ins.status || 'Active',
      needsAction: isExpired || expiringSoon,
    });
  }

  return { data, findings };
}

function generateCSV(data: any[], reportType: string): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

function generatePDFContent(data: any[], reportType: string, reportName: string): string {
  const typeInfo = REPORT_TYPE_INFO.find(t => t.id === reportType);
  const title = typeInfo?.name || reportType;
  
  let html = `
<!DOCTYPE html>
<html>
<head>
  <title>${reportName}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 10px; }
    .meta { color: #666; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #1e293b; color: white; padding: 12px; text-align: left; }
    td { border-bottom: 1px solid #e2e8f0; padding: 10px; }
    tr:nth-child(even) { background: #f8fafc; }
    .warning { color: #d97706; }
    .error { color: #dc2626; }
    .success { color: #16a34a; }
    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    <p>Generated: ${new Date().toLocaleString()}</p>
    <p>Total Records: ${data.length}</p>
  </div>
  <table>
    <thead>
      <tr>
        ${data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'needsAction' && !k.endsWith('Id')).map(h => `<th>${h.replace(/([A-Z])/g, ' $1').trim()}</th>`).join('') : ''}
      </tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          ${Object.entries(row).filter(([k]) => k !== 'needsAction' && !k.endsWith('Id')).map(([k, v]) => {
            let className = '';
            if (v === 'Expired' || v === 'Not Verified') className = 'error';
            else if (v === 'Expiring Soon' || v === 'pending_review') className = 'warning';
            else if (v === 'Verified' || v === 'Active' || v === 'Valid') className = 'success';
            return `<td class="${className}">${v}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="footer">
    <p>ORBIT Staffing OS - Compliance Report</p>
    <p>This report is confidential and intended for authorized personnel only.</p>
  </div>
</body>
</html>`;
  
  return html;
}

export async function generateReport(params: ReportParams): Promise<ComplianceReport> {
  const reportName = `${REPORT_TYPE_INFO.find(t => t.id === params.reportType)?.name || params.reportType} - ${new Date().toLocaleDateString()}`;
  
  const [reportRecord] = await db.insert(complianceReports).values({
    tenantId: params.tenantId,
    reportType: params.reportType,
    reportName,
    status: 'generating',
    format: params.format,
    parameters: params.dateRange || {},
    createdBy: params.createdBy,
  }).returning();

  try {
    let reportData: { data: any[], findings: number };
    
    switch (params.reportType) {
      case 'i9_audit':
        reportData = await generateI9AuditReport(params.tenantId, params);
        break;
      case 'tax_summary':
        reportData = await generateTaxSummaryReport(params.tenantId, params);
        break;
      case 'certification_tracker':
        reportData = await generateCertificationTrackerReport(params.tenantId, params);
        break;
      case 'worker_status':
        reportData = await generateWorkerStatusReport(params.tenantId, params);
        break;
      case 'payroll_summary':
        reportData = await generatePayrollSummaryReport(params.tenantId, params);
        break;
      case 'insurance_compliance':
        reportData = await generateInsuranceComplianceReport(params.tenantId, params);
        break;
      default:
        throw new Error(`Unknown report type: ${params.reportType}`);
    }

    let fileContent: string;
    let fileExtension: string;
    
    switch (params.format) {
      case 'csv':
        fileContent = generateCSV(reportData.data, params.reportType);
        fileExtension = 'csv';
        break;
      case 'excel':
        fileContent = generateCSV(reportData.data, params.reportType);
        fileExtension = 'csv';
        break;
      case 'pdf':
      default:
        fileContent = generatePDFContent(reportData.data, params.reportType, reportName);
        fileExtension = 'html';
        break;
    }

    const fileName = `${params.reportType}_${reportRecord.id}.${fileExtension}`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    
    fs.writeFileSync(filePath, fileContent);
    const fileStats = fs.statSync(filePath);

    const complianceStatus = reportData.findings > 5 ? 'critical' : reportData.findings > 0 ? 'warning' : 'compliant';
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [updatedReport] = await db.update(complianceReports)
      .set({
        status: 'completed',
        filePath: `/uploads/reports/${fileName}`,
        fileSize: fileStats.size,
        recordCount: reportData.data.length,
        findings: reportData.findings,
        complianceStatus,
        generatedAt: new Date(),
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(complianceReports.id, reportRecord.id))
      .returning();

    return updatedReport;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const [failedReport] = await db.update(complianceReports)
      .set({
        status: 'failed',
        errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(complianceReports.id, reportRecord.id))
      .returning();

    return failedReport;
  }
}

export async function getReportById(reportId: string, tenantId: string): Promise<ComplianceReport | null> {
  const [report] = await db.select()
    .from(complianceReports)
    .where(and(
      eq(complianceReports.id, reportId),
      eq(complianceReports.tenantId, tenantId)
    ))
    .limit(1);
  
  return report || null;
}

export async function getReportHistory(tenantId: string, limit: number = 20): Promise<ComplianceReport[]> {
  return db.select()
    .from(complianceReports)
    .where(eq(complianceReports.tenantId, tenantId))
    .orderBy(desc(complianceReports.createdAt))
    .limit(limit);
}

export async function markReportDownloaded(reportId: string): Promise<void> {
  await db.update(complianceReports)
    .set({ downloadedAt: new Date() })
    .where(eq(complianceReports.id, reportId));
}

export const reportService = {
  generateReport,
  getReportById,
  getReportHistory,
  markReportDownloaded,
  REPORT_TYPE_INFO,
};
