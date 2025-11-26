import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { sql, eq, desc, and, count, gte, lte } from "drizzle-orm";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { db } from "./db";
import { emailService } from "./email";
import { oauthClients } from "./oauthClients";
import { syncEngine } from "./syncEngine";
import { stripeService } from "./stripeService";
import { calculatePayroll } from "./payrollCalculator";
import type { PayrollCalculationInput } from "./payrollCalculator";
import {
  insertUserSchema,
  insertWorkerSchema,
  insertWorkerInsuranceSchema,
  insertCompanyInsuranceSchema,
  insertInsuranceDocumentSchema,
  insertWorkerRequestSchema,
  insertWorkerRequestMatchSchema,
  insertPayrollRecordSchema,
  users,
  workers,
  companies,
  prevailingWages,
  workersCompRates,
  stateComplianceRules,
  rateConfirmations,
  billingConfirmations,
  workerAcceptances,
  wageScales,
  insertRateConfirmationSchema,
  insertBillingConfirmationSchema,
  insertWorkerAcceptanceSchema,
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
  // WORKER APPLICATION & REFERRAL ROUTES
  // ========================
  
  app.post("/api/workers/apply", async (req: Request, res: Response) => {
    try {
      const parsed = insertWorkerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid application data", 
          details: parsed.error.issues 
        });
      }
      
      const applicationData = {
        ...parsed.data,
        signatureIpAddress: req.ip || req.connection.remoteAddress || "unknown",
      };
      
      const worker = await storage.createWorkerApplication(applicationData);
      
      if (parsed.data.referredBy) {
        try {
          await storage.createReferralBonus(
            parsed.data.referredBy,
            worker.id,
            applicationData.tenantId
          );
        } catch (error) {
          console.error("Failed to create referral bonus:", error);
        }
      }
      
      res.status(201).json({
        id: worker.id,
        status: worker.status,
        message: "Application submitted successfully! We'll review your application within 24 hours."
      });
    } catch (error) {
      console.error("Worker application error:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });
  
  app.get("/api/workers/apply/verify-referrer", async (req: Request, res: Response) => {
    try {
      const { phone, employeeNumber } = req.query;
      
      if (!phone && !employeeNumber) {
        return res.status(400).json({ error: "Phone number or employee number required" });
      }
      
      let referrer;
      if (phone) {
        referrer = await storage.getWorkerByPhone(phone as string);
      } else if (employeeNumber) {
        referrer = await storage.getWorkerByEmployeeNumber(employeeNumber as string);
      }
      
      if (!referrer) {
        return res.status(404).json({ exists: false, message: "Referrer not found" });
      }
      
      if (referrer.status !== "approved") {
        return res.status(400).json({ 
          exists: true, 
          valid: false, 
          message: "Referrer must be an approved worker" 
        });
      }
      
      res.json({
        exists: true,
        valid: true,
        referrerId: referrer.id,
        referrerName: referrer.fullName,
      });
    } catch (error) {
      console.error("Referrer verification error:", error);
      res.status(500).json({ error: "Failed to verify referrer" });
    }
  });
  
  app.get("/api/workers/:id/referrals", async (req: Request, res: Response) => {
    try {
      const workerId = req.params.id;
      const referrals = await storage.getWorkerReferrals(workerId);
      
      const referralsWithDetails = await Promise.all(
        referrals.map(async (referral) => {
          const referredWorker = await storage.getWorker(referral.referredWorkerId);
          return {
            ...referral,
            referredWorkerName: referredWorker?.fullName || "Unknown",
            referredWorkerPhone: referredWorker?.phone || "Unknown",
            referredWorkerStatus: referredWorker?.status || "Unknown",
          };
        })
      );
      
      res.json(referralsWithDetails);
    } catch (error) {
      console.error("Get referrals error:", error);
      res.status(500).json({ error: "Failed to fetch referrals" });
    }
  });
  
  app.get("/api/workers/:id/referral-earnings", async (req: Request, res: Response) => {
    try {
      const workerId = req.params.id;
      const earnings = await storage.getTotalReferralEarnings(workerId);
      
      res.json({
        totalEarnings: earnings.total,
        earnedButUnpaid: earnings.earned,
        totalPaid: earnings.paid,
      });
    } catch (error) {
      console.error("Get referral earnings error:", error);
      res.status(500).json({ error: "Failed to fetch referral earnings" });
    }
  });
  
  app.post("/api/workers/:id/referral-link", async (req: Request, res: Response) => {
    try {
      const workerId = req.params.id;
      const worker = await storage.getWorker(workerId);
      
      if (!worker) {
        return res.status(404).json({ error: "Worker not found" });
      }
      
      if (worker.status !== "approved") {
        return res.status(400).json({ 
          error: "Only approved workers can refer others" 
        });
      }
      
      const baseUrl = process.env.APP_URL || "http://localhost:5000";
      const referralLink = `${baseUrl}/apply?ref=${workerId}`;
      
      res.json({
        referralLink,
        workerId,
        workerName: worker.fullName,
      });
    } catch (error) {
      console.error("Generate referral link error:", error);
      res.status(500).json({ error: "Failed to generate referral link" });
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
  
  // Get workers ready for payroll processing
  app.get("/api/payroll/ready", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date();
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const workers_data = await storage.getWorkersReadyForPayroll(tenantId, start, end);
      
      // Estimate gross pay and deductions for each worker
      const workersWithEstimates = workers_data.map((worker: any) => {
        const hourlyRate = parseFloat(worker.hourlyWage || "0");
        const regularHours = parseFloat(worker.regularHours || "0");
        const overtimeHours = parseFloat(worker.overtimeHours || "0");
        
        const regularPay = regularHours * hourlyRate;
        const overtimePay = overtimeHours * hourlyRate * 1.5;
        const grossPay = regularPay + overtimePay;
        
        // Rough estimate of deductions (will be accurate during actual processing)
        const estimatedDeductions = grossPay * 0.25; // ~25% for taxes/FICA
        const estimatedNetPay = grossPay - estimatedDeductions;
        
        return {
          ...worker,
          hourlyRate,
          regularHours,
          overtimeHours,
          grossPay,
          estimatedDeductions,
          estimatedNetPay,
          status: 'ready',
        };
      });
      
      res.json(workersWithEstimates);
    } catch (error) {
      console.error("Failed to fetch workers ready for payroll:", error);
      res.status(500).json({ error: "Failed to fetch workers ready for payroll" });
    }
  });
  
  // Process payroll for worker(s)
  app.post("/api/payroll/process", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const { workerIds, payPeriodStart, payPeriodEnd } = req.body;
      
      if (!workerIds || !Array.isArray(workerIds) || workerIds.length === 0) {
        return res.status(400).json({ error: "workerIds array required" });
      }
      
      if (!payPeriodStart || !payPeriodEnd) {
        return res.status(400).json({ error: "payPeriodStart and payPeriodEnd required" });
      }
      
      const processedPayrolls = [];
      const errors = [];
      
      for (const workerId of workerIds) {
        try {
          // Get worker data
          const worker = await storage.getWorker(workerId);
          if (!worker) {
            errors.push({ workerId, error: "Worker not found" });
            continue;
          }
          
          // Get worker's W4 data
          const w4Data = await storage.getWorkerW4Data(workerId);
          if (!w4Data) {
            errors.push({ workerId, error: "W4 data not found for worker" });
            continue;
          }
          
          // Get worker's garnishments
          const garnishments = await storage.getWorkerGarnishments(workerId);
          
          // Get worker's timesheets for the pay period
          const workersData = await storage.getWorkersReadyForPayroll(
            tenantId,
            new Date(payPeriodStart),
            new Date(payPeriodEnd)
          );
          
          const workerData = workersData.find((w: any) => w.workerId === workerId);
          if (!workerData) {
            errors.push({ workerId, error: "No approved hours for pay period" });
            continue;
          }
          
          const hourlyRate = parseFloat(worker.hourlyWage || "0");
          const regularHours = parseFloat(workerData.regularHours || "0");
          const overtimeHours = parseFloat(workerData.overtimeHours || "0");
          
          const regularPay = regularHours * hourlyRate;
          const overtimePay = overtimeHours * hourlyRate * 1.5;
          const grossPay = regularPay + overtimePay;
          
          // Calculate payroll using payrollCalculator.ts
          const payrollInput: PayrollCalculationInput = {
            grossPay,
            w4Data,
            garnishmentOrders: garnishments,
            payPeriodDays: 7, // Weekly
            workState: worker.state || 'TN',
            workCity: worker.city,
            annualGrossPaid: 0, // TODO: Get YTD gross from database
          };
          
          const payrollResult = calculatePayroll(payrollInput);
          
          // Generate hallmark asset number
          const hallmarkAssetNumber = `ORBIT-${Date.now()}-${workerId.substring(0, 6).toUpperCase()}`;
          
          // Create payroll record
          const payrollRecord = await storage.createPayrollRecord({
            tenantId,
            employeeId: workerId,
            payPeriodStart: new Date(payPeriodStart),
            payPeriodEnd: new Date(payPeriodEnd),
            payDate: new Date(),
            
            // Hours
            regularHours: regularHours.toString(),
            overtimeHours: overtimeHours.toString(),
            totalHours: (regularHours + overtimeHours).toString(),
            
            // Pay
            hourlyRate: hourlyRate.toString(),
            regularPay: regularPay.toString(),
            overtimePay: overtimePay.toString(),
            grossPay: payrollResult.grossPay.toString(),
            
            // Deductions
            federalIncomeTax: payrollResult.federalIncomeTax.toString(),
            socialSecurityTax: payrollResult.socialSecurityTax.toString(),
            medicareTax: payrollResult.medicareTax.toString(),
            additionalMedicareTax: payrollResult.additionalMedicareTax.toString(),
            stateTax: payrollResult.stateTax.toString(),
            localTax: payrollResult.localTax.toString(),
            totalMandatoryDeductions: payrollResult.totalMandatoryDeductions.toString(),
            
            // Garnishments
            totalGarnishments: payrollResult.totalGarnishments.toString(),
            garnishmentsBreakdown: payrollResult.garnishmentsApplied,
            
            // Net
            netPay: payrollResult.netPay.toString(),
            
            // Metadata
            w4DataId: w4Data.id,
            workState: worker.state || 'TN',
            workCity: worker.city,
            hallmarkAssetNumber,
            calculationBreakdown: payrollResult.breakdown,
            
            status: 'processed',
            processedAt: new Date(),
          });
          
          processedPayrolls.push({
            payrollId: payrollRecord.id,
            workerId,
            workerName: worker.fullName,
            grossPay: payrollResult.grossPay,
            netPay: payrollResult.netPay,
            hallmarkAssetNumber,
          });
          
        } catch (error: any) {
          errors.push({ workerId, error: error.message || "Processing failed" });
        }
      }
      
      res.json({
        success: true,
        processed: processedPayrolls.length,
        failed: errors.length,
        payrolls: processedPayrolls,
        errors,
      });
      
    } catch (error) {
      console.error("Failed to process payroll:", error);
      res.status(500).json({ error: "Failed to process payroll" });
    }
  });
  
  // Get paystub details
  app.get("/api/payroll/paystub/:id", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const payrollRecord = await storage.getPayrollRecord(req.params.id);
      
      if (!payrollRecord) {
        return res.status(404).json({ error: "Paystub not found" });
      }
      
      // Get worker details
      const worker = await storage.getWorker(payrollRecord.employeeId);
      
      res.json({
        ...payrollRecord,
        workerName: worker?.fullName || "Unknown",
        workerEmail: worker?.email,
      });
    } catch (error) {
      console.error("Failed to fetch paystub:", error);
      res.status(500).json({ error: "Failed to fetch paystub" });
    }
  });
  
  // Get payroll history
  app.get("/api/payroll/history", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const { workerId, limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : 50;
      
      const history = await storage.getPayrollHistory(
        tenantId,
        workerId as string | undefined,
        limitNum
      );
      
      res.json(history);
    } catch (error) {
      console.error("Failed to fetch payroll history:", error);
      res.status(500).json({ error: "Failed to fetch payroll history" });
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

  // ========================
  // BILLING & RATE CONFIRMATIONS
  // ========================
  app.get("/api/confirmations/rate-confirmations/:requestId", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const { requestId } = req.params;
      
      const confirmations = await db.select().from(rateConfirmations).where(and(
        eq(rateConfirmations.workerRequestId, requestId),
        eq(rateConfirmations.tenantId, tenantId)
      ));
      
      res.json(confirmations[0] || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rate confirmation" });
    }
  });

  app.get("/api/confirmations/billing-confirmations/:requestId", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      const { requestId } = req.params;
      
      const confirmations = await db.select().from(billingConfirmations).where(and(
        eq(billingConfirmations.workerRequestId, requestId),
        eq(billingConfirmations.tenantId, tenantId)
      ));
      
      res.json(confirmations[0] || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch billing confirmation" });
    }
  });

  app.post("/api/confirmations/rate-confirmations", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const data = req.body;
      const parsed = insertRateConfirmationSchema.safeParse({ ...data, tenantId });
      if (!parsed.success) return res.status(400).json({ error: "Invalid data" });

      const [result] = await db.insert(rateConfirmations).values(parsed.data).returning();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create rate confirmation" });
    }
  });

  app.post("/api/confirmations/billing-confirmations", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const data = req.body;
      const parsed = insertBillingConfirmationSchema.safeParse({ ...data, tenantId });
      if (!parsed.success) return res.status(400).json({ error: "Invalid data" });

      const [result] = await db.insert(billingConfirmations).values(parsed.data).returning();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create billing confirmation" });
    }
  });

  app.post("/api/worker-acceptance", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const data = req.body;
      const parsed = insertWorkerAcceptanceSchema.safeParse({ ...data, tenantId });
      if (!parsed.success) return res.status(400).json({ error: "Invalid data" });

      const [result] = await db.insert(workerAcceptances).values(parsed.data).returning();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to record worker acceptance" });
    }
  });

  app.get("/api/wage-scales/:state/:industry", async (req: Request, res: Response) => {
    try {
      const { state, industry } = req.params;
      
      const scales = await db.select().from(wageScales).where(and(
        eq(wageScales.state, state),
        eq(wageScales.industry, industry)
      ));
      
      res.json(scales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wage scales" });
    }
  });

  // ========================
  // OAUTH INTEGRATIONS (GENERIC)
  // ========================
  
  // Generic auth URL endpoint for ANY provider
  app.get("/api/oauth/:integrationType/auth", async (req: Request, res: Response) => {
    try {
      const { integrationType } = req.params;
      const { tenantId, state } = req.query;
      if (!tenantId) return res.status(400).json({ error: "tenantId required" });
      
      const authUrl = oauthClients.getAuthUrl(integrationType, (state as string) || (tenantId as string));
      res.json({ authUrl });
    } catch (error) {
      console.error("Auth URL generation failed:", error);
      res.status(500).json({ error: "Failed to generate auth URL" });
    }
  });

  // Generic callback endpoint for ANY provider
  app.post("/api/oauth/:integrationType/callback", async (req: Request, res: Response) => {
    try {
      const { integrationType } = req.params;
      const { code, tenantId, realmId } = req.body;
      if (!code || !tenantId) {
        return res.status(400).json({ error: "Missing required fields: code, tenantId" });
      }

      const tokenData = await oauthClients.exchangeCode(integrationType, code, { realmId });
      const stored = await storage.storeIntegrationToken({
        tenantId,
        integrationType,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: tokenData.expiresAt,
        scope: tokenData.scope,
        connectionStatus: "connected",
        metadata: realmId ? { realm_id: realmId } : undefined,
      });

      res.json({ success: true, token: stored.id });
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.status(500).json({ error: `Failed to connect ${req.params.integrationType}` });
    }
  });

  // Get integration status
  app.get("/api/oauth/status/:integrationType", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;

      const { integrationType } = req.params;
      const token = await storage.getIntegrationToken(tenantId, integrationType);
      
      if (!token) {
        return res.json({ connected: false });
      }

      res.json({
        connected: token.connectionStatus === "connected",
        status: token.connectionStatus,
        lastSynced: token.lastSyncedAt,
        lastError: token.lastError,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check integration status" });
    }
  });

  // Disconnect integration
  app.post("/api/oauth/disconnect/:integrationType", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;

      const { integrationType } = req.params;
      const token = await storage.getIntegrationToken(tenantId, integrationType);
      
      if (token) {
        await storage.deleteIntegrationToken(token.id);
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to disconnect integration" });
    }
  });

  // ========================
  // DATA SYNC OPERATIONS
  // ========================
  
  // Trigger manual sync
  app.post("/api/sync/:integrationType/trigger", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;

      const { integrationType } = req.params;
      const { entityType } = req.body;

      const result = await syncEngine.triggerSync(tenantId, integrationType, entityType);
      res.json(result);
    } catch (error) {
      console.error("Manual sync failed:", error);
      res.status(500).json({ error: "Failed to trigger sync" });
    }
  });

  // Get sync history
  app.get("/api/sync/history", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;

      const limit = parseInt(req.query.limit as string) || 20;
      const history = await syncEngine.getSyncHistory(tenantId, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sync history" });
    }
  });

  // Get synced data
  app.get("/api/sync/data/:integrationType/:entityType", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;

      const { integrationType, entityType } = req.params;
      const data = await syncEngine.getSyncedData(tenantId, integrationType, entityType);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch synced data" });
    }
  });

  // ========================
  // DEVELOPER SECRETS MANAGEMENT
  // (Protected - requires developer/admin authentication)
  // ========================
  
  // Developer authentication middleware
  function requireDeveloperAuth(req: Request, res: Response, next: () => void): void {
    // Check if user is authenticated as developer/admin
    // TODO: Implement proper session-based auth check
    // For now, require ADMIN_PIN verification
    const authHeader = req.headers['x-admin-pin'];
    if (!authHeader || authHeader !== process.env.ADMIN_PIN) {
      res.status(403).json({ error: "Developer authentication required" });
      return;
    }
    next();
  }
  
  // Check which OAuth providers have credentials configured
  app.get("/api/developer/secrets/status", requireDeveloperAuth, async (req: Request, res: Response) => {
    try {
      const configured: string[] = [];
      
      // Check which OAuth provider secrets exist
      const providers = [
        'quickbooks', 'adp', 'paychex', 'gusto', 'rippling', 'workday',
        'paylocity', 'onpay', 'bullhorn', 'wurknow', 'ukgpro', 'bamboohr',
        'google', 'microsoft'
      ];
      
      for (const provider of providers) {
        const clientIdKey = `${provider.toUpperCase()}_CLIENT_ID`;
        const clientSecretKey = `${provider.toUpperCase()}_CLIENT_SECRET`;
        
        // Check if both secrets exist
        if (process.env[clientIdKey] && process.env[clientSecretKey]) {
          configured.push(provider);
        }
      }
      
      res.json({ configured });
    } catch (error) {
      res.status(500).json({ error: "Failed to check secrets status" });
    }
  });

  // Get customer OAuth connection aggregate counts (NO PERSONAL DATA)
  app.get("/api/developer/customer-oauth-summary", requireDeveloperAuth, async (req: Request, res: Response) => {
    try {
      // Get connection summary WITHOUT exposing ANY identifying data
      const allTokens = await storage.getAllIntegrationTokens();
      
      // Aggregate by provider - NO tenant IDs or personal data
      const providerCounts: Record<string, { total: number, connected: number, error: number }> = {};
      
      allTokens.forEach(token => {
        if (!providerCounts[token.integrationType]) {
          providerCounts[token.integrationType] = { total: 0, connected: 0, error: 0 };
        }
        providerCounts[token.integrationType].total++;
        if (token.connectionStatus === 'connected') {
          providerCounts[token.integrationType].connected++;
        } else if (token.connectionStatus === 'error') {
          providerCounts[token.integrationType].error++;
        }
      });
      
      res.json({ providerCounts, totalConnections: allTokens.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch OAuth summary" });
    }
  });

  // ========================
  // CSA (CLIENT SERVICE AGREEMENT) ROUTES
  // ========================
  
  // Get active CSA template for a specific state (or general template)
  app.get("/api/csa/current", async (req: Request, res: Response) => {
    try {
      const state = req.query.state as string | undefined;
      const template = await storage.getActiveCSATemplate(state);
      
      if (!template) {
        return res.status(404).json({ error: "No active CSA template found" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error fetching CSA template:", error);
      res.status(500).json({ error: "Failed to fetch CSA template" });
    }
  });

  // Client signs CSA
  app.post("/api/csa/sign", async (req: Request, res: Response) => {
    try {
      const { clientId, templateId, signerName, signerTitle, acceptedTerms } = req.body;
      
      if (!clientId || !templateId || !signerName || !acceptedTerms) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Validate that all required terms are accepted
      const requiredTerms = ['conversionFee', 'paymentTerms', 'liability', 'markup'];
      const missingTerms = requiredTerms.filter(term => !acceptedTerms[term]);
      
      if (missingTerms.length > 0) {
        return res.status(400).json({ 
          error: "All terms must be accepted",
          missingTerms 
        });
      }
      
      // Capture IP address and device info
      const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';
      const device = req.headers['user-agent'] || 'unknown';
      
      // Create signature data
      const signatureData = {
        signerName,
        signerTitle: signerTitle || '',
        signedAt: new Date().toISOString(),
        ipAddress,
        device,
      };
      
      const updatedClient = await storage.createClientCSA(clientId, {
        templateId,
        signerName,
        signerTitle,
        signatureData,
        ipAddress,
        device,
        acceptedTerms,
      });
      
      res.json({ 
        success: true, 
        client: updatedClient,
        message: "CSA signed successfully" 
      });
    } catch (error: any) {
      console.error("Error signing CSA:", error);
      res.status(500).json({ error: error.message || "Failed to sign CSA" });
    }
  });

  // Get client's signed CSA document
  app.get("/api/clients/:id/csa-document", async (req: Request, res: Response) => {
    try {
      const clientId = req.params.id;
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      if (client.csaStatus !== 'signed') {
        return res.status(404).json({ error: "No signed CSA found for this client" });
      }
      
      res.json({
        client: {
          id: client.id,
          name: client.name,
          csaStatus: client.csaStatus,
          csaSignedDate: client.csaSignedDate,
          csaVersion: client.csaVersion,
          csaSignerName: client.csaSignerName,
          csaSignatureData: client.csaSignatureData,
          csaAcceptedTerms: client.csaAcceptedTerms,
        }
      });
    } catch (error) {
      console.error("Error fetching CSA document:", error);
      res.status(500).json({ error: "Failed to fetch CSA document" });
    }
  });

  // Verify client has valid CSA
  app.get("/api/clients/:id/csa-verify", async (req: Request, res: Response) => {
    try {
      const clientId = req.params.id;
      const verification = await storage.verifyClientCSA(clientId);
      res.json(verification);
    } catch (error) {
      console.error("Error verifying CSA:", error);
      res.status(500).json({ error: "Failed to verify CSA" });
    }
  });

  // ========================
  // CSA TEMPLATE MANAGEMENT (ADMIN ONLY)
  // ========================
  
  // List all CSA templates
  app.get("/api/csa/templates", requireDeveloperAuth, async (req: Request, res: Response) => {
    try {
      const templates = await storage.listCSATemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching CSA templates:", error);
      res.status(500).json({ error: "Failed to fetch CSA templates" });
    }
  });

  // Get specific CSA template
  app.get("/api/csa/templates/:id", requireDeveloperAuth, async (req: Request, res: Response) => {
    try {
      const template = await storage.getCSATemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching CSA template:", error);
      res.status(500).json({ error: "Failed to fetch CSA template" });
    }
  });

  // Create new CSA template
  app.post("/api/csa/templates", requireDeveloperAuth, async (req: Request, res: Response) => {
    try {
      const templateData = req.body;
      const template = await storage.createCSATemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating CSA template:", error);
      res.status(500).json({ error: "Failed to create CSA template" });
    }
  });

  // Update CSA template
  app.put("/api/csa/templates/:id", requireDeveloperAuth, async (req: Request, res: Response) => {
    try {
      const template = await storage.updateCSATemplate(req.params.id, req.body);
      res.json(template);
    } catch (error) {
      console.error("Error updating CSA template:", error);
      res.status(500).json({ error: "Failed to update CSA template" });
    }
  });

  // List all clients
  app.get("/api/clients", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const clients_list = await storage.listClients(tenantId);
      res.json(clients_list);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  // ========================
  // WORKER REQUEST RATE CONFIRMATION
  // ========================
  
  // Confirm rates and CSA for a worker request
  app.post("/api/worker-requests/:id/confirm-rates", async (req: Request, res: Response) => {
    try {
      const requestId = req.params.id;
      const { workerHourlyRate, totalBillingRate, paymentTerms, csaAccepted } = req.body;
      
      if (!requestId || !workerHourlyRate || !totalBillingRate || !paymentTerms) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      if (!csaAccepted) {
        return res.status(400).json({ error: "CSA must be accepted to confirm rates" });
      }
      
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      // Capture customer IP address
      const customerIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
      
      // Get customer/client ID from the request (in a real scenario, this would come from auth)
      const customerId = req.body.customerId || 'default-customer';
      
      const result = await storage.confirmRatesAndCSA({
        requestId,
        tenantId,
        customerId,
        workerHourlyRate,
        totalBillingRate,
        paymentTerms,
        csaAccepted,
        customerIp,
      });
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      
      res.json({
        success: true,
        confirmationId: result.confirmationId,
        message: "Rates confirmed successfully. Worker matching has been initiated."
      });
    } catch (error) {
      console.error("Error confirming rates:", error);
      res.status(500).json({ error: "Failed to confirm rates" });
    }
  });

  // Get worker request details for rate confirmation
  app.get("/api/worker-requests/:id", async (req: Request, res: Response) => {
    try {
      const requestId = req.params.id;
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const workerRequest = await storage.getWorkerRequest(requestId, tenantId);
      
      if (!workerRequest) {
        return res.status(404).json({ error: "Worker request not found" });
      }
      
      res.json(workerRequest);
    } catch (error) {
      console.error("Error fetching worker request:", error);
      res.status(500).json({ error: "Failed to fetch worker request" });
    }
  });
  
  // ========================
  // BACKGROUND JOB MONITORING
  // ========================
  
  // Get background job status
  app.get("/api/background-jobs/status", async (req: Request, res: Response) => {
    try {
      const { getBackgroundJobStatus } = await import('./backgroundJobs');
      const status = getBackgroundJobStatus();
      res.json(status);
    } catch (error) {
      console.error("Error getting background job status:", error);
      res.status(500).json({ error: "Failed to get background job status" });
    }
  });
  
  // Get workers approaching deadlines
  app.get("/api/background-jobs/approaching-deadlines", async (req: Request, res: Response) => {
    try {
      const approaching = await storage.getWorkersApproachingDeadline(1);
      res.json(approaching);
    } catch (error) {
      console.error("Error getting approaching deadlines:", error);
      res.status(500).json({ error: "Failed to get approaching deadlines" });
    }
  });
  
  // Get overdue workers
  app.get("/api/background-jobs/overdue-workers", async (req: Request, res: Response) => {
    try {
      const overdueApplications = await storage.getWorkersWithOverdueApplications();
      const overdueAssignments = await storage.getWorkersWithOverdueAssignments();
      
      res.json({
        applications: overdueApplications,
        assignments: overdueAssignments,
      });
    } catch (error) {
      console.error("Error getting overdue workers:", error);
      res.status(500).json({ error: "Failed to get overdue workers" });
    }
  });
  
  // Get recent reassignments
  app.get("/api/background-jobs/recent-reassignments", async (req: Request, res: Response) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const reassignments = await storage.getRecentReassignments(hours);
      res.json(reassignments);
    } catch (error) {
      console.error("Error getting recent reassignments:", error);
      res.status(500).json({ error: "Failed to get recent reassignments" });
    }
  });
  
  // Manually trigger deadline check (admin only)
  app.post("/api/background-jobs/check-now", async (req: Request, res: Response) => {
    try {
      const { checkOnboardingDeadlines } = await import('./backgroundJobs');
      
      // Run the check asynchronously
      checkOnboardingDeadlines().then(() => {
        console.log('[Admin] Manual deadline check completed');
      }).catch((error) => {
        console.error('[Admin] Manual deadline check failed:', error);
      });
      
      res.json({ 
        success: true, 
        message: "Deadline check initiated. Results will be logged to console." 
      });
    } catch (error) {
      console.error("Error triggering deadline check:", error);
      res.status(500).json({ error: "Failed to trigger deadline check" });
    }
  });

  // ========================
  // OAUTH CONNECTION ROUTES
  // ========================
  
  // Initiate OAuth flow
  app.get("/api/oauth/connect/:provider", async (req: Request, res: Response) => {
    try {
      const { provider } = req.params;
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;

      const { OAUTH_PROVIDERS, generateAuthUrl, generateState } = await import("./oauthConfig");
      
      if (!OAUTH_PROVIDERS[provider]) {
        return res.status(404).json({ error: "Unknown OAuth provider" });
      }

      const config = OAUTH_PROVIDERS[provider];
      const clientId = process.env[config.clientIdEnv];

      if (!clientId) {
        return res.status(500).json({ 
          error: "OAuth provider not configured",
          message: `Missing ${config.clientIdEnv}. Please configure in Developer Panel.`
        });
      }

      const redirectUri = `${req.protocol}://${req.get('host')}/api/oauth/callback/${provider}`;
      const state = generateState();

      (req as any).session.oauthState = state;
      (req as any).session.oauthProvider = provider;
      (req as any).session.oauthTenantId = tenantId;

      const authUrl = generateAuthUrl(provider, clientId, redirectUri, state);

      res.json({ authUrl, state });
    } catch (error: any) {
      console.error("OAuth connect error:", error);
      res.status(500).json({ error: "Failed to initiate OAuth flow", details: error.message });
    }
  });

  // OAuth callback handler
  app.get("/api/oauth/callback/:provider", async (req: Request, res: Response) => {
    try {
      const { provider } = req.params;
      const { code, state, error: oauthError } = req.query;

      if (oauthError) {
        return res.redirect(`/oauth/settings?error=${encodeURIComponent(oauthError as string)}`);
      }

      if (!code || !state) {
        return res.redirect('/oauth/settings?error=missing_parameters');
      }

      const sessionState = (req as any).session.oauthState;
      const sessionProvider = (req as any).session.oauthProvider;
      const sessionTenantId = (req as any).session.oauthTenantId;

      if (state !== sessionState || provider !== sessionProvider) {
        return res.redirect('/oauth/settings?error=invalid_state');
      }

      const { OAUTH_PROVIDERS, exchangeCodeForToken } = await import("./oauthConfig");
      const config = OAUTH_PROVIDERS[provider];

      if (!config) {
        return res.redirect('/oauth/settings?error=unknown_provider');
      }

      const clientId = process.env[config.clientIdEnv];
      const clientSecret = process.env[config.clientSecretEnv];

      if (!clientId || !clientSecret) {
        return res.redirect('/oauth/settings?error=provider_not_configured');
      }

      const redirectUri = `${req.protocol}://${req.get('host')}/api/oauth/callback/${provider}`;
      const tokenData = await exchangeCodeForToken(
        provider,
        code as string,
        clientId,
        clientSecret,
        redirectUri
      );

      const expiresAt = new Date(Date.now() + tokenData.expiresIn * 1000);

      await storage.storeIntegrationToken({
        tenantId: sessionTenantId,
        integrationType: provider,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken || '',
        expiresAt,
        scope: tokenData.scope || config.scopes.join(' '),
        connectionStatus: 'connected',
      });

      delete (req as any).session.oauthState;
      delete (req as any).session.oauthProvider;
      delete (req as any).session.oauthTenantId;

      res.redirect('/oauth/settings?success=true&provider=' + provider);
    } catch (error: any) {
      console.error("OAuth callback error:", error);
      res.redirect(`/oauth/settings?error=${encodeURIComponent(error.message)}`);
    }
  });

  // Get connection status
  app.get("/api/oauth/status", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;

      const { OAUTH_PROVIDERS } = await import("./oauthConfig");
      const connections = await storage.getAllIntegrationTokens();
      const tenantConnections = connections.filter(c => c.tenantId === tenantId);

      const status = Object.keys(OAUTH_PROVIDERS).map(provider => {
        const connection = tenantConnections.find(c => c.integrationType === provider);
        
        if (!connection) {
          return {
            provider,
            name: OAUTH_PROVIDERS[provider].name,
            connected: false,
          };
        }

        return {
          provider,
          name: OAUTH_PROVIDERS[provider].name,
          connected: true,
          lastSync: connection.lastSyncedAt,
          status: connection.connectionStatus,
          connectedAt: connection.createdAt,
        };
      });

      res.json(status);
    } catch (error: any) {
      console.error("OAuth status error:", error);
      res.status(500).json({ error: "Failed to get connection status" });
    }
  });

  // Disconnect provider
  app.post("/api/oauth/disconnect/:provider", async (req: Request, res: Response) => {
    try {
      const { provider } = req.params;
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;

      const connection = await storage.getIntegrationToken(tenantId, provider);
      
      if (!connection) {
        return res.status(404).json({ error: "Connection not found" });
      }

      await storage.deleteIntegrationToken(connection.id);

      res.json({ success: true, message: `Disconnected from ${provider}` });
    } catch (error: any) {
      console.error("OAuth disconnect error:", error);
      res.status(500).json({ error: "Failed to disconnect provider" });
    }
  });

  // Refresh OAuth token
  app.post("/api/oauth/refresh/:provider", async (req: Request, res: Response) => {
    try {
      const { provider } = req.params;
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;

      const connection = await storage.getIntegrationToken(tenantId, provider);
      
      if (!connection || !connection.refreshToken) {
        return res.status(404).json({ error: "Connection not found or no refresh token" });
      }

      const { OAUTH_PROVIDERS, refreshAccessToken } = await import("./oauthConfig");
      const config = OAUTH_PROVIDERS[provider];

      if (!config) {
        return res.status(404).json({ error: "Unknown provider" });
      }

      const clientId = process.env[config.clientIdEnv];
      const clientSecret = process.env[config.clientSecretEnv];

      if (!clientId || !clientSecret) {
        return res.status(500).json({ error: "Provider not configured" });
      }

      const tokenData = await refreshAccessToken(
        provider,
        connection.refreshToken,
        clientId,
        clientSecret
      );

      const expiresAt = new Date(Date.now() + tokenData.expiresIn * 1000);

      await storage.updateIntegrationToken(connection.id, {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt,
        connectionStatus: 'connected',
        lastError: null,
      });

      res.json({ success: true, message: "Token refreshed successfully" });
    } catch (error: any) {
      console.error("OAuth refresh error:", error);
      res.status(500).json({ error: "Failed to refresh token", details: error.message });
    }
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
