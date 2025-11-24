import { db } from "./db";
import { eq, and, desc, gte } from "drizzle-orm";
import {
  stripeConnectAccounts,
  stripePayouts,
  stripeWebhookEvents,
  type InsertStripeConnectAccount,
  type InsertStripePayout,
  type InsertStripeWebhookEvent,
} from "@shared/schema";

// ========================
// Stripe Connect Accounts
// ========================
export async function createStripeConnectAccount(
  data: InsertStripeConnectAccount
) {
  const result = await db
    .insert(stripeConnectAccounts)
    .values(data)
    .returning();
  return result[0];
}

export async function getStripeConnectAccountByWorker(workerId: string) {
  return db.query.stripeConnectAccounts.findFirst({
    where: eq(stripeConnectAccounts.workerId, workerId),
  });
}

export async function getStripeConnectAccountByStripeId(
  stripeAccountId: string
) {
  return db.query.stripeConnectAccounts.findFirst({
    where: eq(stripeConnectAccounts.stripeAccountId, stripeAccountId),
  });
}

export async function updateStripeConnectAccount(
  stripeAccountId: string,
  updates: Partial<InsertStripeConnectAccount>
) {
  const result = await db
    .update(stripeConnectAccounts)
    .set(updates)
    .where(eq(stripeConnectAccounts.stripeAccountId, stripeAccountId))
    .returning();
  return result[0];
}

// ========================
// Stripe Payouts
// ========================
export async function recordStripePayout(data: InsertStripePayout) {
  const result = await db
    .insert(stripePayouts)
    .values(data)
    .returning();
  return result[0];
}

export async function getPayoutsByWorker(
  workerId: string,
  limit = 50,
  offset = 0
) {
  return db.query.stripePayouts.findMany({
    where: eq(stripePayouts.workerId, workerId),
    orderBy: desc(stripePayouts.createdAt),
    limit,
    offset,
  });
}

export async function getPayoutsByStatus(status: string, limit = 50) {
  return db.query.stripePayouts.findMany({
    where: eq(stripePayouts.status, status),
    orderBy: desc(stripePayouts.createdAt),
    limit,
  });
}

export async function updatePayoutStatus(
  stripePayoutId: string,
  status: string,
  updates?: Partial<InsertStripePayout>
) {
  const result = await db
    .update(stripePayouts)
    .set({ status, ...updates })
    .where(eq(stripePayouts.stripePayoutId, stripePayoutId))
    .returning();
  return result[0];
}

export async function getWorkerPayoutStats(workerId: string) {
  const payouts = await db.query.stripePayouts.findMany({
    where: eq(stripePayouts.workerId, workerId),
  });

  const stats = {
    totalPayouts: payouts.length,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    failedAmount: 0,
    lastPayout: null as any,
  };

  payouts.forEach((payout) => {
    const amount = Number(payout.amount) / 100; // Convert from cents
    stats.totalAmount += amount;

    if (payout.status === "paid") stats.paidAmount += amount;
    if (payout.status === "pending") stats.pendingAmount += amount;
    if (payout.status === "failed") stats.failedAmount += amount;
  });

  stats.lastPayout = payouts[0] || null;
  return stats;
}

// ========================
// Stripe Webhook Events
// ========================
export async function recordWebhookEvent(
  data: InsertStripeWebhookEvent
) {
  const result = await db
    .insert(stripeWebhookEvents)
    .values(data)
    .returning();
  return result[0];
}

export async function getWebhookEvent(eventId: string) {
  return db.query.stripeWebhookEvents.findFirst({
    where: eq(stripeWebhookEvents.eventId, eventId),
  });
}

export async function markWebhookProcessed(
  eventId: string,
  processed = true,
  error?: string
) {
  const result = await db
    .update(stripeWebhookEvents)
    .set({
      processed,
      processedAt: processed ? new Date() : null,
      error,
    })
    .where(eq(stripeWebhookEvents.eventId, eventId))
    .returning();
  return result[0];
}

export async function getUnprocessedWebhookEvents(limit = 100) {
  return db.query.stripeWebhookEvents.findMany({
    where: eq(stripeWebhookEvents.processed, false),
    orderBy: desc(stripeWebhookEvents.createdAt),
    limit,
  });
}
