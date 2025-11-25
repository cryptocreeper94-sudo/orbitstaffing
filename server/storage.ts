import { db } from "./db";
import { eq, desc, and, gte, lte, inArray, sql } from "drizzle-orm";
import {
  users,
  companies,
  workers,
  timesheets,
  payroll,
  invoices,
  hallmarks,
  bugReports,
  developerMessages,
  workerInsurance,
  companyInsurance,
  insuranceDocuments,
  workerRequests,
  workerRequestMatches,
  employeeW4Data,
  garnishmentOrders,
  payrollRecords,
  garnishmentPayments,
  type User,
  type InsertUser,
  type Company,
  type InsertCompany,
  type Worker,
  type InsertWorker,
  type Timesheet,
  type InsertTimesheet,
  type Payroll,
  type InsertPayroll,
  type Invoice,
  type InsertInvoice,
  type Hallmark,
  type InsertHallmark,
  type BugReport,
  type InsertBugReport,
  type DeveloperMessage,
  type InsertDeveloperMessage,
  type WorkerInsurance,
  type InsertWorkerInsurance,
  type CompanyInsurance,
  type InsertCompanyInsurance,
  type InsuranceDocument,
  type InsertInsuranceDocument,
  type WorkerRequest,
  type InsertWorkerRequest,
  type WorkerRequestMatch,
  type InsertWorkerRequestMatch,
  type EmployeeW4Data,
  type InsertEmployeeW4Data,
  type GarnishmentOrder,
  type InsertGarnishmentOrder,
  type PayrollRecord,
  type InsertPayrollRecord,
  type GarnishmentPayment,
  type InsertGarnishmentPayment,
} from "@shared/schema";

export interface IStorage {
  [key: string]: any;
}

export const storage: IStorage = {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  },

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  },

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  },

  // Developer Chat - stub
  async createDeveloperChatMessage(data: any): Promise<any> {
    return { id: `msg-${Date.now()}`, ...data };
  },

  async getDeveloperChatHistory(sessionId: string): Promise<any[]> {
    return [];
  },

  async createDeveloperContactMessage(data: any): Promise<any> {
    return { id: `msg-${Date.now()}`, ...data };
  },

  // Generic stubs - all methods return mock data
  async submitBugReport(data: any): Promise<any> {
    console.log('✓ Bug report:', data.title);
    return { id: `bug-${Date.now()}`, ...data };
  },

  async createDemoRegistration(data: any): Promise<any> {
    return { id: `demo-${Date.now()}`, ...data };
  },

  async createFeedback(data: any): Promise<any> {
    return { id: `feedback-${Date.now()}`, ...data };
  },

  async createFeatureRequest(data: any): Promise<any> {
    return { id: `feat-${Date.now()}`, ...data };
  },

  async createIosInterest(data: any): Promise<any> {
    return { id: `ios-${Date.now()}`, ...data };
  },

  async createPaymentMethod(data: any): Promise<any> {
    return { id: `pm-${Date.now()}`, ...data };
  },

  async createInvoice(data: any): Promise<any> {
    return { id: `inv-${Date.now()}`, ...data };
  },

  async createPayroll(data: any): Promise<any> {
    return { id: `payroll-${Date.now()}`, ...data };
  },

  async createAssignment(data: any): Promise<any> {
    return { id: `assign-${Date.now()}`, ...data };
  },

  async clockIn(data: any): Promise<any> {
    return { id: `ts-${Date.now()}`, ...data };
  },

  async clockOut(data: any): Promise<any> {
    return { id: `ts-${Date.now()}`, ...data };
  },

  async createCollection(data: any): Promise<any> {
    return { id: `col-${Date.now()}`, ...data };
  },

  async createLicense(data: any): Promise<any> {
    return { id: `lic-${Date.now()}`, ...data };
  },

  async changeBillingModel(data: any): Promise<any> {
    return { success: true };
  },

  async createHallmarkTransaction(data: any): Promise<any> {
    return { id: `hallmark-${Date.now()}`, ...data };
  },

  async createQASubmission(data: any): Promise<any> {
    return { id: `qa-${Date.now()}`, ...data };
  },

  async approveQASubmission(data: any): Promise<any> {
    return { success: true };
  },

  async createPaycheck(data: any): Promise<any> {
    return { id: `paycheck-${Date.now()}`, ...data };
  },

  async createAssignmentAcceptance(data: any): Promise<any> {
    return { id: `acceptance-${Date.now()}`, ...data };
  },

  async createEquipmentLoan(data: any): Promise<any> {
    return { id: `loan-${Date.now()}`, ...data };
  },

  async acceptOnboardingChecklist(data: any): Promise<any> {
    return { success: true };
  },

  async checkOnboardingCompletion(workerId: string): Promise<boolean> {
    return false;
  },

  async approveWorkerOnboarding(data: any): Promise<any> {
    return { success: true };
  },

  async createEmployeePreApplication(data: any): Promise<any> {
    return { id: `preapp-${Date.now()}`, ...data };
  },

  async createEmergencyMessage(data: any): Promise<any> {
    return { id: `emergency-${Date.now()}`, ...data };
  },

  // Getter methods
  async getCompany(id: string): Promise<any> { return { id }; },
  async listCompanies(): Promise<any[]> { return []; },
  async createCompany(data: any): Promise<any> { return { id: `co-${Date.now()}`, ...data }; },
  async updateCompany(id: string, data: any): Promise<any> { return { id, ...data }; },

  async getWorker(id: string): Promise<any> { return { id }; },
  async listWorkers(): Promise<any[]> { return []; },
  async createWorker(data: any): Promise<any> { return { id: `w-${Date.now()}`, ...data }; },
  async updateWorker(id: string, data: any): Promise<any> { return { id, ...data }; },

  async getAssignment(id: string): Promise<any> { return { id }; },
  async listAssignments(): Promise<any[]> { return []; },
  async updateAssignment(id: string, data: any): Promise<any> { return { id, ...data }; },

  async getTimesheet(id: string): Promise<any> { return { id }; },
  async listTimesheets(): Promise<any[]> { return []; },
  async updateTimesheet(id: string, data: any): Promise<any> { return { id, ...data }; },

  async getPayroll(id: string): Promise<any> { return { id }; },
  async listPayroll(): Promise<any[]> { return []; },
  async updatePayroll(id: string, data: any): Promise<any> { return { id, ...data }; },

  async getInvoice(id: string): Promise<any> { return { id }; },
  async listInvoices(): Promise<any[]> { return []; },
  async updateInvoice(id: string, data: any): Promise<any> { return { id, ...data }; },

  async getHallmark(id: string): Promise<any> { return { id }; },
  async verifyHallmark(hallmarkNumber: string): Promise<any> { return { verified: true }; },

  async getDeveloperContactMessages(): Promise<any[]> { return []; },
  async getDeveloperContactMessageById(id: string): Promise<any> { return { id }; },
  async updateDeveloperContactMessageStatus(id: string, status: string): Promise<any> { return { id, status }; },

  async listCompaniesByRole(): Promise<any[]> { return []; },
  async toggleCompanyVisibility(): Promise<any> { return {}; },
  async updateCompanyOwnerAdmin(): Promise<any> { return {}; },

  async recordPasswordReset(): Promise<any> { return {}; },
  async getPasswordResetHistory(): Promise<any[]> { return []; },

  async getEmployeePreApplication(id: string): Promise<any> { return { id }; },
  async getEmployeePreApplicationsByEmail(email: string): Promise<any[]> { return []; },
  async listEmployeePreApplications(): Promise<any[]> { return []; },
  async updateEmployeePreApplication(id: string, data: any): Promise<any> { return { id, ...data }; },

  async getHourTracking(workerId: string): Promise<any> { return { workerId }; },
  async createHourTracking(data: any): Promise<any> { return { id: `ht-${Date.now()}`, ...data }; },
  async updateHourTracking(workerId: string, data: any): Promise<any> { return { workerId, ...data }; },

  async createTimecardApproval(data: any): Promise<any> { return { id: `ta-${Date.now()}`, ...data }; },
  async getTimecardApproval(id: string): Promise<any> { return { id }; },
  async updateTimecardApprovalStatus(id: string, status: string): Promise<any> { return { id, status }; },

  async listRegistryWorkers(): Promise<any[]> { return []; },
  async getRegistryWorkerByEmployee(employeeId: string): Promise<any> { return undefined; },
  async updateRegistryWorkerStatus(id: string, data: any): Promise<any> { return { id, ...data }; },

  async createIncidentReport(data: any): Promise<any> { return { id: `incident-${Date.now()}`, ...data }; },
  async getIncidentReport(id: string): Promise<any> { return { id }; },
  async listIncidentReports(): Promise<any[]> { return []; },
  async updateIncidentReportStatus(id: string, status: string): Promise<any> { return { id, status }; },

  async createReferralBonus(data: any): Promise<any> { return { id: `ref-${Date.now()}`, ...data }; },
  async getReferralBonusesByReferrer(workerId: string): Promise<any[]> { return []; },

  async getFeatureFlag(key: string): Promise<any> { return null; },
  async getAllFeatureFlags(): Promise<any[]> { return []; },
  async updateFeatureFlag(key: string, updates: any): Promise<any> { return { key, ...updates }; },

  async createSmsQueue(data: any): Promise<any> { return { id: `sms-${Date.now()}`, ...data }; },
  async getPendingSmsMessages(limit: number): Promise<any[]> { return []; },
  async updateSmsMessageStatus(id: string, status: string, sentAt: Date): Promise<any> { return { id, status }; },

  async createSmsTemplate(data: any): Promise<any> { return { id: `tmpl-${Date.now()}`, ...data }; },
  async getSmsTemplateById(id: string): Promise<any> { return { id }; },
  async getSmsTemplateByName(name: string): Promise<any> { return null; },
  async getEnabledSmsTemplates(): Promise<any[]> { return []; },
  async updateSmsTemplate(id: string, data: any): Promise<any> { return { id, ...data }; },

  async getWorkerSmsConsent(workerId: string): Promise<any> { return { workerId }; },
  async createWorkerSmsConsent(data: any): Promise<any> { return { id: `sms-consent-${Date.now()}`, ...data }; },
  async updateWorkerSmsConsent(workerId: string, data: any): Promise<any> { return { workerId, ...data }; },

  async createSkillVerification(data: any): Promise<any> { return { id: `skill-${Date.now()}`, ...data }; },
  async getWorkerSkillVerifications(workerId: string): Promise<any[]> { return []; },
  async approveSkillVerification(skillId: string, verifiedBy: string): Promise<any> { return { id: skillId, verified: true }; },
  async disputeSkillVerification(qaId: string, reason: string): Promise<any> { return { id: qaId, disputed: true }; },

  async createQualityAssurance(data: any): Promise<any> { return { id: `qa-${Date.now()}`, ...data }; },
  async getAssignmentQualityAssurance(assignmentId: string): Promise<any> { return { assignmentId }; },
  async approveQualityAssurance(qaId: string, verifiedBy: string): Promise<any> { return { id: qaId, approved: true }; },

  async createInstantPayRequest(data: any): Promise<any> { return { id: `pay-${Date.now()}`, ...data }; },
  async getInstantPayRequest(id: string): Promise<any> { return { id }; },
  async updateInstantPayRequestStatus(id: string, status: string): Promise<any> { return { id, status }; },
  async getInstantPayRequestsByWorker(workerId: string): Promise<any[]> { return []; },

  // ========================
  // Worker Insurance
  // ========================
  async createWorkerInsurance(data: InsertWorkerInsurance): Promise<WorkerInsurance> {
    const result = await db.insert(workerInsurance).values(data).returning();
    return result[0];
  },

  async getWorkerInsurance(id: string, tenantId: string): Promise<WorkerInsurance | undefined> {
    const result = await db.select().from(workerInsurance).where(
      and(
        eq(workerInsurance.id, id),
        eq(workerInsurance.tenantId, tenantId)
      )
    );
    return result[0];
  },

  async getWorkerInsuranceByWorkerId(workerId: string, tenantId: string): Promise<WorkerInsurance | undefined> {
    const result = await db.select().from(workerInsurance).where(
      and(
        eq(workerInsurance.workerId, workerId),
        eq(workerInsurance.tenantId, tenantId)
      )
    );
    return result[0];
  },

  async listWorkerInsurance(tenantId: string): Promise<WorkerInsurance[]> {
    return await db.select().from(workerInsurance).where(eq(workerInsurance.tenantId, tenantId));
  },

  async listExpiringWorkerInsurance(tenantId: string, daysFromNow: number): Promise<WorkerInsurance[]> {
    if (!Number.isFinite(daysFromNow) || daysFromNow < 0) {
      throw new Error('Invalid daysFromNow');
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysFromNow);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    return await db.select().from(workerInsurance).where(
      and(
        eq(workerInsurance.tenantId, tenantId),
        lte(workerInsurance.workersCompExpiryDate, cutoffDateStr)
      )
    );
  },

  async updateWorkerInsurance(id: string, tenantId: string, data: Partial<InsertWorkerInsurance>): Promise<WorkerInsurance | undefined> {
    const result = await db.update(workerInsurance).set(data).where(
      and(
        eq(workerInsurance.id, id),
        eq(workerInsurance.tenantId, tenantId)
      )
    ).returning();
    return result[0];
  },

  async deleteWorkerInsurance(id: string, tenantId: string): Promise<void> {
    await db.delete(workerInsurance).where(
      and(
        eq(workerInsurance.id, id),
        eq(workerInsurance.tenantId, tenantId)
      )
    );
  },

  // ========================
  // Company Insurance
  // ========================
  async createCompanyInsurance(data: InsertCompanyInsurance): Promise<CompanyInsurance> {
    const result = await db.insert(companyInsurance).values(data).returning();
    return result[0];
  },

  async getCompanyInsurance(id: string, tenantId: string): Promise<CompanyInsurance | undefined> {
    const result = await db.select().from(companyInsurance).where(
      and(
        eq(companyInsurance.id, id),
        eq(companyInsurance.tenantId, tenantId)
      )
    );
    return result[0];
  },

  async listCompanyInsurance(companyId: string, tenantId: string): Promise<CompanyInsurance[]> {
    return await db.select().from(companyInsurance).where(
      and(
        eq(companyInsurance.companyId, companyId),
        eq(companyInsurance.tenantId, tenantId)
      )
    ).orderBy(desc(companyInsurance.createdAt));
  },

  async listCompanyInsuranceByType(companyId: string, tenantId: string, insuranceType: string): Promise<CompanyInsurance[]> {
    return await db.select().from(companyInsurance).where(
      and(
        eq(companyInsurance.companyId, companyId),
        eq(companyInsurance.tenantId, tenantId),
        eq(companyInsurance.insuranceType, insuranceType)
      )
    );
  },

  async listExpiringCompanyInsurance(tenantId: string, daysFromNow: number): Promise<CompanyInsurance[]> {
    if (!Number.isFinite(daysFromNow) || daysFromNow < 0) {
      throw new Error('Invalid daysFromNow');
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysFromNow);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    return await db.select().from(companyInsurance).where(
      and(
        eq(companyInsurance.tenantId, tenantId),
        lte(companyInsurance.expiryDate, cutoffDateStr)
      )
    );
  },

  async updateCompanyInsurance(id: string, tenantId: string, data: Partial<InsertCompanyInsurance>): Promise<CompanyInsurance | undefined> {
    const result = await db.update(companyInsurance).set(data).where(
      and(
        eq(companyInsurance.id, id),
        eq(companyInsurance.tenantId, tenantId)
      )
    ).returning();
    return result[0];
  },

  async deleteCompanyInsurance(id: string, tenantId: string): Promise<void> {
    await db.delete(companyInsurance).where(
      and(
        eq(companyInsurance.id, id),
        eq(companyInsurance.tenantId, tenantId)
      )
    );
  },

  // ========================
  // Insurance Documents
  // ========================
  async createInsuranceDocument(data: InsertInsuranceDocument): Promise<InsuranceDocument> {
    const result = await db.insert(insuranceDocuments).values(data).returning();
    return result[0];
  },

  async getInsuranceDocument(id: string, tenantId: string): Promise<InsuranceDocument | undefined> {
    const result = await db.select().from(insuranceDocuments).where(
      and(
        eq(insuranceDocuments.id, id),
        eq(insuranceDocuments.tenantId, tenantId)
      )
    );
    return result[0];
  },

  async listInsuranceDocuments(tenantId: string): Promise<InsuranceDocument[]> {
    return await db.select().from(insuranceDocuments).where(eq(insuranceDocuments.tenantId, tenantId)).orderBy(desc(insuranceDocuments.createdAt));
  },

  async listInsuranceDocumentsByWorker(workerId: string, tenantId: string): Promise<InsuranceDocument[]> {
    return await db.select().from(insuranceDocuments).where(
      and(
        eq(insuranceDocuments.workerId, workerId),
        eq(insuranceDocuments.tenantId, tenantId)
      )
    ).orderBy(desc(insuranceDocuments.createdAt));
  },

  async listInsuranceDocumentsByCompany(companyId: string, tenantId: string): Promise<InsuranceDocument[]> {
    return await db.select().from(insuranceDocuments).where(
      and(
        eq(insuranceDocuments.companyId, companyId),
        eq(insuranceDocuments.tenantId, tenantId)
      )
    ).orderBy(desc(insuranceDocuments.createdAt));
  },

  async listInsuranceDocumentsByType(tenantId: string, documentType: string): Promise<InsuranceDocument[]> {
    return await db.select().from(insuranceDocuments).where(
      and(
        eq(insuranceDocuments.tenantId, tenantId),
        eq(insuranceDocuments.documentType, documentType)
      )
    );
  },

  async getInsuranceDocumentByHallmark(hallmarkId: string, tenantId: string): Promise<InsuranceDocument | undefined> {
    const result = await db.select().from(insuranceDocuments).where(
      and(
        eq(insuranceDocuments.hallmarkId, hallmarkId),
        eq(insuranceDocuments.tenantId, tenantId)
      )
    );
    return result[0];
  },

  async updateInsuranceDocument(id: string, tenantId: string, data: Partial<InsertInsuranceDocument>): Promise<InsuranceDocument | undefined> {
    const result = await db.update(insuranceDocuments).set(data).where(
      and(
        eq(insuranceDocuments.id, id),
        eq(insuranceDocuments.tenantId, tenantId)
      )
    ).returning();
    return result[0];
  },

  async deleteInsuranceDocument(id: string, tenantId: string): Promise<void> {
    await db.delete(insuranceDocuments).where(
      and(
        eq(insuranceDocuments.id, id),
        eq(insuranceDocuments.tenantId, tenantId)
      )
    );
  },

  // ========================
  // Worker Requests
  // ========================
  async createWorkerRequest(data: InsertWorkerRequest): Promise<WorkerRequest> {
    const result = await db.insert(workerRequests).values(data).returning();
    return result[0];
  },

  async getWorkerRequest(id: string, tenantId: string): Promise<WorkerRequest | undefined> {
    const result = await db.select().from(workerRequests).where(
      and(
        eq(workerRequests.id, id),
        eq(workerRequests.tenantId, tenantId)
      )
    );
    return result[0];
  },

  async getWorkerRequestByNumber(requestNumber: string, tenantId: string): Promise<WorkerRequest | undefined> {
    const result = await db.select().from(workerRequests).where(
      and(
        eq(workerRequests.requestNumber, requestNumber),
        eq(workerRequests.tenantId, tenantId)
      )
    );
    return result[0];
  },

  async listWorkerRequests(tenantId: string): Promise<WorkerRequest[]> {
    return await db.select().from(workerRequests).where(eq(workerRequests.tenantId, tenantId)).orderBy(desc(workerRequests.createdAt));
  },

  async listWorkerRequestsByClient(clientId: string, tenantId: string): Promise<WorkerRequest[]> {
    return await db.select().from(workerRequests).where(
      and(
        eq(workerRequests.clientId, clientId),
        eq(workerRequests.tenantId, tenantId)
      )
    ).orderBy(desc(workerRequests.createdAt));
  },

  async listWorkerRequestsByStatus(tenantId: string, status: string): Promise<WorkerRequest[]> {
    return await db.select().from(workerRequests).where(
      and(
        eq(workerRequests.tenantId, tenantId),
        eq(workerRequests.status, status)
      )
    ).orderBy(desc(workerRequests.priority), desc(workerRequests.createdAt));
  },

  async listPendingWorkerRequests(tenantId: string): Promise<WorkerRequest[]> {
    return await db.select().from(workerRequests).where(
      and(
        eq(workerRequests.tenantId, tenantId),
        eq(workerRequests.status, 'pending')
      )
    ).orderBy(desc(workerRequests.urgent), desc(workerRequests.priority), desc(workerRequests.createdAt));
  },

  async updateWorkerRequest(id: string, tenantId: string, data: Partial<InsertWorkerRequest>): Promise<WorkerRequest | undefined> {
    const result = await db.update(workerRequests).set(data).where(
      and(
        eq(workerRequests.id, id),
        eq(workerRequests.tenantId, tenantId)
      )
    ).returning();
    return result[0];
  },

  async deleteWorkerRequest(id: string, tenantId: string): Promise<void> {
    await db.delete(workerRequests).where(
      and(
        eq(workerRequests.id, id),
        eq(workerRequests.tenantId, tenantId)
      )
    );
  },

  // ========================
  // Worker Request Matches
  // ========================
  async createWorkerRequestMatch(data: InsertWorkerRequestMatch): Promise<WorkerRequestMatch> {
    const result = await db.insert(workerRequestMatches).values(data).returning();
    return result[0];
  },

  async createWorkerRequestMatches(matches: InsertWorkerRequestMatch[]): Promise<WorkerRequestMatch[]> {
    const result = await db.insert(workerRequestMatches).values(matches).returning();
    return result;
  },

  async getWorkerRequestMatch(id: string, tenantId: string): Promise<WorkerRequestMatch | undefined> {
    const result = await db.select().from(workerRequestMatches).where(
      and(
        eq(workerRequestMatches.id, id),
        eq(workerRequestMatches.tenantId, tenantId)
      )
    );
    return result[0];
  },

  async listWorkerRequestMatches(requestId: string, tenantId: string): Promise<WorkerRequestMatch[]> {
    return await db.select().from(workerRequestMatches).where(
      and(
        eq(workerRequestMatches.requestId, requestId),
        eq(workerRequestMatches.tenantId, tenantId)
      )
    ).orderBy(desc(workerRequestMatches.matchScore));
  },

  async listWorkerRequestMatchesByStatus(requestId: string, tenantId: string, matchStatus: string): Promise<WorkerRequestMatch[]> {
    return await db.select().from(workerRequestMatches).where(
      and(
        eq(workerRequestMatches.requestId, requestId),
        eq(workerRequestMatches.tenantId, tenantId),
        eq(workerRequestMatches.matchStatus, matchStatus)
      )
    ).orderBy(desc(workerRequestMatches.matchScore));
  },

  async updateWorkerRequestMatch(id: string, tenantId: string, data: Partial<InsertWorkerRequestMatch>): Promise<WorkerRequestMatch | undefined> {
    const result = await db.update(workerRequestMatches).set(data).where(
      and(
        eq(workerRequestMatches.id, id),
        eq(workerRequestMatches.tenantId, tenantId)
      )
    ).returning();
    return result[0];
  },

  async deleteWorkerRequestMatch(id: string, tenantId: string): Promise<void> {
    await db.delete(workerRequestMatches).where(
      and(
        eq(workerRequestMatches.id, id),
        eq(workerRequestMatches.tenantId, tenantId)
      )
    );
  },

  async deleteWorkerRequestMatches(requestId: string, tenantId: string): Promise<void> {
    await db.delete(workerRequestMatches).where(
      and(
        eq(workerRequestMatches.requestId, requestId),
        eq(workerRequestMatches.tenantId, tenantId)
      )
    );
  },

  // ========================
  // Employee W-4 Data
  // ========================
  async createEmployeeW4Data(data: InsertEmployeeW4Data): Promise<EmployeeW4Data> {
    const result = await db.insert(employeeW4Data).values(data).returning();
    return result[0];
  },

  async getEmployeeW4Data(id: string, tenantId: string): Promise<EmployeeW4Data | undefined> {
    const result = await db.select().from(employeeW4Data).where(
      and(
        eq(employeeW4Data.id, id),
        eq(employeeW4Data.tenantId, tenantId)
      )
    );
    return result[0];
  },

  async getCurrentEmployeeW4Data(workerId: string, tenantId: string): Promise<EmployeeW4Data | undefined> {
    const result = await db.select().from(employeeW4Data).where(
      and(
        eq(employeeW4Data.workerId, workerId),
        eq(employeeW4Data.tenantId, tenantId),
        eq(employeeW4Data.isCurrentW4, true)
      )
    ).orderBy(desc(employeeW4Data.createdAt));
    return result[0];
  },

  async listEmployeeW4Data(workerId: string, tenantId: string): Promise<EmployeeW4Data[]> {
    return await db.select().from(employeeW4Data).where(
      and(
        eq(employeeW4Data.workerId, workerId),
        eq(employeeW4Data.tenantId, tenantId)
      )
    ).orderBy(desc(employeeW4Data.createdAt));
  },

  async updateEmployeeW4Data(id: string, tenantId: string, data: Partial<InsertEmployeeW4Data>): Promise<EmployeeW4Data | undefined> {
    const result = await db.update(employeeW4Data).set(data).where(
      and(
        eq(employeeW4Data.id, id),
        eq(employeeW4Data.tenantId, tenantId)
      )
    ).returning();
    return result[0];
  },

  // ========================
  // Garnishment Orders
  // ========================
  async createGarnishmentOrder(data: InsertGarnishmentOrder): Promise<GarnishmentOrder> {
    const result = await db.insert(garnishmentOrders).values(data).returning();
    return result[0];
  },

  async getGarnishmentOrder(id: string, tenantId: string): Promise<GarnishmentOrder | undefined> {
    const result = await db.select().from(garnishmentOrders).where(
      and(
        eq(garnishmentOrders.id, id),
        eq(garnishmentOrders.tenantId, tenantId)
      )
    );
    return result[0];
  },

  async listGarnishmentOrders(employeeId: string, tenantId: string): Promise<GarnishmentOrder[]> {
    return await db.select().from(garnishmentOrders).where(
      and(
        eq(garnishmentOrders.employeeId, employeeId),
        eq(garnishmentOrders.tenantId, tenantId)
      )
    ).orderBy(garnishmentOrders.priority);
  },

  async listActiveGarnishmentOrders(employeeId: string, tenantId: string): Promise<GarnishmentOrder[]> {
    return await db.select().from(garnishmentOrders).where(
      and(
        eq(garnishmentOrders.employeeId, employeeId),
        eq(garnishmentOrders.tenantId, tenantId),
        eq(garnishmentOrders.status, "active")
      )
    ).orderBy(garnishmentOrders.priority);
  },

  async updateGarnishmentOrder(id: string, tenantId: string, data: Partial<InsertGarnishmentOrder>): Promise<GarnishmentOrder | undefined> {
    const result = await db.update(garnishmentOrders).set(data).where(
      and(
        eq(garnishmentOrders.id, id),
        eq(garnishmentOrders.tenantId, tenantId)
      )
    ).returning();
    return result[0];
  },

  async deleteGarnishmentOrder(id: string, tenantId: string): Promise<void> {
    await db.delete(garnishmentOrders).where(
      and(
        eq(garnishmentOrders.id, id),
        eq(garnishmentOrders.tenantId, tenantId)
      )
    );
  },

  // ========================
  // Payroll Records
  // ========================
  async createPayrollRecord(data: InsertPayrollRecord): Promise<PayrollRecord> {
    const result = await db.insert(payrollRecords).values(data).returning();
    return result[0];
  },

  async getPayrollRecord(id: string, tenantId: string): Promise<PayrollRecord | undefined> {
    const result = await db.select().from(payrollRecords).where(
      and(
        eq(payrollRecords.id, id),
        eq(payrollRecords.tenantId, tenantId)
      )
    );
    return result[0];
  },

  async listPayrollRecords(employeeId: string, tenantId: string): Promise<PayrollRecord[]> {
    return await db.select().from(payrollRecords).where(
      and(
        eq(payrollRecords.employeeId, employeeId),
        eq(payrollRecords.tenantId, tenantId)
      )
    ).orderBy(desc(payrollRecords.payPeriodStart));
  },

  async listPayrollRecordsByPeriod(
    employeeId: string,
    tenantId: string,
    startDate: string,
    endDate: string
  ): Promise<PayrollRecord[]> {
    return await db.select().from(payrollRecords).where(
      and(
        eq(payrollRecords.employeeId, employeeId),
        eq(payrollRecords.tenantId, tenantId),
        gte(payrollRecords.payPeriodStart, startDate),
        lte(payrollRecords.payPeriodEnd, endDate)
      )
    ).orderBy(desc(payrollRecords.payPeriodStart));
  },

  async updatePayrollRecord(id: string, tenantId: string, data: Partial<InsertPayrollRecord>): Promise<PayrollRecord | undefined> {
    const result = await db.update(payrollRecords).set(data).where(
      and(
        eq(payrollRecords.id, id),
        eq(payrollRecords.tenantId, tenantId)
      )
    ).returning();
    return result[0];
  },

  // ========================
  // Garnishment Payments
  // ========================
  async createGarnishmentPayment(data: InsertGarnishmentPayment): Promise<GarnishmentPayment> {
    const result = await db.insert(garnishmentPayments).values(data).returning();
    return result[0];
  },

  async getGarnishmentPayment(id: string, tenantId: string): Promise<GarnishmentPayment | undefined> {
    const result = await db.select().from(garnishmentPayments).where(
      and(
        eq(garnishmentPayments.id, id),
        eq(garnishmentPayments.tenantId, tenantId)
      )
    );
    return result[0];
  },

  async listGarnishmentPayments(payrollRecordId: string, tenantId: string): Promise<GarnishmentPayment[]> {
    return await db.select().from(garnishmentPayments).where(
      and(
        eq(garnishmentPayments.payrollRecordId, payrollRecordId),
        eq(garnishmentPayments.tenantId, tenantId)
      )
    ).orderBy(desc(garnishmentPayments.createdAt));
  },

  async listGarnishmentPaymentsByOrder(garnishmentOrderId: string, tenantId: string): Promise<GarnishmentPayment[]> {
    return await db.select().from(garnishmentPayments).where(
      and(
        eq(garnishmentPayments.garnishmentOrderId, garnishmentOrderId),
        eq(garnishmentPayments.tenantId, tenantId)
      )
    ).orderBy(desc(garnishmentPayments.paymentDate));
  },

  async updateGarnishmentPayment(id: string, tenantId: string, data: Partial<InsertGarnishmentPayment>): Promise<GarnishmentPayment | undefined> {
    const result = await db.update(garnishmentPayments).set(data).where(
      and(
        eq(garnishmentPayments.id, id),
        eq(garnishmentPayments.tenantId, tenantId)
      )
    ).returning();
    return result[0];
  },

  // ========================
  // Paystub PDF Management
  // ========================
  async updatePaystubPdf(
    payrollRecordId: string,
    tenantId: string,
    data: {
      paystubPdfUrl: string;
      paystubFileName: string;
      hallmarkAssetNumber: string;
      qrCodeUrl: string;
    }
  ): Promise<PayrollRecord | undefined> {
    const result = await db.update(payrollRecords).set(data).where(
      and(
        eq(payrollRecords.id, payrollRecordId),
        eq(payrollRecords.tenantId, tenantId)
      )
    ).returning();
    return result[0];
  },

  async listPaystubsForEmployee(
    employeeId: string,
    tenantId: string,
    startDate?: string,
    endDate?: string
  ): Promise<PayrollRecord[]> {
    let query = db.select().from(payrollRecords).where(
      and(
        eq(payrollRecords.employeeId, employeeId),
        eq(payrollRecords.tenantId, tenantId)
      )
    );

    if (startDate) {
      query = query.where(gte(payrollRecords.payPeriodStart, startDate));
    }

    if (endDate) {
      query = query.where(lte(payrollRecords.payPeriodEnd, endDate));
    }

    return query.orderBy(desc(payrollRecords.payPeriodEnd));
  },

  // ========================
  // Stripe Payment Integration
  // ========================
  async updatePaymentStatus(
    payrollRecordId: string,
    tenantId: string,
    data: {
      stripePaymentId?: string;
      paymentStatus: "pending" | "completed" | "failed";
    }
  ): Promise<PayrollRecord | undefined> {
    const result = await db.update(payrollRecords).set(data).where(
      and(
        eq(payrollRecords.id, payrollRecordId),
        eq(payrollRecords.tenantId, tenantId)
      )
    ).returning();
    return result[0];
  },

  async updateGarnishmentPaymentStatus(
    paymentId: string,
    tenantId: string,
    status: "pending" | "sent" | "confirmed" | "failed",
    stripeReference?: string
  ): Promise<GarnishmentPayment | undefined> {
    const updateData: any = { status };

    if (status === "sent") {
      updateData.sentAt = new Date();
    } else if (status === "confirmed") {
      updateData.confirmedAt = new Date();
      if (stripeReference) {
        updateData.wireReference = stripeReference;
      }
    }

    const result = await db.update(garnishmentPayments).set(updateData).where(
      and(
        eq(garnishmentPayments.id, paymentId),
        eq(garnishmentPayments.tenantId, tenantId)
      )
    ).returning();
    return result[0];
  },
};

export default storage;
