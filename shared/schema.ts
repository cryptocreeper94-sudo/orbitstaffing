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
    companyId: varchar("company_id").references(() => companies.id),
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
// Franchises (White-Label Partners)
// ========================
export const franchises = pgTable(
  "franchises",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    ownerId: varchar("owner_id").notNull().references(() => users.id),
    
    // Branding
    logoUrl: varchar("logo_url", { length: 500 }),
    customDomain: varchar("custom_domain", { length: 255 }),
    brandColor: varchar("brand_color", { length: 7 }).default("#06B6D4"), // Aqua default
    
    // License
    licenseId: varchar("license_id").references(() => licenses.id),
    licenseStatus: varchar("license_status", { length: 50 }).default("active"), // active, paused, expired
    licenseStartDate: date("license_start_date"),
    licenseEndDate: date("license_end_date"),
    supportEndDate: date("support_end_date"), // Warranty period
    
    // Capacity
    maxWorkers: integer("max_workers").default(500),
    maxClients: integer("max_clients").default(50),
    
    // Settings
    billingModel: varchar("billing_model", { length: 50 }).default("fixed"), // fixed or revenue_share
    monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }),
    revenueSharePercentage: decimal("revenue_share_percentage", { precision: 5, scale: 2 }),
    
    // Multi-Tenancy Data Isolation
    dataIsolationLevel: varchar("data_isolation_level", { length: 50 }).default("strict"), // strict, shared, custom
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    ownerIdx: index("idx_franchises_owner_id").on(table.ownerId),
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
// Worker Verification & Hallmark System
// ========================
export const workerVerification = pgTable(
  "worker_verification",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    workerId: varchar("worker_id").notNull().references(() => workers.id),
    companyId: varchar("company_id").notNull().references(() => companies.id),
    
    // Digital Hallmark/Seal
    verificationCode: varchar("verification_code", { length: 50 }).unique(), // e.g., ORBIT-ABC123XYZ
    qrCodeUrl: text("qr_code_url"), // URL to QR code image
    qrCodeData: text("qr_code_data"), // Raw QR code data
    
    // Verification Status
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`NOW()`),
    expiresAt: timestamp("expires_at"), // Optional expiration
  },
  (table) => ({
    workerIdx: index("idx_verification_worker_id").on(table.workerId),
    companyIdx: index("idx_verification_company_id").on(table.companyId),
    codeIdx: index("idx_verification_code").on(table.verificationCode),
  })
);

export const insertWorkerVerificationSchema = createInsertSchema(workerVerification).omit({
  id: true,
  createdAt: true,
});

export type InsertWorkerVerification = z.infer<typeof insertWorkerVerificationSchema>;
export type WorkerVerification = typeof workerVerification.$inferSelect;

// ========================
// Company News & Updates
// ========================
export const companyNews = pgTable(
  "company_news",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").notNull().references(() => companies.id),
    
    // News Content
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    category: varchar("category", { length: 50 }), // "update", "announcement", "alert", "hiring", "policy"
    
    // Priority & Display
    priority: varchar("priority", { length: 20 }).default("normal"), // "normal", "high", "urgent"
    isPinned: boolean("is_pinned").default(false),
    
    // Visibility
    visibleToWorkers: boolean("visible_to_workers").default(true),
    visibleToClients: boolean("visible_to_clients").default(false),
    visibleToPublic: boolean("visible_to_public").default(false),
    
    // Status
    publishedAt: timestamp("published_at").default(sql`NOW()`),
    expiresAt: timestamp("expires_at"), // Auto-hide after date
    createdBy: varchar("created_by").references(() => users.id),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_news_company_id").on(table.companyId),
    publishedIdx: index("idx_news_published_at").on(table.publishedAt),
  })
);

export const insertCompanyNewsSchema = createInsertSchema(companyNews).omit({
  id: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCompanyNews = z.infer<typeof insertCompanyNewsSchema>;
export type CompanyNews = typeof companyNews.$inferSelect;

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

    // External Reference Numbers (Non-conflicting with client systems)
    clientJobReference: varchar("client_job_reference", { length: 100 }), // Their reference number (QuickBooks, ADP, etc.)
    externalJobId: varchar("external_job_id", { length: 100 }), // ID from their system

    // Rates
    workerWage: decimal("worker_wage", { precision: 8, scale: 2 }),
    billRate: decimal("bill_rate", { precision: 8, scale: 2 }),
    markupMultiplier: decimal("markup_multiplier", { precision: 5, scale: 2 }).default("1.35"),

    // Location
    latitude: decimal("latitude", { precision: 9, scale: 6 }), // Job site GPS location
    longitude: decimal("longitude", { precision: 9, scale: 6 }), // Job site GPS location
    locationName: varchar("location_name", { length: 255 }), // "Nissan Stadium", "Downtown Project", etc.
    address: varchar("address", { length: 255 }),

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

    // Arrangement Type & Conversion Tracking
    arrangementType: varchar("arrangement_type", { length: 50 }).default("day_labor"), // day_labor, weekly, part_time, semi_permanent, permanent
    isConversionEligible: boolean("is_conversion_eligible").default(false), // Can this be converted to full-time?
    totalHoursWorked: decimal("total_hours_worked", { precision: 10, scale: 2 }).default("0"), // Cumulative hours for conversion tracking

    // Rates
    workerRate: decimal("worker_rate", { precision: 8, scale: 2 }),
    billRate: decimal("bill_rate", { precision: 8, scale: 2 }),

    // Check-in Tracking
    checkedInAt: timestamp("checked_in_at"), // When worker GPS verified arrival
    checkedOutAt: timestamp("checked_out_at"), // When worker left job
    noShowStatus: varchar("no_show_status", { length: 50 }), // "show", "no_show", "late", "pending"

    // External References (For client data sync)
    externalAssignmentId: varchar("external_assignment_id", { length: 100 }), // From QuickBooks, ADP, UKG Pro
    externalClientName: varchar("external_client_name", { length: 255 }), // Client's name in their system

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
// Worker Conversions (Temp to Full-Time Hiring)
// ========================
export const workerConversions = pgTable(
  "worker_conversions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").references(() => companies.id),
    workerId: varchar("worker_id").references(() => workers.id),
    clientId: varchar("client_id").references(() => clients.id),

    // Conversion Details
    totalHoursWorked: decimal("total_hours_worked", { precision: 10, scale: 2 }).notNull(),
    conversionDate: timestamp("conversion_date"), // When worker becomes full-time
    conversionStatus: varchar("conversion_status", { length: 50 }).default("pending"), // pending, approved, completed, declined, cancelled
    buyoutFeeRequired: decimal("buyout_fee_required", { precision: 10, scale: 2 }).default("0"), // 0, 2000, or 4000
    buyoutFeePaid: boolean("buyout_fee_paid").default(false),
    buyoutPaymentDate: timestamp("buyout_payment_date"),

    // Worker & Client Approval
    workerApproved: boolean("worker_approved").default(false),
    workerApprovedAt: timestamp("worker_approved_at"),
    clientApproved: boolean("client_approved").default(false),
    clientApprovedAt: timestamp("client_approved_at"),
    orbitApproved: boolean("orbit_approved").default(false),
    orbitApprovedAt: timestamp("orbit_approved_at"),

    // Notes
    conversionNotes: text("conversion_notes"),
    declineReason: varchar("decline_reason", { length: 255 }),

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_conversions_company_id").on(table.companyId),
    workerIdx: index("idx_conversions_worker_id").on(table.workerId),
    clientIdx: index("idx_conversions_client_id").on(table.clientId),
    statusIdx: index("idx_conversions_status").on(table.conversionStatus),
  })
);

export const insertWorkerConversionSchema = createInsertSchema(workerConversions).omit({
  id: true,
  conversionDate: true,
  workerApprovedAt: true,
  clientApprovedAt: true,
  orbitApprovedAt: true,
  buyoutPaymentDate: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorkerConversion = z.infer<typeof insertWorkerConversionSchema>;
export type WorkerConversion = typeof workerConversions.$inferSelect;

// ========================
// Assignment Reminders & Notifications
// ========================
export const assignmentReminders = pgTable(
  "assignment_reminders",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    assignmentId: varchar("assignment_id").references(() => assignments.id),
    workerId: varchar("worker_id").references(() => workers.id),

    // Reminder Schedule
    remindBefore: integer("remind_before"), // Hours before (e.g., 24, 5, 1)
    scheduledAt: timestamp("scheduled_at"), // When reminder should be sent
    sentAt: timestamp("sent_at"), // When reminder was actually sent
    sentVia: varchar("sent_via", { length: 50 }).default("push"), // push, email, sms, all

    // Reminder Content
    title: varchar("title", { length: 255 }),
    message: text("message"),
    jobNumber: varchar("job_number", { length: 100 }), // Reference for worker

    // Status
    status: varchar("status", { length: 50 }).default("pending"), // pending, sent, delivered, read, clicked

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    assignmentIdx: index("idx_reminders_assignment_id").on(table.assignmentId),
    workerIdx: index("idx_reminders_worker_id").on(table.workerId),
    statusIdx: index("idx_reminders_status").on(table.status),
  })
);

export const insertAssignmentReminderSchema = createInsertSchema(assignmentReminders).omit({
  id: true,
  sentAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAssignmentReminder = z.infer<typeof insertAssignmentReminderSchema>;
export type AssignmentReminder = typeof assignmentReminders.$inferSelect;

// ========================
// External Integrations (QuickBooks, ADP, UKG Pro, etc.)
// ========================
export const externalIntegrations = pgTable(
  "external_integrations",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").references(() => companies.id),

    // Integration Type
    integrationType: varchar("integration_type", { length: 100 }).notNull(), // "quickbooks", "adp", "ukgpro", "paylocity", etc.
    displayName: varchar("display_name", { length: 255 }), // "QuickBooks Online", "ADP Workforce Now", etc.

    // Authentication
    apiKey: varchar("api_key", { length: 500 }), // Encrypted
    apiSecret: varchar("api_secret", { length: 500 }), // Encrypted
    oauthToken: text("oauth_token"), // For OAuth-based integrations
    refreshToken: varchar("refresh_token", { length: 500 }), // For OAuth refresh
    webhookSecret: varchar("webhook_secret", { length: 255 }), // For webhook validation

    // Configuration
    status: varchar("status", { length: 50 }).default("connected"), // connected, disconnected, error, pending
    lastSyncAt: timestamp("last_sync_at"), // When we last pulled data
    nextSyncAt: timestamp("next_sync_at"), // When we'll pull data next
    syncFrequency: varchar("sync_frequency", { length: 50 }).default("daily"), // hourly, daily, weekly

    // Data Mapping
    fieldMapping: text("field_mapping"), // JSON: maps their fields to ours
    testMode: boolean("test_mode").default(false), // Testing credentials?

    // Error Tracking
    lastError: text("last_error"),
    errorCount: integer("error_count").default(0),

    // Metadata
    externalCompanyId: varchar("external_company_id", { length: 255 }), // Their company ID
    externalUserId: varchar("external_user_id", { length: 255 }), // Their user ID

    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_integrations_company_id").on(table.companyId),
    typeIdx: index("idx_integrations_type").on(table.integrationType),
    statusIdx: index("idx_integrations_status").on(table.status),
  })
);

export const insertExternalIntegrationSchema = createInsertSchema(externalIntegrations).omit({
  id: true,
  lastSyncAt: true,
  nextSyncAt: true,
  lastError: true,
  errorCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertExternalIntegration = z.infer<typeof insertExternalIntegrationSchema>;
export type ExternalIntegration = typeof externalIntegrations.$inferSelect;

// ========================
// Sync Logs (Track data migrations from external systems)
// ========================
export const syncLogs = pgTable(
  "sync_logs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").references(() => companies.id),
    integrationId: varchar("integration_id").references(() => externalIntegrations.id),

    // Sync Details
    syncType: varchar("sync_type", { length: 100 }).notNull(), // "initial_import", "incremental", "manual"
    status: varchar("status", { length: 50 }).default("running"), // running, completed, failed, partially_completed
    
    // Data Summary
    recordsAttempted: integer("records_attempted").default(0),
    recordsSucceeded: integer("records_succeeded").default(0),
    recordsFailed: integer("records_failed").default(0),
    
    // Details
    errorLog: text("error_log"), // JSON with errors
    summary: text("summary"), // Human-readable summary
    
    startedAt: timestamp("started_at").default(sql`NOW()`),
    completedAt: timestamp("completed_at"),
    duration: integer("duration"), // milliseconds

    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_sync_logs_company_id").on(table.companyId),
    integrationIdx: index("idx_sync_logs_integration_id").on(table.integrationId),
    statusIdx: index("idx_sync_logs_status").on(table.status),
  })
);

export const insertSyncLogSchema = createInsertSchema(syncLogs).omit({
  id: true,
  startedAt: true,
  createdAt: true,
});

export type InsertSyncLog = z.infer<typeof insertSyncLogSchema>;
export type SyncLog = typeof syncLogs.$inferSelect;

// ========================
// Work Orders (Customer-facing job specifications)
// ========================
export const workOrders = pgTable(
  "work_orders",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: varchar("company_id").references(() => companies.id),
    clientId: varchar("client_id").references(() => clients.id),

    // Header
    referenceNumber: varchar("reference_number", { length: 100 }).unique(), // WO-2024-11-001
    clientContactName: varchar("client_contact_name", { length: 255 }),
    clientContactPhone: varchar("client_contact_phone", { length: 20 }),
    clientLocation: varchar("client_location", { length: 255 }),

    // Job Details
    positionTitle: varchar("position_title", { length: 255 }).notNull(),
    jobCategory: varchar("job_category", { length: 100 }), // skilled_trades, hospitality, general, admin, healthcare, manufacturing, custom
    jobDescription: text("job_description"),
    skillsRequired: text("skills_required"), // JSON array
    industryRequirements: text("industry_requirements"), // JSON array
    certificationsNeeded: text("certifications_needed"), // JSON array

    // Assignment Dates & Schedule
    startDate: date("start_date").notNull(),
    endDate: date("end_date"), // nullable for ongoing
    durationType: varchar("duration_type", { length: 50 }), // one_time, temporary, long_term, ongoing
    dailyHours: integer("daily_hours"),
    daysPerWeek: integer("days_per_week"),
    schedulePattern: varchar("schedule_pattern", { length: 255 }), // "Monday-Friday", "Rotating", etc.

    // Location
    jobSiteAddress: varchar("job_site_address", { length: 255 }),
    jobSiteLatitude: decimal("job_site_latitude", { precision: 9, scale: 6 }),
    jobSiteLongitude: decimal("job_site_longitude", { precision: 9, scale: 6 }),
    jobSiteContactName: varchar("job_site_contact_name", { length: 255 }),
    jobSiteContactPhone: varchar("job_site_contact_phone", { length: 20 }),
    accessInstructions: text("access_instructions"),

    // Pay & Terms
    hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
    paymentFrequency: varchar("payment_frequency", { length: 50 }), // weekly, biweekly, monthly
    overtimePolicy: varchar("overtime_policy", { length: 255 }), // "after 40h/week", "after 8h/day"
    shiftDifferentials: text("shift_differentials"), // JSON for night/weekend premium

    // Staffing Request
    workersNeeded: integer("workers_needed"),
    canFillPartial: boolean("can_fill_partial").default(true),
    backupAvailabilityNeeded: boolean("backup_availability_needed").default(false),

    // Special Requirements
    safetyRequirements: text("safety_requirements"), // JSON array
    equipmentProvided: text("equipment_provided"), // JSON array
    uniformsRequired: varchar("uniforms_required", { length: 255 }),
    ppeProvided: varchar("ppe_provided", { length: 255 }),

    // Sourcing Strategy
    sourcingStrategy: text("sourcing_strategy"), // JSON: ["orbit_pool", "indeed", "linkedin"]

    // Terms & Conditions
    replacementHours: integer("replacement_hours"), // hours to replace no-show
    cancellationNotice: integer("cancellation_notice"), // days notice required
    gpsVerificationRequired: boolean("gps_verification_required").default(false),

    // Invoice Details
    invoiceFrequency: varchar("invoice_frequency", { length: 50 }), // weekly, biweekly, upon_completion
    paymentTerms: integer("payment_terms"), // days (e.g., 30 for Net 30)
    poNumberRequired: boolean("po_number_required").default(false),
    costCenter: varchar("cost_center", { length: 100 }),

    // Status
    status: varchar("status", { length: 50 }).default("draft"), // draft, submitted, under_review, approved, active, completed, cancelled

    // Metadata
    submittedAt: timestamp("submitted_at"),
    approvedAt: timestamp("approved_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    companyIdx: index("idx_work_orders_company_id").on(table.companyId),
    clientIdx: index("idx_work_orders_client_id").on(table.clientId),
    statusIdx: index("idx_work_orders_status").on(table.status),
    startDateIdx: index("idx_work_orders_start_date").on(table.startDate),
  })
);

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({
  id: true,
  referenceNumber: true,
  submittedAt: true,
  approvedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type WorkOrder = typeof workOrders.$inferSelect;

// ========================
// iOS Interest List (Email capture for Coming Soon page)
// ========================
export const iosInterestList = pgTable(
  "ios_interest_list",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).notNull().unique(),
    source: varchar("source", { length: 50 }).default("ios_coming_soon"),
    userType: varchar("user_type", { length: 50 }),
    notes: text("notes"),
    notified: boolean("notified").default(false),
    notifiedAt: timestamp("notified_at"),
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    emailIdx: index("idx_ios_interest_email").on(table.email),
    sourceIdx: index("idx_ios_interest_source").on(table.source),
    notifiedIdx: index("idx_ios_interest_notified").on(table.notified),
  })
);

export const insertIosInterestSchema = createInsertSchema(iosInterestList).omit({
  id: true,
  notified: true,
  notifiedAt: true,
  createdAt: true,
});

export type InsertIosInterest = z.infer<typeof insertIosInterestSchema>;
export type IosInterest = typeof iosInterestList.$inferSelect;

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
