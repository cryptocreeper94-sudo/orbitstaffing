import { getUncachableStripeClient } from './stripeClient';
import Stripe from 'stripe';

export class StripeService {
  async createCustomer(email: string, userId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.customers.create({
      email,
      metadata: { userId },
    });
  }

  async createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  /**
   * Create a payment for garnishment using Stripe Connect
   * This creates a payment intent that routes funds to the creditor's connected account
   */
  async createGarnishmentPayment(input: {
    amount: number;
    creditorEmail: string;
    creditorStripeAccountId?: string;
    employeeId: string;
    garnishmentOrderId: string;
    description: string;
  }) {
    const stripe = await getUncachableStripeClient();

    // Create payment intent that will be transferred to creditor account
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(input.amount * 100), // Convert to cents
      currency: 'usd',
      statement_descriptor: 'GARNISHMENT',
      metadata: {
        employeeId: input.employeeId,
        garnishmentOrderId: input.garnishmentOrderId,
        creditorEmail: input.creditorEmail,
        type: 'garnishment_payment',
      },
      // If creditor has a connected account, we can set up a transfer
      ...(input.creditorStripeAccountId && {
        on_behalf_of: input.creditorStripeAccountId,
      }),
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: input.amount,
      status: paymentIntent.status,
    };
  }

  /**
   * Confirm payment and create transfer to creditor
   */
  async confirmGarnishmentPayment(input: {
    paymentIntentId: string;
    creditorStripeAccountId?: string;
    amount: number;
    paymentMethodId: string;
  }) {
    const stripe = await getUncachableStripeClient();

    // Confirm the payment
    const paymentIntent = await stripe.paymentIntents.confirm(input.paymentIntentId, {
      payment_method: input.paymentMethodId,
      return_url: `${process.env.ORBIT_BASE_URL || 'https://orbit.app'}/payments/return`,
    });

    // If payment succeeded and creditor has connected account, create transfer
    if (paymentIntent.status === 'succeeded' && input.creditorStripeAccountId) {
      const transfer = await stripe.transfers.create({
        amount: Math.round(input.amount * 100),
        currency: 'usd',
        destination: input.creditorStripeAccountId,
        transfer_group: paymentIntent.id,
        description: `Garnishment payment - ${paymentIntent.id}`,
      });

      return {
        paymentIntentId: paymentIntent.id,
        transferId: transfer.id,
        status: 'completed',
        amount: input.amount,
      };
    }

    return {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: input.amount,
    };
  }

  /**
   * Retrieve payment status
   */
  async getPaymentStatus(paymentIntentId: string) {
    const stripe = await getUncachableStripeClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      clientSecret: paymentIntent.client_secret,
      chargesData: paymentIntent.charges,
    };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        return {
          type: 'payment_succeeded',
          paymentIntentId: event.data.object.id,
          data: event.data.object,
        };

      case 'payment_intent.payment_failed':
        return {
          type: 'payment_failed',
          paymentIntentId: event.data.object.id,
          error: (event.data.object as any).last_payment_error,
        };

      case 'charge.refunded':
        return {
          type: 'charge_refunded',
          chargeId: (event.data.object as any).id,
          amount: (event.data.object as any).amount / 100,
        };

      default:
        return {
          type: 'unknown_event',
          eventType: event.type,
        };
    }
  }

  /**
   * Create a refund for a payment
   */
  async refundPayment(paymentIntentId: string, amount?: number) {
    const stripe = await getUncachableStripeClient();

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amount && {
        amount: Math.round(amount * 100),
      }),
    });

    return {
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
      reason: refund.reason,
    };
  }
}

export const stripeService = new StripeService();
