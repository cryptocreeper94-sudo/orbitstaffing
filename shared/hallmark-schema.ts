import { sql } from "drizzle-orm";
import { pgTable, varchar, timestamp, integer, text, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * ORBIT Hallmark System - Every asset gets a unique, searchable ID
 * Format: ORBIT-[TIMESTAMP]-[RANDOM] - Example: ORBIT-20251124-AB2K7X
 */
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

/**
 * Hallmark lookup/audit log for searching and verification
 */
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
