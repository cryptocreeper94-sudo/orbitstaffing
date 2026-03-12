import crypto from 'crypto';
import { db } from './db';
import { sql, eq, and, count } from 'drizzle-orm';
import { users, affiliateReferrals, affiliateCommissions } from '@shared/schema';
import { createTrustStamp } from './ecosystemHallmark';

const COMMISSION_TIERS = [
  { name: 'diamond', minReferrals: 50, rate: 0.20 },
  { name: 'platinum', minReferrals: 30, rate: 0.175 },
  { name: 'gold', minReferrals: 15, rate: 0.15 },
  { name: 'silver', minReferrals: 5, rate: 0.125 },
  { name: 'base', minReferrals: 0, rate: 0.10 },
];

const MIN_PAYOUT = 10;

export function generateUniqueHash(): string {
  return crypto.randomBytes(12).toString('hex');
}

export async function ensureUserHash(userId: string): Promise<string> {
  const userRows = await db
    .select({ uniqueHash: users.uniqueHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userRows[0]?.uniqueHash) {
    return userRows[0].uniqueHash;
  }

  const hash = generateUniqueHash();
  await db
    .update(users)
    .set({ uniqueHash: hash })
    .where(eq(users.id, userId));

  return hash;
}

async function getUserTier(userId: string): Promise<{ name: string; rate: number; convertedCount: number }> {
  const result = await db
    .select({ total: count() })
    .from(affiliateReferrals)
    .where(and(
      eq(affiliateReferrals.referrerId, userId),
      eq(affiliateReferrals.status, 'converted')
    ));

  const convertedCount = result[0]?.total || 0;

  for (const tier of COMMISSION_TIERS) {
    if (convertedCount >= tier.minReferrals) {
      return { name: tier.name, rate: tier.rate, convertedCount };
    }
  }

  return { name: 'base', rate: 0.10, convertedCount };
}

export async function getAffiliateDashboard(userId: string) {
  const hash = await ensureUserHash(userId);
  const tier = await getUserTier(userId);

  const referralRows = await db
    .select()
    .from(affiliateReferrals)
    .where(eq(affiliateReferrals.referrerId, userId))
    .orderBy(sql`created_at DESC`)
    .limit(50);

  const commissionRows = await db
    .select()
    .from(affiliateCommissions)
    .where(eq(affiliateCommissions.referrerId, userId))
    .orderBy(sql`created_at DESC`)
    .limit(50);

  const pendingEarnings = commissionRows
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + parseFloat(c.amount), 0);

  const paidEarnings = commissionRows
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + parseFloat(c.amount), 0);

  const totalReferrals = referralRows.length;
  const convertedReferrals = referralRows.filter(r => r.status === 'converted').length;

  const nextTier = COMMISSION_TIERS.find(t => t.minReferrals > tier.convertedCount);

  return {
    uniqueHash: hash,
    referralLink: `https://orbit.tlid.io/ref/${hash}`,
    tier: {
      current: tier.name,
      rate: tier.rate,
      convertedCount: tier.convertedCount,
      nextTier: nextTier ? {
        name: nextTier.name,
        rate: nextTier.rate,
        referralsNeeded: nextTier.minReferrals - tier.convertedCount,
      } : null,
    },
    stats: {
      totalReferrals,
      convertedReferrals,
      pendingEarnings: pendingEarnings.toFixed(2),
      paidEarnings: paidEarnings.toFixed(2),
    },
    tiers: COMMISSION_TIERS.map(t => ({
      name: t.name,
      minReferrals: t.minReferrals,
      rate: `${(t.rate * 100).toFixed(1)}%`,
    })).reverse(),
    recentReferrals: referralRows.slice(0, 10),
    recentCommissions: commissionRows.slice(0, 10),
  };
}

export async function getAffiliateLink(userId: string) {
  const hash = await ensureUserHash(userId);

  const crossPlatformLinks = [
    { app: 'ORBIT Staffing OS', domain: 'orbit.tlid.io', link: `https://orbit.tlid.io/ref/${hash}` },
    { app: 'Trust Layer Hub', domain: 'trusthub.tlid.io', link: `https://trusthub.tlid.io/ref/${hash}` },
    { app: 'TrustVault', domain: 'trustvault.tlid.io', link: `https://trustvault.tlid.io/ref/${hash}` },
    { app: 'THE VOID', domain: 'thevoid.tlid.io', link: `https://thevoid.tlid.io/ref/${hash}` },
    { app: 'Happy Eats', domain: 'happyeats.tlid.io', link: `https://happyeats.tlid.io/ref/${hash}` },
    { app: 'Brew & Board Coffee', domain: 'brewandboard.tlid.io', link: `https://brewandboard.tlid.io/ref/${hash}` },
    { app: 'GarageBot', domain: 'garagebot.tlid.io', link: `https://garagebot.tlid.io/ref/${hash}` },
    { app: 'PaintPros', domain: 'paintpros.tlid.io', link: `https://paintpros.tlid.io/ref/${hash}` },
    { app: 'TrustHome', domain: 'trusthome.tlid.io', link: `https://trusthome.tlid.io/ref/${hash}` },
  ];

  return {
    uniqueHash: hash,
    primaryLink: `https://orbit.tlid.io/ref/${hash}`,
    crossPlatformLinks,
    shareText: `Join me on ORBIT Staffing OS — part of the Trust Layer ecosystem!\nhttps://orbit.tlid.io/ref/${hash}`,
  };
}

export async function trackReferral(referralHash: string, platform: string = 'orbit') {
  const referrer = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.uniqueHash, referralHash))
    .limit(1);

  if (referrer.length === 0) {
    return { success: false, error: 'Invalid referral hash' };
  }

  const [referral] = await db.insert(affiliateReferrals).values({
    referrerId: referrer[0].id,
    referralHash,
    platform,
    status: 'pending',
  }).returning();

  return { success: true, referralId: referral.id };
}

export async function convertReferral(referralId: number, referredUserId: string) {
  await db
    .update(affiliateReferrals)
    .set({
      status: 'converted',
      referredUserId,
      convertedAt: new Date(),
    })
    .where(eq(affiliateReferrals.id, referralId));

  const referral = await db
    .select()
    .from(affiliateReferrals)
    .where(eq(affiliateReferrals.id, referralId))
    .limit(1);

  if (referral[0]) {
    await createTrustStamp({
      userId: referral[0].referrerId,
      category: 'affiliate-referral-converted',
      data: {
        referralId,
        referredUserId,
        platform: referral[0].platform,
        appContext: 'orbit',
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export async function requestPayout(userId: string) {
  const pendingCommissions = await db
    .select()
    .from(affiliateCommissions)
    .where(and(
      eq(affiliateCommissions.referrerId, userId),
      eq(affiliateCommissions.status, 'pending')
    ));

  const totalPending = pendingCommissions.reduce((sum, c) => sum + parseFloat(c.amount), 0);

  if (totalPending < MIN_PAYOUT) {
    return {
      success: false,
      error: `Minimum payout is ${MIN_PAYOUT} SIG. Current pending: ${totalPending.toFixed(2)} SIG`,
    };
  }

  for (const commission of pendingCommissions) {
    await db
      .update(affiliateCommissions)
      .set({ status: 'processing' })
      .where(eq(affiliateCommissions.id, commission.id));
  }

  await createTrustStamp({
    userId,
    category: 'affiliate-payout-request',
    data: {
      amount: totalPending.toFixed(2),
      currency: 'SIG',
      commissionsCount: pendingCommissions.length,
      appContext: 'orbit',
      timestamp: new Date().toISOString(),
    },
  });

  return {
    success: true,
    amount: totalPending.toFixed(2),
    currency: 'SIG',
    commissionsCount: pendingCommissions.length,
    message: 'Payout request submitted. Processing within 48 hours.',
  };
}
