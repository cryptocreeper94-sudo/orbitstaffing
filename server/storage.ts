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
  type InsertUser,
  type User,
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
}

export const storage = new DrizzleStorage();
