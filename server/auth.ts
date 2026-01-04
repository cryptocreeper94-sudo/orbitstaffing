import bcrypt from "bcrypt";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

const SALT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory rate limiting store (use Redis for production at scale)
const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  tenantId?: number;
}

declare module 'express-session' {
  interface SessionData {
    user?: AuthUser;
    adminRole?: string;
    adminName?: string;
    tenantId?: number;
    isAuthenticated?: boolean;
  }
}

// Password hashing with secure bcrypt
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Secure password comparison
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }
  return bcrypt.compare(password, hash);
}

// Generate secure random token for password resets
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Hash a token for secure storage (don't store plain tokens in DB)
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Get token expiry (30 minutes from now)
export function getTokenExpiry(minutes: number = 30): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

// Generate secure PIN (4-6 digits)
export function generateSecurePin(length: number = 4): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(crypto.randomInt(min, max + 1));
}

// Rate limiting helper
function getClientKey(req: Request): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const email = req.body?.email?.toLowerCase() || '';
  return `${ip}:${email}`;
}

// Check if client is rate limited
export function isRateLimited(req: Request): { limited: boolean; retryAfterMs?: number } {
  const key = getClientKey(req);
  const record = loginAttempts.get(key);
  
  if (!record) {
    return { limited: false };
  }
  
  const now = Date.now();
  
  // Check if still locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    return { 
      limited: true, 
      retryAfterMs: record.lockedUntil - now 
    };
  }
  
  // Reset if lockout expired
  if (record.lockedUntil && now >= record.lockedUntil) {
    loginAttempts.delete(key);
    return { limited: false };
  }
  
  return { limited: false };
}

// Record login attempt
export function recordLoginAttempt(req: Request, success: boolean): void {
  const key = getClientKey(req);
  const now = Date.now();
  
  if (success) {
    loginAttempts.delete(key);
    return;
  }
  
  const record = loginAttempts.get(key) || { count: 0, lastAttempt: 0 };
  record.count++;
  record.lastAttempt = now;
  
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    console.log(`[Auth] Account locked for ${key.split(':')[0]} after ${MAX_LOGIN_ATTEMPTS} failed attempts`);
  }
  
  loginAttempts.set(key, record);
}

// Rate limiting middleware for login routes
export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  const { limited, retryAfterMs } = isRateLimited(req);
  
  if (limited) {
    const retryAfterSeconds = Math.ceil((retryAfterMs || LOCKOUT_DURATION_MS) / 1000);
    res.setHeader('Retry-After', String(retryAfterSeconds));
    res.status(429).json({ 
      error: "Too many login attempts. Please try again later.",
      retryAfterSeconds 
    });
    return;
  }
  
  next();
}

// Session authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.isAuthenticated || !req.session?.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

// Role-based authorization middleware
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session?.isAuthenticated || !req.session?.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    
    const userRole = req.session.user.role || req.session.adminRole;
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    
    next();
  };
}

// Admin PIN authentication middleware
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.adminRole || !req.session?.adminName) {
    res.status(401).json({ error: "Admin authentication required" });
    return;
  }
  next();
}

// Validate password strength
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return { valid: errors.length === 0, errors };
}

// Clean up expired rate limit records periodically
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(loginAttempts.entries());
  for (let i = 0; i < entries.length; i++) {
    const [key, record] = entries[i];
    // Remove records older than 1 hour with no lockout
    if (!record.lockedUntil && now - record.lastAttempt > 60 * 60 * 1000) {
      loginAttempts.delete(key);
    }
    // Remove records with expired lockouts
    if (record.lockedUntil && now >= record.lockedUntil) {
      loginAttempts.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute

// Secure session configuration helper
export function getSessionConfig() {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error('[CRITICAL] SESSION_SECRET environment variable is required');
  }
  
  return {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax' as const,
    },
    name: 'orbit.sid',
  };
}

// Log security event
export function logSecurityEvent(event: string, details: Record<string, any>): void {
  const timestamp = new Date().toISOString();
  console.log(`[Security ${timestamp}] ${event}:`, JSON.stringify(details));
}

export default {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  hashToken,
  getTokenExpiry,
  generateSecurePin,
  isRateLimited,
  recordLoginAttempt,
  rateLimitMiddleware,
  requireAuth,
  requireRole,
  requireAdminAuth,
  validatePasswordStrength,
  getSessionConfig,
  logSecurityEvent,
};
