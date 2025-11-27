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
  serial,
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

    // NDA Tracking (for internal staff)
    ndaSignedDate: timestamp("nda_signed_date"), // When staff signed NDA
    ndaVersion: varchar("nda_version", { length: 10 }), // Version of NDA signed (e.g., "1.0")

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

    // Payroll Automation Settings
    payrollFrequency: varchar("payroll_frequency", { length: 20 }).default('weekly'), // weekly, biweekly, monthly
    payrollDay: integer("payroll_day").default(0), // 0 = Sunday, 1 = Monday, etc.
    autoRunPayroll: boolean("auto_run_payroll").default(true),

    // Billing & CSA Settings
    defaultMarkupPercentage: decimal("default_markup_percentage", { precision: 5, scale: 2 }).default("1.45"), // 1.45x markup
    paymentTermsDays: integer("payment_terms_days").default(30), // Net 30 default

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
    fullName: varchar("full_name", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    ssnEncrypted: varchar("ssn_encrypted", { length: 255 }), // encrypted
    dateOfBirth: date("date_of_birth"),
    driversLicense: varchar("drivers_license", { length: 50 }),
    driversLicenseState: varchar("drivers_license_state", { length: 2 }),

    // Address
    streetAddress: varchar("street_address", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    zipCode: varchar("zip_code", { length: 10 }),

    // Emergency Contact
    emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
    emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
    emergencyContactRelationship: varchar("emergency_contact_relationship", { length: 100 }),

    // Skills & Work Info
    skills: jsonb("skills"), // ['electrician', 'plumber', etc.]
    otherSkills: text("other_skills"),
    hourlyWage: decimal("hourly_wage", { precision: 8, scale: 2 }),
    availabilityStatus: varchar("availability_status", { length: 50 }).default("available"),

    // Skilled Worker Details (for trades requiring certifications)
    yearsExperience: varchar("years_experience", { length: 20 }),
    licenseNumber: varchar("license_number", { length: 100 }),
    licenseIssuingState: varchar("license_issuing_state", { length: 2 }),
    licenseExpirationDate: date("license_expiration_date"),
    certificationDocumentUrl: varchar("certification_document_url", { length: 500 }),

    // Availability Preferences
    availableToStart: varchar("available_to_start", { length: 50 }), // immediately, 1_week, 2_weeks, 1_month
    preferredShift: varchar("preferred_shift", { length: 50 }), // morning, afternoon, night, any
    daysAvailable: jsonb("days_available"), // ['monday', 'tuesday', 'wednesday', etc.]
    willingToWorkWeekends: boolean("willing_to_work_weekends"),
    transportation: varchar("transportation", { length: 50 }), // own_vehicle, public_transit, need_ride

    // Application Status
    status: varchar("status", { length: 50 }).default("pending_review"), // pending_review, background_check_pending, approved, rejected

    // Consent & Agreement
    backgroundCheckConsent: boolean("background_check_consent").default(false),
    backgroundCheckConsentDate: timestamp("background_check_consent_date"),
    mvrCheckConsent: boolean("mvr_check_consent").default(false),
    mvrCheckConsentDate: timestamp("mvr_check_consent_date"),
    certificationAccuracyConsent: boolean("certification_accuracy_consent").default(false),
    certificationAccuracyConsentDate: timestamp("certification_accuracy_consent_date"),

    // Application Signature
    signatureName: varchar("signature_name", { length: 255 }),
    signatureDate: timestamp("signature_date"),
    signatureIpAddress: varchar("signature_ip_address", { length: 100 }),

    // Referral Tracking
    referredBy: varchar("referred_by").references(() => workers.id),

    // Compliance
    i9Verified: boolean("i9_verified").default(false),
    i9VerifiedDate: timestamp("i9_verified_date"),
    backgroundCheckStatus: varchar("background_check_status", { length: 50 }),
    backgroundCheckDate: timestamp("background_check_date"),

    // Employee Info
    employeeNumber: varchar("employee_number", { length: 50 }).unique(),
    onboardingCompleted: boolean("onboarding_completed").default(false),
    onboardingCompletedDate: timestamp("onboarding_completed_date"),
    
    // Onboarding Deadline Tracking
    applicationStartedDate: timestamp("application_started_date"),
    applicationDeadline: timestamp("application_deadline"), // 3 business days after application
    assignmentDate: timestamp("assignment_date"), // When assigned to first job
    assignmentOnboardingDeadline: timestamp("assignment_onboarding_deadline"), // 1 business day after assignment
    onboardingTimedOut: boolean("onboarding_timed_out").default(false),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_workers_tenant_id").on(table.tenantId),
    companyIdx: index("idx_workers_company_id").on(table.companyId),
    userIdx: index("idx_workers_user_id").on(table.userId),
    employeeNumberIdx: index("idx_workers_employee_number").on(table.employeeNumber),
    statusIdx: index("idx_workers_status").on(table.status),
    phoneIdx: index("idx_workers_phone").on(table.phone),
    referredByIdx: index("idx_workers_referred_by").on(table.referredBy),
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

    // CSA (Client Service Agreement) Tracking
    csaStatus: varchar("csa_status", { length: 50 }).default("not_signed"), // not_signed, pending, signed, expired
    csaSignedDate: timestamp("csa_signed_date"),
    csaVersion: varchar("csa_version", { length: 10 }), // "1.0", "2.0"
    csaDocumentUrl: varchar("csa_document_url", { length: 500 }),
    csaExpirationDate: date("csa_expiration_date"),
    csaSignerName: varchar("csa_signer_name", { length: 255 }),
    csaSignatureData: jsonb("csa_signature_data"),
    csaSignatureIpAddress: varchar("csa_signature_ip_address", { length: 100 }),
    csaSignatureDevice: varchar("csa_signature_device", { length: 255 }),
    csaAcceptedTerms: jsonb("csa_accepted_terms"), // Checkbox confirmations: {conversionFee: true, paymentTerms: true, liability: true, markup: true}

    // Account Ownership Tracking
    accountOwnerId: varchar("account_owner_id").references(() => users.id),
    accountOwnerAssignedDate: timestamp("account_owner_assigned_date"),

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
// Worker Referral Bonuses
// ========================
export const workerReferralBonuses = pgTable(
  "worker_referral_bonuses",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    
    // Referral Type
    referrerType: varchar("referrer_type", { length: 50 }).notNull().default("worker"), // "worker" or "public"
    
    // Worker Referral (for internal worker-to-worker referrals)
    referrerId: varchar("referrer_id").references(() => workers.id), // Worker who made the referral (nullable for public)
    
    // Public Referral Info (for non-worker public referrals)
    publicReferrerName: varchar("public_referrer_name", { length: 255 }),
    publicReferrerPhone: varchar("public_referrer_phone", { length: 20 }),
    publicReferrerEmail: varchar("public_referrer_email", { length: 255 }),
    
    // Payment Info (for public referrals)
    paymentMethod: varchar("payment_method", { length: 50 }), // venmo, cashapp, zelle, paypal, check
    paymentDetails: text("payment_details"), // Username, phone, or mailing address
    paymentStatus: varchar("payment_status", { length: 50 }).default("pending"), // pending, sent, confirmed
    
    // Worker Being Referred
    referredWorkerId: varchar("referred_worker_id").references(() => workers.id), // Worker who was referred (nullable until they apply)
    referredWorkerName: varchar("referred_worker_name", { length: 255 }), // Pre-filled name before application
    referredWorkerPhone: varchar("referred_worker_phone", { length: 20 }), // Pre-filled phone before application
    referredWorkerEmail: varchar("referred_worker_email", { length: 255 }), // Pre-filled email before application
    
    // Relationship Info (for public referrals)
    relationship: varchar("relationship", { length: 100 }), // Friend, Family, Neighbor, Coworker, Other
    notes: text("notes"), // Why would they be a good worker?
    
    // Bonus Details
    bonusAmount: decimal("bonus_amount", { precision: 10, scale: 2 }).default("100.00"), // Default $100 for worker, $50 for public
    bonusStatus: varchar("bonus_status", { length: 50 }).default("pending"), // pending, worker_approved, earned, paid
    
    // Eligibility Tracking
    hoursWorkedByReferred: decimal("hours_worked_by_referred", { precision: 8, scale: 2 }).default("0"),
    minimumHoursRequired: decimal("minimum_hours_required", { precision: 8, scale: 2 }).default("40.00"), // 40 for worker, 80 for public
    eligibilityMet: boolean("eligibility_met").default(false),
    
    // Dates
    referralDate: timestamp("referral_date").default(sql`NOW()`),
    workerAppliedDate: timestamp("worker_applied_date"),
    workerApprovedDate: timestamp("worker_approved_date"),
    bonusEarnedDate: timestamp("bonus_earned_date"),
    bonusPaidDate: timestamp("bonus_paid_date"),
    
    // Payroll Integration
    payrollCycleId: varchar("payroll_cycle_id"), // Links to payroll when paid
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_referral_bonuses_tenant").on(table.tenantId),
    referrerIdx: index("idx_referral_bonuses_referrer").on(table.referrerId),
    referredWorkerIdx: index("idx_referral_bonuses_referred_worker").on(table.referredWorkerId),
    statusIdx: index("idx_referral_bonuses_status").on(table.bonusStatus),
    referrerTypeIdx: index("idx_referral_bonuses_type").on(table.referrerType),
    publicEmailIdx: index("idx_referral_bonuses_public_email").on(table.publicReferrerEmail),
    referredPhoneIdx: index("idx_referral_bonuses_referred_phone").on(table.referredWorkerPhone),
  })
);

export const insertWorkerReferralBonusSchema = createInsertSchema(workerReferralBonuses).omit({
  id: true,
  workerAppliedDate: true,
  workerApprovedDate: true,
  bonusEarnedDate: true,
  bonusPaidDate: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorkerReferralBonus = z.infer<typeof insertWorkerReferralBonusSchema>;
export type WorkerReferralBonus = typeof workerReferralBonuses.$inferSelect;

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

export type InsertHallmarkAudit = z.infer<typeof insertHallmarkAuditSchema>;
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
    contactIdx: index("idx_scanned_audit_contact").on(table.scannedContactId),
    customerIdx: index("idx_scanned_audit_customer").on(table.monthlyCustomerId),
    actionIdx: index("idx_scanned_audit_action").on(table.action),
  })
);

export const insertScannedContactsAuditSchema = createInsertSchema(scannedContactsAudit).omit({
  id: true,
  createdAt: true,
});

export type InsertScannedContactsAudit = z.infer<typeof insertScannedContactsAuditSchema>;
export type ScannedContactsAudit = typeof scannedContactsAudit.$inferSelect;

// ========================
// Worker Insurance Tracking
// ========================
export const workerInsurance = pgTable(
  "worker_insurance",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    workerId: varchar("worker_id").notNull().references(() => workers.id),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    
    // Workers Compensation
    workersCompPolicyNumber: varchar("workers_comp_policy_number", { length: 100 }),
    workersCompCarrier: varchar("workers_comp_carrier", { length: 255 }),
    workersCompEffectiveDate: date("workers_comp_effective_date"),
    workersCompExpiryDate: date("workers_comp_expiry_date"),
    workersCompClassCode: varchar("workers_comp_class_code", { length: 20 }),
    workersCompState: varchar("workers_comp_state", { length: 2 }),
    
    // General Liability (if worker-specific)
    liabilityPolicyNumber: varchar("liability_policy_number", { length: 100 }),
    liabilityCarrier: varchar("liability_carrier", { length: 255 }),
    liabilityEffectiveDate: date("liability_effective_date"),
    liabilityExpiryDate: date("liability_expiry_date"),
    liabilityCoverage: decimal("liability_coverage", { precision: 12, scale: 2 }),
    
    // Health Insurance
    hasHealthInsurance: boolean("has_health_insurance").default(false),
    healthProvider: varchar("health_provider", { length: 255 }),
    healthPlanType: varchar("health_plan_type", { length: 100 }), // "major_medical", "fixed_indemnity", "mec"
    healthEnrollmentDate: date("health_enrollment_date"),
    healthPolicyNumber: varchar("health_policy_number", { length: 100 }),
    
    // Dental Insurance
    hasDentalInsurance: boolean("has_dental_insurance").default(false),
    dentalProvider: varchar("dental_provider", { length: 255 }),
    dentalEnrollmentDate: date("dental_enrollment_date"),
    dentalPolicyNumber: varchar("dental_policy_number", { length: 100 }),
    
    // Fixed Indemnity Plan (Essential StaffCARE or similar)
    hasIndemnityPlan: boolean("has_indemnity_plan").default(false),
    indemnityProvider: varchar("indemnity_provider", { length: 255 }),
    indemnityPlanName: varchar("indemnity_plan_name", { length: 255 }),
    indemnityEnrollmentDate: date("indemnity_enrollment_date"),
    indemnityMemberNumber: varchar("indemnity_member_number", { length: 100 }),
    indemnityMonthlyPremium: decimal("indemnity_monthly_premium", { precision: 8, scale: 2 }),
    
    // Vision Insurance
    hasVisionInsurance: boolean("has_vision_insurance").default(false),
    visionProvider: varchar("vision_provider", { length: 255 }),
    
    // Multi-State Compliance
    stateEndorsements: jsonb("state_endorsements"), // State-specific endorsements: {"TN": {...}, "KY": {...}}
    complianceFlags: jsonb("compliance_flags"), // Compliance status per state: {"TN": "compliant", "KY": "pending"}
    
    // Status & Verification
    insuranceStatus: varchar("insurance_status", { length: 50 }).default("pending"), // pending, active, expired, suspended
    lastVerifiedDate: timestamp("last_verified_date"),
    verifiedBy: varchar("verified_by").references(() => users.id),
    notes: text("notes"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    workerIdx: index("idx_worker_insurance_worker").on(table.workerId),
    tenantIdx: index("idx_worker_insurance_tenant").on(table.tenantId),
    statusIdx: index("idx_worker_insurance_status").on(table.insuranceStatus),
    workersCompExpiryIdx: index("idx_worker_insurance_wc_expiry").on(table.workersCompExpiryDate),
  })
);

export const insertWorkerInsuranceSchema = createInsertSchema(workerInsurance).omit({
  id: true,
  lastVerifiedDate: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorkerInsurance = z.infer<typeof insertWorkerInsuranceSchema>;
export type WorkerInsurance = typeof workerInsurance.$inferSelect;

// ========================
// Company Insurance Policies
// ========================
export const companyInsurance = pgTable(
  "company_insurance",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").notNull().references(() => companies.id),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    
    // Policy Type
    insuranceType: varchar("insurance_type", { length: 100 }).notNull(), // workers_comp, general_liability, professional_liability, cyber_liability, epli, commercial_auto
    
    // Policy Details
    policyNumber: varchar("policy_number", { length: 100 }).notNull(),
    carrier: varchar("carrier", { length: 255 }).notNull(),
    effectiveDate: date("effective_date").notNull(),
    expiryDate: date("expiry_date").notNull(),
    
    // Coverage Amounts
    coverageAmount: decimal("coverage_amount", { precision: 12, scale: 2 }),
    deductible: decimal("deductible", { precision: 10, scale: 2 }),
    annualPremium: decimal("annual_premium", { precision: 10, scale: 2 }),
    
    // Multi-State Compliance
    coveredStates: jsonb("covered_states"), // ["TN", "KY", "GA"]
    section3aEndorsements: jsonb("section_3a_endorsements"), // State-specific endorsements
    
    // Workers Comp Specific
    experienceModRate: decimal("experience_mod_rate", { precision: 5, scale: 2 }), // EMR
    payAsYouGo: boolean("pay_as_you_go").default(false),
    
    // Status
    status: varchar("status", { length: 50 }).default("active"), // active, expired, cancelled
    renewalDate: date("renewal_date"),
    autoRenew: boolean("auto_renew").default(false),
    
    // Compliance
    certificateIssued: boolean("certificate_issued").default(false),
    certificateIssuedDate: date("certificate_issued_date"),
    
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_company_insurance_company").on(table.companyId),
    tenantIdx: index("idx_company_insurance_tenant").on(table.tenantId),
    typeIdx: index("idx_company_insurance_type").on(table.insuranceType),
    statusIdx: index("idx_company_insurance_status").on(table.status),
    expiryIdx: index("idx_company_insurance_expiry").on(table.expiryDate),
  })
);

export const insertCompanyInsuranceSchema = createInsertSchema(companyInsurance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCompanyInsurance = z.infer<typeof insertCompanyInsuranceSchema>;
export type CompanyInsurance = typeof companyInsurance.$inferSelect;

// ========================
// Insurance Documents (with Hallmarks)
// ========================
export const insuranceDocuments = pgTable(
  "insurance_documents",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    
    // Document Association (either worker or company insurance)
    workerInsuranceId: varchar("worker_insurance_id").references(() => workerInsurance.id),
    companyInsuranceId: varchar("company_insurance_id").references(() => companyInsurance.id),
    workerId: varchar("worker_id").references(() => workers.id),
    companyId: varchar("company_id").references(() => companies.id),
    
    // Document Details
    documentType: varchar("document_type", { length: 100 }).notNull(), // "workers_comp_certificate", "i9", "w4", "policy_declaration", "coi", "health_card"
    documentName: varchar("document_name", { length: 255 }).notNull(),
    documentUrl: varchar("document_url", { length: 500 }),
    fileUrl: varchar("file_url", { length: 500 }), // storage path
    fileName: varchar("file_name", { length: 255 }), // actual file name
    fileType: varchar("file_type", { length: 20 }), // pdf, image, docx
    fileSize: integer("file_size"), // bytes
    mimeType: varchar("mime_type", { length: 100 }),
    uploadedDate: timestamp("uploaded_date"),
    
    // Hallmark Verification
    hallmarkId: varchar("hallmark_id").unique(),
    hallmarkAssetNumber: varchar("hallmark_asset_number", { length: 100 }), // Hallmark identifier
    hallmarkIssued: boolean("hallmark_issued").default(false),
    hallmarkIssuedAt: timestamp("hallmark_issued_at"),
    hallmarkVerifiable: boolean("hallmark_verifiable").default(true),
    
    // Verification & Scanning
    verificationStatus: varchar("verification_status", { length: 50 }).default("pending"), // pending, verified, rejected
    rejectionReason: text("rejection_reason"),
    virusScanStatus: varchar("virus_scan_status", { length: 50 }).default("pending"), // pending, clean, infected
    
    // Metadata
    uploadedBy: varchar("uploaded_by").references(() => users.id),
    verifiedBy: varchar("verified_by").references(() => users.id),
    verifiedAt: timestamp("verified_at"),
    
    // Expiration tracking
    expiryDate: date("expiry_date"),
    expiryReminderSent: boolean("expiry_reminder_sent").default(false),
    
    status: varchar("status", { length: 50 }).default("pending_review"), // pending_review, approved, rejected, expired
    notes: text("notes"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_insurance_docs_tenant").on(table.tenantId),
    workerInsIdx: index("idx_insurance_docs_worker_ins").on(table.workerInsuranceId),
    companyInsIdx: index("idx_insurance_docs_company_ins").on(table.companyInsuranceId),
    workerIdx: index("idx_insurance_docs_worker").on(table.workerId),
    companyIdx: index("idx_insurance_docs_company").on(table.companyId),
    hallmarkIdx: index("idx_insurance_docs_hallmark").on(table.hallmarkId),
    typeIdx: index("idx_insurance_docs_type").on(table.documentType),
    statusIdx: index("idx_insurance_docs_status").on(table.status),
    expiryIdx: index("idx_insurance_docs_expiry").on(table.expiryDate),
  })
);

export const insertInsuranceDocumentSchema = createInsertSchema(insuranceDocuments).omit({
  id: true,
  hallmarkIssuedAt: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInsuranceDocument = z.infer<typeof insertInsuranceDocumentSchema>;
export type InsuranceDocument = typeof insuranceDocuments.$inferSelect;

// ========================
// Client Worker Requests (Automated Workflow)
// ========================
export const workerRequests = pgTable(
  "worker_requests",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    clientId: varchar("client_id").notNull().references(() => clients.id),
    
    // Request Details
    requestNumber: varchar("request_number", { length: 50 }).unique(),
    jobTitle: varchar("job_title", { length: 255 }).notNull(),
    jobDescription: text("job_description"),
    industryType: varchar("industry_type", { length: 100 }), // construction, hospitality, healthcare, general_labor
    
    // Requirements
    skillsRequired: jsonb("skills_required"), // ["electrician", "forklift_certified"]
    certificationsRequired: jsonb("certifications_required"), // ["OSHA 10", "CPR"]
    experienceLevel: varchar("experience_level", { length: 50 }), // entry, intermediate, expert
    
    // Quantity & Schedule
    workersNeeded: integer("workers_needed").notNull().default(1),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    startTime: varchar("start_time", { length: 10 }), // "08:00"
    endTime: varchar("end_time", { length: 10 }), // "17:00"
    shiftType: varchar("shift_type", { length: 50 }), // day, night, swing, rotating
    
    // Location
    workLocation: varchar("work_location", { length: 255 }),
    addressLine1: varchar("address_line1", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    zipCode: varchar("zip_code", { length: 10 }),
    latitude: decimal("latitude", { precision: 9, scale: 6 }),
    longitude: decimal("longitude", { precision: 9, scale: 6 }),
    
    // Compensation
    payRate: decimal("pay_rate", { precision: 8, scale: 2 }),
    payRateType: varchar("pay_rate_type", { length: 20 }).default("hourly"), // hourly, daily, project
    billingRate: decimal("billing_rate", { precision: 8, scale: 2 }), // What client pays
    
    // Insurance Requirements
    workersCompRequired: boolean("workers_comp_required").default(true),
    liabilityRequired: boolean("liability_required").default(false),
    minimumCoverage: decimal("minimum_coverage", { precision: 12, scale: 2 }),
    
    // Multi-State Compliance
    stateSpecificRequirements: jsonb("state_specific_requirements"), // State-specific requirements: {"TN": {"license": "required"}, "KY": {...}}
    
    // Special Requirements
    backgroundCheckRequired: boolean("background_check_required").default(false),
    drugTestRequired: boolean("drug_test_required").default(false),
    uniforms: varchar("uniforms", { length: 255 }),
    ppeRequired: jsonb("ppe_required"), // ["hard_hat", "safety_vest", "steel_toes"]
    specialInstructions: text("special_instructions"),
    
    // Workflow Status
    status: varchar("status", { length: 50 }).default("pending"), // pending, matched, assigned, in_progress, completed, cancelled
    matchedAt: timestamp("matched_at"),
    assignedAt: timestamp("assigned_at"),
    completedAt: timestamp("completed_at"),
    
    // Matched Workers (auto-populated by matching engine)
    autoMatchedWorkerIds: jsonb("auto_matched_worker_ids"), // ["worker-id-1", "worker-id-2"]
    matchScore: jsonb("match_score"), // {"worker-id-1": 95, "worker-id-2": 87}
    
    // Assigned Workers (admin-selected)
    assignedWorkerIds: jsonb("assigned_worker_ids"),
    
    // Admin Actions
    reviewedBy: varchar("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at"),
    assignedBy: varchar("assigned_by").references(() => users.id),
    
    // Priority & Urgency
    priority: varchar("priority", { length: 20 }).default("normal"), // low, normal, high, urgent
    urgent: boolean("urgent").default(false),
    
    // Hallmark
    hallmarkId: varchar("hallmark_id"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_worker_requests_tenant").on(table.tenantId),
    clientIdx: index("idx_worker_requests_client").on(table.clientId),
    statusIdx: index("idx_worker_requests_status").on(table.status),
    startDateIdx: index("idx_worker_requests_start_date").on(table.startDate),
    requestNumberIdx: index("idx_worker_requests_number").on(table.requestNumber),
    priorityIdx: index("idx_worker_requests_priority").on(table.priority),
  })
);

export const insertWorkerRequestSchema = createInsertSchema(workerRequests).omit({
  id: true,
  matchedAt: true,
  assignedAt: true,
  completedAt: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorkerRequest = z.infer<typeof insertWorkerRequestSchema>;
export type WorkerRequest = typeof workerRequests.$inferSelect;

// ========================
// Worker Request Match History
// ========================
export const workerRequestMatches = pgTable(
  "worker_request_matches",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    requestId: varchar("request_id").notNull().references(() => workerRequests.id),
    workerId: varchar("worker_id").notNull().references(() => workers.id),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    
    // Match Details
    matchScore: integer("match_score"), // 0-100
    matchReason: jsonb("match_reason"), // {"skills": 95, "availability": 100, "location": 80, "insurance": 100}
    
    // Match Criteria Met
    skillsMatch: boolean("skills_match").default(false),
    availabilityMatch: boolean("availability_match").default(false),
    insuranceMatch: boolean("insurance_match").default(false),
    locationMatch: boolean("location_match").default(false),
    experienceMatch: boolean("experience_match").default(false),
    
    // Status
    matchStatus: varchar("match_status", { length: 50 }).default("suggested"), // suggested, selected, assigned, rejected
    selectedAt: timestamp("selected_at"),
    assignedAt: timestamp("assigned_at"),
    rejectedAt: timestamp("rejected_at"),
    rejectionReason: text("rejection_reason"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    requestIdx: index("idx_request_matches_request").on(table.requestId),
    workerIdx: index("idx_request_matches_worker").on(table.workerId),
    tenantIdx: index("idx_request_matches_tenant").on(table.tenantId),
    statusIdx: index("idx_request_matches_status").on(table.matchStatus),
    scoreIdx: index("idx_request_matches_score").on(table.matchScore),
  })
);

export const insertWorkerRequestMatchSchema = createInsertSchema(workerRequestMatches).omit({
  id: true,
  selectedAt: true,
  assignedAt: true,
  rejectedAt: true,
  createdAt: true,
});

export type InsertWorkerRequestMatch = z.infer<typeof insertWorkerRequestMatchSchema>;
export type WorkerRequestMatch = typeof workerRequestMatches.$inferSelect;

// ========================
// Employee W-4 Tax Data
// ========================
export const employeeW4Data = pgTable(
  "employee_w4_data",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    workerId: varchar("worker_id").notNull().references(() => workers.id),
    
    // W-4 Filing Information
    fillingStatus: varchar("filling_status", { length: 20 }).notNull(), // single, married, HOH (Head of Household)
    dependents: integer("dependents").default(0),
    otherIncome: decimal("other_income", { precision: 10, scale: 2 }).default("0"),
    
    // Deductions
    standardDeduction: boolean("standard_deduction").default(true),
    claimableDeductions: decimal("claimable_deductions", { precision: 10, scale: 2 }).default("0"),
    
    // Additional Withholding
    extraWithheldPerPaycheck: decimal("extra_withheld_per_paycheck", { precision: 8, scale: 2 }).default("0"),
    
    // Effective Period
    effectiveYear: integer("effective_year").notNull(),
    effectiveDate: date("effective_date"),
    
    // Status
    isCurrentW4: boolean("is_current_w4").default(true),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_w4_tenant").on(table.tenantId),
    workerIdx: index("idx_w4_worker").on(table.workerId),
    currentIdx: index("idx_w4_current").on(table.isCurrentW4),
  })
);

export const insertEmployeeW4DataSchema = createInsertSchema(employeeW4Data).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEmployeeW4Data = z.infer<typeof insertEmployeeW4DataSchema>;
export type EmployeeW4Data = typeof employeeW4Data.$inferSelect;

// ========================
// Garnishment Orders (Court-Ordered Deductions)
// ========================
export const garnishmentOrders = pgTable(
  "garnishment_orders",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    employeeId: varchar("employee_id").notNull().references(() => workers.id),
    
    // Garnishment Type
    type: varchar("type", { length: 50 }).notNull(), // child_support, tax_levy, student_loan, creditor
    creditorName: varchar("creditor_name", { length: 255 }),
    orderNumber: varchar("order_number", { length: 100 }),
    caseNumber: varchar("case_number", { length: 100 }),
    
    // Amount
    amountFixed: decimal("amount_fixed", { precision: 10, scale: 2 }), // Fixed dollar amount per period
    amountPercentage: decimal("amount_percentage", { precision: 5, scale: 2 }), // Percentage of disposable earnings
    
    // Effective Dates
    effectiveDate: date("effective_date").notNull(),
    expiryDate: date("expiry_date"),
    
    // Payment Instructions
    paymentInstructions: text("payment_instructions"),
    remittanceAddress: text("remittance_address"),
    
    // Status: active, suspended, completed
    status: varchar("status", { length: 50 }).default("active"),
    
    // Priority (auto-calculated from type: child_support=1, tax_levy=2, student_loan=3, creditor=4)
    priority: integer("priority").default(4),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_garnishment_tenant").on(table.tenantId),
    employeeIdx: index("idx_garnishment_employee").on(table.employeeId),
    typeIdx: index("idx_garnishment_type").on(table.type),
    statusIdx: index("idx_garnishment_status").on(table.status),
    priorityIdx: index("idx_garnishment_priority").on(table.priority),
  })
);

export const insertGarnishmentOrderSchema = createInsertSchema(garnishmentOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGarnishmentOrder = z.infer<typeof insertGarnishmentOrderSchema>;
export type GarnishmentOrder = typeof garnishmentOrders.$inferSelect;

// ========================
// Payroll Records (Detailed Paycheck Breakdown)
// ========================
export const payrollRecords = pgTable(
  "payroll_records",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    employeeId: varchar("employee_id").notNull().references(() => workers.id),
    payrollId: varchar("payroll_id").references(() => payroll.id),
    
    // Pay Period
    payPeriodStart: date("pay_period_start").notNull(),
    payPeriodEnd: date("pay_period_end").notNull(),
    payDate: date("pay_date"),
    
    // Gross Pay
    grossPay: decimal("gross_pay", { precision: 10, scale: 2 }).notNull(),
    
    // Mandatory Withholdings
    federalIncomeTax: decimal("federal_income_tax", { precision: 10, scale: 2 }).default("0"),
    socialSecurityTax: decimal("social_security_tax", { precision: 10, scale: 2 }).default("0"),
    medicareTax: decimal("medicare_tax", { precision: 10, scale: 2 }).default("0"),
    additionalMedicareTax: decimal("additional_medicare_tax", { precision: 10, scale: 2 }).default("0"),
    stateTax: decimal("state_tax", { precision: 10, scale: 2 }).default("0"),
    localTax: decimal("local_tax", { precision: 10, scale: 2 }).default("0"),
    
    // Total Mandatory Deductions
    totalMandatoryDeductions: decimal("total_mandatory_deductions", { precision: 10, scale: 2 }).default("0"),
    
    // Disposable Earnings (used for garnishment calculation)
    disposableEarnings: decimal("disposable_earnings", { precision: 10, scale: 2 }).default("0"),
    
    // Garnishments (details stored as JSON)
    garnishmentsApplied: jsonb("garnishments_applied"), // [{id, type, amount, priority}]
    totalGarnishments: decimal("total_garnishments", { precision: 10, scale: 2 }).default("0"),
    
    // Final Net Pay
    netPay: decimal("net_pay", { precision: 10, scale: 2 }).default("0"),
    
    // W-4 Reference
    w4DataId: varchar("w4_data_id").references(() => employeeW4Data.id),
    
    // State Location (for local tax)
    workState: varchar("work_state", { length: 2 }),
    workCity: varchar("work_city", { length: 100 }),
    
    // Full Breakdown (for audit trail)
    breakdown: jsonb("breakdown"),
    
    // Status
    status: varchar("status", { length: 50 }).default("pending"), // pending, processed, paid
    processedAt: timestamp("processed_at"),
    paidAt: timestamp("paid_at"),
    
    // Notes
    notes: text("notes"),
    
    // Paystub PDF Generation
    paystubPdfUrl: varchar("paystub_pdf_url", { length: 255 }),
    paystubFileName: varchar("paystub_file_name", { length: 255 }),
    hallmarkAssetNumber: varchar("hallmark_asset_number", { length: 100 }),
    qrCodeUrl: varchar("qr_code_url", { length: 255 }),
    
    // Stripe Payment Integration
    stripePaymentId: varchar("stripe_payment_id", { length: 100 }),
    paymentStatus: varchar("payment_status", { length: 50 }), // pending, completed, failed
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_payroll_record_tenant").on(table.tenantId),
    employeeIdx: index("idx_payroll_record_employee").on(table.employeeId),
    periodIdx: index("idx_payroll_record_period").on(table.payPeriodStart),
    statusIdx: index("idx_payroll_record_status").on(table.status),
    paystubUrlIdx: index("idx_payroll_record_paystub_url").on(table.paystubPdfUrl),
    hallmarkIdx: index("idx_payroll_record_hallmark").on(table.hallmarkAssetNumber),
  })
);

export const insertPayrollRecordSchema = createInsertSchema(payrollRecords).omit({
  id: true,
  processedAt: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPayrollRecord = z.infer<typeof insertPayrollRecordSchema>;
export type PayrollRecord = typeof payrollRecords.$inferSelect;

// ========================
// Garnishment Payments (Tracking Payment to Creditors)
// ========================
export const garnishmentPayments = pgTable(
  "garnishment_payments",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    payrollRecordId: varchar("payroll_record_id").notNull().references(() => payrollRecords.id),
    garnishmentOrderId: varchar("garnishment_order_id").notNull().references(() => garnishmentOrders.id),
    employeeId: varchar("employee_id").notNull().references(() => workers.id),
    
    // Payment Details
    paymentDate: date("payment_date"),
    amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).notNull(),
    
    // Recipient
    recipientName: varchar("recipient_name", { length: 255 }),
    recipientType: varchar("recipient_type", { length: 50 }), // court, irs, student_loan_servicer, creditor
    remittanceAddress: text("remittance_address"),
    
    // Status
    status: varchar("status", { length: 50 }).default("pending"), // pending, sent, confirmed, failed
    sentAt: timestamp("sent_at"),
    confirmedAt: timestamp("confirmed_at"),
    failureReason: text("failure_reason"),
    
    // Reference Numbers
    checkNumber: varchar("check_number", { length: 50 }),
    wireReference: varchar("wire_reference", { length: 100 }),
    
    // Notes
    notes: text("notes"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_garnishment_payment_tenant").on(table.tenantId),
    payrollRecordIdx: index("idx_garnishment_payment_payroll").on(table.payrollRecordId),
    garnishmentOrderIdx: index("idx_garnishment_payment_order").on(table.garnishmentOrderId),
    employeeIdx: index("idx_garnishment_payment_employee").on(table.employeeId),
    statusIdx: index("idx_garnishment_payment_status").on(table.status),
    paymentDateIdx: index("idx_garnishment_payment_date").on(table.paymentDate),
  })
);

export const insertGarnishmentPaymentSchema = createInsertSchema(garnishmentPayments).omit({
  id: true,
  sentAt: true,
  confirmedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGarnishmentPayment = z.infer<typeof insertGarnishmentPaymentSchema>;
export type GarnishmentPayment = typeof garnishmentPayments.$inferSelect;

// ========================
// Garnishment Documents
// ========================
export const garnishmentDocuments = pgTable(
  "garnishment_documents",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    garnishmentOrderId: varchar("garnishment_order_id").notNull().references(() => garnishmentOrders.id),
    
    // File Storage
    fileUrl: varchar("file_url", { length: 500 }).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 20 }).notNull(), // pdf, image, docx
    fileSize: integer("file_size"), // bytes
    
    // Hallmark & Verification
    hallmarkAssetNumber: varchar("hallmark_asset_number", { length: 100 }),
    uploadedDate: timestamp("uploaded_date").default(sql`NOW()`),
    verificationStatus: varchar("verification_status", { length: 50 }).default("pending"), // pending, verified, rejected
    
    // Source Info
    sourceCreditor: varchar("source_creditor", { length: 255 }),
    
    // Metadata
    uploadedBy: varchar("uploaded_by").references(() => users.id),
    rejectionReason: text("rejection_reason"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_garnishment_docs_tenant").on(table.tenantId),
    garnishmentIdx: index("idx_garnishment_docs_garnishment").on(table.garnishmentOrderId),
    verificationIdx: index("idx_garnishment_docs_verification").on(table.verificationStatus),
    uploadedDateIdx: index("idx_garnishment_docs_uploaded").on(table.uploadedDate),
  })
);

export const insertGarnishmentDocumentSchema = createInsertSchema(garnishmentDocuments).omit({
  id: true,
  uploadedDate: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGarnishmentDocument = z.infer<typeof insertGarnishmentDocumentSchema>;
export type GarnishmentDocument = typeof garnishmentDocuments.$inferSelect;

// ========================
// Background Checks
// ========================
export const backgroundChecks = pgTable(
  "background_checks",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    workerId: varchar("worker_id").notNull().references(() => workers.id),
    
    // Check Details
    checkType: varchar("check_type", { length: 50 }).notNull(), // criminal, motor_vehicle, employment_history
    requestedDate: timestamp("requested_date").default(sql`NOW()`),
    completedDate: timestamp("completed_date"),
    
    // Status
    status: varchar("status", { length: 50 }).default("pending"), // pending, processing, completed, failed
    resultStatus: varchar("result_status", { length: 50 }), // clear, issues_found, disqualified
    resultDetails: jsonb("result_details"), // violations, incidents, etc
    
    // Expiration
    expiryDate: date("expiry_date"),
    reportUrl: varchar("report_url", { length: 255 }),
    
    // Third-party Integration
    externalId: varchar("external_id", { length: 100 }), // Checkr candidate_id, request_id
    externalStatus: varchar("external_status", { length: 50 }),
    
    // Audit Trail
    requestedBy: varchar("requested_by").references(() => users.id),
    reviewedBy: varchar("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at"),
    notes: text("notes"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_bg_check_tenant").on(table.tenantId),
    workerIdx: index("idx_bg_check_worker").on(table.workerId),
    checkTypeIdx: index("idx_bg_check_type").on(table.checkType),
    statusIdx: index("idx_bg_check_status").on(table.status),
    resultStatusIdx: index("idx_bg_check_result_status").on(table.resultStatus),
    expiryIdx: index("idx_bg_check_expiry").on(table.expiryDate),
    externalIdIdx: index("idx_bg_check_external_id").on(table.externalId),
  })
);

export const insertBackgroundCheckSchema = createInsertSchema(backgroundChecks).omit({
  id: true,
  requestedDate: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBackgroundCheck = z.infer<typeof insertBackgroundCheckSchema>;
export type BackgroundCheck = typeof backgroundChecks.$inferSelect;

// ========================
// Drug Tests
// ========================
export const drugTests = pgTable(
  "drug_tests",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    workerId: varchar("worker_id").notNull().references(() => workers.id),
    
    // Test Details
    testType: varchar("test_type", { length: 50 }).notNull(), // pre_employment, random, post_incident
    requestedDate: timestamp("requested_date").default(sql`NOW()`),
    completedDate: timestamp("completed_date"),
    
    // Status & Results
    status: varchar("status", { length: 50 }).default("pending"), // pending, processing, completed, failed
    result: varchar("result", { length: 50 }), // pass, fail, inconclusive
    testDetails: jsonb("test_details"), // panel tested, lab, etc
    
    // Expiration
    expiryDate: date("expiry_date"),
    reportUrl: varchar("report_url", { length: 255 }),
    
    // Third-party Integration
    externalId: varchar("external_id", { length: 100 }), // Quest Diagnostics test_id
    externalStatus: varchar("external_status", { length: 50 }),
    
    // Audit Trail
    requestedBy: varchar("requested_by").references(() => users.id),
    reviewedBy: varchar("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at"),
    notes: text("notes"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_drug_test_tenant").on(table.tenantId),
    workerIdx: index("idx_drug_test_worker").on(table.workerId),
    testTypeIdx: index("idx_drug_test_type").on(table.testType),
    statusIdx: index("idx_drug_test_status").on(table.status),
    resultIdx: index("idx_drug_test_result").on(table.result),
    expiryIdx: index("idx_drug_test_expiry").on(table.expiryDate),
    externalIdIdx: index("idx_drug_test_external_id").on(table.externalId),
  })
);

export const insertDrugTestSchema = createInsertSchema(drugTests).omit({
  id: true,
  requestedDate: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDrugTest = z.infer<typeof insertDrugTestSchema>;
export type DrugTest = typeof drugTests.$inferSelect;

// ========================
// Compliance Checks
// ========================
export const complianceChecks = pgTable(
  "compliance_checks",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    workerId: varchar("worker_id").notNull().references(() => workers.id),
    
    // Check Details
    checkType: varchar("check_type", { length: 50 }).notNull(), // i9_verification, ssn_verification, right_to_work
    
    // Status
    status: varchar("status", { length: 50 }).default("pending"), // pending, completed, expired
    complianceStatus: varchar("compliance_status", { length: 50 }), // compliant, non_compliant
    
    // Dates
    completedDate: timestamp("completed_date"),
    expiryDate: date("expiry_date"),
    renewalReminderSent: boolean("renewal_reminder_sent").default(false),
    
    // Audit Trail
    completedBy: varchar("completed_by").references(() => users.id),
    notes: text("notes"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_compliance_check_tenant").on(table.tenantId),
    workerIdx: index("idx_compliance_check_worker").on(table.workerId),
    checkTypeIdx: index("idx_compliance_check_type").on(table.checkType),
    statusIdx: index("idx_compliance_check_status").on(table.status),
    complianceStatusIdx: index("idx_compliance_check_compliance").on(table.complianceStatus),
    expiryIdx: index("idx_compliance_check_expiry").on(table.expiryDate),
  })
);

export const insertComplianceCheckSchema = createInsertSchema(complianceChecks).omit({
  id: true,
  completedDate: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertComplianceCheck = z.infer<typeof insertComplianceCheckSchema>;
export type ComplianceCheck = typeof complianceChecks.$inferSelect;

// ========================
// Customer Service Agreements (CSA)
// ========================
export const customerServiceAgreements = pgTable(
  "customer_service_agreements",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    customerId: varchar("customer_id").notNull().references(() => clients.id),
    
    // Hallmark Tracking
    hallmarkId: varchar("hallmark_id").notNull().references(() => hallmarks.id),
    
    // Document Details
    version: varchar("version", { length: 10 }).default("1.0"),
    status: varchar("status", { length: 50 }).default("draft"), // draft, active, superseded, voided
    
    // Pricing & Terms
    markupPercentage: decimal("markup_percentage", { precision: 5, scale: 2 }).notNull().default("1.45"), // 1.45x
    paymentTermsDays: integer("payment_terms_days").notNull().default(30), // Net 30
    
    // Signatory Information
    signatoryName: varchar("signatory_name", { length: 255 }),
    signatoryTitle: varchar("signatory_title", { length: 100 }),
    
    // Signature Tracking
    signatureMethod: varchar("signature_method", { length: 20 }), // "digital" or "paper"
    signedDate: timestamp("signed_date"),
    signatureData: jsonb("signature_data"), // { timestamp, ip, device, method }
    
    // Document Content
    documentContent: text("document_content"), // HTML template
    
    // Dates
    effectiveDate: date("effective_date"),
    expirationDate: date("expiration_date"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_csa_tenant").on(table.tenantId),
    customerIdx: index("idx_csa_customer").on(table.customerId),
    hallmarkIdx: index("idx_csa_hallmark").on(table.hallmarkId),
    statusIdx: index("idx_csa_status").on(table.status),
    signedDateIdx: index("idx_csa_signed_date").on(table.signedDate),
  })
);

export const insertCSASchema = createInsertSchema(customerServiceAgreements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCSA = z.infer<typeof insertCSASchema>;
export type CustomerServiceAgreement = typeof customerServiceAgreements.$inferSelect;

// ========================
// Internal NDAs (Staff)
// ========================
export const internalNDAs = pgTable(
  "internal_ndas",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    userId: varchar("user_id").notNull().references(() => users.id),
    
    // Hallmark Tracking
    hallmarkId: varchar("hallmark_id").notNull().references(() => hallmarks.id),
    
    // NDA Details
    ndaVersion: varchar("nda_version", { length: 10 }).default("1.0"),
    status: varchar("status", { length: 50 }).default("pending"), // pending, signed, expired, voided
    
    // Signatory
    signatoryName: varchar("signatory_name", { length: 255 }).notNull(),
    signatoryTitle: varchar("signatory_title", { length: 100 }),
    
    // Terms (1-year non-solicitation standard)
    nonSolicitationMonths: integer("non_solicitation_months").default(12),
    
    // Signature Tracking
    signedDate: timestamp("signed_date"),
    signatureData: jsonb("signature_data"), // { timestamp, ip, device }
    
    // Document Content
    documentContent: text("document_content"), // HTML template
    
    // Validity
    expirationDate: date("expiration_date"), // When NDA expires
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_nda_tenant").on(table.tenantId),
    userIdx: index("idx_nda_user").on(table.userId),
    hallmarkIdx: index("idx_nda_hallmark").on(table.hallmarkId),
    statusIdx: index("idx_nda_status").on(table.status),
    signedDateIdx: index("idx_nda_signed_date").on(table.signedDate),
    expirationIdx: index("idx_nda_expiration").on(table.expirationDate),
  })
);

export const insertNDASchema = createInsertSchema(internalNDAs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNDA = z.infer<typeof insertNDASchema>;
export type InternalNDA = typeof internalNDAs.$inferSelect;

// ========================
// Document Signatures (Both CSA & NDA)
// ========================
export const documentSignatures = pgTable(
  "document_signatures",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    
    // Document References
    csaId: varchar("csa_id").references(() => customerServiceAgreements.id),
    ndaId: varchar("nda_id").references(() => internalNDAs.id),
    
    // Signer Info
    signerName: varchar("signer_name", { length: 255 }).notNull(),
    signerEmail: varchar("signer_email", { length: 255 }),
    signerRole: varchar("signer_role", { length: 100 }), // "owner", "authorized_representative", etc.
    
    // Signature Method
    signatureMethod: varchar("signature_method", { length: 20 }).notNull(), // "digital" or "paper_scanned"
    
    // Digital Signature Data
    signatureHash: text("signature_hash"), // Hash of signature for verification
    ipAddress: varchar("ip_address", { length: 45 }),
    deviceInfo: varchar("device_info", { length: 255 }),
    
    // Paper Signature Data
    paperUploadUrl: varchar("paper_upload_url", { length: 500 }), // URL to scanned PDF
    paperUploadDate: timestamp("paper_upload_date"),
    
    // Timestamp
    signedAt: timestamp("signed_at").notNull(),
    
    // Audit Trail
    verifiedAt: timestamp("verified_at"),
    verifiedBy: varchar("verified_by").references(() => users.id),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_sig_tenant").on(table.tenantId),
    csaIdx: index("idx_sig_csa").on(table.csaId),
    ndaIdx: index("idx_sig_nda").on(table.ndaId),
    signedAtIdx: index("idx_sig_signed_at").on(table.signedAt),
    methodIdx: index("idx_sig_method").on(table.signatureMethod),
  })
);

export const insertDocumentSignatureSchema = createInsertSchema(documentSignatures).omit({
  id: true,
  createdAt: true,
});

export type InsertDocumentSignature = z.infer<typeof insertDocumentSignatureSchema>;
export type DocumentSignature = typeof documentSignatures.$inferSelect;

// ========================
// Customer Document Preferences
// ========================
export const customerDocumentPreferences = pgTable(
  "customer_document_preferences",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    customerId: varchar("customer_id").notNull().references(() => clients.id),
    
    // Signature Preference
    preferredSignatureMethod: varchar("preferred_signature_method", { length: 20 }).default("digital"), // "digital" or "paper"
    
    // Invoice Preference
    preferInvoiceDigital: boolean("prefer_invoice_digital").default(true),
    preferInvoicePaper: boolean("prefer_invoice_paper").default(false),
    
    // CSA Preference
    preferCSADigital: boolean("prefer_csa_digital").default(true),
    preferCSAPaper: boolean("prefer_csa_paper").default(false),
    
    // Notification
    contactEmail: varchar("contact_email", { length: 255 }),
    
    // Special Requests
    specialDocumentationRequests: text("special_documentation_requests"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_pref_tenant").on(table.tenantId),
    customerIdx: index("idx_pref_customer").on(table.customerId),
  })
);

export const insertCustomerDocumentPreferenceSchema = createInsertSchema(customerDocumentPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomerDocumentPreference = z.infer<typeof insertCustomerDocumentPreferenceSchema>;
export type CustomerDocumentPreference = typeof customerDocumentPreferences.$inferSelect;

// ========================
// Wage Scales (Master Data by Region/Industry/Skill)
// ========================
export const wageScales = pgTable(
  "wage_scales",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    
    // Geographic & Industry Filters
    region: varchar("region", { length: 50 }).notNull(), // "TN", "KY", "Southeast", etc.
    industry: varchar("industry", { length: 100 }).notNull(), // "construction", "healthcare", "general_labor", "skilled_trades", "hospitality"
    jobCategory: varchar("job_category", { length: 100 }).notNull(), // "electrician_journeyman", "general_laborer", "RN", etc.
    
    // Skill Level
    skillLevel: varchar("skill_level", { length: 50 }).notNull(), // "entry", "intermediate", "journeyman", "expert"
    
    // Hourly Rate
    hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }).notNull(), // Base rate for this skill/region
    
    // Metadata
    effectiveDate: date("effective_date").notNull(),
    expirationDate: date("expiration_date"), // Optional: if set, scale is inactive after this date
    source: varchar("source", { length: 255 }), // "Bureau of Labor Statistics", "Industry Survey", "Manual Entry", etc.
    notes: text("notes"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_wage_scales_tenant").on(table.tenantId),
    regionIndustryIdx: index("idx_wage_scales_region_industry").on(table.region, table.industry),
    skillLevelIdx: index("idx_wage_scales_skill").on(table.skillLevel),
    effectiveDateIdx: index("idx_wage_scales_effective").on(table.effectiveDate),
  })
);

export const insertWageScaleSchema = createInsertSchema(wageScales).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWageScale = z.infer<typeof insertWageScaleSchema>;
export type WageScale = typeof wageScales.$inferSelect;

// ========================
// Rate Confirmations (What Worker Makes)
// ========================
export const rateConfirmations = pgTable(
  "rate_confirmations",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    workerRequestId: varchar("worker_request_id").notNull().references(() => workerRequests.id),
    workerId: varchar("worker_id").notNull().references(() => workers.id),
    customerId: varchar("customer_id").notNull().references(() => clients.id),
    
    // Hallmark Tracking
    hallmarkId: varchar("hallmark_id").notNull().references(() => hallmarks.id),
    
    // Worker Pay Details
    hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }).notNull(),
    payPeriodStart: date("pay_period_start").notNull(),
    payPeriodEnd: date("pay_period_end").notNull(),
    estimatedHours: decimal("estimated_hours", { precision: 8, scale: 2 }),
    
    // Document Status
    status: varchar("status", { length: 50 }).default("pending"), // pending, signed_by_customer, signed_by_worker, acknowledged, voided
    
    // Customer (Employer) Signature
    customerSignedDate: timestamp("customer_signed_date"),
    customerSignatureData: jsonb("customer_signature_data"),
    
    // Worker Acknowledgment
    workerAcceptedDate: timestamp("worker_accepted_date"),
    workerAcceptanceData: jsonb("worker_acceptance_data"),
    
    // Document Content
    documentContent: text("document_content"), // HTML rendering
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_rate_conf_tenant").on(table.tenantId),
    requestIdx: index("idx_rate_conf_request").on(table.workerRequestId),
    workerIdx: index("idx_rate_conf_worker").on(table.workerId),
    hallmarkIdx: index("idx_rate_conf_hallmark").on(table.hallmarkId),
    statusIdx: index("idx_rate_conf_status").on(table.status),
  })
);

export const insertRateConfirmationSchema = createInsertSchema(rateConfirmations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRateConfirmation = z.infer<typeof insertRateConfirmationSchema>;
export type RateConfirmation = typeof rateConfirmations.$inferSelect;

// ========================
// Billing Confirmations (What Customer Pays)
// ========================
export const billingConfirmations = pgTable(
  "billing_confirmations",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    workerRequestId: varchar("worker_request_id").notNull().references(() => workerRequests.id),
    customerId: varchar("customer_id").notNull().references(() => clients.id),
    rateConfirmationId: varchar("rate_confirmation_id").notNull().references(() => rateConfirmations.id),
    
    // Hallmark Tracking
    hallmarkId: varchar("hallmark_id").notNull().references(() => hallmarks.id),
    
    // Billing Details
    workerHourlyRate: decimal("worker_hourly_rate", { precision: 8, scale: 2 }).notNull(),
    markupPercentage: decimal("markup_percentage", { precision: 5, scale: 2 }).notNull(), // 1.45
    billingHourlyRate: decimal("billing_hourly_rate", { precision: 8, scale: 2 }).notNull(), // Calculated: worker rate × markup
    paymentTermsDays: integer("payment_terms_days").notNull().default(30),
    
    // Period
    billingPeriodStart: date("billing_period_start").notNull(),
    billingPeriodEnd: date("billing_period_end").notNull(),
    estimatedHours: decimal("estimated_hours", { precision: 8, scale: 2 }),
    estimatedInvoiceAmount: decimal("estimated_invoice_amount", { precision: 12, scale: 2 }),
    
    // Document Status
    status: varchar("status", { length: 50 }).default("pending"), // pending, signed, acknowledged, invoiced, voided
    
    // Customer Signature
    signedDate: timestamp("signed_date"),
    signatureData: jsonb("signature_data"),
    
    // Document Content
    documentContent: text("document_content"), // HTML rendering
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_billing_conf_tenant").on(table.tenantId),
    requestIdx: index("idx_billing_conf_request").on(table.workerRequestId),
    hallmarkIdx: index("idx_billing_conf_hallmark").on(table.hallmarkId),
    statusIdx: index("idx_billing_conf_status").on(table.status),
  })
);

export const insertBillingConfirmationSchema = createInsertSchema(billingConfirmations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBillingConfirmation = z.infer<typeof insertBillingConfirmationSchema>;
export type BillingConfirmation = typeof billingConfirmations.$inferSelect;

// ========================
// Worker Acceptance (Position Acceptance)
// ========================
export const workerAcceptances = pgTable(
  "worker_acceptances",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    workerRequestId: varchar("worker_request_id").notNull().references(() => workerRequests.id),
    workerId: varchar("worker_id").notNull().references(() => workers.id),
    
    // Status
    acceptanceStatus: varchar("acceptance_status", { length: 50 }).notNull(), // "accepted", "rejected", "pending"
    acceptedAt: timestamp("accepted_at"),
    rejectedAt: timestamp("rejected_at"),
    rejectionReason: text("rejection_reason"),
    
    // Rates Accepted
    acceptedHourlyRate: decimal("accepted_hourly_rate", { precision: 8, scale: 2 }),
    
    // Worker Metadata
    acceptanceMethod: varchar("acceptance_method", { length: 50 }), // "app", "sms", "phone", "email"
    acceptanceIpAddress: varchar("acceptance_ip_address", { length: 45 }),
    acceptanceDeviceInfo: varchar("acceptance_device_info", { length: 255 }),
    
    // Audit
    acknowledgedAt: timestamp("acknowledged_at"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_acceptance_tenant").on(table.tenantId),
    requestIdx: index("idx_acceptance_request").on(table.workerRequestId),
    workerIdx: index("idx_acceptance_worker").on(table.workerId),
    statusIdx: index("idx_acceptance_status").on(table.acceptanceStatus),
    acceptedAtIdx: index("idx_acceptance_accepted_at").on(table.acceptedAt),
  })
);

export const insertWorkerAcceptanceSchema = createInsertSchema(workerAcceptances).omit({
  id: true,
  acceptedAt: true,
  rejectedAt: true,
  acknowledgedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorkerAcceptance = z.infer<typeof insertWorkerAcceptanceSchema>;
export type WorkerAcceptance = typeof workerAcceptances.$inferSelect;

// ========================
// Standard Pay Rates (Market Rates by Position/Location)
// ========================
export const standardPayRates = pgTable(
  "standard_pay_rates",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Position Details
    position: varchar("position", { length: 100 }).notNull(), // "General Laborer", "Forklift Operator", "Warehouse Associate", etc.
    positionCategory: varchar("position_category", { length: 100 }), // "warehouse", "construction", "hospitality", "healthcare"
    skillLevel: varchar("skill_level", { length: 50 }).default("entry"), // "entry", "intermediate", "experienced", "expert"
    
    // Geographic Location
    state: varchar("state", { length: 2 }).notNull(), // TN, KY, AL, etc.
    city: varchar("city", { length: 100 }), // Optional: Nashville, Memphis, Louisville, etc.
    region: varchar("region", { length: 50 }), // Optional: "Middle TN", "Western KY"
    
    // Rate Information
    hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }).notNull(),
    minRate: decimal("min_rate", { precision: 8, scale: 2 }), // Min market rate
    maxRate: decimal("max_rate", { precision: 8, scale: 2 }), // Max market rate
    
    // Metadata
    effectiveDate: date("effective_date").notNull(),
    expirationDate: date("expiration_date"),
    source: varchar("source", { length: 255 }).default("Market Survey"), // "Market Survey", "Bureau of Labor Stats", "Industry Standard"
    notes: text("notes"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    positionStateIdx: index("idx_std_pay_position_state").on(table.position, table.state),
    stateIdx: index("idx_std_pay_state").on(table.state),
    categoryIdx: index("idx_std_pay_category").on(table.positionCategory),
    effectiveDateIdx: index("idx_std_pay_effective").on(table.effectiveDate),
  })
);

export const insertStandardPayRateSchema = createInsertSchema(standardPayRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStandardPayRate = z.infer<typeof insertStandardPayRateSchema>;
export type StandardPayRate = typeof standardPayRates.$inferSelect;

// ========================
// Prevailing Wages (Government-mandated rates by state/job)
// ========================
export const prevailingWages = pgTable(
  "prevailing_wages",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Geographic & Classification
    state: varchar("state", { length: 2 }).notNull(), // TN, KY, AL, AR, NC, SC, GA, MS
    jobClassification: varchar("job_classification", { length: 100 }).notNull(), // "Electrician", "Carpenter", "General Laborer", etc.
    skillLevel: varchar("skill_level", { length: 50 }), // "Apprentice", "Journeyman", "Master", etc.
    
    // Rates
    baseHourlyRate: decimal("base_hourly_rate", { precision: 8, scale: 2 }).notNull(),
    fringe: decimal("fringe", { precision: 8, scale: 2 }).default("0.00"), // Additional fringe benefits
    totalHourlyRate: decimal("total_hourly_rate", { precision: 8, scale: 2 }).notNull(), // base + fringe
    
    // Metadata
    effectiveDate: date("effective_date").notNull(),
    expirationDate: date("expiration_date"),
    source: varchar("source", { length: 255 }), // "US Dept of Labor", "State Labor Board", etc.
    applicableProjectTypes: varchar("applicable_project_types", { length: 255 }), // "public_works", "government_contracts", "union_work"
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    stateIdx: index("idx_prevailing_state").on(table.state),
    classificationIdx: index("idx_prevailing_classification").on(table.jobClassification),
    effectiveDateIdx: index("idx_prevailing_effective").on(table.effectiveDate),
  })
);

export const insertPrevailingWageSchema = createInsertSchema(prevailingWages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPrevailingWage = z.infer<typeof insertPrevailingWageSchema>;
export type PrevailingWage = typeof prevailingWages.$inferSelect;

// ========================
// Workers Comp Rates (State-specific by industry)
// ========================
export const workersCompRates = pgTable(
  "workers_comp_rates",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Geographic & Industry
    state: varchar("state", { length: 2 }).notNull(),
    industryClassification: varchar("industry_classification", { length: 100 }).notNull(), // "construction", "healthcare", "general_labor", etc.
    riskLevel: varchar("risk_level", { length: 50 }), // "low", "medium", "high"
    
    // Rates
    percentageOfPayroll: decimal("percentage_of_payroll", { precision: 8, scale: 4 }).notNull(), // 0.5% - 20%
    minimumPremiumPerEmployee: decimal("minimum_premium_per_employee", { precision: 10, scale: 2 }),
    
    // Requirements
    coverageRequired: boolean("coverage_required").default(true),
    minimumCoverage: decimal("minimum_coverage", { precision: 12, scale: 2 }),
    
    // Metadata
    effectiveDate: date("effective_date").notNull(),
    expirationDate: date("expiration_date"),
    governingBody: varchar("governing_body", { length: 100 }), // "TN Department of Labor", etc.
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    stateIdx: index("idx_wc_state").on(table.state),
    industryIdx: index("idx_wc_industry").on(table.industryClassification),
    effectiveDateIdx: index("idx_wc_effective").on(table.effectiveDate),
  })
);

export const insertWorkersCompRateSchema = createInsertSchema(workersCompRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorkersCompRate = z.infer<typeof insertWorkersCompRateSchema>;
export type WorkersCompRate = typeof workersCompRates.$inferSelect;

// ========================
// State Compliance Rules
// ========================
export const stateComplianceRules = pgTable(
  "state_compliance_rules",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // State
    state: varchar("state", { length: 2 }).notNull().unique(),
    
    // Key Compliance Requirements
    minWagePerHour: decimal("min_wage_per_hour", { precision: 8, scale: 2 }).notNull(),
    workersCompRequired: boolean("workers_comp_required").default(true),
    backgroundCheckRequired: boolean("background_check_required").default(false),
    licenseRequirementsPerTrade: jsonb("license_requirements_per_trade"), // {"electrician": "required", "plumber": "required"}
    prevailingWageApplies: boolean("prevailing_wage_applies").default(false),
    
    // Notes & Resources
    specialRequirements: text("special_requirements"),
    departmentOfLaborUrl: varchar("department_of_labor_url", { length: 500 }),
    lastUpdated: timestamp("last_updated").notNull(),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    stateIdx: index("idx_compliance_state").on(table.state),
  })
);

export const insertStateComplianceRuleSchema = createInsertSchema(stateComplianceRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStateComplianceRule = z.infer<typeof insertStateComplianceRuleSchema>;
export type StateComplianceRule = typeof stateComplianceRules.$inferSelect;

// ========================
// Integration OAuth Tokens
// ========================
export const integrationTokens = pgTable(
  "integration_tokens",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    integrationType: varchar("integration_type", { length: 50 }).notNull(), // "quickbooks", "adp", "google", "microsoft"
    accessToken: text("access_token").notNull(), // Encrypted
    refreshToken: text("refresh_token"), // Encrypted
    expiresAt: timestamp("expires_at"),
    scope: text("scope"), // OAuth scopes granted
    realmId: varchar("realm_id", { length: 255 }), // QuickBooks realm ID
    lastSyncedAt: timestamp("last_synced_at"),
    connectionStatus: varchar("connection_status", { length: 50 }).default("connected"), // "connected", "error", "expired"
    lastError: text("last_error"),
    metadata: jsonb("metadata"), // Store provider-specific data
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_tokens_tenant").on(table.tenantId),
    typeIdx: index("idx_tokens_type").on(table.integrationType),
    tenantTypeIdx: index("idx_tokens_tenant_type").on(table.tenantId, table.integrationType),
  })
);

export const insertIntegrationTokenSchema = createInsertSchema(integrationTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSyncedAt: true,
});

export type InsertIntegrationToken = z.infer<typeof insertIntegrationTokenSchema>;
export type IntegrationToken = typeof integrationTokens.$inferSelect;

// ========================
// Data Sync Tracking
// ========================
export const syncLogs = pgTable(
  "sync_logs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    integrationType: varchar("integration_type", { length: 50 }).notNull(),
    entityType: varchar("entity_type", { length: 50 }).notNull(), // "customer", "worker", "invoice", "timesheet"
    syncStatus: varchar("sync_status", { length: 50 }).default("pending"), // "pending", "in_progress", "completed", "failed"
    recordsProcessed: integer("records_processed").default(0),
    recordsSucceeded: integer("records_succeeded").default(0),
    recordsFailed: integer("records_failed").default(0),
    errorMessage: text("error_message"),
    syncStartedAt: timestamp("sync_started_at"),
    syncCompletedAt: timestamp("sync_completed_at"),
    nextSyncAt: timestamp("next_sync_at"),
    metadata: jsonb("metadata"), // Store sync-specific details
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_sync_logs_tenant").on(table.tenantId),
    typeIdx: index("idx_sync_logs_integration").on(table.integrationType),
    statusIdx: index("idx_sync_logs_status").on(table.syncStatus),
  })
);

export const insertSyncLogSchema = createInsertSchema(syncLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertSyncLog = z.infer<typeof insertSyncLogSchema>;
export type SyncLog = typeof syncLogs.$inferSelect;

// ========================
// Synced Data Cache (Local Copy)
// ========================
export const syncedData = pgTable(
  "synced_data",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull().references(() => companies.id),
    integrationType: varchar("integration_type", { length: 50 }).notNull(),
    entityType: varchar("entity_type", { length: 50 }).notNull(), // "customer", "worker", "invoice"
    externalId: varchar("external_id", { length: 255 }).notNull(), // ID from source system
    orbitId: varchar("orbit_id", { length: 255 }), // ID in ORBIT if created
    sourceData: jsonb("source_data").notNull(), // Raw data from provider
    normalizedData: jsonb("normalized_data"), // Transformed to ORBIT format
    syncedAt: timestamp("synced_at").default(sql`NOW()`),
    externalUpdatedAt: timestamp("external_updated_at"), // Last update timestamp from provider
    localUpdatedAt: timestamp("local_updated_at"), // Last time we modified it locally
    conflict: boolean("conflict").default(false), // Flag if data conflicts locally
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    tenantIdx: index("idx_synced_tenant").on(table.tenantId),
    typeIdx: index("idx_synced_integration_entity").on(table.integrationType, table.entityType),
    externalIdIdx: index("idx_synced_external_id").on(table.externalId),
  })
);

export const insertSyncedDataSchema = createInsertSchema(syncedData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  syncedAt: true,
});

export type InsertSyncedData = z.infer<typeof insertSyncedDataSchema>;
export type SyncedData = typeof syncedData.$inferSelect;

// ========================
// CSA Templates (Client Service Agreement)
// ========================
export const csaTemplates = pgTable(
  "csa_templates",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    version: varchar("version", { length: 20 }).notNull(), // "1.0", "1.1", "2.0"
    templateContent: text("template_content").notNull(), // Full HTML or Markdown content
    
    // Metadata
    effectiveDate: date("effective_date").notNull(),
    expirationDate: date("expiration_date"),
    isActive: boolean("is_active").default(false), // Only one active version at a time
    jurisdiction: varchar("jurisdiction", { length: 2 }), // State code for state-specific variations (TN, KY, etc.)
    
    // Audit Trail
    createdBy: varchar("created_by").references(() => users.id),
    approvedBy: varchar("approved_by").references(() => users.id),
    approvedAt: timestamp("approved_at"),
    
    // Key Terms (for quick reference without parsing content)
    conversionFeeDollars: decimal("conversion_fee_dollars", { precision: 10, scale: 2 }).default("5000.00"),
    conversionPeriodMonths: integer("conversion_period_months").default(6),
    conversionPeriodHours: integer("conversion_period_hours").default(480),
    defaultMarkupMultiplier: decimal("default_markup_multiplier", { precision: 5, scale: 2 }).default("1.45"),
    latePaymentInterestRate: decimal("late_payment_interest_rate", { precision: 5, scale: 2 }).default("1.50"), // 1.5% monthly
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    versionIdx: index("idx_csa_version").on(table.version),
    activeIdx: index("idx_csa_active").on(table.isActive),
    effectiveDateIdx: index("idx_csa_effective").on(table.effectiveDate),
    jurisdictionIdx: index("idx_csa_jurisdiction").on(table.jurisdiction),
  })
);

export const insertCSATemplateSchema = createInsertSchema(csaTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
});

export type InsertCSATemplate = z.infer<typeof insertCSATemplateSchema>;
export type CSATemplate = typeof csaTemplates.$inferSelect;

// ========================
// Admin Login Logs (Security & Audit Trail)
// ========================
export const adminLoginLogs = pgTable(
  "admin_login_logs",
  {
    id: serial("id").primaryKey(),
    adminName: varchar("admin_name", { length: 255 }).notNull(),
    adminRole: varchar("admin_role", { length: 50 }).notNull(), // master_admin, franchise_admin, customer_admin
    loginTime: timestamp("login_time").default(sql`NOW()`).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }), // IPv6 compatible
    userAgent: text("user_agent"),
    sessionDuration: integer("session_duration"), // minutes, updated on logout
    logoutTime: timestamp("logout_time"),
  },
  (table) => ({
    adminNameIdx: index("idx_admin_login_logs_name").on(table.adminName),
    loginTimeIdx: index("idx_admin_login_logs_time").on(table.loginTime),
  })
);

export const insertAdminLoginLogSchema = createInsertSchema(adminLoginLogs).omit({
  id: true,
});

export type InsertAdminLoginLog = z.infer<typeof insertAdminLoginLogSchema>;
export type AdminLoginLog = typeof adminLoginLogs.$inferSelect;

// ========================
// Beta Testers (Sandbox Access System)
// ========================
export const betaTesters = pgTable(
  "beta_testers",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    hashedPin: varchar("hashed_pin", { length: 255 }).notNull(), // bcrypt hashed 3-digit PIN
    status: varchar("status", { length: 20 }).default("active"), // active, suspended, revoked
    accessLevel: varchar("access_level", { length: 50 }).default("full_sandbox"), // full_sandbox, limited, view_only
    notes: text("notes"),
    createdBy: varchar("created_by", { length: 255 }).default("Sidonie"), // Master admin who created
    lastLoginAt: timestamp("last_login_at"),
    loginCount: integer("login_count").default(0),
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    statusIdx: index("idx_beta_testers_status").on(table.status),
    emailIdx: index("idx_beta_testers_email").on(table.email),
  })
);

export const insertBetaTesterSchema = createInsertSchema(betaTesters).omit({
  id: true,
  lastLoginAt: true,
  loginCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBetaTester = z.infer<typeof insertBetaTesterSchema>;
export type BetaTester = typeof betaTesters.$inferSelect;

// ========================
// Beta Tester Access Logs (Audit Trail)
// ========================
export const betaTesterAccessLogs = pgTable(
  "beta_tester_access_logs",
  {
    id: serial("id").primaryKey(),
    testerId: integer("tester_id").references(() => betaTesters.id).notNull(),
    testerName: varchar("tester_name", { length: 255 }).notNull(),
    action: varchar("action", { length: 100 }).notNull(), // login, logout, view_feature, test_workflow
    feature: varchar("feature", { length: 255 }), // Which feature was accessed
    details: text("details"), // Additional context
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    timestamp: timestamp("timestamp").default(sql`NOW()`).notNull(),
  },
  (table) => ({
    testerIdx: index("idx_beta_access_logs_tester").on(table.testerId),
    timestampIdx: index("idx_beta_access_logs_time").on(table.timestamp),
    actionIdx: index("idx_beta_access_logs_action").on(table.action),
  })
);

export const insertBetaTesterAccessLogSchema = createInsertSchema(betaTesterAccessLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertBetaTesterAccessLog = z.infer<typeof insertBetaTesterAccessLogSchema>;
export type BetaTesterAccessLog = typeof betaTesterAccessLogs.$inferSelect;
