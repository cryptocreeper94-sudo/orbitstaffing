import crypto from "crypto";
import { storage } from "./storage";
import type { WebhookSubscription, WebhookDeliveryLog, WebhookEventType } from "@shared/schema";

const RETRY_INTERVALS = [
  60 * 1000,        // 1 minute
  5 * 60 * 1000,    // 5 minutes
  30 * 60 * 1000,   // 30 minutes
  2 * 60 * 60 * 1000, // 2 hours
];

const WEBHOOK_TIMEOUT = 30000; // 30 seconds
const MAX_ATTEMPTS = 4;

interface WebhookPayload {
  id: string;
  event: WebhookEventType;
  timestamp: string;
  data: any;
}

function generateSignature(secret: string, payload: string, timestamp: string): string {
  const signaturePayload = `${timestamp}.${payload}`;
  return crypto.createHmac("sha256", secret).update(signaturePayload).digest("hex");
}

async function deliverWebhook(
  subscription: WebhookSubscription,
  deliveryLog: WebhookDeliveryLog
): Promise<{ success: boolean; statusCode?: number; responseBody?: string; error?: string }> {
  const timestamp = new Date().toISOString();
  const payloadString = JSON.stringify(deliveryLog.payload);
  const signature = generateSignature(subscription.secret, payloadString, timestamp);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);

  try {
    const response = await fetch(subscription.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": `sha256=${signature}`,
        "X-Webhook-Event": deliveryLog.event,
        "X-Webhook-Timestamp": timestamp,
        "X-Webhook-Delivery-Id": deliveryLog.id,
        "User-Agent": "ORBIT-Webhook/1.0",
      },
      body: payloadString,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseBody = await response.text().catch(() => "");
    const success = response.status >= 200 && response.status < 300;

    return {
      success,
      statusCode: response.status,
      responseBody: responseBody.substring(0, 1000),
      error: success ? undefined : `HTTP ${response.status}`,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    const errorMessage = error.name === "AbortError" 
      ? "Request timeout (30s)" 
      : error.message || "Network error";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

async function processDelivery(deliveryLog: WebhookDeliveryLog): Promise<void> {
  const subscription = await storage.getWebhookSubscriptionById(deliveryLog.subscriptionId);
  
  if (!subscription || !subscription.isActive) {
    await storage.updateWebhookDeliveryLog(deliveryLog.id, {
      status: "failed",
      errorMessage: "Subscription not found or inactive",
    });
    return;
  }

  const result = await deliverWebhook(subscription, deliveryLog);
  const attemptCount = (deliveryLog.attemptCount || 0) + 1;

  if (result.success) {
    await storage.updateWebhookDeliveryLog(deliveryLog.id, {
      status: "delivered",
      statusCode: result.statusCode,
      responseBody: result.responseBody,
      attemptCount,
      deliveredAt: new Date(),
      nextRetryAt: null,
    });
    await storage.incrementWebhookDeliveryStats(subscription.id, true);
  } else {
    const shouldRetry = attemptCount < MAX_ATTEMPTS;
    
    if (shouldRetry) {
      const retryDelay = RETRY_INTERVALS[attemptCount - 1] || RETRY_INTERVALS[RETRY_INTERVALS.length - 1];
      const nextRetryAt = new Date(Date.now() + retryDelay);
      
      await storage.updateWebhookDeliveryLog(deliveryLog.id, {
        status: "retrying",
        statusCode: result.statusCode,
        responseBody: result.responseBody,
        errorMessage: result.error,
        attemptCount,
        nextRetryAt,
      });
    } else {
      await storage.updateWebhookDeliveryLog(deliveryLog.id, {
        status: "failed",
        statusCode: result.statusCode,
        responseBody: result.responseBody,
        errorMessage: result.error,
        attemptCount,
        nextRetryAt: null,
      });
      await storage.incrementWebhookDeliveryStats(subscription.id, false);
    }
  }
}

export async function emitWebhookEvent(
  tenantId: string,
  eventType: WebhookEventType,
  data: any
): Promise<void> {
  try {
    const subscriptions = await storage.getActiveWebhookSubscriptionsForEvent(tenantId, eventType);
    
    if (subscriptions.length === 0) {
      return;
    }

    const payload: WebhookPayload = {
      id: crypto.randomUUID(),
      event: eventType,
      timestamp: new Date().toISOString(),
      data,
    };

    for (const subscription of subscriptions) {
      const deliveryLog = await storage.createWebhookDeliveryLog({
        subscriptionId: subscription.id,
        event: eventType,
        payload,
        status: "pending",
        attemptCount: 0,
        maxAttempts: MAX_ATTEMPTS,
      });

      setImmediate(() => processDelivery(deliveryLog));
    }
  } catch (error) {
    console.error("[WebhookService] Error emitting event:", eventType, error);
  }
}

export async function sendTestWebhook(
  subscriptionId: string
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const subscription = await storage.getWebhookSubscriptionById(subscriptionId);
  
  if (!subscription) {
    return { success: false, error: "Subscription not found" };
  }

  const testPayload: WebhookPayload = {
    id: crypto.randomUUID(),
    event: "worker.created" as WebhookEventType,
    timestamp: new Date().toISOString(),
    data: {
      test: true,
      message: "This is a test webhook from ORBIT",
      subscriptionId: subscription.id,
    },
  };

  const deliveryLog = await storage.createWebhookDeliveryLog({
    subscriptionId: subscription.id,
    event: "worker.created",
    payload: testPayload,
    status: "pending",
    attemptCount: 0,
    maxAttempts: 1,
  });

  const result = await deliverWebhook(subscription, {
    ...deliveryLog,
    payload: testPayload,
  } as WebhookDeliveryLog);

  await storage.updateWebhookDeliveryLog(deliveryLog.id, {
    status: result.success ? "delivered" : "failed",
    statusCode: result.statusCode,
    responseBody: result.responseBody,
    errorMessage: result.error,
    attemptCount: 1,
    deliveredAt: result.success ? new Date() : undefined,
  });

  if (result.success) {
    await storage.incrementWebhookDeliveryStats(subscription.id, true);
  } else {
    await storage.incrementWebhookDeliveryStats(subscription.id, false);
  }

  return result;
}

export async function processRetries(): Promise<number> {
  const pendingDeliveries = await storage.getPendingWebhookDeliveries();
  let processed = 0;

  for (const delivery of pendingDeliveries) {
    await processDelivery(delivery);
    processed++;
  }

  return processed;
}

let retryIntervalId: NodeJS.Timeout | null = null;

export function startWebhookRetryProcessor(intervalMs: number = 60000): void {
  if (retryIntervalId) {
    clearInterval(retryIntervalId);
  }

  retryIntervalId = setInterval(async () => {
    try {
      const processed = await processRetries();
      if (processed > 0) {
        console.log(`[WebhookService] Processed ${processed} pending webhook deliveries`);
      }
    } catch (error) {
      console.error("[WebhookService] Error processing retries:", error);
    }
  }, intervalMs);

  console.log("[WebhookService] Webhook retry processor started");
}

export function stopWebhookRetryProcessor(): void {
  if (retryIntervalId) {
    clearInterval(retryIntervalId);
    retryIntervalId = null;
    console.log("[WebhookService] Webhook retry processor stopped");
  }
}

export const webhookService = {
  emitWebhookEvent,
  sendTestWebhook,
  processRetries,
  startWebhookRetryProcessor,
  stopWebhookRetryProcessor,
  generateSignature,
};

export default webhookService;
