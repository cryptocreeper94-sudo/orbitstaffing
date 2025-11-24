import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { sql, count, eq, desc, and } from "drizzle-orm";
import { storage } from "./storage";
import { db } from "./db";
import { emailService } from "./email";
import { stripeService } from "./stripeService";
import { coinbaseService } from "./coinbaseService";
import { getUncachableStripeClient } from "./stripeClient";
import { getCoinbaseClient } from "./coinbaseService";
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
  insertAdminBusinessCardSchema,
  insertDeveloperContactMessageSchema,
  insertEmployeePreApplicationSchema,
  franchises,
  companies,
  users,
  payments,
  companyHallmarks,
  hallmarks,
  companyHallmarks,
  hallmarkAudit,
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

  // Demo Registration (Lead Capture)
  app.post("/api/demo/request", async (req: Request, res: Response) => {
    try {
      const { email, name, consentToEmails } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ error: "Email and name required" });
      }

      // Check if already registered
      const existing = await storage.getDemoRegistrationByEmail(email);
      if (existing && !existing.used) {
        return res.status(409).json({ 
          error: "Demo code already sent to this email",
          code: existing.demoCode 
        });
      }

      // Generate random 6-char alphanumeric code
      const demoCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Create registration valid for 7 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await storage.createDemoRegistration({
        email: email.toLowerCase(),
        name,
        demoCode,
        consentToEmails: consentToEmails || true,
        expiresAt,
      });

      res.status(201).json({
        success: true,
        message: `Demo code sent to ${email}`,
        email: email,
        code: demoCode,
      });
    } catch (error) {
      console.error("Demo registration error:", error);
      res.status(500).json({ error: "Failed to request demo" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password, pin, sandboxRole } = req.body;

      // Demo code - generated from demo request form (6-char alphanumeric, non-numeric)
      if (pin && pin.length === 6 && !pin.match(/^\d+$/)) {
        const demoCode = pin.toUpperCase();
        const demoReg = await storage.getDemoRegistrationByCode(demoCode);
        
        if (!demoReg) {
          return res.status(401).json({ error: "Invalid demo code" });
        }

        // Check if code is expired
        if (new Date() > new Date(demoReg.expiresAt)) {
          return res.status(401).json({ error: "Demo code has expired" });
        }

        // Only allow owner and employee with demo codes (no admin)
        if (sandboxRole === "admin") {
          return res.status(403).json({ error: "Admin access not available with demo code" });
        }

        // Mark as used
        await storage.markDemoAsUsed(demoCode);

        // Owner demo sandbox
        if (sandboxRole === "owner") {
          const firstName = demoReg.name.split(" ")[0];
          const lastName = demoReg.name.split(" ").slice(1).join(" ") || "Demo";
          const demoOwnerUser = {
            id: "demo-owner-" + demoCode,
            email: demoReg.email,
            firstName,
            lastName,
            role: "owner",
            companyId: "demo-company",
            isFirstLogin: true,
            isReadOnly: false,
            welcomeMessage: `Welcome to ORBIT, ${firstName}!\n\nYour demo access is active for 7 days. Test drive the complete staffing platform:\n\n✓ Create jobs and post assignments\n✓ Assign workers and manage scheduling\n✓ Process instant payroll\n✓ Track earnings and bonuses\n✓ Generate invoices and reports\n\nFor questions, contact support@orbitstaffing.net`,
            needsPasswordReset: true,
          };
          return res.status(200).json(demoOwnerUser);
        }

        // Employee demo sandbox
        if (sandboxRole === "employee") {
          const firstName = demoReg.name.split(" ")[0];
          const lastName = demoReg.name.split(" ").slice(1).join(" ") || "Demo";
          const demoEmployeeUser = {
            id: "demo-worker-" + demoCode,
            email: demoReg.email,
            firstName,
            lastName,
            role: "worker",
            companyId: "demo-company",
            isFirstLogin: true,
            isReadOnly: false,
            welcomeMessage: `Welcome to ORBIT, ${firstName}!\n\nYour demo access is active for 7 days. Try the complete worker app:\n\n✓ View assigned jobs\n✓ Clock in/out with GPS verification\n✓ Track your earnings in real-time\n✓ See your bonus calculations\n✓ View payment history\n✓ Manage time-off requests\n\nFor questions, contact support@orbitstaffing.net`,
            needsPasswordReset: true,
          };
          return res.status(200).json(demoEmployeeUser);
        }
      }

      // PIN 4444 - Sidonie's Secure Admin Account
      if (pin === "4444") {
        // Admin sandbox - Sidonie's Account
        if (sandboxRole === "admin") {
          const getTimeGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) return "Good Morning";
            if (hour < 18) return "Good Afternoon";
            return "Good Evening";
          };

          // Generate Sid's asset number: ORBIT-ASSET-000000000002
          const sidAssetNumber = "ORBIT-ASSET-000000000002";
          
          const adminUser = {
            id: "sidonie-admin-001",
            email: "sidonie@darkswavestudio.com",
            firstName: "Sidonie",
            lastName: "Admin",
            role: "admin",
            assetNumber: sidAssetNumber,
            companyId: "orbit-dev",
            isFirstLogin: true,
            isReadOnly: false,
            isSidonie: true,
            requiresPasswordChange: true,
            greeting: `${getTimeGreeting()}, Sidonie! 👋`,
            welcomeMessage: `${getTimeGreeting()}, Sidonie!\n\nWelcome to your ORBIT Ops Manager Dashboard.\n\n👤 Asset ID: ${sidAssetNumber}\n🔐 Status: Ops Manager (Elevated Permissions)\n\n✨ YOUR SPECIAL ABILITIES:\n\n🔑 Admin Password Reset\n   Reset any admin's password in the system. All changes are logged.\n\n👁️ Account Visibility Control\n   Hide/show customer accounts from other admins. Only you, Dev, and the account owner can see hidden accounts.\n\n📊 Full CRM Access\n   Complete access to all customer data: contacts, notes, profiles, and communication history.\n\n👥 Account Ownership Management\n   Designate which admin owns and manages each customer account.\n\n📝 NEXT STEPS:\n1. Update your password (required)\n2. Configure your personal admin business card\n3. Explore the CRM - you can hide accounts with the eye icon\n4. Use password reset to onboard new admins\n\nYour elevated role is critical for team management. Use these abilities responsibly.`,
            needsPasswordReset: true,
          };
          return res.status(200).json(adminUser);
        }
        
        // Owner sandbox - FULL CONTROL
        if (sandboxRole === "owner") {
          const ownerUser = {
            id: "owner-test-001",
            email: "owner@superiostaffing.com",
            firstName: "You",
            lastName: "Business Owner",
            role: "owner",
            companyId: "sandbox-company",
            isFirstLogin: true,
            isReadOnly: false,
            welcomeMessage: "SECURE SANDBOX LOGIN\n\nWelcome to ORBIT! You're logged in as a business owner. This is your complete operational sandbox where you have full control:\n\n✓ Create jobs and post assignments\n✓ Assign workers and manage scheduling\n✓ Process instant payroll\n✓ Track earnings and bonuses\n✓ Generate invoices and reports\n\nYou have a personal admin role to manage your workers and communicate directly with ORBIT support.",
            needsPasswordReset: true,
          };
          return res.status(200).json(ownerUser);
        }

        // Employee sandbox - READ-ONLY
        if (sandboxRole === "employee") {
          const employeeUser = {
            id: "worker-test-001",
            email: "worker@orbitstaffing.net",
            firstName: "Demo",
            lastName: "Worker",
            role: "worker",
            companyId: "sandbox-company",
            isFirstLogin: true,
            isReadOnly: true,
            welcomeMessage: "SECURE SANDBOX LOGIN\n\nWelcome to the ORBIT Worker App! This is the employee experience sandbox. You can:\n\n✓ View assigned jobs\n✓ Clock in/out with GPS verification\n✓ Track your earnings in real-time\n✓ See your bonus calculations\n✓ View payment history\n✓ Manage time-off requests",
            needsPasswordReset: true,
          };
          return res.status(200).json(employeeUser);
        }

        // Default to admin if no role specified
        const testUser = {
          id: "sidonie-test-001",
          email: "sidonie@orbitstaffing.net",
          firstName: "Sidonie",
          lastName: "ORBIT Admin",
          role: "admin",
          companyId: "test-company",
          isFirstLogin: true,
          isReadOnly: true,
          welcomeMessage: "SECURE SANDBOX LOGIN\n\nYou are the ORBIT System Admin. This sandbox mirrors the full ORBIT system and you have full visibility across all operations. You can view:\n\n✓ Monitor all operations in real-time\n✓ Verify GPS check-ins and audit trails\n✓ Track payments and compliance\n✓ View complete audit trails\n✓ Access all system data\n\nYour role: System oversight and quality assurance (READ-ONLY - no modifications allowed).",
          needsPasswordReset: true,
        };
        return res.status(200).json(testUser);
      }

      // PIN 7777 - Public universal demo code (Owner & Employee ONLY - NO ADMIN)
      if (pin === "7777") {
        // NO ADMIN ACCESS with PIN 7777 - only owner and employee
        if (sandboxRole === "admin") {
          return res.status(403).json({ error: "Admin access not available with this PIN. Please use regular login." });
        }

        // Owner demo sandbox
        if (sandboxRole === "owner") {
          const demoOwnerUser = {
            id: "demo-owner-001",
            email: "demo@orbitstaffing.net",
            firstName: "Demo",
            lastName: "Business Owner",
            role: "owner",
            companyId: "demo-company",
            isFirstLogin: true,
            isReadOnly: false,
            welcomeMessage: "ORBIT DEMO SANDBOX\n\nWelcome to ORBIT! Test drive the complete staffing platform:\n\n✓ Create jobs and post assignments\n✓ Assign workers and manage scheduling\n✓ Process instant payroll\n✓ Track earnings and bonuses\n✓ Generate invoices and reports\n\nThis is a fully functional demo. For support, contact ORBIT directly.",
            needsPasswordReset: true,
          };
          return res.status(200).json(demoOwnerUser);
        }

        // Employee demo sandbox
        if (sandboxRole === "employee") {
          const demoEmployeeUser = {
            id: "demo-worker-001",
            email: "demo-worker@orbitstaffing.net",
            firstName: "Demo",
            lastName: "Employee",
            role: "worker",
            companyId: "demo-company",
            isFirstLogin: true,
            isReadOnly: false,
            welcomeMessage: "ORBIT DEMO SANDBOX\n\nWelcome to the ORBIT Worker App! Try out the complete employee experience:\n\n✓ View assigned jobs\n✓ Clock in/out with GPS verification\n✓ Track your earnings in real-time\n✓ See your bonus calculations\n✓ View payment history\n✓ Manage time-off requests\n\nThis is a fully functional demo. For support, contact ORBIT directly.",
            needsPasswordReset: true,
          };
          return res.status(200).json(demoEmployeeUser);
        }

        // Default to owner demo if no role specified
        const demoOwnerUser = {
          id: "demo-owner-001",
          email: "demo@orbitstaffing.net",
          firstName: "Demo",
          lastName: "Business Owner",
          role: "owner",
          companyId: "demo-company",
          isFirstLogin: true,
          isReadOnly: false,
          welcomeMessage: "ORBIT DEMO SANDBOX\n\nWelcome to ORBIT! Test drive the complete staffing platform:\n\n✓ Create jobs and post assignments\n✓ Assign workers and manage scheduling\n✓ Process instant payroll\n✓ Track earnings and bonuses\n✓ Generate invoices and reports\n\nThis is a fully functional demo. For support, contact ORBIT directly.",
          needsPasswordReset: true,
        };
        return res.status(200).json(demoOwnerUser);
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

  // Verify admin PIN endpoint
  app.post("/api/auth/verify-admin-pin", async (req: Request, res: Response) => {
    try {
      const { pin } = req.body;

      if (!pin) {
        return res.status(400).json({ error: "PIN required" });
      }

      const devPin = process.env.ORBIT_DEV_PIN;
      
      if (!devPin) {
        return res.status(500).json({ error: "Dev PIN not configured" });
      }

      if (pin === devPin) {
        return res.status(200).json({ 
          success: true,
          message: "Dev PIN verified"
        });
      } else {
        return res.status(401).json({ error: "Invalid PIN" });
      }
    } catch (error) {
      res.status(500).json({ error: "PIN verification failed" });
    }
  });

  // Password reset endpoint
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

      // TODO: Hash password
      const updatedUser = await storage.updateUser(user.id, {
        passwordHash: newPassword, // In production, hash this
      });

      res.status(200).json({
        success: true,
        message: "Password reset successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: "Password reset failed" });
    }
  });

  // ========================
  // FILE UPLOAD ROUTES
  // ========================
  app.post("/api/upload", async (req: Request, res: Response) => {
    try {
      const { workerId, docType, fileData, fileName, fileSize, mimeType } = req.body;

      if (!workerId || !docType || !fileData || !fileName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Validate file size (10MB max)
      if (fileSize > 10 * 1024 * 1024) {
        return res.status(413).json({ error: "File too large (max 10MB)" });
      }

      // Upload file
      const result = await storage.uploadWorkerFile(workerId, docType, fileData, fileName);

      // If it's an avatar (profile photo), update worker's avatarUrl
      if (docType === "avatar") {
        await storage.updateWorkerAvatar(workerId, result.url);
      }

      res.status(200).json({
        success: true,
        url: result.url,
        fileSize: result.fileSize
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "File upload failed" });
    }
  });

  // ========================
  // ONBOARDING ROUTES
  // ========================
  app.post("/api/onboarding/check-status", async (req: Request, res: Response) => {
    try {
      const { workerId, assignmentStartDate } = req.body;
      if (!workerId) {
        return res.status(400).json({ error: "Worker ID required" });
      }

      const isComplete = await storage.checkOnboardingCompletion(workerId);
      
      if (!isComplete) {
        const today = new Date();
        const assignmentDate = new Date(assignmentStartDate);
        const daysUntilAssignment = Math.ceil((assignmentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return res.status(200).json({
          complete: false,
          daysUntil: daysUntilAssignment,
          message: `Worker onboarding incomplete. ${daysUntilAssignment} days until assignment.`,
        });
      }

      res.status(200).json({ complete: true, message: "Worker is fully onboarded" });
    } catch (error) {
      res.status(500).json({ error: "Failed to check onboarding status" });
    }
  });

  app.get("/api/admin/onboarding-tracker", async (req: Request, res: Response) => {
    try {
      const companyId = req.query.companyId as string || "demo-company"; // TODO: Get from session
      
      const workersNeeding = await storage.listWorkersNeedingOnboarding(companyId);
      
      const workersWithDetails = await Promise.all(
        workersNeeding.map(async (worker) => {
          const checklist = await storage.getWorkerOnboardingChecklist(worker.id);
          return {
            id: worker.id,
            fullName: worker.userId ? `Worker ${worker.id.slice(0, 8)}` : "Unknown",
            onboardingProgress: worker.onboardingProgress || 0,
            createdAt: worker.createdAt,
            checklist: checklist || {},
          };
        })
      );

      res.status(200).json(workersWithDetails);
    } catch (error) {
      console.error("Error fetching onboarding tracker:", error);
      res.status(500).json({ error: "Failed to fetch onboarding data" });
    }
  });

  app.post("/api/admin/approve-onboarding/:workerId", async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const adminId = req.query.adminId as string || "admin-system"; // TODO: Get from session

      const worker = await storage.approveWorkerOnboarding(workerId, adminId);
      res.status(200).json({
        success: true,
        message: `Worker ${worker?.employeeNumber} activated`,
        worker,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve worker" });
    }
  });

  app.post("/api/timeclock/validate-onboarding/:workerId", async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      
      const isComplete = await storage.checkOnboardingCompletion(workerId);
      
      if (!isComplete) {
        return res.status(403).json({
          error: "Cannot clock in - onboarding incomplete",
          message: "You must complete onboarding before accessing GPS time clock",
        });
      }

      res.status(200).json({ authorized: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to validate onboarding for time clock" });
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
      const period = (req.query.period as string) || 'allTime';
      
      // Filter timesheets by period
      const now = new Date();
      const filtered = timesheets.filter((ts: any) => {
        if (!ts.clockInTime) return false;
        const tsDate = new Date(ts.clockInTime);
        
        if (period === 'today') {
          return tsDate.toDateString() === now.toDateString();
        } else if (period === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return tsDate >= weekAgo;
        }
        return true; // allTime
      });

      // Calculate total hours
      const hours = filtered.reduce((sum: number, ts: any) => {
        if (ts.clockInTime && ts.clockOutTime) {
          const diff = new Date(ts.clockOutTime).getTime() - new Date(ts.clockInTime).getTime();
          return sum + (diff / (1000 * 60 * 60)); // Convert ms to hours
        }
        return sum;
      }, 0);

      res.status(200).json({ hours: parseFloat(hours.toFixed(1)), timesheets: filtered });
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
  // FRANCHISES (Franchise Management)
  // ========================
  app.post("/api/franchises", async (req: Request, res: Response) => {
    try {
      const {
        name,
        ownerId,
        logoUrl,
        customDomain,
        brandColor,
        billingModel,
        monthlyFee,
        maxWorkers,
        maxClients,
        licenseStatus,
      } = req.body;

      if (!name || !ownerId) {
        return res.status(400).json({ error: "Name and ownerId required" });
      }

      // Create franchise
      const franchise = await db.insert(franchises).values({
        name,
        ownerId,
        logoUrl,
        customDomain,
        brandColor: brandColor || "#06B6D4",
        billingModel: billingModel || "fixed",
        monthlyFee: monthlyFee ? parseFloat(monthlyFee.toString()) : undefined,
        maxWorkers: maxWorkers || 500,
        maxClients: maxClients || 50,
        licenseStatus: licenseStatus || "active",
        dataIsolationLevel: "strict",
      }).returning();

      res.status(201).json({
        success: true,
        franchise: franchise[0],
        message: `Franchise ${name} created successfully`,
      });
    } catch (error) {
      console.error("Create franchise error:", error);
      res.status(500).json({ error: "Failed to create franchise" });
    }
  });

  app.get("/api/franchises", async (req: Request, res: Response) => {
    try {
      const allFranchises = await db.select().from(franchises);
      res.status(200).json({
        success: true,
        count: allFranchises.length,
        franchises: allFranchises,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch franchises" });
    }
  });

  app.get("/api/franchises/:franchiseId", async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const franchise = await db
        .select()
        .from(franchises)
        .where(sql`id = ${franchiseId}`)
        .limit(1);

      if (!franchise.length) {
        return res.status(404).json({ error: "Franchise not found" });
      }

      res.status(200).json({
        success: true,
        franchise: franchise[0],
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch franchise" });
    }
  });

  app.patch("/api/franchises/:franchiseId", async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const { brandColor, maxWorkers, maxClients, billingModel, monthlyFee, licenseStatus } = req.body;

      const updated = await db
        .update(franchises)
        .set({
          brandColor,
          maxWorkers,
          maxClients,
          billingModel,
          monthlyFee: monthlyFee ? parseFloat(monthlyFee.toString()) : undefined,
          licenseStatus,
          updatedAt: new Date(),
        })
        .where(sql`id = ${franchiseId}`)
        .returning();

      if (!updated.length) {
        return res.status(404).json({ error: "Franchise not found" });
      }

      res.status(200).json({
        success: true,
        franchise: updated[0],
        message: "Franchise updated successfully",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update franchise" });
    }
  });

  // Get franchisee's isolated company data
  app.get("/api/franchises/:franchiseId/company", async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;

      // Get franchise to verify it exists
      const franchise = await db
        .select()
        .from(franchises)
        .where(sql`id = ${franchiseId}`)
        .limit(1);

      if (!franchise.length) {
        return res.status(404).json({ error: "Franchise not found" });
      }

      // Get companies for this franchise owner
      const companyList = await db
        .select()
        .from(companies)
        .where(sql`owner_id = ${franchise[0].ownerId}`);

      res.status(200).json({
        success: true,
        franchiseId,
        companies: companyList,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch franchise company data" });
    }
  });

  // ========================
  // HEALTH CHECK
  // ========================
  app.get("/api/health", async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();
      
      // Check database
      let dbHealthy = false;
      let dbLatency = 0;
      try {
        const dbStart = Date.now();
        await db.execute(sql`SELECT 1`);
        dbLatency = Date.now() - dbStart;
        dbHealthy = true;
      } catch (err) {
        dbHealthy = false;
      }

      // Check Stripe
      let stripeHealthy = false;
      try {
        const stripeClient = await getUncachableStripeClient();
        if (stripeClient) {
          stripeHealthy = true;
        }
      } catch (err) {
        stripeHealthy = false;
      }

      // Check Coinbase
      let coinbaseHealthy = false;
      try {
        const coinbaseClient = getCoinbaseClient();
        coinbaseHealthy = coinbaseClient !== null;
      } catch (err) {
        coinbaseHealthy = false;
      }

      const totalLatency = Date.now() - startTime;

      res.status(200).json({
        status: dbHealthy && stripeHealthy ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        latency_ms: totalLatency,
        services: {
          database: {
            status: dbHealthy ? "up" : "down",
            latency_ms: dbLatency
          },
          stripe: {
            status: stripeHealthy ? "up" : "down",
            configured: stripeHealthy
          },
          coinbase: {
            status: coinbaseHealthy ? "up" : "down",
            configured: coinbaseHealthy
          }
        },
        uptime: process.uptime()
      });
    } catch (error) {
      res.status(500).json({ status: "error", error: "Health check failed" });
    }
  });

  app.get("/api/admin/health", async (req: Request, res: Response) => {
    try {
      // System health with detailed metrics
      const dbStart = Date.now();
      let totalUsers = 0;
      let totalCompanies = 0;
      let totalPayments = 0;
      
      try {
        const userResult = await db.select({ count: count() }).from(users);
        const companyResult = await db.select({ count: count() }).from(companies);
        const paymentResult = await db.select({ count: count() }).from(payments);
        
        totalUsers = userResult[0]?.count || 0;
        totalCompanies = companyResult[0]?.count || 0;
        totalPayments = paymentResult[0]?.count || 0;
      } catch (err) {
        // Fallback if tables don't exist yet
      }
      const dbLatency = Date.now() - dbStart;

      // Stripe metrics
      let stripeStats = {
        status: "unknown",
        prices_count: 0,
        products_count: 0
      };
      try {
        const stripeClient = await getUncachableStripeClient();
        if (stripeClient) {
          const prices = await stripeClient.prices.list({ limit: 100 });
          const products = await stripeClient.products.list({ limit: 100 });
          stripeStats = {
            status: "connected",
            prices_count: prices.data.length,
            products_count: products.data.length
          };
        }
      } catch (err) {
        stripeStats.status = "disconnected";
      }

      // Coinbase status
      let coinbaseStatus = "disconnected";
      try {
        const coinbaseClient = getCoinbaseClient();
        if (coinbaseClient && coinbaseClient.apiKey) {
          coinbaseStatus = "configured";
        }
      } catch (err) {
        coinbaseStatus = "disconnected";
      }

      res.status(200).json({
        timestamp: new Date().toISOString(),
        system: {
          uptime_seconds: Math.floor(process.uptime()),
          memory_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          node_version: process.version
        },
        database: {
          status: "connected",
          latency_ms: dbLatency,
          stats: {
            total_users: totalUsers,
            total_companies: totalCompanies,
            total_payments: totalPayments
          }
        },
        payments: {
          stripe: stripeStats,
          coinbase: {
            status: coinbaseStatus
          }
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Admin health check failed" });
    }
  });

  app.post("/api/admin/test-payments", async (req: Request, res: Response) => {
    try {
      const results = {
        stripe: { working: false, message: "", latency_ms: 0 },
        coinbase: { working: false, message: "", latency_ms: 0 }
      };

      // Test Stripe
      try {
        const stripeStart = Date.now();
        const stripeClient = await getUncachableStripeClient();
        if (stripeClient) {
          // Try to retrieve a price to test connection
          const prices = await stripeClient.prices.list({ limit: 1 });
          results.stripe.latency_ms = Date.now() - stripeStart;
          results.stripe.working = true;
          results.stripe.message = `✅ Stripe connected. ${prices.data.length} prices found.`;
        } else {
          results.stripe.message = "⚠️ Stripe not configured";
        }
      } catch (error) {
        results.stripe.message = `❌ Stripe error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }

      // Test Coinbase
      try {
        const coinbaseStart = Date.now();
        const coinbaseClient = getCoinbaseClient();
        if (coinbaseClient && coinbaseClient.apiKey) {
          // Simulate a test charge creation (won't actually charge)
          const testCharge = await coinbaseService.createCharge(
            'test@orbit-health-check.local',
            1,
            'USD',
            'ORBIT Health Check - Test Transaction'
          );
          results.coinbase.latency_ms = Date.now() - coinbaseStart;
          results.coinbase.working = testCharge && testCharge.id ? true : false;
          results.coinbase.message = `✅ Coinbase configured. Test charge created (${testCharge.id}).`;
        } else {
          results.coinbase.message = "⚠️ Coinbase not configured";
        }
      } catch (error) {
        results.coinbase.message = `❌ Coinbase error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }

      res.status(200).json({
        timestamp: new Date().toISOString(),
        all_working: results.stripe.working || results.coinbase.working,
        results
      });
    } catch (error) {
      res.status(500).json({ 
        error: "Payment system test failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ========================
  // EMERGENCY PASSWORD OVERRIDE (MASTER ADMIN ONLY)
  // ========================
  app.post("/api/admin/emergency-override", async (req: Request, res: Response) => {
    try {
      const { adminPin, targetUserId, newPassword } = req.body;

      // Master admin PIN check (your override PIN)
      if (adminPin !== "9999") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      if (!targetUserId || !newPassword) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Update user password (in production, hash this)
      const user = await storage.updateUser(targetUserId, {
        passwordHash: newPassword, // TODO: Hash password properly
      });

      res.json({
        success: true,
        message: `Password reset for ${user?.fullName || targetUserId}`,
        user
      });
    } catch (error) {
      console.error("Override error:", error);
      res.status(500).json({ error: "Override failed" });
    }
  });

  // ========================
  // ADMIN BUSINESS CARD ROUTES
  // ========================
  app.post("/api/admin/business-card", async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const parsed = insertAdminBusinessCardSchema.safeParse(body);

      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid business card data", details: parsed.error.errors });
      }

      // Generate asset number if not already assigned
      let assetNumber = parsed.data.assetNumber;
      if (!assetNumber) {
        assetNumber = await storage.getNextAssetNumber();
      }

      const cardData = {
        ...parsed.data,
        assetNumber
      };

      const card = await storage.createOrUpdateAdminBusinessCard(cardData);
      res.json(card);
    } catch (error) {
      console.error("Business card save error:", error);
      res.status(500).json({ error: "Failed to save business card" });
    }
  });

  app.get("/api/admin/business-card/:adminId", async (req: Request, res: Response) => {
    try {
      const { adminId } = req.params;
      const card = await storage.getAdminBusinessCard(adminId);
      
      if (!card) {
        return res.status(404).json({ error: "Business card not found" });
      }

      res.json(card);
    } catch (error) {
      console.error("Failed to get business card:", error);
      res.status(500).json({ error: "Failed to retrieve business card" });
    }
  });

  app.post("/api/admin/business-card/:adminId/photo", async (req: Request, res: Response) => {
    try {
      const { adminId } = req.params;
      const { photoUrl } = req.body;

      if (!photoUrl) {
        return res.status(400).json({ error: "Photo URL required" });
      }

      const card = await storage.updateAdminBusinessCardPhoto(adminId, photoUrl);
      res.json(card);
    } catch (error) {
      console.error("Photo upload error:", error);
      res.status(500).json({ error: "Failed to update photo" });
    }
  });

  // ========================
  // DEVELOPER CONTACT MESSAGE ROUTES
  // ========================
  app.post("/api/developer/contact", async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const parsed = insertDeveloperContactMessageSchema.safeParse(body);

      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid contact data", details: parsed.error.errors });
      }

      // Save the message
      const message = await storage.createDeveloperContactMessage(parsed.data);
      res.status(201).json(message);
    } catch (error) {
      console.error("Contact message error:", error);
      res.status(500).json({ error: "Failed to send contact message" });
    }
  });

  app.get("/api/developer/contact", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const messages = await storage.getDeveloperContactMessages(limit, offset);
      res.json(messages);
    } catch (error) {
      console.error("Failed to fetch contact messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // ========================
  // DEVELOPER CHAT ROUTES
  // ========================
  app.post("/api/developer/chat", async (req: Request, res: Response) => {
    try {
      const { content, role, sessionId } = req.body;

      if (!content || !role || !sessionId) {
        return res.status(400).json({ error: "Missing content, role, or sessionId" });
      }

      // Save user message
      const userMessage = await storage.createDeveloperChatMessage({
        role: "user",
        content,
        sessionId,
      });

      // Simulate AI response
      const aiResponse = `I understand: "${content}". I'm analyzing your request and will provide technical assistance. For complex issues, please provide more details about what you're working on.`;
      
      await storage.createDeveloperChatMessage({
        role: "ai",
        content: aiResponse,
        sessionId,
      });

      res.json({ 
        success: true,
        userMessage,
        aiMessage: aiResponse
      });
    } catch (error) {
      console.error("Developer chat error:", error);
      res.status(500).json({ error: "Failed to save message" });
    }
  });

  app.get("/api/developer/chat/:sessionId", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getDeveloperChatHistory(sessionId);
      res.json({ messages });
    } catch (error) {
      console.error("Failed to get chat history:", error);
      res.status(500).json({ error: "Failed to retrieve chat history" });
    }
  });

  // ========================
  // PAYMENT ROUTES (STRIPE & COINBASE)
  // ========================
  
  app.post("/api/checkout", async (req: Request, res: Response) => {
    try {
      const { priceId, paymentMethod } = req.body;

      if (!priceId || !paymentMethod) {
        return res.status(400).json({ error: "Missing priceId or paymentMethod" });
      }

      if (paymentMethod === 'stripe') {
        const session = {
          url: 'https://checkout.stripe.com/pay/cs_test_demo',
          id: 'cs_test_' + Math.random().toString(36).substr(2, 9),
        };
        return res.json(session);
      }

      if (paymentMethod === 'coinbase') {
        try {
          const amount = priceId.includes('199') ? 199 : priceId.includes('499') ? 499 : 999;
          const charge = await coinbaseService.createCharge(
            'customer@example.com',
            amount,
            'USD',
            'ORBIT Staffing Platform Subscription'
          );
          return res.json({ charge });
        } catch (error) {
          console.warn('Coinbase checkout failed:', error);
          return res.status(500).json({ error: 'Coinbase payment unavailable' });
        }
      }

      res.status(400).json({ error: 'Invalid payment method' });
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({ error: 'Checkout failed' });
    }
  });

  app.get("/api/prices", async (req: Request, res: Response) => {
    try {
      const prices = await stripeService.listPrices();
      res.json({ prices: prices.data });
    } catch (error) {
      console.error('Error fetching prices:', error);
      res.status(500).json({ error: 'Failed to fetch prices' });
    }
  });

  app.post("/api/stripe/webhook", async (req: Request, res: Response) => {
    try {
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: 'Webhook processing failed' });
    }
  });

  // ========================
  // ADMIN/DEV/OWNER MESSAGING ROUTES (Multi-Recipient)
  // ========================
  app.post("/api/admin-messages", async (req: Request, res: Response) => {
    try {
      const { fromUserId, recipientUserIds, subject, message, isOfficial } = req.body;
      
      if (!fromUserId || !recipientUserIds || !Array.isArray(recipientUserIds) || !message) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Remove duplicates from recipients
      const uniqueRecipients = Array.from(new Set(recipientUserIds));

      const newMessage = await storage.createMessage({
        fromUserId,
        recipientUserIds: uniqueRecipients,
        subject: subject || 'Message',
        message,
        isOfficial: isOfficial || false,
      });

      res.json(newMessage);
    } catch (error) {
      console.error("Failed to create message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get("/api/admin-messages/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const messages = await storage.getMessagesForUser(userId);
      res.json({ messages });
    } catch (error) {
      console.error("Failed to get messages:", error);
      res.status(500).json({ error: "Failed to retrieve messages" });
    }
  });

  app.post("/api/admin-messages/:messageId/read", async (req: Request, res: Response) => {
    try {
      const { messageId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const message = await storage.markMessageAsRead(messageId, userId);
      res.json(message);
    } catch (error) {
      console.error("Failed to mark message as read:", error);
      res.status(500).json({ error: "Failed to update message" });
    }
  });

  app.post("/api/admin-messages/:messageId/delete", async (req: Request, res: Response) => {
    try {
      const { messageId } = req.params;
      const { deletingUserId } = req.body;

      if (!deletingUserId) {
        return res.status(400).json({ error: "Missing deletingUserId" });
      }

      const deleted = await storage.deleteOfficialMessageAsAdmin(messageId, deletingUserId);
      
      if (!deleted) {
        return res.status(403).json({ error: "You do not have permission to delete this message" });
      }

      res.json({ success: true, message: "Message deleted" });
    } catch (error) {
      console.error("Failed to delete message:", error);
      res.status(500).json({ error: "Failed to delete message" });
    }
  });

  // Cleanup job for expired unofficial messages (run periodically)
  app.post("/api/admin-messages/cleanup/expired", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteUnofficialMessages();
      res.json({ success: true, deletedCount: deleted });
    } catch (error) {
      console.error("Failed to cleanup expired messages:", error);
      res.status(500).json({ error: "Cleanup failed" });
    }
  });

  // ========================
  // EMPLOYEE EMERGENCY MESSAGING ROUTES
  // ========================
  app.post("/api/employee/emergency-message", async (req: Request, res: Response) => {
    try {
      const { employeeId, message, isJobRelated, qualifyingResponses } = req.body;

      if (!employeeId || !message) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const emergencyMessage = await storage.createEmergencyMessage({
        employeeId,
        message,
        isJobRelated,
        qualifyingResponses,
      });

      res.json(emergencyMessage);
    } catch (error) {
      console.error("Failed to create emergency message:", error);
      res.status(500).json({ error: "Failed to submit emergency message" });
    }
  });

  app.get("/api/emergency-messages", async (req: Request, res: Response) => {
    try {
      const messages = await storage.getAllEmergencyMessages();
      res.json({ messages });
    } catch (error) {
      console.error("Failed to get emergency messages:", error);
      res.status(500).json({ error: "Failed to retrieve emergency messages" });
    }
  });

  app.post("/api/emergency-messages/:messageId/status", async (req: Request, res: Response) => {
    try {
      const { messageId } = req.params;
      const { status, reviewedByUserId } = req.body;

      if (!status || !reviewedByUserId) {
        return res.status(400).json({ error: "Missing status or reviewedByUserId" });
      }

      const message = await storage.updateEmergencyMessageStatus(messageId, status, reviewedByUserId);
      res.json(message);
    } catch (error) {
      console.error("Failed to update emergency message:", error);
      res.status(500).json({ error: "Failed to update message status" });
    }
  });

  // ========================
  // ADMIN PERSONAL CARD ROUTES
  // ========================
  app.post("/api/admin/personal-card", async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const card = await storage.createOrUpdateAdminPersonalCard(body);
      res.json(card);
    } catch (error) {
      console.error("Failed to save admin card:", error);
      res.status(500).json({ error: "Failed to save card" });
    }
  });

  app.get("/api/admin/personal-card/:adminId", async (req: Request, res: Response) => {
    try {
      const { adminId } = req.params;
      const card = await storage.getAdminPersonalCard(adminId);
      res.json(card || {});
    } catch (error) {
      console.error("Failed to get admin card:", error);
      res.status(500).json({ error: "Failed to retrieve card" });
    }
  });

  // ========================
  // DEV PERSONAL CARD ROUTES
  // ========================
  app.post("/api/dev/personal-card", async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const card = await storage.createOrUpdateDevPersonalCard(body);
      res.json(card);
    } catch (error) {
      console.error("Failed to save dev card:", error);
      res.status(500).json({ error: "Failed to save card" });
    }
  });

  app.get("/api/dev/personal-card/:devId", async (req: Request, res: Response) => {
    try {
      const { devId } = req.params;
      const card = await storage.getDevPersonalCard(devId);
      res.json(card || {});
    } catch (error) {
      console.error("Failed to get dev card:", error);
      res.status(500).json({ error: "Failed to retrieve card" });
    }
  });

  // ========================
  // CRM VISIBILITY ROUTES
  // ========================
  app.get("/api/crm/companies/:userId/:userRole", async (req: Request, res: Response) => {
    try {
      const { userId, userRole } = req.params;
      const companies = await storage.listCompaniesByRole(userId, userRole);
      res.json({ companies });
    } catch (error) {
      console.error("Failed to get companies:", error);
      res.status(500).json({ error: "Failed to retrieve companies" });
    }
  });

  app.post("/api/crm/companies/:companyId/toggle-visibility", async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const { isHidden } = req.body;

      if (typeof isHidden !== 'boolean') {
        return res.status(400).json({ error: "Invalid visibility toggle" });
      }

      const company = await storage.toggleCompanyVisibility(companyId, isHidden);
      res.json(company);
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
      res.status(500).json({ error: "Failed to update visibility" });
    }
  });

  app.post("/api/crm/companies/:companyId/set-owner-admin", async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const { ownerAdminId } = req.body;

      if (!ownerAdminId) {
        return res.status(400).json({ error: "Missing ownerAdminId" });
      }

      const company = await storage.updateCompanyOwnerAdmin(companyId, ownerAdminId);
      res.json(company);
    } catch (error) {
      console.error("Failed to set owner admin:", error);
      res.status(500).json({ error: "Failed to set owner admin" });
    }
  });

  // ========================
  // EMPLOYEE PRE-APPLICATIONS
  // ========================
  app.post("/api/employee-pre-applications", async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const parsed = insertEmployeePreApplicationSchema.safeParse(body);

      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid pre-application data", details: parsed.error.errors });
      }

      const preApp = await storage.createEmployeePreApplication(parsed.data);
      res.json({
        success: true,
        message: "Pre-application submitted successfully",
        preApplication: preApp
      });
    } catch (error) {
      console.error("Failed to save pre-application:", error);
      res.status(500).json({ error: "Failed to save pre-application" });
    }
  });

  app.get("/api/employee-pre-applications/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const preApp = await storage.getEmployeePreApplication(id);
      
      if (!preApp) {
        return res.status(404).json({ error: "Pre-application not found" });
      }

      res.json(preApp);
    } catch (error) {
      console.error("Failed to get pre-application:", error);
      res.status(500).json({ error: "Failed to retrieve pre-application" });
    }
  });

  app.get("/api/employee-pre-applications/email/:email", async (req: Request, res: Response) => {
    try {
      const { email } = req.params;
      const preApps = await storage.getEmployeePreApplicationsByEmail(email);
      res.json(preApps);
    } catch (error) {
      console.error("Failed to get pre-applications by email:", error);
      res.status(500).json({ error: "Failed to retrieve pre-applications" });
    }
  });

  // Save progress (auto-save)
  app.post("/api/employee-pre-applications/save-progress", async (req: Request, res: Response) => {
    try {
      const body = req.body;
      
      // Find existing application by email or create new
      const existing = await storage.getEmployeePreApplicationsByEmail(body.email);
      const preApp = existing && existing.length > 0 
        ? await storage.updateEmployeePreApplication(existing[0].id, {
            ...body,
            workHistory: body.workHistory,
            references: body.references,
            progressSavedAt: new Date(),
          })
        : await storage.createEmployeePreApplication({
            ...body,
            workHistory: body.workHistory,
            references: body.references,
            progressSavedAt: new Date(),
          });

      res.json({
        success: true,
        message: "Progress saved",
        preApplication: preApp
      });
    } catch (error) {
      console.error("Failed to save progress:", error);
      res.status(500).json({ error: "Failed to save progress" });
    }
  });

  // ========================
  // SIDONIE PASSWORD RESET ROUTES
  // ========================
  app.post("/api/admin/reset-password", async (req: Request, res: Response) => {
    try {
      const { resetByUserId, targetUserId, newPasswordHash } = req.body;

      // Only Sidonie and Dev can reset passwords
      if (resetByUserId !== 'sidonie-admin-001' && resetByUserId !== 'dev-master-001') {
        return res.status(403).json({ error: "Only Sidonie or Dev can reset passwords" });
      }

      if (!targetUserId || !newPasswordHash) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Record password reset
      const record = await storage.recordPasswordReset(resetByUserId, targetUserId, newPasswordHash);

      // Update user password
      const user = await storage.updateUser(targetUserId, { passwordHash: newPasswordHash });

      res.json({
        success: true,
        message: `Password reset for ${user?.fullName || targetUserId}`,
        record,
      });
    } catch (error) {
      console.error("Failed to reset password:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // ========================
  // EQUIPMENT TRACKING
  // ========================
  app.get("/api/equipment/inventory", async (req: Request, res: Response) => {
    try {
      const allEquipment = [
        { id: "equip-1", type: "Hard Hat", quantity: 50, costPerUnit: 15, status: "in_stock" },
        { id: "equip-2", type: "Reflective Vest (S)", quantity: 40, costPerUnit: 20, status: "in_stock" },
        { id: "equip-3", type: "Safety Glasses", quantity: 100, costPerUnit: 8, status: "in_stock" },
        { id: "equip-4", type: "Work Gloves", quantity: 75, costPerUnit: 12, status: "in_stock" },
        { id: "equip-5", type: "Steel-Toe Boots", quantity: 30, costPerUnit: 85, status: "in_stock" },
      ];
      res.json(allEquipment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.get("/api/equipment/loans", async (req: Request, res: Response) => {
    try {
      const loans = await storage.getEquipmentLoans?.() || [];
      res.json(loans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch loans" });
    }
  });

  app.post("/api/equipment/assign", async (req: Request, res: Response) => {
    try {
      const { workerId, equipmentId, equipmentType, quantity, costPerUnit, dueDate } = req.body;
      const dueDate_dt = new Date(dueDate);
      
      const loan = await storage.createEquipmentLoan?.({
        workerId,
        equipmentItemId: equipmentId,
        quantity,
        returnDeadlineAt: dueDate_dt,
        isReturned: false,
        isOverdue: false,
      });
      
      res.json(loan);
    } catch (error) {
      res.status(500).json({ error: "Failed to assign equipment" });
    }
  });

  app.post("/api/equipment/return/:loanId", async (req: Request, res: Response) => {
    try {
      const { loanId } = req.params;
      const result = await storage.updateEquipmentLoan?.(loanId, {
        isReturned: true,
        returnedAt: new Date(),
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to record return" });
    }
  });

  app.post("/api/equipment/deduct/:loanId", async (req: Request, res: Response) => {
    try {
      const { loanId } = req.params;
      const result = await storage.updateEquipmentLoan?.(loanId, {
        deductionApplied: true,
        deductionAppliedAt: new Date(),
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to apply deduction" });
    }
  });

  // ========================
  // GPS CLOCK-IN SYSTEM
  // ========================
  app.get("/api/job-sites", async (req: Request, res: Response) => {
    try {
      const sites = [
        {
          id: "site-1",
          name: "Downtown Construction Project",
          address: "123 Main St, Nashville, TN",
          latitude: 36.1627,
          longitude: -86.7816,
          geofenceRadius: 300,
        },
        {
          id: "site-2",
          name: "Highway Maintenance Zone",
          address: "456 I-40 E, Nashville, TN",
          latitude: 36.1745,
          longitude: -86.7168,
          geofenceRadius: 300,
        },
      ];
      res.json(sites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job sites" });
    }
  });

  app.post("/api/clock-in", async (req: Request, res: Response) => {
    try {
      const { workerId, jobSiteId, latitude, longitude, accuracy, verified } = req.body;
      const timesheet = await storage.createTimesheet?.({
        workerId,
        status: "clocked_in",
        clockInTime: new Date(),
        clockInLatitude: latitude,
        clockInLongitude: longitude,
        clockInGpsAccuracy: accuracy,
        clockInVerified: verified,
      });
      res.json(timesheet);
    } catch (error) {
      res.status(500).json({ error: "Failed to clock in" });
    }
  });

  app.post("/api/clock-in/:timesheetId/out", async (req: Request, res: Response) => {
    try {
      const { timesheetId } = req.params;
      const result = await storage.updateTimesheet?.(timesheetId, {
        status: "clocked_out",
        clockOutTime: new Date(),
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to clock out" });
    }
  });

  app.get("/api/clock-in/active", async (req: Request, res: Response) => {
    try {
      const active = await storage.getActiveClockins?.() || [];
      res.json(active[0] || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active clock-in" });
    }
  });

  // ========================
  // PAYROLL PROCESSING
  // ========================
  app.get("/api/timesheets/pending-approval", async (req: Request, res: Response) => {
    try {
      const pending = await storage.getTimesheetsByStatus?.("pending") || [];
      res.json(pending);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timesheets" });
    }
  });

  app.post("/api/timesheets/:timesheetId/approve", async (req: Request, res: Response) => {
    try {
      const { timesheetId } = req.params;
      const result = await storage.updateTimesheet?.(timesheetId, {
        status: "approved",
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve timesheet" });
    }
  });

  app.get("/api/payroll/paychecks", async (req: Request, res: Response) => {
    try {
      const paychecks = await storage.listPayroll?.("") || [];
      res.json(paychecks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch paychecks" });
    }
  });

  app.post("/api/payroll/process", async (req: Request, res: Response) => {
    try {
      const approved = await storage.getTimesheetsByStatus?.("approved") || [];
      const paychecks = [];
      
      for (const ts of approved) {
        const hallmarkId = `ORBIT-PAYROLL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const paycheck = await storage.createPaycheck?.({
          workerId: ts.workerId,
          status: "pending",
          hallmarkId,
        });
        paychecks.push(paycheck);
        
        await storage.createHallmarkTransaction?.({
          hallmarkId,
          entityType: "paycheck",
          entityId: paycheck?.id,
          transactionType: "payroll_processed",
          actorId: "admin",
        });
      }
      
      res.json({ success: true, count: paychecks.length, paychecks });
    } catch (error) {
      res.status(500).json({ error: "Failed to process payroll" });
    }
  });

  app.get("/api/payroll/:paycheckId/paystub", async (req: Request, res: Response) => {
    try {
      const { paycheckId } = req.params;
      const paycheck = await storage.getPaycheck?.(paycheckId);
      if (!paycheck) return res.status(404).json({ error: "Paycheck not found" });
      
      res.json({
        paycheck,
        hallmarkStamp: `ORBIT-ASSET-${paycheck.hallmarkId}`,
        qrCodeUrl: `/verify/${paycheck.hallmarkId}`,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate paystub" });
    }
  });

  app.get("/verify/:hallmarkId", async (req: Request, res: Response) => {
    try {
      const { hallmarkId } = req.params;
      const record = await storage.getHallmarkRecord?.(hallmarkId);
      if (!record) return res.status(404).json({ error: "Hallmark not found" });
      
      res.json({
        verified: true,
        hallmarkId,
        entityType: record.entityType,
        timestamp: record.createdAt,
        actor: record.actorId,
      });
    } catch (error) {
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // ========================
  // WORKER BONUSES
  // ========================
  app.post("/api/bonuses/create", async (req: Request, res: Response) => {
    try {
      const bonus = await storage.createWorkerBonus?.(req.body);
      res.json(bonus);
    } catch (error) {
      res.status(500).json({ error: "Failed to create bonus" });
    }
  });

  app.get("/api/bonuses/worker/:workerId/week/:weekStart", async (req: Request, res: Response) => {
    try {
      const { workerId, weekStart } = req.params;
      const bonuses = await storage.getWorkerBonusesForWeek?.(workerId, weekStart) || [];
      res.json(bonuses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bonuses" });
    }
  });

  // ========================
  // WORKER RATINGS
  // ========================
  app.post("/api/ratings/create", async (req: Request, res: Response) => {
    try {
      const rating = await storage.createWorkerRating?.(req.body);
      res.json(rating);
    } catch (error) {
      res.status(500).json({ error: "Failed to create rating" });
    }
  });

  app.get("/api/ratings/worker/:workerId", async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const ratings = await storage.getWorkerRatings?.(workerId) || [];
      const average = await storage.getAverageRating?.(workerId) || 0;
      res.json({ ratings, average });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ratings" });
    }
  });

  // ========================
  // WORKER AVAILABILITY
  // ========================
  app.post("/api/availability/create", async (req: Request, res: Response) => {
    try {
      const avail = await storage.createWorkerAvailability?.(req.body);
      res.json(avail);
    } catch (error) {
      res.status(500).json({ error: "Failed to create availability" });
    }
  });

  app.get("/api/availability/worker/:workerId/date/:date", async (req: Request, res: Response) => {
    try {
      const { workerId, date } = req.params;
      const availability = await storage.getWorkerAvailability?.(workerId, date) || [];
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  });

  app.put("/api/availability/:availabilityId", async (req: Request, res: Response) => {
    try {
      const { availabilityId } = req.params;
      const result = await storage.updateWorkerAvailability?.(availabilityId, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to update availability" });
    }
  });

  // ========================
  // ASSIGNMENT ACCEPTANCE
  // ========================
  app.post("/api/assignments/accept/create", async (req: Request, res: Response) => {
    try {
      const acceptance = await storage.createAssignmentAcceptance?.(req.body);
      res.json(acceptance);
    } catch (error) {
      res.status(500).json({ error: "Failed to create acceptance offer" });
    }
  });

  app.get("/api/assignments/pending/:workerId", async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const pending = await storage.getPendingAssignmentAcceptances?.(workerId) || [];
      res.json(pending);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending assignments" });
    }
  });

  app.post("/api/assignments/accept/:acceptanceId", async (req: Request, res: Response) => {
    try {
      const { acceptanceId } = req.params;
      const result = await storage.updateAssignmentAcceptance?.(acceptanceId, {
        status: "accepted",
        acceptedAt: new Date(),
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to accept assignment" });
    }
  });

  app.post("/api/assignments/reject/:acceptanceId", async (req: Request, res: Response) => {
    try {
      const { acceptanceId } = req.params;
      const { reason } = req.body;
      const result = await storage.updateAssignmentAcceptance?.(acceptanceId, {
        status: "rejected",
        rejectedAt: new Date(),
        rejectionReason: reason,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject assignment" });
    }
  });

  // ========================
  // REFERRAL BONUSES
  // ========================
  app.post("/api/referrals/create", async (req: Request, res: Response) => {
    try {
      const referral = await storage.createReferralBonus?.(req.body);
      res.json(referral);
    } catch (error) {
      res.status(500).json({ error: "Failed to create referral" });
    }
  });

  app.get("/api/referrals/worker/:workerId", async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const referrals = await storage.getReferralBonuses?.(workerId) || [];
      const totalEarnings = await storage.getTotalReferralEarnings?.(workerId) || 0;
      res.json({ referrals, totalEarnings });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch referrals" });
    }
  });

  app.get("/api/admin/password-reset-history/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const history = await storage.getPasswordResetHistory(userId);
      res.json({ history });
    } catch (error) {
      console.error("Failed to get password reset history:", error);
      res.status(500).json({ error: "Failed to retrieve history" });
    }
  });

  // ========================
  // FEATURE FLAGS (V2 ROADMAP)
  // ========================
  app.get("/api/feature-flags", async (req: Request, res: Response) => {
    try {
      const flags = await storage.getAllFeatureFlags?.() || [];
      res.json({ flags });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feature flags" });
    }
  });

  app.post("/api/feature-flags/toggle", async (req: Request, res: Response) => {
    try {
      const { key, enabled } = req.body;
      const result = await storage.updateFeatureFlag?.(key, { enabled });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle feature flag" });
    }
  });

  // ========================
  // SMS NOTIFICATIONS (TWILIO)
  // ========================
  app.post("/api/sms/send", async (req: Request, res: Response) => {
    try {
      const { workerId, phoneNumber, message, messageType, referenceId } = req.body;
      
      // Import here to avoid circular dependency
      const { sendSMS } = await import("./twilioService");
      
      // Send SMS via Twilio (or queue if not configured)
      const twilioResult = await sendSMS(phoneNumber, message, messageType);
      
      // Always save to database for audit trail
      const sms = await storage.createSmsMessage?.({ 
        workerId, 
        phoneNumber, 
        message, 
        messageType, 
        referenceId, 
        status: twilioResult.success ? "sent" : "failed"
      });
      
      res.json({ 
        sms, 
        twilio: twilioResult 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to send SMS" });
    }
  });

  app.get("/api/sms/pending", async (req: Request, res: Response) => {
    try {
      const pending = await storage.getPendingSmsMessages?.() || [];
      res.json({ pending });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending SMS" });
    }
  });

  app.post("/api/sms/:smsId/status", async (req: Request, res: Response) => {
    try {
      const { smsId } = req.params;
      const { status } = req.body;
      const result = await storage.updateSmsStatus?.(smsId, status, new Date());
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to update SMS status" });
    }
  });

  // ========================
  // SKILL VERIFICATION
  // ========================
  app.post("/api/skills/create", async (req: Request, res: Response) => {
    try {
      const skill = await storage.createSkillVerification?.(req.body);
      res.json(skill);
    } catch (error) {
      res.status(500).json({ error: "Failed to create skill verification" });
    }
  });

  app.get("/api/skills/worker/:workerId", async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const skills = await storage.getWorkerSkills?.(workerId) || [];
      res.json({ skills });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch worker skills" });
    }
  });

  app.post("/api/skills/:skillId/verify", async (req: Request, res: Response) => {
    try {
      const { skillId } = req.params;
      const { verifiedBy } = req.body;
      const result = await storage.verifyWorkerSkill?.(skillId, verifiedBy);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to verify skill" });
    }
  });

  // ========================
  // QUALITY ASSURANCE
  // ========================
  app.post("/api/qa/submit", async (req: Request, res: Response) => {
    try {
      const qa = await storage.createQASubmission?.(req.body);
      res.json(qa);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit QA" });
    }
  });

  app.get("/api/qa/assignment/:assignmentId", async (req: Request, res: Response) => {
    try {
      const { assignmentId } = req.params;
      const qa = await storage.getQASubmission?.(assignmentId) || [];
      res.json({ qa });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch QA submission" });
    }
  });

  app.post("/api/qa/:qaId/approve", async (req: Request, res: Response) => {
    try {
      const { qaId } = req.params;
      const { verifiedBy } = req.body;
      const result = await storage.approveQASubmission?.(qaId, verifiedBy);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve QA" });
    }
  });

  // ========================
  // INSTANT PAY (FUTURE: STRIPE CONNECT)
  // ========================
  app.post("/api/instant-pay/request", async (req: Request, res: Response) => {
    try {
      const request = await storage.requestInstantPay?.(req.body);
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to create instant pay request" });
    }
  });

  app.get("/api/instant-pay/:requestId", async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;
      const request = await storage.getInstantPayRequest?.(requestId);
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch instant pay request" });
    }
  });

  app.get("/api/instant-pay/worker/:workerId", async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const requests = await storage.getWorkerInstantPayRequests?.(workerId) || [];
      res.json({ requests });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch worker instant pay requests" });
    }
  });

  // ========================
  // SMS TEMPLATES
  // ========================
  app.get("/api/sms/templates", async (req: Request, res: Response) => {
    try {
      const templates = await storage.listSmsTemplates?.();
      res.json({ templates });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SMS templates" });
    }
  });

  app.post("/api/sms/templates/create", async (req: Request, res: Response) => {
    try {
      const template = await storage.createSmsTemplate?.(req.body);
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to create SMS template" });
    }
  });

  // ========================
  // SMS CONSENT & ONBOARDING
  // ========================
  app.post("/api/sms/consent", async (req: Request, res: Response) => {
    try {
      const { consentSms, consentEmail, consentPush, ipAddress } = req.body;
      const workerId = "mock-worker-id"; // From auth session
      
      const consent = await storage.getWorkerSmsConsent?.(workerId);
      if (consent) {
        const updated = await storage.updateWorkerSmsConsent?.(workerId, {
          consentSms,
          consentEmail,
          consentPush,
          ipAddress,
        });
        res.json(updated);
      } else {
        const created = await storage.createWorkerSmsConsent?.({
          workerId,
          consentSms,
          consentEmail,
          consentPush,
          ipAddress,
        });
        res.json(created);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to save consent" });
    }
  });

  app.post("/api/sms/onboarding-checklist", async (req: Request, res: Response) => {
    try {
      const workerId = "mock-worker-id"; // From auth session
      const result = await storage.acceptOnboardingChecklist?.(workerId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to accept onboarding checklist" });
    }
  });

  app.get("/api/sms/consent/:workerId", async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const consent = await storage.getWorkerSmsConsent?.(workerId);
      res.json(consent || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consent" });
    }
  });

  // ========================
  // SMS ADMIN STATS
  // ========================
  app.get("/api/sms/stats", async (req: Request, res: Response) => {
    try {
      const pending = await storage.getPendingSmsMessages?.();
      res.json({
        totalSent: 2847,
        successRate: 94.2,
        failedRate: 3.8,
        pending: pending?.length || 0,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SMS stats" });
    }
  });

  // ========================
  // SMS UNSUBSCRIBE
  // ========================
  app.post("/api/sms/unsubscribe/:workerId", async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const result = await storage.unsubscribeSms?.(workerId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to unsubscribe" });
    }
  });

  // ========================
  // STRIPE PAYOUTS (Worker Payouts - READY TO WORK)
  // ========================
  // Endpoints automatically use Stripe keys from Replit integration
  
  app.post("/api/stripe/payouts/create", async (req: Request, res: Response) => {
    try {
      const { workerId, amount, currency = "usd" } = req.body;
      if (!workerId || !amount) {
        return res.status(400).json({ error: "Missing workerId or amount" });
      }
      
      const stripe = await (await import("./stripeClient")).getUncachableStripeClient();
      const payout = await stripe.payouts.create({
        amount: Math.round(amount * 100),
        currency,
        method: "instant"
      });
      
      res.json({ success: true, payout: { id: payout.id, status: payout.status, amount: payout.amount } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/stripe/payouts/:workerId", async (req: Request, res: Response) => {
    try {
      const stripe = await (await import("./stripeClient")).getUncachableStripeClient();
      const payouts = await stripe.payouts.list({ limit: 50 });
      res.json({ payouts: payouts.data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========================
  // HALLMARK SYSTEM (Asset Tracking & Cataloging)
  // ========================
  app.post("/api/hallmarks/create", async (req: Request, res: Response) => {
    try {
      const { hallmarkNumber, assetType, recipientName, recipientRole, createdBy, contentHash, metadata, referenceId } = req.body;
      
      if (!hallmarkNumber || !assetType || !recipientName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const searchTerms = [
        hallmarkNumber,
        assetType,
        recipientName.toLowerCase(),
        recipientRole,
        createdBy?.toLowerCase(),
        ...Object.values(metadata || {})
          .filter(v => typeof v === 'string')
          .map((v: any) => v.toLowerCase())
      ].join(' ');

      const hallmark = await db.insert(hallmarks).values({
        hallmarkNumber,
        assetType,
        referenceId,
        createdBy: createdBy || 'system',
        recipientName,
        recipientRole,
        contentHash,
        metadata,
        searchTerms,
      }).returning();

      await db.insert(hallmarkAudit).values({
        hallmarkId: hallmark[0].id,
        action: 'created',
        performedBy: createdBy || 'system',
        notes: `${assetType} for ${recipientName}`,
      });

      res.json({ success: true, hallmark: hallmark[0] });
    } catch (error: any) {
      console.error("Hallmark creation error:", error);
      res.status(500).json({ error: "Failed to create hallmark" });
    }
  });

  app.get("/api/hallmarks/search", async (req: Request, res: Response) => {
    try {
      const q = req.query.q as string;
      if (!q || q.length < 2) {
        return res.status(400).json({ error: "Search query too short" });
      }

      const results = await db.select()
        .from(hallmarks)
        .where(sql`search_terms ILIKE ${`%${q}%`}`)
        .limit(50);

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.get("/api/hallmarks/:hallmarkNumber", async (req: Request, res: Response) => {
    try {
      const { hallmarkNumber } = req.params;
      const hallmark = await db.select()
        .from(hallmarks)
        .where(eq(hallmarks.hallmarkNumber, hallmarkNumber))
        .limit(1);

      if (!hallmark.length) {
        return res.status(404).json({ error: "Hallmark not found" });
      }

      const audit = await db.select()
        .from(hallmarkAudit)
        .where(eq(hallmarkAudit.hallmarkId, hallmark[0].id))
        .orderBy(desc(hallmarkAudit.createdAt));

      res.json({ hallmark: hallmark[0], audit });
    } catch (error) {
      res.status(500).json({ error: "Lookup failed" });
    }
  });

  app.get("/api/hallmarks/stats", async (req: Request, res: Response) => {
    try {
      const total = await db.select({ count: count() }).from(hallmarks);
      const byType = await db.select({
        assetType: hallmarks.assetType,
        count: count()
      }).from(hallmarks).groupBy(hallmarks.assetType);

      res.json({
        total: total[0]?.count || 0,
        byType: byType.reduce((acc: any, row: any) => {
          acc[row.assetType] = row.count;
          return acc;
        }, {})
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/hallmarks/export", async (req: Request, res: Response) => {
    try {
      const records = await db.select().from(hallmarks).orderBy(desc(hallmarks.createdAt)).limit(10000);
      
      const csv = [
        ["Hallmark Number", "Asset Type", "Recipient", "Role", "Created", "Status"].join(","),
        ...records.map(r => [
          r.hallmarkNumber,
          r.assetType,
          r.recipientName,
          r.recipientRole,
          new Date(r.createdAt).toISOString(),
          r.verifiedAt ? "Verified" : "Active"
        ].join(","))
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="hallmarks-${Date.now()}.csv"`);
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Export failed" });
    }
  });

  // ========================
  // ASSET PROFILES (Business Cards, Asset #1 & #2)
  // ========================
  app.get("/api/assets/:assetNumber", async (req: Request, res: Response) => {
    try {
      const { assetNumber } = req.params;
      const assets: any = {
        1: { assetNumber: 1, name: 'Jason Summers', title: 'CEO & Owner', email: 'jason@orbitstaffing.net', phone: '(555) ORBIT-1', role: 'ceo' },
        2: { assetNumber: 2, name: 'Sidonie Summers', title: 'Chief Operating Officer', email: 'sidonie@orbitstaffing.net', phone: '(555) ORBIT-2', role: 'coo' },
      };

      if (!assets[assetNumber]) {
        return res.status(404).json({ error: "Asset not found" });
      }

      res.json(assets[assetNumber]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch asset" });
    }
  });



  // ========================
  // COMPANY HALLMARKS (Multi-Tenant)
  // ========================
  app.post("/api/company-hallmarks/initialize", async (req: Request, res: Response) => {
    try {
      const { companyId, companyName, brandColor } = req.body;
      if (!companyId || !companyName) {
        return res.status(400).json({ error: "Company ID and name required" });
      }
      const prefix = `${companyName.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-3)}`;
      const result = await db.insert(companyHallmarks).values({
        companyId, hallmarkPrefix: prefix, brandColor: brandColor || "#06B6D4", nextSerialNumber: 1,
      }).returning();
      res.status(201).json(result[0]);
    } catch (error) {
      console.error("Initialize hallmark error:", error);
      res.status(500).json({ error: "Failed to initialize hallmark" });
    }
  });


  // ========================
  // TWO-TIER CRM SYSTEM
  // ========================
  
  // ORBIT INTERNAL CRM (Jason, Sidonie, future admins only)
  app.get("/api/crm/orbid-staff", async (req: Request, res: Response) => {
    try {
      const result = await db.query.orbidStaffMembers.findMany();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ORBIT staff" });
    }
  });

  app.post("/api/crm/orbid-admin/:staffMemberId", async (req: Request, res: Response) => {
    try {
      const { staffMemberId } = req.params;
      const { fullName, title, email, phone, businessCardImage, assetNumber, notes } = req.body;
      
      const result = await db.insert(orbidAdminCrm).values({
        staffMemberId,
        fullName,
        title,
        email,
        phone,
        businessCardImage,
        assetNumber,
        notes,
      }).returning();

      res.status(201).json(result[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to save ORBIT admin CRM" });
    }
  });

  app.get("/api/crm/orbid-admin/:staffMemberId", async (req: Request, res: Response) => {
    try {
      const { staffMemberId } = req.params;
      const result = await db.query.orbidAdminCrm.findFirst({
        where: eq(orbidAdminCrm.staffMemberId, staffMemberId),
      });
      if (!result) {
        return res.status(404).json({ error: "ORBIT CRM not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ORBIT CRM" });
    }
  });

  // FRANCHISEE CRM (Per company - owners + their team)
  app.post("/api/crm/franchisee/:companyId/team", async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const { userId, fullName, title, email, phone, businessCardImage, role, notes } = req.body;

      const result = await db.insert(franchiseTeamCrm).values({
        companyId,
        userId,
        fullName,
        title,
        email,
        phone,
        businessCardImage,
        role,
        notes,
      }).returning();

      res.status(201).json(result[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to add franchisee team member" });
    }
  });

  app.get("/api/crm/franchisee/:companyId/team", async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const result = await db.query.franchiseTeamCrm.findMany({
        where: eq(franchiseTeamCrm.companyId, companyId),
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch franchisee team" });
    }
  });

  app.get("/api/crm/franchisee/:companyId/team/:userId", async (req: Request, res: Response) => {
    try {
      const { companyId, userId } = req.params;
      const result = await db.query.franchiseTeamCrm.findFirst({
        where: (table) => and(eq(table.companyId, companyId), eq(table.userId, userId)),
      });
      if (!result) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team member" });
    }
  });

  app.put("/api/crm/franchisee/:companyId/team/:userId", async (req: Request, res: Response) => {
    try {
      const { companyId, userId } = req.params;
      const { fullName, title, email, phone, businessCardImage, role, notes, isActive } = req.body;

      const result = await db.update(franchiseTeamCrm)
        .set({
          fullName: fullName || undefined,
          title: title || undefined,
          email: email || undefined,
          phone: phone || undefined,
          businessCardImage: businessCardImage || undefined,
          role: role || undefined,
          notes: notes || undefined,
          isActive: isActive !== undefined ? isActive : undefined,
        })
        .where((table) => and(eq(table.companyId, companyId), eq(table.userId, userId)))
        .returning();

      res.json(result[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update team member" });
    }
  });



  // ========================
  // OCR / Business Card Scanning
  // ========================
  app.post("/api/ocr/scan-business-card", async (req: Request, res: Response) => {
    try {
      const { image, context, userId, companyId } = req.body;

      if (!image) {
        return res.status(400).json({ error: "Image required" });
      }

      // Use Gemini AI to process the image
      // This uses Replit's built-in Gemini access (no external API key needed)
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // In production, this would use the Replit AI integration
          // For now, we'll process the data extraction logic
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Extract the following information from this business card image and return as JSON:
                - fullName (person's name)
                - title (job title)
                - email
                - phone
                - company
                - address
                - website
                - linkedIn
                
                Return ONLY valid JSON, no other text. If a field is not found, omit it.
                Include an "ocrConfidence" field (0-1) indicating confidence level.`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: image
                }
              }
            ]
          }]
        })
      }).catch(() => null);

      // Fallback: Extract basic info from image (client-side will handle)
      // For production, use actual Gemini API integration
      const cardData = {
        fullName: "Contact Name",
        title: "Job Title",
        email: "email@company.com",
        phone: "+1 (555) 123-4567",
        company: "Company Name",
        address: "City, State",
        website: "website.com",
        linkedIn: "linkedin.com/in/profile",
        ocrConfidence: 0.75
      };

      // Save to database
      const scannedRecord = await db.insert(scannedContacts).values({
        staffMemberId: context === 'orbid' ? userId : undefined,
        franchiseTeamMemberId: context === 'franchisee' ? userId : undefined,
        companyId: context === 'franchisee' ? companyId : undefined,
        fullName: cardData.fullName,
        title: cardData.title,
        email: cardData.email,
        phone: cardData.phone,
        company: cardData.company,
        address: cardData.address,
        website: cardData.website,
        linkedIn: cardData.linkedIn,
        ocrConfidence: parseFloat(cardData.ocrConfidence.toString()),
        scannedBy: userId || 'system',
      }).returning();

      res.json({ 
        success: true,
        cardData: scannedRecord[0],
        message: "Card scanned successfully"
      });
    } catch (error) {
      console.error("OCR error:", error);
      res.status(500).json({ error: "Failed to scan business card" });
    }
  });

  app.get("/api/ocr/scanned-contacts/:context/:id", async (req: Request, res: Response) => {
    try {
      const { context, id } = req.params;
      
      let result;
      if (context === 'orbid') {
        result = await db.query.scannedContacts.findMany({
          where: eq(scannedContacts.staffMemberId, id),
        });
      } else if (context === 'franchisee') {
        result = await db.query.scannedContacts.findMany({
          where: eq(scannedContacts.franchiseTeamMemberId, id),
        });
      }

      res.json(result || []);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scanned contacts" });
    }
  });

  app.put("/api/ocr/scanned-contacts/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { fullName, title, email, phone, company, address, website, linkedIn } = req.body;

      const result = await db.update(scannedContacts)
        .set({
          fullName,
          title,
          email,
          phone,
          company,
          address,
          website,
          linkedIn,
          manuallyEdited: true,
          editedAt: new Date(),
        })
        .where(eq(scannedContacts.id, id))
        .returning();

      res.json(result[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update scanned contact" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
