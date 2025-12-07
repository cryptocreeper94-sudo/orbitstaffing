// Automatic Version Management & Solana Hashing on Publish
// This module handles version bumping and blockchain stamping for releases

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { solanaService } from './solanaService';
import { db } from './db';
import { sql } from 'drizzle-orm';

interface VersionInfo {
  version: string;
  buildNumber: number;
  lastPublished: string;
  solanaHash: string | null;
  transactionSignature: string | null;
}

const VERSION_FILE = 'version.json';

export class VersionManager {
  private versionInfo: VersionInfo;

  constructor() {
    this.versionInfo = this.loadVersion();
  }

  private loadVersion(): VersionInfo {
    try {
      if (existsSync(VERSION_FILE)) {
        const data = readFileSync(VERSION_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.log('[Version] No existing version file, creating new one');
    }

    // Default version info
    return {
      version: '2.7.0',
      buildNumber: 1,
      lastPublished: new Date().toISOString(),
      solanaHash: null,
      transactionSignature: null,
    };
  }

  private saveVersion(): void {
    writeFileSync(VERSION_FILE, JSON.stringify(this.versionInfo, null, 2));
    console.log(`[Version] Saved version ${this.versionInfo.version} (build ${this.versionInfo.buildNumber})`);
  }

  getCurrentVersion(): VersionInfo {
    return { ...this.versionInfo };
  }

  bumpVersion(type: 'major' | 'minor' | 'patch' = 'patch'): string {
    const [major, minor, patch] = this.versionInfo.version.split('.').map(Number);

    switch (type) {
      case 'major':
        this.versionInfo.version = `${major + 1}.0.0`;
        break;
      case 'minor':
        this.versionInfo.version = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
        this.versionInfo.version = `${major}.${minor}.${patch + 1}`;
        break;
    }

    this.versionInfo.buildNumber++;
    console.log(`[Version] Bumped to ${this.versionInfo.version} (build ${this.versionInfo.buildNumber})`);

    return this.versionInfo.version;
  }

  generateReleaseHash(): string {
    const releaseData = {
      app: 'ORBIT Staffing OS',
      version: this.versionInfo.version,
      buildNumber: this.versionInfo.buildNumber,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };

    const hash = createHash('sha256')
      .update(JSON.stringify(releaseData))
      .digest('hex');

    console.log(`[Version] Generated release hash: ${hash.substring(0, 16)}...`);
    return hash;
  }

  async publishRelease(bumpType: 'major' | 'minor' | 'patch' = 'patch'): Promise<{
    version: string;
    buildNumber: number;
    hash: string;
    solanaResult: any;
  }> {
    console.log('[Version] Starting publish process...');

    // 1. Bump version
    const newVersion = this.bumpVersion(bumpType);
    console.log(`[Version] New version: ${newVersion}`);

    // 2. Generate release hash
    const releaseHash = this.generateReleaseHash();
    this.versionInfo.solanaHash = releaseHash;

    // 3. Queue for Solana anchoring
    const hallmarkId = `orbit-release-v${newVersion}`;
    await solanaService.queueForAnchoring(hallmarkId, releaseHash, 'release');

    // 4. Anchor the batch immediately
    const solanaResult = await solanaService.anchorBatch();

    if (solanaResult) {
      this.versionInfo.transactionSignature = solanaResult.transactionSignature;
      console.log(`[Version] Solana anchor: ${solanaResult.transactionSignature}`);
    }

    // 5. Update last published timestamp
    this.versionInfo.lastPublished = new Date().toISOString();

    // 6. Save version file
    this.saveVersion();

    // 7. Log to database
    try {
      await db.execute(sql`
        INSERT INTO release_history (version, build_number, release_hash, transaction_signature, published_at)
        VALUES (${newVersion}, ${this.versionInfo.buildNumber}, ${releaseHash}, ${solanaResult?.transactionSignature || null}, NOW())
      `);
    } catch (error) {
      console.log('[Version] Note: release_history table not created yet, skipping DB log');
    }

    console.log('[Version] ═══════════════════════════════════════════════════');
    console.log(`[Version] ORBIT Staffing OS v${newVersion} PUBLISHED`);
    console.log(`[Version] Build: ${this.versionInfo.buildNumber}`);
    console.log(`[Version] Hash: ${releaseHash}`);
    if (solanaResult) {
      console.log(`[Version] Solana TX: ${solanaResult.transactionSignature}`);
      console.log(`[Version] Explorer: ${solanaResult.explorerUrl}`);
    }
    console.log('[Version] ═══════════════════════════════════════════════════');

    return {
      version: newVersion,
      buildNumber: this.versionInfo.buildNumber,
      hash: releaseHash,
      solanaResult,
    };
  }

  async getPublishHistory(): Promise<any[]> {
    try {
      const result = await db.execute(sql`
        SELECT version, build_number, release_hash, transaction_signature, published_at
        FROM release_history
        ORDER BY published_at DESC
        LIMIT 20
      `);
      return result.rows as any[];
    } catch (error) {
      return [];
    }
  }
}

export const versionManager = new VersionManager();
