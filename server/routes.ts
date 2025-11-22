import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
      const { email, password } = req.body;

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
  // HEALTH CHECK
  // ========================
  app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
