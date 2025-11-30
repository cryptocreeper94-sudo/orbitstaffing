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

// ============================================
// RESERVED RANGES & SPECIAL EDITIONS
// ============================================

/**
 * Reserved Asset Ranges - Permanently blocked from general allocation
 */
export const RESERVED_RANGES = {
  FOUNDERS: { start: 1, end: 99, description: 'Founder & Core Team Reserved' },
  SPECIAL_EDITIONS: { start: 100, end: 999, description: 'Special & Limited Editions' },
  GENESIS_SERIES: { start: 1000, end: 1999, description: 'Genesis Series (First Franchises)' },
  ANNIVERSARY: { start: 2000, end: 2999, description: 'Anniversary Editions' },
  GENERAL_POOL: { start: 3000, end: 999999999, description: 'General Asset Pool' },
} as const;

/**
 * Special Edition Prefixes for branded hallmarks
 */
export const EDITION_PREFIXES = {
  STANDARD: '',           // Standard: #000000001-00
  GENESIS: 'GE',          // Genesis Edition: #GE-000001000-00
  LIMITED: 'LE',          // Limited Edition: #LE-000000100-00
  SPECIAL: 'SE',          // Special Edition: #SE-000000150-00
  FOUNDERS: 'FE',         // Founder's Edition: #FE-000000002-00
  COLLECTOR: 'CE',        // Collector's Edition: #CE-000000001-00
  ANNIVERSARY: 'ANN',     // Anniversary: #ANN-000002024-00
  PLATINUM: 'PT',         // Platinum Tier: #PT-000000001-00
  DARKWAVE: 'DW',         // DarkWave Studios: #DW-000000001-00
} as const;

export type EditionPrefix = keyof typeof EDITION_PREFIXES;

/**
 * Format special edition asset number
 */
export function formatSpecialEdition(prefix: EditionPrefix, masterNumber: number, subSequence: number = 0): string {
  const master = String(masterNumber).padStart(9, '0');
  const sub = String(subSequence).padStart(2, '0');
  const prefixStr = EDITION_PREFIXES[prefix];
  return prefixStr ? `#${prefixStr}-${master}-${sub}` : `#${master}-${sub}`;
}

/**
 * Parse any hallmark format (standard or special edition)
 */
export function parseHallmark(hallmark: string): { 
  prefix: string | null; 
  master: number; 
  sub: number; 
  edition: string;
  isFounder: boolean;
  isSpecial: boolean;
} | null {
  // Try special edition format: #XX-000000000-00
  const specialMatch = hallmark.match(/^#([A-Z]{2,3})-(\d{9})-(\d{2})$/);
  if (specialMatch) {
    const master = parseInt(specialMatch[2], 10);
    return {
      prefix: specialMatch[1],
      master,
      sub: parseInt(specialMatch[3], 10),
      edition: getEditionName(specialMatch[1]),
      isFounder: master <= RESERVED_RANGES.FOUNDERS.end,
      isSpecial: true,
    };
  }
  
  // Try standard format: #000000000-00
  const standardMatch = hallmark.match(/^#(\d{9})-(\d{2})$/);
  if (standardMatch) {
    const master = parseInt(standardMatch[1], 10);
    return {
      prefix: null,
      master,
      sub: parseInt(standardMatch[2], 10),
      edition: getEditionFromRange(master),
      isFounder: master <= RESERVED_RANGES.FOUNDERS.end,
      isSpecial: master < RESERVED_RANGES.GENERAL_POOL.start,
    };
  }
  
  return null;
}

/**
 * Get edition name from prefix
 */
function getEditionName(prefix: string): string {
  const editions: Record<string, string> = {
    'GE': 'Genesis Edition',
    'LE': 'Limited Edition',
    'SE': 'Special Edition',
    'FE': "Founder's Edition",
    'CE': "Collector's Edition",
    'ANN': 'Anniversary Edition',
    'PT': 'Platinum Tier',
    'DW': 'DarkWave Studios',
  };
  return editions[prefix] || 'Special Edition';
}

/**
 * Get edition type from asset number range
 */
function getEditionFromRange(masterNumber: number): string {
  if (masterNumber <= RESERVED_RANGES.FOUNDERS.end) return "Founder's Edition";
  if (masterNumber <= RESERVED_RANGES.SPECIAL_EDITIONS.end) return 'Special Edition';
  if (masterNumber <= RESERVED_RANGES.GENESIS_SERIES.end) return 'Genesis Series';
  if (masterNumber <= RESERVED_RANGES.ANNIVERSARY.end) return 'Anniversary Edition';
  return 'Standard';
}

/**
 * Check if an asset number is in a reserved range
 */
export function isReservedRange(masterNumber: number): boolean {
  return masterNumber < RESERVED_RANGES.GENERAL_POOL.start;
}

/**
 * Founding assets - permanently reserved with special edition formatting
 */
export const FOUNDING_ASSETS = {
  ORBIT_PLATFORM: { 
    number: formatAssetNumber(1, 0), 
    special: formatSpecialEdition('FOUNDERS', 1, 0),
    name: 'ORBIT Staffing OS', 
    type: 'platform',
    vanity: 'origin',
    badge: 'Genesis Platform',
  },
  JASON_FOUNDER: { 
    number: formatAssetNumber(2, 0), 
    special: formatSpecialEdition('FOUNDERS', 2, 0),
    name: 'Jason', 
    type: 'founder',
    vanity: 'jason',
    badge: 'Founding Developer',
  },
  SIDONIE_TEAM: { 
    number: formatAssetNumber(3, 0), 
    special: formatSpecialEdition('FOUNDERS', 3, 0),
    name: 'Sidonie', 
    type: 'team',
    vanity: 'sidonie',
    badge: 'Founding Team',
  },
};

/**
 * Vanity URL lookups for founders
 */
export const VANITY_LOOKUPS: Record<string, typeof FOUNDING_ASSETS.ORBIT_PLATFORM> = {
  'origin': FOUNDING_ASSETS.ORBIT_PLATFORM,
  'orbit': FOUNDING_ASSETS.ORBIT_PLATFORM,
  'jason': FOUNDING_ASSETS.JASON_FOUNDER,
  'founder': FOUNDING_ASSETS.JASON_FOUNDER,
  'sidonie': FOUNDING_ASSETS.SIDONIE_TEAM,
};

/**
 * Resolve vanity name to hallmark info
 */
export function resolveVanityName(vanity: string): typeof FOUNDING_ASSETS.ORBIT_PLATFORM | null {
  return VANITY_LOOKUPS[vanity.toLowerCase()] || null;
}

/**
 * Get badge/tier for display based on asset number
 */
export function getAssetBadge(hallmark: string): { 
  tier: string; 
  color: string; 
  icon: string;
  glow: string;
} {
  const parsed = parseHallmark(hallmark);
  if (!parsed) return { tier: 'Standard', color: '#6b7280', icon: '📄', glow: 'none' };
  
  if (parsed.master <= 3) {
    return { tier: 'Founding Asset', color: '#fbbf24', icon: '👑', glow: '0 0 20px #fbbf24' };
  }
  if (parsed.master <= RESERVED_RANGES.FOUNDERS.end) {
    return { tier: 'Core Team', color: '#f59e0b', icon: '⭐', glow: '0 0 15px #f59e0b' };
  }
  if (parsed.master <= RESERVED_RANGES.SPECIAL_EDITIONS.end) {
    return { tier: 'Special Edition', color: '#8b5cf6', icon: '💎', glow: '0 0 15px #8b5cf6' };
  }
  if (parsed.master <= RESERVED_RANGES.GENESIS_SERIES.end) {
    return { tier: 'Genesis Series', color: '#06b6d4', icon: '🚀', glow: '0 0 15px #06b6d4' };
  }
  if (parsed.master <= RESERVED_RANGES.ANNIVERSARY.end) {
    return { tier: 'Anniversary', color: '#ec4899', icon: '🎉', glow: '0 0 15px #ec4899' };
  }
  if (parsed.prefix === 'PT') {
    return { tier: 'Platinum', color: '#e5e7eb', icon: '🏆', glow: '0 0 20px #e5e7eb' };
  }
  if (parsed.prefix === 'DW') {
    return { tier: 'DarkWave Studios', color: '#14b8a6', icon: '🌊', glow: '0 0 15px #14b8a6' };
  }
  
  return { tier: 'Standard', color: '#6b7280', icon: '📄', glow: 'none' };
}

/**
 * Get next available asset number (skipping reserved ranges for general allocation)
 */
export async function getNextGeneralAssetNumber(): Promise<string> {
  try {
    const result = await db.execute(sql`
      SELECT MAX(CAST(SUBSTRING(asset_number FROM 2 FOR 9) AS INTEGER)) as max_num 
      FROM orbit_assets 
      WHERE asset_number ~ '^#[0-9]{9}-[0-9]{2}$'
      AND CAST(SUBSTRING(asset_number FROM 2 FOR 9) AS INTEGER) >= ${RESERVED_RANGES.GENERAL_POOL.start}
    `);
    
    const maxNum = (result.rows[0] as any)?.max_num || RESERVED_RANGES.GENERAL_POOL.start - 1;
    const nextNum = Math.max(maxNum + 1, RESERVED_RANGES.GENERAL_POOL.start);
    
    return formatAssetNumber(nextNum, 0);
  } catch (error) {
    console.error('[Hallmark] Error getting next general asset number:', error);
    return formatAssetNumber(RESERVED_RANGES.GENERAL_POOL.start, 0);
  }
}

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
