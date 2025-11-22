import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  date,
  timestamp,
  decimal,
  boolean,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========================
// Users (Authentication)
// ========================
export const users = pgTable(
  "users",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    email: varchar("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 50 }).notNull().default("worker"), // worker, admin, manager, client
    companyId: varchar("company_id").references(() => companies.id),
    fullName: varchar("full_name", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    verified: boolean("verified").default(false),
    verifiedAt: timestamp("verified_at"),
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_users_company_id").on(table.companyId),
    emailIdx: index("idx_users_email").on(table.email),
  })
);

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ========================
// Companies (Business Accounts)
// ========================
export const companies = pgTable(
  "companies",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    industry: varchar("industry", { length: 100 }), // staffing, healthcare, construction, etc.
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    zipCode: varchar("zip_code", { length: 10 }),
    ownerId: varchar("owner_id").references(() => users.id),

    // Billing Model
    billingModel: varchar("billing_model", { length: 50 }).default("fixed"), // "fixed" or "revenue_share"
    billingTier: varchar("billing_tier", { length: 50 }).default("startup"), // "startup", "growth", "enterprise"
    revenueSharePercentage: decimal("revenue_share_percentage", { precision: 5, scale: 2 }).default("2.00"), // 2% default
    monthlyBillingAmount: decimal("monthly_billing_amount", { precision: 10, scale: 2 }), // for fixed plan
    
    // Billing Transitions
    lastBillingModelChange: timestamp("last_billing_model_change"),
    nextBillingModelChangeAvailable: timestamp("next_billing_model_change_available"),
    billingModelChangeCount: integer("billing_model_change_count").default(0),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  }
);

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// ========================
// State Compliance Configuration
// ========================
export const stateCompliance = pgTable(
  "state_compliance",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    stateCode: varchar("state_code", { length: 2 }).notNull().unique(),
    stateName: varchar("state_name", { length: 100 }),

    // Tax Information
    stateTaxRate: decimal("state_tax_rate", { precision: 5, scale: 3 }),
    unemploymentRate: decimal("unemployment_rate", { precision: 5, scale: 3 }),
    workersCompRate: decimal("workers_comp_rate", { precision: 5, scale: 3 }),

    // Prevailing Wage
    prevailingWageEnabled: boolean("prevailing_wage_enabled"),
    prevailingWageRates: jsonb("prevailing_wage_rates"), // {job_type: hourly_rate}

    // I-9 Requirements
    i9RequirementsText: text("i9_requirements_text"),
    i9ValidDocuments: jsonb("i9_valid_documents"),

    // Labor Laws
    minimumWage: decimal("minimum_wage", { precision: 5, scale: 2 }),
    overtimeThreshold: integer("overtime_threshold"),
    mealBreakRequired: boolean("meal_break_required"),
    mealBreakDuration: integer("meal_break_duration"), // minutes
    restBreakRequired: boolean("rest_break_required"),
    restBreakDuration: integer("rest_break_duration"),

    // Compliance Notes
    specialRequirements: text("special_requirements"),
    lastUpdated: timestamp("last_updated").default(sql`NOW()`),
  }
);

export const insertStateComplianceSchema = createInsertSchema(stateCompliance).omit({
  id: true,
  lastUpdated: true,
});

export type InsertStateCompliance = z.infer<typeof insertStateComplianceSchema>;
export type StateCompliance = typeof stateCompliance.$inferSelect;

// ========================
// Workers (Employees)
// ========================
export const workers = pgTable(
  "workers",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").references(() => users.id),
    companyId: varchar("company_id").references(() => companies.id),

    // Personal Info
    ssnEncrypted: varchar("ssn_encrypted", { length: 255 }), // encrypted
    dateOfBirth: date("date_of_birth"),
    driversLicense: varchar("drivers_license", { length: 50 }),

    // Skills & Work Info
    skills: jsonb("skills"), // ['electrician', 'plumber', etc.]
    hourlyWage: decimal("hourly_wage", { precision: 8, scale: 2 }),
    availabilityStatus: varchar("availability_status", { length: 50 }).default("available"),

    // Compliance
    i9Verified: boolean("i9_verified").default(false),
    i9VerifiedDate: timestamp("i9_verified_date"),
    backgroundCheckStatus: varchar("background_check_status", { length: 50 }),
    backgroundCheckDate: timestamp("background_check_date"),
    eVerifyStatus: varchar("e_verify_status", { length: 50 }),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_workers_company_id").on(table.companyId),
    userIdx: index("idx_workers_user_id").on(table.userId),
  })
);

export const insertWorkerSchema = createInsertSchema(workers).omit({
  id: true,
  i9VerifiedDate: true,
  backgroundCheckDate: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type Worker = typeof workers.$inferSelect;

// ========================
// Clients (Company Customers)
// ========================
export const clients = pgTable(
  "clients",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").references(() => companies.id),

    // Client Info
    businessName: varchar("business_name", { length: 255 }).notNull(),
    contactPerson: varchar("contact_person", { length: 255 }),
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 20 }),

    // Address
    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    zipCode: varchar("zip_code", { length: 10 }),

    // Geofencing
    latitude: decimal("latitude", { precision: 9, scale: 6 }),
    longitude: decimal("longitude", { precision: 9, scale: 6 }),
    geofenceRadiusFeet: integer("geofence_radius_feet").default(250),

    // Billing
    paymentTerms: varchar("payment_terms", { length: 50 }),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_clients_company_id").on(table.companyId),
  })
);

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// ========================
// Jobs
// ========================
export const jobs = pgTable(
  "jobs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").references(() => companies.id),
    clientId: varchar("client_id").references(() => clients.id),

    // Job Details
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    jobCategory: varchar("job_category", { length: 100 }),
    skillRequired: varchar("skill_required", { length: 100 }),

    // Rates
    workerWage: decimal("worker_wage", { precision: 8, scale: 2 }),
    billRate: decimal("bill_rate", { precision: 8, scale: 2 }),
    markupMultiplier: decimal("markup_multiplier", { precision: 5, scale: 2 }).default("1.35"),

    // Schedule
    startDate: date("start_date"),
    endDate: date("end_date"),
    jobStatus: varchar("job_status", { length: 50 }).default("open"),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_jobs_company_id").on(table.companyId),
    clientIdx: index("idx_jobs_client_id").on(table.clientId),
  })
);

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

// ========================
// Assignments (Worker → Job)
// ========================
export const assignments = pgTable(
  "assignments",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").references(() => companies.id),
    jobId: varchar("job_id").references(() => jobs.id),
    workerId: varchar("worker_id").references(() => workers.id),
    clientId: varchar("client_id").references(() => clients.id),

    // Schedule
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    startTime: varchar("start_time", { length: 5 }),
    endTime: varchar("end_time", { length: 5 }),

    // Status
    status: varchar("status", { length: 50 }).default("assigned"),
    confirmationRequired: boolean("confirmation_required").default(true),
    confirmedByWorker: boolean("confirmed_by_worker").default(false),
    confirmedAt: timestamp("confirmed_at"),

    // Rates
    workerRate: decimal("worker_rate", { precision: 8, scale: 2 }),
    billRate: decimal("bill_rate", { precision: 8, scale: 2 }),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_assignments_company_id").on(table.companyId),
    workerIdx: index("idx_assignments_worker_id").on(table.workerId),
    jobIdx: index("idx_assignments_job_id").on(table.jobId),
    startDateIdx: index("idx_assignments_start_date").on(table.startDate),
  })
);

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  confirmedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = typeof assignments.$inferSelect;

// ========================
// Timesheets (GPS Clock-in/out)
// ========================
export const timesheets = pgTable(
  "timesheets",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").references(() => companies.id),
    assignmentId: varchar("assignment_id").references(() => assignments.id),
    workerId: varchar("worker_id").references(() => workers.id),

    // Clock In/Out with GPS
    clockInTime: timestamp("clock_in_time"),
    clockInLatitude: decimal("clock_in_latitude", { precision: 9, scale: 6 }),
    clockInLongitude: decimal("clock_in_longitude", { precision: 9, scale: 6 }),
    clockInVerified: boolean("clock_in_verified"),

    clockOutTime: timestamp("clock_out_time"),
    clockOutLatitude: decimal("clock_out_latitude", { precision: 9, scale: 6 }),
    clockOutLongitude: decimal("clock_out_longitude", { precision: 9, scale: 6 }),
    clockOutVerified: boolean("clock_out_verified"),

    // Breaks
    lunchStart: timestamp("lunch_start"),
    lunchEnd: timestamp("lunch_end"),
    lunchDurationMinutes: integer("lunch_duration_minutes"),

    breaks: jsonb("breaks"), // [{start, end, duration}]

    // Totals
    totalHoursWorked: decimal("total_hours_worked", { precision: 8, scale: 2 }),
    breakHours: decimal("break_hours", { precision: 8, scale: 2 }),
    billableHours: decimal("billable_hours", { precision: 8, scale: 2 }),

    // Status
    status: varchar("status", { length: 50 }).default("draft"),
    submittedAt: timestamp("submitted_at"),
    approvedBy: varchar("approved_by").references(() => users.id),
    approvedAt: timestamp("approved_at"),
    notes: text("notes"),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_timesheets_company_id").on(table.companyId),
    assignmentIdx: index("idx_timesheets_assignment_id").on(table.assignmentId),
    workerIdx: index("idx_timesheets_worker_id").on(table.workerId),
    clockInIdx: index("idx_timesheets_clock_in_time").on(table.clockInTime),
  })
);

export const insertTimesheetSchema = createInsertSchema(timesheets).omit({
  id: true,
  submittedAt: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTimesheet = z.infer<typeof insertTimesheetSchema>;
export type Timesheet = typeof timesheets.$inferSelect;

// ========================
// Payroll
// ========================
export const payroll = pgTable(
  "payroll",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").references(() => companies.id),
    workerId: varchar("worker_id").references(() => workers.id),

    // Period
    payPeriodStart: date("pay_period_start"),
    payPeriodEnd: date("pay_period_end"),

    // Calculations
    grossPay: decimal("gross_pay", { precision: 10, scale: 2 }),
    federalTax: decimal("federal_tax", { precision: 10, scale: 2 }),
    stateTax: decimal("state_tax", { precision: 10, scale: 2 }),
    ficaTax: decimal("fica_tax", { precision: 10, scale: 2 }),
    otherDeductions: decimal("other_deductions", { precision: 10, scale: 2 }),
    netPay: decimal("net_pay", { precision: 10, scale: 2 }),

    // Status
    status: varchar("status", { length: 50 }).default("pending"),
    processedDate: timestamp("processed_date"),
    paidDate: timestamp("paid_date"),

    // Payment Method
    paymentMethod: varchar("payment_method", { length: 50 }),
    bankAccountLastFour: varchar("bank_account_last_four", { length: 4 }),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_payroll_company_id").on(table.companyId),
    workerIdx: index("idx_payroll_worker_id").on(table.workerId),
  })
);

export const insertPayrollSchema = createInsertSchema(payroll).omit({
  id: true,
  processedDate: true,
  paidDate: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
export type Payroll = typeof payroll.$inferSelect;

// ========================
// Invoices
// ========================
export const invoices = pgTable(
  "invoices",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").references(() => companies.id),
    clientId: varchar("client_id").references(() => clients.id),

    // Period
    invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
    invoiceDate: date("invoice_date"),
    dueDate: date("due_date"),

    // Amounts
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
    taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),

    // Status
    status: varchar("status", { length: 50 }).default("draft"),
    sentDate: timestamp("sent_date"),
    paidDate: timestamp("paid_date"),
    paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }),

    // Line Items
    lineItems: jsonb("line_items"),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_invoices_company_id").on(table.companyId),
    clientIdx: index("idx_invoices_client_id").on(table.clientId),
  })
);

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  sentDate: true,
  paidDate: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// ========================
// Messages
// ========================
export const messages = pgTable(
  "messages",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").references(() => companies.id),
    senderId: varchar("sender_id").references(() => users.id),
    recipientId: varchar("recipient_id").references(() => users.id),

    subject: varchar("subject", { length: 255 }),
    content: text("content"),

    read: boolean("read").default(false),
    readAt: timestamp("read_at"),

    attachmentUrl: varchar("attachment_url", { length: 255 }),

    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    recipientIdx: index("idx_messages_recipient_id").on(table.recipientId),
  })
);

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  readAt: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// ========================
// Time Off Requests
// ========================
export const timeOffRequests = pgTable(
  "time_off_requests",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").references(() => companies.id),
    workerId: varchar("worker_id").references(() => workers.id),

    requestDate: date("request_date"),
    startDate: date("start_date"),
    endDate: date("end_date"),

    reason: varchar("reason", { length: 255 }),
    status: varchar("status", { length: 50 }).default("pending"),

    reviewedBy: varchar("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at"),

    createdAt: timestamp("created_at").default(sql`NOW()`),
  }
);

export const insertTimeOffRequestSchema = createInsertSchema(timeOffRequests).omit({
  id: true,
  reviewedAt: true,
  createdAt: true,
});

export type InsertTimeOffRequest = z.infer<typeof insertTimeOffRequestSchema>;
export type TimeOffRequest = typeof timeOffRequests.$inferSelect;

// ========================
// Billing History
// ========================
export const billingHistory = pgTable(
  "billing_history",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").references(() => companies.id),

    // Change details
    previousModel: varchar("previous_model", { length: 50 }),
    newModel: varchar("new_model", { length: 50 }),
    previousTier: varchar("previous_tier", { length: 50 }),
    newTier: varchar("new_tier", { length: 50 }),
    reason: varchar("reason", { length: 255 }),

    // Cost tracking
    changeFee: decimal("change_fee", { precision: 10, scale: 2 }), // null for free changes
    effectiveDate: date("effective_date"),

    // Status
    status: varchar("status", { length: 50 }).default("pending"), // pending, approved, completed

    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_billing_history_company_id").on(table.companyId),
  })
);

export const insertBillingHistorySchema = createInsertSchema(billingHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertBillingHistory = z.infer<typeof insertBillingHistorySchema>;
export type BillingHistory = typeof billingHistory.$inferSelect;

// ========================
// Feedback
// ========================
export const userFeedback = pgTable(
  "user_feedback",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").references(() => users.id),
    companyId: varchar("company_id").references(() => companies.id),

    feedbackText: text("feedback_text").notNull(),
    email: varchar("email", { length: 255 }),
    category: varchar("category", { length: 100 }),

    status: varchar("status", { length: 50 }).default("new"),
    reviewedAt: timestamp("reviewed_at"),
    reviewedBy: varchar("reviewed_by").references(() => users.id),

    createdAt: timestamp("created_at").default(sql`NOW()`),
  }
);

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({
  id: true,
  reviewedAt: true,
  createdAt: true,
});

export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type UserFeedback = typeof userFeedback.$inferSelect;

// ========================
// Licenses (Franchise/One-Off Sales)
// ========================
export const licenses = pgTable(
  "licenses",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").references(() => companies.id),

    // License Type
    licenseType: varchar("license_type", { length: 50 }).notNull(), // "subscription", "franchise", "enterprise"
    licenseTier: varchar("license_tier", { length: 50 }), // "startup", "growth", "enterprise", "custom"

    // Pricing
    oneTimeFee: decimal("one_time_fee", { precision: 10, scale: 2 }), // For franchise licenses
    monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }), // For subscriptions
    revenueSharePercentage: decimal("revenue_share_percentage", { precision: 5, scale: 2 }),

    // Capacity
    maxWorkers: integer("max_workers").default(50),
    maxClients: integer("max_clients").default(5),
    maxEvents: integer("max_events").default(5),

    // Status
    status: varchar("status", { length: 50 }).notNull().default("active"), // active, paused, cancelled, expired
    
    // Duration
    startDate: date("start_date"),
    expiryDate: date("expiry_date"), // null for perpetual franchise licenses
    autoRenew: boolean("auto_renew").default(true),

    // Support/Warranty Period
    supportStartDate: date("support_start_date"),
    supportEndDate: date("support_end_date"), // Warranty period end
    customizationIncluded: boolean("customization_included").default(true), // Can we customize for them?

    // Multi-Agency Hub (Enterprise)
    parentCompanyId: varchar("parent_company_id").references(() => companies.id), // For child agencies
    isHub: boolean("is_hub").default(false), // This is a hub managing multiple agencies
    hubName: varchar("hub_name", { length: 255 }), // Name for the consolidated view
    managedAgencyCount: integer("managed_agency_count").default(0), // How many child agencies

    // Features
    whiteLabel: boolean("white_label").default(false),
    apiAccess: boolean("api_access").default(false),
    dedicatedSupport: boolean("dedicated_support").default(false),
    customBranding: boolean("custom_branding").default(false),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_licenses_company_id").on(table.companyId),
    statusIdx: index("idx_licenses_status").on(table.status),
  })
);

export const insertLicenseSchema = createInsertSchema(licenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLicense = z.infer<typeof insertLicenseSchema>;
export type License = typeof licenses.$inferSelect;

// ========================
// Feature Requests (Customer Feedback)
// ========================
export const featureRequests = pgTable(
  "feature_requests",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").references(() => companies.id),
    licenseId: varchar("license_id").references(() => licenses.id),

    // Request Details
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 100 }), // "automation", "integration", "reporting", "ui", "other"
    priority: varchar("priority", { length: 50 }).default("medium"), // "low", "medium", "high", "critical"

    // Status
    status: varchar("status", { length: 50 }).notNull().default("open"), // "open", "in-review", "planned", "in-progress", "completed", "declined"
    
    // Tracking
    submittedBy: varchar("submitted_by").references(() => users.id),
    reviewedBy: varchar("reviewed_by").references(() => users.id),
    completedAt: timestamp("completed_at"),

    // Implementation Notes
    notes: text("notes"),
    estimatedImplementation: date("estimated_implementation"),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_feature_requests_company_id").on(table.companyId),
    licenseIdx: index("idx_feature_requests_license_id").on(table.licenseId),
    statusIdx: index("idx_feature_requests_status").on(table.status),
  })
);

export const insertFeatureRequestSchema = createInsertSchema(featureRequests).omit({
  id: true,
  reviewedBy: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFeatureRequest = z.infer<typeof insertFeatureRequestSchema>;
export type FeatureRequest = typeof featureRequests.$inferSelect;

// ========================
// Payments (Transaction History)
// ========================
export const payments = pgTable(
  "payments",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").references(() => companies.id),
    licenseId: varchar("license_id").references(() => licenses.id),

    // Payment Details
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    description: text("description"),

    // Payment Method
    paymentMethod: varchar("payment_method", { length: 50 }), // "card", "bank_transfer", "check", "invoice"
    stripePaymentIntentId: varchar("stripe_payment_intent_id"), // Stripe integration ID

    // Status
    status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, processing, completed, failed, refunded
    paymentDate: timestamp("payment_date"),
    failureReason: text("failure_reason"),

    // Invoice Reference
    invoiceId: varchar("invoice_id").references(() => invoices.id),

    // Metadata
    notes: text("notes"),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_payments_company_id").on(table.companyId),
    licenseIdx: index("idx_payments_license_id").on(table.licenseId),
    statusIdx: index("idx_payments_status").on(table.status),
    stripeIdx: index("idx_payments_stripe_id").on(table.stripePaymentIntentId),
  })
);

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  paymentDate: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
