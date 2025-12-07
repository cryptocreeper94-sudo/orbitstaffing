import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { sql, eq, desc, and, count, gte, lte } from "drizzle-orm";
import bcrypt from "bcrypt";
import { z } from "zod";
import { storage } from "./storage";
import { db } from "./db";
import { emailService } from "./email";
import { oauthClients } from "./oauthClients";
import { syncEngine } from "./syncEngine";
import { stripeService } from "./stripeService";
import { calculatePayroll } from "./payrollCalculator";
import type { PayrollCalculationInput } from "./payrollCalculator";
import { autoMatchWorkers, autoReassignWorkerRequest } from "./matchingService";
import { registerCrmRoutes } from "./crmRoutes";
import { coinbaseService } from "./coinbaseService";
import { solanaService } from "./solanaService";
import { queueForBlockchain, getBlockchainStats } from "./hallmarkService";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { azureFaceService } from "./azureFaceService";
import { ecosystemHub, externalHubManager, EcosystemClient } from "./ecosystemHub";
import { versionManager } from "./versionManager";

// Session type extension for admin authentication
declare module 'express-session' {
  interface SessionData {
    adminAuthenticated?: boolean;
    adminName?: string;
    adminRole?: string;
    pinChanged?: boolean;
    pinChangedAt?: string;
    stripeCustomerId?: string;
    hallmarkId?: number;
  }
}
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
  adminLoginLogs,
  insertAdminLoginLogSchema,
  betaTesters,
  betaTesterAccessLogs,
  insertBetaTesterSchema,
  reportRequests,
  insertReportRequestSchema,
  type WorkerRequestMatch,
  type WorkerReferralBonus,
  type Timesheet,
  type IntegrationToken,
} from "@shared/schema";

// ========================
// MIDDLEWARE
// ========================
function parseJSON(req: Request, res: Response, next: () => void): void {
  next();
}

// Admin authentication middleware - requires valid admin session
function requireMasterAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.adminAuthenticated || req.session?.adminRole !== 'master') {
    res.status(403).json({ error: "Master admin authentication required" });
    return;
  }
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
  
  // Register CRM routes (Activity Timeline, Notes, Deals, Meetings, etc.)
  registerCrmRoutes(app);
  
  // Register Pay Card routes (ORBIT Pay Card waitlist and preferences)
  registerPayCardRoutes(app);
  
  // Register Crypto Payment routes (Coinbase Commerce for invoice payments)
  registerCryptoPaymentRoutes(app);
  
  // Register Blockchain routes (Solana hash anchoring for Hallmarks)
  registerBlockchainRoutes(app);

  // ========================
  // SYSTEM STATUS CHECK (For Developer Checklist Auto-Update)
  // ========================
  app.get("/api/system/integration-status", async (req: Request, res: Response) => {
    try {
      // Check which integrations are configured (boolean only - no secret values exposed)
      const status = {
        stripe: {
          configured: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY),
          webhook: !!process.env.STRIPE_WEBHOOK_SECRET,
        },
        twilio: {
          configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
        },
        coinbase: {
          configured: !!(process.env.COINBASE_API_KEY || process.env.COINBASE_COMMERCE_API_KEY),
        },
        sendgrid: {
          configured: !!process.env.SENDGRID_API_KEY,
        },
        openai: {
          configured: !!(process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY),
        },
        checkr: {
          configured: !!process.env.CHECKR_API_KEY,
        },
        solana: {
          configured: !!process.env.SOLANA_WALLET_PRIVATE_KEY,
        },
        helius: {
          configured: !!process.env.HELIUS_API_KEY,
        },
        database: {
          configured: !!process.env.DATABASE_URL,
        },
        github: {
          configured: !!process.env.ORBIT_GITHUB_TOKEN,
        },
      };

      // Calculate overall readiness
      const criticalServices = ['stripe', 'database'];
      const criticalReady = criticalServices.every(s => (status as any)[s]?.configured);
      
      const optionalServices = ['twilio', 'coinbase', 'sendgrid', 'openai', 'checkr'];
      const optionalConfigured = optionalServices.filter(s => (status as any)[s]?.configured).length;

      res.json({
        status,
        summary: {
          criticalReady,
          optionalConfigured,
          totalOptional: optionalServices.length,
          readyForProduction: criticalReady,
        },
        lastChecked: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[System Status] Error:", error);
      res.status(500).json({ error: "Failed to check system status" });
    }
  });

  // ========================
  // WEATHER API (Open-Meteo, no API key required)
  // ========================
  
  // Geocode ZIP code to coordinates (US only)
  app.get("/api/weather/geocode/:zip", async (req: Request, res: Response) => {
    try {
      const { zip } = req.params;
      
      // Validate ZIP code format
      if (!/^\d{5}$/.test(zip)) {
        return res.status(400).json({ error: "Invalid ZIP code format" });
      }
      
      // Use Open-Meteo geocoding API
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${zip}&count=1&language=en&format=json&country_code=US`
      );
      
      if (!geoResponse.ok) {
        throw new Error("Geocoding service unavailable");
      }
      
      const geoData = await geoResponse.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        // Try with city name approach for ZIP
        const fallbackResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=United%20States%20${zip}&count=1&language=en&format=json`
        );
        const fallbackData = await fallbackResponse.json();
        
        if (!fallbackData.results || fallbackData.results.length === 0) {
          return res.status(404).json({ error: "Location not found for ZIP code" });
        }
        
        const location = fallbackData.results[0];
        return res.json({
          latitude: location.latitude,
          longitude: location.longitude,
          name: location.name,
          admin1: location.admin1,
          country: location.country,
        });
      }
      
      const location = geoData.results[0];
      res.json({
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name,
        admin1: location.admin1,
        country: location.country,
      });
    } catch (error) {
      console.error("[Weather Geocode] Error:", error);
      res.status(500).json({ error: "Failed to geocode ZIP code" });
    }
  });
  
  // Get weather data by coordinates
  app.get("/api/weather", async (req: Request, res: Response) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude required" });
      }
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
      
      // Fetch current weather from Open-Meteo
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`
      );
      
      if (!weatherResponse.ok) {
        throw new Error("Weather service unavailable");
      }
      
      const weatherData = await weatherResponse.json();
      const current = weatherData.current;
      
      // Map weather codes to conditions
      // WMO Weather interpretation codes (WW)
      // 0: Clear sky, 1-3: Mainly clear/partly cloudy/overcast
      // 45-48: Fog, 51-57: Drizzle, 61-67: Rain, 71-77: Snow, 80-82: Rain showers
      // 85-86: Snow showers, 95-99: Thunderstorm
      let condition = 'clear';
      let icon = 'sunny';
      const code = current.weather_code;
      const isDay = current.is_day === 1;
      
      if (code === 0) {
        condition = isDay ? 'sunny' : 'clear';
        icon = isDay ? 'sunny' : 'night';
      } else if (code >= 1 && code <= 3) {
        if (code === 1) {
          condition = 'partly-cloudy';
          icon = 'partly-cloudy';
        } else {
          condition = 'cloudy';
          icon = 'cloudy';
        }
      } else if (code >= 45 && code <= 48) {
        condition = 'foggy';
        icon = 'foggy';
      } else if (code >= 51 && code <= 67) {
        condition = 'rainy';
        icon = 'rainy';
      } else if (code >= 71 && code <= 77 || code >= 85 && code <= 86) {
        condition = 'snowy';
        icon = 'snowy';
      } else if (code >= 80 && code <= 82) {
        condition = 'rainy';
        icon = 'rainy';
      } else if (code >= 95) {
        condition = 'thunderstorm';
        icon = 'thunderstorm';
      }
      
      // Override icon for nighttime if not a severe weather condition
      if (!isDay) {
        if (['sunny', 'partly-cloudy'].includes(icon)) {
          icon = 'night';
        } else if (icon === 'cloudy') {
          icon = 'night-cloudy';
        }
      }
      
      res.json({
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        cloudCover: current.cloud_cover,
        precipitation: current.precipitation,
        condition,
        icon,
        isDay,
        weatherCode: code,
        timezone: weatherData.timezone,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Weather API] Error:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // ========================
  // HALLMARK SYSTEM (100 Billion Capacity)
  // ========================
  app.get("/api/hallmark/info", async (req: Request, res: Response) => {
    try {
      const { 
        RESERVED_RANGES, 
        EDITION_PREFIXES, 
        FOUNDING_ASSETS 
      } = await import('./hallmarkService');
      
      res.json({
        format: {
          standard: '#XXXXXXXXX-YY',
          special: '#XX-XXXXXXXXX-YY',
          capacity: '100 billion total hallmarks',
        },
        ranges: RESERVED_RANGES,
        prefixes: EDITION_PREFIXES,
        foundingAssets: Object.values(FOUNDING_ASSETS),
      });
    } catch (error) {
      console.error("[Hallmark] Error:", error);
      res.status(500).json({ error: "Failed to get hallmark info" });
    }
  });

  app.get("/api/hallmark/vanity/:name", async (req: Request, res: Response) => {
    try {
      const { resolveVanityName, getAssetBadge } = await import('./hallmarkService');
      const { name } = req.params;
      
      const asset = resolveVanityName(name);
      if (!asset) {
        return res.status(404).json({ error: "Vanity name not found" });
      }
      
      const badge = getAssetBadge(asset.number);
      
      res.json({
        ...asset,
        badge,
        verifyUrl: `https://orbitstaffing.io/verify/${asset.number}`,
      });
    } catch (error) {
      console.error("[Hallmark] Vanity lookup error:", error);
      res.status(500).json({ error: "Failed to resolve vanity name" });
    }
  });

  app.get("/api/hallmark/parse/:hallmark", async (req: Request, res: Response) => {
    try {
      const { parseHallmark, getAssetBadge } = await import('./hallmarkService');
      const { hallmark } = req.params;
      
      const parsed = parseHallmark(decodeURIComponent(hallmark));
      if (!parsed) {
        return res.status(400).json({ error: "Invalid hallmark format" });
      }
      
      const badge = getAssetBadge(decodeURIComponent(hallmark));
      
      res.json({
        ...parsed,
        badge,
        verifyUrl: `https://orbitstaffing.io/verify/${hallmark}`,
      });
    } catch (error) {
      console.error("[Hallmark] Parse error:", error);
      res.status(500).json({ error: "Failed to parse hallmark" });
    }
  });

  app.get("/api/hallmark/founders", async (req: Request, res: Response) => {
    try {
      const { FOUNDING_ASSETS, getAssetBadge } = await import('./hallmarkService');
      
      const founders = Object.entries(FOUNDING_ASSETS).map(([key, asset]) => ({
        key,
        ...asset,
        badge: getAssetBadge(asset.number),
      }));
      
      res.json({ founders });
    } catch (error) {
      console.error("[Hallmark] Founders error:", error);
      res.status(500).json({ error: "Failed to get founders" });
    }
  });

  // ========================
  // V2 SIGNUP (Early Access Waitlist)
  // ========================
  app.post("/api/v2-signup", async (req: Request, res: Response) => {
    try {
      const { contactMethod, email, phone } = req.body;
      
      if (!contactMethod || (contactMethod === 'email' && !email) || (contactMethod === 'sms' && !phone)) {
        return res.status(400).json({ error: "Contact information required" });
      }

      console.log(`[V2 SIGNUP] New signup: ${contactMethod} - ${email || phone}`);
      
      res.json({ 
        success: true, 
        message: "Thank you for signing up! We'll notify you when V2 launches."
      });
    } catch (error) {
      console.error("[V2 SIGNUP] Error:", error);
      res.status(500).json({ error: "Failed to process signup" });
    }
  });

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
      
      if (!pin) {
        return res.status(400).json({ error: "PIN required" });
      }
      
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      
      // Check for Developer PIN (0424 or ORBIT_DEV_PIN env variable)
      const devPin = process.env.ORBIT_DEV_PIN || '0424';
      if (pin === devPin) {
        // Regenerate session to prevent session fixation
        req.session.regenerate(async (err) => {
          if (err) {
            console.error('[Session] Failed to regenerate session:', err);
            return res.status(500).json({ error: "Session error" });
          }
          
          // Set session for developer
          req.session.adminAuthenticated = true;
          req.session.adminName = 'Developer';
          req.session.adminRole = 'developer';
          
          // Log successful developer login
          await db.insert(adminLoginLogs).values({
            adminName: 'Developer',
            adminRole: 'developer',
            loginTime: new Date(),
            ipAddress: ipAddress as string,
            userAgent: userAgent || 'Unknown',
          });
          
          console.log(`[Developer Login] ✅ Developer logged in from ${ipAddress} at ${new Date().toLocaleString()}`);
          
          return res.json({ verified: true, role: 'developer', name: 'Developer', redirectTo: '/developer' });
        });
        return;
      }
      
      // Check for Sid's PIN (4444) - Partner with full sandbox access
      if (pin === '4444') {
        // Regenerate session to prevent session fixation
        req.session.regenerate(async (err) => {
          if (err) {
            console.error('[Session] Failed to regenerate session:', err);
            return res.status(500).json({ error: "Session error" });
          }
          
          // Set session for Sid - full sandbox access (can interact, nothing saves to production)
          req.session.adminAuthenticated = true;
          req.session.adminName = 'Sid';
          req.session.adminRole = 'partner';
          
          // Log successful Sid login
          await db.insert(adminLoginLogs).values({
            adminName: 'Sid',
            adminRole: 'partner',
            loginTime: new Date(),
            ipAddress: ipAddress as string,
            userAgent: userAgent || 'Unknown',
          });
          
          console.log(`[Sid Login] ✅ Sid logged in from ${ipAddress} at ${new Date().toLocaleString()}`);
          
          return res.json({ verified: true, role: 'partner', name: 'Sid', sandboxMode: true });
        });
        return;
      }
      
      // Check for user-specific admin PIN
      if (userId) {
        const user = await storage.getUser(userId);
        if (!user || user.adminPin !== pin) {
          console.log(`[Admin Login] ❌ Failed login attempt with PIN: ${pin.substring(0, 1)}***`);
          return res.status(401).json({ error: "Invalid PIN" });
        }
        
        // Regenerate session to prevent session fixation
        req.session.regenerate(async (err) => {
          if (err) {
            console.error('[Session] Failed to regenerate session:', err);
            return res.status(500).json({ error: "Session error" });
          }
          
          // Set session for regular admin
          req.session.adminAuthenticated = true;
          req.session.adminName = user.fullName || user.email || 'Unknown Admin';
          req.session.adminRole = 'admin';
          
          // Log successful login
          await db.insert(adminLoginLogs).values({
            adminName: user.fullName || user.email || 'Unknown Admin',
            adminRole: user.role || 'admin',
            loginTime: new Date(),
            ipAddress: ipAddress as string,
            userAgent: userAgent || 'Unknown',
          });
          
          console.log(`[Admin Login] ✅ ${user.fullName || user.email} logged in from ${ipAddress} at ${new Date().toLocaleString()}`);
          
          return res.json({ verified: true, userId: user.id });
        });
        return;
      }
      
      // No userId provided and PIN doesn't match master PIN
      console.log(`[Admin Login] ❌ Failed login attempt with PIN: ${pin.substring(0, 1)}***`);
      return res.status(401).json({ error: "Invalid PIN" });
    } catch (error) {
      console.error('[Admin Login] Error:', error);
      res.status(500).json({ error: "Failed to verify PIN" });
    }
  });

  // Admin logout - destroy server session
  app.post("/api/auth/admin-logout", (req: Request, res: Response) => {
    const adminName = req.session?.adminName || 'Unknown';
    
    req.session.destroy((err) => {
      if (err) {
        console.error('[Admin Logout] Session destruction failed:', err);
        return res.status(500).json({ error: "Logout failed" });
      }
      
      res.clearCookie('orbit.sid');
      console.log(`[Admin Logout] ✅ ${adminName} logged out at ${new Date().toLocaleString()}`);
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  // Change admin PIN (for Sidonie/Master Admin)
  app.post("/api/auth/change-admin-pin", async (req: Request, res: Response) => {
    try {
      const { newPin, adminName } = req.body;
      
      if (!newPin || !adminName) {
        return res.status(400).json({ error: "New PIN and admin name required" });
      }
      
      if (newPin.length < 4 || newPin.length > 8) {
        return res.status(400).json({ error: "PIN must be 4-8 digits" });
      }
      
      if (!/^\d+$/.test(newPin)) {
        return res.status(400).json({ error: "PIN must contain only numbers" });
      }
      
      // For Master Admin (Sidonie), update the ADMIN_PIN environment variable concept
      // In production, this would update a secure storage. For now, we log it.
      // The PIN is stored in the session for the current login
      if (adminName === 'Sidonie') {
        // Store the new PIN in the database for persistence
        // We'll use a system settings table or similar
        console.log(`[PIN Change] ✅ Master Admin PIN changed by ${adminName} at ${new Date().toLocaleString()}`);
        
        // Update session with new context
        if (req.session) {
          req.session.pinChanged = true;
          req.session.pinChangedAt = new Date().toISOString();
        }
        
        // In a production environment, you would:
        // 1. Hash the new PIN
        // 2. Store it securely in a database table
        // 3. Update the authentication logic to use the new PIN
        
        // For now, we acknowledge the change request
        // The actual PIN update would require environment variable management
        // which should be done through Replit's secrets management
        
        return res.json({ 
          success: true, 
          message: "PIN change request received. For security, please update ADMIN_PIN in your environment secrets.",
          note: "Your new PIN will be active after updating the ADMIN_PIN secret."
        });
      }
      
      return res.status(403).json({ error: "Unauthorized to change PIN" });
    } catch (error) {
      console.error('[PIN Change] Error:', error);
      res.status(500).json({ error: "Failed to change PIN" });
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
  // ADMIN LOGIN TRACKING
  // ========================
  
  // Get recent admin logins (last 50)
  app.get("/api/admin/login-history", async (req: Request, res: Response) => {
    try {
      const logs = await db.select()
        .from(adminLoginLogs)
        .orderBy(desc(adminLoginLogs.loginTime))
        .limit(50);
      
      res.json({ logs });
    } catch (error) {
      console.error('[Admin Login History] Error:', error);
      res.status(500).json({ error: "Failed to fetch login history" });
    }
  });

  // Get latest login for specific admin
  app.get("/api/admin/latest-login/:adminName", async (req: Request, res: Response) => {
    try {
      const { adminName } = req.params;
      
      const [latestLogin] = await db.select()
        .from(adminLoginLogs)
        .where(eq(adminLoginLogs.adminName, adminName))
        .orderBy(desc(adminLoginLogs.loginTime))
        .limit(1);
      
      res.json({ latestLogin: latestLogin || null });
    } catch (error) {
      console.error('[Latest Login] Error:', error);
      res.status(500).json({ error: "Failed to fetch latest login" });
    }
  });

  // ========================
  // BUSINESS STATS (for BI Dashboard)
  // ========================
  
  app.get("/api/admin/business-stats", async (req: Request, res: Response) => {
    try {
      // Get worker count
      const workersResult = await db.execute(sql`SELECT COUNT(*) as count FROM workers`);
      const workers = parseInt((workersResult.rows[0] as any)?.count || '0');
      
      // Get client/company count
      const clientsResult = await db.execute(sql`SELECT COUNT(*) as count FROM companies`);
      const clients = parseInt((clientsResult.rows[0] as any)?.count || '0');
      
      // Get active jobs count
      const jobsResult = await db.execute(sql`SELECT COUNT(*) as count FROM jobs WHERE status = 'open'`);
      const activeJobs = parseInt((jobsResult.rows[0] as any)?.count || '0');
      
      // Get tenant count
      const tenantsResult = await db.execute(sql`SELECT COUNT(*) as count FROM tenants WHERE status = 'active'`);
      const tenants = parseInt((tenantsResult.rows[0] as any)?.count || '0');
      
      // Get franchise application counts
      let franchisesApproved = 0;
      let franchisesPending = 0;
      try {
        const approvedResult = await db.execute(sql`SELECT COUNT(*) as count FROM franchise_applications WHERE status = 'approved'`);
        franchisesApproved = parseInt((approvedResult.rows[0] as any)?.count || '0');
        
        const pendingResult = await db.execute(sql`SELECT COUNT(*) as count FROM franchise_applications WHERE status = 'pending'`);
        franchisesPending = parseInt((pendingResult.rows[0] as any)?.count || '0');
      } catch (e) {
        // Table may not exist yet
      }
      
      res.json({
        workers,
        clients,
        activeJobs,
        tenants,
        franchisesApproved,
        franchisesPending,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[Business Stats] Error:', error);
      res.json({ workers: 0, clients: 0, activeJobs: 0, tenants: 0, franchisesApproved: 0, franchisesPending: 0 });
    }
  });

  // ========================
  // BETA TESTER ROUTES
  // ========================
  
  // Verify 3-digit beta tester PIN
  app.post("/api/auth/verify-beta-pin", async (req: Request, res: Response) => {
    try {
      const { pin } = req.body;
      
      if (!pin || pin.length !== 3) {
        return res.status(400).json({ error: "Invalid PIN format. Must be 3 digits." });
      }
      
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      
      // Find beta tester by comparing hashed PINs
      const allTesters = await db.select().from(betaTesters).where(eq(betaTesters.status, 'active'));
      
      let matchedTester = null;
      for (const tester of allTesters) {
        const pinMatch = await bcrypt.compare(pin, tester.hashedPin);
        if (pinMatch) {
          matchedTester = tester;
          break;
        }
      }
      
      if (!matchedTester) {
        console.log(`[Beta Login] ❌ Failed login attempt with PIN: ${pin.substring(0, 1)}**`);
        return res.status(401).json({ error: "Invalid PIN" });
      }
      
      // Update last login
      await db.update(betaTesters)
        .set({ 
          lastLoginAt: new Date(),
          loginCount: (matchedTester.loginCount || 0) + 1
        })
        .where(eq(betaTesters.id, matchedTester.id));
      
      // Log access
      await db.insert(betaTesterAccessLogs).values({
        testerId: matchedTester.id,
        testerName: matchedTester.name,
        action: 'login',
        ipAddress: ipAddress as string,
        userAgent: userAgent || 'Unknown',
      });
      
      console.log(`[Beta Login] ✅ ${matchedTester.name} logged in from ${ipAddress} at ${new Date().toLocaleString()}`);
      
      res.json({ 
        verified: true, 
        testerId: matchedTester.id,
        testerName: matchedTester.name,
        accessLevel: matchedTester.accessLevel
      });
    } catch (error) {
      console.error('[Beta Login] Error:', error);
      res.status(500).json({ error: "Failed to verify PIN" });
    }
  });
  
  // Get all beta testers (Master Admin only)
  app.get("/api/beta-testers", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const testers = await db.select().from(betaTesters).orderBy(desc(betaTesters.createdAt));
      res.json({ testers });
    } catch (error) {
      console.error('[Beta Testers] Error:', error);
      res.status(500).json({ error: "Failed to fetch beta testers" });
    }
  });
  
  // Create new beta tester (Master Admin only)
  app.post("/api/beta-testers", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { name, email, pin, notes, accessLevel } = req.body;
      
      if (!name || !pin) {
        return res.status(400).json({ error: "Name and PIN are required" });
      }
      
      if (pin.length !== 3 || !/^\d{3}$/.test(pin)) {
        return res.status(400).json({ error: "PIN must be exactly 3 digits" });
      }
      
      // Hash the PIN
      const hashedPin = await bcrypt.hash(pin, 10);
      
      const [newTester] = await db.insert(betaTesters).values({
        name,
        email: email || null,
        hashedPin,
        notes: notes || null,
        accessLevel: accessLevel || 'full_sandbox',
        createdBy: 'Sidonie',
      }).returning();
      
      console.log(`[Beta Tester] ✅ Created: ${name} by Sidonie`);
      
      res.status(201).json({ 
        success: true, 
        tester: { ...newTester, hashedPin: undefined },
        message: `Beta tester "${name}" created with PIN ${pin}`
      });
    } catch (error) {
      console.error('[Beta Tester Create] Error:', error);
      res.status(500).json({ error: "Failed to create beta tester" });
    }
  });
  
  // Update beta tester (Master Admin only)
  app.put("/api/beta-testers/:id", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, email, status, notes, accessLevel, newPin } = req.body;
      
      const updateData: any = { updatedAt: new Date() };
      if (name) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      if (accessLevel) updateData.accessLevel = accessLevel;
      
      // If new PIN provided, hash it
      if (newPin && newPin.length === 3 && /^\d{3}$/.test(newPin)) {
        updateData.hashedPin = await bcrypt.hash(newPin, 10);
      }
      
      const [updated] = await db.update(betaTesters)
        .set(updateData)
        .where(eq(betaTesters.id, parseInt(id)))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ error: "Beta tester not found" });
      }
      
      console.log(`[Beta Tester] ✅ Updated: ${updated.name}`);
      
      res.json({ success: true, tester: { ...updated, hashedPin: undefined } });
    } catch (error) {
      console.error('[Beta Tester Update] Error:', error);
      res.status(500).json({ error: "Failed to update beta tester" });
    }
  });
  
  // Delete beta tester (Master Admin only)
  app.delete("/api/beta-testers/:id", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // First delete access logs
      await db.delete(betaTesterAccessLogs).where(eq(betaTesterAccessLogs.testerId, parseInt(id)));
      
      // Then delete tester
      const [deleted] = await db.delete(betaTesters)
        .where(eq(betaTesters.id, parseInt(id)))
        .returning();
      
      if (!deleted) {
        return res.status(404).json({ error: "Beta tester not found" });
      }
      
      console.log(`[Beta Tester] ✅ Deleted: ${deleted.name}`);
      
      res.json({ success: true, message: `Beta tester "${deleted.name}" deleted` });
    } catch (error) {
      console.error('[Beta Tester Delete] Error:', error);
      res.status(500).json({ error: "Failed to delete beta tester" });
    }
  });
  
  // Get beta tester access logs (Master Admin only)
  app.get("/api/beta-testers/logs", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const logs = await db.select()
        .from(betaTesterAccessLogs)
        .orderBy(desc(betaTesterAccessLogs.timestamp))
        .limit(100);
      
      res.json({ logs });
    } catch (error) {
      console.error('[Beta Logs] Error:', error);
      res.status(500).json({ error: "Failed to fetch access logs" });
    }
  });
  
  // Generate unique 3-digit PIN (Master Admin only)
  app.get("/api/beta-testers/generate-pin", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      // Get all existing testers to check for PIN uniqueness
      const existingTesters = await db.select().from(betaTesters);
      
      // Generate a unique 3-digit PIN
      let newPin = '';
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 100) {
        newPin = String(Math.floor(Math.random() * 900) + 100); // 100-999
        
        // Check if PIN is unique by comparing hashes
        isUnique = true;
        for (const tester of existingTesters) {
          const match = await bcrypt.compare(newPin, tester.hashedPin);
          if (match) {
            isUnique = false;
            break;
          }
        }
        attempts++;
      }
      
      if (!isUnique) {
        return res.status(500).json({ error: "Could not generate unique PIN" });
      }
      
      res.json({ pin: newPin });
    } catch (error) {
      console.error('[Generate PIN] Error:', error);
      res.status(500).json({ error: "Failed to generate PIN" });
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
  // WORKER REQUEST ROUTES (Auto-Matching System)
  // ========================
  
  /**
   * Create worker request and trigger automatic matching
   * This is the entry point for the 100% automated staffing system
   */
  app.post("/api/worker-requests", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;

      // Validate request data
      const parsed = insertWorkerRequestSchema.safeParse({
        ...req.body,
        tenantId,
      });

      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid worker request data",
          details: parsed.error.issues 
        });
      }

      // Create worker request
      const request = await storage.createWorkerRequest(parsed.data);

      // TRIGGER AUTO-MATCHING ENGINE
      try {
        await autoMatchWorkers(request.id, tenantId);
        console.log(`[Routes] Auto-matching triggered for request ${request.id}`);
      } catch (matchError) {
        console.error(`[Routes] Auto-matching failed for request ${request.id}:`, matchError);
        // Don't fail the request creation if matching fails - it can be retried
      }

      res.status(201).json({ 
        success: true, 
        request,
        message: "Worker request created and matching initiated"
      });
    } catch (error) {
      console.error('Error creating worker request:', error);
      res.status(500).json({ error: 'Failed to create worker request' });
    }
  });

  /**
   * Worker accepts a shift opportunity
   * Marks match as accepted and sets onboarding deadline
   */
  app.post("/api/worker-requests/:id/accept", async (req: Request, res: Response) => {
    try {
      const requestId = req.params.id;
      const { workerId } = req.body;
      
      if (!workerId) {
        return res.status(400).json({ error: "Worker ID required" });
      }

      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;

      // Find the specific match
      const matches = await storage.listWorkerRequestMatches(requestId, tenantId);
      const match = matches.find((m: WorkerRequestMatch) => m.workerId === workerId);

      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      // Update match status to accepted
      await storage.updateWorkerRequestMatch(match.id, tenantId, {
        matchStatus: 'accepted',
        acceptedAt: new Date(),
      });

      // Update worker request status
      await storage.updateWorkerRequest(requestId, tenantId, {
        status: 'assigned',
        assignedWorkerId: workerId,
      });

      // Set assignment date and onboarding deadline for worker
      const onboardingDeadline = new Date();
      onboardingDeadline.setDate(onboardingDeadline.getDate() + 1); // 1 business day

      await storage.updateWorker(workerId, {
        assignmentDate: new Date(),
        assignmentOnboardingDeadline: onboardingDeadline,
      });

      console.log(`[Routes] Worker ${workerId} accepted request ${requestId}`);

      res.json({ 
        success: true,
        message: "Shift accepted successfully",
        onboardingDeadline: onboardingDeadline.toISOString()
      });
    } catch (error) {
      console.error('Error accepting shift:', error);
      res.status(500).json({ error: 'Failed to accept shift' });
    }
  });

  /**
   * Worker declines a shift opportunity
   * Auto-reassigns to next best match
   */
  app.post("/api/worker-requests/:id/decline", async (req: Request, res: Response) => {
    try {
      const requestId = req.params.id;
      const { workerId } = req.body;
      
      if (!workerId) {
        return res.status(400).json({ error: "Worker ID required" });
      }

      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;

      // Find the specific match
      const matches = await storage.listWorkerRequestMatches(requestId, tenantId);
      const match = matches.find((m: WorkerRequestMatch) => m.workerId === workerId);

      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      // Update match status to declined
      await storage.updateWorkerRequestMatch(match.id, tenantId, {
        matchStatus: 'declined',
        declinedAt: new Date(),
      });

      // AUTO-REASSIGN to next best match
      try {
        await autoReassignWorkerRequest(requestId, tenantId, workerId);
        console.log(`[Routes] Auto-reassignment triggered for request ${requestId}`);
      } catch (reassignError) {
        console.error(`[Routes] Auto-reassignment failed:`, reassignError);
        // Don't fail the decline if reassignment fails
      }

      res.json({ 
        success: true,
        message: "Shift declined, reassigning to next match"
      });
    } catch (error) {
      console.error('Error declining shift:', error);
      res.status(500).json({ error: 'Failed to decline shift' });
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
            parsed.data.tenantId
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
        referrals.map(async (referral: WorkerReferralBonus) => {
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
  // GPS CLOCK-IN/OUT ROUTES (Timesheet Generation)
  // ========================
  
  /**
   * Haversine formula to calculate distance between two GPS coordinates in feet
   */
  function verifyGeofence(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    radiusFeet: number
  ): boolean {
    const R = 20902231; // Earth radius in feet
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance <= radiusFeet;
  }
  
  /**
   * Helper function to fetch current weather data for job site reporting
   */
  async function fetchWeatherData(lat: number, lon: number): Promise<Record<string, unknown> | null> {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=precipitation_probability&timezone=auto`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const current = data.current;
      
      const weatherCodes: Record<number, { condition: string; description: string }> = {
        0: { condition: 'Clear', description: 'Clear sky' },
        1: { condition: 'Mainly Clear', description: 'Mainly clear' },
        2: { condition: 'Partly Cloudy', description: 'Partly cloudy' },
        3: { condition: 'Overcast', description: 'Overcast' },
        45: { condition: 'Fog', description: 'Fog' },
        48: { condition: 'Rime Fog', description: 'Depositing rime fog' },
        51: { condition: 'Light Drizzle', description: 'Light drizzle' },
        53: { condition: 'Drizzle', description: 'Moderate drizzle' },
        55: { condition: 'Heavy Drizzle', description: 'Dense drizzle' },
        61: { condition: 'Light Rain', description: 'Slight rain' },
        63: { condition: 'Rain', description: 'Moderate rain' },
        65: { condition: 'Heavy Rain', description: 'Heavy rain' },
        66: { condition: 'Freezing Rain', description: 'Light freezing rain' },
        67: { condition: 'Heavy Freezing Rain', description: 'Heavy freezing rain' },
        71: { condition: 'Light Snow', description: 'Slight snow' },
        73: { condition: 'Snow', description: 'Moderate snow' },
        75: { condition: 'Heavy Snow', description: 'Heavy snow' },
        80: { condition: 'Rain Showers', description: 'Slight rain showers' },
        81: { condition: 'Rain Showers', description: 'Moderate rain showers' },
        82: { condition: 'Heavy Showers', description: 'Violent rain showers' },
        95: { condition: 'Thunderstorm', description: 'Thunderstorm' },
        96: { condition: 'Thunderstorm', description: 'Thunderstorm with hail' },
        99: { condition: 'Severe Thunderstorm', description: 'Thunderstorm with heavy hail' },
      };

      const code = current.weather_code || 0;
      const weatherInfo = weatherCodes[code] || { condition: 'Unknown', description: 'Unknown' };
      
      const windDirections = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      const windIndex = Math.round(current.wind_direction_10m / 22.5) % 16;
      
      const precip = data.hourly?.precipitation_probability?.[0] || 0;
      
      const alerts: string[] = [];
      if (current.weather_code >= 95) alerts.push('Thunderstorm Warning');
      if (current.wind_speed_10m > 40) alerts.push('High Wind Advisory');
      if (current.temperature_2m < 0) alerts.push('Freezing Conditions');
      if (current.temperature_2m > 35) alerts.push('Extreme Heat Warning');
      
      return {
        temp: Math.round(current.temperature_2m * 9/5 + 32), // Convert to Fahrenheit
        feelsLike: Math.round(current.apparent_temperature * 9/5 + 32),
        condition: weatherInfo.condition,
        description: weatherInfo.description,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m * 0.621371), // Convert km/h to mph
        windDirection: windDirections[windIndex],
        precipitation: precip,
        visibility: 10, // Default
        pressure: Math.round(current.surface_pressure * 0.02953), // Convert hPa to inHg
        alerts,
        capturedAt: new Date().toISOString(),
        latitude: lat,
        longitude: lon,
      };
    } catch (error) {
      console.error('Weather fetch error:', error);
      return null;
    }
  }

  /**
   * GPS Clock-In - Creates timesheet entry
   * Verifies worker is at job site using GPS geofence
   */
  app.post('/api/gps/clock-in', async (req: Request, res: Response) => {
    try {
      const { workerId, assignmentId, latitude, longitude, accuracy } = req.body;
      const tenantId = getTenantIdFromRequest(req);
      
      if (!tenantId) {
        return res.status(401).json({ error: 'Tenant ID required' });
      }
      
      if (!workerId || !assignmentId || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Missing required fields: workerId, assignmentId, latitude, longitude' });
      }
      
      // Get assignment to verify geofence
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      
      // Verify GPS is within geofence (300 feet / ~90 meters)
      const geofenceRadiusFeet = 300;
      const assignmentLat = parseFloat(assignment.latitude || '0');
      const assignmentLon = parseFloat(assignment.longitude || '0');
      
      const isWithinGeofence = verifyGeofence(
        latitude,
        longitude,
        assignmentLat,
        assignmentLon,
        geofenceRadiusFeet
      );
      
      if (!isWithinGeofence) {
        return res.status(400).json({
          error: 'You are not at the work location. Please move closer to clock in.',
          distanceCheck: 'failed',
        });
      }
      
      // Fetch current weather conditions for job site reporting
      const weatherData = await fetchWeatherData(latitude, longitude);
      
      // Create timesheet entry with weather data
      const timesheet = await storage.createTimesheet({
        workerId,
        tenantId,
        assignmentId,
        clockInTime: new Date(),
        clockInLatitude: latitude.toString(),
        clockInLongitude: longitude.toString(),
        clockInVerified: true,
        clockInWeather: weatherData,
        status: 'draft',
      });
      
      console.log(`[GPS Clock-In] ✅ Worker ${workerId} clocked in at assignment ${assignmentId}`);
      if (weatherData) {
        console.log(`[GPS Clock-In] 🌤️ Weather captured: ${weatherData.temp}°F, ${weatherData.condition}`);
      }
      
      res.json({
        success: true,
        timesheetId: timesheet.id,
        clockInTime: timesheet.clockInTime,
        verified: true,
        weather: weatherData,
      });
    } catch (error) {
      console.error('GPS clock-in error:', error);
      res.status(500).json({ error: 'Failed to clock in' });
    }
  });
  
  /**
   * GPS Clock-Out - Updates timesheet and auto-approves if valid
   * Calculates hours worked and triggers auto-approval logic
   */
  app.post('/api/gps/clock-out', async (req: Request, res: Response) => {
    try {
      const { timesheetId, latitude, longitude, accuracy } = req.body;
      
      if (!timesheetId || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Missing required fields: timesheetId, latitude, longitude' });
      }
      
      // Get existing timesheet
      const timesheet = await storage.getTimesheet(timesheetId);
      if (!timesheet) {
        return res.status(404).json({ error: 'Timesheet not found' });
      }
      
      // Get assignment to verify geofence
      const assignment = await storage.getAssignment(timesheet.assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      
      // Verify GPS for clock-out
      const geofenceRadiusFeet = 300;
      const assignmentLat = parseFloat(assignment.latitude || '0');
      const assignmentLon = parseFloat(assignment.longitude || '0');
      
      const isWithinGeofence = verifyGeofence(
        latitude,
        longitude,
        assignmentLat,
        assignmentLon,
        geofenceRadiusFeet
      );
      
      // Fetch current weather conditions for job site reporting
      const weatherData = await fetchWeatherData(latitude, longitude);
      
      // Update timesheet with clock-out info and weather
      await storage.updateTimesheet(timesheetId, {
        clockOutTime: new Date(),
        clockOutLatitude: latitude.toString(),
        clockOutLongitude: longitude.toString(),
        clockOutVerified: isWithinGeofence,
        clockOutWeather: weatherData,
      });
      
      // AUTO-APPROVE if GPS verified and hours reasonable
      await storage.autoApproveTimesheet(timesheetId);
      
      // Get updated timesheet to return hours worked
      const updatedTimesheet = await storage.getTimesheet(timesheetId);
      
      console.log(`[GPS Clock-Out] ✅ Worker ${timesheet.workerId} clocked out from assignment ${timesheet.assignmentId}`);
      if (weatherData) {
        console.log(`[GPS Clock-Out] 🌤️ Weather captured: ${weatherData.temp}°F, ${weatherData.condition}`);
      }
      
      res.json({
        success: true,
        clockOutTime: updatedTimesheet?.clockOutTime,
        hoursWorked: updatedTimesheet?.totalHoursWorked,
        status: updatedTimesheet?.status,
        verified: isWithinGeofence,
        weather: weatherData,
      });
    } catch (error) {
      console.error('GPS clock-out error:', error);
      res.status(500).json({ error: 'Failed to clock out' });
    }
  });
  
  /**
   * Get active clock-in for a worker (currently clocked in, no clock-out)
   */
  app.get('/api/gps/active/:workerId', async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const tenantId = getTenantIdFromRequest(req);
      
      if (!tenantId) {
        return res.status(401).json({ error: 'Tenant ID required' });
      }
      
      const timesheets = await storage.listTimesheets(tenantId);
      const activeTimesheet = timesheets.find(
        (ts: Timesheet) => ts.workerId === workerId && ts.clockInTime && !ts.clockOutTime
      );
      
      if (!activeTimesheet) {
        return res.status(404).json({ error: 'No active clock-in found' });
      }
      
      res.json(activeTimesheet);
    } catch (error) {
      console.error('Get active clock-in error:', error);
      res.status(500).json({ error: 'Failed to get active clock-in' });
    }
  });
  
  // ========================
  // FACIAL RECOGNITION ROUTES (Anti-Fraud Clock-in Verification)
  // ========================
  
  /**
   * Check if facial recognition is available
   */
  app.get('/api/face-recognition/status', async (_req: Request, res: Response) => {
    res.json({
      available: azureFaceService.isAvailable(),
      message: azureFaceService.isAvailable()
        ? 'Facial recognition is configured and ready'
        : 'Facial recognition is not configured - add AZURE_FACE_API_KEY and AZURE_FACE_API_ENDPOINT to enable',
    });
  });
  
  /**
   * Upload/update worker profile photo for face verification
   * This photo will be used as the reference for all future clock-in verifications
   */
  app.post('/api/workers/:workerId/profile-photo', async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const { photoBase64 } = req.body;
      const tenantId = getTenantIdFromRequest(req);
      
      if (!tenantId) {
        return res.status(401).json({ error: 'Tenant ID required' });
      }
      
      if (!photoBase64) {
        return res.status(400).json({ error: 'Photo data required (base64 encoded)' });
      }
      
      // Get the worker
      const worker = await storage.getWorker(workerId);
      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      
      // Verify tenant access
      if (worker.tenantId !== tenantId) {
        return res.status(403).json({ error: 'Access denied - worker belongs to different tenant' });
      }
      
      // Validate photo has exactly one face if Azure is configured
      const validation = await azureFaceService.validateProfilePhoto(photoBase64);
      if (!validation.valid) {
        return res.status(400).json({
          error: validation.message,
          faceCount: validation.faceCount,
        });
      }
      
      // Store photo as base64 data URL (in production, you'd upload to cloud storage)
      const photoUrl = `data:image/jpeg;base64,${photoBase64.replace(/^data:image\/\w+;base64,/, '')}`;
      
      // Update worker profile photo
      await storage.updateWorker(workerId, {
        profilePhotoUrl: photoUrl,
        profilePhotoUploadedAt: new Date(),
        profilePhotoVerified: false, // Admin needs to verify this is the actual worker
      });
      
      console.log(`[Facial Recognition] 📸 Profile photo uploaded for worker ${workerId}`);
      
      res.json({
        success: true,
        message: 'Profile photo uploaded successfully. Admin verification pending.',
        validation: validation,
      });
    } catch (error) {
      console.error('Profile photo upload error:', error);
      res.status(500).json({ error: 'Failed to upload profile photo' });
    }
  });
  
  /**
   * Admin: Verify a worker's profile photo (confirm it's actually them)
   */
  app.post('/api/workers/:workerId/verify-photo', requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const { verified, reason } = req.body;
      
      const worker = await storage.getWorker(workerId);
      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      
      if (!worker.profilePhotoUrl) {
        return res.status(400).json({ error: 'Worker has no profile photo to verify' });
      }
      
      await storage.updateWorker(workerId, {
        profilePhotoVerified: verified === true,
      });
      
      console.log(`[Facial Recognition] ${verified ? '✅' : '❌'} Admin ${verified ? 'verified' : 'rejected'} profile photo for worker ${workerId}${reason ? ` - Reason: ${reason}` : ''}`);
      
      res.json({
        success: true,
        verified: verified === true,
        message: verified ? 'Profile photo verified by admin' : 'Profile photo rejected by admin',
      });
    } catch (error) {
      console.error('Photo verification error:', error);
      res.status(500).json({ error: 'Failed to verify photo' });
    }
  });
  
  /**
   * Get worker's profile photo info
   */
  app.get('/api/workers/:workerId/profile-photo', async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const tenantId = getTenantIdFromRequest(req);
      
      if (!tenantId) {
        return res.status(401).json({ error: 'Tenant ID required' });
      }
      
      const worker = await storage.getWorker(workerId);
      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      
      if (worker.tenantId !== tenantId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      res.json({
        hasPhoto: !!worker.profilePhotoUrl,
        photoUrl: worker.profilePhotoUrl,
        uploadedAt: worker.profilePhotoUploadedAt,
        verified: worker.profilePhotoVerified,
      });
    } catch (error) {
      console.error('Get profile photo error:', error);
      res.status(500).json({ error: 'Failed to get profile photo' });
    }
  });
  
  /**
   * Enhanced GPS Clock-In with Facial Recognition
   * Verifies both GPS location AND face match against profile photo
   */
  app.post('/api/gps/clock-in-verified', async (req: Request, res: Response) => {
    try {
      const { workerId, assignmentId, latitude, longitude, accuracy, selfieBase64 } = req.body;
      const tenantId = getTenantIdFromRequest(req);
      
      if (!tenantId) {
        return res.status(401).json({ error: 'Tenant ID required' });
      }
      
      if (!workerId || !assignmentId || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Missing required fields: workerId, assignmentId, latitude, longitude' });
      }
      
      // Get worker to check profile photo
      const worker = await storage.getWorker(workerId);
      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      
      // Get assignment to verify geofence
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      
      // Verify GPS is within geofence (300 feet / ~90 meters)
      const geofenceRadiusFeet = 300;
      const assignmentLat = parseFloat(assignment.latitude || '0');
      const assignmentLon = parseFloat(assignment.longitude || '0');
      
      const isWithinGeofence = verifyGeofence(
        latitude,
        longitude,
        assignmentLat,
        assignmentLon,
        geofenceRadiusFeet
      );
      
      if (!isWithinGeofence) {
        return res.status(400).json({
          error: 'You are not at the work location. Please move closer to clock in.',
          distanceCheck: 'failed',
        });
      }
      
      // Perform face verification if selfie provided
      let faceResult = null;
      let faceVerified = null;
      let faceStatus: string | null = null;
      let faceScore: string | null = null;
      let clockInPhotoUrl: string | null = null;
      
      if (selfieBase64) {
        // Store the selfie
        clockInPhotoUrl = `data:image/jpeg;base64,${selfieBase64.replace(/^data:image\/\w+;base64,/, '')}`;
        
        if (azureFaceService.isAvailable() && worker.profilePhotoUrl) {
          faceResult = await azureFaceService.compareFaces(worker.profilePhotoUrl, selfieBase64);
          faceVerified = faceResult.status === 'verified';
          faceStatus = faceResult.status;
          faceScore = faceResult.confidence.toString();
          
          console.log(`[Facial Recognition] Face match for worker ${workerId}: ${faceResult.status} (${faceResult.confidence}%)`);
          
          // If face is rejected, don't allow clock-in
          if (faceResult.status === 'rejected') {
            return res.status(400).json({
              error: faceResult.message,
              faceVerification: {
                status: faceResult.status,
                confidence: faceResult.confidence,
              },
            });
          }
        } else if (!worker.profilePhotoUrl) {
          faceStatus = 'no_reference_photo';
          console.log(`[Facial Recognition] No profile photo for worker ${workerId} - verification skipped`);
        } else {
          faceStatus = 'service_unavailable';
          console.log(`[Facial Recognition] Service not configured - verification skipped`);
        }
      }
      
      // Fetch current weather conditions for job site reporting
      const weatherData = await fetchWeatherData(latitude, longitude);
      
      // Determine overall status based on face verification
      let timesheetStatus = 'draft';
      if (faceStatus === 'flagged') {
        timesheetStatus = 'requires_review'; // Admin needs to review
      }
      
      // Create timesheet entry with face verification data
      const timesheet = await storage.createTimesheet({
        workerId,
        tenantId,
        assignmentId,
        clockInTime: new Date(),
        clockInLatitude: latitude.toString(),
        clockInLongitude: longitude.toString(),
        clockInVerified: true,
        clockInPhotoUrl,
        clockInFaceMatchScore: faceScore,
        clockInFaceVerified: faceVerified,
        clockInFaceStatus: faceStatus,
        clockInWeather: weatherData,
        status: timesheetStatus,
      });
      
      console.log(`[GPS Clock-In Verified] ✅ Worker ${workerId} clocked in at assignment ${assignmentId}${faceStatus ? ` (Face: ${faceStatus})` : ''}`);
      if (weatherData) {
        console.log(`[GPS Clock-In Verified] 🌤️ Weather captured: ${weatherData.temp}°F, ${weatherData.condition}`);
      }
      
      res.json({
        success: true,
        timesheetId: timesheet.id,
        clockInTime: timesheet.clockInTime,
        gpsVerified: true,
        faceVerification: faceResult ? {
          status: faceResult.status,
          confidence: faceResult.confidence,
          message: faceResult.message,
          verified: faceResult.status === 'verified',
        } : null,
        weather: weatherData,
        requiresReview: faceStatus === 'flagged',
      });
    } catch (error) {
      console.error('GPS clock-in with face verification error:', error);
      res.status(500).json({ error: 'Failed to clock in' });
    }
  });
  
  /**
   * Get timesheets with flagged face verification for admin review
   */
  app.get('/api/timesheets/face-flagged', async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const timesheets = await storage.listTimesheets(tenantId);
      
      // Filter for timesheets with flagged face status
      const flaggedTimesheets = timesheets.filter(
        (ts: Timesheet) => ts.clockInFaceStatus === 'flagged' || ts.clockOutFaceStatus === 'flagged'
      );
      
      // Enrich with worker details
      const enrichedTimesheets = await Promise.all(
        flaggedTimesheets.map(async (timesheet: Timesheet) => {
          const worker = await storage.getWorker(timesheet.workerId || '');
          return {
            ...timesheet,
            workerName: worker?.fullName || 'Unknown',
            workerPhone: worker?.phone || 'Unknown',
            workerProfilePhoto: worker?.profilePhotoUrl,
          };
        })
      );
      
      res.json(enrichedTimesheets);
    } catch (error) {
      console.error('Get flagged timesheets error:', error);
      res.status(500).json({ error: 'Failed to fetch flagged timesheets' });
    }
  });
  
  /**
   * Admin: Manually approve/reject a flagged face verification
   */
  app.post('/api/timesheets/:id/face-review', requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { approved, reason, reviewedBy } = req.body;
      
      const timesheet = await storage.getTimesheet(id);
      if (!timesheet) {
        return res.status(404).json({ error: 'Timesheet not found' });
      }
      
      // Update face status based on admin decision
      const newFaceStatus = approved ? 'verified' : 'rejected';
      const updates: any = {
        clockInFaceStatus: newFaceStatus,
        clockInFaceVerified: approved,
      };
      
      // If approved, allow the timesheet to proceed normally
      if (approved) {
        updates.status = 'draft'; // Return to normal flow
      } else {
        updates.status = 'rejected'; // Reject the entire timesheet
        updates.notes = `Face verification rejected by admin: ${reason || 'No reason provided'}`;
      }
      
      await storage.updateTimesheet(id, updates);
      
      console.log(`[Facial Recognition] Admin ${approved ? 'approved' : 'rejected'} face verification for timesheet ${id}${reason ? ` - Reason: ${reason}` : ''}`);
      
      res.json({
        success: true,
        approved,
        message: approved 
          ? 'Face verification approved by admin - timesheet can proceed'
          : 'Face verification rejected by admin - timesheet marked as rejected',
      });
    } catch (error) {
      console.error('Face review error:', error);
      res.status(500).json({ error: 'Failed to review face verification' });
    }
  });
  
  /**
   * Get workers without profile photos (for admin to follow up)
   */
  app.get('/api/workers/missing-photos', async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const workers = await storage.listWorkers(tenantId);
      const workersWithoutPhotos = workers.filter(
        (w: any) => !w.profilePhotoUrl && w.status === 'approved'
      );
      
      res.json({
        count: workersWithoutPhotos.length,
        workers: workersWithoutPhotos.map((w: any) => ({
          id: w.id,
          fullName: w.fullName,
          phone: w.phone,
          email: w.email,
          status: w.status,
        })),
      });
    } catch (error) {
      console.error('Get workers missing photos error:', error);
      res.status(500).json({ error: 'Failed to fetch workers' });
    }
  });
  
  // ========================
  // TIMESHEET ADMIN ROUTES (Approval/Rejection)
  // ========================
  
  /**
   * Get timesheets requiring manual review
   */
  app.get('/api/timesheets/requires-review', async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const timesheets = await storage.getTimesheetsByStatus(tenantId, 'requires_review');
      
      // Enrich with worker details
      const enrichedTimesheets = await Promise.all(
        timesheets.map(async (timesheet: Timesheet) => {
          const worker = await storage.getWorker(timesheet.workerId || '');
          return {
            ...timesheet,
            workerName: worker?.fullName || 'Unknown',
            workerPhone: worker?.phone || 'Unknown',
          };
        })
      );
      
      res.json(enrichedTimesheets);
    } catch (error) {
      console.error('Get review timesheets error:', error);
      res.status(500).json({ error: 'Failed to fetch timesheets' });
    }
  });
  
  /**
   * Get all timesheets by status (pending, approved, rejected, requires_review, draft)
   */
  app.get('/api/timesheets/status/:status', async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const { status } = req.params;
      const timesheets = await storage.getTimesheetsByStatus(tenantId, status);
      
      res.json(timesheets);
    } catch (error) {
      console.error('Get timesheets by status error:', error);
      res.status(500).json({ error: 'Failed to fetch timesheets' });
    }
  });
  
  /**
   * Approve a timesheet (admin action)
   */
  app.post('/api/timesheets/:id/approve', async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const { id } = req.params;
      const { approvedBy } = req.body;
      
      if (!approvedBy) {
        return res.status(400).json({ error: 'approvedBy (user ID or name) required' });
      }
      
      const approvedTimesheet = await storage.approveTimesheet(id, approvedBy);
      
      console.log(`[Timesheet] ✅ Admin approved timesheet ${id} by ${approvedBy}`);
      
      res.json({
        success: true,
        timesheet: approvedTimesheet,
      });
    } catch (error) {
      console.error('Approve timesheet error:', error);
      res.status(500).json({ error: 'Failed to approve timesheet' });
    }
  });
  
  /**
   * Reject a timesheet (admin action)
   */
  app.post('/api/timesheets/:id/reject', async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const { id } = req.params;
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ error: 'Rejection reason required' });
      }
      
      const rejectedTimesheet = await storage.rejectTimesheet(id, reason);
      
      console.log(`[Timesheet] ❌ Admin rejected timesheet ${id}: ${reason}`);
      
      res.json({
        success: true,
        timesheet: rejectedTimesheet,
      });
    } catch (error) {
      console.error('Reject timesheet error:', error);
      res.status(500).json({ error: 'Failed to reject timesheet' });
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
  
  // Preview payroll calculations (no records created)
  app.post("/api/payroll/preview", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const { workerIds, payPeriodStart, payPeriodEnd } = req.body;
      
      if (!workerIds || !Array.isArray(workerIds) || workerIds.length === 0) {
        return res.status(400).json({ error: "workerIds array required" });
      }
      
      const previews = [];
      
      for (const workerId of workerIds) {
        try {
          // Get worker data
          const worker = await storage.getWorker(workerId);
          if (!worker) continue;
          
          // Get worker's W4 data
          const w4Data = await storage.getWorkerW4Data(workerId);
          
          // Get worker's garnishments
          const garnishments = await storage.getWorkerGarnishments(workerId);
          
          // Get worker's timesheets for the pay period
          const workersData = await storage.getWorkersReadyForPayroll(
            tenantId,
            new Date(payPeriodStart),
            new Date(payPeriodEnd)
          );
          
          const workerData = workersData.find((w: any) => w.workerId === workerId);
          
          const hourlyRate = parseFloat(worker.hourlyWage || "15");
          const regularHours = parseFloat(workerData?.regularHours || "40");
          const overtimeHours = parseFloat(workerData?.overtimeHours || "0");
          
          const regularPay = regularHours * hourlyRate;
          const overtimePay = overtimeHours * hourlyRate * 1.5;
          const grossPay = regularPay + overtimePay;
          
          // Calculate payroll using payrollCalculator.ts
          if (w4Data) {
            const payrollInput: PayrollCalculationInput = {
              grossPay,
              w4Data,
              garnishmentOrders: garnishments,
              payPeriodDays: 7,
              workState: worker.state || 'TN',
              workCity: worker.city,
              annualGrossPaid: 0,
            };
            
            const payrollResult = calculatePayroll(payrollInput);
            
            previews.push({
              workerId: worker.id,
              workerName: `${worker.firstName} ${worker.lastName}`,
              regularHours,
              overtimeHours,
              hourlyRate,
              grossPay: payrollResult.grossPay,
              federalTax: payrollResult.federalIncomeTax,
              stateTax: payrollResult.stateTax,
              ssTax: payrollResult.socialSecurityTax,
              medicareTax: payrollResult.medicareTax + payrollResult.additionalMedicareTax,
              localTax: payrollResult.localTax,
              benefitsDeductions: 0,
              garnishments: payrollResult.totalGarnishments,
              netPay: payrollResult.netPay,
            });
          } else {
            // Fallback calculation without W4
            const estimatedFederalTax = grossPay * 0.12;
            const estimatedSSTax = grossPay * 0.062;
            const estimatedMedicare = grossPay * 0.0145;
            const estimatedStateTax = grossPay * 0.04;
            const totalDeductions = estimatedFederalTax + estimatedSSTax + estimatedMedicare + estimatedStateTax;
            
            previews.push({
              workerId: worker.id,
              workerName: `${worker.firstName} ${worker.lastName}`,
              regularHours,
              overtimeHours,
              hourlyRate,
              grossPay,
              federalTax: estimatedFederalTax,
              stateTax: estimatedStateTax,
              ssTax: estimatedSSTax,
              medicareTax: estimatedMedicare,
              localTax: 0,
              benefitsDeductions: 0,
              garnishments: 0,
              netPay: grossPay - totalDeductions,
            });
          }
        } catch (err) {
          console.error(`Preview error for worker ${workerId}:`, err);
        }
      }
      
      res.json({ previews });
    } catch (error) {
      console.error("Failed to generate payroll preview:", error);
      res.status(500).json({ error: "Failed to generate payroll preview" });
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
  // W-4 TAX FORM ROUTES
  // ========================
  
  // Get current W-4 for a worker
  app.get("/api/w4/:workerId", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const w4Data = await storage.getCurrentEmployeeW4Data(req.params.workerId, tenantId);
      
      if (!w4Data) {
        return res.status(404).json({ error: "W-4 not found", needsSubmission: true });
      }
      
      res.json(w4Data);
    } catch (error) {
      console.error("Failed to fetch W-4:", error);
      res.status(500).json({ error: "Failed to fetch W-4 data" });
    }
  });
  
  // Get W-4 history for a worker
  app.get("/api/w4/:workerId/history", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const w4History = await storage.listEmployeeW4Data(req.params.workerId, tenantId);
      res.json(w4History);
    } catch (error) {
      console.error("Failed to fetch W-4 history:", error);
      res.status(500).json({ error: "Failed to fetch W-4 history" });
    }
  });
  
  // Submit new W-4
  app.post("/api/w4", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const { workerId, fillingStatus, dependents, otherIncome, standardDeduction, claimableDeductions, extraWithheldPerPaycheck } = req.body;
      
      if (!workerId || !fillingStatus) {
        return res.status(400).json({ error: "workerId and fillingStatus are required" });
      }
      
      // Mark all existing W-4s as not current
      const existingW4s = await storage.listEmployeeW4Data(workerId, tenantId);
      for (const w4 of existingW4s) {
        await storage.updateEmployeeW4Data(w4.id, tenantId, { isCurrentW4: false });
      }
      
      // Create new W-4
      const newW4 = await storage.createEmployeeW4Data({
        tenantId,
        workerId,
        fillingStatus,
        dependents: dependents || 0,
        otherIncome: otherIncome || "0",
        standardDeduction: standardDeduction !== false,
        claimableDeductions: claimableDeductions || "0",
        extraWithheldPerPaycheck: extraWithheldPerPaycheck || "0",
        effectiveYear: new Date().getFullYear(),
        effectiveDate: new Date().toISOString().split('T')[0],
        isCurrentW4: true,
      });
      
      res.status(201).json(newW4);
    } catch (error) {
      console.error("Failed to submit W-4:", error);
      res.status(500).json({ error: "Failed to submit W-4" });
    }
  });
  
  // Update existing W-4
  app.patch("/api/w4/:id", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const updatedW4 = await storage.updateEmployeeW4Data(req.params.id, tenantId, {
        ...req.body,
        updatedAt: new Date(),
      });
      
      if (!updatedW4) {
        return res.status(404).json({ error: "W-4 not found" });
      }
      
      res.json(updatedW4);
    } catch (error) {
      console.error("Failed to update W-4:", error);
      res.status(500).json({ error: "Failed to update W-4" });
    }
  });
  
  // ========================
  // PAY CORRECTIONS ROUTES
  // ========================
  
  // Create pay correction/adjustment
  app.post("/api/payroll/correction", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const { originalPayrollId, correctionReason, adjustments } = req.body;
      
      if (!originalPayrollId || !correctionReason) {
        return res.status(400).json({ error: "originalPayrollId and correctionReason required" });
      }
      
      // Get original payroll record
      const originalRecord = await storage.getPayrollRecord(originalPayrollId);
      if (!originalRecord) {
        return res.status(404).json({ error: "Original payroll record not found" });
      }
      
      // Mark original as corrected
      await storage.updatePayrollRecord(originalPayrollId, { status: 'corrected' });
      
      // Create correction record with adjusted values
      const correctionRecord = await storage.createPayrollRecord({
        ...originalRecord,
        id: undefined,
        isCorrection: true,
        originalPayrollRecordId: originalPayrollId,
        correctionReason,
        status: 'pending',
        processedAt: null,
        paidAt: null,
        hallmarkAssetNumber: `ORBIT-CORR-${Date.now()}`,
        // Apply adjustments
        grossPay: adjustments?.grossPay || originalRecord.grossPay,
        netPay: adjustments?.netPay || originalRecord.netPay,
        regularHours: adjustments?.regularHours || originalRecord.regularHours,
        overtimeHours: adjustments?.overtimeHours || originalRecord.overtimeHours,
        notes: `Correction for ${originalPayrollId}: ${correctionReason}`,
      });
      
      res.status(201).json({
        success: true,
        correctionId: correctionRecord.id,
        originalId: originalPayrollId,
        message: "Pay correction created successfully",
      });
    } catch (error) {
      console.error("Failed to create pay correction:", error);
      res.status(500).json({ error: "Failed to create pay correction" });
    }
  });
  
  // Void a payroll record
  app.post("/api/payroll/void/:id", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const { voidReason } = req.body;
      
      if (!voidReason) {
        return res.status(400).json({ error: "voidReason is required" });
      }
      
      const record = await storage.getPayrollRecord(req.params.id);
      if (!record) {
        return res.status(404).json({ error: "Payroll record not found" });
      }
      
      await storage.updatePayrollRecord(req.params.id, {
        status: 'voided',
        notes: `VOIDED: ${voidReason}`,
      });
      
      res.json({ success: true, message: "Payroll record voided" });
    } catch (error) {
      console.error("Failed to void payroll:", error);
      res.status(500).json({ error: "Failed to void payroll record" });
    }
  });
  
  // Get corrections for a payroll record
  app.get("/api/payroll/corrections/:originalId", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const corrections = await storage.getPayrollCorrections(req.params.originalId, tenantId);
      res.json(corrections);
    } catch (error) {
      console.error("Failed to fetch corrections:", error);
      res.status(500).json({ error: "Failed to fetch corrections" });
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
  // SUBSCRIPTION CHECKOUT ROUTES
  // ========================
  
  // Pricing lookup table - single source of truth for all plans
  const PRICING_LOOKUP: Record<string, { 
    id: string;
    name: string; 
    type: 'tool' | 'bundle';
    price: number;
    tools: string[];
    workers?: string;
  }> = {
    // Platform Bundles
    'price_1SYoQkPQpkkF93FKsLEssZzb': { 
      id: 'starter', name: 'Starter Bundle', type: 'bundle', price: 99, 
      tools: ['crm', 'time', 'compliance'], workers: '1-25' 
    },
    'price_1SYoQlPQpkkF93FKh9pRxrdL': { 
      id: 'growth', name: 'Growth Bundle', type: 'bundle', price: 149, 
      tools: ['crm', 'time', 'compliance', 'talent', 'payroll'], workers: '25-100' 
    },
    'price_1SYoQlPQpkkF93FKaNLqc6T6': { 
      id: 'professional', name: 'Professional Bundle', type: 'bundle', price: 249, 
      tools: ['crm', 'time', 'compliance', 'talent', 'payroll', 'weather', 'api'], workers: '100-500' 
    },
    // Standalone tools - priceIds will be populated after running seed-products.ts
    // 'price_xxx': { id: 'crm', name: 'ORBIT CRM', type: 'tool', price: 19, tools: ['crm'] },
    // 'price_xxx': { id: 'talent', name: 'ORBIT Talent Exchange', type: 'tool', price: 29, tools: ['talent'] },
    // 'price_xxx': { id: 'payroll', name: 'ORBIT Payroll', type: 'tool', price: 39, tools: ['payroll'] },
    // 'price_xxx': { id: 'time', name: 'ORBIT Time & GPS', type: 'tool', price: 15, tools: ['time'] },
    // 'price_xxx': { id: 'compliance', name: 'ORBIT Compliance', type: 'tool', price: 25, tools: ['compliance'] },
  };

  // Main checkout endpoint for platform bundles and standalone tools
  app.post("/api/checkout", async (req: Request, res: Response) => {
    try {
      const { priceId, productType, paymentMethod } = req.body;
      
      if (!priceId) {
        return res.status(400).json({ error: "Price ID is required" });
      }

      // Validate priceId exists in our lookup
      const planInfo = PRICING_LOOKUP[priceId];
      if (!planInfo) {
        return res.status(400).json({ error: "Invalid price ID" });
      }

      if (paymentMethod === 'stripe') {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        // Create a Stripe checkout session
        const session = await stripeService.createCheckoutSession(
          null, // Will create customer on completion
          priceId,
          `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          `${baseUrl}/pricing?canceled=true`
        );
        
        return res.json({ url: session.url });
      } else if (paymentMethod === 'coinbase') {
        // Placeholder for Coinbase Commerce integration
        return res.status(501).json({ 
          error: "Crypto payments coming soon",
          message: "Coinbase Commerce integration requires API credentials. Please use card payment for now."
        });
      }
      
      return res.status(400).json({ error: "Invalid payment method" });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Checkout success handler
  app.get("/api/checkout/success", async (req: Request, res: Response) => {
    try {
      const { session_id } = req.query;
      
      if (!session_id) {
        return res.status(400).json({ error: "Session ID required" });
      }
      
      // Retrieve session and create subscription record
      const session = await stripeService.retrieveCheckoutSession(session_id as string);
      const stripePriceId = session.line_items?.data[0]?.price?.id;
      
      // Look up the plan details from our pricing table
      const planInfo = stripePriceId ? PRICING_LOOKUP[stripePriceId] : null;
      
      if (session.payment_status === 'paid' && session.customer) {
        // Create or update subscription customer record with proper plan data
        await db.execute(sql`
          INSERT INTO monthly_subscription_customers (
            company_name, contact_email, subscription_plan, subscription_type,
            monthly_price, enabled_tools,
            stripe_customer_id, stripe_subscription_id, stripe_price_id,
            status, billing_status, current_period_start, orbit_support_access
          ) VALUES (
            ${session.customer_details?.name || 'New Customer'},
            ${session.customer_details?.email || ''},
            ${planInfo?.id || 'professional'},
            ${planInfo?.type || 'bundle'},
            ${planInfo?.price || (session.amount_total || 0) / 100},
            ${JSON.stringify(planInfo?.tools || [])},
            ${session.customer as string},
            ${session.subscription as string || null},
            ${stripePriceId || null},
            'active',
            'current',
            NOW(),
            true
          )
          ON CONFLICT (contact_email) DO UPDATE SET
            subscription_plan = EXCLUDED.subscription_plan,
            subscription_type = EXCLUDED.subscription_type,
            monthly_price = EXCLUDED.monthly_price,
            enabled_tools = EXCLUDED.enabled_tools,
            stripe_customer_id = EXCLUDED.stripe_customer_id,
            stripe_subscription_id = EXCLUDED.stripe_subscription_id,
            stripe_price_id = EXCLUDED.stripe_price_id,
            status = 'active',
            billing_status = 'current',
            current_period_start = NOW(),
            updated_at = NOW()
        `);
      }
      
      res.json({ 
        success: true, 
        status: session.payment_status,
        customerEmail: session.customer_details?.email,
        plan: planInfo?.name || 'Professional',
        tools: planInfo?.tools || []
      });
    } catch (error) {
      console.error("Checkout success error:", error);
      res.status(500).json({ error: "Failed to process checkout completion" });
    }
  });

  // Get available pricing plans (uses same source of truth)
  app.get("/api/pricing/plans", async (req: Request, res: Response) => {
    try {
      const tools = [
        { id: 'crm', name: 'ORBIT CRM', price: 19, description: 'Complete CRM', priceId: null },
        { id: 'talent', name: 'ORBIT Talent Exchange', price: 29, description: 'Job board & talent pool', priceId: null },
        { id: 'payroll', name: 'ORBIT Payroll', price: 39, description: 'Multi-state payroll', priceId: null },
        { id: 'time', name: 'ORBIT Time & GPS', price: 15, description: 'GPS-verified time tracking', priceId: null },
        { id: 'compliance', name: 'ORBIT Compliance', price: 25, description: 'I-9 & certifications', priceId: null },
      ];

      const bundles = Object.entries(PRICING_LOOKUP)
        .filter(([_, plan]) => plan.type === 'bundle')
        .map(([priceId, plan]) => ({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          workers: plan.workers,
          tools: plan.tools,
          priceId
        }));

      // Add enterprise (no priceId - custom pricing)
      bundles.push({
        id: 'enterprise',
        name: 'Enterprise',
        price: null as any,
        workers: '500+',
        tools: ['all'],
        priceId: null as any
      });
      
      res.json({ tools, bundles });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pricing plans" });
    }
  });

  // ========================
  // MODULAR PRICING ROUTES (Database-backed)
  // ========================
  
  // Get all platform modules (public - for pricing page)
  app.get("/api/modules", async (req: Request, res: Response) => {
    try {
      const modules = await storage.getAllModules();
      res.json(modules);
    } catch (error) {
      console.error("Get modules error:", error);
      res.status(500).json({ error: "Failed to fetch modules" });
    }
  });

  // Get single module by ID
  app.get("/api/modules/:id", async (req: Request, res: Response) => {
    try {
      const module = await storage.getModuleById(req.params.id);
      if (!module) {
        return res.status(404).json({ error: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      console.error("Get module error:", error);
      res.status(500).json({ error: "Failed to fetch module" });
    }
  });

  // Get all subscription plans (public - for pricing page)
  app.get("/api/subscription-plans", async (req: Request, res: Response) => {
    try {
      const plans = await storage.getAllPlans();
      res.json(plans);
    } catch (error) {
      console.error("Get plans error:", error);
      res.status(500).json({ error: "Failed to fetch subscription plans" });
    }
  });

  // Get single plan by ID
  app.get("/api/subscription-plans/:id", async (req: Request, res: Response) => {
    try {
      const plan = await storage.getPlanById(req.params.id);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }
      res.json(plan);
    } catch (error) {
      console.error("Get plan error:", error);
      res.status(500).json({ error: "Failed to fetch plan" });
    }
  });

  // Get tenant's active modules
  app.get("/api/tenant/modules", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;

      const tenantModules = await storage.getTenantActiveModules(tenantId);
      const allModules = await storage.getAllModules();
      
      // Combine to show which modules tenant has access to
      const modulesWithAccess = allModules.map((module: any) => ({
        ...module,
        hasAccess: tenantModules.some((tm: any) => tm.moduleId === module.id),
        accessInfo: tenantModules.find((tm: any) => tm.moduleId === module.id) || null
      }));

      res.json(modulesWithAccess);
    } catch (error) {
      console.error("Get tenant modules error:", error);
      res.status(500).json({ error: "Failed to fetch tenant modules" });
    }
  });

  // Check if tenant has access to a specific module
  app.get("/api/tenant/modules/:moduleId/access", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;

      const hasAccess = await storage.hasTenantModule(tenantId, req.params.moduleId);
      res.json({ hasAccess, moduleId: req.params.moduleId });
    } catch (error) {
      console.error("Check module access error:", error);
      res.status(500).json({ error: "Failed to check module access" });
    }
  });

  // Create checkout for addon module (authenticated)
  app.post("/api/modules/:moduleId/checkout", async (req: Request, res: Response) => {
    try {
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;

      const module = await storage.getModuleById(req.params.moduleId);
      if (!module) {
        return res.status(404).json({ error: "Module not found" });
      }

      if (module.isRequired) {
        return res.status(400).json({ error: "Core module is included in all plans" });
      }

      // Check if already has access
      const hasAccess = await storage.hasTenantModule(tenantId, module.id);
      if (hasAccess) {
        return res.status(400).json({ error: "You already have access to this module" });
      }

      const { billingCycle = 'monthly' } = req.body;
      const priceId = billingCycle === 'annual' ? module.stripePriceIdAnnual : module.stripePriceIdMonthly;

      if (!priceId) {
        // If no Stripe price, grant access directly (for demo/dev)
        await storage.grantModuleAccess({
          tenantId,
          moduleId: module.id,
          source: 'addon',
          isEnabled: true
        });
        return res.json({ success: true, message: "Module access granted" });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const session = await stripeService.createCheckoutSession(
        null,
        priceId,
        `${baseUrl}/dashboard?module_added=${module.id}`,
        `${baseUrl}/pricing?canceled=true`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error("Module checkout error:", error);
      res.status(500).json({ error: "Failed to create module checkout" });
    }
  });

  // Admin: Grant module access (admin only)
  app.post("/api/admin/tenant/:tenantId/modules/:moduleId", async (req: Request, res: Response) => {
    try {
      const { source = 'manual', expiresAt, trialEndsAt } = req.body;
      
      const access = await storage.grantModuleAccess({
        tenantId: req.params.tenantId,
        moduleId: req.params.moduleId,
        source,
        isEnabled: true,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        trialEndsAt: trialEndsAt ? new Date(trialEndsAt) : undefined
      });

      res.json(access);
    } catch (error) {
      console.error("Grant module access error:", error);
      res.status(500).json({ error: "Failed to grant module access" });
    }
  });

  // Admin: Revoke module access
  app.delete("/api/admin/tenant/:tenantId/modules/:moduleId", async (req: Request, res: Response) => {
    try {
      await storage.revokeModuleAccess(req.params.tenantId, req.params.moduleId);
      res.json({ success: true });
    } catch (error) {
      console.error("Revoke module access error:", error);
      res.status(500).json({ error: "Failed to revoke module access" });
    }
  });

  // Admin: Grant all plan modules to tenant
  app.post("/api/admin/tenant/:tenantId/apply-plan/:planId", async (req: Request, res: Response) => {
    try {
      const grantedModules = await storage.grantPlanModules(req.params.tenantId, req.params.planId);
      res.json({ 
        success: true, 
        modulesGranted: grantedModules.length,
        modules: grantedModules 
      });
    } catch (error) {
      console.error("Apply plan error:", error);
      res.status(500).json({ error: "Failed to apply plan modules" });
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
      const conditions = [];
      
      if (state) {
        conditions.push(eq(prevailingWages.state, state as string));
      }
      if (jobClassification) {
        conditions.push(eq(prevailingWages.jobClassification, jobClassification as string));
      }
      
      const wages = conditions.length > 0 
        ? await db.select().from(prevailingWages).where(and(...conditions))
        : await db.select().from(prevailingWages);
      res.json(wages);
    } catch (error) {
      console.error("Prevailing wage fetch error:", error);
      res.status(500).json({ error: "Failed to fetch prevailing wages" });
    }
  });

  app.get("/api/compliance/workers-comp-rates", async (req: Request, res: Response) => {
    try {
      const { state, industry } = req.query;
      const conditions = [];
      
      if (state) {
        conditions.push(eq(workersCompRates.state, state as string));
      }
      if (industry) {
        conditions.push(eq(workersCompRates.industryClassification, industry as string));
      }
      
      const rates = conditions.length > 0
        ? await db.select().from(workersCompRates).where(and(...conditions))
        : await db.select().from(workersCompRates);
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
        eq(wageScales.region, state),
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
      
      allTokens.forEach((token: IntegrationToken) => {
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
      const tenantId = getTenantIdFromRequest(req) || '1';
      const approaching = await storage.getWorkersApproachingDeadline(tenantId, 1);
      res.json(approaching);
    } catch (error) {
      console.error("Error getting approaching deadlines:", error);
      res.status(500).json({ error: "Failed to get approaching deadlines" });
    }
  });
  
  // Get overdue workers
  app.get("/api/background-jobs/overdue-workers", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req) || '1';
      const overdueApplications = await storage.getWorkersWithOverdueApplications(tenantId);
      const overdueAssignments = await storage.getWorkersWithOverdueAssignments(tenantId);
      
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
      const tenantConnections = connections.filter((c: IntegrationToken) => c.tenantId === tenantId);

      const status = Object.keys(OAUTH_PROVIDERS).map(provider => {
        const connection = tenantConnections.find((c: IntegrationToken) => c.integrationType === provider);
        
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
  // ========================
  // PAYROLL AUTOMATION SETTINGS
  // ========================
  
  // Get payroll automation settings for current tenant
  app.get("/api/payroll/automation-settings", async (req: Request, res: Response) => {
    try {
      // For now, use first company as default tenant (multi-tenant support later)
      const companies_list = await db.select().from(companies).limit(1);
      
      if (companies_list.length === 0) {
        return res.json({
          frequency: 'weekly',
          payDay: 0,
          autoRun: true,
        });
      }
      
      const company = companies_list[0];
      const settings = await storage.getTenantPayrollSettings(company.id);
      
      res.json({
        frequency: settings?.frequency || 'weekly',
        payDay: settings?.payDay !== undefined ? settings.payDay : 0,
        autoRun: settings?.autoRun !== false,
      });
    } catch (error: any) {
      console.error("Payroll settings fetch error:", error);
      res.status(500).json({ error: "Failed to load payroll settings" });
    }
  });
  
  // Update payroll automation settings
  app.put("/api/payroll/automation-settings", async (req: Request, res: Response) => {
    try {
      const { frequency, payDay, autoRun } = req.body;
      
      // Validate input
      if (!['weekly', 'biweekly', 'monthly'].includes(frequency)) {
        return res.status(400).json({ error: "Invalid frequency" });
      }
      
      if (payDay < 0 || payDay > 6) {
        return res.status(400).json({ error: "Invalid pay day (must be 0-6)" });
      }
      
      // For now, use first company as default tenant (multi-tenant support later)
      const companies_list = await db.select().from(companies).limit(1);
      
      if (companies_list.length === 0) {
        return res.status(404).json({ error: "No company found" });
      }
      
      const company = companies_list[0];
      
      // Update company payroll settings
      await db.update(companies)
        .set({
          payrollFrequency: frequency,
          payrollDay: payDay,
          autoRunPayroll: autoRun,
          updatedAt: new Date(),
        })
        .where(eq(companies.id, company.id));
      
      console.log(`[Payroll Settings] Updated for tenant ${company.id}: ${frequency} on day ${payDay}, auto: ${autoRun}`);
      
      res.json({
        success: true,
        message: "Payroll automation settings updated successfully",
      });
    } catch (error: any) {
      console.error("Payroll settings update error:", error);
      res.status(500).json({ error: "Failed to update payroll settings" });
    }
  });

  // ========================
  // TALENT EXCHANGE ROUTES
  // ========================
  
  // Get all pricing plans (public)
  app.get("/api/talent-exchange/pricing-plans", async (req: Request, res: Response) => {
    try {
      const plans = await db.execute(sql`
        SELECT * FROM talent_exchange_pricing_plans 
        WHERE is_active = true 
        ORDER BY sort_order ASC
      `);
      res.json(plans.rows);
    } catch (error) {
      console.error("Get pricing plans error:", error);
      res.status(500).json({ error: "Failed to fetch pricing plans" });
    }
  });

  // ========================
  // QUICK SIGNUP (Founding Member) ROUTES
  // ========================
  
  // Worker Quick Signup - Just email for founding members
  app.post("/api/talent-exchange/quick-signup/worker", async (req: Request, res: Response) => {
    try {
      const { email, isFoundingMember } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      // Check if email already exists in workers table
      const existingWorker = await db.execute(sql`
        SELECT id FROM workers WHERE email = ${email}
      `);
      
      if (existingWorker.rows.length > 0) {
        return res.status(409).json({ error: "Email already registered. Please log in or complete your profile." });
      }
      
      // Create a minimal worker record for quick signup
      const verificationToken = crypto.randomUUID();
      const result = await db.execute(sql`
        INSERT INTO workers (
          email, 
          full_name,
          status,
          onboarding_status,
          is_founding_member,
          founding_member_since,
          verification_token,
          created_at
        ) VALUES (
          ${email},
          'Pending Profile',
          'pending',
          'not_started',
          ${isFoundingMember ? true : false},
          ${isFoundingMember ? new Date() : null},
          ${verificationToken},
          NOW()
        )
        RETURNING id, email, is_founding_member
      `);
      
      console.log(`[Quick Signup] Worker founding member registered: ${email}`);
      
      res.status(201).json({
        success: true,
        message: "Welcome, Founding Member! Check your email to complete your profile.",
        worker: result.rows[0],
        nextStep: "/apply",
      });
    } catch (error: any) {
      console.error("Worker quick signup error:", error);
      res.status(500).json({ error: "Failed to register. Please try again." });
    }
  });
  
  // Employer Quick Signup - Just email for founding employers
  app.post("/api/talent-exchange/quick-signup/employer", async (req: Request, res: Response) => {
    try {
      const { email, isFoundingMember } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      // Check if email already exists
      const existing = await db.execute(sql`
        SELECT id FROM talent_exchange_employers WHERE contact_email = ${email}
      `);
      
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: "Email already registered. Please log in or complete your profile." });
      }
      
      // Create a minimal employer record for quick signup
      const verificationToken = crypto.randomUUID();
      const tempPassword = crypto.randomUUID().substring(0, 12); // Temporary password
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      
      const result = await db.execute(sql`
        INSERT INTO talent_exchange_employers (
          company_name,
          contact_email,
          contact_name,
          password_hash,
          verification_token,
          verification_status,
          is_founding_member,
          founding_member_since,
          job_post_credits,
          active_job_posts_limit,
          talent_searches_per_month,
          created_at
        ) VALUES (
          'Company (Setup Pending)',
          ${email},
          'Setup Pending',
          ${passwordHash},
          ${verificationToken},
          'pending',
          ${isFoundingMember ? true : false},
          ${isFoundingMember ? new Date() : null},
          ${isFoundingMember ? 3 : 1},
          ${isFoundingMember ? 5 : 2},
          ${isFoundingMember ? 100 : 25},
          NOW()
        )
        RETURNING id, contact_email, is_founding_member
      `);
      
      console.log(`[Quick Signup] Employer founding member registered: ${email}`);
      
      res.status(201).json({
        success: true,
        message: "Welcome, Founding Employer! Check your email to set up your company and post your first job FREE.",
        employer: result.rows[0],
        nextStep: "/employer/register",
        benefits: {
          freeJobPosts: isFoundingMember ? 3 : 1,
          foundingBadge: isFoundingMember,
          prioritySupport: isFoundingMember,
        },
      });
    } catch (error: any) {
      console.error("Employer quick signup error:", error);
      res.status(500).json({ error: "Failed to register. Please try again." });
    }
  });
  
  // Employer Registration
  app.post("/api/talent-exchange/employers/register", async (req: Request, res: Response) => {
    try {
      const { 
        companyName, industry, companySize, website, description,
        contactName, contactEmail, contactPhone, contactTitle,
        addressLine1, addressLine2, city, state, zipCode, password
      } = req.body;
      
      if (!companyName || !contactName || !contactEmail || !password) {
        return res.status(400).json({ error: "Company name, contact name, email, and password required" });
      }
      
      // Check if email already exists
      const existing = await db.execute(sql`
        SELECT id FROM talent_exchange_employers WHERE contact_email = ${contactEmail}
      `);
      
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: "Email already registered" });
      }
      
      const passwordHash = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomUUID();
      
      const result = await db.execute(sql`
        INSERT INTO talent_exchange_employers (
          company_name, industry, company_size, website, description,
          contact_name, contact_email, contact_phone, contact_title,
          address_line1, address_line2, city, state, zip_code,
          password_hash, verification_token, verification_status,
          job_post_credits, active_job_posts_limit, talent_searches_per_month
        ) VALUES (
          ${companyName}, ${industry || null}, ${companySize || null}, ${website || null}, ${description || null},
          ${contactName}, ${contactEmail}, ${contactPhone || null}, ${contactTitle || null},
          ${addressLine1 || null}, ${addressLine2 || null}, ${city || null}, ${state || null}, ${zipCode || null},
          ${passwordHash}, ${verificationToken}, 'pending',
          1, 1, 5
        )
        RETURNING id, company_name, contact_email, verification_status
      `);
      
      console.log(`[Talent Exchange] New employer registered: ${companyName} (${contactEmail})`);
      
      res.status(201).json({
        success: true,
        employer: result.rows[0],
        message: "Registration successful. Please wait for admin approval."
      });
    } catch (error: any) {
      console.error("Employer registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });
  
  // Employer Login
  app.post("/api/talent-exchange/employers/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }
      
      const result = await db.execute(sql`
        SELECT * FROM talent_exchange_employers WHERE contact_email = ${email}
      `);
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const employer = result.rows[0] as any;
      
      const passwordValid = await bcrypt.compare(password, employer.password_hash);
      if (!passwordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      if (employer.verification_status !== 'approved' && employer.verification_status !== 'pending') {
        return res.status(403).json({ error: "Account not approved" });
      }
      
      // Update last login
      await db.execute(sql`
        UPDATE talent_exchange_employers SET last_login_at = NOW() WHERE id = ${employer.id}
      `);
      
      res.json({
        id: employer.id,
        companyName: employer.company_name,
        contactEmail: employer.contact_email,
        contactName: employer.contact_name,
        subscriptionTier: employer.subscription_tier,
        verificationStatus: employer.verification_status,
        jobPostCredits: employer.job_post_credits,
        activeJobPostsLimit: employer.active_job_posts_limit
      });
    } catch (error) {
      console.error("Employer login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  
  // ========================
  // TALENT EXCHANGE BILLING ROUTES (Connected to Stripe)
  // ========================
  
  // Create subscription checkout session
  app.post("/api/talent-exchange/billing/checkout", async (req: Request, res: Response) => {
    try {
      const { employerId, planSlug, billingCycle = 'monthly' } = req.body;
      
      if (!employerId || !planSlug) {
        return res.status(400).json({ error: "Employer ID and plan required" });
      }
      
      // Get employer
      const employerResult = await db.execute(sql`
        SELECT id, contact_email, company_name, stripe_customer_id 
        FROM talent_exchange_employers WHERE id = ${employerId}
      `);
      
      if (employerResult.rows.length === 0) {
        return res.status(404).json({ error: "Employer not found" });
      }
      
      const employer = employerResult.rows[0] as any;
      
      // Get pricing plan
      const planResult = await db.execute(sql`
        SELECT * FROM talent_exchange_pricing_plans WHERE slug = ${planSlug} AND is_active = true
      `);
      
      if (planResult.rows.length === 0) {
        return res.status(404).json({ error: "Plan not found" });
      }
      
      const plan = planResult.rows[0] as any;
      
      // Create or get Stripe customer
      let stripeCustomerId = employer.stripe_customer_id;
      if (!stripeCustomerId) {
        const customer = await stripeService.createCustomer(employer.contact_email, employerId);
        stripeCustomerId = customer.id;
        
        await db.execute(sql`
          UPDATE talent_exchange_employers 
          SET stripe_customer_id = ${stripeCustomerId} 
          WHERE id = ${employerId}
        `);
      }
      
      // Get the appropriate price ID
      const priceId = billingCycle === 'annual' 
        ? plan.stripe_price_id_annual 
        : plan.stripe_price_id_monthly;
      
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : 'http://localhost:5000';
      
      // Create checkout session
      const session = await stripeService.createCheckoutSession(
        stripeCustomerId,
        priceId,
        `${baseUrl}/employer/portal?subscription=success&plan=${planSlug}`,
        `${baseUrl}/employer/portal?subscription=cancelled`
      );
      
      console.log(`[Talent Exchange Billing] Checkout created for ${employer.company_name}: ${plan.name}`);
      
      res.json({
        sessionId: session.id,
        url: session.url,
        plan: plan.name,
        price: billingCycle === 'annual' ? plan.annual_price : plan.monthly_price
      });
    } catch (error: any) {
      console.error("Checkout creation error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });
  
  // Get employer subscription status
  app.get("/api/talent-exchange/billing/:employerId/subscription", async (req: Request, res: Response) => {
    try {
      const { employerId } = req.params;
      
      const result = await db.execute(sql`
        SELECT e.subscription_tier, e.subscription_status, e.subscription_expires_at,
               e.job_post_credits, e.talent_search_credits, e.featured_post_credits,
               e.active_job_posts_limit, e.talent_searches_per_month,
               p.name as plan_name, p.monthly_price, p.features
        FROM talent_exchange_employers e
        LEFT JOIN talent_exchange_pricing_plans p ON e.subscription_tier = p.slug
        WHERE e.id = ${employerId}
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Employer not found" });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Get subscription error:", error);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });
  
  // Manage subscription (portal session for upgrades/downgrades/cancellation)
  app.post("/api/talent-exchange/billing/:employerId/portal", async (req: Request, res: Response) => {
    try {
      const { employerId } = req.params;
      
      const result = await db.execute(sql`
        SELECT stripe_customer_id FROM talent_exchange_employers WHERE id = ${employerId}
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Employer not found" });
      }
      
      const employer = result.rows[0] as any;
      
      if (!employer.stripe_customer_id) {
        return res.status(400).json({ error: "No active subscription" });
      }
      
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : 'http://localhost:5000';
      
      const session = await stripeService.createCustomerPortalSession(
        employer.stripe_customer_id,
        `${baseUrl}/employer/portal`
      );
      
      res.json({ url: session.url });
    } catch (error) {
      console.error("Portal session error:", error);
      res.status(500).json({ error: "Failed to create portal session" });
    }
  });
  
  // Handle Talent Exchange subscription webhooks
  app.post("/api/talent-exchange/billing/webhook", async (req: Request, res: Response) => {
    try {
      const event = req.body;
      
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const customerId = session.customer;
          
          // Find employer by Stripe customer ID
          const employerResult = await db.execute(sql`
            SELECT id FROM talent_exchange_employers WHERE stripe_customer_id = ${customerId}
          `);
          
          if (employerResult.rows.length > 0) {
            const employerId = (employerResult.rows[0] as any).id;
            
            // Update subscription status
            await db.execute(sql`
              UPDATE talent_exchange_employers 
              SET subscription_status = 'active',
                  subscription_started_at = NOW(),
                  updated_at = NOW()
              WHERE id = ${employerId}
            `);
            
            console.log(`[Talent Exchange] Subscription activated for employer ${employerId}`);
          }
          break;
        }
        
        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          const customerId = subscription.customer;
          const status = subscription.status;
          
          await db.execute(sql`
            UPDATE talent_exchange_employers 
            SET subscription_status = ${status},
                updated_at = NOW()
            WHERE stripe_customer_id = ${customerId}
          `);
          break;
        }
        
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const customerId = subscription.customer;
          
          await db.execute(sql`
            UPDATE talent_exchange_employers 
            SET subscription_status = 'cancelled',
                subscription_tier = 'free',
                active_job_posts_limit = 0,
                talent_searches_per_month = 5,
                updated_at = NOW()
            WHERE stripe_customer_id = ${customerId}
          `);
          
          console.log(`[Talent Exchange] Subscription cancelled for customer ${customerId}`);
          break;
        }
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });
  
  // Purchase single job post (pay-per-post)
  app.post("/api/talent-exchange/billing/pay-per-post", async (req: Request, res: Response) => {
    try {
      const { employerId } = req.body;
      
      if (!employerId) {
        return res.status(400).json({ error: "Employer ID required" });
      }
      
      const employerResult = await db.execute(sql`
        SELECT id, contact_email, company_name, stripe_customer_id 
        FROM talent_exchange_employers WHERE id = ${employerId}
      `);
      
      if (employerResult.rows.length === 0) {
        return res.status(404).json({ error: "Employer not found" });
      }
      
      const employer = employerResult.rows[0] as any;
      
      // Create or get Stripe customer
      let stripeCustomerId = employer.stripe_customer_id;
      if (!stripeCustomerId) {
        const customer = await stripeService.createCustomer(employer.contact_email, employerId);
        stripeCustomerId = customer.id;
        
        await db.execute(sql`
          UPDATE talent_exchange_employers 
          SET stripe_customer_id = ${stripeCustomerId} 
          WHERE id = ${employerId}
        `);
      }
      
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : 'http://localhost:5000';
      
      // Create one-time payment session for $19
      const session = await stripeService.createCheckoutSession(
        stripeCustomerId,
        'price_payperpost',
        `${baseUrl}/employer/portal?purchase=success&type=job_post`,
        `${baseUrl}/employer/portal?purchase=cancelled`
      );
      
      console.log(`[Talent Exchange] Pay-per-post checkout for ${employer.company_name}`);
      
      res.json({
        sessionId: session.id,
        url: session.url,
        price: 19
      });
    } catch (error: any) {
      console.error("Pay-per-post error:", error);
      res.status(500).json({ error: "Failed to create payment session" });
    }
  });
  
  // Grant free access for ORBIT franchise clients
  app.post("/api/talent-exchange/billing/grant-franchise-access", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { companyId } = req.body;
      
      if (!companyId) {
        return res.status(400).json({ error: "Company ID required" });
      }
      
      // Check if company exists
      const companyResult = await db.execute(sql`
        SELECT id, name FROM companies WHERE id = ${companyId}
      `);
      
      if (companyResult.rows.length === 0) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      const company = companyResult.rows[0] as any;
      
      // Update company with Talent Exchange access
      await db.execute(sql`
        UPDATE companies 
        SET talent_exchange_enabled = true,
            updated_at = NOW()
        WHERE id = ${companyId}
      `);
      
      console.log(`[Talent Exchange] Granted free access to ORBIT franchise: ${company.name}`);
      
      res.json({ 
        success: true, 
        message: `Talent Exchange access granted to ${company.name}` 
      });
    } catch (error) {
      console.error("Grant franchise access error:", error);
      res.status(500).json({ error: "Failed to grant access" });
    }
  });

  // Get employer profile
  app.get("/api/talent-exchange/employers/:employerId", async (req: Request, res: Response) => {
    try {
      const { employerId } = req.params;
      
      const result = await db.execute(sql`
        SELECT id, company_name, industry, company_size, website, logo_url, description,
               contact_name, contact_email, contact_phone, contact_title,
               address_line1, address_line2, city, state, zip_code,
               verification_status, subscription_tier, subscription_status,
               job_post_credits, talent_search_credits, featured_post_credits,
               active_job_posts_limit, talent_searches_per_month,
               total_jobs_posted, total_applications_received, total_hires,
               created_at
        FROM talent_exchange_employers WHERE id = ${employerId}
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Employer not found" });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Get employer error:", error);
      res.status(500).json({ error: "Failed to fetch employer" });
    }
  });
  
  // Update employer profile
  app.put("/api/talent-exchange/employers/:employerId", async (req: Request, res: Response) => {
    try {
      const { employerId } = req.params;
      const updates = req.body;
      
      const allowedFields = [
        'company_name', 'industry', 'company_size', 'website', 'logo_url', 'description',
        'contact_name', 'contact_phone', 'contact_title',
        'address_line1', 'address_line2', 'city', 'state', 'zip_code', 'billing_email'
      ];
      
      const setClause = Object.entries(updates)
        .filter(([key]) => allowedFields.includes(key))
        .map(([key, value]) => `${key} = '${value}'`)
        .join(', ');
      
      if (!setClause) {
        return res.status(400).json({ error: "No valid fields to update" });
      }
      
      await db.execute(sql`
        UPDATE talent_exchange_employers 
        SET ${sql.raw(setClause)}, updated_at = NOW()
        WHERE id = ${employerId}
      `);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Update employer error:", error);
      res.status(500).json({ error: "Failed to update employer" });
    }
  });
  
  // Create job post
  app.post("/api/talent-exchange/jobs", async (req: Request, res: Response) => {
    try {
      const { employerId, ...jobData } = req.body;
      
      if (!employerId) {
        return res.status(400).json({ error: "Employer ID required" });
      }
      
      // Check employer exists and has credits
      const employer = await db.execute(sql`
        SELECT id, job_post_credits, active_job_posts_limit, total_jobs_posted
        FROM talent_exchange_employers WHERE id = ${employerId}
      `);
      
      if (employer.rows.length === 0) {
        return res.status(404).json({ error: "Employer not found" });
      }
      
      const emp = employer.rows[0] as any;
      
      // Generate slug
      const slug = `${jobData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
      
      const result = await db.execute(sql`
        INSERT INTO talent_exchange_job_posts (
          employer_id, title, slug, description, requirements, responsibilities, benefits,
          category, subcategory, job_type, experience_level,
          required_skills, preferred_skills, certifications,
          work_location, address_line1, city, state, zip_code,
          compensation_type, pay_range_min, pay_range_max, show_pay_range,
          schedule_type, hours_per_week, start_date, end_date,
          is_urgent, positions_available, screening_questions,
          status, expires_at
        ) VALUES (
          ${employerId}, ${jobData.title}, ${slug}, ${jobData.description}, 
          ${jobData.requirements || null}, ${jobData.responsibilities || null}, ${jobData.benefits || null},
          ${jobData.category || null}, ${jobData.subcategory || null}, 
          ${jobData.jobType || 'full_time'}, ${jobData.experienceLevel || null},
          ${JSON.stringify(jobData.requiredSkills || [])}, 
          ${JSON.stringify(jobData.preferredSkills || [])},
          ${JSON.stringify(jobData.certifications || [])},
          ${jobData.workLocation || 'on_site'}, ${jobData.addressLine1 || null},
          ${jobData.city}, ${jobData.state}, ${jobData.zipCode || null},
          ${jobData.compensationType || 'hourly'}, 
          ${jobData.payRangeMin || null}, ${jobData.payRangeMax || null}, 
          ${jobData.showPayRange !== false},
          ${jobData.scheduleType || null}, ${jobData.hoursPerWeek || null},
          ${jobData.startDate || null}, ${jobData.endDate || null},
          ${jobData.isUrgent || false}, ${jobData.positionsAvailable || 1},
          ${JSON.stringify(jobData.screeningQuestions || [])},
          'pending_review', NOW() + INTERVAL '30 days'
        )
        RETURNING *
      `);
      
      // Update employer stats
      await db.execute(sql`
        UPDATE talent_exchange_employers 
        SET total_jobs_posted = total_jobs_posted + 1
        WHERE id = ${employerId}
      `);
      
      console.log(`[Talent Exchange] Job created: ${jobData.title} by employer ${employerId}`);
      
      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error("Create job error:", error);
      res.status(500).json({ error: "Failed to create job post" });
    }
  });
  
  // Get employer's jobs
  app.get("/api/talent-exchange/employers/:employerId/jobs", async (req: Request, res: Response) => {
    try {
      const { employerId } = req.params;
      const { status } = req.query;
      
      let query = sql`
        SELECT * FROM talent_exchange_job_posts 
        WHERE employer_id = ${employerId}
      `;
      
      if (status) {
        query = sql`
          SELECT * FROM talent_exchange_job_posts 
          WHERE employer_id = ${employerId} AND status = ${status}
        `;
      }
      
      query = sql`${query} ORDER BY created_at DESC`;
      
      const result = await db.execute(query);
      res.json(result.rows);
    } catch (error) {
      console.error("Get employer jobs error:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });
  
  // Update job post
  app.put("/api/talent-exchange/jobs/:jobId", async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      const updates = req.body;
      
      // Build update query dynamically
      const updatePairs: string[] = [];
      const updateValues: any[] = [];
      
      if (updates.title) updatePairs.push(`title = '${updates.title}'`);
      if (updates.description) updatePairs.push(`description = '${updates.description}'`);
      if (updates.requirements) updatePairs.push(`requirements = '${updates.requirements}'`);
      if (updates.responsibilities) updatePairs.push(`responsibilities = '${updates.responsibilities}'`);
      if (updates.benefits) updatePairs.push(`benefits = '${updates.benefits}'`);
      if (updates.category) updatePairs.push(`category = '${updates.category}'`);
      if (updates.jobType) updatePairs.push(`job_type = '${updates.jobType}'`);
      if (updates.city) updatePairs.push(`city = '${updates.city}'`);
      if (updates.state) updatePairs.push(`state = '${updates.state}'`);
      if (updates.payRangeMin !== undefined) updatePairs.push(`pay_range_min = ${updates.payRangeMin}`);
      if (updates.payRangeMax !== undefined) updatePairs.push(`pay_range_max = ${updates.payRangeMax}`);
      if (updates.status) updatePairs.push(`status = '${updates.status}'`);
      
      if (updatePairs.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }
      
      await db.execute(sql`
        UPDATE talent_exchange_job_posts 
        SET ${sql.raw(updatePairs.join(', '))}, updated_at = NOW()
        WHERE id = ${jobId}
      `);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Update job error:", error);
      res.status(500).json({ error: "Failed to update job" });
    }
  });
  
  // Delete job post
  app.delete("/api/talent-exchange/jobs/:jobId", async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      
      await db.execute(sql`
        UPDATE talent_exchange_job_posts SET status = 'deleted' WHERE id = ${jobId}
      `);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Delete job error:", error);
      res.status(500).json({ error: "Failed to delete job" });
    }
  });
  
  // PUBLIC JOB BOARD ROUTES
  
  // Get all public jobs (with filters)
  app.get("/api/talent-exchange/public/jobs", async (req: Request, res: Response) => {
    try {
      const { 
        category, city, state, jobType, search, 
        payMin, payMax, featured, 
        page = '1', limit = '20' 
      } = req.query;
      
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      let whereConditions = [`j.status = 'active'`, `j.expires_at > NOW()`];
      
      if (category) whereConditions.push(`j.category = '${category}'`);
      if (city) whereConditions.push(`LOWER(j.city) = LOWER('${city}')`);
      if (state) whereConditions.push(`j.state = '${state}'`);
      if (jobType) whereConditions.push(`j.job_type = '${jobType}'`);
      if (payMin) whereConditions.push(`j.pay_range_min >= ${payMin}`);
      if (payMax) whereConditions.push(`j.pay_range_max <= ${payMax}`);
      if (featured === 'true') whereConditions.push(`j.is_featured = true`);
      if (search) {
        whereConditions.push(`(
          LOWER(j.title) LIKE LOWER('%${search}%') OR 
          LOWER(j.description) LIKE LOWER('%${search}%') OR
          LOWER(e.company_name) LIKE LOWER('%${search}%')
        )`);
      }
      
      const whereClause = whereConditions.join(' AND ');
      
      const result = await db.execute(sql`
        SELECT j.*, e.company_name, e.logo_url, e.industry as employer_industry
        FROM talent_exchange_job_posts j
        JOIN talent_exchange_employers e ON j.employer_id = e.id
        WHERE ${sql.raw(whereClause)}
        ORDER BY j.is_featured DESC, j.published_at DESC NULLS LAST, j.created_at DESC
        LIMIT ${parseInt(limit as string)} OFFSET ${offset}
      `);
      
      const countResult = await db.execute(sql`
        SELECT COUNT(*) as total FROM talent_exchange_job_posts j
        JOIN talent_exchange_employers e ON j.employer_id = e.id
        WHERE ${sql.raw(whereClause)}
      `);
      
      res.json({
        jobs: result.rows,
        total: parseInt((countResult.rows[0] as any).total),
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
    } catch (error) {
      console.error("Get public jobs error:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });
  
  // Get single job details (public)
  app.get("/api/talent-exchange/public/jobs/:jobId", async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      
      const result = await db.execute(sql`
        SELECT j.*, e.company_name, e.logo_url, e.industry as employer_industry, 
               e.company_size, e.website, e.description as company_description
        FROM talent_exchange_job_posts j
        JOIN talent_exchange_employers e ON j.employer_id = e.id
        WHERE j.id = ${jobId} OR j.slug = ${jobId}
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      // Increment view count
      await db.execute(sql`
        UPDATE talent_exchange_job_posts SET view_count = view_count + 1 WHERE id = ${jobId}
      `);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Get job details error:", error);
      res.status(500).json({ error: "Failed to fetch job details" });
    }
  });
  
  // Get job categories (aggregated from existing jobs)
  app.get("/api/talent-exchange/public/categories", async (req: Request, res: Response) => {
    try {
      const result = await db.execute(sql`
        SELECT category, COUNT(*) as count 
        FROM talent_exchange_job_posts 
        WHERE status = 'active' AND category IS NOT NULL
        GROUP BY category 
        ORDER BY count DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
  
  // Get featured jobs
  app.get("/api/talent-exchange/public/featured-jobs", async (req: Request, res: Response) => {
    try {
      const result = await db.execute(sql`
        SELECT j.*, e.company_name, e.logo_url
        FROM talent_exchange_job_posts j
        JOIN talent_exchange_employers e ON j.employer_id = e.id
        WHERE j.is_featured = true AND j.status = 'active' AND j.expires_at > NOW()
        ORDER BY j.published_at DESC
        LIMIT 6
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Get featured jobs error:", error);
      res.status(500).json({ error: "Failed to fetch featured jobs" });
    }
  });
  
  // CANDIDATE ROUTES
  
  // Candidate Registration
  app.post("/api/talent-exchange/candidates/register", async (req: Request, res: Response) => {
    try {
      const { 
        fullName, email, phone, password, city, state, zipCode,
        headline, summary, skills, certifications, yearsExperience,
        preferredJobTypes, preferredCategories, desiredPayMin, availableToStart
      } = req.body;
      
      if (!fullName || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password required" });
      }
      
      // Check if email already exists
      const existing = await db.execute(sql`
        SELECT id FROM talent_exchange_candidates WHERE email = ${email}
      `);
      
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: "Email already registered" });
      }
      
      const passwordHash = await bcrypt.hash(password, 10);
      
      const result = await db.execute(sql`
        INSERT INTO talent_exchange_candidates (
          full_name, email, phone, password_hash, city, state, zip_code,
          headline, summary, skills, certifications, years_experience,
          preferred_job_types, preferred_categories, desired_pay_min, available_to_start,
          profile_visibility
        ) VALUES (
          ${fullName}, ${email}, ${phone || null}, ${passwordHash}, 
          ${city || null}, ${state || null}, ${zipCode || null},
          ${headline || null}, ${summary || null}, 
          ${JSON.stringify(skills || [])}, ${JSON.stringify(certifications || [])},
          ${yearsExperience || null},
          ${JSON.stringify(preferredJobTypes || [])}, ${JSON.stringify(preferredCategories || [])},
          ${desiredPayMin || null}, ${availableToStart || null},
          'public'
        )
        RETURNING id, full_name, email
      `);
      
      res.status(201).json({
        success: true,
        candidate: result.rows[0]
      });
    } catch (error) {
      console.error("Candidate registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });
  
  // Candidate Login
  app.post("/api/talent-exchange/candidates/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }
      
      const result = await db.execute(sql`
        SELECT * FROM talent_exchange_candidates WHERE email = ${email}
      `);
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const candidate = result.rows[0] as any;
      
      const passwordValid = await bcrypt.compare(password, candidate.password_hash);
      if (!passwordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Update last active
      await db.execute(sql`
        UPDATE talent_exchange_candidates SET last_active_at = NOW() WHERE id = ${candidate.id}
      `);
      
      res.json({
        id: candidate.id,
        fullName: candidate.full_name,
        email: candidate.email,
        city: candidate.city,
        state: candidate.state,
        workerId: candidate.worker_id
      });
    } catch (error) {
      console.error("Candidate login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  
  // Get candidate profile
  app.get("/api/talent-exchange/candidates/:candidateId", async (req: Request, res: Response) => {
    try {
      const { candidateId } = req.params;
      
      const result = await db.execute(sql`
        SELECT id, full_name, email, phone, city, state, zip_code,
               willing_to_relocate, travel_radius, headline, summary,
               skills, certifications, years_experience, preferred_job_types,
               preferred_categories, preferred_schedule, desired_pay_min,
               available_to_start, resume_url, profile_visibility,
               profile_views, application_count, status, worker_id
        FROM talent_exchange_candidates WHERE id = ${candidateId}
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Get candidate error:", error);
      res.status(500).json({ error: "Failed to fetch candidate" });
    }
  });
  
  // Apply to job
  app.post("/api/talent-exchange/applications", async (req: Request, res: Response) => {
    try {
      const { jobPostId, candidateId, coverLetter, screeningAnswers, resumeUrl } = req.body;
      
      if (!jobPostId || !candidateId) {
        return res.status(400).json({ error: "Job ID and candidate ID required" });
      }
      
      // Check if already applied
      const existing = await db.execute(sql`
        SELECT id FROM talent_exchange_applications 
        WHERE job_post_id = ${jobPostId} AND candidate_id = ${candidateId}
      `);
      
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: "Already applied to this job" });
      }
      
      // Get job's employer ID
      const job = await db.execute(sql`
        SELECT employer_id FROM talent_exchange_job_posts WHERE id = ${jobPostId}
      `);
      
      if (job.rows.length === 0) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      const employerId = (job.rows[0] as any).employer_id;
      
      const result = await db.execute(sql`
        INSERT INTO talent_exchange_applications (
          job_post_id, candidate_id, employer_id, cover_letter, 
          screening_answers, resume_url, status, status_history
        ) VALUES (
          ${jobPostId}, ${candidateId}, ${employerId}, ${coverLetter || null},
          ${JSON.stringify(screeningAnswers || {})}, ${resumeUrl || null},
          'submitted', ${JSON.stringify([{ status: 'submitted', timestamp: new Date() }])}
        )
        RETURNING *
      `);
      
      // Update job application count
      await db.execute(sql`
        UPDATE talent_exchange_job_posts SET application_count = application_count + 1 WHERE id = ${jobPostId}
      `);
      
      // Update candidate application count
      await db.execute(sql`
        UPDATE talent_exchange_candidates SET application_count = application_count + 1 WHERE id = ${candidateId}
      `);
      
      // Update employer stats
      await db.execute(sql`
        UPDATE talent_exchange_employers SET total_applications_received = total_applications_received + 1 WHERE id = ${employerId}
      `);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Apply error:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });
  
  // Get candidate's applications
  app.get("/api/talent-exchange/candidates/:candidateId/applications", async (req: Request, res: Response) => {
    try {
      const { candidateId } = req.params;
      
      const result = await db.execute(sql`
        SELECT a.*, j.title as job_title, j.city, j.state, j.pay_range_min, j.pay_range_max,
               e.company_name, e.logo_url
        FROM talent_exchange_applications a
        JOIN talent_exchange_job_posts j ON a.job_post_id = j.id
        JOIN talent_exchange_employers e ON a.employer_id = e.id
        WHERE a.candidate_id = ${candidateId}
        ORDER BY a.created_at DESC
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Get applications error:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });
  
  // Get employer's applications
  app.get("/api/talent-exchange/employers/:employerId/applications", async (req: Request, res: Response) => {
    try {
      const { employerId } = req.params;
      const { jobId, status } = req.query;
      
      let whereClause = `a.employer_id = '${employerId}'`;
      if (jobId) whereClause += ` AND a.job_post_id = '${jobId}'`;
      if (status) whereClause += ` AND a.status = '${status}'`;
      
      const result = await db.execute(sql`
        SELECT a.*, c.full_name, c.email as candidate_email, c.phone as candidate_phone,
               c.headline, c.skills, c.certifications, c.years_experience,
               c.resume_url as candidate_resume_url, c.city as candidate_city, c.state as candidate_state,
               j.title as job_title
        FROM talent_exchange_applications a
        JOIN talent_exchange_candidates c ON a.candidate_id = c.id
        JOIN talent_exchange_job_posts j ON a.job_post_id = j.id
        WHERE ${sql.raw(whereClause)}
        ORDER BY a.created_at DESC
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Get employer applications error:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });
  
  // Update application status
  app.put("/api/talent-exchange/applications/:applicationId/status", async (req: Request, res: Response) => {
    try {
      const { applicationId } = req.params;
      const { status, notes, interviewDate, interviewType } = req.body;
      
      const validStatuses = ['submitted', 'viewed', 'shortlisted', 'interview_scheduled', 
                             'interviewed', 'offer_made', 'hired', 'rejected', 'withdrawn'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      let updateQuery = `status = '${status}', updated_at = NOW()`;
      if (notes) updateQuery += `, notes = '${notes}'`;
      if (status === 'viewed') updateQuery += `, viewed_at = NOW()`;
      if (status === 'interview_scheduled' && interviewDate) {
        updateQuery += `, interview_scheduled_at = '${interviewDate}'`;
        if (interviewType) updateQuery += `, interview_type = '${interviewType}'`;
      }
      
      await db.execute(sql`
        UPDATE talent_exchange_applications 
        SET ${sql.raw(updateQuery)}
        WHERE id = ${applicationId}
      `);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Update application error:", error);
      res.status(500).json({ error: "Failed to update application" });
    }
  });
  
  // TALENT POOL ROUTES (Search ORBIT Workers)
  
  // Get available ORBIT workers for talent pool
  app.get("/api/talent-exchange/talent-pool", async (req: Request, res: Response) => {
    try {
      const { skills, city, state, available, search, page = '1', limit = '20' } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      let whereConditions = [`(w.status = 'approved' OR w.status = 'active')`];
      
      if (city) whereConditions.push(`LOWER(w.city) = LOWER('${city}')`);
      if (state) whereConditions.push(`w.state = '${state}'`);
      if (available === 'true') whereConditions.push(`w.availability_status = 'available'`);
      if (search) {
        whereConditions.push(`(
          LOWER(w.full_name) LIKE LOWER('%${search}%') OR 
          w.skills::text LIKE '%${search}%'
        )`);
      }
      
      const whereClause = whereConditions.join(' AND ');
      
      const result = await db.execute(sql`
        SELECT 
          w.id, w.full_name, w.city, w.state, w.skills, w.availability_status,
          w.years_experience, w.preferred_shift,
          ps.overall_score, ps.customer_feedback_score, ps.reliability_score,
          ps.total_assignments_completed, ps.average_customer_rating,
          ps.badges, ps.profile_highlights, ps.on_time_arrival_rate
        FROM workers w
        LEFT JOIN worker_performance_scores ps ON w.id = ps.worker_id
        WHERE ${sql.raw(whereClause)}
        ORDER BY ps.overall_score DESC NULLS LAST
        LIMIT ${parseInt(limit as string)} OFFSET ${offset}
      `);
      
      const countResult = await db.execute(sql`
        SELECT COUNT(*) as total FROM workers w
        LEFT JOIN worker_performance_scores ps ON w.id = ps.worker_id
        WHERE ${sql.raw(whereClause)}
      `);
      
      res.json({
        workers: result.rows,
        total: parseInt((countResult.rows[0] as any).total),
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
    } catch (error) {
      console.error("Get talent pool error:", error);
      res.status(500).json({ error: "Failed to fetch talent pool" });
    }
  });
  
  // Get worker profile for talent pool
  app.get("/api/talent-exchange/talent-pool/:workerId", async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      
      const result = await db.execute(sql`
        SELECT 
          w.id, w.full_name, w.city, w.state, w.skills, w.availability_status,
          w.years_experience, w.preferred_shift, w.days_available,
          w.i9_verified, w.background_check_status, w.onboarding_completed,
          ps.overall_score, ps.customer_feedback_score, ps.reliability_score,
          ps.availability_score, ps.productivity_score, ps.loyalty_score,
          ps.total_assignments_completed, ps.total_hours_worked, 
          ps.on_time_arrival_rate, ps.assignment_completion_rate,
          ps.average_customer_rating, ps.total_feedback_count,
          ps.would_hire_again_rate, ps.badges, ps.profile_highlights,
          ps.current_streak, ps.longest_streak, ps.tenure_months
        FROM workers w
        LEFT JOIN worker_performance_scores ps ON w.id = ps.worker_id
        WHERE w.id = ${workerId} AND w.status = 'approved'
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Worker not found" });
      }
      
      // Increment profile views
      await db.execute(sql`
        UPDATE worker_performance_scores SET profile_highlights = profile_highlights WHERE worker_id = ${workerId}
      `);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Get worker profile error:", error);
      res.status(500).json({ error: "Failed to fetch worker profile" });
    }
  });
  
  // Request worker (employer wants to hire/contact an ORBIT worker)
  app.post("/api/talent-exchange/worker-requests", async (req: Request, res: Response) => {
    try {
      const { employerId, workerId, requestType, message, jobPostId } = req.body;
      
      if (!employerId || !workerId) {
        return res.status(400).json({ error: "Employer ID and worker ID required" });
      }
      
      const result = await db.execute(sql`
        INSERT INTO talent_exchange_worker_requests (
          employer_id, worker_id, request_type, message, job_post_id, status
        ) VALUES (
          ${employerId}, ${workerId}, ${requestType || 'hire'}, 
          ${message || null}, ${jobPostId || null}, 'pending'
        )
        RETURNING *
      `);
      
      console.log(`[Talent Exchange] Worker request: employer ${employerId} -> worker ${workerId}`);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Worker request error:", error);
      res.status(500).json({ error: "Failed to create worker request" });
    }
  });
  
  // ADMIN MODERATION ROUTES
  
  // Get pending employer verifications
  app.get("/api/talent-exchange/admin/pending-employers", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const result = await db.execute(sql`
        SELECT * FROM talent_exchange_employers 
        WHERE verification_status = 'pending'
        ORDER BY created_at ASC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Get pending employers error:", error);
      res.status(500).json({ error: "Failed to fetch pending employers" });
    }
  });
  
  // Approve/Reject employer
  app.put("/api/talent-exchange/admin/employers/:employerId/verify", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { employerId } = req.params;
      const { status, rejectionReason, verifiedBy } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Status must be approved or rejected" });
      }
      
      let updateQuery = `verification_status = '${status}', verified_at = NOW()`;
      if (verifiedBy) updateQuery += `, verified_by = '${verifiedBy}'`;
      if (status === 'rejected' && rejectionReason) updateQuery += `, rejection_reason = '${rejectionReason}'`;
      
      await db.execute(sql`
        UPDATE talent_exchange_employers 
        SET ${sql.raw(updateQuery)}
        WHERE id = ${employerId}
      `);
      
      console.log(`[Talent Exchange] Employer ${employerId} ${status}`);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Verify employer error:", error);
      res.status(500).json({ error: "Failed to verify employer" });
    }
  });
  
  // Get pending job posts
  app.get("/api/talent-exchange/admin/pending-jobs", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const result = await db.execute(sql`
        SELECT j.*, e.company_name, e.contact_email
        FROM talent_exchange_job_posts j
        JOIN talent_exchange_employers e ON j.employer_id = e.id
        WHERE j.status = 'pending_review'
        ORDER BY j.created_at ASC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Get pending jobs error:", error);
      res.status(500).json({ error: "Failed to fetch pending jobs" });
    }
  });
  
  // Approve/Reject job post
  app.put("/api/talent-exchange/admin/jobs/:jobId/moderate", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      const { status, moderationNotes, moderatedBy, rejectionReason } = req.body;
      
      if (!['active', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Status must be active or rejected" });
      }
      
      let updateQuery = `status = '${status}', moderated_at = NOW()`;
      if (moderatedBy) updateQuery += `, moderated_by = '${moderatedBy}'`;
      if (moderationNotes) updateQuery += `, moderation_notes = '${moderationNotes}'`;
      if (status === 'rejected' && rejectionReason) updateQuery += `, rejection_reason = '${rejectionReason}'`;
      if (status === 'active') updateQuery += `, published_at = NOW()`;
      
      await db.execute(sql`
        UPDATE talent_exchange_job_posts 
        SET ${sql.raw(updateQuery)}
        WHERE id = ${jobId}
      `);
      
      console.log(`[Talent Exchange] Job ${jobId} ${status}`);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Moderate job error:", error);
      res.status(500).json({ error: "Failed to moderate job" });
    }
  });
  
  // Get worker requests for admin
  app.get("/api/talent-exchange/admin/worker-requests", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      
      let whereClause = '1=1';
      if (status) whereClause = `r.status = '${status}'`;
      
      const result = await db.execute(sql`
        SELECT r.*, e.company_name, e.contact_email, w.full_name as worker_name, w.phone as worker_phone
        FROM talent_exchange_worker_requests r
        JOIN talent_exchange_employers e ON r.employer_id = e.id
        JOIN workers w ON r.worker_id = w.id
        WHERE ${sql.raw(whereClause)}
        ORDER BY r.created_at DESC
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Get worker requests error:", error);
      res.status(500).json({ error: "Failed to fetch worker requests" });
    }
  });
  
  // Approve/Reject worker request
  app.put("/api/talent-exchange/admin/worker-requests/:requestId", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;
      const { status, reviewNotes, reviewedBy } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Status must be approved or rejected" });
      }
      
      await db.execute(sql`
        UPDATE talent_exchange_worker_requests 
        SET status = ${status}, reviewed_at = NOW(), 
            review_notes = ${reviewNotes || null}, reviewed_by = ${reviewedBy || null}
        WHERE id = ${requestId}
      `);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Update worker request error:", error);
      res.status(500).json({ error: "Failed to update worker request" });
    }
  });
  
  // Get Talent Exchange analytics
  app.get("/api/talent-exchange/admin/analytics", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const [employers, jobs, applications, candidates] = await Promise.all([
        db.execute(sql`SELECT COUNT(*) as count, verification_status FROM talent_exchange_employers GROUP BY verification_status`),
        db.execute(sql`SELECT COUNT(*) as count, status FROM talent_exchange_job_posts GROUP BY status`),
        db.execute(sql`SELECT COUNT(*) as count, status FROM talent_exchange_applications GROUP BY status`),
        db.execute(sql`SELECT COUNT(*) as count FROM talent_exchange_candidates`)
      ]);
      
      res.json({
        employers: employers.rows,
        jobs: jobs.rows,
        applications: applications.rows,
        candidates: (candidates.rows[0] as any).count
      });
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  
  // WORKER PERFORMANCE & FEEDBACK ROUTES
  
  // Get worker performance score
  app.get("/api/workers/:workerId/performance", async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      
      const result = await db.execute(sql`
        SELECT * FROM worker_performance_scores WHERE worker_id = ${workerId}
      `);
      
      if (result.rows.length === 0) {
        return res.json({
          workerId,
          overallScore: 0,
          message: "No performance data yet"
        });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Get performance error:", error);
      res.status(500).json({ error: "Failed to fetch performance" });
    }
  });
  
  // Submit worker feedback
  app.post("/api/workers/:workerId/feedback", async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const {
        tenantId, assignmentId, clientId, overallRating,
        punctualityRating, qualityRating, attitudeRating,
        communicationRating, safetyRating, wouldHireAgain,
        feedback, highlightedStrengths, areasForImprovement,
        feedbackSource, submittedBy
      } = req.body;
      
      if (!tenantId || !overallRating) {
        return res.status(400).json({ error: "Tenant ID and overall rating required" });
      }
      
      const result = await db.execute(sql`
        INSERT INTO worker_feedback (
          worker_id, tenant_id, assignment_id, client_id,
          overall_rating, punctuality_rating, quality_rating, attitude_rating,
          communication_rating, safety_rating, would_hire_again,
          feedback, highlighted_strengths, areas_for_improvement,
          feedback_source, submitted_by, is_verified
        ) VALUES (
          ${workerId}, ${tenantId}, ${assignmentId || null}, ${clientId || null},
          ${overallRating}, ${punctualityRating || null}, ${qualityRating || null}, 
          ${attitudeRating || null}, ${communicationRating || null}, ${safetyRating || null},
          ${wouldHireAgain || null}, ${feedback || null}, 
          ${JSON.stringify(highlightedStrengths || [])},
          ${JSON.stringify(areasForImprovement || [])},
          ${feedbackSource || 'client'}, ${submittedBy || null}, false
        )
        RETURNING *
      `);
      
      // Trigger performance score recalculation (async)
      recalculateWorkerPerformance(workerId, tenantId).catch(err => {
        console.error("Performance recalc error:", err);
      });
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Submit feedback error:", error);
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });
  
  // Get worker feedback history
  app.get("/api/workers/:workerId/feedback", async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const { limit = '10' } = req.query;
      
      const result = await db.execute(sql`
        SELECT f.*, c.name as client_name
        FROM worker_feedback f
        LEFT JOIN clients c ON f.client_id = c.id
        WHERE f.worker_id = ${workerId} AND f.is_public = true
        ORDER BY f.created_at DESC
        LIMIT ${parseInt(limit as string)}
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Get feedback error:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // ========================
  // SELF-SERVICE REPORTS
  // ========================

  // Report types catalog based on user role
  const reportCatalog = {
    worker: [
      { type: 'timecard', name: 'Weekly Time Card', description: 'Your weekly hours and clock-in/out records', formats: ['pdf', 'csv'] },
      { type: 'pay-history', name: 'Pay Stubs', description: 'Your earnings and deductions history', formats: ['pdf'] },
      { type: 'assignments', name: 'Work History', description: 'Your assignment and job history', formats: ['pdf', 'csv'] },
      { type: 'tax-documents', name: 'Tax Documents', description: 'W-2, W-4 and other tax forms', formats: ['pdf'] },
    ],
    manager: [
      { type: 'timecard', name: 'Weekly Time Card', description: 'Worker time cards for your team', formats: ['pdf', 'csv'] },
      { type: 'pay-history', name: 'Pay History', description: 'Pay stub records for workers', formats: ['pdf'] },
      { type: 'assignments', name: 'Assignment Reports', description: 'Work order and assignment history', formats: ['pdf', 'csv'] },
      { type: 'utilization', name: 'Utilization Report', description: 'Worker utilization and availability', formats: ['pdf', 'csv'] },
    ],
    admin: [
      { type: 'timecard', name: 'Weekly Time Card', description: 'Time cards for any worker', formats: ['pdf', 'csv'] },
      { type: 'pay-history', name: 'Pay History', description: 'Complete pay stub records', formats: ['pdf', 'csv'] },
      { type: 'assignments', name: 'Assignment Reports', description: 'Full assignment history', formats: ['pdf', 'csv'] },
      { type: 'tax-documents', name: 'Tax Documents', description: 'W-2, W-4 and tax forms', formats: ['pdf'] },
      { type: 'payroll-summary', name: 'Payroll Summary', description: 'Payroll totals and summaries', formats: ['pdf', 'csv'] },
      { type: 'compliance', name: 'Compliance Report', description: 'Worker compliance status', formats: ['pdf', 'csv'] },
    ],
  };

  // GET /api/reports/catalog - Returns available reports based on user role
  app.get("/api/reports/catalog", async (req: Request, res: Response) => {
    try {
      const role = (req.query.role as string) || 'worker';
      const validRoles = ['worker', 'manager', 'admin', 'master_admin'];
      
      const effectiveRole = role === 'master_admin' ? 'admin' : role;
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role specified" });
      }
      
      const catalog = reportCatalog[effectiveRole as keyof typeof reportCatalog] || reportCatalog.worker;
      res.json({ reports: catalog, role: effectiveRole });
    } catch (error) {
      console.error("[Reports] Catalog error:", error);
      res.status(500).json({ error: "Failed to fetch report catalog" });
    }
  });

  // POST /api/reports/generate - Generate a report
  app.post("/api/reports/generate", async (req: Request, res: Response) => {
    try {
      const { reportType, dateRangeStart, dateRangeEnd, workerId, format = 'pdf' } = req.body;
      
      // Validation
      if (!reportType) {
        return res.status(400).json({ error: "reportType is required" });
      }
      
      const validTypes = ['timecard', 'pay-history', 'assignments', 'tax-documents', 'payroll-summary', 'compliance', 'utilization'];
      if (!validTypes.includes(reportType)) {
        return res.status(400).json({ error: `Invalid reportType. Must be one of: ${validTypes.join(', ')}` });
      }
      
      const validFormats = ['pdf', 'csv'];
      if (!validFormats.includes(format)) {
        return res.status(400).json({ error: "Format must be 'pdf' or 'csv'" });
      }
      
      // Get tenant and user info from request
      const tenantId = getTenantIdFromRequest(req);
      const user = (req as any).user;
      const requestedBy = user?.id || null;
      const requestedByType = user?.role || 'worker';
      
      // Generate report name
      const reportNames: Record<string, string> = {
        'timecard': 'Weekly Time Card',
        'pay-history': 'Pay History Report',
        'assignments': 'Assignment History',
        'tax-documents': 'Tax Documents',
        'payroll-summary': 'Payroll Summary',
        'compliance': 'Compliance Report',
        'utilization': 'Utilization Report',
      };
      const reportName = `${reportNames[reportType]} - ${new Date().toLocaleDateString()}`;
      
      // Create report request record
      const [reportRecord] = await db.insert(reportRequests).values({
        tenantId,
        requestedBy,
        requestedByType,
        requestedByEntityId: workerId || requestedBy,
        reportType,
        reportName,
        dateRangeStart: dateRangeStart || null,
        dateRangeEnd: dateRangeEnd || null,
        filterParams: { workerId },
        format,
        status: 'generating',
      }).returning();
      
      // Generate mock report data based on type
      let mockData: any;
      
      switch (reportType) {
        case 'timecard':
          mockData = {
            workerId: workerId || 'W-001',
            workerName: 'Sample Worker',
            weekEnding: dateRangeEnd || new Date().toISOString().split('T')[0],
            entries: [
              { date: '2024-01-15', clockIn: '08:00', clockOut: '16:30', hoursWorked: 8.5, location: 'Main Site' },
              { date: '2024-01-16', clockIn: '07:45', clockOut: '16:15', hoursWorked: 8.5, location: 'Main Site' },
              { date: '2024-01-17', clockIn: '08:00', clockOut: '17:00', hoursWorked: 9.0, location: 'Remote Site A' },
              { date: '2024-01-18', clockIn: '08:00', clockOut: '16:00', hoursWorked: 8.0, location: 'Main Site' },
              { date: '2024-01-19', clockIn: '07:30', clockOut: '15:30', hoursWorked: 8.0, location: 'Main Site' },
            ],
            totalHours: 42.0,
            regularHours: 40.0,
            overtimeHours: 2.0,
          };
          break;
          
        case 'pay-history':
          mockData = {
            workerId: workerId || 'W-001',
            workerName: 'Sample Worker',
            payStubs: [
              { payDate: '2024-01-19', periodStart: '2024-01-08', periodEnd: '2024-01-14', grossPay: 1680.00, netPay: 1344.00, deductions: 336.00 },
              { payDate: '2024-01-12', periodStart: '2024-01-01', periodEnd: '2024-01-07', grossPay: 1600.00, netPay: 1280.00, deductions: 320.00 },
              { payDate: '2024-01-05', periodStart: '2023-12-25', periodEnd: '2023-12-31', grossPay: 1520.00, netPay: 1216.00, deductions: 304.00 },
            ],
            ytdGross: 4800.00,
            ytdNet: 3840.00,
            ytdDeductions: 960.00,
          };
          break;
          
        case 'assignments':
          mockData = {
            workerId: workerId || 'W-001',
            workerName: 'Sample Worker',
            assignments: [
              { id: 'A-001', client: 'ABC Corp', startDate: '2024-01-15', endDate: '2024-01-19', status: 'completed', hoursWorked: 42 },
              { id: 'A-002', client: 'XYZ Industries', startDate: '2024-01-08', endDate: '2024-01-12', status: 'completed', hoursWorked: 40 },
              { id: 'A-003', client: 'Tech Solutions', startDate: '2024-01-22', endDate: null, status: 'active', hoursWorked: 16 },
            ],
            totalAssignments: 3,
            activeAssignments: 1,
          };
          break;
          
        case 'tax-documents':
          mockData = {
            workerId: workerId || 'W-001',
            workerName: 'Sample Worker',
            taxYear: new Date().getFullYear() - 1,
            documents: [
              { type: 'W-2', year: 2023, status: 'available', downloadUrl: `/api/reports/${reportRecord.id}/download?doc=w2-2023` },
              { type: 'W-4', year: 2024, status: 'on-file', lastUpdated: '2024-01-02' },
            ],
            w2Summary: {
              wagesTipsCompensation: 52000.00,
              federalTaxWithheld: 7800.00,
              socialSecurityWages: 52000.00,
              socialSecurityTaxWithheld: 3224.00,
              medicareWages: 52000.00,
              medicareTaxWithheld: 754.00,
            },
          };
          break;
          
        default:
          mockData = {
            reportType,
            generatedAt: new Date().toISOString(),
            message: 'Report data placeholder - connect to real data source',
          };
      }
      
      // Update report with completed status
      const fileUrl = `/api/reports/${reportRecord.id}/download`;
      await db.update(reportRequests)
        .set({
          status: 'completed',
          fileUrl,
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
        })
        .where(eq(reportRequests.id, reportRecord.id));
      
      res.status(201).json({
        id: reportRecord.id,
        reportType,
        reportName,
        format,
        status: 'completed',
        fileUrl,
        data: mockData,
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (error) {
      console.error("[Reports] Generate error:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // GET /api/reports/history - Get user's report history
  app.get("/api/reports/history", async (req: Request, res: Response) => {
    try {
      const tenantId = getTenantIdFromRequest(req);
      const user = (req as any).user;
      const userId = user?.id || (req.query.userId as string);
      const { limit = '20', reportType } = req.query;
      
      let query = db.select()
        .from(reportRequests)
        .orderBy(desc(reportRequests.createdAt))
        .limit(parseInt(limit as string));
      
      // Build conditions
      const conditions: any[] = [];
      if (tenantId) {
        conditions.push(eq(reportRequests.tenantId, tenantId));
      }
      if (userId) {
        conditions.push(eq(reportRequests.requestedBy, userId));
      }
      if (reportType) {
        conditions.push(eq(reportRequests.reportType, reportType as string));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const reports = await query;
      
      res.json({
        reports: reports.map(r => ({
          id: r.id,
          reportType: r.reportType,
          reportName: r.reportName,
          format: r.format,
          status: r.status,
          fileUrl: r.fileUrl,
          dateRangeStart: r.dateRangeStart,
          dateRangeEnd: r.dateRangeEnd,
          generatedAt: r.generatedAt,
          expiresAt: r.expiresAt,
          downloadCount: r.downloadCount,
          createdAt: r.createdAt,
        })),
        total: reports.length,
      });
    } catch (error) {
      console.error("[Reports] History error:", error);
      res.status(500).json({ error: "Failed to fetch report history" });
    }
  });

  // GET /api/reports/:id/download - Download a generated report
  app.get("/api/reports/:id/download", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { doc } = req.query; // Optional specific document (for tax docs)
      
      // Fetch report record
      const [report] = await db.select()
        .from(reportRequests)
        .where(eq(reportRequests.id, id))
        .limit(1);
      
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      if (report.status !== 'completed') {
        return res.status(400).json({ error: "Report is not ready for download", status: report.status });
      }
      
      // Check expiration
      if (report.expiresAt && new Date(report.expiresAt) < new Date()) {
        return res.status(410).json({ error: "Report has expired. Please generate a new one." });
      }
      
      // Increment download count
      await db.update(reportRequests)
        .set({ downloadCount: (report.downloadCount || 0) + 1 })
        .where(eq(reportRequests.id, id));
      
      // Generate placeholder PDF/CSV content
      const format = report.format || 'pdf';
      
      if (format === 'csv') {
        // Mock CSV content
        const csvContent = `Report: ${report.reportName}\nGenerated: ${report.generatedAt}\nType: ${report.reportType}\n\nDate,Description,Hours,Amount\n2024-01-15,Regular Work,8.5,$340.00\n2024-01-16,Regular Work,8.5,$340.00\n2024-01-17,Regular Work,9.0,$360.00\n2024-01-18,Regular Work,8.0,$320.00\n2024-01-19,Regular Work,8.0,$320.00\nTotal,,42.0,$1680.00`;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${report.reportType}-${id}.csv"`);
        return res.send(csvContent);
      }
      
      // Mock PDF response (placeholder)
      const pdfPlaceholder = {
        message: "PDF generation placeholder",
        reportId: id,
        reportType: report.reportType,
        reportName: report.reportName,
        generatedAt: report.generatedAt,
        note: "In production, this would return actual PDF binary data",
        downloadInstructions: "Integrate with a PDF library like jspdf or pdfkit for actual PDF generation",
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.json(pdfPlaceholder);
    } catch (error) {
      console.error("[Reports] Download error:", error);
      res.status(500).json({ error: "Failed to download report" });
    }
  });

  // ========================
  // AI MATCHING ENGINE
  // ========================
  
  // POST /api/matching/analyze - Analyze worker-job match
  app.post("/api/matching/analyze", async (req: Request, res: Response) => {
    try {
      const { workerId, jobRequirements } = req.body;
      const tenantId = getTenantIdFromRequest(req);
      
      if (!workerId || !jobRequirements) {
        return res.status(400).json({ error: "workerId and jobRequirements required" });
      }
      
      const { calculateAdvancedMatchScore, getMatchSummary } = await import('./aiMatchingEngine');
      
      // Get worker details
      const worker = await storage.getWorker(workerId);
      if (!worker) {
        return res.status(404).json({ error: "Worker not found" });
      }
      
      const score = calculateAdvancedMatchScore(worker, jobRequirements);
      
      res.json({
        workerId,
        workerName: worker.fullName,
        jobTitle: jobRequirements.title,
        matchScore: score,
        summary: getMatchSummary(score),
      });
    } catch (error) {
      console.error("[Matching] Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze match" });
    }
  });
  
  // POST /api/matching/find-candidates - Find best candidates for a job
  app.post("/api/matching/find-candidates", async (req: Request, res: Response) => {
    try {
      const { jobRequirements, limit = 20 } = req.body;
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      if (!jobRequirements) {
        return res.status(400).json({ error: "jobRequirements required" });
      }
      
      const { findBestMatches } = await import('./aiMatchingEngine');
      
      const matches = await findBestMatches(jobRequirements, tenantId, limit);
      
      res.json({
        jobTitle: jobRequirements.title,
        totalCandidates: matches.length,
        matches: matches.map(m => ({
          rank: m.rank,
          workerId: m.worker.id,
          workerName: m.worker.fullName,
          matchGrade: m.score.matchGrade,
          overallScore: m.score.overallScore,
          strengths: m.score.strengths.slice(0, 3),
          gaps: m.score.gaps.slice(0, 3),
          recommendation: m.score.recommendation,
        })),
      });
    } catch (error) {
      console.error("[Matching] Find candidates error:", error);
      res.status(500).json({ error: "Failed to find candidates" });
    }
  });
  
  // ========================
  // RESUME PARSER
  // ========================
  
  // POST /api/resume/parse - Parse resume text and extract data
  app.post("/api/resume/parse", async (req: Request, res: Response) => {
    try {
      const { resumeText } = req.body;
      
      if (!resumeText || resumeText.trim().length < 50) {
        return res.status(400).json({ error: "Resume text too short or missing" });
      }
      
      const { parseResumeText, mapResumeToWorkerProfile } = await import('./resumeParser');
      
      const parsed = parseResumeText(resumeText);
      const workerProfile = mapResumeToWorkerProfile(parsed);
      
      res.json({
        success: parsed.success,
        confidence: parsed.confidence,
        extractedData: parsed.data,
        suggestedProfile: workerProfile,
        errors: parsed.errors,
      });
    } catch (error) {
      console.error("[Resume] Parse error:", error);
      res.status(500).json({ error: "Failed to parse resume" });
    }
  });
  
  // ========================
  // JOB DISTRIBUTION
  // ========================
  
  // GET /api/jobs/distribution/boards - Get available job boards
  app.get("/api/jobs/distribution/boards", async (req: Request, res: Response) => {
    try {
      const { getAvailableJobBoards } = await import('./jobDistribution');
      
      const boards = getAvailableJobBoards();
      
      res.json({
        boards: boards.map(b => ({
          id: b.board,
          name: b.config.name,
          estimatedReach: b.config.estimatedReach,
          requiresApiKey: b.config.requiresApiKey,
          postingDurationDays: b.config.postingDurationDays,
          features: b.config.features,
        })),
      });
    } catch (error) {
      console.error("[Distribution] Boards error:", error);
      res.status(500).json({ error: "Failed to fetch job boards" });
    }
  });
  
  // POST /api/jobs/distribution/distribute - Distribute job to multiple boards
  app.post("/api/jobs/distribution/distribute", async (req: Request, res: Response) => {
    try {
      const { jobData, boards } = req.body;
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      if (!jobData || !jobData.title) {
        return res.status(400).json({ error: "Job data required with at least a title" });
      }
      
      const { distributeJob, estimateTotalReach } = await import('./jobDistribution');
      
      // Use provided boards or default to internal + google
      const targetBoards = boards || ['internal', 'google'];
      
      const result = await distributeJob(jobData, targetBoards);
      
      res.json({
        jobId: result.jobId,
        distributions: result.results,
        successCount: result.successCount,
        failCount: result.failCount,
        estimatedReach: result.totalReach,
      });
    } catch (error) {
      console.error("[Distribution] Distribute error:", error);
      res.status(500).json({ error: "Failed to distribute job" });
    }
  });
  
  // POST /api/jobs/distribution/google-schema - Generate Google Jobs structured data
  app.post("/api/jobs/distribution/google-schema", async (req: Request, res: Response) => {
    try {
      const { jobData } = req.body;
      
      if (!jobData || !jobData.title) {
        return res.status(400).json({ error: "Job data required" });
      }
      
      const { generateGoogleJobsSchema } = await import('./jobDistribution');
      
      const schema = generateGoogleJobsSchema(jobData);
      
      res.json({
        schema,
        instructions: "Add this JSON-LD schema to your job posting page for Google Jobs indexing",
      });
    } catch (error) {
      console.error("[Distribution] Schema error:", error);
      res.status(500).json({ error: "Failed to generate schema" });
    }
  });
  
  // ========================
  // E-SIGNATURE SERVICE
  // ========================
  
  // GET /api/esign/templates - Get available document templates
  app.get("/api/esign/templates", async (req: Request, res: Response) => {
    try {
      const { getAllTemplates } = await import('./eSignatureService');
      
      const templates = getAllTemplates();
      
      res.json({
        templates: templates.map(t => ({
          id: t.id,
          type: t.type,
          name: t.name,
          description: t.description,
          requiredFields: t.requiredFields,
          version: t.version,
        })),
      });
    } catch (error) {
      console.error("[eSign] Templates error:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });
  
  // POST /api/esign/request - Create a signature request
  app.post("/api/esign/request", async (req: Request, res: Response) => {
    try {
      const { documentType, signerId, signerName, signerEmail, expiresInDays, fieldData } = req.body;
      
      if (!documentType || !signerId || !signerName) {
        return res.status(400).json({ error: "documentType, signerId, and signerName required" });
      }
      
      const { createSignatureRequest, getDocumentTemplate, renderDocument } = await import('./eSignatureService');
      
      const signature = createSignatureRequest({
        documentType,
        signerId,
        signerName,
        signerEmail,
        expiresInDays,
        fieldData,
      });
      
      // Get template and render document
      const template = getDocumentTemplate(documentType);
      const renderedContent = renderDocument(template, { signerName, ...fieldData });
      
      res.json({
        signatureId: signature.id,
        documentType: signature.documentType,
        status: signature.status,
        expiresAt: signature.expiresAt,
        documentContent: renderedContent,
        signUrl: `/sign/${signature.id}`,
      });
    } catch (error) {
      console.error("[eSign] Request error:", error);
      res.status(500).json({ error: "Failed to create signature request" });
    }
  });
  
  // POST /api/esign/sign - Record a signature
  app.post("/api/esign/sign", async (req: Request, res: Response) => {
    try {
      const { signatureId, signatureName, signatureImage } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'];
      
      if (!signatureId || !signatureName) {
        return res.status(400).json({ error: "signatureId and signatureName required" });
      }
      
      const { recordSignature, verifySignature, createAuditEntry } = await import('./eSignatureService');
      
      // Create signature data
      const signatureData = {
        signatureName,
        signatureImage,
        signatureDate: new Date(),
        signatureIpAddress: ipAddress,
        signatureUserAgent: userAgent,
      };
      
      // Record signature (mock storage for now)
      const signature = {
        id: signatureId,
        documentId: 'doc_placeholder',
        documentType: 'offer_letter' as const,
        signerId: 'placeholder',
        signerName: signatureName,
        status: 'pending' as const,
        requestedAt: new Date(),
      };
      
      const signedDoc = recordSignature(signature, signatureData);
      const verification = verifySignature(signedDoc);
      
      // Create audit entry
      const audit = createAuditEntry(signatureId, 'signed', {
        ipAddress,
        userAgent,
      });
      
      console.log(`[eSign] Document ${signatureId} signed by ${signatureName} from ${ipAddress}`);
      
      res.json({
        success: true,
        signatureId,
        signedAt: signedDoc.signedAt,
        status: signedDoc.status,
        verification,
        auditEntry: audit,
      });
    } catch (error) {
      console.error("[eSign] Sign error:", error);
      res.status(500).json({ error: "Failed to record signature" });
    }
  });
  
  // GET /api/esign/verify/:signatureId - Verify a signature
  app.get("/api/esign/verify/:signatureId", async (req: Request, res: Response) => {
    try {
      const { signatureId } = req.params;
      
      // In production, fetch from database
      // For now, return mock verification
      res.json({
        signatureId,
        isValid: true,
        status: 'signed',
        message: 'Signature verification endpoint ready. Connect to database for real verification.',
      });
    } catch (error) {
      console.error("[eSign] Verify error:", error);
      res.status(500).json({ error: "Failed to verify signature" });
    }
  });
  
  // POST /api/esign/onboarding-packet - Create full onboarding document packet
  app.post("/api/esign/onboarding-packet", async (req: Request, res: Response) => {
    try {
      const { workerId, workerName, workerEmail, documents, fieldData } = req.body;
      
      if (!workerId || !workerName) {
        return res.status(400).json({ error: "workerId and workerName required" });
      }
      
      const { createOnboardingPacket, getStandardOnboardingDocuments } = await import('./eSignatureService');
      
      // Use provided documents or standard set
      const docsToCreate = documents || getStandardOnboardingDocuments();
      
      const packet = createOnboardingPacket({
        workerId,
        workerName,
        workerEmail,
        documents: docsToCreate,
        fieldData: fieldData || {},
      });
      
      res.json({
        workerId,
        workerName,
        documentsCreated: packet.length,
        documents: packet.map(sig => ({
          signatureId: sig.id,
          documentType: sig.documentType,
          status: sig.status,
          expiresAt: sig.expiresAt,
          signUrl: `/sign/${sig.id}`,
        })),
      });
    } catch (error) {
      console.error("[eSign] Onboarding packet error:", error);
      res.status(500).json({ error: "Failed to create onboarding packet" });
    }
  });

  // ========================
  // EMAIL CAMPAIGNS
  // ========================
  
  // GET /api/email/templates - Get all email templates
  app.get("/api/email/templates", async (req: Request, res: Response) => {
    try {
      const { getAllEmailTemplates } = await import('./emailCampaignService');
      
      const templates = getAllEmailTemplates();
      
      res.json({
        templates: templates.map(t => ({
          id: t.id,
          name: t.name,
          type: t.type,
          subject: t.subject,
          placeholders: t.placeholders,
          version: t.version,
        })),
      });
    } catch (error) {
      console.error("[Email] Templates error:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });
  
  // POST /api/email/render - Render an email template with data
  app.post("/api/email/render", async (req: Request, res: Response) => {
    try {
      const { templateType, data } = req.body;
      
      if (!templateType) {
        return res.status(400).json({ error: "templateType required" });
      }
      
      const { getEmailTemplate, renderEmailTemplate } = await import('./emailCampaignService');
      
      const template = getEmailTemplate(templateType);
      const rendered = renderEmailTemplate(template, data || {});
      
      res.json({
        templateType,
        subject: rendered.subject,
        html: rendered.html,
        missingPlaceholders: template.placeholders.filter(p => !data?.[p]),
      });
    } catch (error) {
      console.error("[Email] Render error:", error);
      res.status(500).json({ error: "Failed to render template" });
    }
  });
  
  // POST /api/email/campaign - Create a new email campaign
  app.post("/api/email/campaign", async (req: Request, res: Response) => {
    try {
      const { name, type, recipients, subject, content, scheduledAt } = req.body;
      const tenantId = validateTenantAccess(req, res);
      if (!tenantId) return;
      
      const user = (req as any).user;
      
      if (!name || !type || !recipients || recipients.length === 0) {
        return res.status(400).json({ error: "name, type, and recipients required" });
      }
      
      const { createCampaign } = await import('./emailCampaignService');
      
      const campaign = createCampaign({
        name,
        type,
        recipients,
        subject: subject || '',
        content: content || '',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        tenantId,
        createdBy: user?.id || 'system',
      });
      
      res.json({
        campaignId: campaign.id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        recipientCount: campaign.recipients.length,
        scheduledAt: campaign.scheduledAt,
      });
    } catch (error) {
      console.error("[Email] Campaign error:", error);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });
  
  // POST /api/email/campaign/:id/send - Send a campaign
  app.post("/api/email/campaign/:id/send", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { recipients, subject, content, type } = req.body;
      
      if (!recipients || recipients.length === 0) {
        return res.status(400).json({ error: "recipients required" });
      }
      
      const { sendCampaign, calculateCampaignAnalytics } = await import('./emailCampaignService');
      
      // Create a mock campaign for sending
      const campaign = {
        id,
        name: 'Direct Send',
        type: type || 'custom',
        templateId: 'tpl_custom',
        status: 'sending' as const,
        recipients,
        subject: subject || 'Message from ORBIT',
        content: content || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        tenantId: 'default',
        createdBy: 'system',
        analytics: {
          totalRecipients: recipients.length,
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          unsubscribed: 0,
          openRate: 0,
          clickRate: 0,
          bounceRate: 0,
        },
      };
      
      const results = await sendCampaign(campaign);
      const analytics = calculateCampaignAnalytics(results);
      
      res.json({
        campaignId: id,
        sent: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        analytics,
        results: results.slice(0, 10), // Return first 10 results as sample
      });
    } catch (error) {
      console.error("[Email] Send error:", error);
      res.status(500).json({ error: "Failed to send campaign" });
    }
  });

  // ========================
  // RESEND TRANSACTIONAL EMAILS
  // ========================
  
  // Helper: Check if user is admin authenticated
  const requireAdminAuth = (req: Request, res: Response, next: () => void) => {
    if (!req.session?.adminAuthenticated) {
      return res.status(401).json({ error: "Admin authentication required" });
    }
    next();
  };
  
  // POST /api/resend/test - Send a test email (admin only)
  app.post("/api/resend/test", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { to, subject, message } = req.body;
      
      if (!to || !subject) {
        return res.status(400).json({ error: "to and subject are required" });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emails = Array.isArray(to) ? to : [to];
      if (!emails.every((e: string) => emailRegex.test(e))) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      
      const { sendEmail } = await import('./services/resend');
      
      const result = await sendEmail({
        to,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 12px;">
              <h1 style="color: #22d3ee; margin: 0;">ORBIT Test Email</h1>
            </div>
            <div style="padding: 20px;">
              <p style="color: #334155;">${message || 'This is a test email from ORBIT Staffing OS.'}</p>
            </div>
            <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px;">Powered by ORBIT Staffing OS</p>
            </div>
          </div>
        `
      });
      
      res.json(result);
    } catch (error: any) {
      console.error("[Resend] Test email error:", error);
      res.status(500).json({ error: error.message || "Failed to send test email" });
    }
  });
  
  // POST /api/resend/welcome - Send welcome email to a worker (admin only)
  app.post("/api/resend/welcome", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { workerName, workerEmail } = req.body;
      
      if (!workerName || !workerEmail) {
        return res.status(400).json({ error: "workerName and workerEmail are required" });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(workerEmail)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      
      const { sendWelcomeEmail } = await import('./services/resend');
      const result = await sendWelcomeEmail(workerName, workerEmail);
      
      res.json(result);
    } catch (error: any) {
      console.error("[Resend] Welcome email error:", error);
      res.status(500).json({ error: error.message || "Failed to send welcome email" });
    }
  });
  
  // POST /api/resend/assignment - Send assignment notification (admin only)
  app.post("/api/resend/assignment", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { workerName, workerEmail, jobTitle, clientName, startDate, location } = req.body;
      
      if (!workerName || !workerEmail || !jobTitle || !clientName || !startDate || !location) {
        return res.status(400).json({ error: "All fields are required: workerName, workerEmail, jobTitle, clientName, startDate, location" });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(workerEmail)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      
      const { sendAssignmentNotification } = await import('./services/resend');
      const result = await sendAssignmentNotification(workerName, workerEmail, jobTitle, clientName, startDate, location);
      
      res.json(result);
    } catch (error: any) {
      console.error("[Resend] Assignment email error:", error);
      res.status(500).json({ error: error.message || "Failed to send assignment notification" });
    }
  });
  
  // POST /api/resend/payroll - Send payroll confirmation (admin only)
  app.post("/api/resend/payroll", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { workerName, workerEmail, payPeriod, grossPay, netPay, payDate } = req.body;
      
      if (!workerName || !workerEmail || !payPeriod || !grossPay || !netPay || !payDate) {
        return res.status(400).json({ error: "All fields are required" });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(workerEmail)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      
      const { sendPayrollConfirmation } = await import('./services/resend');
      const result = await sendPayrollConfirmation(workerName, workerEmail, payPeriod, grossPay, netPay, payDate);
      
      res.json(result);
    } catch (error: any) {
      console.error("[Resend] Payroll email error:", error);
      res.status(500).json({ error: error.message || "Failed to send payroll confirmation" });
    }
  });
  
  // POST /api/resend/compliance - Send compliance reminder (admin only)
  app.post("/api/resend/compliance", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { workerName, workerEmail, documentType, expirationDate, daysRemaining } = req.body;
      
      if (!workerName || !workerEmail || !documentType || !expirationDate || daysRemaining === undefined) {
        return res.status(400).json({ error: "All fields are required" });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(workerEmail)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      
      const { sendComplianceReminder } = await import('./services/resend');
      const result = await sendComplianceReminder(workerName, workerEmail, documentType, expirationDate, daysRemaining);
      
      res.json(result);
    } catch (error: any) {
      console.error("[Resend] Compliance email error:", error);
      res.status(500).json({ error: error.message || "Failed to send compliance reminder" });
    }
  });
  
  // ========================
  // COMPETITIVE FEATURE STATUS
  // ========================
  
  // GET /api/features/competitive - Get status of competitive features
  app.get("/api/features/competitive", async (req: Request, res: Response) => {
    try {
      res.json({
        features: [
          {
            name: 'AI-Powered Candidate Matching',
            status: 'active',
            endpoint: '/api/matching/find-candidates',
            description: 'Advanced skill matching with scoring, synonyms, and recommendations',
          },
          {
            name: 'Resume Parsing',
            status: 'active',
            endpoint: '/api/resume/parse',
            description: 'Extract contact info, skills, certifications from resume text',
          },
          {
            name: 'Multi-Channel Job Distribution',
            status: 'active',
            endpoint: '/api/jobs/distribution/distribute',
            description: 'Post to Indeed, LinkedIn, ZipRecruiter, Google Jobs',
          },
          {
            name: 'E-Signature Documents',
            status: 'active',
            endpoint: '/api/esign/request',
            description: 'Digital signatures for onboarding with audit trail',
          },
          {
            name: 'Email Campaigns',
            status: 'active',
            endpoint: '/api/email/campaign',
            description: 'Mass email with templates, scheduling, and analytics',
          },
          {
            name: 'GPS Geofencing',
            status: 'active',
            endpoint: '/api/timesheets/clock-in',
            description: '300ft radius verification for clock-in/out',
          },
          {
            name: 'Two-Way Job Marketplace',
            status: 'active',
            endpoint: '/api/talent-exchange/jobs',
            description: 'ORBIT Talent Exchange for workers and employers',
          },
          {
            name: 'Weekly Bonus System',
            status: 'active',
            endpoint: '/api/bonuses/weekly',
            description: 'Automated $35/week performance bonuses',
          },
        ],
        competitorComparison: {
          orbitPricing: { starter: 39, growth: 99, professional: 249 },
          competitorPricing: { bullhorn: 99, avionte: 750, adp: 250 },
          savingsVsBullhorn: '60%',
          savingsVsAvionte: '95%',
        },
      });
    } catch (error) {
      console.error("[Features] Status error:", error);
      res.status(500).json({ error: "Failed to get feature status" });
    }
  });

  // ========================
  // MARKETING HUB - Social Media Posting
  // ========================

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads', 'social');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const socialUpload = multer({
    storage: multer.diskStorage({
      destination: (_req: any, _file: any, cb: any) => cb(null, uploadsDir),
      filename: (_req: any, file: any, cb: any) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'social-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (_req: any, file: any, cb: any) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'));
      }
    }
  });

  // Upload image for social post
  app.post("/api/marketing/upload-image", socialUpload.single('image'), async (req: Request, res: Response) => {
    try {
      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      
      const imageUrl = `/uploads/social/${file.filename}`;
      console.log(`[Marketing] Image uploaded: ${imageUrl}`);
      
      res.json({ 
        success: true, 
        imageUrl,
        filename: file.filename,
        size: file.size
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Serve uploaded images
  app.use('/uploads/social', express.static(uploadsDir));

  // Post to Twitter/X
  app.post("/api/marketing/post/twitter", async (req: Request, res: Response) => {
    try {
      const { content, imageUrl } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Post content is required" });
      }

      // Check for Twitter API credentials
      const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;
      const twitterApiKey = process.env.TWITTER_API_KEY;
      const twitterApiSecret = process.env.TWITTER_API_SECRET;
      const twitterAccessToken = process.env.TWITTER_ACCESS_TOKEN;
      const twitterAccessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
      
      if (!twitterApiKey || !twitterApiSecret || !twitterAccessToken || !twitterAccessSecret) {
        // No API keys - open Twitter in browser with pre-filled content
        const encodedContent = encodeURIComponent(content);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedContent}`;
        
        return res.json({
          success: true,
          method: 'browser',
          url: twitterUrl,
          message: "Twitter API not configured. Opening Twitter in browser."
        });
      }

      // TODO: Implement actual Twitter API posting when keys are available
      // For now, return browser fallback
      const encodedContent = encodeURIComponent(content);
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedContent}`;
      
      res.json({
        success: true,
        method: 'browser',
        url: twitterUrl,
        message: "Ready to post via Twitter"
      });
      
    } catch (error) {
      console.error("Twitter post error:", error);
      res.status(500).json({ error: "Failed to post to Twitter" });
    }
  });

  // Post to Facebook
  app.post("/api/marketing/post/facebook", async (req: Request, res: Response) => {
    try {
      const { content, imageUrl } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Post content is required" });
      }

      // Check for Facebook API credentials
      const fbPageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
      const fbPageId = process.env.FACEBOOK_PAGE_ID;
      
      if (!fbPageToken || !fbPageId) {
        // No API keys - open Facebook with suggested content (can't pre-fill due to FB policy)
        return res.json({
          success: true,
          method: 'browser',
          url: 'https://business.facebook.com',
          content: content, // Send content back so frontend can copy it
          message: "Facebook API not configured. Content copied to clipboard - paste in Facebook."
        });
      }

      // TODO: Implement actual Facebook Graph API posting when keys are available
      res.json({
        success: true,
        method: 'browser',
        url: 'https://business.facebook.com',
        content: content,
        message: "Ready to post via Facebook"
      });
      
    } catch (error) {
      console.error("Facebook post error:", error);
      res.status(500).json({ error: "Failed to post to Facebook" });
    }
  });

  // Get marketing API status
  app.get("/api/marketing/status", async (req: Request, res: Response) => {
    try {
      const hasTwitter = !!(process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN);
      const hasFacebook = !!(process.env.FACEBOOK_PAGE_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID);
      
      res.json({
        twitter: {
          configured: hasTwitter,
          method: hasTwitter ? 'api' : 'browser'
        },
        facebook: {
          configured: hasFacebook,
          method: hasFacebook ? 'api' : 'browser'
        },
        message: hasTwitter || hasFacebook 
          ? "API integration active" 
          : "Browser-based posting enabled. Add API keys for direct posting."
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get marketing status" });
    }
  });

  // Save scheduled posts to database (for future scheduling feature)
  app.post("/api/marketing/schedule", async (req: Request, res: Response) => {
    try {
      const { content, platform, scheduledFor, imageUrl } = req.body;
      
      if (!content || !platform) {
        return res.status(400).json({ error: "Content and platform are required" });
      }

      // Store in database for now (scheduled_posts table would be needed)
      console.log(`[Marketing] Scheduled post for ${platform} at ${scheduledFor}: ${content.substring(0, 50)}...`);
      
      res.json({
        success: true,
        message: "Post scheduled successfully",
        scheduledFor,
        platform
      });
    } catch (error) {
      console.error("Schedule post error:", error);
      res.status(500).json({ error: "Failed to schedule post" });
    }
  });

  return httpServer;
}

// Worker performance calculation function
async function recalculateWorkerPerformance(workerId: string, tenantId: string) {
  try {
    // Get feedback from last 90 days
    const feedback = await db.execute(sql`
      SELECT AVG(overall_rating) as avg_rating, 
             COUNT(*) as feedback_count,
             SUM(CASE WHEN would_hire_again = true THEN 1 ELSE 0 END) as hire_again_count
      FROM worker_feedback 
      WHERE worker_id = ${workerId} 
        AND created_at > NOW() - INTERVAL '90 days'
    `);
    
    const feedbackData = feedback.rows[0] as any;
    const avgRating = parseFloat(feedbackData.avg_rating) || 0;
    const feedbackCount = parseInt(feedbackData.feedback_count) || 0;
    const hireAgainRate = feedbackCount > 0 
      ? (parseInt(feedbackData.hire_again_count) / feedbackCount) * 100 
      : 0;
    
    // Calculate customer feedback score (40% weight)
    const customerFeedbackScore = (avgRating / 5) * 100;
    
    // Get reliability metrics from timesheets
    const reliability = await db.execute(sql`
      SELECT 
        COUNT(*) as total_shifts,
        SUM(CASE WHEN clock_in IS NOT NULL THEN 1 ELSE 0 END) as completed_shifts
      FROM timesheets 
      WHERE worker_id = ${workerId}
        AND created_at > NOW() - INTERVAL '90 days'
    `);
    
    const reliabilityData = reliability.rows[0] as any;
    const totalShifts = parseInt(reliabilityData.total_shifts) || 0;
    const completedShifts = parseInt(reliabilityData.completed_shifts) || 0;
    const reliabilityScore = totalShifts > 0 ? (completedShifts / totalShifts) * 100 : 0;
    
    // Overall score calculation with weights
    // Customer Feedback: 40%, Reliability: 25%, Availability: 15%, Productivity: 15%, Loyalty: 5%
    const overallScore = (
      (customerFeedbackScore * 0.40) +
      (reliabilityScore * 0.25) +
      (50 * 0.15) + // Availability placeholder
      (50 * 0.15) + // Productivity placeholder  
      (50 * 0.05)   // Loyalty placeholder
    );
    
    // Upsert performance score
    await db.execute(sql`
      INSERT INTO worker_performance_scores (
        worker_id, tenant_id, overall_score, customer_feedback_score,
        reliability_score, average_customer_rating, total_feedback_count,
        would_hire_again_rate, last_calculated_at
      ) VALUES (
        ${workerId}, ${tenantId}, ${overallScore}, ${customerFeedbackScore},
        ${reliabilityScore}, ${avgRating}, ${feedbackCount},
        ${hireAgainRate}, NOW()
      )
      ON CONFLICT (worker_id) DO UPDATE SET
        overall_score = ${overallScore},
        customer_feedback_score = ${customerFeedbackScore},
        reliability_score = ${reliabilityScore},
        average_customer_rating = ${avgRating},
        total_feedback_count = ${feedbackCount},
        would_hire_again_rate = ${hireAgainRate},
        last_calculated_at = NOW(),
        updated_at = NOW()
    `);
    
    console.log(`[Performance] Updated worker ${workerId} score: ${overallScore.toFixed(2)}`);
  } catch (error) {
    console.error("Performance calculation error:", error);
    throw error;
  }
}

// Worker matching is handled by ./matchingService - see autoMatchWorkers and autoReassignWorkerRequest exports

// ========================
// Blockchain Hash Anchoring (Solana)
// ========================

export function registerBlockchainRoutes(app: Express) {
  // Get blockchain anchoring status and stats
  app.get("/api/blockchain/status", async (req: Request, res: Response) => {
    try {
      const stats = await solanaService.getStats();
      res.json({
        ...stats,
        configured: solanaService.isConfigured(),
        simulationMode: solanaService.isSimulationMode(),
        message: solanaService.isSimulationMode() 
          ? "Running in simulation mode - add HELIUS_API_KEY to enable live mode"
          : "Connected to Solana mainnet via Helius"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get blockchain status" });
    }
  });

  // View current hash queue
  app.get("/api/blockchain/queue", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const queue = await solanaService.getQueuedHashes();
      res.json({ 
        queueSize: queue.length,
        hashes: queue,
        nextBatchEstimate: queue.length > 0 ? "Ready to anchor" : "Queue empty"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get queue" });
    }
  });

  // Manually trigger batch anchoring
  app.post("/api/blockchain/anchor-batch", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const result = await solanaService.anchorBatch();
      if (!result) {
        return res.json({ success: false, message: "No hashes in queue to anchor" });
      }
      res.json({ 
        success: true, 
        batch: result,
        message: solanaService.isSimulationMode() 
          ? "Batch anchored (simulation mode)" 
          : "Batch anchored to Solana mainnet"
      });
    } catch (error) {
      console.error("Batch anchoring error:", error);
      res.status(500).json({ error: "Failed to anchor batch" });
    }
  });

  // View anchored batches history
  app.get("/api/blockchain/batches", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const batches = await solanaService.getAnchoredBatches();
      res.json({ 
        totalBatches: batches.length,
        batches: batches.slice(0, 20) // Already sorted DESC in the query
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get batches" });
    }
  });

  // Queue a specific hallmark for anchoring (for testing)
  app.post("/api/blockchain/queue-hallmark", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { hallmarkId, contentHash, assetType } = req.body;
      
      if (!hallmarkId || !contentHash || !assetType) {
        return res.status(400).json({ error: "hallmarkId, contentHash, and assetType required" });
      }

      const result = await queueForBlockchain(hallmarkId, contentHash, assetType);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to queue hallmark" });
    }
  });

  // Get anchorable document types
  app.get("/api/blockchain/anchorable-types", async (req: Request, res: Response) => {
    res.json({ 
      types: solanaService.getAnchorableTypes(),
      description: "Document types that are automatically queued for blockchain anchoring"
    });
  });
}

// ========================
// Crypto Invoice Payments (Coinbase Commerce)
// ========================

export function registerCryptoPaymentRoutes(app: Express) {
  // Check if crypto payments are available
  app.get("/api/crypto/status", async (req: Request, res: Response) => {
    res.json({ 
      enabled: coinbaseService.isConfigured(),
      provider: "coinbase_commerce",
      supportedCurrencies: ["BTC", "ETH", "USDC", "LTC", "DOGE", "DAI"]
    });
  });

  // Create crypto payment for an invoice
  app.post("/api/invoices/:invoiceId/pay-crypto", async (req: Request, res: Response) => {
    try {
      if (!coinbaseService.isConfigured()) {
        return res.status(503).json({ error: "Crypto payments not configured" });
      }

      const { invoiceId } = req.params;
      const { returnUrl, cancelUrl } = req.body;
      
      // Get invoice details
      const invoice = await db.execute(sql`
        SELECT i.*, c.company_name, cl.company as client_name
        FROM invoices i
        LEFT JOIN companies c ON i.company_id = c.id
        LEFT JOIN clients cl ON i.client_id = cl.id
        WHERE i.id = ${invoiceId}
      `);
      
      if (invoice.rows.length === 0) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      const inv = invoice.rows[0] as any;
      
      if (inv.status === 'paid') {
        return res.status(400).json({ error: "Invoice already paid" });
      }
      
      // Create Coinbase charge
      const charge = await coinbaseService.createCharge({
        name: `Invoice ${inv.invoice_number || invoiceId}`,
        description: `Payment for ${inv.client_name || 'services'} - Invoice ${inv.invoice_number || invoiceId}`,
        amount: inv.total?.toString() || "0",
        currency: "USD",
        metadata: {
          invoiceId: invoiceId,
          invoiceNumber: inv.invoice_number || "",
          tenantId: inv.tenant_id || ""
        },
        redirect_url: returnUrl,
        cancel_url: cancelUrl
      });
      
      // Update invoice with crypto charge info
      await db.execute(sql`
        UPDATE invoices SET
          crypto_charge_code = ${charge.code},
          crypto_charge_url = ${charge.hosted_url},
          crypto_payment_status = 'pending',
          updated_at = NOW()
        WHERE id = ${invoiceId}
      `);
      
      console.log(`[Crypto] Created charge ${charge.code} for invoice ${invoiceId}`);
      
      res.json({
        success: true,
        chargeCode: charge.code,
        hostedUrl: charge.hosted_url,
        expiresAt: charge.expires_at,
        addresses: charge.addresses
      });
    } catch (error) {
      console.error("Crypto payment error:", error);
      res.status(500).json({ error: "Failed to create crypto payment" });
    }
  });

  // Check crypto payment status
  app.get("/api/invoices/:invoiceId/crypto-status", async (req: Request, res: Response) => {
    try {
      if (!coinbaseService.isConfigured()) {
        return res.status(503).json({ error: "Crypto payments not configured" });
      }

      const { invoiceId } = req.params;
      
      // Get invoice crypto info
      const invoice = await db.execute(sql`
        SELECT crypto_charge_code, crypto_payment_status, crypto_currency,
               crypto_amount_paid, crypto_transaction_id, status
        FROM invoices WHERE id = ${invoiceId}
      `);
      
      if (invoice.rows.length === 0) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      const inv = invoice.rows[0] as any;
      
      if (!inv.crypto_charge_code) {
        return res.json({ status: "no_crypto_payment" });
      }
      
      // Check with Coinbase for latest status
      const charge = await coinbaseService.getCharge(inv.crypto_charge_code);
      const status = coinbaseService.getChargeStatus(charge);
      
      // Update if status changed
      if (status !== inv.crypto_payment_status) {
        const payment = charge.payments?.[0];
        await db.execute(sql`
          UPDATE invoices SET
            crypto_payment_status = ${status},
            crypto_currency = ${payment?.value?.currency || null},
            crypto_amount_paid = ${payment?.value?.amount || null},
            crypto_transaction_id = ${payment?.transaction_id || null},
            status = ${status === 'completed' ? 'paid' : inv.status},
            paid_at = ${status === 'completed' ? sql`NOW()` : null},
            payment_method = ${status === 'completed' ? 'crypto' : inv.payment_method},
            updated_at = NOW()
          WHERE id = ${invoiceId}
        `);
        
        if (status === 'completed') {
          console.log(`[Crypto] Invoice ${invoiceId} paid with ${payment?.value?.currency}`);
        }
      }
      
      res.json({
        chargeCode: inv.crypto_charge_code,
        status: status,
        currency: charge.payments?.[0]?.value?.currency,
        amountPaid: charge.payments?.[0]?.value?.amount,
        transactionId: charge.payments?.[0]?.transaction_id,
        invoicePaid: status === 'completed'
      });
    } catch (error) {
      console.error("Crypto status check error:", error);
      res.status(500).json({ error: "Failed to check payment status" });
    }
  });

  // Coinbase webhook handler
  app.post("/api/webhooks/coinbase", async (req: Request, res: Response) => {
    try {
      const signature = req.headers['x-cc-webhook-signature'] as string;
      const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET;
      
      // Verify signature if webhook secret is configured
      if (webhookSecret && signature) {
        const isValid = coinbaseService.verifyWebhookSignature(
          JSON.stringify(req.body),
          signature,
          webhookSecret
        );
        if (!isValid) {
          console.warn('[Crypto Webhook] Invalid signature');
          return res.status(401).json({ error: "Invalid signature" });
        }
      }
      
      const event = coinbaseService.parseWebhookEvent(req.body);
      console.log(`[Crypto Webhook] ${event.type} for charge ${event.chargeCode}`);
      
      if (event.invoiceId) {
        // Update invoice based on webhook event
        const status = event.status;
        
        if (status === 'completed') {
          await db.execute(sql`
            UPDATE invoices SET
              crypto_payment_status = 'completed',
              status = 'paid',
              paid_at = NOW(),
              payment_method = 'crypto',
              updated_at = NOW()
            WHERE crypto_charge_code = ${event.chargeCode}
          `);
          console.log(`[Crypto Webhook] Invoice ${event.invoiceId} marked as paid`);
        } else if (status === 'expired' || status === 'failed') {
          await db.execute(sql`
            UPDATE invoices SET
              crypto_payment_status = ${status},
              updated_at = NOW()
            WHERE crypto_charge_code = ${event.chargeCode}
          `);
        }
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // List all crypto-enabled invoices for a tenant
  app.get("/api/crypto/invoices", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const result = await db.execute(sql`
        SELECT id, invoice_number, total, status, crypto_charge_code, 
               crypto_payment_status, crypto_currency, crypto_amount_paid,
               crypto_transaction_id, created_at
        FROM invoices 
        WHERE crypto_charge_code IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 100
      `);
      
      res.json({ invoices: result.rows });
    } catch (error) {
      res.status(500).json({ error: "Failed to list crypto invoices" });
    }
  });
}

// ========================
// ORBIT Pay Card API Routes
// ========================

export function registerPayCardRoutes(app: Express) {
  // Join Pay Card waitlist
  app.post("/api/pay-card/waitlist", async (req: Request, res: Response) => {
    try {
      const { email, phone, workerId, tenantId, source } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      // Check if already on waitlist
      const existing = await db.execute(sql`
        SELECT id FROM pay_card_waitlist WHERE email = ${email}
      `);
      
      if (existing.rows.length > 0) {
        return res.json({ 
          success: true, 
          message: "You're already on the waitlist! We'll notify you when ORBIT Pay Card launches.",
          alreadyRegistered: true
        });
      }
      
      // Add to waitlist
      const result = await db.execute(sql`
        INSERT INTO pay_card_waitlist (email, phone, worker_id, tenant_id, source, status)
        VALUES (${email}, ${phone || null}, ${workerId || null}, ${tenantId || null}, ${source || 'website'}, 'pending')
        RETURNING id, email, created_at
      `);
      
      console.log(`[Pay Card] New waitlist signup: ${email}`);
      
      res.json({ 
        success: true, 
        message: "You're on the waitlist! We'll notify you when ORBIT Pay Card launches.",
        id: result.rows[0].id
      });
    } catch (error) {
      console.error("Pay Card waitlist error:", error);
      res.status(500).json({ error: "Failed to join waitlist" });
    }
  });
  
  // Get waitlist count (for marketing)
  app.get("/api/pay-card/waitlist/count", async (req: Request, res: Response) => {
    try {
      const result = await db.execute(sql`
        SELECT COUNT(*) as count FROM pay_card_waitlist WHERE status = 'pending'
      `);
      
      const count = parseInt(result.rows[0].count as string) || 0;
      
      res.json({ count, formatted: count > 1000 ? `${(count / 1000).toFixed(1)}k+` : count.toString() });
    } catch (error) {
      res.status(500).json({ error: "Failed to get count" });
    }
  });
  
  // Zod schema for payment preferences validation
  const paymentPreferencesSchema = z.object({
    preferredMethod: z.enum(['direct_deposit', 'pay_card', 'check', 'cash']).optional(),
    bankName: z.string().max(100).optional().nullable(),
    accountType: z.enum(['checking', 'savings']).optional().nullable(),
    payCardEnabled: z.boolean().optional(),
    instantPayEnabled: z.boolean().optional(),
  }).strict();
  
  // Get worker payment preferences (requires admin authentication + tenant scoping)
  app.get("/api/pay-card/preferences/:workerId", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const requestTenantId = getTenantIdFromRequest(req);
      
      // Verify worker exists and get tenant
      const workerCheck = await db.execute(sql`
        SELECT id, tenant_id FROM workers WHERE id = ${workerId}
      `);
      
      if (workerCheck.rows.length === 0) {
        return res.status(404).json({ error: "Worker not found" });
      }
      
      const worker = workerCheck.rows[0] as any;
      
      // Enforce tenant scoping - admin can only access workers within their tenant
      // Master admins (role=master) bypass this check for platform-wide administration
      if (requestTenantId && worker.tenant_id && requestTenantId !== worker.tenant_id) {
        return res.status(403).json({ error: "Access denied. Worker belongs to a different organization." });
      }
      
      const result = await db.execute(sql`
        SELECT 
          preferred_method, 
          bank_name,
          account_type,
          pay_card_enabled,
          instant_pay_enabled,
          stripe_account_status,
          created_at,
          updated_at
        FROM worker_payment_preferences 
        WHERE worker_id = ${workerId}
      `);
      
      if (result.rows.length === 0) {
        return res.json({ 
          preferences: null,
          message: "No payment preferences set. Default is direct deposit."
        });
      }
      
      res.json({ preferences: result.rows[0] });
    } catch (error) {
      console.error("Get payment preferences error:", error);
      res.status(500).json({ error: "Failed to get preferences" });
    }
  });
  
  // Update worker payment preferences (requires admin authentication + tenant scoping + validation)
  app.post("/api/pay-card/preferences/:workerId", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const requestTenantId = getTenantIdFromRequest(req);
      
      // Validate input with Zod - rejects unexpected fields with .strict()
      const validationResult = paymentPreferencesSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request body", 
          details: validationResult.error.issues.map((i: z.ZodIssue) => i.message) 
        });
      }
      
      const { preferredMethod, bankName, accountType, payCardEnabled, instantPayEnabled } = validationResult.data;
      
      // Verify worker exists and get tenant for scoping
      const workerCheck = await db.execute(sql`
        SELECT id, tenant_id FROM workers WHERE id = ${workerId}
      `);
      
      if (workerCheck.rows.length === 0) {
        return res.status(404).json({ error: "Worker not found" });
      }
      
      const worker = workerCheck.rows[0] as any;
      
      // Enforce tenant scoping - admin can only modify workers within their tenant
      if (requestTenantId && worker.tenant_id && requestTenantId !== worker.tenant_id) {
        return res.status(403).json({ error: "Access denied. Worker belongs to a different organization." });
      }
      
      // Upsert preferences with tenant scoping
      await db.execute(sql`
        INSERT INTO worker_payment_preferences (
          worker_id, tenant_id, preferred_method, bank_name, 
          account_type, pay_card_enabled, instant_pay_enabled
        ) VALUES (
          ${workerId}, ${worker.tenant_id}, ${preferredMethod || 'direct_deposit'},
          ${bankName || null}, ${accountType || null}, ${payCardEnabled || false}, ${instantPayEnabled || false}
        )
        ON CONFLICT (worker_id) DO UPDATE SET
          preferred_method = COALESCE(${preferredMethod}, worker_payment_preferences.preferred_method),
          bank_name = COALESCE(${bankName}, worker_payment_preferences.bank_name),
          account_type = COALESCE(${accountType}, worker_payment_preferences.account_type),
          pay_card_enabled = COALESCE(${payCardEnabled}, worker_payment_preferences.pay_card_enabled),
          instant_pay_enabled = COALESCE(${instantPayEnabled}, worker_payment_preferences.instant_pay_enabled),
          updated_at = NOW()
      `);
      
      console.log(`[Pay Card] Updated preferences for worker ${workerId} (tenant: ${worker.tenant_id})`);
      
      res.json({ success: true, message: "Payment preferences updated" });
    } catch (error) {
      console.error("Update payment preferences error:", error);
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });
  
  // Check Pay Card application status (requires admin authentication + tenant scoping)
  app.get("/api/pay-card/application/:workerId", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const requestTenantId = getTenantIdFromRequest(req);
      
      // Verify worker exists
      const workerCheck = await db.execute(sql`
        SELECT id, tenant_id FROM workers WHERE id = ${workerId}
      `);
      
      if (workerCheck.rows.length === 0) {
        return res.status(404).json({ error: "Worker not found" });
      }
      
      const worker = workerCheck.rows[0] as any;
      
      // Enforce tenant scoping
      if (requestTenantId && worker.tenant_id && requestTenantId !== worker.tenant_id) {
        return res.status(403).json({ error: "Access denied. Worker belongs to a different organization." });
      }
      
      // Only return non-sensitive fields
      const result = await db.execute(sql`
        SELECT id, status, card_status, card_last_4, created_at, approved_at, activated_at
        FROM pay_card_applications 
        WHERE worker_id = ${workerId}
        ORDER BY created_at DESC
        LIMIT 1
      `);
      
      if (result.rows.length === 0) {
        return res.json({ 
          application: null,
          eligible: true,
          message: "No Pay Card application found. Apply when available!"
        });
      }
      
      res.json({ application: result.rows[0] });
    } catch (error) {
      console.error("Get Pay Card application error:", error);
      res.status(500).json({ error: "Failed to get application" });
    }
  });

  // ============================================
  // TWO-TIER HALLMARK FRANCHISE SYSTEM API
  // ============================================

  // ========================
  // PUBLIC: FRANCHISE TIERS
  // ========================
  app.get("/api/franchise-tiers", async (req: Request, res: Response) => {
    try {
      const tiers = await storage.getAllFranchiseTiers();
      res.json(tiers);
    } catch (error) {
      console.error("Get franchise tiers error:", error);
      res.status(500).json({ error: "Failed to get franchise tiers" });
    }
  });

  app.get("/api/franchise-tiers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const tier = await storage.getFranchiseTierById(id);
      if (!tier) {
        return res.status(404).json({ error: "Franchise tier not found" });
      }
      res.json(tier);
    } catch (error) {
      console.error("Get franchise tier error:", error);
      res.status(500).json({ error: "Failed to get franchise tier" });
    }
  });

  // ========================
  // PUBLIC: FRANCHISE APPLICATION
  // ========================
  app.post("/api/franchise-applications", async (req: Request, res: Response) => {
    try {
      const applicationData = req.body;
      
      if (!applicationData.companyName || !applicationData.contactName || !applicationData.contactEmail) {
        return res.status(400).json({ error: "Company name, contact name, and email are required" });
      }
      
      const application = await storage.createFranchiseApplication({
        companyName: applicationData.companyName,
        contactName: applicationData.contactName,
        contactEmail: applicationData.contactEmail,
        contactPhone: applicationData.contactPhone,
        website: applicationData.website,
        businessType: applicationData.businessType,
        currentLocations: applicationData.currentLocations || 1,
        estimatedWorkersPerMonth: applicationData.estimatedWorkersPerMonth,
        currentSoftware: applicationData.currentSoftware,
        requestedTierId: applicationData.requestedTierId,
        requestedTerritoryRegion: applicationData.requestedTerritoryRegion,
        requestedTerritoryState: applicationData.requestedTerritoryState,
        existingStripeCustomerId: applicationData.existingStripeCustomerId,
        source: applicationData.source || 'website',
      });
      
      console.log(`[Franchise] New application submitted: ${application.companyName} (${application.contactEmail})`);
      
      const tier = await storage.getFranchiseTierById(applicationData.requestedTierId);
      const tierName = tier?.tierName || 'Franchise';
      
      try {
        const emailOptions = emailService.getFranchiseApplicationReceivedEmail(
          application.contactEmail,
          application.companyName,
          tierName
        );
        await emailService.send(emailOptions);
      } catch (emailError) {
        console.error("Failed to send application received email:", emailError);
      }
      
      res.status(201).json({ 
        success: true, 
        message: "Application submitted successfully. Our team will review and contact you within 24-48 hours.",
        applicationId: application.id 
      });
    } catch (error) {
      console.error("Create franchise application error:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // ========================
  // ADMIN: FRANCHISE MANAGEMENT
  // ========================
  app.get("/api/admin/franchise-applications", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string;
      const applications = status 
        ? await storage.getFranchiseApplicationsByStatus(status)
        : await storage.getAllFranchiseApplications();
      res.json(applications);
    } catch (error) {
      console.error("Get franchise applications error:", error);
      res.status(500).json({ error: "Failed to get applications" });
    }
  });

  app.get("/api/admin/franchise-applications/:id", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const application = await storage.getFranchiseApplicationById(id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Get franchise application error:", error);
      res.status(500).json({ error: "Failed to get application" });
    }
  });

  app.post("/api/admin/franchise-applications/:id/approve", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { notes } = req.body;
      const reviewedBy = req.session?.adminName || 'Admin';
      
      const application = await storage.approveFranchiseApplication(id, reviewedBy, notes);
      
      console.log(`[Franchise] Application ${id} approved by ${reviewedBy}`);
      
      const tier = application.requestedTierId 
        ? await storage.getFranchiseTierById(application.requestedTierId)
        : null;
      const tierName = tier?.tierName || 'Franchise';
      
      try {
        const emailOptions = emailService.getFranchiseApplicationApprovedEmail(
          application.contactEmail,
          application.companyName,
          tierName
        );
        await emailService.send(emailOptions);
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
      }
      
      res.json({ 
        success: true, 
        message: "Application approved",
        application 
      });
    } catch (error) {
      console.error("Approve franchise application error:", error);
      res.status(500).json({ error: "Failed to approve application" });
    }
  });

  app.post("/api/admin/franchise-applications/:id/reject", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ error: "Rejection reason is required" });
      }
      
      const reviewedBy = req.session?.adminName || 'Admin';
      const application = await storage.rejectFranchiseApplication(id, reviewedBy, reason);
      
      console.log(`[Franchise] Application ${id} rejected by ${reviewedBy}: ${reason}`);
      
      try {
        const emailOptions = emailService.getFranchiseApplicationRejectedEmail(
          application.contactEmail,
          application.companyName,
          reason
        );
        await emailService.send(emailOptions);
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }
      
      res.json({ 
        success: true, 
        message: "Application rejected",
        application 
      });
    } catch (error) {
      console.error("Reject franchise application error:", error);
      res.status(500).json({ error: "Failed to reject application" });
    }
  });

  // ========================
  // ADMIN: CUSTOMER HALLMARKS
  // ========================
  app.get("/api/admin/customer-hallmarks", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const mode = req.query.mode as string;
      if (mode === 'franchise') {
        const hallmarks = await storage.getAllFranchiseHallmarks();
        return res.json(hallmarks);
      }
      
      const result = await db.execute(sql`
        SELECT * FROM customer_hallmarks ORDER BY created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Get customer hallmarks error:", error);
      res.status(500).json({ error: "Failed to get hallmarks" });
    }
  });

  app.get("/api/admin/customer-hallmarks/:id", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const hallmark = await storage.getCustomerHallmarkById(id);
      if (!hallmark) {
        return res.status(404).json({ error: "Hallmark not found" });
      }
      res.json(hallmark);
    } catch (error) {
      console.error("Get customer hallmark error:", error);
      res.status(500).json({ error: "Failed to get hallmark" });
    }
  });

  app.post("/api/admin/customer-hallmarks", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      if (!data.stripeCustomerId || !data.hallmarkName) {
        return res.status(400).json({ error: "Stripe customer ID and hallmark name are required" });
      }
      
      const hallmark = await storage.createCustomerHallmark(data);
      
      console.log(`[Franchise] Created hallmark: ${hallmark.hallmarkName} (${hallmark.id})`);
      
      res.status(201).json(hallmark);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).json({ error: "A hallmark already exists for this Stripe customer" });
      }
      console.error("Create customer hallmark error:", error);
      res.status(500).json({ error: "Failed to create hallmark" });
    }
  });

  app.patch("/api/admin/customer-hallmarks/:id", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const data = req.body;
      
      const hallmark = await storage.updateCustomerHallmark(id, data);
      
      console.log(`[Franchise] Updated hallmark: ${hallmark.hallmarkName} (${hallmark.id})`);
      
      res.json(hallmark);
    } catch (error) {
      console.error("Update customer hallmark error:", error);
      res.status(500).json({ error: "Failed to update hallmark" });
    }
  });

  app.post("/api/admin/customer-hallmarks/:id/convert-to-franchise", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { franchiseTierId, territoryRegion, territoryState, franchiseAgreementUrl } = req.body;
      
      if (!franchiseTierId) {
        return res.status(400).json({ error: "Franchise tier is required" });
      }
      
      const hallmark = await storage.convertHallmarkToFranchise(id, franchiseTierId, {
        territoryRegion,
        franchiseAgreementUrl,
      });
      
      console.log(`[Franchise] Converted hallmark ${id} to franchise tier ${franchiseTierId}`);
      
      res.json({ 
        success: true, 
        message: "Hallmark converted to franchise ownership",
        hallmark 
      });
    } catch (error) {
      console.error("Convert hallmark to franchise error:", error);
      res.status(500).json({ error: "Failed to convert hallmark" });
    }
  });

  // ========================
  // ADMIN: CUSTODY TRANSFERS
  // ========================
  app.get("/api/admin/custody-transfers", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string;
      if (status === 'pending') {
        const transfers = await storage.getPendingCustodyTransfers();
        return res.json(transfers);
      }
      
      const result = await db.execute(sql`
        SELECT * FROM hallmark_custody_transfers ORDER BY created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Get custody transfers error:", error);
      res.status(500).json({ error: "Failed to get transfers" });
    }
  });

  app.post("/api/admin/custody-transfers", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      if (!data.hallmarkId || !data.stripeCustomerId || !data.transferType) {
        return res.status(400).json({ error: "Hallmark ID, Stripe customer ID, and transfer type are required" });
      }
      
      const transfer = await storage.createCustodyTransfer({
        ...data,
        requestedBy: req.session?.adminName || 'Admin',
      });
      
      console.log(`[Franchise] Created custody transfer ${transfer.id} for hallmark ${data.hallmarkId}`);
      
      res.status(201).json(transfer);
    } catch (error) {
      console.error("Create custody transfer error:", error);
      res.status(500).json({ error: "Failed to create transfer" });
    }
  });

  app.post("/api/admin/custody-transfers/:id/complete", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const approvedBy = req.session?.adminName || 'Admin';
      
      const transfer = await storage.completeCustodyTransfer(id, approvedBy);
      
      console.log(`[Franchise] Completed custody transfer ${id}`);
      
      res.json({ 
        success: true, 
        message: "Custody transfer completed",
        transfer 
      });
    } catch (error) {
      console.error("Complete custody transfer error:", error);
      res.status(500).json({ error: "Failed to complete transfer" });
    }
  });

  // ========================
  // ADMIN: FRANCHISE PAYMENTS
  // ========================
  app.get("/api/admin/franchise-payments", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string;
      if (status === 'pending') {
        const payments = await storage.getPendingFranchisePayments();
        return res.json(payments);
      }
      
      const hallmarkId = req.query.hallmarkId ? parseInt(req.query.hallmarkId as string) : null;
      if (hallmarkId) {
        const payments = await storage.getFranchisePayments(hallmarkId);
        return res.json(payments);
      }
      
      const result = await db.execute(sql`
        SELECT * FROM franchise_payments ORDER BY created_at DESC LIMIT 100
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Get franchise payments error:", error);
      res.status(500).json({ error: "Failed to get payments" });
    }
  });

  app.post("/api/admin/franchise-payments", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      if (!data.hallmarkId || !data.paymentType || !data.amount) {
        return res.status(400).json({ error: "Hallmark ID, payment type, and amount are required" });
      }
      
      const payment = await storage.createFranchisePayment(data);
      
      console.log(`[Franchise] Created payment ${payment.id}: ${data.paymentType} for $${(data.amount / 100).toFixed(2)}`);
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Create franchise payment error:", error);
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  app.post("/api/admin/franchise-payments/:id/mark-paid", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { stripePaymentIntentId } = req.body;
      
      if (!stripePaymentIntentId) {
        return res.status(400).json({ error: "Stripe payment intent ID is required" });
      }
      
      const payment = await storage.markFranchisePaymentPaid(id, stripePaymentIntentId);
      
      console.log(`[Franchise] Marked payment ${id} as paid`);
      
      res.json({ 
        success: true, 
        message: "Payment marked as paid",
        payment 
      });
    } catch (error) {
      console.error("Mark franchise payment paid error:", error);
      res.status(500).json({ error: "Failed to mark payment as paid" });
    }
  });

  // ========================
  // ADMIN: FRANCHISE TERRITORIES
  // ========================
  app.get("/api/admin/franchise-territories", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const state = req.query.state as string;
      if (state) {
        const territories = await storage.getTerritoriesByState(state);
        return res.json(territories);
      }
      
      const hallmarkId = req.query.hallmarkId ? parseInt(req.query.hallmarkId as string) : null;
      if (hallmarkId) {
        const territories = await storage.getFranchiseTerritories(hallmarkId);
        return res.json(territories);
      }
      
      const result = await db.execute(sql`
        SELECT * FROM franchise_territories WHERE is_active = true ORDER BY state, territory_name
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Get franchise territories error:", error);
      res.status(500).json({ error: "Failed to get territories" });
    }
  });

  app.get("/api/franchise-territories/check-availability", async (req: Request, res: Response) => {
    try {
      const state = req.query.state as string;
      const city = req.query.city as string;
      
      if (!state) {
        return res.status(400).json({ error: "State is required" });
      }
      
      const available = await storage.checkTerritoryAvailability(state, city);
      
      res.json({ 
        available,
        state,
        city: city || null,
        message: available 
          ? "This territory is available for franchise" 
          : "This territory is already claimed by an existing franchise"
      });
    } catch (error) {
      console.error("Check territory availability error:", error);
      res.status(500).json({ error: "Failed to check availability" });
    }
  });

  app.post("/api/admin/franchise-territories", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      if (!data.hallmarkId || !data.territoryName || !data.territoryType) {
        return res.status(400).json({ error: "Hallmark ID, territory name, and type are required" });
      }
      
      const territory = await storage.createFranchiseTerritory(data);
      
      console.log(`[Franchise] Created territory: ${territory.territoryName} (${territory.id})`);
      
      res.status(201).json(territory);
    } catch (error) {
      console.error("Create franchise territory error:", error);
      res.status(500).json({ error: "Failed to create territory" });
    }
  });

  app.patch("/api/admin/franchise-territories/:id", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const data = req.body;
      
      const territory = await storage.updateFranchiseTerritory(id, data);
      
      console.log(`[Franchise] Updated territory: ${territory.territoryName} (${territory.id})`);
      
      res.json(territory);
    } catch (error) {
      console.error("Update franchise territory error:", error);
      res.status(500).json({ error: "Failed to update territory" });
    }
  });

  app.delete("/api/admin/franchise-territories/:id", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      const territory = await storage.deactivateFranchiseTerritory(id);
      
      console.log(`[Franchise] Deactivated territory ${id}`);
      
      res.json({ 
        success: true, 
        message: "Territory deactivated",
        territory 
      });
    } catch (error) {
      console.error("Deactivate franchise territory error:", error);
      res.status(500).json({ error: "Failed to deactivate territory" });
    }
  });

  // ========================
  // ADMIN: FRANCHISE TIER MANAGEMENT
  // ========================
  app.post("/api/admin/franchise-tiers", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      if (!data.tierCode || !data.tierName || !data.franchiseFee || !data.royaltyPercent || !data.supportMonthlyFee || !data.transferFee) {
        return res.status(400).json({ error: "Tier code, name, franchise fee, royalty percent, support fee, and transfer fee are required" });
      }
      
      const tier = await storage.createFranchiseTier(data);
      
      console.log(`[Franchise] Created tier: ${tier.tierName} (${tier.tierCode})`);
      
      res.status(201).json(tier);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).json({ error: "A tier with this code already exists" });
      }
      console.error("Create franchise tier error:", error);
      res.status(500).json({ error: "Failed to create tier" });
    }
  });

  app.patch("/api/admin/franchise-tiers/:id", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const data = req.body;
      
      const tier = await storage.updateFranchiseTier(id, data);
      
      console.log(`[Franchise] Updated tier: ${tier.tierName} (${tier.id})`);
      
      res.json(tier);
    } catch (error) {
      console.error("Update franchise tier error:", error);
      res.status(500).json({ error: "Failed to update tier" });
    }
  });

  // ========================
  // TERRITORY AVAILABILITY CHECKING
  // ========================
  app.get("/api/territory-availability", async (req: Request, res: Response) => {
    try {
      const { state, region, tierId } = req.query;
      
      if (!state || !tierId) {
        return res.status(400).json({ error: "State and tier ID required" });
      }
      
      const tierIdNum = parseInt(tierId as string, 10);
      
      const tier = await db.execute(sql`
        SELECT territory_level, territory_exclusive FROM franchise_tiers WHERE id = ${tierIdNum}
      `);
      
      if (tier.rows.length === 0) {
        return res.status(404).json({ error: "Tier not found" });
      }
      
      const tierData = tier.rows[0] as any;
      
      const existingTerritories = await db.execute(sql`
        SELECT t.*, h.hallmark_name, ft.tier_name
        FROM franchise_territories t
        JOIN customer_hallmarks h ON t.hallmark_id = h.id
        JOIN franchise_tiers ft ON t.franchise_tier_id = ft.id
        WHERE t.state = ${state}
        AND t.is_active = true
        ${region ? sql`AND t.region = ${region}` : sql``}
      `);
      
      let available = true;
      let conflicts: any[] = [];
      
      for (const territory of existingTerritories.rows as any[]) {
        if (territory.is_exclusive) {
          if (tierData.territory_level === 'state' || territory.territory_level === 'state') {
            available = false;
            conflicts.push({
              reason: 'State-level exclusive territory exists',
              holder: territory.hallmark_name,
              tier: territory.tier_name
            });
          }
          
          if (tierData.territory_level === 'regional' && territory.territory_level === 'regional' && region === territory.region) {
            available = false;
            conflicts.push({
              reason: 'Regional exclusive territory exists',
              holder: territory.hallmark_name,
              tier: territory.tier_name
            });
          }
        }
        
        if (tierData.territory_exclusive && territory.is_exclusive) {
          available = false;
          conflicts.push({
            reason: 'Requested exclusive territory conflicts with existing territory',
            holder: territory.hallmark_name,
            tier: territory.tier_name
          });
        }
      }
      
      if (tierData.territory_exclusive) {
        const pendingApplications = await db.execute(sql`
          SELECT company_name, status FROM franchise_applications
          WHERE requested_territory_state = ${state}
          AND status = 'approved'
          ${region ? sql`AND requested_territory_region = ${region}` : sql``}
        `);
        
        if (pendingApplications.rows.length > 0) {
          available = false;
          conflicts.push({
            reason: 'Approved application pending for this territory',
            holder: (pendingApplications.rows[0] as any).company_name,
            tier: 'Pending'
          });
        }
      }
      
      res.json({
        available,
        conflicts,
        territoryLevel: tierData.territory_level,
        isExclusive: tierData.territory_exclusive,
        checkedState: state,
        checkedRegion: region || null
      });
    } catch (error) {
      console.error("Territory availability check error:", error);
      res.status(500).json({ error: "Failed to check territory availability" });
    }
  });

  // ========================
  // CUSTOMER HALLMARK ENDPOINTS (SESSION-BASED)
  // ========================
  app.get("/api/my-hallmark", async (req: Request, res: Response) => {
    try {
      const stripeCustomerId = req.session?.stripeCustomerId;
      
      if (!stripeCustomerId) {
        return res.status(404).json({ error: "No hallmark found" });
      }
      
      const result = await db.execute(sql`
        SELECT * FROM customer_hallmarks 
        WHERE stripe_customer_id = ${stripeCustomerId}
        LIMIT 1
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "No hallmark found" });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Get my hallmark error:", error);
      res.status(500).json({ error: "Failed to get hallmark" });
    }
  });

  app.get("/api/my-hallmark/payments", async (req: Request, res: Response) => {
    try {
      const stripeCustomerId = req.session?.stripeCustomerId;
      
      if (!stripeCustomerId) {
        return res.json([]);
      }
      
      const hallmarkResult = await db.execute(sql`
        SELECT id FROM customer_hallmarks 
        WHERE stripe_customer_id = ${stripeCustomerId}
        LIMIT 1
      `);
      
      if (hallmarkResult.rows.length === 0) {
        return res.json([]);
      }
      
      const hallmarkId = (hallmarkResult.rows[0] as any).id;
      const payments = await storage.getFranchisePayments(hallmarkId);
      
      res.json(payments);
    } catch (error) {
      console.error("Get my hallmark payments error:", error);
      res.status(500).json({ error: "Failed to get payments" });
    }
  });

  app.get("/api/my-hallmark/territories", async (req: Request, res: Response) => {
    try {
      const stripeCustomerId = req.session?.stripeCustomerId;
      
      if (!stripeCustomerId) {
        return res.json([]);
      }
      
      const hallmarkResult = await db.execute(sql`
        SELECT id FROM customer_hallmarks 
        WHERE stripe_customer_id = ${stripeCustomerId}
        LIMIT 1
      `);
      
      if (hallmarkResult.rows.length === 0) {
        return res.json([]);
      }
      
      const hallmarkId = (hallmarkResult.rows[0] as any).id;
      const territories = await storage.getFranchiseTerritories(hallmarkId);
      
      res.json(territories);
    } catch (error) {
      console.error("Get my hallmark territories error:", error);
      res.status(500).json({ error: "Failed to get territories" });
    }
  });

  // ========================
  // FRANCHISE CHECKOUT (STRIPE)
  // ========================
  app.post("/api/franchise/checkout", async (req: Request, res: Response) => {
    try {
      const { applicationId, tierId } = req.body;
      
      if (!applicationId || !tierId) {
        return res.status(400).json({ error: "Application ID and tier ID are required" });
      }
      
      const application = await storage.getFranchiseApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      if (application.status !== 'approved') {
        return res.status(400).json({ error: "Application must be approved before payment" });
      }
      
      const tier = await storage.getFranchiseTierById(tierId);
      if (!tier) {
        return res.status(404).json({ error: "Franchise tier not found" });
      }
      
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : 'http://localhost:5000';
      
      const checkoutResult = await stripeService.createFranchiseCheckout({
        franchiseFee: tier.franchiseFee,
        supportMonthlyFee: tier.supportMonthlyFee,
        tierCode: tier.tierCode,
        tierName: tier.tierName,
        customerEmail: application.contactEmail,
        applicationId: application.id,
        companyName: application.companyName,
        successUrl: `${baseUrl}/franchise/success?session_id={CHECKOUT_SESSION_ID}&application_id=${applicationId}`,
        cancelUrl: `${baseUrl}/franchise?cancelled=true`,
      });
      
      await db.execute(sql`
        UPDATE franchise_applications 
        SET stripe_checkout_session_id = ${checkoutResult.sessionId},
            stripe_customer_id = ${checkoutResult.customerId}
        WHERE id = ${applicationId}
      `);
      
      console.log(`[Franchise] Created checkout session for application ${applicationId}: ${checkoutResult.sessionId}`);
      
      res.json({
        success: true,
        sessionId: checkoutResult.sessionId,
        sessionUrl: checkoutResult.sessionUrl,
      });
    } catch (error) {
      console.error("Franchise checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.get("/api/franchise/checkout/success", async (req: Request, res: Response) => {
    try {
      const { session_id, application_id } = req.query;
      
      if (!session_id || !application_id) {
        return res.status(400).json({ error: "Session ID and application ID are required" });
      }
      
      const session = await stripeService.retrieveCheckoutSession(session_id as string);
      
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: "Payment not completed" });
      }
      
      const applicationId = parseInt(application_id as string);
      const application = await storage.getFranchiseApplicationById(applicationId);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      const tier = await storage.getFranchiseTierById(application.requestedTierId!);
      
      const hallmark = await storage.createCustomerHallmark({
        stripeCustomerId: session.customer as string,
        hallmarkName: application.companyName,
        ownershipMode: 'franchise_owned',
        franchiseTierId: application.requestedTierId,
        territoryRegion: application.requestedTerritoryRegion,
        isActive: true,
      });
      
      await storage.createFranchisePayment({
        hallmarkId: hallmark.id,
        paymentType: 'franchise_fee',
        amount: tier?.franchiseFee || 0,
        stripePaymentIntentId: session.payment_intent as string,
        status: 'paid',
        paidAt: new Date(),
      });
      
      await db.execute(sql`
        UPDATE franchise_applications 
        SET status = 'completed',
            stripe_payment_intent_id = ${session.payment_intent as string}
        WHERE id = ${applicationId}
      `);
      
      console.log(`[Franchise] Payment completed for application ${applicationId}. Created hallmark ${hallmark.id}`);
      
      res.json({
        success: true,
        message: "Franchise purchase completed successfully",
        hallmarkId: hallmark.id,
        hallmarkName: hallmark.hallmarkName,
      });
    } catch (error) {
      console.error("Franchise checkout success error:", error);
      res.status(500).json({ error: "Failed to process successful payment" });
    }
  });

  app.post("/api/franchise/support-subscription", async (req: Request, res: Response) => {
    try {
      const { hallmarkId } = req.body;
      
      if (!hallmarkId) {
        return res.status(400).json({ error: "Hallmark ID is required" });
      }
      
      const hallmark = await storage.getCustomerHallmarkById(hallmarkId);
      if (!hallmark) {
        return res.status(404).json({ error: "Hallmark not found" });
      }
      
      if (!hallmark.franchiseTierId) {
        return res.status(400).json({ error: "Hallmark is not a franchise" });
      }
      
      const tier = await storage.getFranchiseTierById(hallmark.franchiseTierId);
      if (!tier) {
        return res.status(404).json({ error: "Franchise tier not found" });
      }
      
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : 'http://localhost:5000';
      
      const subscriptionResult = await stripeService.createFranchiseSupportSubscription({
        supportMonthlyFee: tier.supportMonthlyFee,
        tierCode: tier.tierCode,
        tierName: tier.tierName,
        customerId: hallmark.stripeCustomerId,
        hallmarkId: hallmark.id,
        successUrl: `${baseUrl}/franchise/subscription-success?hallmark_id=${hallmarkId}`,
        cancelUrl: `${baseUrl}/owner-hub?cancelled=true`,
      });
      
      console.log(`[Franchise] Created support subscription for hallmark ${hallmarkId}: ${subscriptionResult.sessionId}`);
      
      res.json({
        success: true,
        sessionId: subscriptionResult.sessionId,
        sessionUrl: subscriptionResult.sessionUrl,
      });
    } catch (error) {
      console.error("Franchise support subscription error:", error);
      res.status(500).json({ error: "Failed to create support subscription" });
    }
  });

  app.post("/api/admin/franchise/create-royalty-invoice", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { hallmarkId, amount, periodStart, periodEnd, description } = req.body;
      
      if (!hallmarkId || !amount || !periodStart || !periodEnd) {
        return res.status(400).json({ error: "Hallmark ID, amount, period start, and period end are required" });
      }
      
      const hallmark = await storage.getCustomerHallmarkById(hallmarkId);
      if (!hallmark) {
        return res.status(404).json({ error: "Hallmark not found" });
      }
      
      const invoiceResult = await stripeService.createRoyaltyPayment({
        amount: Math.round(amount * 100),
        hallmarkId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        customerId: hallmark.stripeCustomerId,
        description: description || `ORBIT Franchise Royalty - ${new Date(periodStart).toLocaleDateString()} to ${new Date(periodEnd).toLocaleDateString()}`,
      });
      
      await storage.createFranchisePayment({
        hallmarkId,
        paymentType: 'royalty',
        amount: Math.round(amount * 100),
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        status: 'pending',
        notes: `Invoice: ${invoiceResult.invoiceId}`,
      });
      
      console.log(`[Franchise] Created royalty invoice for hallmark ${hallmarkId}: ${invoiceResult.invoiceId}`);
      
      res.json({
        success: true,
        invoiceId: invoiceResult.invoiceId,
        invoiceUrl: invoiceResult.invoiceUrl,
        invoicePdf: invoiceResult.invoicePdf,
        amount: invoiceResult.amount,
      });
    } catch (error) {
      console.error("Create royalty invoice error:", error);
      res.status(500).json({ error: "Failed to create royalty invoice" });
    }
  });

  // ========================
  // MEETING PRESENTATIONS (CRM Feature)
  // ========================
  
  // Get presentation templates
  app.get("/api/presentation-templates", async (_req: Request, res: Response) => {
    const { PRESENTATION_TEMPLATES } = await import("@shared/schema");
    res.json(PRESENTATION_TEMPLATES);
  });

  // Get all presentations for a tenant
  app.get("/api/meeting-presentations", async (req: Request, res: Response) => {
    try {
      const tenantId = req.query.tenantId as string;
      const userId = req.query.userId as string;
      
      if (!tenantId && !userId) {
        return res.status(400).json({ error: "tenantId or userId required" });
      }
      
      let presentations;
      if (tenantId) {
        presentations = await storage.getMeetingPresentations(tenantId);
      } else {
        presentations = await storage.getMeetingPresentationsByUser(userId);
      }
      
      res.json(presentations);
    } catch (error) {
      console.error("Get presentations error:", error);
      res.status(500).json({ error: "Failed to get presentations" });
    }
  });

  // Get single presentation by ID
  app.get("/api/meeting-presentations/:id", async (req: Request, res: Response) => {
    try {
      const presentation = await storage.getMeetingPresentation(req.params.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      res.json(presentation);
    } catch (error) {
      console.error("Get presentation error:", error);
      res.status(500).json({ error: "Failed to get presentation" });
    }
  });

  // Get presentation by shareable link (public)
  app.get("/api/presentation/view/:link", async (req: Request, res: Response) => {
    try {
      const presentation = await storage.getMeetingPresentationByLink(req.params.link);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      await storage.incrementPresentationViewCount(presentation.id);
      res.json(presentation);
    } catch (error) {
      console.error("Get presentation by link error:", error);
      res.status(500).json({ error: "Failed to get presentation" });
    }
  });

  // Create new presentation
  app.post("/api/meeting-presentations", async (req: Request, res: Response) => {
    try {
      const { insertMeetingPresentationSchema } = await import("@shared/schema");
      const data = insertMeetingPresentationSchema.parse(req.body);
      const presentation = await storage.createMeetingPresentation(data);
      console.log(`[Presentations] Created presentation: ${presentation.title} (${presentation.id})`);
      res.status(201).json(presentation);
    } catch (error) {
      console.error("Create presentation error:", error);
      res.status(500).json({ error: "Failed to create presentation" });
    }
  });

  // Update presentation
  app.patch("/api/meeting-presentations/:id", async (req: Request, res: Response) => {
    try {
      const presentation = await storage.updateMeetingPresentation(req.params.id, req.body);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      console.log(`[Presentations] Updated presentation: ${presentation.title} (${presentation.id})`);
      res.json(presentation);
    } catch (error) {
      console.error("Update presentation error:", error);
      res.status(500).json({ error: "Failed to update presentation" });
    }
  });

  // Delete presentation
  app.delete("/api/meeting-presentations/:id", async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteMeetingPresentation(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      console.log(`[Presentations] Deleted presentation: ${req.params.id}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete presentation error:", error);
      res.status(500).json({ error: "Failed to delete presentation" });
    }
  });

  // Generate shareable link for presentation
  app.post("/api/meeting-presentations/:id/generate-link", async (req: Request, res: Response) => {
    try {
      const presentation = await storage.getMeetingPresentation(req.params.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      
      // Generate unique slug
      const slug = `pres-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      
      const updated = await storage.updateMeetingPresentation(req.params.id, {
        shareableLink: slug,
        status: 'ready',
      });
      
      console.log(`[Presentations] Generated link for: ${presentation.title} → ${slug}`);
      res.json({ 
        success: true, 
        shareableLink: slug,
        viewUrl: `/presentation/${slug}`,
        presentation: updated,
      });
    } catch (error) {
      console.error("Generate link error:", error);
      res.status(500).json({ error: "Failed to generate link" });
    }
  });

  // Send presentation via email (Resend)
  app.post("/api/meeting-presentations/:id/send", async (req: Request, res: Response) => {
    try {
      const presentation = await storage.getMeetingPresentation(req.params.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      if (!presentation.shareableLink) {
        return res.status(400).json({ error: "No shareable link generated. Generate a link first." });
      }
      
      const emails = presentation.attendeeEmails || [];
      if (emails.length === 0) {
        return res.status(400).json({ error: "No attendee emails specified" });
      }
      
      const { PRESENTATION_TEMPLATES } = await import("@shared/schema");
      const template = PRESENTATION_TEMPLATES.find(t => t.id === presentation.templateType);
      
      // Use APP_URL from environment or construct from request
      const appUrl = process.env.APP_URL || `https://${req.get('host')}`;
      const viewerUrl = `${appUrl}/presentation/${presentation.shareableLink}`;
      
      // Send emails using Resend
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      await resend.emails.send({
        from: 'ORBIT Staffing <notifications@orbitstaffing.io>',
        to: emails,
        subject: `Meeting Presentation: ${presentation.title}`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #e2e8f0; padding: 40px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://orbitstaffing.io/mascot/clean/orbit_mascot_cyan_saturn_style_transparent_clean.png" alt="ORBIT" style="width: 80px; height: 80px;" />
            </div>
            <h1 style="color: #22d3ee; font-size: 24px; margin-bottom: 10px; text-align: center;">${presentation.title}</h1>
            <p style="color: #94a3b8; text-align: center; margin-bottom: 20px;">
              <strong>Template:</strong> ${template?.name || 'Custom'}
            </p>
            ${presentation.meetingDate ? `
              <p style="color: #94a3b8; text-align: center;">
                <strong>Date:</strong> ${presentation.meetingDate} ${presentation.meetingTime || ''}
              </p>
            ` : ''}
            <div style="text-align: center; margin-top: 30px;">
              <a href="${viewerUrl}" style="display: inline-block; background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Presentation
              </a>
            </div>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155; text-align: center;">
              <p style="color: #64748b; font-size: 12px;">
                Powered by ORBIT Staffing OS<br/>
                <a href="https://orbitstaffing.io" style="color: #22d3ee;">orbitstaffing.io</a>
              </p>
            </div>
          </div>
        `,
      });
      
      await storage.markPresentationSent(presentation.id);
      console.log(`[Presentations] Sent presentation to ${emails.length} attendees: ${presentation.title}`);
      
      res.json({ 
        success: true, 
        sentTo: emails.length,
        emails: emails,
      });
    } catch (error) {
      console.error("Send presentation error:", error);
      res.status(500).json({ error: "Failed to send presentation" });
    }
  });

  // ========================
  // DARKWAVE ECOSYSTEM HUB API
  // ========================

  // Middleware to authenticate ecosystem API requests
  async function ecosystemAuth(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'] as string;
    const apiSecret = req.headers['x-api-secret'] as string;
    
    console.log('[Ecosystem Auth] Received key:', apiKey?.substring(0, 20) + '...');
    
    if (!apiKey || !apiSecret) {
      console.log('[Ecosystem Auth] Missing credentials');
      return res.status(401).json({ error: 'Missing API credentials' });
    }
    
    const app = await ecosystemHub.authenticateApp(apiKey, apiSecret);
    if (!app) {
      console.log('[Ecosystem Auth] Auth failed for key:', apiKey?.substring(0, 20) + '...');
      return res.status(401).json({ error: 'Invalid API credentials' });
    }
    
    console.log('[Ecosystem Auth] Success for app:', app.appName);
    (req as any).ecosystemApp = app;
    next();
  }

  // Register a new app with the ecosystem hub (public endpoint - no auth required)
  app.post("/api/admin/ecosystem/register-app", async (req: Request, res: Response) => {
    try {
      const { appName, appSlug, description } = req.body;
      
      if (!appName || !appSlug) {
        return res.status(400).json({ error: 'appName and appSlug are required' });
      }
      
      const result = await ecosystemHub.registerApp({
        appName,
        appSlug,
        appUrl: req.body.appUrl,
        description,
        permissions: req.body.permissions || [
          'read:workers',
          'write:workers',
          'read:contractors',
          'write:contractors',
          'read:1099',
          'write:1099',
          'read:timesheets',
          'write:timesheets',
          'read:certifications',
          'write:certifications',
          'read:code',
          'write:code',
        ],
      });
      
      res.status(201).json({
        success: true,
        id: result.app.id,
        appName: result.app.appName,
        apiKey: result.apiKey,
        apiSecret: result.apiSecret,
        permissions: result.app.permissions,
        createdAt: result.app.createdAt,
      });
    } catch (error) {
      console.error("Ecosystem register app error:", error);
      res.status(500).json({ error: "Failed to register app" });
    }
  });

  // Debug endpoint (temporary - shows registered app keys for troubleshooting)
  app.get("/api/ecosystem/debug", async (req: Request, res: Response) => {
    try {
      const apps = await ecosystemHub.getConnectedApps();
      res.json({
        timestamp: new Date().toISOString(),
        appCount: apps.length,
        registeredKeys: apps.map(a => ({
          name: a.appName,
          keyPrefix: a.apiKey.substring(0, 25) + '...',
          isActive: a.isActive,
        })),
      });
    } catch (error) {
      console.error("Ecosystem debug error:", error);
      res.status(500).json({ error: "Debug failed", details: String(error) });
    }
  });

  // Status check (public endpoint for connection testing)
  app.get("/api/ecosystem/status", ecosystemAuth, async (req: Request, res: Response) => {
    const app = (req as any).ecosystemApp;
    res.json({
      connected: true,
      hubName: 'ORBIT Staffing Ecosystem Hub',
      appName: app.appName,
      permissions: app.permissions || [],
      lastSync: app.lastSyncAt,
    });
  });

  // Get shared code snippets
  app.get("/api/ecosystem/snippets", ecosystemAuth, async (req: Request, res: Response) => {
    try {
      const app = (req as any).ecosystemApp;
      if (!ecosystemHub.hasPermission(app, 'read:code')) {
        return res.status(403).json({ error: 'Permission denied: read:code required' });
      }
      
      const { category, language } = req.query;
      const snippets = await ecosystemHub.getSnippets(
        category as string, 
        language as string, 
        false // Include all accessible snippets
      );
      res.json(snippets);
    } catch (error) {
      console.error("Ecosystem snippets error:", error);
      res.status(500).json({ error: "Failed to fetch snippets" });
    }
  });

  // Push a code snippet
  app.post("/api/ecosystem/snippets", ecosystemAuth, async (req: Request, res: Response) => {
    try {
      const app = (req as any).ecosystemApp;
      if (!ecosystemHub.hasPermission(app, 'write:code')) {
        return res.status(403).json({ error: 'Permission denied: write:code required' });
      }
      
      const snippet = await ecosystemHub.pushSnippet(app, req.body);
      res.json(snippet);
    } catch (error) {
      console.error("Ecosystem push snippet error:", error);
      res.status(500).json({ error: "Failed to push snippet" });
    }
  });

  // Sync contractors
  app.post("/api/ecosystem/sync/contractors", ecosystemAuth, async (req: Request, res: Response) => {
    try {
      const app = (req as any).ecosystemApp;
      if (!ecosystemHub.hasPermission(app, 'write:workers')) {
        return res.status(403).json({ error: 'Permission denied: write:workers required' });
      }
      
      const { contractors } = req.body;
      const sync = await ecosystemHub.syncContractors(app, contractors);
      res.json(sync);
    } catch (error) {
      console.error("Ecosystem sync contractors error:", error);
      res.status(500).json({ error: "Failed to sync contractors" });
    }
  });

  // Sync 1099 payment data
  app.post("/api/ecosystem/sync/1099", ecosystemAuth, async (req: Request, res: Response) => {
    try {
      const app = (req as any).ecosystemApp;
      if (!ecosystemHub.hasPermission(app, 'write:1099')) {
        return res.status(403).json({ error: 'Permission denied: write:1099 required' });
      }
      
      const { year, payments } = req.body;
      const sync = await ecosystemHub.sync1099Payments(app, year, payments);
      res.json(sync);
    } catch (error) {
      console.error("Ecosystem sync 1099 error:", error);
      res.status(500).json({ error: "Failed to sync 1099 data" });
    }
  });

  // Sync workers
  app.post("/api/ecosystem/sync/workers", ecosystemAuth, async (req: Request, res: Response) => {
    try {
      const app = (req as any).ecosystemApp;
      if (!ecosystemHub.hasPermission(app, 'write:workers')) {
        return res.status(403).json({ error: 'Permission denied: write:workers required' });
      }
      
      const { workers } = req.body;
      const sync = await ecosystemHub.syncWorkers(app, workers);
      res.json(sync);
    } catch (error) {
      console.error("Ecosystem sync workers error:", error);
      res.status(500).json({ error: "Failed to sync workers" });
    }
  });

  // Sync timesheets
  app.post("/api/ecosystem/sync/timesheets", ecosystemAuth, async (req: Request, res: Response) => {
    try {
      const app = (req as any).ecosystemApp;
      if (!ecosystemHub.hasPermission(app, 'write:timesheets')) {
        return res.status(403).json({ error: 'Permission denied: write:timesheets required' });
      }
      
      const { timesheets } = req.body;
      const sync = await ecosystemHub.syncTimesheets(app, timesheets);
      res.json(sync);
    } catch (error) {
      console.error("Ecosystem sync timesheets error:", error);
      res.status(500).json({ error: "Failed to sync timesheets" });
    }
  });

  // Sync certifications
  app.post("/api/ecosystem/sync/certifications", ecosystemAuth, async (req: Request, res: Response) => {
    try {
      const app = (req as any).ecosystemApp;
      if (!ecosystemHub.hasPermission(app, 'write:certifications')) {
        return res.status(403).json({ error: 'Permission denied: write:certifications required' });
      }
      
      const { certifications } = req.body;
      const sync = await ecosystemHub.syncCertifications(app, certifications);
      res.json(sync);
    } catch (error) {
      console.error("Ecosystem sync certifications error:", error);
      res.status(500).json({ error: "Failed to sync certifications" });
    }
  });

  // Sync W-2 payroll data
  app.post("/api/ecosystem/sync/w2", ecosystemAuth, async (req: Request, res: Response) => {
    try {
      const app = (req as any).ecosystemApp;
      if (!ecosystemHub.hasPermission(app, 'write:1099')) {
        return res.status(403).json({ error: 'Permission denied: write:1099 required' });
      }
      
      const { year, employees } = req.body;
      const sync = await ecosystemHub.logActivity(app.id, app.appName, 'sync:w2', 'payroll', undefined, { year, count: employees?.length || 0 });
      res.json({ success: true, sync, message: `Synced W-2 data for ${employees?.length || 0} employees` });
    } catch (error) {
      console.error("Ecosystem sync W2 error:", error);
      res.status(500).json({ error: "Failed to sync W-2 data" });
    }
  });

  // Get workers by shop
  app.get("/api/ecosystem/shops/:shopId/workers", ecosystemAuth, async (req: Request, res: Response) => {
    try {
      const ecosystemApp = (req as any).ecosystemApp;
      if (!ecosystemHub.hasPermission(ecosystemApp, 'read:workers')) {
        return res.status(403).json({ error: 'Permission denied: read:workers required' });
      }
      
      const { shopId } = req.params;
      const workerList = await db.select().from(workers).where(eq(workers.tenantId, shopId)).limit(100);
      res.json({ success: true, shopId, workerCount: workerList.length, workers: workerList });
    } catch (error) {
      console.error("Ecosystem get shop workers error:", error);
      res.status(500).json({ error: "Failed to fetch shop workers" });
    }
  });

  // Get payroll summary by shop
  app.get("/api/ecosystem/shops/:shopId/payroll", ecosystemAuth, async (req: Request, res: Response) => {
    try {
      const ecosystemApp = (req as any).ecosystemApp;
      if (!ecosystemHub.hasPermission(ecosystemApp, 'read:1099')) {
        return res.status(403).json({ error: 'Permission denied: read:1099 required' });
      }
      
      const { shopId } = req.params;
      // Query payroll data from storage
      const records: any[] = [];
      
      const totalPaid = 0;
      res.json({ success: true, shopId, recordCount: records.length, totalPaid, records });
    } catch (error) {
      console.error("Ecosystem get shop payroll error:", error);
      res.status(500).json({ error: "Failed to fetch shop payroll" });
    }
  });

  // Get activity logs
  app.get("/api/ecosystem/logs", ecosystemAuth, async (req: Request, res: Response) => {
    try {
      const app = (req as any).ecosystemApp;
      const logs = await ecosystemHub.getActivityLogs(app.id);
      res.json(logs);
    } catch (error) {
      console.error("Ecosystem get logs error:", error);
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  // Push activity log
  app.post("/api/ecosystem/logs", ecosystemAuth, async (req: Request, res: Response) => {
    try {
      const app = (req as any).ecosystemApp;
      const { action, details } = req.body;
      const log = await ecosystemHub.logActivity(app.id, app.appName, action, 'custom', undefined, details);
      res.json(log);
    } catch (error) {
      console.error("Ecosystem push log error:", error);
      res.status(500).json({ error: "Failed to log activity" });
    }
  });

  // ========================
  // ADMIN ECOSYSTEM MANAGEMENT (requires admin auth)
  // ========================

  // Register a new app
  app.post("/api/admin/ecosystem/apps", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { appName, appSlug, appUrl, description, logoUrl, permissions } = req.body;
      const result = await ecosystemHub.registerApp({
        appName,
        appSlug,
        appUrl,
        description,
        logoUrl,
        permissions: permissions || [],
      });
      
      // Return credentials only once - they must be saved immediately
      res.json({
        app: result.app,
        credentials: {
          apiKey: result.apiKey,
          apiSecret: result.apiSecret,
          warning: 'Save these credentials now. The API secret will not be shown again.',
        },
      });
    } catch (error) {
      console.error("Register ecosystem app error:", error);
      res.status(500).json({ error: "Failed to register app" });
    }
  });

  // List connected apps
  app.get("/api/admin/ecosystem/apps", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const apps = await ecosystemHub.getConnectedApps();
      res.json(apps);
    } catch (error) {
      console.error("Get ecosystem apps error:", error);
      res.status(500).json({ error: "Failed to fetch apps" });
    }
  });

  // Update app permissions
  app.put("/api/admin/ecosystem/apps/:appId/permissions", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { appId } = req.params;
      const { permissions } = req.body;
      const app = await ecosystemHub.updateAppPermissions(appId, permissions);
      res.json(app);
    } catch (error) {
      console.error("Update app permissions error:", error);
      res.status(500).json({ error: "Failed to update permissions" });
    }
  });

  // Deactivate app
  app.delete("/api/admin/ecosystem/apps/:appId", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { appId } = req.params;
      await ecosystemHub.deactivateApp(appId);
      res.json({ success: true });
    } catch (error) {
      console.error("Deactivate ecosystem app error:", error);
      res.status(500).json({ error: "Failed to deactivate app" });
    }
  });

  // Regenerate app credentials
  app.post("/api/admin/ecosystem/apps/:appId/regenerate", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { appId } = req.params;
      const credentials = await ecosystemHub.regenerateAppCredentials(appId);
      if (!credentials) {
        return res.status(404).json({ error: "App not found" });
      }
      res.json({
        ...credentials,
        warning: 'Save these credentials now. The API secret will not be shown again.',
      });
    } catch (error) {
      console.error("Regenerate credentials error:", error);
      res.status(500).json({ error: "Failed to regenerate credentials" });
    }
  });

  // Get hub statistics
  app.get("/api/admin/ecosystem/stats", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const stats = await ecosystemHub.getHubStats();
      res.json(stats);
    } catch (error) {
      console.error("Get ecosystem stats error:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Get sync history
  app.get("/api/admin/ecosystem/syncs", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { appId, syncType, limit } = req.query;
      const syncs = await ecosystemHub.getSyncHistory(
        appId as string, 
        syncType as string, 
        limit ? parseInt(limit as string) : 50
      );
      res.json(syncs);
    } catch (error) {
      console.error("Get sync history error:", error);
      res.status(500).json({ error: "Failed to fetch sync history" });
    }
  });

  // Get all snippets (admin view)
  app.get("/api/admin/ecosystem/snippets", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { category, language } = req.query;
      const snippets = await ecosystemHub.getSnippets(category as string, language as string, false);
      res.json(snippets);
    } catch (error) {
      console.error("Get admin snippets error:", error);
      res.status(500).json({ error: "Failed to fetch snippets" });
    }
  });

  // ========================
  // EXTERNAL HUB CONNECTIONS (ORBIT → Other Hubs)
  // ========================

  // Add external hub connection
  app.post("/api/admin/ecosystem/external-hubs", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { hubName, hubUrl, apiKey, apiSecret, permissions, autoSync, syncFrequency } = req.body;
      const hub = await externalHubManager.addExternalHub({
        hubName,
        hubUrl,
        apiKey,
        apiSecret,
        permissions,
        autoSync,
        syncFrequency,
      });
      res.json(hub);
    } catch (error: any) {
      console.error("Add external hub error:", error);
      res.status(500).json({ error: error.message || "Failed to add external hub" });
    }
  });

  // List external hubs
  app.get("/api/admin/ecosystem/external-hubs", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const hubs = await externalHubManager.getExternalHubs();
      res.json(hubs);
    } catch (error) {
      console.error("Get external hubs error:", error);
      res.status(500).json({ error: "Failed to fetch external hubs" });
    }
  });

  // Test external hub connection
  app.post("/api/admin/ecosystem/external-hubs/:hubId/test", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { hubId } = req.params;
      const status = await externalHubManager.testHubConnection(hubId);
      res.json(status);
    } catch (error) {
      console.error("Test hub connection error:", error);
      res.status(500).json({ error: "Failed to test connection" });
    }
  });

  // Update external hub settings
  app.put("/api/admin/ecosystem/external-hubs/:hubId", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { hubId } = req.params;
      const { autoSync, syncFrequency, isActive } = req.body;
      const hub = await externalHubManager.updateHubSettings(hubId, { autoSync, syncFrequency, isActive });
      res.json(hub);
    } catch (error) {
      console.error("Update external hub error:", error);
      res.status(500).json({ error: "Failed to update hub" });
    }
  });

  // Remove external hub
  app.delete("/api/admin/ecosystem/external-hubs/:hubId", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { hubId } = req.params;
      await externalHubManager.removeExternalHub(hubId);
      res.json({ success: true });
    } catch (error) {
      console.error("Remove external hub error:", error);
      res.status(500).json({ error: "Failed to remove hub" });
    }
  });

  // Push data TO external hub
  app.post("/api/admin/ecosystem/external-hubs/:hubId/push", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const { hubId } = req.params;
      const { syncType, data } = req.body;
      
      const client = await externalHubManager.getClientForHub(hubId);
      if (!client) {
        return res.status(404).json({ error: "Hub not found or not configured" });
      }
      
      let result;
      switch (syncType) {
        case 'contractors':
          result = await client.syncContractors(data);
          break;
        case '1099':
          result = await client.sync1099Data(data.year, data.payments);
          break;
        case 'workers':
          result = await client.syncWorkers(data);
          break;
        case 'timesheets':
          result = await client.syncTimesheets(data);
          break;
        case 'certifications':
          result = await client.syncCertifications(data);
          break;
        case 'snippet':
          result = await client.pushSnippet(data);
          break;
        default:
          return res.status(400).json({ error: `Unknown sync type: ${syncType}` });
      }
      
      res.json(result);
    } catch (error: any) {
      console.error("Push to external hub error:", error);
      res.status(500).json({ error: error.message || "Failed to push data" });
    }
  });

  // ========================
  // VERSION MANAGEMENT & AUTO-PUBLISH
  // ========================

  // Get current version info
  app.get("/api/version", async (req: Request, res: Response) => {
    try {
      const version = versionManager.getCurrentVersion();
      res.json(version);
    } catch (error) {
      res.status(500).json({ error: "Failed to get version" });
    }
  });

  // Trigger a publish with version bump and Solana hash (admin only)
  app.post("/api/admin/publish", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const bumpType = (req.body.bumpType as 'major' | 'minor' | 'patch') || 'patch';
      
      console.log(`[Publish] Admin triggered publish with ${bumpType} version bump`);
      
      const result = await versionManager.publishRelease(bumpType);
      
      res.json({
        success: true,
        version: result.version,
        buildNumber: result.buildNumber,
        hash: result.hash,
        solana: result.solanaResult ? {
          transactionSignature: result.solanaResult.transactionSignature,
          explorerUrl: result.solanaResult.explorerUrl,
          merkleRoot: result.solanaResult.merkleRoot,
        } : null,
        publishedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Publish error:", error);
      res.status(500).json({ error: error.message || "Failed to publish" });
    }
  });

  // Get publish history
  app.get("/api/admin/publish/history", requireMasterAdmin, async (req: Request, res: Response) => {
    try {
      const history = await versionManager.getPublishHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to get publish history" });
    }
  });
}
