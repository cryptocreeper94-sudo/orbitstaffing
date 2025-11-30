import crypto from 'crypto';
import { solanaService } from './solanaService';
import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * ORBIT Hallmark Service - Automatic stamping & tracking
 * Every asset gets a unique, permanent identifier
 * Now with optional Solana blockchain anchoring for immutable verification
 * 
 * ASSET NUMBER FORMAT: #XXXXXXXXX-YY
 * - 9 digits for master asset (1 billion capacity)
 * - 2 digits for sub-sequence (100 per asset)
 * - Total capacity: 100 BILLION hallmarks
 * 
 * FOUNDING ASSETS:
 * #000000001-00 = ORBIT Staffing OS (Platform)
 * #000000002-00 = Jason (Developer/Founder)
 * #000000003-00 = Sidonie (Team Member)
 */

// Global counter for asset numbers (loaded from database on startup)
let currentAssetCounter = 0;

/**
 * Format asset number with 9-digit master + 2-digit sub-sequence
 * Capacity: 1 billion master assets × 100 sub-docs = 100 billion total
 */
export function formatAssetNumber(masterNumber: number, subSequence: number = 0): string {
  const master = String(masterNumber).padStart(9, '0');
  const sub = String(subSequence).padStart(2, '0');
  return `#${master}-${sub}`;
}

/**
 * Parse an asset number back to its components
 */
export function parseAssetNumber(assetNumber: string): { master: number; sub: number } | null {
  const match = assetNumber.match(/^#(\d{9})-(\d{2})$/);
  if (!match) return null;
  return {
    master: parseInt(match[1], 10),
    sub: parseInt(match[2], 10),
  };
}

/**
 * Get the next available master asset number
 */
export async function getNextAssetNumber(): Promise<string> {
  try {
    // Get current max asset number from database
    const result = await db.execute(sql`
      SELECT MAX(CAST(SUBSTRING(asset_number FROM 2 FOR 9) AS INTEGER)) as max_num 
      FROM orbit_assets 
      WHERE asset_number ~ '^#[0-9]{9}-[0-9]{2}$'
    `);
    
    const maxNum = (result.rows[0] as any)?.max_num || 0;
    const nextNum = maxNum + 1;
    
    return formatAssetNumber(nextNum, 0);
  } catch (error) {
    console.error('[Hallmark] Error getting next asset number:', error);
    // Fallback to timestamp-based if DB query fails
    currentAssetCounter++;
    return formatAssetNumber(currentAssetCounter, 0);
  }
}

/**
 * Get next sub-sequence for an existing master asset
 */
export async function getNextSubSequence(masterNumber: number): Promise<string> {
  try {
    const masterStr = String(masterNumber).padStart(9, '0');
    const result = await db.execute(sql`
      SELECT MAX(CAST(SUBSTRING(asset_number FROM 12 FOR 2) AS INTEGER)) as max_sub 
      FROM orbit_assets 
      WHERE asset_number LIKE ${'#' + masterStr + '-%'}
    `);
    
    const maxSub = (result.rows[0] as any)?.max_sub || 0;
    return formatAssetNumber(masterNumber, maxSub + 1);
  } catch (error) {
    console.error('[Hallmark] Error getting next sub-sequence:', error);
    return formatAssetNumber(masterNumber, 1);
  }
}

/**
 * Legacy hallmark number generator (for backwards compatibility)
 */
export function generateHallmarkNumber(): string {
  const date = new Date().toISOString().replace(/[-:]/g, '').substring(0, 8);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORBIT-${date}-${random}`;
}

/**
 * Founding assets - permanently reserved
 */
export const FOUNDING_ASSETS = {
  ORBIT_PLATFORM: { number: formatAssetNumber(1, 0), name: 'ORBIT Staffing OS', type: 'platform' },
  JASON_FOUNDER: { number: formatAssetNumber(2, 0), name: 'Jason', type: 'founder' },
  SIDONIE_TEAM: { number: formatAssetNumber(3, 0), name: 'Sidonie', type: 'team' },
};

export function generateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export interface HallmarkData {
  hallmarkNumber: string;
  assetType: 'letter' | 'invoice' | 'paystub' | 'equipment' | 'payroll' | 'report';
  referenceId?: string;
  createdBy: string;
  recipientName: string;
  recipientRole: 'employee' | 'owner' | 'admin' | 'client';
  contentHash: string;
  metadata: Record<string, any>;
  searchTerms: string;
}

export function createHallmarkData(
  assetType: HallmarkData['assetType'],
  recipientName: string,
  recipientRole: HallmarkData['recipientRole'],
  createdBy: string,
  content: string,
  metadata: Record<string, any> = {},
  referenceId?: string
): HallmarkData {
  
  const hallmarkNumber = generateHallmarkNumber();
  const contentHash = generateContentHash(content);
  
  // Build searchable terms
  const searchTerms = [
    hallmarkNumber,
    assetType,
    recipientName.toLowerCase(),
    recipientRole,
    createdBy.toLowerCase(),
    ...Object.values(metadata)
      .filter(v => typeof v === 'string')
      .map((v: any) => v.toLowerCase())
  ].join(' ');

  return {
    hallmarkNumber,
    assetType,
    referenceId,
    createdBy,
    recipientName,
    recipientRole,
    contentHash,
    metadata,
    searchTerms,
  };
}

export function formatHallmarkForCert(hallmark: any): string {
  const blockchainStatus = hallmark.blockchainTxSignature 
    ? `║ Blockchain: Verified on Solana            ║\n║ TX: ${hallmark.blockchainTxSignature.substring(0, 38)}... ║\n`
    : `║ Blockchain: Pending anchoring             ║\n`;
    
  return `
╔════════════════════════════════════════════╗
║          ORBIT HALLMARK CERTIFICATE        ║
╠════════════════════════════════════════════╣
║ Unique Asset ID: ${hallmark.hallmarkNumber.padEnd(31)} ║
║ Asset Type: ${hallmark.assetType.padEnd(37)} ║
║ Issued: ${new Date(hallmark.createdAt).toLocaleDateString().padEnd(40)} ║
║ Recipient: ${hallmark.recipientName.substring(0, 32).padEnd(35)} ║
║ Content Hash: ${hallmark.contentHash.substring(0, 32)}... ║
${blockchainStatus}╠════════════════════════════════════════════╣
║ This asset has been cataloged and verified ║
║ Powered by ORBIT Staffing OS               ║
╚════════════════════════════════════════════╝
  `;
}

/**
 * Queue a hallmark for blockchain anchoring if it's an anchorable type
 */
export async function queueForBlockchain(
  hallmarkId: string,
  contentHash: string,
  assetType: string
): Promise<{ queued: boolean; message: string }> {
  if (!solanaService.shouldAnchor(assetType)) {
    return { 
      queued: false, 
      message: `Asset type '${assetType}' not configured for blockchain anchoring` 
    };
  }

  try {
    await solanaService.queueForAnchoring(hallmarkId, contentHash, assetType);
    return { 
      queued: true, 
      message: `Queued for blockchain anchoring (${solanaService.isSimulationMode() ? 'simulation' : 'live'} mode)` 
    };
  } catch (error) {
    console.error('[Hallmark] Failed to queue for blockchain:', error);
    return { 
      queued: false, 
      message: 'Failed to queue for blockchain anchoring' 
    };
  }
}

/**
 * Get blockchain anchoring statistics
 */
export async function getBlockchainStats() {
  return await solanaService.getStats();
}
