import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailService } from "./email";
import {
  insertUserSchema,
  insertCompanySchema,
  insertWorkerSchema,
  insertClientSchema,
  insertJobSchema,
  insertAssignmentSchema,
  insertTimesheetSchema,
  insertPayrollSchema,
  insertInvoiceSchema,
  insertMessageSchema,
  insertTimeOffRequestSchema,
  insertStateComplianceSchema,
  insertUserFeedbackSchema,
  insertLicenseSchema,
  insertPaymentSchema,
  insertFeatureRequestSchema,
  insertIosInterestSchema,
  insertWorkerDNRSchema,
  insertPaymentMethodSchema,
  insertCollectionSchema,
  insertOrbitAssetSchema,
} from "@shared/schema";

// Middleware to parse JSON
function parseJSON(req: Request, res: Response, next: () => void) {
  if (req.body && typeof req.body === "string") {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      // Body is not JSON, continue
    }
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(parseJSON);

  // ========================
  // AUTH ROUTES
  // ========================
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const parsed = insertUserSchema.safeParse(body);

      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid user data" });
      }

      const existingUser = await storage.getUserByEmail(parsed.data.email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already exists" });
      }

      // TODO: Hash password before storing
      const user = await storage.createUser(parsed.data);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password, pin } = req.body;

      // Special test login for Sidonie with PIN 4444
      if (pin === "4444") {
        const testUser = {
          id: "sidonie-test-001",
          email: "sidonie@orbitstaffing.net",
          firstName: "Sidonie",
          lastName: "Expert Tester",
          role: "admin",
          companyId: "test-company",
          isFirstLogin: true,
          welcomeMessage: "Hey Sid, I know you are an expert on all this, so give me your honest opinion. Let's partner up and make this happen! 🚀"
        };
        return res.status(200).json(testUser);
      }

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // TODO: Verify password hash
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // ========================
  // WORKERS ROUTES
  // ========================
  app.get("/api/workers", async (req: Request, res: Response) => {
    try {
      const companyId = req.query.companyId as string;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID required" });
      }

      const workers = await storage.listWorkers(companyId);
      res.status(200).json(workers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workers" });
    }
  });

  app.get("/api/workers/:id", async (req: Request, res: Response) => {
    try {
      const worker = await storage.getWorker(req.params.id);
      if (!worker) {
        return res.status(404).json({ error: "Worker not found" });
      }
      res.status(200).json(worker);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch worker" });
    }
  });

  app.post("/api/workers", async (req: Request, res: Response) => {
    try {
      const parsed = insertWorkerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid worker data" });
      }

      const worker = await storage.createWorker(parsed.data);
      res.status(201).json(worker);
    } catch (error) {
      res.status(500).json({ error: "Failed to create worker" });
    }
  });

  app.patch("/api/workers/:id", async (req: Request, res: Response) => {
    try {
      const worker = await storage.updateWorker(req.params.id, req.body);
      if (!worker) {
        return res.status(404).json({ error: "Worker not found" });
      }
      res.status(200).json(worker);
    } catch (error) {
      res.status(500).json({ error: "Failed to update worker" });
    }
  });

  // ========================
  // ASSIGNMENTS ROUTES
  // ========================
  app.get("/api/assignments", async (req: Request, res: Response) => {
    try {
      const companyId = req.query.companyId as string;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID required" });
      }

      const assignments = await storage.listAssignments(companyId);
      res.status(200).json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  });

  app.get("/api/assignments/worker/:workerId", async (req: Request, res: Response) => {
    try {
      const assignments = await storage.listAssignmentsByWorker(req.params.workerId);
      res.status(200).json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  });

  app.post("/api/assignments", async (req: Request, res: Response) => {
    try {
      const parsed = insertAssignmentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid assignment data" });
      }

      const assignment = await storage.createAssignment(parsed.data);
      res.status(201).json(assignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create assignment" });
    }
  });

  app.patch("/api/assignments/:id", async (req: Request, res: Response) => {
    try {
      const assignment = await storage.updateAssignment(req.params.id, req.body);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      res.status(200).json(assignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update assignment" });
    }
  });

  // ========================
  // TIMESHEETS ROUTES (GPS Clock-in/out)
  // ========================
  app.post("/api/timesheets/clock-in", async (req: Request, res: Response) => {
    try {
      const { assignmentId, latitude, longitude } = req.body;

      if (!assignmentId || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: "assignmentId, latitude, and longitude required" });
      }

      const timesheet = await storage.clockIn(assignmentId, latitude, longitude);
      res.status(201).json(timesheet);
    } catch (error) {
      res.status(500).json({ error: "Clock-in failed" });
    }
  });

  app.post("/api/timesheets/clock-out/:id", async (req: Request, res: Response) => {
    try {
      const { latitude, longitude } = req.body;

      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: "latitude and longitude required" });
      }

      const timesheet = await storage.clockOut(req.params.id, latitude, longitude);
      if (!timesheet) {
        return res.status(404).json({ error: "Timesheet not found" });
      }
      res.status(200).json(timesheet);
    } catch (error) {
      res.status(500).json({ error: "Clock-out failed" });
    }
  });

  app.get("/api/timesheets", async (req: Request, res: Response) => {
    try {
      const companyId = req.query.companyId as string;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID required" });
      }

      const timesheets = await storage.listTimesheets(companyId);
      res.status(200).json(timesheets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timesheets" });
    }
  });

  app.get("/api/timesheets/worker/:workerId", async (req: Request, res: Response) => {
    try {
      const timesheets = await storage.listTimesheetsByWorker(req.params.workerId);
      res.status(200).json(timesheets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timesheets" });
    }
  });

  // ========================
  // PAYROLL ROUTES
  // ========================
  app.get("/api/payroll", async (req: Request, res: Response) => {
    try {
      const companyId = req.query.companyId as string;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID required" });
      }

      const payroll = await storage.listPayroll(companyId);
      res.status(200).json(payroll);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payroll" });
    }
  });

  app.post("/api/payroll", async (req: Request, res: Response) => {
    try {
      const parsed = insertPayrollSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payroll data" });
      }

      const payroll = await storage.createPayroll(parsed.data);
      res.status(201).json(payroll);
    } catch (error) {
      res.status(500).json({ error: "Failed to create payroll" });
    }
  });

  // ========================
  // INVOICES ROUTES
  // ========================
  app.get("/api/invoices", async (req: Request, res: Response) => {
    try {
      const companyId = req.query.companyId as string;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID required" });
      }

      const invoices = await storage.listInvoices(companyId);
      res.status(200).json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", async (req: Request, res: Response) => {
    try {
      const parsed = insertInvoiceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid invoice data" });
      }

      const invoice = await storage.createInvoice(parsed.data);
      res.status(201).json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  // ========================
  // STATE COMPLIANCE ROUTES
  // ========================
  app.get("/api/compliance/states", async (req: Request, res: Response) => {
    try {
      const states = await storage.listStateCompliance();
      res.status(200).json(states);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch state compliance data" });
    }
  });

  app.get("/api/compliance/states/:code", async (req: Request, res: Response) => {
    try {
      const state = await storage.getStateCompliance(req.params.code);
      if (!state) {
        return res.status(404).json({ error: "State not found" });
      }
      res.status(200).json(state);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch state compliance data" });
    }
  });

  app.patch("/api/compliance/states/:code", async (req: Request, res: Response) => {
    try {
      const state = await storage.updateStateCompliance(req.params.code, req.body);
      if (!state) {
        return res.status(404).json({ error: "State not found" });
      }
      res.status(200).json(state);
    } catch (error) {
      res.status(500).json({ error: "Failed to update state compliance data" });
    }
  });

  // ========================
  // MESSAGES ROUTES
  // ========================
  app.get("/api/messages", async (req: Request, res: Response) => {
    try {
      const recipientId = req.query.recipientId as string;
      if (!recipientId) {
        return res.status(400).json({ error: "Recipient ID required" });
      }

      const messages = await storage.listMessages(recipientId);
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req: Request, res: Response) => {
    try {
      const parsed = insertMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid message data" });
      }

      const message = await storage.createMessage(parsed.data);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.patch("/api/messages/:id/read", async (req: Request, res: Response) => {
    try {
      const message = await storage.markMessageAsRead(req.params.id);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.status(200).json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  // ========================
  // TIME OFF REQUESTS ROUTES
  // ========================
  app.get("/api/time-off", async (req: Request, res: Response) => {
    try {
      const workerId = req.query.workerId as string;
      if (!workerId) {
        return res.status(400).json({ error: "Worker ID required" });
      }

      const requests = await storage.listTimeOffRequests(workerId);
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch time off requests" });
    }
  });

  app.post("/api/time-off", async (req: Request, res: Response) => {
    try {
      const parsed = insertTimeOffRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid time off request data" });
      }

      const request = await storage.createTimeOffRequest(parsed.data);
      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to create time off request" });
    }
  });

  app.patch("/api/time-off/:id", async (req: Request, res: Response) => {
    try {
      const request = await storage.updateTimeOffRequest(req.params.id, req.body);
      if (!request) {
        return res.status(404).json({ error: "Time off request not found" });
      }
      res.status(200).json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to update time off request" });
    }
  });

  // ========================
  // FEEDBACK ROUTES
  // ========================
  app.post("/api/feedback", async (req: Request, res: Response) => {
    try {
      const parsed = insertUserFeedbackSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid feedback data" });
      }

      const feedback = await storage.createFeedback(parsed.data);
      res.status(201).json(feedback);
    } catch (error) {
      res.status(500).json({ error: "Failed to create feedback" });
    }
  });

  // ========================
  // BILLING ROUTES
  // ========================
  app.post("/api/billing/change-model", async (req: Request, res: Response) => {
    try {
      const { companyId, newModel, newTier, revenueSharePercentage } = req.body;

      if (!companyId || !newModel) {
        return res.status(400).json({ error: "companyId and newModel required" });
      }

      const result = await storage.changeBillingModel(
        companyId,
        newModel,
        newTier,
        revenueSharePercentage
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to change billing model" });
    }
  });

  app.get("/api/billing/history", async (req: Request, res: Response) => {
    try {
      const companyId = req.query.companyId as string;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID required" });
      }

      const history = await storage.getBillingHistory(companyId);
      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch billing history" });
    }
  });

  // ========================
  // LICENSES (Franchises & One-Off Sales)
  // ========================
  app.post("/api/licenses/create", async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const parsed = insertLicenseSchema.safeParse(body);

      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid license data" });
      }

      const license = await storage.createLicense(parsed.data);
      res.status(201).json(license);
    } catch (error) {
      res.status(500).json({ error: "Failed to create license" });
    }
  });

  app.get("/api/licenses/company/:companyId", async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const license = await storage.getCompanyLicense(companyId);
      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }
      res.status(200).json(license);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch license" });
    }
  });

  app.get("/api/licenses/:licenseId", async (req: Request, res: Response) => {
    try {
      const { licenseId } = req.params;
      const license = await storage.getLicense(licenseId);
      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }
      res.status(200).json(license);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch license" });
    }
  });

  app.patch("/api/licenses/:licenseId", async (req: Request, res: Response) => {
    try {
      const { licenseId } = req.params;
      const updates = req.body;

      const license = await storage.updateLicense(licenseId, updates);
      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }
      res.status(200).json(license);
    } catch (error) {
      res.status(500).json({ error: "Failed to update license" });
    }
  });

  app.get("/api/licenses", async (req: Request, res: Response) => {
    try {
      const { status, type } = req.query;
      const licenses = await storage.listLicenses({
        status: status as string,
        licenseType: type as string,
      });
      res.status(200).json(licenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch licenses" });
    }
  });

  // ========================
  // PAYMENTS
  // ========================
  app.post("/api/payments/record", async (req: Request, res: Response) => {
    try {
      const { companyId, amount, description, method } = req.body;

      if (!companyId || !amount || !method) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const payment = await storage.recordPayment(companyId, amount, description, method);
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to record payment" });
    }
  });

  app.get("/api/payments/company/:companyId", async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const payments = await storage.getCompanyPayments(companyId);
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.get("/api/payments/:paymentId", async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const payment = await storage.getPayment(paymentId);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.status(200).json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment" });
    }
  });

  app.patch("/api/payments/:paymentId", async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const updates = req.body;

      const payment = await storage.updatePayment(paymentId, updates);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.status(200).json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment" });
    }
  });

  // ========================
  // FEATURE REQUESTS
  // ========================
  app.post("/api/feature-requests/create", async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const parsed = insertFeatureRequestSchema.safeParse(body);

      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid feature request data" });
      }

      const request = await storage.createFeatureRequest(parsed.data);
      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to create feature request" });
    }
  });

  app.get("/api/feature-requests/company/:companyId", async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const requests = await storage.getCompanyFeatureRequests(companyId);
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feature requests" });
    }
  });

  app.get("/api/feature-requests", async (req: Request, res: Response) => {
    try {
      const { status, priority } = req.query;
      const requests = await storage.getAllFeatureRequests({
        status: status as string,
        priority: priority as string,
      });
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feature requests" });
    }
  });

  app.get("/api/feature-requests/:requestId", async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;
      const request = await storage.getFeatureRequest(requestId);
      if (!request) {
        return res.status(404).json({ error: "Feature request not found" });
      }
      res.status(200).json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feature request" });
    }
  });

  app.patch("/api/feature-requests/:requestId", async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;
      const updates = req.body;

      const request = await storage.updateFeatureRequest(requestId, updates);
      if (!request) {
        return res.status(404).json({ error: "Feature request not found" });
      }
      res.status(200).json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to update feature request" });
    }
  });

  // ========================
  // iOS INTEREST LIST
  // ========================
  app.post("/api/ios-interest", async (req: Request, res: Response) => {
    try {
      const parsed = insertIosInterestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data", details: parsed.error.errors });
      }

      const interest = await storage.createIosInterest(parsed.data);
      res.status(201).json(interest);
    } catch (error: any) {
      if (error.message.includes("duplicate key")) {
        return res.status(409).json({ error: "Email already registered" });
      }
      res.status(500).json({ error: "Failed to save email" });
    }
  });

  app.get("/api/admin/ios-interest", async (req: Request, res: Response) => {
    try {
      const notified = req.query.notified as string | undefined;
      const source = req.query.source as string | undefined;

      const filters: { notified?: boolean; source?: string } = {};
      if (notified !== undefined) {
        filters.notified = notified === "true";
      }
      if (source) {
        filters.source = source;
      }

      const interests = await storage.listIosInterest(filters);
      res.status(200).json(interests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch iOS interest list" });
    }
  });

  app.post("/api/admin/ios-interest/:id/notify", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const interest = await storage.getIosInterest(id);
      if (!interest) {
        return res.status(404).json({ error: "Interest not found" });
      }

      // Send email
      const emailResult = await emailService.send(emailService.getIOSLaunchEmail(interest.email));

      // Mark as notified
      const updated = await storage.markIosInterestNotified(id);

      res.status(200).json({
        success: emailResult.success,
        interest: updated,
        messageId: emailResult.messageId,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  app.post("/api/admin/ios-interest/notify-all", async (req: Request, res: Response) => {
    try {
      // Get all pending interests
      const pendingInterests = await storage.listIosInterest({ notified: false });

      if (pendingInterests.length === 0) {
        return res.status(200).json({ success: true, notifiedCount: 0, message: "No pending users" });
      }

      // Send emails and mark as notified
      let successCount = 0;
      for (const interest of pendingInterests) {
        try {
          const emailResult = await emailService.send(emailService.getIOSLaunchEmail(interest.email));
          if (emailResult.success) {
            await storage.markIosInterestNotified(interest.id);
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to notify ${interest.email}:`, err);
        }
      }

      res.status(200).json({
        success: true,
        notifiedCount: successCount,
        totalCount: pendingInterests.length,
        message: `Notified ${successCount} of ${pendingInterests.length} users`,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to notify users" });
    }
  });

  app.get("/api/admin/ios-interest/stats", async (req: Request, res: Response) => {
    try {
      const all = await storage.listIosInterest();
      const notified = await storage.listIosInterest({ notified: true });
      const pending = await storage.listIosInterest({ notified: false });

      res.status(200).json({
        total: all.length,
        notified: notified.length,
        pending: pending.length,
        bySource: {
          ios_coming_soon: all.filter((i) => i.source === "ios_coming_soon").length,
          web: all.filter((i) => i.source === "web").length,
          worker_signup: all.filter((i) => i.source === "worker_signup").length,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ========================
  // INCIDENT REPORTING
  // ========================
  app.post("/api/incidents", async (req: Request, res: Response) => {
    try {
      const {
        incidentType,
        severity,
        workerName,
        workerEmail,
        incidentDate,
        incidentTime,
        location,
        description,
        witnesses,
        actionTaken,
      } = req.body;

      if (!incidentType || !description || !location) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Store incident in database (create incidents table if needed)
      const incident = {
        id: crypto.randomUUID(),
        incidentType,
        severity: severity || "medium",
        workerName: workerName || null,
        workerEmail: workerEmail || null,
        incidentDate,
        incidentTime,
        location,
        description,
        witnesses: witnesses || null,
        actionTaken: actionTaken || null,
        createdAt: new Date(),
        reportedAt: new Date(),
      };

      // TODO: Save to database when incidents table is created
      console.log("Incident reported:", incident);

      res.status(201).json({
        success: true,
        incident,
        message: "Incident reported successfully. Management will review.",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to report incident" });
    }
  });

  app.get("/api/incidents", async (req: Request, res: Response) => {
    try {
      // TODO: Fetch from database with filters and pagination
      res.status(200).json({
        incidents: [],
        total: 0,
        message: "No incidents reported yet",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch incidents" });
    }
  });

  // ========================
  // FEEDBACK & SUPPORT
  // ========================
  app.post("/api/feedback", async (req: Request, res: Response) => {
    try {
      const { message, type } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: "Feedback message required" });
      }

      const feedback = {
        id: crypto.randomUUID(),
        message: message.trim(),
        type: type || "worker_feedback",
        createdAt: new Date(),
        status: "received",
      };

      // TODO: Save to database when feedback table is created
      console.log("Feedback received:", feedback);

      res.status(201).json({
        success: true,
        feedback,
        message: "Thank you! Your feedback helps us improve.",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  // ========================
  // PAYMENT METHODS
  // ========================
  app.post("/api/payment-method", async (req: Request, res: Response) => {
    try {
      const { method } = req.body;

      const validMethods = ["stripe_card", "direct_deposit", "crypto", "check"];
      if (!validMethods.includes(method)) {
        return res.status(400).json({ error: "Invalid payment method" });
      }

      // TODO: Update worker payment method in database
      console.log("Payment method updated:", method);

      res.status(200).json({
        success: true,
        method,
        message: `Payment method set to ${method}`,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment method" });
    }
  });

  app.get("/api/payment-method", async (req: Request, res: Response) => {
    try {
      // TODO: Fetch current worker payment method
      res.status(200).json({
        method: "stripe_card",
        available: ["stripe_card", "direct_deposit", "check"],
        cryptoComingSoon: true,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment method" });
    }
  });

  // ========================
  // LEAD MANAGEMENT (Business Owner Marketing)
  // ========================
  app.post("/api/leads", async (req: Request, res: Response) => {
    try {
      const { companyName, ownerName, email, phone, currentStaffing, laborType } = req.body;

      if (!companyName || !email) {
        return res.status(400).json({ error: "Company name and email required" });
      }

      const lead = {
        id: crypto.randomUUID(),
        companyName,
        ownerName: ownerName || null,
        email,
        phone: phone || null,
        currentStaffing: currentStaffing || null,
        laborType: laborType || null,
        createdAt: new Date(),
        status: "new" as const,
      };

      // TODO: Save to leads table when created
      console.log("New lead:", lead);

      res.status(201).json({
        success: true,
        lead,
        message: "Lead received. We'll contact you within 24 hours.",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit lead" });
    }
  });

  app.get("/api/leads", async (req: Request, res: Response) => {
    try {
      // TODO: Fetch from database with filters
      res.status(200).json({
        leads: [],
        total: 0,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.patch("/api/leads/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ["new", "contacted", "demo_scheduled", "converted"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      // TODO: Update lead status in database
      console.log("Lead status updated:", id, status);

      res.status(200).json({
        success: true,
        message: "Lead status updated",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  // ========================
  // DNR (DO NOT RETURN/REHIRE)
  // ========================
  app.post("/api/workers/:workerId/dnr", async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const { companyId, reason, reasonCategory, description, markedBy } = req.body;

      if (!companyId || !reason || !reasonCategory) {
        return res.status(400).json({ error: "Company ID, reason, and reason category required" });
      }

      const dnrData = {
        workerId,
        companyId,
        reason,
        reasonCategory,
        description: description || null,
        markedBy: markedBy || null,
        isActive: true,
      };

      const parsed = insertWorkerDNRSchema.safeParse(dnrData);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid DNR data" });
      }

      const dnr = await storage.createWorkerDNR(parsed.data);
      res.status(201).json(dnr);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark worker as DNR" });
    }
  });

  app.get("/api/workers/:workerId/dnr", async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const { companyId } = req.query as { companyId: string };

      if (!companyId) {
        return res.status(400).json({ error: "Company ID required" });
      }

      const dnr = await storage.getWorkerDNRByWorkerId(workerId, companyId);
      if (!dnr) {
        return res.status(404).json({ error: "No DNR record found" });
      }

      res.status(200).json(dnr);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch DNR record" });
    }
  });

  app.get("/api/companies/:companyId/dnr", async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const { activeOnly } = req.query;

      const dnrList = await storage.listCompanyDNR(companyId, activeOnly !== "false");
      res.status(200).json(dnrList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch DNR list" });
    }
  });

  app.patch("/api/dnr/:dnrId", async (req: Request, res: Response) => {
    try {
      const { dnrId } = req.params;
      const updates = req.body;

      const dnr = await storage.updateWorkerDNR(dnrId, updates);
      if (!dnr) {
        return res.status(404).json({ error: "DNR record not found" });
      }

      res.status(200).json(dnr);
    } catch (error) {
      res.status(500).json({ error: "Failed to update DNR record" });
    }
  });

  app.delete("/api/dnr/:dnrId", async (req: Request, res: Response) => {
    try {
      const { dnrId } = req.params;

      const dnr = await storage.removeWorkerDNR(dnrId);
      if (!dnr) {
        return res.status(404).json({ error: "DNR record not found" });
      }

      res.status(200).json({ success: true, message: "DNR record removed", dnr });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove DNR record" });
    }
  });

  // ========================
  // PAYMENT METHODS (Primary & Backup)
  // ========================
  app.post("/api/companies/:companyId/payment-methods", async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const methodData = { ...req.body, companyId };

      const parsed = insertPaymentMethodSchema.safeParse(methodData);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payment method data" });
      }

      const method = await storage.createPaymentMethod(parsed.data);
      res.status(201).json(method);
    } catch (error) {
      res.status(500).json({ error: "Failed to create payment method" });
    }
  });

  app.get("/api/companies/:companyId/payment-methods", async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const { activeOnly } = req.query;

      const methods = await storage.listCompanyPaymentMethods(companyId, activeOnly !== "false");
      res.status(200).json(methods);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  app.patch("/api/payment-methods/:methodId/set-primary", async (req: Request, res: Response) => {
    try {
      const { methodId } = req.params;
      const { companyId } = req.body;

      if (!companyId) {
        return res.status(400).json({ error: "Company ID required" });
      }

      await storage.setPrimaryPaymentMethod(companyId, methodId);
      res.status(200).json({ success: true, message: "Primary payment method updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to set primary payment method" });
    }
  });

  app.patch("/api/payment-methods/:methodId/set-backup", async (req: Request, res: Response) => {
    try {
      const { methodId } = req.params;
      const { companyId } = req.body;

      if (!companyId) {
        return res.status(400).json({ error: "Company ID required" });
      }

      await storage.setBackupPaymentMethod(companyId, methodId);
      res.status(200).json({ success: true, message: "Backup payment method updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to set backup payment method" });
    }
  });

  // ========================
  // COLLECTIONS / DUNNING
  // ========================
  app.post("/api/companies/:companyId/collections", async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const collectionData = { ...req.body, companyId };

      const parsed = insertCollectionSchema.safeParse(collectionData);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid collection data" });
      }

      const collection = await storage.createCollection(parsed.data);
      res.status(201).json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to create collection record" });
    }
  });

  app.get("/api/companies/:companyId/collections", async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const { status, severity } = req.query;

      const collections = await storage.listCompanyCollections(companyId, {
        status: status as string,
        severity: severity as string,
      });
      res.status(200).json(collections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collections" });
    }
  });

  app.get("/api/companies/:companyId/overdue-amount", async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const amount = await storage.getOverdueAmount(companyId);
      res.status(200).json({ companyId, overdueAmount: amount });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch overdue amount" });
    }
  });

  app.patch("/api/collections/:collectionId", async (req: Request, res: Response) => {
    try {
      const { collectionId } = req.params;
      const updates = req.body;

      const collection = await storage.updateCollection(collectionId, updates);
      if (!collection) {
        return res.status(404).json({ error: "Collection record not found" });
      }

      res.status(200).json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to update collection" });
    }
  });

  app.post("/api/companies/:companyId/suspend-services", async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ error: "Suspension reason required" });
      }

      await storage.suspendCompanyServices(companyId, reason);
      res.status(200).json({ success: true, message: "Services suspended", companyId, reason });
    } catch (error) {
      res.status(500).json({ error: "Failed to suspend services" });
    }
  });

  app.post("/api/companies/:companyId/unsuspend-services", async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;

      await storage.unsuspendCompanyServices(companyId);
      res.status(200).json({ success: true, message: "Services restored", companyId });
    } catch (error) {
      res.status(500).json({ error: "Failed to restore services" });
    }
  });

  // ========================
  // ORBIT HALLMARK ASSET REGISTRY
  // ========================
  
  // Register a new ORBIT asset (hallmark, watermark, button, etc.)
  app.post("/api/assets/register", async (req: Request, res: Response) => {
    try {
      const assetData = req.body;

      const parsed = insertOrbitAssetSchema.safeParse(assetData);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid asset data", details: parsed.error });
      }

      const asset = await storage.registerAsset(parsed.data);
      res.status(201).json({
        success: true,
        message: "Asset registered",
        assetNumber: asset.assetNumber,
        asset,
      });
    } catch (error) {
      console.error("Asset registration error:", error);
      res.status(500).json({ error: "Failed to register asset" });
    }
  });

  // Get a specific asset by asset number
  app.get("/api/assets/:assetNumber", async (req: Request, res: Response) => {
    try {
      const { assetNumber } = req.params;
      const asset = await storage.getAsset(assetNumber);

      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }

      res.status(200).json({
        success: true,
        asset,
        verified: asset.status === "active",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch asset" });
    }
  });

  // List all assets with optional filters
  app.get("/api/assets", async (req: Request, res: Response) => {
    try {
      const { franchiseeId, customerId, status, type } = req.query;

      const assets = await storage.listAssets({
        franchiseeId: franchiseeId as string,
        customerId: customerId as string,
        status: status as string,
        type: type as string,
      });

      res.status(200).json({
        success: true,
        count: assets.length,
        assets,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assets" });
    }
  });

  // Get all assets (admin only)
  app.get("/api/assets/admin/all", async (req: Request, res: Response) => {
    try {
      const assets = await storage.getAllAssets();
      const stats = await storage.getAssetStats();

      res.status(200).json({
        success: true,
        stats,
        totalAssets: assets.length,
        assets,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assets" });
    }
  });

  // Get asset registry statistics
  app.get("/api/assets/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getAssetStats();
      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch asset statistics" });
    }
  });

  // Verify an asset (check if legitimate)
  app.get("/api/assets/verify/:assetNumber", async (req: Request, res: Response) => {
    try {
      const { assetNumber } = req.params;
      const asset = await storage.getAsset(assetNumber);

      if (!asset) {
        return res.status(404).json({
          verified: false,
          message: "Asset not found",
        });
      }

      res.status(200).json({
        verified: asset.status === "active",
        assetNumber: asset.assetNumber,
        type: asset.type,
        createdAt: asset.createdAt,
        status: asset.status,
        message: asset.status === "active" ? "✓ Legitimate ORBIT asset" : `✗ Asset status: ${asset.status}`,
      });
    } catch (error) {
      res.status(500).json({
        verified: false,
        message: "Verification failed",
      });
    }
  });

  // Revoke an asset (admin only)
  app.post("/api/assets/:assetNumber/revoke", async (req: Request, res: Response) => {
    try {
      const { assetNumber } = req.params;
      const { revokedBy, reason } = req.body;

      if (!revokedBy) {
        return res.status(400).json({ error: "Admin ID (revokedBy) required" });
      }

      const asset = await storage.revokeAsset(assetNumber, revokedBy, reason);

      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }

      res.status(200).json({
        success: true,
        message: "Asset revoked",
        asset,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to revoke asset" });
    }
  });

  // ========================
  // SUPPORT TICKETS
  // ========================
  app.post("/api/support/submit", async (req: Request, res: Response) => {
    try {
      const { email, name, phone, subject, message, category, priority } = req.body;

      if (!email || !name || !subject || !message) {
        return res.status(400).json({ error: "Email, name, subject, and message required" });
      }

      // In production, this would save to database
      // For now, we'll just send the auto-response email
      const ticketId = Math.random().toString(36).substr(2, 9).toUpperCase();

      // Send automatic confirmation email
      await emailService.send(
        emailService.getSupportTicketConfirmationEmail(email, ticketId, subject)
      );

      console.log(`✓ Support ticket #${ticketId} created and confirmation sent to ${email}`);

      res.status(201).json({
        success: true,
        ticketId,
        message: "Support ticket submitted. Confirmation email sent.",
      });
    } catch (error) {
      console.error("Support ticket submission error:", error);
      res.status(500).json({ error: "Failed to submit support ticket" });
    }
  });

  // ========================
  // HEALTH CHECK
  // ========================
  app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
