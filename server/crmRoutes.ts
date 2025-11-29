import type { Express, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { eq, and, desc, sql, gte, lte, or, ilike } from "drizzle-orm";
import {
  crmActivities,
  crmNotes,
  crmDeals,
  crmMeetings,
  crmCustomFields,
  crmCustomFieldValues,
  crmWorkflows,
  crmWorkflowLogs,
  crmDuplicates,
  crmChatConversations,
  crmChatMessages,
  crmEmailTracking,
  insertCrmActivitySchema,
  insertCrmNoteSchema,
  insertCrmDealSchema,
  insertCrmMeetingSchema,
  insertCrmCustomFieldSchema,
  insertCrmCustomFieldValueSchema,
  insertCrmWorkflowSchema,
  insertCrmDuplicateSchema,
  insertCrmChatConversationSchema,
  insertCrmChatMessageSchema,
  insertCrmEmailTrackingSchema,
  workers,
  clients,
  companies,
} from "@shared/schema";

// Authentication middleware for CRM routes - requires valid admin session
function requireCrmAuth(req: Request, res: Response, next: NextFunction): void {
  const session = (req as any).session;
  if (!session?.adminAuthenticated) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

// Get tenant ID from authenticated session only - never from query params
function getTenantIdFromRequest(req: Request): string | null {
  const session = (req as any).session;
  if (session?.tenantId) return session.tenantId;
  const user = (req as any).user;
  if (user?.tenantId) return user.tenantId;
  if (user?.companyId) return user.companyId;
  // Default to null for system-wide admin access (no tenant isolation)
  return null;
}

export function registerCrmRoutes(app: Express): void {
  // Apply authentication to all CRM routes
  app.use("/api/crm", requireCrmAuth);
  
  // ========================
  // CRM ACTIVITIES (Timeline/Interaction History)
  // ========================
  
  app.get("/api/crm/activities/:entityType/:entityId", async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.params;
      const tenantId = getTenantIdFromRequest(req);
      
      const activities = await db.select()
        .from(crmActivities)
        .where(and(
          eq(crmActivities.entityType, entityType),
          eq(crmActivities.entityId, entityId),
          tenantId ? eq(crmActivities.tenantId, tenantId) : sql`1=1`
        ))
        .orderBy(desc(crmActivities.createdAt))
        .limit(100);
      
      res.json({ activities });
    } catch (error) {
      console.error("[CRM Activities] Error:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.post("/api/crm/activities", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      const data = { ...req.body, tenantId };
      
      const activity = await db.insert(crmActivities).values(data).returning();
      res.json({ activity: activity[0] });
    } catch (error) {
      console.error("[CRM Activities] Error:", error);
      res.status(500).json({ error: "Failed to create activity" });
    }
  });

  // ========================
  // CRM NOTES
  // ========================
  
  app.get("/api/crm/notes/:entityType/:entityId", async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.params;
      const tenantId = getTenantIdFromRequest(req);
      
      const notes = await db.select()
        .from(crmNotes)
        .where(and(
          eq(crmNotes.entityType, entityType),
          eq(crmNotes.entityId, entityId),
          tenantId ? eq(crmNotes.tenantId, tenantId) : sql`1=1`
        ))
        .orderBy(desc(crmNotes.isPinned), desc(crmNotes.createdAt));
      
      res.json({ notes });
    } catch (error) {
      console.error("[CRM Notes] Error:", error);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/crm/notes", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      const data = { ...req.body, tenantId };
      
      const note = await db.insert(crmNotes).values(data).returning();
      res.json({ note: note[0] });
    } catch (error) {
      console.error("[CRM Notes] Error:", error);
      res.status(500).json({ error: "Failed to create note" });
    }
  });

  app.patch("/api/crm/notes/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body, updatedAt: new Date() };
      
      const note = await db.update(crmNotes)
        .set(updates)
        .where(eq(crmNotes.id, id))
        .returning();
      
      res.json({ note: note[0] });
    } catch (error) {
      console.error("[CRM Notes] Error:", error);
      res.status(500).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/crm/notes/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(crmNotes).where(eq(crmNotes.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("[CRM Notes] Error:", error);
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // ========================
  // CRM DEALS (Sales Pipeline)
  // ========================
  
  app.get("/api/crm/deals", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      const { stage, ownerId } = req.query;
      
      let query = db.select().from(crmDeals);
      const conditions = [];
      
      if (tenantId) conditions.push(eq(crmDeals.tenantId, tenantId));
      if (stage) conditions.push(eq(crmDeals.stage, stage as string));
      if (ownerId) conditions.push(eq(crmDeals.ownerId, ownerId as string));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const deals = await query.orderBy(crmDeals.stageOrder, desc(crmDeals.updatedAt));
      
      const pipelineStats = {
        lead: { count: 0, value: 0 },
        qualified: { count: 0, value: 0 },
        proposal: { count: 0, value: 0 },
        negotiation: { count: 0, value: 0 },
        closed_won: { count: 0, value: 0 },
        closed_lost: { count: 0, value: 0 },
      };
      
      deals.forEach((deal: any) => {
        const stage = deal.stage as keyof typeof pipelineStats;
        if (pipelineStats[stage]) {
          pipelineStats[stage].count++;
          pipelineStats[stage].value += parseFloat(deal.value || '0');
        }
      });
      
      res.json({ deals, pipelineStats });
    } catch (error) {
      console.error("[CRM Deals] Error:", error);
      res.status(500).json({ error: "Failed to fetch deals" });
    }
  });

  app.post("/api/crm/deals", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      const stageOrder = {
        lead: 0,
        qualified: 1,
        proposal: 2,
        negotiation: 3,
        closed_won: 4,
        closed_lost: 5,
      };
      
      const data = {
        ...req.body,
        tenantId,
        stageOrder: stageOrder[req.body.stage as keyof typeof stageOrder] || 0,
      };
      
      const deal = await db.insert(crmDeals).values(data).returning();
      
      await db.insert(crmActivities).values({
        tenantId,
        entityType: 'deal',
        entityId: deal[0].id,
        activityType: 'status_change',
        subject: 'Deal Created',
        description: `New deal "${deal[0].name}" created in ${deal[0].stage} stage`,
      });
      
      res.json({ deal: deal[0] });
    } catch (error) {
      console.error("[CRM Deals] Error:", error);
      res.status(500).json({ error: "Failed to create deal" });
    }
  });

  app.patch("/api/crm/deals/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const tenantId = getTenantIdFromRequest(req);
      
      const [existingDeal] = await db.select().from(crmDeals).where(eq(crmDeals.id, id));
      
      const stageOrder = {
        lead: 0,
        qualified: 1,
        proposal: 2,
        negotiation: 3,
        closed_won: 4,
        closed_lost: 5,
      };
      
      const updates = {
        ...req.body,
        stageOrder: req.body.stage ? stageOrder[req.body.stage as keyof typeof stageOrder] || 0 : undefined,
        updatedAt: new Date(),
      };
      
      if (req.body.stage === 'closed_won' || req.body.stage === 'closed_lost') {
        updates.actualCloseDate = new Date().toISOString().split('T')[0];
      }
      
      const deal = await db.update(crmDeals)
        .set(updates)
        .where(eq(crmDeals.id, id))
        .returning();
      
      if (existingDeal && req.body.stage && existingDeal.stage !== req.body.stage) {
        await db.insert(crmActivities).values({
          tenantId,
          entityType: 'deal',
          entityId: id,
          activityType: 'status_change',
          subject: 'Stage Changed',
          description: `Deal moved from "${existingDeal.stage}" to "${req.body.stage}"`,
        });
      }
      
      res.json({ deal: deal[0] });
    } catch (error) {
      console.error("[CRM Deals] Error:", error);
      res.status(500).json({ error: "Failed to update deal" });
    }
  });

  app.delete("/api/crm/deals/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(crmDeals).where(eq(crmDeals.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("[CRM Deals] Error:", error);
      res.status(500).json({ error: "Failed to delete deal" });
    }
  });

  // ========================
  // CRM MEETINGS (Scheduler)
  // ========================
  
  app.get("/api/crm/meetings", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      const { startDate, endDate, organizerId } = req.query;
      
      const conditions = [];
      if (tenantId) conditions.push(eq(crmMeetings.tenantId, tenantId));
      if (organizerId) conditions.push(eq(crmMeetings.organizerId, organizerId as string));
      if (startDate) conditions.push(gte(crmMeetings.startTime, new Date(startDate as string)));
      if (endDate) conditions.push(lte(crmMeetings.startTime, new Date(endDate as string)));
      
      let query = db.select().from(crmMeetings);
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const meetings = await query.orderBy(crmMeetings.startTime);
      res.json({ meetings });
    } catch (error) {
      console.error("[CRM Meetings] Error:", error);
      res.status(500).json({ error: "Failed to fetch meetings" });
    }
  });

  app.post("/api/crm/meetings", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      const data = { 
        ...req.body, 
        tenantId,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
      };
      
      const meeting = await db.insert(crmMeetings).values(data).returning();
      
      if (data.entityType && data.entityId) {
        await db.insert(crmActivities).values({
          tenantId,
          entityType: data.entityType,
          entityId: data.entityId,
          activityType: 'meeting',
          subject: data.title,
          description: `Meeting scheduled for ${new Date(data.startTime).toLocaleString()}`,
          meetingStartTime: new Date(data.startTime),
          meetingEndTime: new Date(data.endTime),
          meetingLocation: data.location,
        });
      }
      
      res.json({ meeting: meeting[0] });
    } catch (error) {
      console.error("[CRM Meetings] Error:", error);
      res.status(500).json({ error: "Failed to create meeting" });
    }
  });

  app.patch("/api/crm/meetings/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body, updatedAt: new Date() };
      
      const meeting = await db.update(crmMeetings)
        .set(updates)
        .where(eq(crmMeetings.id, id))
        .returning();
      
      res.json({ meeting: meeting[0] });
    } catch (error) {
      console.error("[CRM Meetings] Error:", error);
      res.status(500).json({ error: "Failed to update meeting" });
    }
  });

  app.delete("/api/crm/meetings/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(crmMeetings).where(eq(crmMeetings.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("[CRM Meetings] Error:", error);
      res.status(500).json({ error: "Failed to delete meeting" });
    }
  });

  // ========================
  // CRM CUSTOM FIELDS
  // ========================
  
  app.get("/api/crm/custom-fields/:entityType", async (req: Request, res: Response) => {
    try {
      const { entityType } = req.params;
      const tenantId = getTenantIdFromRequest(req);
      
      const fields = await db.select()
        .from(crmCustomFields)
        .where(and(
          eq(crmCustomFields.entityType, entityType),
          tenantId ? eq(crmCustomFields.tenantId, tenantId) : sql`1=1`
        ))
        .orderBy(crmCustomFields.displayOrder);
      
      res.json({ fields });
    } catch (error) {
      console.error("[CRM Custom Fields] Error:", error);
      res.status(500).json({ error: "Failed to fetch custom fields" });
    }
  });

  app.post("/api/crm/custom-fields", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      const data = { ...req.body, tenantId };
      
      const field = await db.insert(crmCustomFields).values(data).returning();
      res.json({ field: field[0] });
    } catch (error) {
      console.error("[CRM Custom Fields] Error:", error);
      res.status(500).json({ error: "Failed to create custom field" });
    }
  });

  app.get("/api/crm/custom-field-values/:entityType/:entityId", async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.params;
      
      const values = await db.select()
        .from(crmCustomFieldValues)
        .where(and(
          eq(crmCustomFieldValues.entityType, entityType),
          eq(crmCustomFieldValues.entityId, entityId)
        ));
      
      res.json({ values });
    } catch (error) {
      console.error("[CRM Custom Field Values] Error:", error);
      res.status(500).json({ error: "Failed to fetch custom field values" });
    }
  });

  app.post("/api/crm/custom-field-values", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      const { customFieldId, entityType, entityId, value } = req.body;
      
      const existing = await db.select()
        .from(crmCustomFieldValues)
        .where(and(
          eq(crmCustomFieldValues.customFieldId, customFieldId),
          eq(crmCustomFieldValues.entityType, entityType),
          eq(crmCustomFieldValues.entityId, entityId)
        ));
      
      let result;
      if (existing.length > 0) {
        result = await db.update(crmCustomFieldValues)
          .set({ value, updatedAt: new Date() })
          .where(eq(crmCustomFieldValues.id, existing[0].id))
          .returning();
      } else {
        result = await db.insert(crmCustomFieldValues)
          .values({ tenantId, customFieldId, entityType, entityId, value })
          .returning();
      }
      
      res.json({ value: result[0] });
    } catch (error) {
      console.error("[CRM Custom Field Values] Error:", error);
      res.status(500).json({ error: "Failed to save custom field value" });
    }
  });

  // ========================
  // CRM WORKFLOWS (Automation)
  // ========================
  
  app.get("/api/crm/workflows", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      
      const workflows = await db.select()
        .from(crmWorkflows)
        .where(tenantId ? eq(crmWorkflows.tenantId, tenantId) : sql`1=1`)
        .orderBy(desc(crmWorkflows.createdAt));
      
      res.json({ workflows });
    } catch (error) {
      console.error("[CRM Workflows] Error:", error);
      res.status(500).json({ error: "Failed to fetch workflows" });
    }
  });

  app.post("/api/crm/workflows", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      const data = { ...req.body, tenantId };
      
      const workflow = await db.insert(crmWorkflows).values(data).returning();
      res.json({ workflow: workflow[0] });
    } catch (error) {
      console.error("[CRM Workflows] Error:", error);
      res.status(500).json({ error: "Failed to create workflow" });
    }
  });

  app.patch("/api/crm/workflows/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body, updatedAt: new Date() };
      
      const workflow = await db.update(crmWorkflows)
        .set(updates)
        .where(eq(crmWorkflows.id, id))
        .returning();
      
      res.json({ workflow: workflow[0] });
    } catch (error) {
      console.error("[CRM Workflows] Error:", error);
      res.status(500).json({ error: "Failed to update workflow" });
    }
  });

  app.delete("/api/crm/workflows/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(crmWorkflows).where(eq(crmWorkflows.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("[CRM Workflows] Error:", error);
      res.status(500).json({ error: "Failed to delete workflow" });
    }
  });

  // ========================
  // CRM DUPLICATES (Detection & Merge)
  // ========================
  
  app.get("/api/crm/duplicates", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      const { entityType, status } = req.query;
      
      const conditions = [];
      if (tenantId) conditions.push(eq(crmDuplicates.tenantId, tenantId));
      if (entityType) conditions.push(eq(crmDuplicates.entityType, entityType as string));
      if (status) conditions.push(eq(crmDuplicates.status, status as string));
      
      let query = db.select().from(crmDuplicates);
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const duplicates = await query.orderBy(desc(crmDuplicates.confidenceScore));
      res.json({ duplicates });
    } catch (error) {
      console.error("[CRM Duplicates] Error:", error);
      res.status(500).json({ error: "Failed to fetch duplicates" });
    }
  });

  app.post("/api/crm/duplicates/scan", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      const { entityType } = req.body;
      
      const foundDuplicates: any[] = [];
      
      if (entityType === 'worker' || !entityType) {
        const allWorkers = await db.select({
          id: workers.id,
          firstName: workers.firstName,
          lastName: workers.lastName,
          email: workers.email,
          phone: workers.phone,
        }).from(workers);
        
        for (let i = 0; i < allWorkers.length; i++) {
          for (let j = i + 1; j < allWorkers.length; j++) {
            const w1 = allWorkers[i];
            const w2 = allWorkers[j];
            const matchReasons: string[] = [];
            let score = 0;
            
            if (w1.email && w2.email && w1.email.toLowerCase() === w2.email.toLowerCase()) {
              matchReasons.push('email_match');
              score += 50;
            }
            if (w1.phone && w2.phone && w1.phone.replace(/\D/g, '') === w2.phone.replace(/\D/g, '')) {
              matchReasons.push('phone_match');
              score += 30;
            }
            if (w1.firstName && w2.firstName && w1.lastName && w2.lastName) {
              const name1 = `${w1.firstName} ${w1.lastName}`.toLowerCase();
              const name2 = `${w2.firstName} ${w2.lastName}`.toLowerCase();
              if (name1 === name2) {
                matchReasons.push('name_exact_match');
                score += 40;
              }
            }
            
            if (score >= 50) {
              foundDuplicates.push({
                tenantId,
                entityType: 'worker',
                primaryEntityId: String(w1.id),
                duplicateEntityId: String(w2.id),
                confidenceScore: Math.min(score, 100),
                matchReasons,
                status: 'pending',
              });
            }
          }
        }
      }
      
      for (const dup of foundDuplicates) {
        const existing = await db.select().from(crmDuplicates).where(and(
          eq(crmDuplicates.primaryEntityId, dup.primaryEntityId),
          eq(crmDuplicates.duplicateEntityId, dup.duplicateEntityId),
        ));
        
        if (existing.length === 0) {
          await db.insert(crmDuplicates).values(dup);
        }
      }
      
      res.json({ 
        scanned: true, 
        duplicatesFound: foundDuplicates.length,
        message: `Found ${foundDuplicates.length} potential duplicates`
      });
    } catch (error) {
      console.error("[CRM Duplicates] Error:", error);
      res.status(500).json({ error: "Failed to scan for duplicates" });
    }
  });

  app.patch("/api/crm/duplicates/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body, updatedAt: new Date() };
      
      const duplicate = await db.update(crmDuplicates)
        .set(updates)
        .where(eq(crmDuplicates.id, id))
        .returning();
      
      res.json({ duplicate: duplicate[0] });
    } catch (error) {
      console.error("[CRM Duplicates] Error:", error);
      res.status(500).json({ error: "Failed to update duplicate" });
    }
  });

  // ========================
  // CRM LIVE CHAT
  // ========================
  
  app.get("/api/crm/chat/conversations", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      const { status, assignedTo } = req.query;
      
      const conditions = [];
      if (tenantId) conditions.push(eq(crmChatConversations.tenantId, tenantId));
      if (status) conditions.push(eq(crmChatConversations.status, status as string));
      if (assignedTo) conditions.push(eq(crmChatConversations.assignedTo, assignedTo as string));
      
      let query = db.select().from(crmChatConversations);
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const conversations = await query.orderBy(desc(crmChatConversations.updatedAt));
      res.json({ conversations });
    } catch (error) {
      console.error("[CRM Chat] Error:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/crm/chat/conversations", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      const data = { ...req.body, tenantId };
      
      const conversation = await db.insert(crmChatConversations).values(data).returning();
      res.json({ conversation: conversation[0] });
    } catch (error) {
      console.error("[CRM Chat] Error:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/crm/chat/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const messages = await db.select()
        .from(crmChatMessages)
        .where(eq(crmChatMessages.conversationId, id))
        .orderBy(crmChatMessages.createdAt);
      
      res.json({ messages });
    } catch (error) {
      console.error("[CRM Chat] Error:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/crm/chat/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = { ...req.body, conversationId: id };
      
      const message = await db.insert(crmChatMessages).values(data).returning();
      
      await db.update(crmChatConversations)
        .set({ 
          messageCount: sql`${crmChatConversations.messageCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(crmChatConversations.id, id));
      
      res.json({ message: message[0] });
    } catch (error) {
      console.error("[CRM Chat] Error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // ========================
  // CRM EMAIL TRACKING
  // ========================
  
  app.get("/api/crm/email-tracking", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      const { entityType, entityId, days } = req.query;
      
      const conditions = [];
      if (tenantId) conditions.push(eq(crmEmailTracking.tenantId, tenantId));
      if (entityType) conditions.push(eq(crmEmailTracking.entityType, entityType as string));
      if (entityId) conditions.push(eq(crmEmailTracking.entityId, entityId as string));
      if (days) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));
        conditions.push(gte(crmEmailTracking.sentAt, daysAgo));
      }
      
      let query = db.select().from(crmEmailTracking);
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const emails = await query.orderBy(desc(crmEmailTracking.sentAt)).limit(100);
      
      const stats = {
        total: emails.length,
        opened: emails.filter((e: any) => e.openedAt).length,
        clicked: emails.filter((e: any) => e.clickedAt).length,
        bounced: emails.filter((e: any) => e.bouncedAt).length,
        openRate: 0,
        clickRate: 0,
      };
      
      if (stats.total > 0) {
        stats.openRate = Math.round((stats.opened / stats.total) * 100);
        stats.clickRate = Math.round((stats.clicked / stats.total) * 100);
      }
      
      res.json({ emails, stats });
    } catch (error) {
      console.error("[CRM Email Tracking] Error:", error);
      res.status(500).json({ error: "Failed to fetch email tracking" });
    }
  });

  app.post("/api/crm/email-tracking", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      const data = { ...req.body, tenantId };
      
      const tracking = await db.insert(crmEmailTracking).values(data).returning();
      res.json({ tracking: tracking[0] });
    } catch (error) {
      console.error("[CRM Email Tracking] Error:", error);
      res.status(500).json({ error: "Failed to create email tracking" });
    }
  });

  app.get("/api/crm/email-tracking/pixel/:emailId", async (req: Request, res: Response) => {
    try {
      const { emailId } = req.params;
      
      await db.update(crmEmailTracking)
        .set({
          openedAt: sql`COALESCE(${crmEmailTracking.openedAt}, NOW())`,
          openCount: sql`${crmEmailTracking.openCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(crmEmailTracking.emailId, emailId));
      
      const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      res.setHeader('Content-Type', 'image/gif');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(pixel);
    } catch (error) {
      console.error("[CRM Email Tracking] Pixel Error:", error);
      const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      res.setHeader('Content-Type', 'image/gif');
      res.send(pixel);
    }
  });

  app.get("/api/crm/email-tracking/click/:emailId", async (req: Request, res: Response) => {
    try {
      const { emailId } = req.params;
      const { url } = req.query;
      
      await db.update(crmEmailTracking)
        .set({
          clickedAt: sql`COALESCE(${crmEmailTracking.clickedAt}, NOW())`,
          clickCount: sql`${crmEmailTracking.clickCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(crmEmailTracking.emailId, emailId));
      
      if (url) {
        res.redirect(url as string);
      } else {
        res.json({ tracked: true });
      }
    } catch (error) {
      console.error("[CRM Email Tracking] Click Error:", error);
      if (req.query.url) {
        res.redirect(req.query.url as string);
      } else {
        res.json({ tracked: false });
      }
    }
  });

  // ========================
  // CRM DASHBOARD / ANALYTICS
  // ========================
  
  app.get("/api/crm/dashboard", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      
      const [
        dealsResult,
        meetingsResult,
        activitiesResult,
        conversationsResult,
      ] = await Promise.all([
        db.select().from(crmDeals).where(tenantId ? eq(crmDeals.tenantId, tenantId) : sql`1=1`),
        db.select().from(crmMeetings).where(and(
          tenantId ? eq(crmMeetings.tenantId, tenantId) : sql`1=1`,
          gte(crmMeetings.startTime, new Date())
        )).orderBy(crmMeetings.startTime).limit(5),
        db.select().from(crmActivities).where(tenantId ? eq(crmActivities.tenantId, tenantId) : sql`1=1`).orderBy(desc(crmActivities.createdAt)).limit(10),
        db.select().from(crmChatConversations).where(and(
          tenantId ? eq(crmChatConversations.tenantId, tenantId) : sql`1=1`,
          eq(crmChatConversations.status, 'active')
        )),
      ]);
      
      const pipelineValue = {
        lead: 0,
        qualified: 0,
        proposal: 0,
        negotiation: 0,
        closed_won: 0,
      };
      
      dealsResult.forEach((deal: any) => {
        const stage = deal.stage as keyof typeof pipelineValue;
        if (pipelineValue[stage] !== undefined) {
          pipelineValue[stage] += parseFloat(deal.value || '0');
        }
      });
      
      const totalPipeline = Object.values(pipelineValue).reduce((a, b) => a + b, 0);
      
      res.json({
        pipeline: {
          total: totalPipeline,
          byStage: pipelineValue,
          dealCount: dealsResult.length,
        },
        upcomingMeetings: meetingsResult,
        recentActivities: activitiesResult,
        activeConversations: conversationsResult.length,
      });
    } catch (error) {
      console.error("[CRM Dashboard] Error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });
}
