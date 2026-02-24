import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { chatUsers } from "@shared/schema";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 12;
const JWT_EXPIRY = "7d";
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET or SESSION_SECRET environment variable is required");
  }
  return secret;
}

export function generateTrustLayerId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `tl-${timestamp}-${random}`;
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least 1 capital letter");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least 1 special character");
  }
  return { valid: errors.length === 0, errors };
}

export function generateToken(userId: string, trustLayerId: string): string {
  return jwt.sign(
    { userId, trustLayerId, iss: "trust-layer-sso" },
    getJwtSecret(),
    { algorithm: "HS256", expiresIn: JWT_EXPIRY }
  );
}

export function verifyToken(token: string): { userId: string; trustLayerId: string } | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] }) as any;
    if (decoded.iss !== "trust-layer-sso") return null;
    return { userId: decoded.userId, trustLayerId: decoded.trustLayerId };
  } catch {
    return null;
  }
}

const AVATAR_COLORS = [
  "#06b6d4", "#10b981", "#8b5cf6", "#f59e0b",
  "#ef4444", "#ec4899", "#3b82f6", "#14b8a6",
];

function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export async function registerUser(username: string, email: string, password: string, displayName: string) {
  const validation = validatePassword(password);
  if (!validation.valid) {
    return { error: validation.errors.join(", "), status: 400 };
  }

  const existing = await db.select().from(chatUsers)
    .where(eq(chatUsers.username, username.toLowerCase()))
    .limit(1);
  if (existing.length > 0) {
    return { error: "Username already taken", status: 409 };
  }

  const existingEmail = await db.select().from(chatUsers)
    .where(eq(chatUsers.email, email.toLowerCase()))
    .limit(1);
  if (existingEmail.length > 0) {
    return { error: "Email already registered", status: 409 };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const trustLayerId = generateTrustLayerId();
  const avatarColor = randomAvatarColor();

  const [user] = await db.insert(chatUsers).values({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    passwordHash,
    displayName,
    avatarColor,
    trustLayerId,
    role: "member",
  }).returning();

  const token = generateToken(user.id, trustLayerId);

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatarColor: user.avatarColor,
      role: user.role,
      trustLayerId: user.trustLayerId,
    },
    token,
  };
}

export async function loginUser(username: string, password: string) {
  const [user] = await db.select().from(chatUsers)
    .where(eq(chatUsers.username, username.toLowerCase()))
    .limit(1);

  if (!user) {
    return { error: "Invalid credentials", status: 401 };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid credentials", status: 401 };
  }

  await db.update(chatUsers)
    .set({ isOnline: true, lastSeen: new Date() })
    .where(eq(chatUsers.id, user.id));

  const token = generateToken(user.id, user.trustLayerId || "");

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatarColor: user.avatarColor,
      role: user.role,
      trustLayerId: user.trustLayerId,
    },
    token,
  };
}

export async function getUserFromToken(token: string) {
  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: "Invalid or expired token", status: 401 };
  }

  const [user] = await db.select().from(chatUsers)
    .where(eq(chatUsers.id, decoded.userId))
    .limit(1);

  if (!user) {
    return { error: "User not found", status: 404 };
  }

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatarColor: user.avatarColor,
      role: user.role,
      trustLayerId: user.trustLayerId,
    },
  };
}
