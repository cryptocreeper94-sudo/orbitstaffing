/**
 * Asset Tracking System
 * Every "Powered by ORBIT" button and branded asset gets a unique hallmark number
 * This tracks all ORBIT-branded assets in franchisee deployments
 */

export type AssetType = 'powered_by_button' | 'hallmark_watermark' | 'digital_card' | 'landing_page' | 'other';
export type AssetStatus = 'active' | 'archived' | 'revoked';

export interface OrbitAsset {
  id: string;
  assetNumber: string; // ORBIT-ASSET-XXXX-YYYY (unique hallmark number)
  type: AssetType;
  franchiseeId?: string; // If tied to a specific franchisee
  customerId?: string; // If tied to a specific customer
  createdAt: Date;
  expiresAt?: Date;
  status: AssetStatus;
  metadata: {
    domain?: string; // The domain it's deployed on
    location?: string; // Where on the page (footer, header, etc)
    customizations?: Record<string, any>;
  };
}

/**
 * Generate a unique ORBIT hallmark asset number
 * Format: ORBIT-ASSET-{TIMESTAMP}-{RANDOM}
 * Example: ORBIT-ASSET-20250123-A7X2K9
 */
export function generateAssetNumber(): string {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 8); // YYYYMMDD
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORBIT-ASSET-${timestamp}-${random}`;
}

/**
 * Asset Registry - In-memory store (should be backed by database in production)
 * This tracks all ORBIT-branded assets deployed
 */
export class AssetRegistry {
  private assets: Map<string, OrbitAsset> = new Map();

  registerAsset(
    type: AssetType,
    franchiseeId?: string,
    customerId?: string,
    metadata?: any
  ): OrbitAsset {
    const assetNumber = generateAssetNumber();
    const asset: OrbitAsset = {
      id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      assetNumber,
      type,
      franchiseeId,
      customerId,
      createdAt: new Date(),
      status: 'active',
      metadata: metadata || {},
    };

    this.assets.set(assetNumber, asset);
    console.log(`✓ Asset registered: ${assetNumber} (${type})`);
    return asset;
  }

  getAsset(assetNumber: string): OrbitAsset | undefined {
    return this.assets.get(assetNumber);
  }

  getAllAssets(): OrbitAsset[] {
    return Array.from(this.assets.values());
  }

  revokeAsset(assetNumber: string): boolean {
    const asset = this.assets.get(assetNumber);
    if (asset) {
      asset.status = 'revoked';
      return true;
    }
    return false;
  }
}

// Global registry instance
export const assetRegistry = new AssetRegistry();
