/**
 * Professional Staffing Division Schema
 * Added for V2 (Q3 2026) - Not yet wired to API
 * Tables for future professional placement system
 */

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, timestamp, decimal, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========================
// Professional Worker Certifications
// ========================
export const workerCertifications = pgTable(
  "worker_certifications",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    workerId: varchar("worker_id").notNull(),
    
    // Certification Details
    certificationType: varchar("certification_type", { length: 100 }).notNull(), // "RN", "CPA", "PE", "MBA", etc.
    issuer: varchar("issuer", { length: 255 }),
    issuedDate: date("issued_date"),
    expiryDate: date("expiry_date"),
    licenseNumber: varchar("license_number", { length: 100 }),
    verificationUrl: varchar("verification_url", { length: 500 }),
    
    // Verification Status
    verificationStatus: varchar("verification_status", { length: 50 }).default("pending"), // "pending", "verified", "expired", "disputed"
    verifiedBy: varchar("verified_by"), // Admin who verified
    verifiedAt: timestamp("verified_at"),
    
    // Document Storage
    documentUrl: varchar("document_url", { length: 500 }), // URL to certificate PDF/image
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    workerIdx: index("idx_cert_worker_id").on(table.workerId),
    typeIdx: index("idx_cert_type").on(table.certificationType),
    statusIdx: index("idx_cert_status").on(table.verificationStatus),
    expiryIdx: index("idx_cert_expiry").on(table.expiryDate),
  })
);

export const insertWorkerCertificationSchema = createInsertSchema(workerCertifications).omit({
  id: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorkerCertification = z.infer<typeof insertWorkerCertificationSchema>;
export type WorkerCertification = typeof workerCertifications.$inferSelect;

// ========================
// Professional Contracts
// ========================
export const professionalContracts = pgTable(
  "professional_contracts",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    workerId: varchar("worker_id").notNull(),
    clientId: varchar("client_id").notNull(),
    jobId: varchar("job_id"),
    
    // Contract Terms
    contractType: varchar("contract_type", { length: 50 }), // "W-2", "1099", "C2C"
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    contractDurationWeeks: integer("contract_duration_weeks"),
    
    // Rates
    billRate: decimal("bill_rate", { precision: 10, scale: 2 }).notNull(),
    payRate: decimal("pay_rate", { precision: 10, scale: 2 }).notNull(),
    margin: decimal("margin", { precision: 5, scale: 2 }), // Calculated: (billRate - payRate) / billRate * 100
    
    // Contract Document
    sowUrl: varchar("sow_url", { length: 500 }), // Statement of Work URL
    contractDocument: text("contract_document"), // Full contract text/JSON
    
    // Signatures
    workerSignedAt: timestamp("worker_signed_at"),
    clientSignedAt: timestamp("client_signed_at"),
    acceptedAt: timestamp("accepted_at"),
    
    // Status
    status: varchar("status", { length: 50 }).default("draft"), // "draft", "pending_review", "signed", "active", "completed", "terminated"
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    workerIdx: index("idx_contract_worker_id").on(table.workerId),
    clientIdx: index("idx_contract_client_id").on(table.clientId),
    statusIdx: index("idx_contract_status").on(table.status),
    startIdx: index("idx_contract_start").on(table.startDate),
  })
);

export const insertProfessionalContractSchema = createInsertSchema(professionalContracts).omit({
  id: true,
  workerSignedAt: true,
  clientSignedAt: true,
  acceptedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProfessionalContract = z.infer<typeof insertProfessionalContractSchema>;
export type ProfessionalContract = typeof professionalContracts.$inferSelect;

// ========================
// Interview Schedules
// ========================
export const interviewSchedules = pgTable(
  "interview_schedules",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    candidateId: varchar("candidate_id").notNull(),
    clientId: varchar("client_id").notNull(),
    jobId: varchar("job_id"),
    
    // Interview Details
    scheduledTime: timestamp("scheduled_time").notNull(),
    duration: integer("duration"), // In minutes
    interviewType: varchar("interview_type", { length: 50 }), // "phone", "video", "in-person"
    
    // Participants
    candidateName: varchar("candidate_name", { length: 255 }),
    interviewerName: varchar("interviewer_name", { length: 255 }),
    interviewerEmail: varchar("interviewer_email", { length: 255 }),
    
    // Meeting Link
    meetingLink: varchar("meeting_link", { length: 500 }), // Zoom/Teams/Meet link
    
    // Notes & Feedback
    notes: text("notes"),
    interviewerFeedback: text("interviewer_feedback"),
    candidateFeedback: text("candidate_feedback"),
    
    // Decision
    decision: varchar("decision", { length: 50 }), // "pending", "approved", "rejected", "hold"
    decidedAt: timestamp("decided_at"),
    decidedBy: varchar("decided_by"), // User ID who made decision
    
    // Status
    status: varchar("status", { length: 50 }).default("scheduled"), // "scheduled", "completed", "cancelled", "no_show"
    completedAt: timestamp("completed_at"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
  },
  (table) => ({
    candidateIdx: index("idx_interview_candidate").on(table.candidateId),
    clientIdx: index("idx_interview_client").on(table.clientId),
    statusIdx: index("idx_interview_status").on(table.status),
    scheduledIdx: index("idx_interview_scheduled").on(table.scheduledTime),
  })
);

export const insertInterviewScheduleSchema = createInsertSchema(interviewSchedules).omit({
  id: true,
  decidedAt: true,
  completedAt: true,
  createdAt: true,
});

export type InsertInterviewSchedule = z.infer<typeof insertInterviewScheduleSchema>;
export type InterviewSchedule = typeof interviewSchedules.$inferSelect;

// ========================
// Background Checks
// ========================
export const backgroundChecks = pgTable(
  "background_checks",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    workerId: varchar("worker_id").notNull(),
    
    // Vendor & Status
    vendor: varchar("vendor", { length: 100 }), // "checkr", "sterling", "hireright"
    vendorRequestId: varchar("vendor_request_id", { length: 255 }),
    status: varchar("status", { length: 50 }).default("pending"), // "pending", "in_progress", "completed", "failed"
    
    // Results
    backgroundCheckResult: varchar("background_check_result", { length: 50 }), // "clear", "concerns", "failed"
    resultsJson: jsonb("results_json"), // Full vendor response
    clearanceDate: date("clearance_date"),
    
    // Compliance
    needsReview: boolean("needs_review").default(false),
    approvedBy: varchar("approved_by"), // Admin who approved
    approvedAt: timestamp("approved_at"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    workerIdx: index("idx_bg_check_worker").on(table.workerId),
    statusIdx: index("idx_bg_check_status").on(table.status),
    resultIdx: index("idx_bg_check_result").on(table.backgroundCheckResult),
  })
);

export const insertBackgroundCheckSchema = createInsertSchema(backgroundChecks).omit({
  id: true,
  clearanceDate: true,
  approvedAt: true,
  createdAt: true,
  completedAt: true,
});

export type InsertBackgroundCheck = z.infer<typeof insertBackgroundCheckSchema>;
export type BackgroundCheck = typeof backgroundChecks.$inferSelect;

// ========================
// Professional Jobs
// ========================
export const professionalJobs = pgTable(
  "professional_jobs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    clientId: varchar("client_id").notNull(),
    
    // Job Details
    title: varchar("title", { length: 255 }).notNull(), // "Senior Nurse", "CPA", "Solutions Architect"
    description: text("description"),
    industry: varchar("industry", { length: 100 }), // "healthcare", "finance", "tech", etc.
    
    // Requirements
    requiredCertifications: text("required_certifications").array(), // Array of cert types
    minExperience: integer("min_experience"), // Years of experience
    specialSkills: text("special_skills").array(),
    
    // Contract Details
    contractType: varchar("contract_type", { length: 50 }), // "W-2", "1099", "C2C"
    contractDuration: varchar("contract_duration", { length: 50 }), // "3-months", "6-months", "ongoing"
    startDate: date("start_date"),
    
    // Rates
    billRateMin: decimal("bill_rate_min", { precision: 10, scale: 2 }),
    billRateMax: decimal("bill_rate_max", { precision: 10, scale: 2 }),
    payRateMin: decimal("pay_rate_min", { precision: 10, scale: 2 }),
    payRateMax: decimal("pay_rate_max", { precision: 10, scale: 2 }),
    
    // Status
    status: varchar("status", { length: 50 }).default("open"), // "open", "filled", "closed", "on_hold"
    filledAt: timestamp("filled_at"),
    
    createdAt: timestamp("created_at").default(sql`NOW()`),
    updatedAt: timestamp("updated_at").default(sql`NOW()`),
  },
  (table) => ({
    clientIdx: index("idx_prof_job_client").on(table.clientId),
    statusIdx: index("idx_prof_job_status").on(table.status),
    industryIdx: index("idx_prof_job_industry").on(table.industry),
  })
);

export const insertProfessionalJobSchema = createInsertSchema(professionalJobs).omit({
  id: true,
  filledAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProfessionalJob = z.infer<typeof insertProfessionalJobSchema>;
export type ProfessionalJob = typeof professionalJobs.$inferSelect;
