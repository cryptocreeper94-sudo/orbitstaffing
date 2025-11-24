import { db } from "./db";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import {
  users,
  companies,
  workers,
  clients,
  jobs,
  assignments,
  timesheets,
  payroll,
  invoices,
  messages,
  timeOffRequests,
  stateCompliance,
  userFeedback,
  billingHistory,
  licenses,
  payments,
  featureRequests,
  iosInterestList,
  workerDNR,
  paymentMethods,
  collections,
  orbitAssets,
  demoRegistrations,
  workerOnboardingChecklist,
  developerChat,
  adminBusinessCards,
  developerContactMessages,
  adminPersonalCards,
  devPersonalCards,
  adminDevOwnerMessages,
  employeeEmergencyMessages,
  type InsertUser,
  type User,
  type InsertDemoRegistration,
  type DemoRegistration,
  type InsertCompany,
  type Company,
  type InsertWorker,
  type Worker,
  type InsertClient,
  type Client,
  type InsertJob,
  type Job,
  type InsertAssignment,
  type Assignment,
  type InsertTimesheet,
  type Timesheet,
  type InsertPayroll,
  type Payroll,
  type InsertInvoice,
  type Invoice,
  type InsertMessage,
  type Message,
  type InsertTimeOffRequest,
  type TimeOffRequest,
  type InsertStateCompliance,
  type StateCompliance,
  type InsertUserFeedback,
  type UserFeedback,
  type InsertBillingHistory,
  type BillingHistory,
  type InsertLicense,
  type License,
  type InsertPayment,
  type Payment,
  type InsertFeatureRequest,
  type FeatureRequest,
  type InsertIosInterest,
  type IosInterest,
  type InsertWorkerDNR,
  type WorkerDNR,
  type InsertPaymentMethod,
  type PaymentMethod,
  type InsertCollection,
  type Collection,
  type InsertOrbitAsset,
  type OrbitAsset,
  type InsertWorkerOnboardingChecklist,
  type WorkerOnboardingChecklist,
  type InsertDeveloperChat,
  type DeveloperChat,
  type InsertAdminBusinessCard,
  type AdminBusinessCard,
  type InsertAdminPersonalCard,
  type AdminPersonalCard,
  type InsertDevPersonalCard,
  type DevPersonalCard,
  type InsertAdminDevOwnerMessage,
  type AdminDevOwnerMessage,
  type InsertEmployeeEmergencyMessage,
  type EmployeeEmergencyMessage,
  supportTickets,
  type InsertSupportTicket,
  type SupportTicket,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Companies
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;

  // Workers
  getWorker(id: string): Promise<Worker | undefined>;
  listWorkers(companyId: string): Promise<Worker[]>;
  createWorker(worker: InsertWorker): Promise<Worker>;
  updateWorker(id: string, worker: Partial<InsertWorker>): Promise<Worker | undefined>;

  // Clients
  getClient(id: string): Promise<Client | undefined>;
  listClients(companyId: string): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;

  // Jobs
  getJob(id: string): Promise<Job | undefined>;
  listJobs(companyId: string): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job | undefined>;

  // Assignments
  getAssignment(id: string): Promise<Assignment | undefined>;
  listAssignments(companyId: string): Promise<Assignment[]>;
  listAssignmentsByWorker(workerId: string): Promise<Assignment[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: string, assignment: Partial<InsertAssignment>): Promise<Assignment | undefined>;

  // Timesheets
  getTimesheet(id: string): Promise<Timesheet | undefined>;
  listTimesheets(companyId: string): Promise<Timesheet[]>;
  listTimesheetsByWorker(workerId: string): Promise<Timesheet[]>;
  createTimesheet(timesheet: InsertTimesheet): Promise<Timesheet>;
  updateTimesheet(id: string, timesheet: Partial<InsertTimesheet>): Promise<Timesheet | undefined>;
  clockIn(assignmentId: string, latitude: number, longitude: number): Promise<Timesheet>;
  clockOut(timesheetId: string, latitude: number, longitude: number): Promise<Timesheet | undefined>;

  // Payroll
  getPayroll(id: string): Promise<Payroll | undefined>;
  listPayroll(companyId: string): Promise<Payroll[]>;
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;
  updatePayroll(id: string, payroll: Partial<InsertPayroll>): Promise<Payroll | undefined>;

  // Invoices
  getInvoice(id: string): Promise<Invoice | undefined>;
  listInvoices(companyId: string): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;

  // Messages
  listMessages(recipientId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<Message | undefined>;

  // Time Off Requests
  listTimeOffRequests(workerId: string): Promise<TimeOffRequest[]>;
  createTimeOffRequest(request: InsertTimeOffRequest): Promise<TimeOffRequest>;
  updateTimeOffRequest(id: string, request: Partial<InsertTimeOffRequest>): Promise<TimeOffRequest | undefined>;

  // State Compliance
  getStateCompliance(stateCode: string): Promise<StateCompliance | undefined>;
  listStateCompliance(): Promise<StateCompliance[]>;
  updateStateCompliance(stateCode: string, data: Partial<InsertStateCompliance>): Promise<StateCompliance | undefined>;

  // Feedback
  createFeedback(feedback: InsertUserFeedback): Promise<UserFeedback>;

  // Billing
  changeBillingModel(
    companyId: string,
    newModel: "fixed" | "revenue_share",
    newTier?: string,
    revenueSharePercentage?: number
  ): Promise<{ success: boolean; fee?: number; nextFreeChange?: Date }>;
  getBillingHistory(companyId: string): Promise<BillingHistory[]>;

  // Licenses
  createLicense(license: InsertLicense): Promise<License>;
  getLicense(licenseId: string): Promise<License | undefined>;
  getCompanyLicense(companyId: string): Promise<License | undefined>;
  updateLicense(licenseId: string, data: Partial<InsertLicense>): Promise<License | undefined>;
  listLicenses(filters?: { status?: string; licenseType?: string }): Promise<License[]>;

  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(paymentId: string): Promise<Payment | undefined>;
  getCompanyPayments(companyId: string): Promise<Payment[]>;
  updatePayment(paymentId: string, data: Partial<InsertPayment>): Promise<Payment | undefined>;
  recordPayment(companyId: string, amount: number, description: string, method: string): Promise<Payment>;

  // Feature Requests
  createFeatureRequest(request: InsertFeatureRequest): Promise<FeatureRequest>;
  getFeatureRequest(requestId: string): Promise<FeatureRequest | undefined>;
  getCompanyFeatureRequests(companyId: string): Promise<FeatureRequest[]>;
  getAllFeatureRequests(filters?: { status?: string; priority?: string }): Promise<FeatureRequest[]>;
  updateFeatureRequest(requestId: string, data: Partial<InsertFeatureRequest>): Promise<FeatureRequest | undefined>;

  // iOS Interest List
  createIosInterest(interest: InsertIosInterest): Promise<IosInterest>;
  getIosInterest(id: string): Promise<IosInterest | undefined>;
  listIosInterest(filters?: { notified?: boolean; source?: string }): Promise<IosInterest[]>;
  updateIosInterest(id: string, data: Partial<InsertIosInterest>): Promise<IosInterest | undefined>;
  markIosInterestNotified(id: string): Promise<IosInterest | undefined>;
  markAllIosInterestNotified(): Promise<number>;

  // DNR (Do Not Return/Rehire)
  createWorkerDNR(dnr: InsertWorkerDNR): Promise<WorkerDNR>;
  getWorkerDNR(id: string): Promise<WorkerDNR | undefined>;
  getWorkerDNRByWorkerId(workerId: string, companyId: string): Promise<WorkerDNR | undefined>;
  listCompanyDNR(companyId: string, activeOnly?: boolean): Promise<WorkerDNR[]>;
  updateWorkerDNR(id: string, data: Partial<InsertWorkerDNR>): Promise<WorkerDNR | undefined>;
  removeWorkerDNR(id: string): Promise<WorkerDNR | undefined>;

  // Payment Methods (Primary & Backup)
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  getPaymentMethod(id: string): Promise<PaymentMethod | undefined>;
  listCompanyPaymentMethods(companyId: string, activeOnly?: boolean): Promise<PaymentMethod[]>;
  updatePaymentMethod(id: string, data: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined>;
  setPrimaryPaymentMethod(companyId: string, methodId: string): Promise<void>;
  setBackupPaymentMethod(companyId: string, methodId: string): Promise<void>;

  // Collections / Dunning
  createCollection(collection: InsertCollection): Promise<Collection>;
  getCollection(id: string): Promise<Collection | undefined>;
  listCompanyCollections(companyId: string, filters?: { status?: string; severity?: string }): Promise<Collection[]>;
  updateCollection(id: string, data: Partial<InsertCollection>): Promise<Collection | undefined>;
  getOverdueAmount(companyId: string): Promise<number>;
  suspendCompanyServices(companyId: string, reason: string): Promise<void>;
  unsuspendCompanyServices(companyId: string): Promise<void>;

  // Support Tickets
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  listSupportTickets(filters?: { status?: string; category?: string }): Promise<SupportTicket[]>;
  updateSupportTicket(id: string, data: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined>;

  // File Uploads
  uploadWorkerFile(workerId: string, docType: string, fileData: string, fileName: string): Promise<{ url: string; fileSize: number }>;
  updateWorkerAvatar(workerId: string, avatarUrl: string): Promise<Worker | undefined>;
  updateWorkerDocuments(workerId: string, documents: any[]): Promise<Worker | undefined>;

  // Onboarding Checklist
  getWorkerOnboardingChecklist(workerId: string): Promise<WorkerOnboardingChecklist | undefined>;
  createWorkerOnboardingChecklist(workerId: string, companyId: string): Promise<WorkerOnboardingChecklist>;
  updateOnboardingProgress(workerId: string, progress: number): Promise<WorkerOnboardingChecklist | undefined>;
  completeOnboardingStep(workerId: string, step: string): Promise<WorkerOnboardingChecklist | undefined>;
  approveWorkerOnboarding(workerId: string, adminId: string): Promise<Worker | undefined>;
  checkOnboardingCompletion(workerId: string): Promise<boolean>;
  listWorkersNeedingOnboarding(companyId: string): Promise<Worker[]>;
}

export class DrizzleStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Companies
  async getCompany(id: string): Promise<Company | undefined> {
    const result = await db.select().from(companies).where(eq(companies.id, id));
    return result[0];
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const result = await db.insert(companies).values(company).returning();
    return result[0];
  }

  async updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const result = await db.update(companies).set(company).where(eq(companies.id, id)).returning();
    return result[0];
  }

  // Workers
  async getWorker(id: string): Promise<Worker | undefined> {
    const result = await db.select().from(workers).where(eq(workers.id, id));
    return result[0];
  }

  async listWorkers(companyId: string): Promise<Worker[]> {
    return db.select().from(workers).where(eq(workers.companyId, companyId));
  }

  async createWorker(worker: InsertWorker): Promise<Worker> {
    const result = await db.insert(workers).values(worker).returning();
    return result[0];
  }

  async updateWorker(id: string, worker: Partial<InsertWorker>): Promise<Worker | undefined> {
    const result = await db.update(workers).set(worker).where(eq(workers.id, id)).returning();
    return result[0];
  }

  // Clients
  async getClient(id: string): Promise<Client | undefined> {
    const result = await db.select().from(clients).where(eq(clients.id, id));
    return result[0];
  }

  async listClients(companyId: string): Promise<Client[]> {
    return db.select().from(clients).where(eq(clients.companyId, companyId));
  }

  async createClient(client: InsertClient): Promise<Client> {
    const result = await db.insert(clients).values(client).returning();
    return result[0];
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined> {
    const result = await db.update(clients).set(client).where(eq(clients.id, id)).returning();
    return result[0];
  }

  // Jobs
  async getJob(id: string): Promise<Job | undefined> {
    const result = await db.select().from(jobs).where(eq(jobs.id, id));
    return result[0];
  }

  async listJobs(companyId: string): Promise<Job[]> {
    return db.select().from(jobs).where(eq(jobs.companyId, companyId));
  }

  async createJob(job: InsertJob): Promise<Job> {
    const result = await db.insert(jobs).values(job).returning();
    return result[0];
  }

  async updateJob(id: string, job: Partial<InsertJob>): Promise<Job | undefined> {
    const result = await db.update(jobs).set(job).where(eq(jobs.id, id)).returning();
    return result[0];
  }

  // Assignments
  async getAssignment(id: string): Promise<Assignment | undefined> {
    const result = await db.select().from(assignments).where(eq(assignments.id, id));
    return result[0];
  }

  async listAssignments(companyId: string): Promise<Assignment[]> {
    return db.select().from(assignments).where(eq(assignments.companyId, companyId));
  }

  async listAssignmentsByWorker(workerId: string): Promise<Assignment[]> {
    return db.select().from(assignments).where(eq(assignments.workerId, workerId));
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const result = await db.insert(assignments).values(assignment).returning();
    return result[0];
  }

  async updateAssignment(id: string, assignment: Partial<InsertAssignment>): Promise<Assignment | undefined> {
    const result = await db.update(assignments).set(assignment).where(eq(assignments.id, id)).returning();
    return result[0];
  }

  // Timesheets
  async getTimesheet(id: string): Promise<Timesheet | undefined> {
    const result = await db.select().from(timesheets).where(eq(timesheets.id, id));
    return result[0];
  }

  async listTimesheets(companyId: string): Promise<Timesheet[]> {
    return db.select().from(timesheets).where(eq(timesheets.companyId, companyId));
  }

  async listTimesheetsByWorker(workerId: string): Promise<Timesheet[]> {
    return db.select().from(timesheets).where(eq(timesheets.workerId, workerId));
  }

  async createTimesheet(timesheet: InsertTimesheet): Promise<Timesheet> {
    const result = await db.insert(timesheets).values(timesheet).returning();
    return result[0];
  }

  async updateTimesheet(id: string, timesheet: Partial<InsertTimesheet>): Promise<Timesheet | undefined> {
    const result = await db.update(timesheets).set(timesheet).where(eq(timesheets.id, id)).returning();
    return result[0];
  }

  async clockIn(assignmentId: string, latitude: number, longitude: number): Promise<Timesheet> {
    const result = await db
      .insert(timesheets)
      .values({
        assignmentId,
        clockInTime: new Date(),
        clockInLatitude: latitude.toString() as any,
        clockInLongitude: longitude.toString() as any,
        clockInVerified: true,
        status: "draft",
      })
      .returning();
    return result[0];
  }

  async clockOut(timesheetId: string, latitude: number, longitude: number): Promise<Timesheet | undefined> {
    const timesheet = await this.getTimesheet(timesheetId);
    if (!timesheet || !timesheet.clockInTime) {
      return undefined;
    }

    const clockOutTime = new Date();
    const clockInTime = new Date(timesheet.clockInTime);
    const totalMinutes = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60);
    const totalHours = (totalMinutes / 60).toFixed(2);

    const result = await db
      .update(timesheets)
      .set({
        clockOutTime,
        clockOutLatitude: latitude.toString() as any,
        clockOutLongitude: longitude.toString() as any,
        clockOutVerified: true,
        totalHoursWorked: totalHours as any,
        billableHours: totalHours as any,
      })
      .where(eq(timesheets.id, timesheetId))
      .returning();
    return result[0];
  }

  // Payroll
  async getPayroll(id: string): Promise<Payroll | undefined> {
    const result = await db.select().from(payroll).where(eq(payroll.id, id));
    return result[0];
  }

  async listPayroll(companyId: string): Promise<Payroll[]> {
    return db.select().from(payroll).where(eq(payroll.companyId, companyId));
  }

  async createPayroll(payrollData: InsertPayroll): Promise<Payroll> {
    const result = await db.insert(payroll).values(payrollData).returning();
    return result[0];
  }

  async updatePayroll(id: string, payrollData: Partial<InsertPayroll>): Promise<Payroll | undefined> {
    const result = await db.update(payroll).set(payrollData).where(eq(payroll.id, id)).returning();
    return result[0];
  }

  // Invoices
  async getInvoice(id: string): Promise<Invoice | undefined> {
    const result = await db.select().from(invoices).where(eq(invoices.id, id));
    return result[0];
  }

  async listInvoices(companyId: string): Promise<Invoice[]> {
    return db.select().from(invoices).where(eq(invoices.companyId, companyId));
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const result = await db.insert(invoices).values(invoice).returning();
    return result[0];
  }

  async updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const result = await db.update(invoices).set(invoice).where(eq(invoices.id, id)).returning();
    return result[0];
  }

  // Messages
  async listMessages(recipientId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.recipientId, recipientId)).orderBy(desc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async markMessageAsRead(id: string): Promise<Message | undefined> {
    const result = await db
      .update(messages)
      .set({ read: true, readAt: new Date() })
      .where(eq(messages.id, id))
      .returning();
    return result[0];
  }

  // Time Off Requests
  async listTimeOffRequests(workerId: string): Promise<TimeOffRequest[]> {
    return db.select().from(timeOffRequests).where(eq(timeOffRequests.workerId, workerId));
  }

  async createTimeOffRequest(request: InsertTimeOffRequest): Promise<TimeOffRequest> {
    const result = await db.insert(timeOffRequests).values(request).returning();
    return result[0];
  }

  async updateTimeOffRequest(id: string, request: Partial<InsertTimeOffRequest>): Promise<TimeOffRequest | undefined> {
    const result = await db.update(timeOffRequests).set(request).where(eq(timeOffRequests.id, id)).returning();
    return result[0];
  }

  // State Compliance
  async getStateCompliance(stateCode: string): Promise<StateCompliance | undefined> {
    const result = await db.select().from(stateCompliance).where(eq(stateCompliance.stateCode, stateCode));
    return result[0];
  }

  async listStateCompliance(): Promise<StateCompliance[]> {
    return db.select().from(stateCompliance);
  }

  async updateStateCompliance(stateCode: string, data: Partial<InsertStateCompliance>): Promise<StateCompliance | undefined> {
    const result = await db.update(stateCompliance).set(data).where(eq(stateCompliance.stateCode, stateCode)).returning();
    return result[0];
  }

  // Feedback
  async createFeedback(feedback: InsertUserFeedback): Promise<UserFeedback> {
    const result = await db.insert(userFeedback).values(feedback).returning();
    return result[0];
  }

  // Billing
  async changeBillingModel(
    companyId: string,
    newModel: "fixed" | "revenue_share",
    newTier: string = "startup",
    revenueSharePercentage: number = 2.0
  ): Promise<{ success: boolean; fee?: number; nextFreeChange?: Date }> {
    const company = await this.getCompany(companyId);
    if (!company) {
      throw new Error("Company not found");
    }

    const now = new Date();
    const lastChange = company.lastBillingModelChange ? new Date(company.lastBillingModelChange) : null;
    const nextFreeChange = company.nextBillingModelChangeAvailable ? new Date(company.nextBillingModelChangeAvailable) : null;

    // Check if free change is available
    let fee = 0;
    let nextFreeChangeDate = null;

    if (lastChange && nextFreeChange && now < nextFreeChange) {
      // Not the first change and free change not available
      fee = 299; // $299 for extra switches
    } else {
      // Free change, set next free change 6 months from now
      nextFreeChangeDate = new Date(now);
      nextFreeChangeDate.setMonth(nextFreeChangeDate.getMonth() + 6);
    }

    // Record the billing history
    await db.insert(billingHistory).values({
      companyId,
      previousModel: company.billingModel as any,
      newModel: newModel as any,
      previousTier: company.billingTier,
      newTier: newTier as any,
      changeFee: fee > 0 ? fee.toString() as any : null,
      effectiveDate: new Date(),
      status: "completed" as any,
    });

    // Update company billing settings
    const monthlyAmount = newModel === "fixed" ? this.getMonthlyAmount(newTier) : null;

    await db.update(companies).set({
      billingModel: newModel,
      billingTier: newTier,
      revenueSharePercentage: newModel === "revenue_share" ? revenueSharePercentage.toString() as any : null,
      monthlyBillingAmount: monthlyAmount ? monthlyAmount.toString() as any : null,
      lastBillingModelChange: now,
      nextBillingModelChangeAvailable: nextFreeChangeDate,
      billingModelChangeCount: company.billingModelChangeCount ? company.billingModelChangeCount + 1 : 1,
    }).where(eq(companies.id, companyId));

    return {
      success: true,
      fee: fee > 0 ? fee : undefined,
      nextFreeChange: nextFreeChangeDate || undefined,
    };
  }

  async getBillingHistory(companyId: string): Promise<BillingHistory[]> {
    return db.select().from(billingHistory).where(eq(billingHistory.companyId, companyId)).orderBy(desc(billingHistory.createdAt));
  }

  private getMonthlyAmount(tier: string): number {
    const amounts: Record<string, number> = {
      startup: 199,
      growth: 599,
      enterprise: 2000,
    };
    return amounts[tier] || 199;
  }

  // Licenses
  async createLicense(license: InsertLicense): Promise<License> {
    const result = await db.insert(licenses).values(license).returning();
    return result[0];
  }

  async getLicense(licenseId: string): Promise<License | undefined> {
    const result = await db.select().from(licenses).where(eq(licenses.id, licenseId));
    return result[0];
  }

  async getCompanyLicense(companyId: string): Promise<License | undefined> {
    const result = await db.select().from(licenses)
      .where(eq(licenses.companyId, companyId))
      .orderBy(desc(licenses.createdAt));
    return result[0];
  }

  async updateLicense(licenseId: string, data: Partial<InsertLicense>): Promise<License | undefined> {
    const result = await db.update(licenses).set(data).where(eq(licenses.id, licenseId)).returning();
    return result[0];
  }

  async listLicenses(filters?: { status?: string; licenseType?: string }): Promise<License[]> {
    let query = db.select().from(licenses);
    
    if (filters?.status) {
      query = query.where(eq(licenses.status, filters.status));
    }
    if (filters?.licenseType) {
      query = query.where(eq(licenses.licenseType, filters.licenseType));
    }

    return query;
  }

  // Payments
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const result = await db.insert(payments).values(payment).returning();
    return result[0];
  }

  async getPayment(paymentId: string): Promise<Payment | undefined> {
    const result = await db.select().from(payments).where(eq(payments.id, paymentId));
    return result[0];
  }

  async getCompanyPayments(companyId: string): Promise<Payment[]> {
    return db.select().from(payments)
      .where(eq(payments.companyId, companyId))
      .orderBy(desc(payments.createdAt));
  }

  async updatePayment(paymentId: string, data: Partial<InsertPayment>): Promise<Payment | undefined> {
    const result = await db.update(payments).set(data).where(eq(payments.id, paymentId)).returning();
    return result[0];
  }

  async recordPayment(companyId: string, amount: number, description: string, method: string): Promise<Payment> {
    return this.createPayment({
      companyId,
      amount: amount.toString() as any,
      description,
      paymentMethod: method,
      status: "completed",
    });
  }

  // Feature Requests
  async createFeatureRequest(request: InsertFeatureRequest): Promise<FeatureRequest> {
    const result = await db.insert(featureRequests).values(request).returning();
    return result[0];
  }

  async getFeatureRequest(requestId: string): Promise<FeatureRequest | undefined> {
    const result = await db.select().from(featureRequests).where(eq(featureRequests.id, requestId));
    return result[0];
  }

  async getCompanyFeatureRequests(companyId: string): Promise<FeatureRequest[]> {
    return db.select().from(featureRequests)
      .where(eq(featureRequests.companyId, companyId))
      .orderBy(desc(featureRequests.createdAt));
  }

  async getAllFeatureRequests(filters?: { status?: string; priority?: string }): Promise<FeatureRequest[]> {
    let query = db.select().from(featureRequests);

    if (filters?.status) {
      query = query.where(eq(featureRequests.status, filters.status));
    }
    if (filters?.priority) {
      query = query.where(eq(featureRequests.priority, filters.priority));
    }

    return query.orderBy(desc(featureRequests.createdAt));
  }

  async updateFeatureRequest(requestId: string, data: Partial<InsertFeatureRequest>): Promise<FeatureRequest | undefined> {
    const result = await db.update(featureRequests).set(data).where(eq(featureRequests.id, requestId)).returning();
    return result[0];
  }

  // iOS Interest List
  async createIosInterest(interest: InsertIosInterest): Promise<IosInterest> {
    const result = await db.insert(iosInterestList).values(interest).returning();
    return result[0];
  }

  async getIosInterest(id: string): Promise<IosInterest | undefined> {
    const result = await db.select().from(iosInterestList).where(eq(iosInterestList.id, id));
    return result[0];
  }

  async listIosInterest(filters?: { notified?: boolean; source?: string }): Promise<IosInterest[]> {
    let query = db.select().from(iosInterestList);

    if (filters?.notified !== undefined) {
      query = query.where(eq(iosInterestList.notified, filters.notified));
    }
    if (filters?.source) {
      query = query.where(eq(iosInterestList.source, filters.source));
    }

    return query.orderBy(desc(iosInterestList.createdAt));
  }

  async updateIosInterest(id: string, data: Partial<InsertIosInterest>): Promise<IosInterest | undefined> {
    const result = await db.update(iosInterestList).set(data).where(eq(iosInterestList.id, id)).returning();
    return result[0];
  }

  async markIosInterestNotified(id: string): Promise<IosInterest | undefined> {
    const result = await db
      .update(iosInterestList)
      .set({
        notified: true,
        notifiedAt: new Date(),
      })
      .where(eq(iosInterestList.id, id))
      .returning();
    return result[0];
  }

  async markAllIosInterestNotified(): Promise<number> {
    const result = await db
      .update(iosInterestList)
      .set({
        notified: true,
        notifiedAt: new Date(),
      })
      .where(eq(iosInterestList.notified, false));
    return result.rowCount || 0;
  }

  // DNR (Do Not Return/Rehire)
  async createWorkerDNR(dnr: InsertWorkerDNR): Promise<WorkerDNR> {
    const result = await db.insert(workerDNR).values(dnr).returning();
    return result[0];
  }

  async getWorkerDNR(id: string): Promise<WorkerDNR | undefined> {
    const result = await db.select().from(workerDNR).where(eq(workerDNR.id, id));
    return result[0];
  }

  async getWorkerDNRByWorkerId(workerId: string, companyId: string): Promise<WorkerDNR | undefined> {
    const result = await db
      .select()
      .from(workerDNR)
      .where(and(eq(workerDNR.workerId, workerId), eq(workerDNR.companyId, companyId), eq(workerDNR.isActive, true)));
    return result[0];
  }

  async listCompanyDNR(companyId: string, activeOnly = true): Promise<WorkerDNR[]> {
    let query = db.select().from(workerDNR).where(eq(workerDNR.companyId, companyId));
    
    if (activeOnly) {
      query = query.where(eq(workerDNR.isActive, true));
    }
    
    return query.orderBy(desc(workerDNR.markedAt));
  }

  async updateWorkerDNR(id: string, data: Partial<InsertWorkerDNR>): Promise<WorkerDNR | undefined> {
    const result = await db.update(workerDNR).set(data).where(eq(workerDNR.id, id)).returning();
    return result[0];
  }

  async removeWorkerDNR(id: string): Promise<WorkerDNR | undefined> {
    // Set isActive to false instead of deleting
    const result = await db
      .update(workerDNR)
      .set({
        isActive: false,
        unmakedAt: new Date(),
      })
      .where(eq(workerDNR.id, id))
      .returning();
    return result[0];
  }

  // Payment Methods
  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    const result = await db.insert(paymentMethods).values(method).returning();
    return result[0];
  }

  async getPaymentMethod(id: string): Promise<PaymentMethod | undefined> {
    const result = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    return result[0];
  }

  async listCompanyPaymentMethods(companyId: string, activeOnly = true): Promise<PaymentMethod[]> {
    let query = db.select().from(paymentMethods).where(eq(paymentMethods.companyId, companyId));
    if (activeOnly) {
      query = query.where(eq(paymentMethods.isActive, true));
    }
    return query;
  }

  async updatePaymentMethod(id: string, data: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> {
    const result = await db.update(paymentMethods).set(data).where(eq(paymentMethods.id, id)).returning();
    return result[0];
  }

  async setPrimaryPaymentMethod(companyId: string, methodId: string): Promise<void> {
    // Set all others to non-primary
    await db.update(paymentMethods).set({ isPrimary: false }).where(eq(paymentMethods.companyId, companyId));
    // Set this one as primary
    await db.update(paymentMethods).set({ isPrimary: true }).where(eq(paymentMethods.id, methodId));
  }

  async setBackupPaymentMethod(companyId: string, methodId: string): Promise<void> {
    // Set all others to non-backup
    await db.update(paymentMethods).set({ isBackup: false }).where(eq(paymentMethods.companyId, companyId));
    // Set this one as backup
    await db.update(paymentMethods).set({ isBackup: true }).where(eq(paymentMethods.id, methodId));
  }

  // Collections / Dunning
  async createCollection(collection: InsertCollection): Promise<Collection> {
    const result = await db.insert(collections).values(collection).returning();
    return result[0];
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    const result = await db.select().from(collections).where(eq(collections.id, id));
    return result[0];
  }

  async listCompanyCollections(companyId: string, filters?: { status?: string; severity?: string }): Promise<Collection[]> {
    let query = db.select().from(collections).where(eq(collections.companyId, companyId));
    if (filters?.status) {
      query = query.where(eq(collections.status, filters.status));
    }
    if (filters?.severity) {
      query = query.where(eq(collections.severity, filters.severity));
    }
    return query.orderBy(desc(collections.createdAt));
  }

  async updateCollection(id: string, data: Partial<InsertCollection>): Promise<Collection | undefined> {
    const result = await db.update(collections).set(data).where(eq(collections.id, id)).returning();
    return result[0];
  }

  async getOverdueAmount(companyId: string): Promise<number> {
    const result = await db
      .select()
      .from(collections)
      .where(and(eq(collections.companyId, companyId), eq(collections.status, "overdue")));
    const total = result.reduce((sum, col) => sum + Number(col.amount), 0);
    return total;
  }

  async suspendCompanyServices(companyId: string, reason: string): Promise<void> {
    await db
      .update(companies)
      .set({
        paymentStatus: "suspended",
        suspensionReason: reason,
        suspendedAt: new Date(),
      })
      .where(eq(companies.id, companyId));
  }

  async unsuspendCompanyServices(companyId: string): Promise<void> {
    await db
      .update(companies)
      .set({
        paymentStatus: "active",
        suspensionReason: null,
        suspendedAt: null,
      })
      .where(eq(companies.id, companyId));
  }

  // ORBIT Hallmark Asset Registry
  async getNextAssetNumber(): Promise<string> {
    const result = await db.select({ max: sql<number>`MAX(CAST(SUBSTRING(asset_number, 15) AS INTEGER))` }).from(orbitAssets);
    const maxSeq = result[0]?.max || 0;
    const nextSeq = maxSeq + 1;
    return `ORBIT-ASSET-${String(nextSeq).padStart(12, '0')}`;
  }

  async registerAsset(asset: InsertOrbitAsset): Promise<OrbitAsset> {
    const result = await db.insert(orbitAssets).values(asset).returning();
    return result[0];
  }

  async getAsset(assetNumber: string): Promise<OrbitAsset | undefined> {
    const result = await db.select().from(orbitAssets).where(eq(orbitAssets.assetNumber, assetNumber));
    return result[0];
  }

  async listAssets(filters?: { franchiseeId?: string; customerId?: string; status?: string; type?: string }): Promise<OrbitAsset[]> {
    let query = db.select().from(orbitAssets);

    if (filters?.franchiseeId) {
      query = query.where(eq(orbitAssets.franchiseeId, filters.franchiseeId));
    }
    if (filters?.customerId) {
      query = query.where(eq(orbitAssets.customerId, filters.customerId));
    }
    if (filters?.status) {
      query = query.where(eq(orbitAssets.status, filters.status));
    }
    if (filters?.type) {
      query = query.where(eq(orbitAssets.type, filters.type));
    }

    return query.orderBy(desc(orbitAssets.createdAt));
  }

  async getAllAssets(): Promise<OrbitAsset[]> {
    return db.select().from(orbitAssets).orderBy(desc(orbitAssets.createdAt));
  }

  async updateAsset(assetNumber: string, data: Partial<InsertOrbitAsset>): Promise<OrbitAsset | undefined> {
    const result = await db.update(orbitAssets).set(data).where(eq(orbitAssets.assetNumber, assetNumber)).returning();
    return result[0];
  }

  async revokeAsset(assetNumber: string, revokedBy: string, reason?: string): Promise<OrbitAsset | undefined> {
    const result = await db
      .update(orbitAssets)
      .set({
        status: "revoked",
        revokedAt: new Date(),
        revokedBy,
        metadata: { reason },
      })
      .where(eq(orbitAssets.assetNumber, assetNumber))
      .returning();
    return result[0];
  }

  async getAssetStats(): Promise<{ total: number; active: number; revoked: number; byType: Record<string, number> }> {
    const assets = await db.select().from(orbitAssets);
    const total = assets.length;
    const active = assets.filter((a) => a.status === "active").length;
    const revoked = assets.filter((a) => a.status === "revoked").length;
    const byType: Record<string, number> = {};
    assets.forEach((a) => {
      byType[a.type] = (byType[a.type] || 0) + 1;
    });
    return { total, active, revoked, byType };
  }

  // Support Tickets
  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const result = await db.insert(supportTickets).values(ticket).returning();
    return result[0];
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const result = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return result[0];
  }

  async listSupportTickets(filters?: { status?: string; category?: string }): Promise<SupportTicket[]> {
    let query = db.select().from(supportTickets);
    if (filters?.status) {
      query = query.where(eq(supportTickets.status, filters.status));
    }
    if (filters?.category) {
      query = query.where(eq(supportTickets.category, filters.category));
    }
    return query.orderBy(desc(supportTickets.createdAt));
  }

  async updateSupportTicket(id: string, data: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined> {
    const result = await db.update(supportTickets).set(data).where(eq(supportTickets.id, id)).returning();
    return result[0];
  }

  // File Uploads
  async uploadWorkerFile(workerId: string, docType: string, fileData: string, fileName: string): Promise<{ url: string; fileSize: number }> {
    // For MVP: Store base64 data directly as a data URL
    // In production, you would upload to S3, Cloudinary, or similar
    const fileSize = fileData.length;
    
    // Create a data URL that represents the uploaded file
    // The fileData is already base64 encoded from the client
    const dataUrl = fileData; // Already in format: data:image/jpeg;base64,...
    
    return {
      url: dataUrl,
      fileSize: fileSize
    };
  }

  async updateWorkerAvatar(workerId: string, avatarUrl: string): Promise<Worker | undefined> {
    const result = await db.update(workers)
      .set({ avatarUrl })
      .where(eq(workers.id, workerId))
      .returning();
    return result[0];
  }

  async updateWorkerDocuments(workerId: string, documents: any[]): Promise<Worker | undefined> {
    const result = await db.update(workers)
      .set({ i9Documents: documents })
      .where(eq(workers.id, workerId))
      .returning();
    return result[0];
  }

  // Onboarding Checklist
  async getWorkerOnboardingChecklist(workerId: string): Promise<WorkerOnboardingChecklist | undefined> {
    const result = await db.select().from(workerOnboardingChecklist).where(eq(workerOnboardingChecklist.workerId, workerId));
    return result[0];
  }

  async createWorkerOnboardingChecklist(workerId: string, companyId: string): Promise<WorkerOnboardingChecklist> {
    const result = await db.insert(workerOnboardingChecklist).values({
      workerId,
      companyId,
      completionPercentage: 0,
    }).returning();
    return result[0];
  }

  async updateOnboardingProgress(workerId: string, progress: number): Promise<WorkerOnboardingChecklist | undefined> {
    const result = await db.update(workerOnboardingChecklist)
      .set({ completionPercentage: progress })
      .where(eq(workerOnboardingChecklist.workerId, workerId))
      .returning();
    return result[0];
  }

  async completeOnboardingStep(workerId: string, step: string): Promise<WorkerOnboardingChecklist | undefined> {
    const checklist = await this.getWorkerOnboardingChecklist(workerId);
    if (!checklist) return undefined;

    const updates: Partial<WorkerOnboardingChecklist> = {};
    let newProgress = Math.floor((checklist.completionPercentage || 0) * 0.2); // Each step is ~20%

    switch (step) {
      case 'profilePhoto':
        updates.profilePhotoUploaded = true;
        updates.profilePhotoUploadedAt = new Date();
        newProgress += 20;
        break;
      case 'i9Documents':
        updates.i9DocumentsSubmitted = true;
        updates.i9DocumentsSubmittedAt = new Date();
        newProgress += 20;
        break;
      case 'backgroundCheck':
        updates.backgroundCheckConsented = true;
        updates.backgroundCheckConsentedAt = new Date();
        newProgress += 20;
        break;
      case 'bankDetails':
        updates.bankDetailsSubmitted = true;
        updates.bankDetailsSubmittedAt = new Date();
        newProgress += 20;
        break;
      case 'nda':
        updates.nDAAccepted = true;
        updates.nDAAcceptedAt = new Date();
        newProgress = 100; // Final step
        updates.completedAt = new Date();
        break;
    }

    updates.completionPercentage = Math.min(newProgress, 100);

    const result = await db.update(workerOnboardingChecklist)
      .set(updates)
      .where(eq(workerOnboardingChecklist.workerId, workerId))
      .returning();
    return result[0];
  }

  async approveWorkerOnboarding(workerId: string, adminId: string): Promise<Worker | undefined> {
    // Mark as completed and activated
    const now = new Date();
    const employeeNumber = `EMP-${Date.now().toString().slice(-6)}`;
    
    const result = await db.update(workers)
      .set({
        onboardingStatus: 'completed',
        isActivated: true,
        onboardingCompletedAt: now,
        activatedAt: now,
        employeeNumber: employeeNumber,
        employeeNumberAssignedAt: now,
      })
      .where(eq(workers.id, workerId))
      .returning();

    // Update checklist
    await db.update(workerOnboardingChecklist)
      .set({ 
        completionPercentage: 100,
        completedAt: now,
        approvedByAdmin: adminId,
        approvedByAdminAt: now,
      })
      .where(eq(workerOnboardingChecklist.workerId, workerId));

    return result[0];
  }

  async checkOnboardingCompletion(workerId: string): Promise<boolean> {
    const worker = await this.getWorker(workerId);
    return worker?.isActivated === true && worker?.onboardingStatus === 'completed';
  }

  async listWorkersNeedingOnboarding(companyId: string): Promise<Worker[]> {
    const result = await db.select().from(workers)
      .where(and(
        eq(workers.companyId, companyId),
        eq(workers.isActivated, false)
      ));
    return result;
  }

  // Demo Registrations (Lead Capture)
  async createDemoRegistration(data: InsertDemoRegistration): Promise<DemoRegistration> {
    const result = await db.insert(demoRegistrations).values(data).returning();
    return result[0];
  }

  async getDemoRegistrationByCode(code: string): Promise<DemoRegistration | undefined> {
    const result = await db.select().from(demoRegistrations).where(eq(demoRegistrations.demoCode, code));
    return result[0];
  }

  async getDemoRegistrationByEmail(email: string): Promise<DemoRegistration | undefined> {
    const result = await db.select().from(demoRegistrations).where(eq(demoRegistrations.email, email));
    return result[0];
  }

  async markDemoAsUsed(code: string): Promise<DemoRegistration | undefined> {
    const result = await db.update(demoRegistrations).set({
      used: true,
      usedAt: new Date(),
    }).where(eq(demoRegistrations.demoCode, code)).returning();
    return result[0];
  }

  // Developer Chat
  async createDeveloperChatMessage(data: InsertDeveloperChat): Promise<DeveloperChat> {
    const result = await db.insert(developerChat).values(data).returning();
    return result[0];
  }

  async getDeveloperChatHistory(sessionId: string, limit: number = 50): Promise<DeveloperChat[]> {
    const result = await db.select().from(developerChat)
      .where(eq(developerChat.sessionId, sessionId))
      .orderBy(desc(developerChat.createdAt))
      .limit(limit);
    return result.reverse(); // Return oldest first
  }

  // Admin Business Cards
  async createOrUpdateAdminBusinessCard(data: InsertAdminBusinessCard): Promise<AdminBusinessCard> {
    const existing = await db.select().from(adminBusinessCards)
      .where(eq(adminBusinessCards.adminId, data.adminId));
    
    if (existing.length > 0) {
      const result = await db.update(adminBusinessCards)
        .set(data)
        .where(eq(adminBusinessCards.adminId, data.adminId))
        .returning();
      return result[0];
    }
    
    const result = await db.insert(adminBusinessCards).values(data).returning();
    return result[0];
  }

  async getAdminBusinessCard(adminId: string): Promise<AdminBusinessCard | undefined> {
    const result = await db.select().from(adminBusinessCards)
      .where(eq(adminBusinessCards.adminId, adminId));
    return result[0];
  }

  async updateAdminBusinessCardPhoto(adminId: string, photoUrl: string): Promise<AdminBusinessCard | undefined> {
    const result = await db.update(adminBusinessCards)
      .set({ photoUrl, photoUploadedAt: new Date() })
      .where(eq(adminBusinessCards.adminId, adminId))
      .returning();
    return result[0];
  }

  // Developer Contact Messages
  async createDeveloperContactMessage(data: any): Promise<any> {
    const result = await db.insert(developerContactMessages).values(data).returning();
    return result[0];
  }

  async getDeveloperContactMessages(limit: number = 50, offset: number = 0): Promise<any[]> {
    const result = await db.select().from(developerContactMessages)
      .orderBy(desc(developerContactMessages.createdAt))
      .limit(limit)
      .offset(offset);
    return result;
  }

  async getDeveloperContactMessageById(id: string): Promise<any | undefined> {
    const result = await db.select().from(developerContactMessages)
      .where(eq(developerContactMessages.id, id));
    return result[0];
  }

  async updateDeveloperContactMessageStatus(id: string, status: string): Promise<any | undefined> {
    const result = await db.update(developerContactMessages)
      .set({ status, respondedAt: new Date() })
      .where(eq(developerContactMessages.id, id))
      .returning();
    return result[0];
  }

  // Admin Personal Cards
  async createOrUpdateAdminPersonalCard(data: InsertAdminPersonalCard): Promise<AdminPersonalCard> {
    const existing = await db.select().from(adminPersonalCards)
      .where(eq(adminPersonalCards.adminId, data.adminId));
    
    if (existing.length > 0) {
      const result = await db.update(adminPersonalCards)
        .set(data)
        .where(eq(adminPersonalCards.adminId, data.adminId))
        .returning();
      return result[0];
    }
    
    const result = await db.insert(adminPersonalCards).values(data).returning();
    return result[0];
  }

  async getAdminPersonalCard(adminId: string): Promise<AdminPersonalCard | undefined> {
    const result = await db.select().from(adminPersonalCards)
      .where(eq(adminPersonalCards.adminId, adminId));
    return result[0];
  }

  // Dev Personal Cards
  async createOrUpdateDevPersonalCard(data: InsertDevPersonalCard): Promise<DevPersonalCard> {
    const existing = await db.select().from(devPersonalCards)
      .where(eq(devPersonalCards.devId, data.devId));
    
    if (existing.length > 0) {
      const result = await db.update(devPersonalCards)
        .set(data)
        .where(eq(devPersonalCards.devId, data.devId))
        .returning();
      return result[0];
    }
    
    const result = await db.insert(devPersonalCards).values(data).returning();
    return result[0];
  }

  async getDevPersonalCard(devId: string): Promise<DevPersonalCard | undefined> {
    const result = await db.select().from(devPersonalCards)
      .where(eq(devPersonalCards.devId, devId));
    return result[0];
  }

  // Admin/Dev/Owner Messages
  async createMessage(data: InsertAdminDevOwnerMessage): Promise<AdminDevOwnerMessage> {
    const result = await db.insert(adminDevOwnerMessages).values(data).returning();
    return result[0];
  }

  async getMessagesBetween(userId1: string, userId2: string): Promise<AdminDevOwnerMessage[]> {
    const result = await db.select().from(adminDevOwnerMessages)
      .where(
        and(
          eq(adminDevOwnerMessages.fromUserId, userId1),
          eq(adminDevOwnerMessages.toUserId, userId2)
        )
      )
      .orderBy(desc(adminDevOwnerMessages.createdAt));
    return result;
  }

  async getMessagesForUser(userId: string): Promise<AdminDevOwnerMessage[]> {
    const result = await db.select().from(adminDevOwnerMessages)
      .where(eq(adminDevOwnerMessages.toUserId, userId))
      .orderBy(desc(adminDevOwnerMessages.createdAt));
    return result;
  }

  async markMessageAsRead(messageId: string): Promise<AdminDevOwnerMessage | undefined> {
    const result = await db.update(adminDevOwnerMessages)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(adminDevOwnerMessages.id, messageId))
      .returning();
    return result[0];
  }

  // Employee Emergency Messages
  async createEmergencyMessage(data: InsertEmployeeEmergencyMessage): Promise<EmployeeEmergencyMessage> {
    const result = await db.insert(employeeEmergencyMessages).values(data).returning();
    return result[0];
  }

  async getEmergencyMessagesByEmployee(employeeId: string): Promise<EmployeeEmergencyMessage[]> {
    const result = await db.select().from(employeeEmergencyMessages)
      .where(eq(employeeEmergencyMessages.employeeId, employeeId))
      .orderBy(desc(employeeEmergencyMessages.createdAt));
    return result;
  }

  async getAllEmergencyMessages(): Promise<EmployeeEmergencyMessage[]> {
    const result = await db.select().from(employeeEmergencyMessages)
      .orderBy(desc(employeeEmergencyMessages.createdAt));
    return result;
  }

  async updateEmergencyMessageStatus(messageId: string, status: string, reviewedByUserId: string): Promise<EmployeeEmergencyMessage | undefined> {
    const result = await db.update(employeeEmergencyMessages)
      .set({ status, reviewedBy: reviewedByUserId, reviewedAt: new Date() })
      .where(eq(employeeEmergencyMessages.id, messageId))
      .returning();
    return result[0];
  }
}

export const storage = new DrizzleStorage();
