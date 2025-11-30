import crypto from 'crypto';
import { solanaService } from './solanaService';

/**
 * ORBIT Hallmark Service - Automatic stamping & tracking
 * Every asset gets a unique, permanent identifier
 * Now with optional Solana blockchain anchoring for immutable verification
 */

export function generateHallmarkNumber(): string {
  const date = new Date().toISOString().replace(/[-:]/g, '').substring(0, 8);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORBIT-${date}-${random}`;
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
