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
  garnishmentDocuments,
  backgroundChecks,
  drugTests,
  complianceChecks,
  integrationTokens,
  syncLogs,
  syncedData,
  clients,
  csaTemplates,
  workerReferralBonuses,
  rateConfirmations,
  billingConfirmations,
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
  type GarnishmentDocument,
  type InsertGarnishmentDocument,
  type BackgroundCheck,
  type InsertBackgroundCheck,
  type DrugTest,
  type InsertDrugTest,
  type ComplianceCheck,
  type InsertComplianceCheck,
  type IntegrationToken,
  type InsertIntegrationToken,
  type SyncLog,
  type InsertSyncLog,
  type SyncedData,
  type InsertSyncedData,
  type Client,
  type InsertClient,
  type CSATemplate,
  type InsertCSATemplate,
  type WorkerReferralBonus,
  type InsertWorkerReferralBonus,
  type RateConfirmation,
  type InsertRateConfirmation,
  type BillingConfirmation,
  type InsertBillingConfirmation,
} from "@shared/schema";

export interface IStorage {
  [key: string]: any;
}

export const storage: IStorage = {
  // ========================
  // OAUTH INTEGRATION TOKENS
  // ========================
  async storeIntegrationToken(token: InsertIntegrationToken) {
    const result = await db.insert(integrationTokens).values(token).returning();
    return result[0];
  },

  async getIntegrationToken(tenantId: string, integrationType: string) {
    const result = await db
      .select()
      .from(integrationTokens)
      .where(
        and(
          eq(integrationTokens.tenantId, tenantId),
          eq(integrationTokens.integrationType, integrationType)
        )
      )
      .limit(1);
    return result[0] || null;
  },

  async updateIntegrationToken(id: string, updates: Partial<InsertIntegrationToken>) {
    const result = await db
      .update(integrationTokens)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(integrationTokens.id, id))
      .returning();
    return result[0];
  },

  async deleteIntegrationToken(id: string) {
    await db.delete(integrationTokens).where(eq(integrationTokens.id, id));
  },

  async getAllIntegrationTokens() {
    return await db
      .select()
      .from(integrationTokens)
      .orderBy(desc(integrationTokens.connectedAt));
  },

  // ========================
  // SYNC TRACKING
  // ========================
  async createSyncLog(log: InsertSyncLog): Promise<SyncLog> {
    const result = await db.insert(syncLogs).values(log).returning();
    return result[0];
  },

  async getSyncLogs(tenantId: string, limit: number = 20): Promise<SyncLog[]> {
    return await db
      .select()
      .from(syncLogs)
      .where(eq(syncLogs.tenantId, tenantId))
      .orderBy(desc(syncLogs.createdAt))
      .limit(limit);
  },

  async updateSyncLog(id: string, updates: Partial<InsertSyncLog>): Promise<SyncLog> {
    const result = await db
      .update(syncLogs)
      .set(updates)
      .where(eq(syncLogs.id, id))
      .returning();
    return result[0];
  },

  async storeSyncedData(data: InsertSyncedData): Promise<SyncedData> {
    const result = await db.insert(syncedData).values(data).returning();
    return result[0];
  },

  async updateSyncedData(id: string, updates: Partial<InsertSyncedData>): Promise<SyncedData> {
    const result = await db
      .update(syncedData)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(syncedData.id, id))
      .returning();
    return result[0];
  },

  async getSyncedData(
    tenantId: string,
    integrationType: string,
    entityType: string
  ): Promise<SyncedData[]> {
    return await db
      .select()
      .from(syncedData)
      .where(
        and(
          eq(syncedData.tenantId, tenantId),
          eq(syncedData.integrationType, integrationType),
          eq(syncedData.entityType, entityType)
        )
      )
      .orderBy(desc(syncedData.syncedAt));
  },

  async getSyncedDataByExternalId(
    tenantId: string,
    integrationType: string,
    entityType: string,
    externalId: string
  ): Promise<SyncedData | null> {
    const result = await db
      .select()
      .from(syncedData)
      .where(
        and(
          eq(syncedData.tenantId, tenantId),
          eq(syncedData.integrationType, integrationType),
          eq(syncedData.entityType, entityType),
          eq(syncedData.externalId, externalId)
        )
      )
      .limit(1);
    return result[0] || null;
  },

  // ========================
  // USERS
  // ========================
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
  
  /**
   * Get all active tenants (companies) for background job processing
   */
  async getAllActiveTenants(): Promise<{id: string, name: string}[]> {
    const result = await db.select({
      id: companies.id,
      name: companies.name
    })
      .from(companies);
    
    return result;
  },

  /**
   * Get tenant payroll automation settings
   */
  async getTenantPayrollSettings(tenantId: string): Promise<any> {
    const result = await db.select({
      frequency: companies.payrollFrequency,
      payDay: companies.payrollDay,
      autoRun: companies.autoRunPayroll,
    })
      .from(companies)
      .where(eq(companies.id, tenantId))
      .limit(1);
    
    return result[0] || null;
  },

  /**
   * Get worker time entries for a date range (approved only)
   */
  async getWorkerTimeEntries(
    workerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    const result = await db.select({
      id: timesheets.id,
      workerId: timesheets.workerId,
      clockIn: timesheets.clockInTime,
      clockOut: timesheets.clockOutTime,
      totalHours: timesheets.totalHoursWorked,
      approvedAt: timesheets.approvedAt,
      status: timesheets.status,
    })
      .from(timesheets)
      .where(
        and(
          eq(timesheets.workerId, workerId),
          gte(timesheets.clockInTime, startDate),
          lte(timesheets.clockInTime, endDate),
          eq(timesheets.status, 'approved')
        )
      );
    
    return result;
  },

  async getWorker(id: string): Promise<Worker | undefined> {
    const result = await db.select().from(workers).where(eq(workers.id, id));
    return result[0];
  },
  
  async listWorkers(): Promise<Worker[]> {
    return await db.select().from(workers).orderBy(desc(workers.createdAt));
  },
  
  async createWorker(data: InsertWorker): Promise<Worker> {
    const result = await db.insert(workers).values(data).returning();
    return result[0];
  },
  
  async updateWorker(id: string, data: Partial<InsertWorker>): Promise<Worker | undefined> {
    const result = await db.update(workers).set({...data, updatedAt: new Date()}).where(eq(workers.id, id)).returning();
    return result[0];
  },

  /**
   * Get eligible workers for matching with worker requests
   * Filters by tenant, approved status, and optional criteria
   */
  async getEligibleWorkers(tenantId: string, criteria?: {
    skills?: any[];
    startDate?: string;
    requiresInsurance?: boolean;
  }): Promise<Worker[]> {
    const conditions = [
      eq(workers.tenantId, tenantId),
      eq(workers.status, 'approved'),
      eq(workers.onboardingCompleted, true)
    ];
    
    const result = await db.select().from(workers).where(and(...conditions));
    
    return result;
  },

  /**
   * Create in-app notification (placeholder - logs to console for now)
   */
  async createNotification(notification: {
    userId?: string;
    type: string;
    title: string;
    message: string;
    relatedId?: string;
  }): Promise<any> {
    console.log('[Notification] Created:', {
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message.substring(0, 100),
      relatedId: notification.relatedId
    });
    return { id: `notif-${Date.now()}`, ...notification, createdAt: new Date() };
  },

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

  // ========================
  // Worker Application & Referral System
  // ========================
  
  async createWorkerApplication(data: InsertWorker): Promise<Worker> {
    const now = new Date();
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    
    const applicationData = {
      ...data,
      status: "pending_review",
      applicationStartedDate: now,
      applicationDeadline: threeDaysLater,
      signatureDate: now,
    };
    
    const result = await db.insert(workers).values(applicationData).returning();
    return result[0];
  },
  
  async updateWorkerStatus(workerId: string, status: string): Promise<Worker | undefined> {
    const updates: any = { status, updatedAt: new Date() };
    
    if (status === "approved") {
      updates.onboardingCompleted = true;
      updates.onboardingCompletedDate = new Date();
    }
    
    const result = await db.update(workers)
      .set(updates)
      .where(eq(workers.id, workerId))
      .returning();
    return result[0];
  },
  
  async getWorkerByPhone(phone: string): Promise<Worker | undefined> {
    const result = await db.select().from(workers).where(eq(workers.phone, phone)).limit(1);
    return result[0];
  },
  
  async getWorkerByEmployeeNumber(employeeNumber: string): Promise<Worker | undefined> {
    const result = await db.select().from(workers).where(eq(workers.employeeNumber, employeeNumber)).limit(1);
    return result[0];
  },
  
  async createReferralBonus(referrerId: string, referredWorkerId: string, tenantId: string): Promise<WorkerReferralBonus> {
    const data: InsertWorkerReferralBonus = {
      tenantId,
      referrerId,
      referredWorkerId,
      bonusAmount: "100.00",
      bonusStatus: "pending",
      hoursWorkedByReferred: "0",
      minimumHoursRequired: "40.00",
      eligibilityMet: false,
    };
    
    const result = await db.insert(workerReferralBonuses).values(data).returning();
    return result[0];
  },
  
  async updateReferralBonusHours(referredWorkerId: string, hours: number): Promise<void> {
    const referralBonuses = await db.select()
      .from(workerReferralBonuses)
      .where(
        and(
          eq(workerReferralBonuses.referredWorkerId, referredWorkerId),
          eq(workerReferralBonuses.bonusStatus, "pending")
        )
      );
    
    for (const bonus of referralBonuses) {
      const totalHours = parseFloat(bonus.hoursWorkedByReferred || "0") + hours;
      const minimumHours = parseFloat(bonus.minimumHoursRequired || "40");
      
      const updates: any = {
        hoursWorkedByReferred: totalHours.toString(),
        updatedAt: new Date(),
      };
      
      if (totalHours >= minimumHours && !bonus.eligibilityMet) {
        updates.eligibilityMet = true;
        updates.bonusStatus = "earned";
        updates.bonusEarnedDate = new Date();
      }
      
      await db.update(workerReferralBonuses)
        .set(updates)
        .where(eq(workerReferralBonuses.id, bonus.id));
    }
  },
  
  async getWorkerReferrals(workerId: string): Promise<WorkerReferralBonus[]> {
    return await db.select()
      .from(workerReferralBonuses)
      .where(eq(workerReferralBonuses.referrerId, workerId))
      .orderBy(desc(workerReferralBonuses.createdAt));
  },
  
  async markReferralBonusPaid(bonusId: string, payrollCycleId?: string): Promise<WorkerReferralBonus | undefined> {
    const result = await db.update(workerReferralBonuses)
      .set({
        bonusStatus: "paid",
        bonusPaidDate: new Date(),
        payrollCycleId: payrollCycleId || null,
        updatedAt: new Date(),
      })
      .where(eq(workerReferralBonuses.id, bonusId))
      .returning();
    return result[0];
  },
  
  async getReferralBonusesByReferrer(workerId: string): Promise<WorkerReferralBonus[]> {
    return await this.getWorkerReferrals(workerId);
  },
  
  async getTotalReferralEarnings(workerId: string): Promise<{ total: number; earned: number; paid: number }> {
    const referrals = await this.getWorkerReferrals(workerId);
    
    let total = 0;
    let earned = 0;
    let paid = 0;
    
    for (const referral of referrals) {
      const amount = parseFloat(referral.bonusAmount || "0");
      total += amount;
      
      if (referral.bonusStatus === "earned") {
        earned += amount;
      } else if (referral.bonusStatus === "paid") {
        paid += amount;
      }
    }
    
    return { total, earned, paid };
  },
  
  // ========================
  // PUBLIC REFERRALS
  // ========================
  async createPublicReferral(referrerInfo: {
    name: string;
    phone: string;
    email: string;
    paymentMethod: string;
    paymentDetails: string;
  }, workerInfo: {
    name: string;
    phone: string;
    email?: string;
    relationship: string;
    notes?: string;
  }, tenantId: string): Promise<WorkerReferralBonus> {
    const data: InsertWorkerReferralBonus = {
      tenantId,
      referrerType: "public",
      publicReferrerName: referrerInfo.name,
      publicReferrerPhone: referrerInfo.phone,
      publicReferrerEmail: referrerInfo.email,
      paymentMethod: referrerInfo.paymentMethod,
      paymentDetails: referrerInfo.paymentDetails,
      paymentStatus: "pending",
      referredWorkerName: workerInfo.name,
      referredWorkerPhone: workerInfo.phone,
      referredWorkerEmail: workerInfo.email || null,
      relationship: workerInfo.relationship,
      notes: workerInfo.notes || null,
      bonusAmount: "50.00", // $50 for public referrals
      bonusStatus: "pending",
      hoursWorkedByReferred: "0",
      minimumHoursRequired: "80.00", // 80 hours (2 weeks) for public referrals
      eligibilityMet: false,
    };
    
    const result = await db.insert(workerReferralBonuses).values(data).returning();
    return result[0];
  },
  
  async getPublicReferralByPhone(workerPhone: string): Promise<WorkerReferralBonus | null> {
    const result = await db.select()
      .from(workerReferralBonuses)
      .where(
        and(
          eq(workerReferralBonuses.referrerType, "public"),
          eq(workerReferralBonuses.referredWorkerPhone, workerPhone),
          sql`${workerReferralBonuses.referredWorkerId} IS NULL` // Not yet linked to a worker
        )
      )
      .limit(1);
    return result[0] || null;
  },
  
  async linkWorkerToPublicReferral(workerId: string, referralId: string): Promise<WorkerReferralBonus | undefined> {
    const result = await db.update(workerReferralBonuses)
      .set({
        referredWorkerId: workerId,
        workerAppliedDate: new Date(),
        bonusStatus: "pending", // Will be updated to worker_approved when approved
        updatedAt: new Date(),
      })
      .where(eq(workerReferralBonuses.id, referralId))
      .returning();
    return result[0];
  },
  
  async updatePublicReferralOnWorkerApproval(workerId: string): Promise<void> {
    await db.update(workerReferralBonuses)
      .set({
        bonusStatus: "worker_approved",
        workerApprovedDate: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workerReferralBonuses.referredWorkerId, workerId),
          eq(workerReferralBonuses.referrerType, "public")
        )
      );
  },
  
  async getPublicReferralStatus(referralId: string): Promise<WorkerReferralBonus | null> {
    const result = await db.select()
      .from(workerReferralBonuses)
      .where(eq(workerReferralBonuses.id, referralId))
      .limit(1);
    return result[0] || null;
  },
  
  // ========================
  // ONBOARDING DEADLINE ENFORCEMENT
  // ========================
  
  /**
   * Get workers with overdue application deadlines (3 business days)
   * Returns workers who:
   * 1. Have applicationDeadline set and it has passed
   * 2. Have NOT completed onboarding
   * 3. Have NOT been marked as timed out already
   */
  async getWorkersWithOverdueApplications(tenantId: string): Promise<Worker[]> {
    const now = new Date();
    
    const result = await db.select()
      .from(workers)
      .where(
        and(
          eq(workers.tenantId, tenantId),
          sql`${workers.applicationDeadline} IS NOT NULL`,
          sql`${workers.applicationDeadline} < ${now}`,
          eq(workers.onboardingCompleted, false),
          eq(workers.onboardingTimedOut, false)
        )
      );
    
    return result;
  },
  
  /**
   * Get workers with overdue assignment deadlines (1 business day)
   * Returns workers who:
   * 1. Have been assigned to a job (assignmentOnboardingDeadline set)
   * 2. The deadline has passed
   * 3. Have NOT completed onboarding
   * 4. Have NOT been marked as timed out
   */
  async getWorkersWithOverdueAssignments(tenantId: string): Promise<any[]> {
    const now = new Date();
    
    // Get workers with overdue assignment deadlines
    const overdueWorkers = await db.select()
      .from(workers)
      .where(
        and(
          eq(workers.tenantId, tenantId),
          sql`${workers.assignmentOnboardingDeadline} IS NOT NULL`,
          sql`${workers.assignmentOnboardingDeadline} < ${now}`,
          eq(workers.onboardingCompleted, false),
          eq(workers.onboardingTimedOut, false)
        )
      );
    
    // Get their pending assignments
    const assignments = [];
    for (const worker of overdueWorkers) {
      const matches = await db.select()
        .from(workerRequestMatches)
        .where(
          and(
            eq(workerRequestMatches.workerId, worker.id),
            eq(workerRequestMatches.matchStatus, 'assigned')
          )
        );
      
      for (const match of matches) {
        const request = await db.select()
          .from(workerRequests)
          .where(eq(workerRequests.id, match.requestId))
          .limit(1);
        
        if (request[0]) {
          assignments.push({
            workerId: worker.id,
            workerName: worker.fullName,
            requestId: match.requestId,
            requestNumber: request[0].requestNumber,
            matchId: match.id,
            clientId: request[0].clientId,
          });
        }
      }
    }
    
    return assignments;
  },
  
  /**
   * Mark a worker as onboarding timed out
   */
  async markWorkerOnboardingTimedOut(workerId: string): Promise<void> {
    await db.update(workers)
      .set({
        onboardingTimedOut: true,
        updatedAt: new Date(),
      })
      .where(eq(workers.id, workerId));
    
    console.log(`[Storage] Worker ${workerId} marked as onboarding timed out`);
  },
  
  /**
   * Mark an assignment as reassigned
   */
  async markAssignmentReassigned(requestId: string, workerId: string): Promise<void> {
    await db.update(workerRequestMatches)
      .set({
        matchStatus: 'reassigned',
        rejectionReason: 'Onboarding deadline exceeded - automatically reassigned',
      })
      .where(
        and(
          eq(workerRequestMatches.requestId, requestId),
          eq(workerRequestMatches.workerId, workerId)
        )
      );
    
    console.log(`[Storage] Assignment for request ${requestId} and worker ${workerId} marked as reassigned`);
  },
  
  /**
   * Get worker assignments (matches)
   */
  async getWorkerAssignments(workerId: string, status?: string): Promise<WorkerRequestMatch[]> {
    const conditions = [eq(workerRequestMatches.workerId, workerId)];
    
    if (status) {
      conditions.push(eq(workerRequestMatches.matchStatus, status));
    }
    
    const result = await db.select()
      .from(workerRequestMatches)
      .where(and(...conditions))
      .orderBy(desc(workerRequestMatches.createdAt));
    
    return result;
  },
  
  /**
   * Get a worker request by ID
   */
  async getWorkerRequest(requestId: string, tenantId?: string): Promise<WorkerRequest | null> {
    const conditions = [eq(workerRequests.id, requestId)];
    
    if (tenantId) {
      conditions.push(eq(workerRequests.tenantId, tenantId));
    }
    
    const result = await db.select()
      .from(workerRequests)
      .where(and(...conditions))
      .limit(1);
    
    return result[0] || null;
  },
  
  /**
   * Get all matches for a worker request
   */
  async getWorkerRequestMatches(requestId: string): Promise<WorkerRequestMatch[]> {
    const result = await db.select()
      .from(workerRequestMatches)
      .where(eq(workerRequestMatches.requestId, requestId))
      .orderBy(desc(workerRequestMatches.matchScore));
    
    return result;
  },
  
  /**
   * Assign a worker to a request
   * Sets assignment date and deadline for the worker
   */
  async assignWorkerToRequest(requestId: string, workerId: string): Promise<void> {
    const now = new Date();
    
    // Import business days calculator
    const { addBusinessDays } = await import('./lib/businessDays');
    const assignmentDeadline = addBusinessDays(now, 1); // 1 business day
    
    // Update the match status
    await db.update(workerRequestMatches)
      .set({
        matchStatus: 'assigned',
        assignedAt: now,
      })
      .where(
        and(
          eq(workerRequestMatches.requestId, requestId),
          eq(workerRequestMatches.workerId, workerId)
        )
      );
    
    // Update worker's assignment deadline
    await db.update(workers)
      .set({
        assignmentDate: now,
        assignmentOnboardingDeadline: assignmentDeadline,
        updatedAt: now,
      })
      .where(eq(workers.id, workerId));
    
    console.log(`[Storage] Worker ${workerId} assigned to request ${requestId}, deadline: ${assignmentDeadline}`);
  },
  
  /**
   * Get workers approaching their onboarding deadlines (for warnings)
   */
  async getWorkersApproachingDeadline(tenantId: string, daysUntil: number = 1): Promise<any> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysUntil + 1); // Add 1 to include the target day
    
    // Application deadlines approaching
    const applicationDeadlines = await db.select()
      .from(workers)
      .where(
        and(
          eq(workers.tenantId, tenantId),
          sql`${workers.applicationDeadline} IS NOT NULL`,
          sql`${workers.applicationDeadline} > ${now}`,
          sql`${workers.applicationDeadline} < ${futureDate}`,
          eq(workers.onboardingCompleted, false),
          eq(workers.onboardingTimedOut, false)
        )
      );
    
    // Assignment deadlines approaching
    const assignmentDeadlines = await db.select()
      .from(workers)
      .where(
        and(
          eq(workers.tenantId, tenantId),
          sql`${workers.assignmentOnboardingDeadline} IS NOT NULL`,
          sql`${workers.assignmentOnboardingDeadline} > ${now}`,
          sql`${workers.assignmentOnboardingDeadline} < ${futureDate}`,
          eq(workers.onboardingCompleted, false),
          eq(workers.onboardingTimedOut, false)
        )
      );
    
    return {
      application: applicationDeadlines,
      assignment: assignmentDeadlines,
    };
  },
  
  /**
   * Get recent auto-reassignments (for admin dashboard)
   */
  async getRecentReassignments(hours: number = 24): Promise<any[]> {
    const since = new Date();
    since.setHours(since.getHours() - hours);
    
    const result = await db.select({
      match: workerRequestMatches,
      worker: workers,
      request: workerRequests,
    })
    .from(workerRequestMatches)
    .leftJoin(workers, eq(workerRequestMatches.workerId, workers.id))
    .leftJoin(workerRequests, eq(workerRequestMatches.requestId, workerRequests.id))
    .where(
      and(
        eq(workerRequestMatches.matchStatus, 'reassigned'),
        sql`${workerRequestMatches.rejectionReason} LIKE '%deadline%'`
      )
    )
    .orderBy(desc(workerRequestMatches.createdAt));
    
    return result;
  },
  
  async updatePublicReferralHours(workerId: string, totalHours: number): Promise<void> {
    const referralBonuses = await db.select()
      .from(workerReferralBonuses)
      .where(
        and(
          eq(workerReferralBonuses.referredWorkerId, workerId),
          eq(workerReferralBonuses.referrerType, "public"),
          eq(workerReferralBonuses.eligibilityMet, false)
        )
      );
    
    for (const bonus of referralBonuses) {
      const minimumRequired = parseFloat(bonus.minimumHoursRequired || "80");
      
      if (totalHours >= minimumRequired) {
        // Mark as earned!
        await db.update(workerReferralBonuses)
          .set({
            hoursWorkedByReferred: totalHours.toString(),
            eligibilityMet: true,
            bonusStatus: "earned",
            bonusEarnedDate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(workerReferralBonuses.id, bonus.id));
          
        // Send notification email (if emailService is available)
        try {
          if (bonus.publicReferrerEmail) {
            await emailService.sendEmail({
              to: bonus.publicReferrerEmail,
              subject: "🎉 You earned $50 with ORBIT!",
              html: `
                <h2>Congratulations!</h2>
                <p>You've earned a $50 referral bonus!</p>
                <p>${bonus.referredWorkerName} has completed their first 2 weeks (80 hours) of work.</p>
                <p>Your payment via ${bonus.paymentMethod} will be processed within 3 business days.</p>
                <p>Thank you for helping us grow!</p>
              `,
            });
          }
        } catch (error) {
          console.error("Failed to send bonus earned email:", error);
        }
      } else {
        // Just update hours
        await db.update(workerReferralBonuses)
          .set({
            hoursWorkedByReferred: totalHours.toString(),
            updatedAt: new Date(),
          })
          .where(eq(workerReferralBonuses.id, bonus.id));
      }
    }
  },
  
  async getPublicReferralsByEmail(email: string): Promise<WorkerReferralBonus[]> {
    return await db.select()
      .from(workerReferralBonuses)
      .where(
        and(
          eq(workerReferralBonuses.referrerType, "public"),
          eq(workerReferralBonuses.publicReferrerEmail, email)
        )
      )
      .orderBy(desc(workerReferralBonuses.createdAt));
  },
  
  async updatePublicReferralPaymentInfo(referralId: string, paymentMethod: string, paymentDetails: string): Promise<WorkerReferralBonus | undefined> {
    const result = await db.update(workerReferralBonuses)
      .set({
        paymentMethod,
        paymentDetails,
        updatedAt: new Date(),
      })
      .where(eq(workerReferralBonuses.id, referralId))
      .returning();
    return result[0];
  },

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

  async confirmRatesAndCSA(params: {
    requestId: string;
    tenantId: string;
    customerId: string;
    workerHourlyRate: number;
    totalBillingRate: number;
    paymentTerms: string;
    csaAccepted: boolean;
    customerIp: string;
  }): Promise<{ success: boolean; confirmationId?: string; error?: string }> {
    try {
      const { requestId, tenantId, customerId, workerHourlyRate, totalBillingRate, paymentTerms, csaAccepted, customerIp } = params;
      
      if (!csaAccepted) {
        return { success: false, error: "CSA must be accepted to confirm rates" };
      }

      const paymentTermsDays = paymentTerms === 'net7' ? 7 : paymentTerms === 'net15' ? 15 : 30;
      const markupPercentage = 1.45;

      const workerRequest = await this.getWorkerRequest(requestId, tenantId);
      if (!workerRequest) {
        return { success: false, error: "Worker request not found" };
      }

      const startDate = new Date(workerRequest.startDate);
      const endDate = workerRequest.endDate ? new Date(workerRequest.endDate) : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      await this.updateWorkerRequest(requestId, tenantId, {
        status: 'confirmed',
        confirmedAt: new Date()
      });

      return {
        success: true,
        confirmationId: requestId
      };
    } catch (error) {
      console.error("Error confirming rates and CSA:", error);
      return { success: false, error: "Failed to confirm rates and CSA" };
    }
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

  // ========================
  // Garnishment Documents
  // ========================
  async createGarnishmentDocument(data: InsertGarnishmentDocument): Promise<GarnishmentDocument> {
    const result = await db.insert(garnishmentDocuments).values(data).returning();
    return result[0];
  },

  async getGarnishmentDocument(id: string, tenantId: string): Promise<GarnishmentDocument | undefined> {
    const result = await db.select().from(garnishmentDocuments).where(
      and(
        eq(garnishmentDocuments.id, id),
        eq(garnishmentDocuments.tenantId, tenantId)
      )
    );
    return result[0];
  },

  async listGarnishmentDocuments(garnishmentOrderId: string, tenantId: string): Promise<GarnishmentDocument[]> {
    return await db.select().from(garnishmentDocuments).where(
      and(
        eq(garnishmentDocuments.garnishmentOrderId, garnishmentOrderId),
        eq(garnishmentDocuments.tenantId, tenantId)
      )
    ).orderBy(desc(garnishmentDocuments.uploadedDate));
  },

  async updateGarnishmentDocumentVerification(
    id: string,
    tenantId: string,
    data: Partial<InsertGarnishmentDocument>
  ): Promise<GarnishmentDocument | undefined> {
    const result = await db.update(garnishmentDocuments).set(data).where(
      and(
        eq(garnishmentDocuments.id, id),
        eq(garnishmentDocuments.tenantId, tenantId)
      )
    ).returning();
    return result[0];
  },

  async deleteGarnishmentDocument(id: string, tenantId: string): Promise<void> {
    await db.delete(garnishmentDocuments).where(
      and(
        eq(garnishmentDocuments.id, id),
        eq(garnishmentDocuments.tenantId, tenantId)
      )
    );
  },

  // ========================
  // Background Checks
  // ========================
  async requestBackgroundCheck(data: InsertBackgroundCheck): Promise<BackgroundCheck> {
    const result = await db.insert(backgroundChecks).values(data).returning();
    return result[0];
  },

  async getBackgroundCheck(id: string, tenantId: string): Promise<BackgroundCheck | undefined> {
    const result = await db.select().from(backgroundChecks).where(
      and(
        eq(backgroundChecks.id, id),
        eq(backgroundChecks.tenantId, tenantId)
      )
    );
    return result[0];
  },

  async listBackgroundChecksByWorker(workerId: string, tenantId: string): Promise<BackgroundCheck[]> {
    return await db.select().from(backgroundChecks).where(
      and(
        eq(backgroundChecks.workerId, workerId),
        eq(backgroundChecks.tenantId, tenantId)
      )
    ).orderBy(desc(backgroundChecks.requestedDate));
  },

  async listBackgroundChecksExpiring(tenantId: string, daysFromNow: number): Promise<BackgroundCheck[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysFromNow);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    return await db.select().from(backgroundChecks).where(
      and(
        eq(backgroundChecks.tenantId, tenantId),
        lte(backgroundChecks.expiryDate, cutoffDateStr)
      )
    );
  },

  async updateBackgroundCheckStatus(
    id: string,
    tenantId: string,
    data: Partial<InsertBackgroundCheck>
  ): Promise<BackgroundCheck | undefined> {
    const result = await db.update(backgroundChecks).set(data).where(
      and(
        eq(backgroundChecks.id, id),
        eq(backgroundChecks.tenantId, tenantId)
      )
    ).returning();
    return result[0];
  },

  async getBackgroundCheckByExternalId(externalId: string, tenantId: string): Promise<BackgroundCheck | undefined> {
    const result = await db.select().from(backgroundChecks).where(
      and(
        eq(backgroundChecks.externalId, externalId),
        eq(backgroundChecks.tenantId, tenantId)
      )
    );
    return result[0];
  },

  // ========================
  // Drug Tests
  // ========================
  async requestDrugTest(data: InsertDrugTest): Promise<DrugTest> {
    const result = await db.insert(drugTests).values(data).returning();
    return result[0];
  },

  async getDrugTest(id: string, tenantId: string): Promise<DrugTest | undefined> {
    const result = await db.select().from(drugTests).where(
      and(
        eq(drugTests.id, id),
        eq(drugTests.tenantId, tenantId)
      )
    );
    return result[0];
  },

  async listDrugTestsByWorker(workerId: string, tenantId: string): Promise<DrugTest[]> {
    return await db.select().from(drugTests).where(
      and(
        eq(drugTests.workerId, workerId),
        eq(drugTests.tenantId, tenantId)
      )
    ).orderBy(desc(drugTests.requestedDate));
  },

  async listDrugTestsExpiring(tenantId: string, daysFromNow: number): Promise<DrugTest[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysFromNow);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    return await db.select().from(drugTests).where(
      and(
        eq(drugTests.tenantId, tenantId),
        lte(drugTests.expiryDate, cutoffDateStr)
      )
    );
  },

  async updateDrugTestStatus(
    id: string,
    tenantId: string,
    data: Partial<InsertDrugTest>
  ): Promise<DrugTest | undefined> {
    const result = await db.update(drugTests).set(data).where(
      and(
        eq(drugTests.id, id),
        eq(drugTests.tenantId, tenantId)
      )
    ).returning();
    return result[0];
  },

  async getDrugTestByExternalId(externalId: string, tenantId: string): Promise<DrugTest | undefined> {
    const result = await db.select().from(drugTests).where(
      and(
        eq(drugTests.externalId, externalId),
        eq(drugTests.tenantId, tenantId)
      )
    );
    return result[0];
  },

  // ========================
  // Compliance Checks
  // ========================
  async createComplianceCheck(data: InsertComplianceCheck): Promise<ComplianceCheck> {
    const result = await db.insert(complianceChecks).values(data).returning();
    return result[0];
  },

  async getComplianceCheck(id: string, tenantId: string): Promise<ComplianceCheck | undefined> {
    const result = await db.select().from(complianceChecks).where(
      and(
        eq(complianceChecks.id, id),
        eq(complianceChecks.tenantId, tenantId)
      )
    );
    return result[0];
  },

  async listComplianceChecksByWorker(workerId: string, tenantId: string): Promise<ComplianceCheck[]> {
    return await db.select().from(complianceChecks).where(
      and(
        eq(complianceChecks.workerId, workerId),
        eq(complianceChecks.tenantId, tenantId)
      )
    ).orderBy(desc(complianceChecks.createdAt));
  },

  async listComplianceChecksByType(workerId: string, tenantId: string, checkType: string): Promise<ComplianceCheck | undefined> {
    const result = await db.select().from(complianceChecks).where(
      and(
        eq(complianceChecks.workerId, workerId),
        eq(complianceChecks.tenantId, tenantId),
        eq(complianceChecks.checkType, checkType)
      )
    );
    return result[0];
  },

  async listExpiringComplianceChecks(tenantId: string, daysFromNow: number): Promise<ComplianceCheck[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysFromNow);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    return await db.select().from(complianceChecks).where(
      and(
        eq(complianceChecks.tenantId, tenantId),
        lte(complianceChecks.expiryDate, cutoffDateStr)
      )
    );
  },

  async updateComplianceCheckStatus(
    id: string,
    tenantId: string,
    data: Partial<InsertComplianceCheck>
  ): Promise<ComplianceCheck | undefined> {
    const result = await db.update(complianceChecks).set(data).where(
      and(
        eq(complianceChecks.id, id),
        eq(complianceChecks.tenantId, tenantId)
      )
    ).returning();
    return result[0];
  },

  async getWorkforceComplianceSummary(tenantId: string): Promise<any> {
    const totalWorkers = await db.select({ count: sql`count(*)` }).from(workers).where(eq(workers.tenantId, tenantId));
    
    const bgCheckCounts = await db.select({
      status: backgroundChecks.status,
      count: sql`count(*)`
    }).from(backgroundChecks).where(eq(backgroundChecks.tenantId, tenantId)).groupBy(backgroundChecks.status);
    
    const drugTestCounts = await db.select({
      status: drugTests.status,
      count: sql`count(*)`
    }).from(drugTests).where(eq(drugTests.tenantId, tenantId)).groupBy(drugTests.status);
    
    const complianceCounts = await db.select({
      status: complianceChecks.complianceStatus,
      count: sql`count(*)`
    }).from(complianceChecks).where(eq(complianceChecks.tenantId, tenantId)).groupBy(complianceChecks.complianceStatus);

    return {
      totalWorkers: totalWorkers[0]?.count || 0,
      backgroundChecks: bgCheckCounts,
      drugTests: drugTestCounts,
      complianceStatus: complianceCounts
    };
  },

  // ========================
  // CSA Templates & Management
  // ========================
  async getActiveCSATemplate(state?: string): Promise<CSATemplate | null> {
    const query = db
      .select()
      .from(csaTemplates)
      .where(eq(csaTemplates.isActive, true))
      .orderBy(desc(csaTemplates.effectiveDate))
      .limit(1);
    
    if (state) {
      const stateSpecific = await db
        .select()
        .from(csaTemplates)
        .where(
          and(
            eq(csaTemplates.isActive, true),
            eq(csaTemplates.jurisdiction, state)
          )
        )
        .orderBy(desc(csaTemplates.effectiveDate))
        .limit(1);
      
      if (stateSpecific.length > 0) {
        return stateSpecific[0];
      }
    }
    
    const result = await query;
    return result[0] || null;
  },

  async createCSATemplate(data: InsertCSATemplate): Promise<CSATemplate> {
    if (data.isActive) {
      await db
        .update(csaTemplates)
        .set({ isActive: false })
        .where(eq(csaTemplates.isActive, true));
    }
    
    const result = await db.insert(csaTemplates).values(data).returning();
    return result[0];
  },

  async updateCSATemplate(id: string, data: Partial<InsertCSATemplate>): Promise<CSATemplate> {
    if (data.isActive) {
      await db
        .update(csaTemplates)
        .set({ isActive: false })
        .where(eq(csaTemplates.isActive, true));
    }
    
    const result = await db
      .update(csaTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(csaTemplates.id, id))
      .returning();
    return result[0];
  },

  async getCSATemplate(id: string): Promise<CSATemplate | null> {
    const result = await db
      .select()
      .from(csaTemplates)
      .where(eq(csaTemplates.id, id))
      .limit(1);
    return result[0] || null;
  },

  async listCSATemplates(): Promise<CSATemplate[]> {
    return await db
      .select()
      .from(csaTemplates)
      .orderBy(desc(csaTemplates.createdAt));
  },

  async createClientCSA(clientId: string, data: {
    templateId: string;
    signerName: string;
    signerTitle?: string;
    signatureData: any;
    ipAddress: string;
    device: string;
    acceptedTerms: any;
  }): Promise<Client> {
    const template = await this.getCSATemplate(data.templateId);
    if (!template) {
      throw new Error('CSA template not found');
    }
    
    const result = await db
      .update(clients)
      .set({
        csaStatus: 'signed',
        csaSignedDate: new Date(),
        csaVersion: template.version,
        csaSignerName: data.signerName,
        csaSignatureData: data.signatureData,
        csaSignatureIpAddress: data.ipAddress,
        csaSignatureDevice: data.device,
        csaAcceptedTerms: data.acceptedTerms,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, clientId))
      .returning();
    
    return result[0];
  },

  async verifyClientCSA(clientId: string): Promise<{ valid: boolean; client?: Client; message?: string }> {
    const result = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);
    
    if (!result || result.length === 0) {
      return { valid: false, message: 'Client not found' };
    }
    
    const client = result[0];
    
    if (client.csaStatus !== 'signed') {
      return { valid: false, client, message: 'CSA not signed' };
    }
    
    if (client.csaExpirationDate) {
      const expDate = new Date(client.csaExpirationDate);
      if (expDate < new Date()) {
        return { valid: false, client, message: 'CSA expired' };
      }
    }
    
    return { valid: true, client };
  },

  async getClient(id: string): Promise<Client | null> {
    const result = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);
    return result[0] || null;
  },

  async listClients(tenantId: string): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.tenantId, tenantId))
      .orderBy(desc(clients.createdAt));
  },

  async updateClient(id: string, data: Partial<InsertClient>): Promise<Client> {
    const result = await db
      .update(clients)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return result[0];
  },

  // ========================
  // PAYROLL OPERATIONS
  // ========================
  async getWorkersReadyForPayroll(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    // Get approved timesheets with worker details
    const result = await db
      .select({
        workerId: workers.id,
        workerName: workers.fullName,
        workerEmail: workers.email,
        workerState: workers.state,
        hourlyWage: workers.hourlyWage,
        totalHours: sql<number>`SUM(COALESCE(${timesheets.totalHoursWorked}, 0))`,
        regularHours: sql<number>`SUM(CASE WHEN ${timesheets.totalHoursWorked} <= 40 THEN ${timesheets.totalHoursWorked} ELSE 40 END)`,
        overtimeHours: sql<number>`SUM(CASE WHEN ${timesheets.totalHoursWorked} > 40 THEN ${timesheets.totalHoursWorked} - 40 ELSE 0 END)`,
      })
      .from(timesheets)
      .innerJoin(workers, eq(timesheets.workerId, workers.id))
      .where(
        and(
          eq(timesheets.tenantId, tenantId),
          eq(timesheets.status, 'approved'),
          gte(timesheets.clockInTime, startDate),
          lte(timesheets.clockInTime, endDate)
        )
      )
      .groupBy(workers.id, workers.fullName, workers.email, workers.state, workers.hourlyWage);

    return result;
  },

  async getWorkerW4Data(workerId: string): Promise<EmployeeW4Data | null> {
    const result = await db
      .select()
      .from(employeeW4Data)
      .where(
        and(
          eq(employeeW4Data.workerId, workerId),
          eq(employeeW4Data.isCurrentW4, true)
        )
      )
      .limit(1);
    return result[0] || null;
  },

  async getWorkerGarnishments(workerId: string): Promise<GarnishmentOrder[]> {
    return await db
      .select()
      .from(garnishmentOrders)
      .where(
        and(
          eq(garnishmentOrders.employeeId, workerId),
          eq(garnishmentOrders.status, 'active')
        )
      )
      .orderBy(garnishmentOrders.priority);
  },

  async createPayrollRecord(data: InsertPayrollRecord): Promise<PayrollRecord> {
    const result = await db.insert(payrollRecords).values(data).returning();
    return result[0];
  },

  async getPayrollRecord(id: string): Promise<PayrollRecord | null> {
    const result = await db
      .select()
      .from(payrollRecords)
      .where(eq(payrollRecords.id, id))
      .limit(1);
    return result[0] || null;
  },

  async getPayrollHistory(
    tenantId: string,
    workerId?: string,
    limit: number = 50
  ): Promise<PayrollRecord[]> {
    let query = db
      .select()
      .from(payrollRecords)
      .where(eq(payrollRecords.tenantId, tenantId));

    if (workerId) {
      query = query.where(eq(payrollRecords.employeeId, workerId));
    }

    return await query
      .orderBy(desc(payrollRecords.payPeriodEnd))
      .limit(limit);
  },

  async updatePayrollRecord(id: string, data: Partial<InsertPayrollRecord>): Promise<PayrollRecord> {
    const result = await db
      .update(payrollRecords)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payrollRecords.id, id))
      .returning();
    return result[0];
  },

  async getPaystubByPayrollId(payrollId: string): Promise<PayrollRecord | null> {
    return this.getPayrollRecord(payrollId);
  },

};

export default storage;
