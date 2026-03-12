import crypto from 'crypto';
import { db } from './db';
import { sql, eq } from 'drizzle-orm';
import { ecosystemHallmarks, trustStamps, hallmarkCounter } from '@shared/schema';

const APP_PREFIX = 'OR';
const APP_NAME = 'ORBIT Staffing OS';
const APP_DOMAIN = 'orbit.tlid.io';
const APP_CONTEXT = 'orbit';

function generateDataHash(payload: Record<string, any>): string {
  const str = JSON.stringify(payload);
  return crypto.createHash('sha256').update(str).digest('hex');
}

function generateSimulatedTxHash(): string {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

function generateSimulatedBlockHeight(): string {
  return String(Math.floor(1000000 + Math.random() * 9000000));
}

async function getNextSequence(): Promise<number> {
  const counterId = `${APP_PREFIX.toLowerCase()}-master`;

  await db.execute(sql`
    INSERT INTO hallmark_counter (id, current_sequence)
    VALUES (${counterId}, '0')
    ON CONFLICT (id) DO NOTHING
  `);

  const result = await db.execute(sql`
    UPDATE hallmark_counter
    SET current_sequence = (CAST(current_sequence AS INTEGER) + 1)::TEXT
    WHERE id = ${counterId}
    RETURNING current_sequence
  `);

  return parseInt((result.rows[0] as any).current_sequence, 10);
}

function formatHallmarkId(sequence: number): string {
  return `${APP_PREFIX}-${String(sequence).padStart(8, '0')}`;
}

export async function generateHallmark(params: {
  userId?: string;
  appId: string;
  productName: string;
  releaseType: string;
  metadata?: Record<string, any>;
}): Promise<{
  thId: string;
  hallmarkId: number;
  dataHash: string;
  txHash: string;
  blockHeight: string;
}> {
  const sequence = await getNextSequence();
  const thId = formatHallmarkId(sequence);
  const timestamp = new Date().toISOString();

  const payload = {
    thId,
    userId: params.userId || null,
    appId: params.appId,
    appName: APP_NAME,
    productName: params.productName,
    releaseType: params.releaseType,
    timestamp,
    metadata: params.metadata || {},
  };

  const dataHash = generateDataHash(payload);
  const txHash = generateSimulatedTxHash();
  const blockHeight = generateSimulatedBlockHeight();
  const verificationUrl = `/api/hallmark/${thId}/verify`;

  await db.insert(ecosystemHallmarks).values({
    thId,
    userId: params.userId || null,
    appId: params.appId,
    appName: APP_NAME,
    productName: params.productName,
    releaseType: params.releaseType,
    metadata: params.metadata || {},
    dataHash,
    txHash,
    blockHeight,
    verificationUrl,
    hallmarkId: sequence,
  });

  await createTrustStamp({
    userId: params.userId || null,
    category: 'hallmark-generated',
    data: {
      hallmarkId: thId,
      releaseType: params.releaseType,
      appContext: APP_CONTEXT,
      timestamp,
    },
  });

  console.log(`[Hallmark] Generated ${thId} (${params.releaseType})`);
  return { thId, hallmarkId: sequence, dataHash, txHash, blockHeight };
}

export async function createTrustStamp(params: {
  userId?: string | null;
  category: string;
  data: Record<string, any>;
}): Promise<{ id: number; dataHash: string }> {
  const timestamp = new Date().toISOString();
  const payload = {
    ...params.data,
    category: params.category,
    appContext: APP_CONTEXT,
    timestamp,
  };

  const dataHash = generateDataHash(payload);
  const txHash = generateSimulatedTxHash();
  const blockHeight = generateSimulatedBlockHeight();

  const result = await db.insert(trustStamps).values({
    userId: params.userId || null,
    category: params.category,
    data: payload,
    dataHash,
    txHash,
    blockHeight,
  }).returning({ id: trustStamps.id });

  return { id: result[0].id, dataHash };
}

export async function seedGenesisHallmark(): Promise<void> {
  const genesisId = `${APP_PREFIX}-00000001`;

  const existing = await db
    .select()
    .from(ecosystemHallmarks)
    .where(eq(ecosystemHallmarks.thId, genesisId))
    .limit(1);

  if (existing.length > 0) {
    console.log(`[Hallmark] Genesis hallmark ${genesisId} already exists.`);
    return;
  }

  const counterId = `${APP_PREFIX.toLowerCase()}-master`;
  await db.execute(sql`
    INSERT INTO hallmark_counter (id, current_sequence)
    VALUES (${counterId}, '0')
    ON CONFLICT (id) DO UPDATE SET current_sequence = '0'
  `);

  await generateHallmark({
    appId: 'orbit-genesis',
    productName: 'Genesis Block',
    releaseType: 'genesis',
    metadata: {
      ecosystem: 'Trust Layer',
      version: '1.0.0',
      domain: APP_DOMAIN,
      operator: 'DarkWave Studios LLC',
      chain: 'Trust Layer Blockchain',
      consensus: 'Proof of Trust',
      launchDate: '2026-08-23T00:00:00.000Z',
      nativeAsset: 'SIG',
      utilityToken: 'Shells',
      parentApp: 'Trust Layer Hub',
      parentGenesis: 'TH-00000001',
    },
  });

  console.log(`[Hallmark] Genesis hallmark ${genesisId} created successfully.`);
}

export async function verifyHallmark(hallmarkId: string): Promise<{
  verified: boolean;
  hallmark?: any;
  error?: string;
}> {
  const prefix = hallmarkId.split('-')[0];
  if (prefix !== APP_PREFIX) {
    return { verified: false, error: 'Hallmark not found' };
  }

  const results = await db
    .select()
    .from(ecosystemHallmarks)
    .where(eq(ecosystemHallmarks.thId, hallmarkId))
    .limit(1);

  if (results.length === 0) {
    return { verified: false, error: 'Hallmark not found' };
  }

  const h = results[0];
  return {
    verified: true,
    hallmark: {
      thId: h.thId,
      appName: h.appName,
      productName: h.productName,
      releaseType: h.releaseType,
      dataHash: h.dataHash,
      txHash: h.txHash,
      blockHeight: h.blockHeight,
      metadata: h.metadata,
      createdAt: h.createdAt,
    },
  };
}

export async function getGenesisHallmark(): Promise<any> {
  const genesisId = `${APP_PREFIX}-00000001`;
  const results = await db
    .select()
    .from(ecosystemHallmarks)
    .where(eq(ecosystemHallmarks.thId, genesisId))
    .limit(1);

  return results[0] || null;
}

export async function getUserTrustStamps(userId: string, limit = 50): Promise<any[]> {
  const results = await db
    .select()
    .from(trustStamps)
    .where(eq(trustStamps.userId, userId))
    .orderBy(sql`created_at DESC`)
    .limit(limit);

  return results;
}

export async function getAllHallmarks(limit = 100): Promise<any[]> {
  const results = await db
    .select()
    .from(ecosystemHallmarks)
    .orderBy(sql`created_at DESC`)
    .limit(limit);

  return results;
}
