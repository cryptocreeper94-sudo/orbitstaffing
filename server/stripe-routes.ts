import { Router, Request, Response } from "express";
import { z } from "zod";
import Stripe from "stripe";
import {
  createStripeConnectAccount,
  getStripeConnectAccountByWorker,
  updateStripeConnectAccount,
  recordStripePayout,
  getPayoutsByWorker,
  getWorkerPayoutStats,
  recordWebhookEvent,
  markWebhookProcessed,
  getWebhookEvent,
} from "./stripe-storage";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// ========================
// Connect Account Setup
// ========================

// Start Stripe Connect onboarding
router.post("/stripe/connect/create-account", async (req: Request, res: Response) => {
  try {
    const { workerId, email, country = "US" } = req.body;

    if (!workerId || !email) {
      return res.status(400).json({ error: "Missing workerId or email" });
    }

    // Check if account already exists
    const existing = await getStripeConnectAccountByWorker(workerId);
    if (existing) {
      return res.json({ account: existing });
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: "express",
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Save to database
    const dbAccount = await createStripeConnectAccount({
      workerId,
      stripeAccountId: account.id,
      accountStatus: "pending",
    });

    res.json({
      success: true,
      account: dbAccount,
      stripeAccountId: account.id,
    });
  } catch (error: any) {
    console.error("Stripe Connect error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get onboarding link
router.post("/stripe/connect/onboarding-link", async (req: Request, res: Response) => {
  try {
    const { workerId, refreshUrl, returnUrl } = req.body;

    const account = await getStripeConnectAccountByWorker(workerId);
    if (!account) {
      return res.status(404).json({ error: "Stripe account not found" });
    }

    const loginLink = await stripe.accounts.createLoginLink(
      account.stripeAccountId
    );

    const onboardingLink = await stripe.accountLinks.create({
      account: account.stripeAccountId,
      type: "account_onboarding",
      refresh_url: refreshUrl || "https://orbitstaffing.net/payout/refresh",
      return_url: returnUrl || "https://orbitstaffing.net/payout/success",
    });

    res.json({
      onboardingUrl: onboardingLink.url,
      loginUrl: loginLink.url,
    });
  } catch (error: any) {
    console.error("Onboarding link error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get account status
router.get("/stripe/connect/account/:workerId", async (req: Request, res: Response) => {
  try {
    const { workerId } = req.params;

    const dbAccount = await getStripeConnectAccountByWorker(workerId);
    if (!dbAccount) {
      return res.status(404).json({ error: "No Stripe account found" });
    }

    const stripeAccount = await stripe.accounts.retrieve(
      dbAccount.stripeAccountId
    );

    // Update database with latest status
    await updateStripeConnectAccount(dbAccount.stripeAccountId, {
      accountStatus: stripeAccount.charges_enabled ? "active" : "pending",
      chargesEnabled: stripeAccount.charges_enabled || false,
      payoutsEnabled: stripeAccount.payouts_enabled || false,
      requirementsStatus: stripeAccount.requirements?.current_deadline
        ? "past_due"
        : stripeAccount.requirements?.currently_due?.length
        ? "currently_due"
        : "eventually_due",
      requirementsDue: stripeAccount.requirements,
    });

    res.json({
      account: dbAccount,
      stripeAccount: {
        chargesEnabled: stripeAccount.charges_enabled,
        payoutsEnabled: stripeAccount.payouts_enabled,
        requirements: stripeAccount.requirements,
      },
    });
  } catch (error: any) {
    console.error("Account status error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========================
// Payouts
// ========================

// Create payout
router.post("/stripe/payouts/create", async (req: Request, res: Response) => {
  try {
    const { workerId, amount, currency = "usd", method = "standard" } = req.body;

    if (!workerId || !amount) {
      return res.status(400).json({ error: "Missing workerId or amount" });
    }

    const account = await getStripeConnectAccountByWorker(workerId);
    if (!account || !account.payoutsEnabled) {
      return res.status(400).json({ error: "Payout not enabled for this worker" });
    }

    // Create payout
    const payout = await stripe.payouts.create(
      {
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        method,
      },
      {
        stripeAccount: account.stripeAccountId,
      }
    );

    // Record in database
    const dbPayout = await recordStripePayout({
      workerId,
      stripeConnectAccountId: account.id,
      stripePayoutId: payout.id,
      amount: new Decimal(payout.amount),
      currency: payout.currency,
      status: payout.status,
      payoutMethod: method,
      arrivalDate: payout.arrival_date ? new Date(payout.arrival_date * 1000) : null,
    });

    res.json({
      success: true,
      payout: dbPayout,
    });
  } catch (error: any) {
    console.error("Payout creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get payouts for worker
router.get("/stripe/payouts/:workerId", async (req: Request, res: Response) => {
  try {
    const { workerId } = req.params;
    const { limit = "50", offset = "0" } = req.query;

    const payouts = await getPayoutsByWorker(
      workerId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    const stats = await getWorkerPayoutStats(workerId);

    res.json({
      payouts,
      stats,
    });
  } catch (error: any) {
    console.error("Payouts fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========================
// Webhooks
// ========================

// Stripe webhook handler
router.post("/stripe/webhooks", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Record webhook event
  try {
    const existingEvent = await getWebhookEvent(event.id);
    if (existingEvent) {
      return res.json({ received: true });
    }

    await recordWebhookEvent({
      eventId: event.id,
      eventType: event.type,
      resourceType: event.type.split(".")[0],
      resourceId: (event.data.object as any)?.id,
      payload: event.data,
    });

    // Handle specific event types
    switch (event.type) {
      case "account.updated":
        await handleAccountUpdated(event);
        break;

      case "payout.created":
        await handlePayoutCreated(event);
        break;

      case "payout.paid":
        await handlePayoutPaid(event);
        break;

      case "payout.failed":
        await handlePayoutFailed(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    await markWebhookProcessed(event.id, true);
    res.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    await markWebhookProcessed(event.id, false, error.message);
    res.status(500).json({ error: error.message });
  }
});

// Event handlers
async function handleAccountUpdated(event: any) {
  const account = event.data.object;
  await updateStripeConnectAccount(account.id, {
    accountStatus: account.charges_enabled ? "active" : "pending",
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
  });
}

async function handlePayoutCreated(event: any) {
  const payout = event.data.object;
  // Already handled by API, just log
  console.log("Payout created:", payout.id);
}

async function handlePayoutPaid(event: any) {
  const payout = event.data.object;
  // Find and update payout
  // Note: Need to query by stripePayoutId across connect accounts
  console.log("Payout paid:", payout.id);
}

async function handlePayoutFailed(event: any) {
  const payout = event.data.object;
  console.log("Payout failed:", payout.id, payout.failure_code);
}

import { Decimal } from "decimal.js";

export default router;
