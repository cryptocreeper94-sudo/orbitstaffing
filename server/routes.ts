import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { sql, eq, desc, and, count, gte, lte } from "drizzle-orm";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { db } from "./db";
import { emailService } from "./email";
import { stripeService } from "./stripeService";
import {
  insertUserSchema,
  insertWorkerSchema,
  insertWorkerInsuranceSchema,
  insertCompanyInsuranceSchema,
  insertInsuranceDocumentSchema,
  insertWorkerRequestSchema,
  insertWorkerRequestMatchSchema,
  users,
  workers,
  companies,
  prevailingWages,
  workersCompRates,
  stateComplianceRules,
} from "@shared/schema";

// ========================
// MIDDLEWARE
// ========================
function parseJSON(req: Request, res: Response, next: () => void): void {
  // Express json middleware already handles parsing,
  // this is a no-op but maintains required structure
  next();
}

// ========================
// HELPERS
// ========================
function getTenantIdFromRequest(req: Request): string | null {
  const user = (req as any).user;
  if (user && user.tenantId) {
    return user.tenantId;
  }
  if (user && user.companyId) {
    return user.companyId;
  }
  const tenantIdParam = req.query.tenantId as string;
  if (tenantIdParam) {
    return tenantIdParam;
  }
  return null;
}

function validateTenantAccess(req: Request, res: Response): string | false {
  const tenantId = getTenantIdFromRequest(req);
  if (!tenantId) {
    res.status(401).json({ error: "Tenant ID required. Access denied." });
    return false;
  }
  return tenantId;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(parseJSON);

  // ========================
  // AUTH ROUTES (ORBIT Payroll System)
  // ========================
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const parsed = insertUserSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid user data" });
      }
      const userData = parsed.data;
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already exists" });
      }
      const hashedPassword = await bcrypt.hash(String(userData.passwordHash), 10);
      const user = await storage.createUser({
        ...parsed.data,
        passwordHash: hashedPassword,
      });
      res.status(201).json({
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to register user" });
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
      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      if (!passwordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        fullName: user.fullName,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/verify-admin-pin", async (req: Request, res: Response) => {
    try {
      const { userId, pin } = req.body;
      if (!userId || !pin) {
        return res.status(400).json({ error: "User ID and PIN required" });
      }
      const user = await storage.getUser(userId);
      if (!user || user.adminPin !== pin) {
        return res.status(401).json({ error: "Invalid PIN" });
      }
      res.json({ verified: true, userId: user.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify PIN" });
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ error: "Email and new password required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(user.id, { passwordHash: hashedPassword });
      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // ========================
  // WORKERS ROUTES
  // ========================
  app.get("/api/workers", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const workers_list = await storage.listWorkers();
      res.json(workers_list);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workers" });
    }
  });

  app.get("/api/workers/:id", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const worker = await storage.getWorker(req.params.id);
      if (!worker) {
        return res.status(404).json({ error: "Worker not found" });
      }
      res.json(worker);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch worker" });
    }
  });

  app.post("/api/workers", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const parsed = insertWorkerSchema.safeParse({
        ...req.body,
        tenantId,
      });
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
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const worker = await storage.updateWorker(req.params.id, req.body);
      if (!worker) {
        return res.status(404).json({ error: "Worker not found" });
      }
      res.json(worker);
    } catch (error) {
      res.status(500).json({ error: "Failed to update worker" });
    }
  });

  // ========================
  // INSURANCE ROUTES
  // ========================
  app.post("/api/worker-insurance", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const parsed = insertWorkerInsuranceSchema.safeParse({
        ...req.body,
        tenantId,
      });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid insurance data" });
      }
      const insurance = await storage.createWorkerInsurance(parsed.data);
      res.status(201).json(insurance);
    } catch (error) {
      res.status(500).json({ error: "Failed to create worker insurance" });
    }
  });

  app.get("/api/worker-insurance/:id", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const insurance = await storage.getWorkerInsurance(req.params.id, tenantId);
      if (!insurance) {
        return res.status(404).json({ error: "Insurance not found" });
      }
      res.json(insurance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch insurance" });
    }
  });

  app.get("/api/worker-insurance/tenant/:tenantId", async (req: Request, res: Response) => {
    try {
      const tenantId = req.params.tenantId;
      const insuranceList = await storage.listWorkerInsurance(tenantId);
      res.json(insuranceList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch worker insurance list" });
    }
  });

  app.get("/api/worker-insurance/expiring/:tenantId", async (req: Request, res: Response) => {
    try {
      const tenantId = req.params.tenantId;
      const daysFromNow = parseInt(req.query.days as string) || 30;
      const expiringInsurance = await storage.listExpiringWorkerInsurance(tenantId, daysFromNow);
      res.json(expiringInsurance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expiring insurance" });
    }
  });

  app.patch("/api/worker-insurance/:id", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const insurance = await storage.updateWorkerInsurance(req.params.id, tenantId, req.body);
      if (!insurance) {
        return res.status(404).json({ error: "Insurance not found" });
      }
      res.json(insurance);
    } catch (error) {
      res.status(500).json({ error: "Failed to update insurance" });
    }
  });

  app.delete("/api/worker-insurance/:id", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      await storage.deleteWorkerInsurance(req.params.id, tenantId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete insurance" });
    }
  });

  app.post("/api/company-insurance", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const parsed = insertCompanyInsuranceSchema.safeParse({
        ...req.body,
        tenantId,
      });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid company insurance data" });
      }
      const insurance = await storage.createCompanyInsurance(parsed.data);
      res.status(201).json(insurance);
    } catch (error) {
      res.status(500).json({ error: "Failed to create company insurance" });
    }
  });

  app.get("/api/company-insurance/:id", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const insurance = await storage.getCompanyInsurance(req.params.id, tenantId);
      if (!insurance) {
        return res.status(404).json({ error: "Company insurance not found" });
      }
      res.json(insurance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company insurance" });
    }
  });

  app.get("/api/company-insurance/:companyId/:type", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const insuranceList = await storage.listCompanyInsuranceByType(
        req.params.companyId,
        tenantId,
        req.params.type
      );
      res.json(insuranceList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company insurance by type" });
    }
  });

  // ========================
  // PAYROLL ROUTES
  // ========================
  app.get("/api/payroll", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const payrollList = await storage.listPayroll();
      res.json(payrollList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payroll" });
    }
  });

  app.post("/api/payroll", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const payroll = await storage.createPayroll({ ...req.body, tenantId });
      res.status(201).json(payroll);
    } catch (error) {
      res.status(500).json({ error: "Failed to create payroll" });
    }
  });

  // ========================
  // GARNISHMENT ROUTES
  // ========================
  app.post("/api/garnishments", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const garnishment = await storage.createGarnishmentOrder({
        ...req.body,
        tenantId,
      });
      res.status(201).json(garnishment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create garnishment order" });
    }
  });

  app.get("/api/garnishments/:employeeId", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const garnishments = await storage.listGarnishmentOrders(req.params.employeeId, tenantId);
      res.json(garnishments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch garnishment orders" });
    }
  });

  app.patch("/api/garnishments/:id", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const garnishment = await storage.updateGarnishmentOrder(
        req.params.id,
        tenantId,
        req.body
      );
      if (!garnishment) {
        return res.status(404).json({ error: "Garnishment order not found" });
      }
      res.json(garnishment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update garnishment order" });
    }
  });

  app.delete("/api/garnishments/:id", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      await storage.deleteGarnishmentOrder(req.params.id, tenantId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete garnishment order" });
    }
  });

  // ========================
  // PAYSTUB PDF ROUTES
  // ========================
  app.post("/api/paystubs/generate/:payrollId", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const { payrollId } = req.params;
      const paystub = await storage.generatePaystubPdf(payrollId, tenantId);
      res.json(paystub);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate paystub PDF" });
    }
  });

  app.get("/api/paystubs/:employeeId", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const { startDate, endDate } = req.query;
      const paystubs = await storage.listPaystubsForEmployee(
        req.params.employeeId,
        tenantId,
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.json(paystubs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch paystubs" });
    }
  });

  // ========================
  // PAYMENT/STRIPE ROUTES
  // ========================
  app.post("/api/payments/stripe/create", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const { garnishmentOrderId, amount, creditorEmail } = req.body;
      if (!garnishmentOrderId || !amount || !creditorEmail) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const paymentResult = await stripeService.createGarnishmentPayment({
        amount,
        creditorEmail,
        creditorStripeAccountId: req.body.creditorStripeAccountId,
        employeeId: req.body.employeeId,
        garnishmentOrderId,
        description: `Garnishment payment`,
      });
      res.json({
        success: true,
        paymentIntentId: paymentResult.paymentIntentId,
        clientSecret: paymentResult.clientSecret,
        amount: paymentResult.amount,
        status: paymentResult.status,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  app.post("/api/payments/stripe/webhook", async (req: Request, res: Response) => {
    try {
      const event = req.body as any;
      await stripeService.handleWebhookEvent(event);
      res.json({ received: true });
    } catch (error) {
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  app.get("/api/payments/status/:paymentId", async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const paymentStatus = await stripeService.getPaymentStatus(paymentId);
      res.json({
        paymentIntentId: paymentStatus.paymentIntentId,
        status: paymentStatus.status,
        amount: paymentStatus.amount,
        currency: paymentStatus.currency,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get payment status" });
    }
  });

  // ========================
  // BACKGROUND CHECK ROUTES
  // ========================
  app.post("/api/background-checks", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const backgroundCheck = await storage.createBackgroundCheck({
        ...req.body,
        tenantId,
      });
      res.status(201).json(backgroundCheck);
    } catch (error) {
      res.status(500).json({ error: "Failed to create background check" });
    }
  });

  app.get("/api/background-checks/:employeeId", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const backgroundChecks = await storage.listBackgroundChecks(req.params.employeeId, tenantId);
      res.json(backgroundChecks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch background checks" });
    }
  });

  app.patch("/api/background-checks/:id/status", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const backgroundCheck = await storage.updateBackgroundCheckStatus(
        req.params.id,
        tenantId,
        req.body.status
      );
      if (!backgroundCheck) {
        return res.status(404).json({ error: "Background check not found" });
      }
      res.json(backgroundCheck);
    } catch (error) {
      res.status(500).json({ error: "Failed to update background check status" });
    }
  });

  // ========================
  // DRUG TEST ROUTES
  // ========================
  app.post("/api/drug-tests", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const drugTest = await storage.createDrugTest({
        ...req.body,
        tenantId,
      });
      res.status(201).json(drugTest);
    } catch (error) {
      res.status(500).json({ error: "Failed to create drug test" });
    }
  });

  app.get("/api/drug-tests/:employeeId", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const drugTests = await storage.listDrugTests(req.params.employeeId, tenantId);
      res.json(drugTests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch drug tests" });
    }
  });

  app.patch("/api/drug-tests/:id/status", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const drugTest = await storage.updateDrugTestStatus(
        req.params.id,
        tenantId,
        req.body.status
      );
      if (!drugTest) {
        return res.status(404).json({ error: "Drug test not found" });
      }
      res.json(drugTest);
    } catch (error) {
      res.status(500).json({ error: "Failed to update drug test status" });
    }
  });

  // ========================
  // COMPLIANCE ROUTES
  // ========================
  app.post("/api/compliance-checks", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const complianceCheck = await storage.createComplianceCheck({
        ...req.body,
        tenantId,
      });
      res.status(201).json(complianceCheck);
    } catch (error) {
      res.status(500).json({ error: "Failed to create compliance check" });
    }
  });

  app.get("/api/compliance-checks/:employeeId", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const complianceChecks = await storage.listComplianceChecks(
        req.params.employeeId,
        tenantId
      );
      res.json(complianceChecks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch compliance checks" });
    }
  });

  app.patch("/api/compliance-checks/:id/renew", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const complianceCheck = await storage.renewComplianceCheck(
        req.params.id,
        tenantId
      );
      if (!complianceCheck) {
        return res.status(404).json({ error: "Compliance check not found" });
      }
      res.json(complianceCheck);
    } catch (error) {
      res.status(500).json({ error: "Failed to renew compliance check" });
    }
  });

  // ========================
  // DOCUMENT UPLOAD ROUTES
  // ========================
  app.post("/api/upload", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const { workerId, docType, fileData, fileName, fileSize, mimeType } = req.body;
      if (!workerId || !docType || !fileData || !fileName) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const document = await storage.uploadDocument({
        workerId,
        tenantId,
        docType,
        fileName,
        fileSize: fileSize || 0,
        mimeType: mimeType || "application/octet-stream",
        fileData,
      });
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  app.post("/api/garnishment-documents", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const document = await storage.createGarnishmentDocument({
        ...req.body,
        tenantId,
      });
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to create garnishment document" });
    }
  });

  app.get("/api/garnishment-documents/:garnishmentOrderId", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const documents = await storage.listGarnishmentDocuments(
        req.params.garnishmentOrderId,
        tenantId
      );
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch garnishment documents" });
    }
  });

  // ========================
  // DASHBOARD ROUTES (ORBIT PAYROLL STATS)
  // ========================
  app.get("/api/dashboard/payroll-stats", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const stats = await storage.getPayrollStats(tenantId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payroll stats" });
    }
  });

  app.get("/api/dashboard/garnishment-stats", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const stats = await storage.getGarnishmentStats(tenantId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch garnishment stats" });
    }
  });

  app.get("/api/dashboard/assignment-stats", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const stats = await storage.getAssignmentStats(tenantId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assignment stats" });
    }
  });

  // ========================
  // DOCUMENT CAPTURE & EMAIL
  // ========================
  app.post("/api/send-photos-email", async (req: Request, res: Response) => {
    try {
      const { to, subject, body } = req.body;

      if (!to || !to.includes("@")) {
        return res.status(400).json({ error: "Valid email address required" });
      }

      // Get PDF from request (can be in body as base64)
      const pdfData = req.body.pdfData || req.body.pdf;

      if (!pdfData) {
        return res.status(400).json({ error: "PDF data required" });
      }

      // Create HTML email with document notification
      const htmlEmail = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #000000 0%, #1f2937 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">📸 Document Captured</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px;">ORBIT Staffing On-Site Capture</p>
          </div>
          
          <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
              ${body || "Please find the captured document(s) attached below."}
            </p>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                📎 <strong>Attachment:</strong> photos-document.pdf<br/>
                ✓ Captured on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br/>
                ✓ Powered by ORBIT Staffing OS
              </p>
            </div>

            <div style="color: #666; font-size: 11px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0;">This is an automated message from ORBIT Staffing OS. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      `;

      // Send email via email service
      const result = await emailService.send({
        to,
        subject: subject || "On-Site Document Capture",
        html: htmlEmail,
      });

      if (result.success) {
        res.json({ success: true, message: `Email sent to ${to}` });
      } else {
        res.status(500).json({ error: "Failed to send email" });
      }
    } catch (error) {
      console.error("Email send error:", error);
      res.status(500).json({ error: "Failed to process email request" });
    }
  });

  // ========================
  // COMPLIANCE & WAGE SCALES
  // ========================
  app.get("/api/compliance/prevailing-wages", async (req: Request, res: Response) => {
    try {
      const { state, jobClassification } = req.query;
      let query = db.select().from(prevailingWages);
      
      if (state) {
        query = query.where(eq(prevailingWages.state, state as string));
      }
      if (jobClassification) {
        query = query.where(eq(prevailingWages.jobClassification, jobClassification as string));
      }
      
      const wages = await query;
      res.json(wages);
    } catch (error) {
      console.error("Prevailing wage fetch error:", error);
      res.status(500).json({ error: "Failed to fetch prevailing wages" });
    }
  });

  app.get("/api/compliance/workers-comp-rates", async (req: Request, res: Response) => {
    try {
      const { state, industry } = req.query;
      let query = db.select().from(workersCompRates);
      
      if (state) {
        query = query.where(eq(workersCompRates.state, state as string));
      }
      if (industry) {
        query = query.where(eq(workersCompRates.industryClassification, industry as string));
      }
      
      const rates = await query;
      res.json(rates);
    } catch (error) {
      console.error("Workers comp rate fetch error:", error);
      res.status(500).json({ error: "Failed to fetch workers comp rates" });
    }
  });

  app.get("/api/compliance/state-rules/:state", async (req: Request, res: Response) => {
    try {
      const { state } = req.params;
      const rules = await db.select().from(stateComplianceRules).where(eq(stateComplianceRules.state, state));
      if (!rules.length) {
        return res.status(404).json({ error: "State compliance rules not found" });
      }
      res.json(rules[0]);
    } catch (error) {
      console.error("State compliance fetch error:", error);
      res.status(500).json({ error: "Failed to fetch state compliance rules" });
    }
  });

  app.get("/api/compliance/all-states", async (req: Request, res: Response) => {
    try {
      const states = await db.select().from(stateComplianceRules);
      res.json(states);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch states" });
    }
  });

  // ========================
  // HEALTH CHECK
  // ========================
  app.get("/api/health", async (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Create and return HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

// ========================
// WORKER MATCHING ENGINE
// ========================
export async function autoMatchWorkers(request: any, tenantId: string): Promise<any[]> {
  try {
    const workers_list = await db.select().from(users).where(eq(users.tenantId, tenantId));
    const matches: any[] = [];

    for (const worker of workers_list) {
      let matchScore = 0;
      const matchReasons: string[] = [];

      const insurance = await storage.getWorkerInsuranceByWorkerId(worker.id, tenantId);

      if (request.skillsRequired && insurance) {
        matchScore += 20;
        matchReasons.push("Has active insurance");
      }

      if (request.workersCompRequired && insurance?.workersCompExpiryDate) {
        const expiryDate = new Date(insurance.workersCompExpiryDate);
        if (expiryDate > new Date()) {
          matchScore += 30;
          matchReasons.push("Workers comp active");
        }
      }

      if (matchScore > 50) {
        matches.push({
          requestId: request.id,
          workerId: worker.id,
          tenantId,
          matchScore,
          matchReason: { reasons: matchReasons },
          matchStatus: "suggested",
        });
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  } catch (error) {
    console.error("Auto-matching error:", error);
    return [];
  }
}
