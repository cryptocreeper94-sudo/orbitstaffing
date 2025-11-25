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
    // Roles: master_admin (system owner), franchise_admin (franchise owner), customer_admin (monthly customer owner), manager, worker, client
    role: varchar("role", { length: 50 }).notNull().default("worker"),
    // tenantId: identifies which tenant/company this user belongs to (for multi-tenant isolation)
    tenantId: varchar("tenant_id").references(() => companies.id),
    companyId: varchar("company_id").references(() => companies.id), // Deprecated - use tenantId
    franchiseId: varchar("franchise_id").references(() => franchises.id), // For franchise owners
    adminPin: varchar("admin_pin", { length: 4 }), // 4-digit PIN for admin login
    fullName: varchar("full_name", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    verified: boolean("verified").default(false),
    verifiedAt: timestamp("verified_at"),
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_users_tenant_id").on(table.tenantId),
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
    monthlyFlatFee: decimal("monthly_flat_fee", { precision: 10, scale: 2 }).default("0"),

    // Compliance
    ein: varchar("ein", { length: 20 }),
    licenseNumber: varchar("license_number", { length: 100 }),
    licenseExpiration: date("license_expiration"),

    // Features
    maxWorkers: integer("max_workers").default(100),
    smsEnabled: boolean("sms_enabled").default(false),
    gpsEnabled: boolean("gps_enabled").default(true),
    equipmentTrackingEnabled: boolean("equipment_tracking_enabled").default(true),
    payrollEnabled: boolean("payroll_enabled").default(true),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    ownerIdx: index("idx_companies_owner").on(table.ownerId),
    nameIdx: index("idx_companies_name").on(table.name),
  })
);

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// ========================
// Franchises (White-label Deployments)
// ========================
export const franchises = pgTable(
  "franchises",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    ownerId: varchar("owner_id").references(() => users.id),
    parentFranchiseId: varchar("parent_franchise_id").references(() => franchises.id), // For sub-franchises

    // Business Details
    industry: varchar("industry", { length: 100 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    website: varchar("website", { length: 255 }),

    // Branding
    brandColor: varchar("brand_color", { length: 7 }).default("#06B6D4"),
    logoUrl: varchar("logo_url", { length: 255 }),
    theme: varchar("theme", { length: 50 }).default("dark"),

    // License
    licenseKey: varchar("license_key", { length: 100 }).unique(),
    licenseExpiration: date("license_expiration"),
    licenseStatus: varchar("license_status", { length: 50 }).default("active"), // active, suspended, expired

    // Territory
    territory: varchar("territory", { length: 255 }), // "Southeast US", "CA Bay Area", etc.
    exclusivity: boolean("exclusivity").default(true),

    // Hallmark Prefix
    hallmarkPrefix: varchar("hallmark_prefix", { length: 20 }).unique(),
    nextHallmarkSerial: integer("next_hallmark_serial").default(1),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    ownerIdx: index("idx_franchises_owner").on(table.ownerId),
    licenseKeyIdx: index("idx_franchises_license_key").on(table.licenseKey),
    hallmarkPrefixIdx: index("idx_franchises_hallmark_prefix").on(table.hallmarkPrefix),
  })
);

export const insertFranchiseSchema = createInsertSchema(franchises).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFranchise = z.infer<typeof insertFranchiseSchema>;
export type Franchise = typeof franchises.$inferSelect;

// ========================
// Monthly Subscription Customers
// ========================
export const monthlySubscriptionCustomers = pgTable(
  "monthly_subscription_customers",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    contactEmail: varchar("contact_email", { length: 255 }).notNull(),
    contactPhone: varchar("contact_phone", { length: 20 }),
    
    // Subscription Details
    subscriptionPlan: varchar("subscription_plan", { length: 50 }).notNull(), // starter, professional, enterprise
    monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
    autoBackupEnabled: boolean("auto_backup_enabled").default(true),
    backupFrequency: varchar("backup_frequency", { length: 50 }).default("weekly"), // daily, weekly, monthly
    
    // File Storage
    fileStorageQuotaMB: integer("file_storage_quota_mb").default(5120), // 5GB default
    fileStorageUsedMB: integer("file_storage_used_mb").default(0),
    
    // Status
    status: varchar("status", { length: 50 }).default("active"), // active, suspended, canceled
    billingStatus: varchar("billing_status", { length: 50 }).default("current"), // current, overdue, past_due
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    emailIdx: index("idx_customer_email").on(table.contactEmail),
    statusIdx: index("idx_customer_status").on(table.status),
  })
);

export const insertMonthlySubscriptionCustomerSchema = createInsertSchema(monthlySubscriptionCustomers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMonthlySubscriptionCustomer = z.infer<typeof insertMonthlySubscriptionCustomerSchema>;
export type MonthlySubscriptionCustomer = typeof monthlySubscriptionCustomers.$inferSelect;

// ========================
// Workers
// ========================
export const workers = pgTable(
  "workers",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").references(() => users.id),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id), // Multi-tenant isolation
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

    // Employee Info
    employeeNumber: varchar("employee_number", { length: 50 }).unique(),
    onboardingCompleted: boolean("onboarding_completed").default(false),
    onboardingCompletedDate: timestamp("onboarding_completed_date"),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_workers_tenant_id").on(table.tenantId),
    companyIdx: index("idx_workers_company_id").on(table.companyId),
    userIdx: index("idx_workers_user_id").on(table.userId),
    employeeNumberIdx: index("idx_workers_employee_number").on(table.employeeNumber),
  })
);

export const insertWorkerSchema = createInsertSchema(workers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type Worker = typeof workers.$inferSelect;

// ========================
// Clients (Job Sites / Organizations requesting workers)
// ========================
export const clients = pgTable(
  "clients",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id), // Multi-tenant isolation
    companyId: varchar("company_id").references(() => companies.id),

    name: varchar("name", { length: 255 }).notNull(),
    contactName: varchar("contact_name", { length: 255 }),
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 20 }),
    industry: varchar("industry", { length: 100 }),

    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    zipCode: varchar("zip_code", { length: 10 }),

    // Work Info
    jobTypes: jsonb("job_types"), // ['construction', 'cleaning', etc.]
    estimatedMonthlySpend: decimal("estimated_monthly_spend", { precision: 10, scale: 2 }),
    status: varchar("status", { length: 50 }).default("active"),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_clients_tenant_id").on(table.tenantId),
    companyIdx: index("idx_clients_company_id").on(table.companyId),
    nameIdx: index("idx_clients_name").on(table.name),
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
// Job Postings
// ========================
export const jobPostings = pgTable(
  "job_postings",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id), // Multi-tenant isolation
    companyId: varchar("company_id").references(() => companies.id),
    clientId: varchar("client_id").references(() => clients.id),

    jobTitle: varchar("job_title", { length: 255 }).notNull(),
    description: text("description"),
    requiredSkills: jsonb("required_skills"), // ['electrical', 'plumbing']
    qualifications: text("qualifications"),

    // Job Details
    jobType: varchar("job_type", { length: 50 }), // full-time, part-time, temporary, contract
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    duration: varchar("duration", { length: 100 }), // "1 week", "2 months"

    // Location
    latitude: decimal("latitude", { precision: 9, scale: 6 }),
    longitude: decimal("longitude", { precision: 9, scale: 6 }),
    geofenceRadius: integer("geofence_radius").default(300), // meters

    // Pay
    hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
    minimumHours: integer("minimum_hours"),
    maximumHours: integer("maximum_hours"),

    // Status
    status: varchar("status", { length: 50 }).default("open"), // open, filled, closed
    positionsAvailable: integer("positions_available").default(1),
    positionsFilled: integer("positions_filled").default(0),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_job_postings_tenant").on(table.tenantId),
    companyIdx: index("idx_job_postings_company").on(table.companyId),
    clientIdx: index("idx_job_postings_client").on(table.clientId),
    statusIdx: index("idx_job_postings_status").on(table.status),
    startDateIdx: index("idx_job_postings_start_date").on(table.startDate),
  })
);

export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type JobPosting = typeof jobPostings.$inferSelect;

// ========================
// Assignments (Worker-Job matches)
// ========================
export const assignments = pgTable(
  "assignments",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id), // Multi-tenant isolation
    jobPostingId: varchar("job_posting_id").references(() => jobPostings.id),
    workerId: varchar("worker_id").references(() => workers.id),
    companyId: varchar("company_id").references(() => companies.id),

    // Assignment Details
    assignmentStatus: varchar("assignment_status", { length: 50 }).default("pending"), // pending, accepted, rejected, completed, no-show
    acceptedAt: timestamp("accepted_at"),
    rejectedAt: timestamp("rejected_at"),
    rejectionReason: text("rejection_reason"),

    // Scheduling
    scheduledStartTime: timestamp("scheduled_start_time"),
    scheduledEndTime: timestamp("scheduled_end_time"),
    actualStartTime: timestamp("actual_start_time"),
    actualEndTime: timestamp("actual_end_time"),

    // Rating
    workerRating: integer("worker_rating"), // 1-5
    workerFeedback: text("worker_feedback"),
    clientRating: integer("client_rating"), // 1-5
    clientFeedback: text("client_feedback"),

    // Hallmark
    hallmarkId: varchar("hallmark_id"),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_assignments_tenant").on(table.tenantId),
    jobPostingIdx: index("idx_assignments_job_posting").on(table.jobPostingId),
    workerIdx: index("idx_assignments_worker").on(table.workerId),
    companyIdx: index("idx_assignments_company").on(table.companyId),
    statusIdx: index("idx_assignments_status").on(table.assignmentStatus),
  })
);

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  acceptedAt: true,
  rejectedAt: true,
  actualStartTime: true,
  actualEndTime: true,
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
    tenantId: varchar("tenant_id").notNull().references(() => companies.id), // Multi-tenant isolation
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
    tenantIdx: index("idx_timesheets_tenant_id").on(table.tenantId),
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
    tenantId: varchar("tenant_id").notNull().references(() => companies.id), // Multi-tenant isolation
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
    processedAt: timestamp("processed_at"),
    paidAt: timestamp("paid_at"),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_payroll_tenant").on(table.tenantId),
    companyIdx: index("idx_payroll_company").on(table.companyId),
    workerIdx: index("idx_payroll_worker").on(table.workerId),
    periodIdx: index("idx_payroll_period").on(table.payPeriodStart),
  })
);

export const insertPayrollSchema = createInsertSchema(payroll).omit({
  id: true,
  processedAt: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
export type Payroll = typeof payroll.$inferSelect;

// ========================
// Worker Bonuses
// ========================
export const workerBonuses = pgTable(
  "worker_bonuses",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id), // Multi-tenant isolation
    workerId: varchar("worker_id").notNull().references(() => workers.id),
    companyId: varchar("company_id").notNull().references(() => companies.id),
    
    // Bonus Period
    weekStartDate: date("week_start_date").notNull(),
    weekEndDate: date("week_end_date").notNull(),
    
    // Bonus Calculation
    baseBonus: decimal("base_bonus", { precision: 10, scale: 2 }).default("0"), // Weekly performance
    attendanceBonus: decimal("attendance_bonus", { precision: 10, scale: 2 }).default("0"), // Perfect attendance
    hoursBonus: decimal("hours_bonus", { precision: 10, scale: 2 }).default("0"), // Milestone hours
    referralBonus: decimal("referral_bonus", { precision: 10, scale: 2 }).default("0"), // New hire referrals
    totalBonus: decimal("total_bonus", { precision: 10, scale: 2 }).default("0"),
    
    // Performance Metrics
    attendanceStreak: integer("attendance_streak").default(0), // Days in a row
    totalHoursWorked: decimal("total_hours_worked", { precision: 8, scale: 2 }).default("0"),
    jobsCompleted: integer("jobs_completed").default(0),
    referralsMade: integer("referrals_made").default(0),
    
    // Status
    status: varchar("status", { length: 50 }).default("pending"), // pending, approved, paid
    approvedBy: varchar("approved_by").references(() => users.id),
    approvedAt: timestamp("approved_at"),
    paidAt: timestamp("paid_at"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_bonuses_tenant").on(table.tenantId),
    workerIdx: index("idx_bonuses_worker").on(table.workerId),
    companyIdx: index("idx_bonuses_company").on(table.companyId),
    periodIdx: index("idx_bonuses_period").on(table.weekStartDate),
    statusIdx: index("idx_bonuses_status").on(table.status),
  })
);

export const insertWorkerBonusSchema = createInsertSchema(workerBonuses).omit({
  id: true,
  approvedAt: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorkerBonus = z.infer<typeof insertWorkerBonusSchema>;
export type WorkerBonus = typeof workerBonuses.$inferSelect;

// ========================
// Equipment Tracking
// ========================
export const equipment = pgTable(
  "equipment",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id), // Multi-tenant isolation
    companyId: varchar("company_id").references(() => companies.id),

    name: varchar("name", { length: 255 }).notNull(),
    equipmentType: varchar("equipment_type", { length: 100 }), // PPE, tools, devices
    sku: varchar("sku", { length: 100 }).unique(),
    serialNumber: varchar("serial_number", { length: 100 }).unique(),

    // Costs
    purchaseCost: decimal("purchase_cost", { precision: 10, scale: 2 }),
    replacementCost: decimal("replacement_cost", { precision: 10, scale: 2 }),
    dailyRentalCost: decimal("daily_rental_cost", { precision: 10, scale: 2 }),

    // Status
    status: varchar("status", { length: 50 }).default("available"),
    condition: varchar("condition", { length: 50 }), // new, excellent, good, fair, damaged

    // Assignment
    assignedToWorkerId: varchar("assigned_to_worker_id").references(() => workers.id),
    assignmentDate: timestamp("assignment_date"),
    returnDate: timestamp("return_date"),

    // Tracking
    locationLatitude: decimal("location_latitude", { precision: 9, scale: 6 }),
    locationLongitude: decimal("location_longitude", { precision: 9, scale: 6 }),
    lastSeenAt: timestamp("last_seen_at"),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_equipment_tenant").on(table.tenantId),
    companyIdx: index("idx_equipment_company").on(table.companyId),
    skuIdx: index("idx_equipment_sku").on(table.sku),
    statusIdx: index("idx_equipment_status").on(table.status),
    workerIdx: index("idx_equipment_worker").on(table.assignedToWorkerId),
  })
);

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  assignmentDate: true,
  returnDate: true,
  lastSeenAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Equipment = typeof equipment.$inferSelect;

// ========================
// Invoicing
// ========================
export const invoices = pgTable(
  "invoices",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id), // Multi-tenant isolation
    companyId: varchar("company_id").references(() => companies.id),
    clientId: varchar("client_id").references(() => clients.id),

    invoiceNumber: varchar("invoice_number", { length: 50 }).unique(),
    invoiceDate: date("invoice_date"),
    dueDate: date("due_date"),

    // Line Items
    lineItems: jsonb("line_items"), // [{description, quantity, rate, amount}]

    // Totals
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
    tax: decimal("tax", { precision: 10, scale: 2 }),
    total: decimal("total", { precision: 10, scale: 2 }),

    // Status
    status: varchar("status", { length: 50 }).default("draft"), // draft, sent, viewed, paid, overdue
    paidAt: timestamp("paid_at"),
    paymentMethod: varchar("payment_method", { length: 50 }),

    // Hallmark
    hallmarkId: varchar("hallmark_id"),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_invoices_tenant").on(table.tenantId),
    companyIdx: index("idx_invoices_company").on(table.companyId),
    clientIdx: index("idx_invoices_client").on(table.clientId),
    numberIdx: index("idx_invoices_number").on(table.invoiceNumber),
    statusIdx: index("idx_invoices_status").on(table.status),
  })
);

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// ========================
// Paystubs
// ========================
export const paystubs = pgTable(
  "paystubs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id), // Multi-tenant isolation
    payrollId: varchar("payroll_id").references(() => payroll.id),
    workerId: varchar("worker_id").references(() => workers.id),
    companyId: varchar("company_id").references(() => companies.id),

    // Paystub Details
    paystubNumber: varchar("paystub_number", { length: 50 }).unique(),
    payDate: date("pay_date"),

    // Income
    hoursWorked: decimal("hours_worked", { precision: 8, scale: 2 }),
    hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
    grossPay: decimal("gross_pay", { precision: 10, scale: 2 }),

    // Deductions
    federalIncomeTax: decimal("federal_income_tax", { precision: 10, scale: 2 }),
    stateIncomeTax: decimal("state_income_tax", { precision: 10, scale: 2 }),
    ficaTax: decimal("fica_tax", { precision: 10, scale: 2 }),
    otherDeductions: decimal("other_deductions", { precision: 10, scale: 2 }),

    // Net
    netPay: decimal("net_pay", { precision: 10, scale: 2 }),

    // Hallmark
    hallmarkId: varchar("hallmark_id"),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_paystubs_tenant").on(table.tenantId),
    payrollIdx: index("idx_paystubs_payroll").on(table.payrollId),
    workerIdx: index("idx_paystubs_worker").on(table.workerId),
    companyIdx: index("idx_paystubs_company").on(table.companyId),
    numberIdx: index("idx_paystubs_number").on(table.paystubNumber),
  })
);

export const insertPaystubSchema = createInsertSchema(paystubs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPaystub = z.infer<typeof insertPaystubSchema>;
export type Paystub = typeof paystubs.$inferSelect;

// ========================
// Hallmark System
// ========================
export const hallmarks = pgTable(
  "hallmarks",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    hallmarkNumber: varchar("hallmark_number", { length: 50 }).notNull().unique(), // ORBIT-20251124-AB2K7X
    assetType: varchar("asset_type", { length: 50 }).notNull(), // letter, invoice, paystub, equipment, payroll
    referenceId: varchar("reference_id", { length: 255 }), // ID of the original asset (letter ID, invoice ID, etc.)
    
    // Metadata
    createdBy: varchar("created_by", { length: 255 }), // Who generated this (admin name, system, etc.)
    recipientName: varchar("recipient_name", { length: 255 }), // Who received it
    recipientRole: varchar("recipient_role", { length: 50 }), // employee, owner, admin
    
    // Content hash for verification
    contentHash: varchar("content_hash", { length: 64 }), // SHA-256 of content for integrity checking
    
    // Metadata
    metadata: jsonb("metadata"), // {letterType, company, amount, description, etc}
    
    // Tracking
    createdAt: timestamp("created_at").default(sql`NOW()`),
    expiresAt: timestamp("expires_at"), // For temporary assets like demo letters
    verifiedAt: timestamp("verified_at"), // When hallmark was verified/audited
    
    // Searchable fields
    searchTerms: varchar("search_terms", { length: 1000 }), // Denormalized search data
  },
  (table) => ({
    hallmarkNumberIdx: index("idx_hallmarks_number").on(table.hallmarkNumber),
    assetTypeIdx: index("idx_hallmarks_asset_type").on(table.assetType),
    referenceIdIdx: index("idx_hallmarks_reference_id").on(table.referenceId),
    recipientNameIdx: index("idx_hallmarks_recipient_name").on(table.recipientName),
    createdAtIdx: index("idx_hallmarks_created_at").on(table.createdAt),
    searchTermsIdx: index("idx_hallmarks_search_terms").on(table.searchTerms),
  })
);

export const insertHallmarkSchema = createInsertSchema(hallmarks).omit({
  id: true,
  createdAt: true,
  verifiedAt: true,
});

export type InsertHallmark = z.infer<typeof insertHallmarkSchema>;
export type Hallmark = typeof hallmarks.$inferSelect;

export const hallmarkAudit = pgTable(
  "hallmark_audit",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    hallmarkId: varchar("hallmark_id").notNull().references(() => hallmarks.id),
    action: varchar("action", { length: 50 }).notNull(), // created, verified, revoked, updated
    performedBy: varchar("performed_by", { length: 255 }), // Who performed the action
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    hallmarkIdIdx: index("idx_audit_hallmark_id").on(table.hallmarkId),
    actionIdx: index("idx_audit_action").on(table.action),
    createdAtIdx: index("idx_audit_created_at").on(table.createdAt),
  })
);

export const insertHallmarkAuditSchema = createInsertSchema(hallmarkAudit).omit({
  id: true,
  createdAt: true,
});

export type InsertHallmarkAudit = z.infer<typeof hallmarkAuditSchema>;
export type HallmarkAudit = typeof hallmarkAudit.$inferSelect;

// ========================
// Company Hallmarks
// ========================
export const companyHallmarks = pgTable(
  "company_hallmarks",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").notNull().unique().references(() => companies.id),
    hallmarkPrefix: varchar("hallmark_prefix", { length: 20 }).notNull(),
    nextSerialNumber: integer("next_serial_number").default(1),
    brandColor: varchar("brand_color", { length: 7 }).default("#06B6D4"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_company_hallmarks_company").on(table.companyId),
    prefixIdx: index("idx_company_hallmarks_prefix").on(table.hallmarkPrefix),
  })
);

export const insertCompanyHallmarkSchema = createInsertSchema(companyHallmarks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCompanyHallmark = z.infer<typeof insertCompanyHallmarkSchema>;
export type CompanyHallmark = typeof companyHallmarks.$inferSelect;

// ========================
// Bug Reports (NEW)
// ========================
export const bugReports = pgTable(
  "bug_reports",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    reportedByEmail: varchar("reported_by_email", { length: 255 }).notNull(),
    reportedByName: varchar("reported_by_name", { length: 255 }),
    
    // Bug Details
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    errorMessage: text("error_message"),
    stackTrace: text("stack_trace"),
    
    // Context
    pageUrl: varchar("page_url", { length: 255 }),
    userAgent: text("user_agent"),
    browserConsole: text("browser_console"),
    
    // Screenshot
    screenshotBase64: text("screenshot_base64"), // Base64 encoded screenshot
    screenshotUrl: varchar("screenshot_url", { length: 255 }), // URL to stored screenshot
    
    // Severity
    severity: varchar("severity", { length: 50 }).default("medium"), // low, medium, high, critical
    category: varchar("category", { length: 100 }), // ui, api, performance, data, other
    
    // Status
    status: varchar("status", { length: 50 }).default("new"), // new, acknowledged, in-progress, resolved, wont-fix
    notes: text("notes"), // Developer notes
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    emailIdx: index("idx_bug_email").on(table.reportedByEmail),
    statusIdx: index("idx_bug_status").on(table.status),
    severityIdx: index("idx_bug_severity").on(table.severity),
    createdAtIdx: index("idx_bug_created_at").on(table.createdAt),
  })
);

export const insertBugReportSchema = createInsertSchema(bugReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBugReport = z.infer<typeof insertBugReportSchema>;
export type BugReport = typeof bugReports.$inferSelect;

// ========================
// Developer Messages (Communication with Agent)
// ========================
export const developerMessages = pgTable(
  "developer_messages",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    bugReportId: varchar("bug_report_id").references(() => bugReports.id),
    
    role: varchar("role", { length: 50 }).notNull(), // "developer", "ai"
    content: text("content").notNull(),
    
    // Context for discussions
    context: jsonb("context"), // {topic, relatedBugId, etc}
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    bugReportIdx: index("idx_dev_msg_bug").on(table.bugReportId),
    roleIdx: index("idx_dev_msg_role").on(table.role),
    createdAtIdx: index("idx_dev_msg_created_at").on(table.createdAt),
  })
);

export const insertDeveloperMessageSchema = createInsertSchema(developerMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertDeveloperMessage = z.infer<typeof insertDeveloperMessageSchema>;
export type DeveloperMessage = typeof developerMessages.$inferSelect;

// ========================
// Feedback (General)
// ========================
export const feedback = pgTable(
  "feedback",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    message: text("message").notNull(),
    type: varchar("type", { length: 50 }).default("general"), // general, feature_request, bug, improvement
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    emailIdx: index("idx_feedback_email").on(table.email),
    typeIdx: index("idx_feedback_type").on(table.type),
  })
);

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

// ========================
// Incidents (Field Issues)
// ========================
export const incidents = pgTable(
  "incidents",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id), // Multi-tenant isolation
    companyId: varchar("company_id").references(() => companies.id),
    assignmentId: varchar("assignment_id").references(() => assignments.id),
    workerId: varchar("worker_id").references(() => workers.id),

    // Incident Details
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    incidentType: varchar("incident_type", { length: 100 }), // injury, equipment-damage, no-show, conflict
    severity: varchar("severity", { length: 50 }).default("medium"),

    // Location
    latitude: decimal("latitude", { precision: 9, scale: 6 }),
    longitude: decimal("longitude", { precision: 9, scale: 6 }),

    // Status
    status: varchar("status", { length: 50 }).default("open"), // open, investigating, resolved, closed

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_incidents_tenant").on(table.tenantId),
    companyIdx: index("idx_incidents_company").on(table.companyId),
    workerIdx: index("idx_incidents_worker").on(table.workerId),
    statusIdx: index("idx_incidents_status").on(table.status),
  })
);

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;

// ========================
// ORBIT Assets (Internal)
// ========================
export const orbitAssets = pgTable(
  "orbit_assets",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    assetNumber: varchar("asset_number", { length: 100 }).notNull().unique(),
    type: varchar("type", { length: 50 }).notNull(),
    franchiseeId: varchar("franchisee_id").references(() => franchises.id),
    customerId: varchar("customer_id").references(() => monthlySubscriptionCustomers.id),

    // Metadata
    metadata: jsonb("metadata"),
    status: varchar("status", { length: 50 }).default("active"),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    assetNumberIdx: index("idx_orbit_assets_number").on(table.assetNumber),
    franchiseeIdx: index("idx_orbit_assets_franchisee").on(table.franchiseeId),
  })
);

export const insertOrbitAssetSchema = createInsertSchema(orbitAssets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrbitAsset = z.infer<typeof insertOrbitAssetSchema>;
export type OrbitAsset = typeof orbitAssets.$inferSelect;

// ========================
// ORBIT Internal CRM (Scanned Business Cards - ORBID)
// ========================
export const orbidAdminCRM = pgTable(
  "orbid_admin_crm",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    staffMemberId: varchar("staff_member_id").notNull(), // Jason (#1) or Sidonie (#2)
    
    fullName: varchar("full_name", { length: 255 }).notNull(),
    jobTitle: varchar("job_title", { length: 255 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    company: varchar("company", { length: 255 }),
    address: text("address"),
    website: varchar("website", { length: 255 }),
    linkedIn: varchar("linked_in", { length: 255 }),
    
    // OCR Metadata
    ocrConfidence: decimal("ocr_confidence", { precision: 3, scale: 2 }), // 0-1
    sourceImage: varchar("source_image", { length: 255 }), // URL or base64
    
    // Notes
    notes: text("notes"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    staffMemberIdx: index("idx_orbid_staff_member").on(table.staffMemberId),
    emailIdx: index("idx_orbid_email").on(table.email),
    createdAtIdx: index("idx_orbid_created_at").on(table.createdAt),
  })
);

export const insertOrbidAdminCRMSchema = createInsertSchema(orbidAdminCRM).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrbidAdminCRM = z.infer<typeof insertOrbidAdminCRMSchema>;
export type OrbidAdminCRM = typeof orbidAdminCRM.$inferSelect;

// ========================
// Franchisee Team CRM (Scanned Business Cards)
// ========================
export const franchiseeTeamCRM = pgTable(
  "franchisee_team_crm",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id), // Multi-tenant isolation
    companyId: varchar("company_id").notNull().references(() => companies.id),
    
    fullName: varchar("full_name", { length: 255 }).notNull(),
    jobTitle: varchar("job_title", { length: 255 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    company: varchar("company", { length: 255 }),
    address: text("address"),
    website: varchar("website", { length: 255 }),
    linkedIn: varchar("linked_in", { length: 255 }),
    
    // OCR Metadata
    ocrConfidence: decimal("ocr_confidence", { precision: 3, scale: 2 }), // 0-1
    sourceImage: varchar("source_image", { length: 255 }), // URL or base64
    
    // Notes
    notes: text("notes"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_franchisee_crm_tenant").on(table.tenantId),
    companyIdx: index("idx_franchisee_crm_company").on(table.companyId),
    emailIdx: index("idx_franchisee_crm_email").on(table.email),
    createdAtIdx: index("idx_franchisee_crm_created_at").on(table.createdAt),
  })
);

export const insertFranchiseeCRMSchema = createInsertSchema(franchiseeTeamCRM).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFranchiseeCRM = z.infer<typeof insertFranchiseeCRMSchema>;
export type FranchiseeCRM = typeof franchiseeTeamCRM.$inferSelect;

// ========================
// Monthly Customer CRM (Scanned Business Cards)
// ========================
export const scannedContacts = pgTable(
  "scanned_contacts",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    monthlyCustomerId: varchar("monthly_customer_id").notNull().references(() => monthlySubscriptionCustomers.id),
    
    fullName: varchar("full_name", { length: 255 }).notNull(),
    jobTitle: varchar("job_title", { length: 255 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    company: varchar("company", { length: 255 }),
    address: text("address"),
    website: varchar("website", { length: 255 }),
    linkedIn: varchar("linked_in", { length: 255 }),
    
    // OCR Metadata
    ocrConfidence: decimal("ocr_confidence", { precision: 3, scale: 2 }), // 0-1
    sourceImage: varchar("source_image", { length: 255 }), // URL or base64
    
    // Notes
    notes: text("notes"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    customerIdx: index("idx_scanned_customer").on(table.monthlyCustomerId),
    emailIdx: index("idx_scanned_email").on(table.email),
    createdAtIdx: index("idx_scanned_created_at").on(table.createdAt),
  })
);

export const insertScannedContactSchema = createInsertSchema(scannedContacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertScannedContact = z.infer<typeof insertScannedContactSchema>;
export type ScannedContact = typeof scannedContacts.$inferSelect;

// ========================
// Customer File Backups
// ========================
export const customerFileBackups = pgTable(
  "customer_file_backups",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    monthlyCustomerId: varchar("monthly_customer_id").notNull().references(() => monthlySubscriptionCustomers.id),
    
    // Backup Info
    backupName: varchar("backup_name", { length: 255 }).notNull(),
    backupSizeMB: integer("backup_size_mb").notNull(),
    fileCount: integer("file_count").notNull(),
    
    // Storage
    storageLocation: varchar("storage_location", { length: 255 }), // S3 path, local path, etc
    checksumSHA256: varchar("checksum_sha256", { length: 64 }), // For integrity verification
    
    // Status
    status: varchar("status", { length: 50 }).default("completed"), // pending, in-progress, completed, failed
    
    backedUpAt: timestamp("backed_up_at").default(sql`NOW()`),
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    customerIdx: index("idx_backup_customer").on(table.monthlyCustomerId),
    statusIdx: index("idx_backup_status").on(table.status),
    backedUpAtIdx: index("idx_backup_backed_up_at").on(table.backedUpAt),
  })
);

export const insertCustomerFileBackupSchema = createInsertSchema(customerFileBackups).omit({
  id: true,
  backedUpAt: true,
  createdAt: true,
});

export type InsertCustomerFileBackup = z.infer<typeof insertCustomerFileBackupSchema>;
export type CustomerFileBackup = typeof customerFileBackups.$inferSelect;

// ========================
// OCR Scanned Contacts - Audit
// ========================
export const scannedContactsAudit = pgTable(
  "scanned_contacts_audit",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    scannedContactId: varchar("scanned_contact_id").references(() => scannedContacts.id),
    monthlyCustomerId: varchar("monthly_customer_id").references(() => monthlySubscriptionCustomers.id),
    action: varchar("action", { length: 50 }).notNull(), // "created", "edited", "accessed"
    performedBy: varchar("performed_by", { length: 255 }),
    details: text("details"),
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    contactIdx: index("idx_audit_contact").on(table.scannedContactId),
    customerIdx: index("idx_audit_customer").on(table.monthlyCustomerId),
    actionIdx: index("idx_audit_action").on(table.action),
  })
);

export const insertScannedContactsAuditSchema = createInsertSchema(scannedContactsAudit).omit({
  id: true,
  createdAt: true,
});

export type InsertScannedContactsAudit = z.infer<typeof insertScannedContactsAuditSchema>;
export type ScannedContactsAudit = typeof scannedContactsAudit.$inferSelect;
