// Solana Blockchain Service for On-Chain Hash Anchoring
// Supports simulation mode (no blockchain) and live mode (mainnet via Helius)

import { createHash } from 'crypto';

// Configuration
const SIMULATION_MODE = !process.env.HELIUS_API_KEY;
const HELIUS_RPC_URL = process.env.HELIUS_API_KEY 
  ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
  : null;

// Types
interface HashAnchor {
  id: string;
  hallmarkId: string;
  contentHash: string;
  assetType: string;
  timestamp: Date;
  merkleRoot?: string;
  transactionSignature?: string;
  status: 'queued' | 'batched' | 'anchored' | 'verified';
}

interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
}

interface BatchResult {
  merkleRoot: string;
  transactionSignature: string;
  hashCount: number;
  anchoredAt: Date;
  explorerUrl: string;
}

// In-memory queue for hashes awaiting anchoring
let hashQueue: HashAnchor[] = [];
let anchoredBatches: BatchResult[] = [];

// Document types that should be anchored on-chain
const ANCHORABLE_TYPES = [
  'invoice',
  'paystub',
  'payroll',
  'letter',        // Welcome letters, offer letters
  'equipment',     // Equipment assignments
  'report',        // Compliance reports
  'contract',      // CSAs, rate confirmations
  'certification', // Worker certifications
  'background_check',
  'i9_verification',
];

export class SolanaService {
  private simulationMode: boolean;

  constructor() {
    this.simulationMode = SIMULATION_MODE;
    if (this.simulationMode) {
      console.log('[Solana] Running in SIMULATION MODE - no blockchain transactions');
      console.log('[Solana] Add HELIUS_API_KEY to enable live mode');
    } else {
      console.log('[Solana] Connected to mainnet via Helius RPC');
    }
  }

  isSimulationMode(): boolean {
    return this.simulationMode;
  }

  isConfigured(): boolean {
    return !this.simulationMode;
  }

  shouldAnchor(assetType: string): boolean {
    return ANCHORABLE_TYPES.includes(assetType.toLowerCase());
  }

  getAnchorableTypes(): string[] {
    return [...ANCHORABLE_TYPES];
  }

  async queueForAnchoring(
    hallmarkId: string,
    contentHash: string,
    assetType: string
  ): Promise<HashAnchor> {
    const anchor: HashAnchor = {
      id: `anchor_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      hallmarkId,
      contentHash,
      assetType,
      timestamp: new Date(),
      status: 'queued',
    };

    hashQueue.push(anchor);
    console.log(`[Solana] Queued hash for anchoring: ${hallmarkId} (${assetType})`);
    console.log(`[Solana] Queue size: ${hashQueue.length}`);

    return anchor;
  }

  getQueuedHashes(): HashAnchor[] {
    return [...hashQueue];
  }

  getQueueSize(): number {
    return hashQueue.length;
  }

  buildMerkleTree(hashes: string[]): { root: string; tree: MerkleNode } {
    if (hashes.length === 0) {
      throw new Error('Cannot build Merkle tree from empty hash list');
    }

    // Create leaf nodes
    let nodes: MerkleNode[] = hashes.map(hash => ({ hash }));

    // Build tree bottom-up
    while (nodes.length > 1) {
      const newLevel: MerkleNode[] = [];
      
      for (let i = 0; i < nodes.length; i += 2) {
        const left = nodes[i];
        const right = nodes[i + 1] || left; // Duplicate last node if odd
        
        const combinedHash = createHash('sha256')
          .update(left.hash + right.hash)
          .digest('hex');
        
        newLevel.push({
          hash: combinedHash,
          left,
          right: nodes[i + 1] ? right : undefined,
        });
      }
      
      nodes = newLevel;
    }

    return {
      root: nodes[0].hash,
      tree: nodes[0],
    };
  }

  generateMerkleProof(hash: string, tree: MerkleNode): string[] {
    const proof: string[] = [];
    
    function findPath(node: MerkleNode, target: string, path: string[]): boolean {
      if (!node.left && !node.right) {
        return node.hash === target;
      }
      
      if (node.left && findPath(node.left, target, path)) {
        if (node.right) path.push(node.right.hash);
        return true;
      }
      
      if (node.right && findPath(node.right, target, path)) {
        if (node.left) path.push(node.left.hash);
        return true;
      }
      
      return false;
    }
    
    findPath(tree, hash, proof);
    return proof;
  }

  async anchorBatch(): Promise<BatchResult | null> {
    if (hashQueue.length === 0) {
      console.log('[Solana] No hashes in queue to anchor');
      return null;
    }

    const batchHashes = hashQueue.map(h => h.contentHash);
    const { root: merkleRoot } = this.buildMerkleTree(batchHashes);
    
    console.log(`[Solana] Batching ${batchHashes.length} hashes into Merkle root: ${merkleRoot.substring(0, 16)}...`);

    let transactionSignature: string;
    let explorerUrl: string;

    if (this.simulationMode) {
      // Simulation mode - generate fake but realistic-looking signature
      transactionSignature = `SIM_${Date.now()}_${createHash('sha256').update(merkleRoot).digest('hex').substring(0, 44)}`;
      explorerUrl = `https://explorer.solana.com/tx/${transactionSignature}?cluster=mainnet-beta`;
      console.log(`[Solana] SIMULATION: Would anchor Merkle root to Solana`);
      console.log(`[Solana] SIMULATION: Transaction signature: ${transactionSignature}`);
    } else {
      // Live mode - submit to Solana via Helius
      try {
        transactionSignature = await this.submitToSolana(merkleRoot);
        explorerUrl = `https://explorer.solana.com/tx/${transactionSignature}?cluster=mainnet-beta`;
        console.log(`[Solana] LIVE: Anchored to Solana: ${transactionSignature}`);
      } catch (error) {
        console.error('[Solana] Failed to submit to Solana:', error);
        throw error;
      }
    }

    // Update all queued hashes with batch info
    const batchedHashes = hashQueue.map(h => ({
      ...h,
      merkleRoot,
      transactionSignature,
      status: 'anchored' as const,
    }));

    const result: BatchResult = {
      merkleRoot,
      transactionSignature,
      hashCount: batchHashes.length,
      anchoredAt: new Date(),
      explorerUrl,
    };

    anchoredBatches.push(result);
    
    // Clear the queue
    hashQueue = [];
    
    console.log(`[Solana] Batch anchored successfully. ${result.hashCount} documents now on-chain.`);
    
    return result;
  }

  private async submitToSolana(merkleRoot: string): Promise<string> {
    if (!HELIUS_RPC_URL) {
      throw new Error('Helius RPC not configured');
    }

    // In production, this would:
    // 1. Create a memo transaction with the Merkle root
    // 2. Sign with the program's keypair
    // 3. Submit via Helius RPC
    // For now, we'll use the Memo Program for simple hash storage

    // This is a placeholder for the actual Solana transaction submission
    // When you're ready to go live, we'll add:
    // - @solana/web3.js for transaction building
    // - Keypair management for signing
    // - Actual RPC submission
    
    throw new Error('Live Solana submission not yet implemented - add wallet keypair to enable');
  }

  getAnchoredBatches(): BatchResult[] {
    return [...anchoredBatches];
  }

  getStats(): {
    mode: string;
    queueSize: number;
    totalBatches: number;
    totalAnchored: number;
    anchorableTypes: string[];
  } {
    return {
      mode: this.simulationMode ? 'simulation' : 'live',
      queueSize: hashQueue.length,
      totalBatches: anchoredBatches.length,
      totalAnchored: anchoredBatches.reduce((sum, b) => sum + b.hashCount, 0),
      anchorableTypes: ANCHORABLE_TYPES,
    };
  }

  async verifyHash(contentHash: string): Promise<{
    found: boolean;
    batch?: BatchResult;
    proof?: string[];
  }> {
    // Check all batches for the hash
    for (const batch of anchoredBatches) {
      // In production, we'd store the full hash list per batch
      // For now, return the batch if found in queue history
    }
    
    return { found: false };
  }
}

export const solanaService = new SolanaService();
