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

  async createCheckoutSession(customerId: string | null, priceId: string, successUrl: string, cancelUrl: string) {
    const stripe = await getUncachableStripeClient();
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    };
    
    // Only add customer if provided - Stripe auto-creates for subscription mode
    if (customerId) {
      sessionParams.customer = customerId;
    }
    
    return await stripe.checkout.sessions.create(sessionParams);
  }

  async retrieveCheckoutSession(sessionId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer'],
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

  /**
   * Create or retrieve a Stripe Product for a franchise tier
   */
  async getOrCreateFranchiseProduct(tierCode: string, tierName: string) {
    const stripe = await getUncachableStripeClient();
    const productId = `franchise_${tierCode}`;
    
    try {
      return await stripe.products.retrieve(productId);
    } catch (e) {
      return await stripe.products.create({
        id: productId,
        name: `ORBIT Franchise - ${tierName}`,
        description: `ORBIT Staffing OS ${tierName} Franchise License`,
        metadata: {
          type: 'franchise',
          tierCode,
        },
      });
    }
  }

  /**
   * Create a one-time payment checkout session for franchise fee
   */
  async createFranchiseFeeCheckout(input: {
    franchiseFee: number;
    tierCode: string;
    tierName: string;
    customerEmail: string;
    applicationId: number;
    successUrl: string;
    cancelUrl: string;
  }) {
    const stripe = await getUncachableStripeClient();
    
    const product = await this.getOrCreateFranchiseProduct(input.tierCode, input.tierName);
    
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: input.franchiseFee,
      currency: 'usd',
      metadata: {
        type: 'franchise_fee',
        tierCode: input.tierCode,
        applicationId: input.applicationId.toString(),
      },
    });
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: price.id, quantity: 1 }],
      mode: 'payment',
      customer_email: input.customerEmail,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        type: 'franchise_fee',
        tierCode: input.tierCode,
        applicationId: input.applicationId.toString(),
      },
    });
    
    return {
      sessionId: session.id,
      sessionUrl: session.url,
      priceId: price.id,
    };
  }

  /**
   * Create a subscription checkout for monthly franchise support fee
   */
  async createFranchiseSupportSubscription(input: {
    supportMonthlyFee: number;
    tierCode: string;
    tierName: string;
    customerId: string;
    hallmarkId: number;
    successUrl: string;
    cancelUrl: string;
  }) {
    const stripe = await getUncachableStripeClient();
    
    const productId = `franchise_support_${input.tierCode}`;
    
    let product;
    try {
      product = await stripe.products.retrieve(productId);
    } catch (e) {
      product = await stripe.products.create({
        id: productId,
        name: `ORBIT Franchise Support - ${input.tierName}`,
        description: `Monthly support and platform access for ${input.tierName} franchise`,
        metadata: {
          type: 'franchise_support',
          tierCode: input.tierCode,
        },
      });
    }
    
    const priceId = `franchise_support_${input.tierCode}_monthly`;
    
    let price;
    try {
      price = await stripe.prices.retrieve(priceId);
    } catch (e) {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: input.supportMonthlyFee,
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: {
          type: 'franchise_support',
          tierCode: input.tierCode,
        },
      });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: price.id, quantity: 1 }],
      mode: 'subscription',
      customer: input.customerId,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        type: 'franchise_support',
        tierCode: input.tierCode,
        hallmarkId: input.hallmarkId.toString(),
      },
    });
    
    return {
      sessionId: session.id,
      sessionUrl: session.url,
      subscriptionPriceId: price.id,
    };
  }

  /**
   * Create a combined franchise checkout (fee + first month support)
   */
  async createFranchiseCheckout(input: {
    franchiseFee: number;
    supportMonthlyFee: number;
    tierCode: string;
    tierName: string;
    customerEmail: string;
    applicationId: number;
    companyName: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    const stripe = await getUncachableStripeClient();
    
    const customer = await stripe.customers.create({
      email: input.customerEmail,
      name: input.companyName,
      metadata: {
        type: 'franchise_applicant',
        applicationId: input.applicationId.toString(),
        tierCode: input.tierCode,
      },
    });
    
    const feeProduct = await this.getOrCreateFranchiseProduct(input.tierCode, input.tierName);
    
    const feePrice = await stripe.prices.create({
      product: feeProduct.id,
      unit_amount: input.franchiseFee,
      currency: 'usd',
      metadata: {
        type: 'franchise_fee',
        tierCode: input.tierCode,
        applicationId: input.applicationId.toString(),
      },
    });
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customer.id,
      line_items: [
        { price: feePrice.id, quantity: 1 },
      ],
      mode: 'payment',
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        type: 'franchise_purchase',
        tierCode: input.tierCode,
        applicationId: input.applicationId.toString(),
        customerId: customer.id,
      },
      payment_intent_data: {
        metadata: {
          type: 'franchise_fee',
          tierCode: input.tierCode,
          applicationId: input.applicationId.toString(),
        },
      },
    });
    
    return {
      sessionId: session.id,
      sessionUrl: session.url,
      customerId: customer.id,
      franchiseFeePriceId: feePrice.id,
    };
  }

  /**
   * Record a royalty payment from a franchise
   */
  async createRoyaltyPayment(input: {
    amount: number;
    hallmarkId: number;
    periodStart: Date;
    periodEnd: Date;
    customerId: string;
    description: string;
  }) {
    const stripe = await getUncachableStripeClient();
    
    const invoice = await stripe.invoices.create({
      customer: input.customerId,
      auto_advance: true,
      collection_method: 'send_invoice',
      days_until_due: 14,
      description: input.description,
      metadata: {
        type: 'franchise_royalty',
        hallmarkId: input.hallmarkId.toString(),
        periodStart: input.periodStart.toISOString(),
        periodEnd: input.periodEnd.toISOString(),
      },
    });
    
    await stripe.invoiceItems.create({
      customer: input.customerId,
      invoice: invoice.id,
      amount: input.amount,
      currency: 'usd',
      description: input.description,
    });
    
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    
    return {
      invoiceId: finalizedInvoice.id,
      invoiceUrl: finalizedInvoice.hosted_invoice_url,
      invoicePdf: finalizedInvoice.invoice_pdf,
      amount: input.amount / 100,
      status: finalizedInvoice.status,
    };
  }
}

export const stripeService = new StripeService();
