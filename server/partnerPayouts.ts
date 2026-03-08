import { getUncachableStripeClient } from './stripeClient';
import { db } from './db';
import { partnerProfiles } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { createTrustStamp } from './ecosystemHallmark';

export interface PartnerBankSetupResult {
  success: boolean;
  stripeAccountId?: string;
  bankLast4?: string;
  error?: string;
  requiresVerification?: boolean;
  verificationFields?: string[];
}

export async function createPartnerConnectedAccount(partnerId: string): Promise<PartnerBankSetupResult> {
  try {
    const [partner] = await db.select().from(partnerProfiles)
      .where(eq(partnerProfiles.id, partnerId));

    if (!partner) {
      return { success: false, error: 'Partner profile not found' };
    }

    if (partner.stripeAccountId) {
      return {
        success: true,
        stripeAccountId: partner.stripeAccountId,
        bankLast4: partner.bankAccountLast4 || undefined,
      };
    }

    if (!partner.bankRoutingNumber || !partner.bankAccountNumber) {
      return { success: false, error: 'Bank routing and account numbers required' };
    }

    const stripe = await getUncachableStripeClient();

    const nameParts = partner.fullName.split(' ');
    const firstName = nameParts[0] || 'Partner';
    const lastName = nameParts.slice(1).join(' ') || 'Account';

    const account = await stripe.accounts.create({
      type: 'custom',
      country: 'US',
      email: partner.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      individual: {
        first_name: firstName,
        last_name: lastName,
        email: partner.email,
      },
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: '127.0.0.1',
      },
    } as any);

    await stripe.accounts.createExternalAccount(account.id, {
      external_account: {
        object: 'bank_account',
        country: 'US',
        currency: 'usd',
        routing_number: partner.bankRoutingNumber,
        account_number: partner.bankAccountNumber,
        account_holder_name: partner.fullName,
        account_holder_type: 'individual',
      } as any,
    });

    const last4 = partner.bankAccountNumber.slice(-4);

    await db.update(partnerProfiles)
      .set({
        stripeAccountId: account.id,
        stripeConnectStatus: 'pending',
        bankAccountLast4: last4,
        paymentMethod: 'bank_transfer',
        updatedAt: new Date(),
      })
      .where(eq(partnerProfiles.id, partnerId));

    await createTrustStamp({
      category: 'stripe-connect',
      data: {
        partnerId,
        businessName: partner.fullName,
        bankName: partner.bankName,
        bankLast4: last4,
        appContext: 'orbit',
      },
    }).catch(() => {});

    console.log(`[PartnerPayouts] Created Stripe connected account ${account.id} for ${partner.fullName}`);

    const requirements = (account as any).requirements;
    const needsVerification = requirements?.currently_due?.length > 0;

    return {
      success: true,
      stripeAccountId: account.id,
      bankLast4: last4,
      requiresVerification: needsVerification,
      verificationFields: requirements?.currently_due || [],
    };
  } catch (error: any) {
    console.error('[PartnerPayouts] Account creation error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function processPartnerPayout(
  partnerId: string,
  amount: number,
  description: string,
  productCode: string,
): Promise<{ success: boolean; transferId?: string; error?: string }> {
  try {
    if (amount < 1) {
      return { success: false, error: 'Amount must be at least $1.00' };
    }

    const [partner] = await db.select().from(partnerProfiles)
      .where(eq(partnerProfiles.id, partnerId));

    if (!partner) {
      return { success: false, error: 'Partner not found' };
    }

    if (!partner.stripeAccountId) {
      return { success: false, error: 'Partner does not have a connected Stripe account. Run setup first.' };
    }

    const stripe = await getUncachableStripeClient();

    const amountInCents = Math.round(amount * 100);

    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: 'usd',
      destination: partner.stripeAccountId,
      description: `${productCode} revenue split - ${description}`,
      transfer_group: `${productCode}_split_${Date.now()}`,
    });

    await createTrustStamp({
      category: 'wallet-send',
      data: {
        to: partner.fullName,
        amount: amount.toFixed(2),
        asset: 'USD',
        productCode,
        transferId: transfer.id,
        appContext: 'orbit',
      },
    }).catch(() => {});

    console.log(`[PartnerPayouts] Transferred $${amount.toFixed(2)} to ${partner.fullName} (${transfer.id})`);

    return { success: true, transferId: transfer.id };
  } catch (error: any) {
    console.error('[PartnerPayouts] Transfer error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getPartnerPayoutStatus(partnerId: string): Promise<{
  accountId: string | null;
  status: string;
  payoutsEnabled: boolean;
  bankLast4: string | null;
  bankName: string | null;
  requiresAction: string[];
}> {
  const [partner] = await db.select().from(partnerProfiles)
    .where(eq(partnerProfiles.id, partnerId));

  if (!partner || !partner.stripeAccountId) {
    return {
      accountId: null,
      status: 'not_connected',
      payoutsEnabled: false,
      bankLast4: partner?.bankAccountLast4 || null,
      bankName: partner?.bankName || null,
      requiresAction: ['Connect Stripe account'],
    };
  }

  try {
    const stripe = await getUncachableStripeClient();
    const account = await stripe.accounts.retrieve(partner.stripeAccountId);

    const payoutsEnabled = (account as any).payouts_enabled || false;
    const requirements = (account as any).requirements?.currently_due || [];

    if (payoutsEnabled && partner.stripeConnectStatus !== 'active') {
      await db.update(partnerProfiles)
        .set({ stripeConnectStatus: 'active', stripePayoutsEnabled: true, updatedAt: new Date() })
        .where(eq(partnerProfiles.id, partnerId));
    }

    return {
      accountId: partner.stripeAccountId,
      status: payoutsEnabled ? 'active' : 'pending_verification',
      payoutsEnabled,
      bankLast4: partner.bankAccountLast4,
      bankName: partner.bankName,
      requiresAction: requirements,
    };
  } catch (error: any) {
    return {
      accountId: partner.stripeAccountId,
      status: 'error',
      payoutsEnabled: false,
      bankLast4: partner.bankAccountLast4,
      bankName: partner.bankName,
      requiresAction: [error.message],
    };
  }
}

export async function listPartnersByApp(appCode: string) {
  const partners = await db.select().from(partnerProfiles)
    .where(eq(partnerProfiles.partnerApp, appCode));

  return partners.map(p => ({
    id: p.id,
    name: p.fullName,
    email: p.email,
    splitPercentage: p.splitPercentage || p.defaultSplitPercentage,
    bankName: p.bankName,
    bankLast4: p.bankAccountLast4,
    stripeStatus: p.stripeConnectStatus,
    payoutsEnabled: p.stripePayoutsEnabled,
  }));
}
