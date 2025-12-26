/**
 * DarkWave Smart Chain Treasury Sync Client
 * Pulls treasury transparency data from DWSC for bookkeeping/reconciliation
 */

import { db } from "./db";
import {
  treasurySnapshots,
  treasuryAllocations,
  treasuryLedgerEntries,
  type TreasurySnapshot,
  type TreasuryAllocation,
  type TreasuryLedgerEntry,
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

const DWSC_TREASURY_URL = process.env.DWSC_TREASURY_URL;
const ORBIT_API_KEY = process.env.ORBIT_ECOSYSTEM_API_KEY;
const ORBIT_API_SECRET = process.env.ORBIT_ECOSYSTEM_API_SECRET;

interface TreasuryAllocationData {
  category: string;
  label: string;
  percentage: number;
}

interface TreasuryLedgerData {
  id: string;
  category: string;
  amountDwc: string;
  transactionType: string;
  createdAt: string;
}

interface TreasurySyncResponse {
  snapshot: {
    asOf: string;
    treasuryAddress: string;
    treasuryBalanceDwc: string;
  };
  allocations: TreasuryAllocationData[];
  ledger: TreasuryLedgerData[];
  protocolFees: {
    dexSwapFee: string;
    nftMarketplaceFee: string;
    bridgeFee: string;
  };
}

function generateHmacSignature(key: string, timestamp: string, path: string, secret: string): string {
  const payload = `${key}${timestamp}${path}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export class TreasurySyncClient {
  async getLatestSnapshot(): Promise<TreasurySnapshot | null> {
    const [snapshot] = await db
      .select()
      .from(treasurySnapshots)
      .orderBy(desc(treasurySnapshots.syncedAt))
      .limit(1);
    return snapshot || null;
  }

  async getAllSnapshots(limit = 50): Promise<TreasurySnapshot[]> {
    return await db
      .select()
      .from(treasurySnapshots)
      .orderBy(desc(treasurySnapshots.syncedAt))
      .limit(limit);
  }

  async getSnapshotAllocations(snapshotId: string): Promise<TreasuryAllocation[]> {
    return await db
      .select()
      .from(treasuryAllocations)
      .where(eq(treasuryAllocations.snapshotId, snapshotId));
  }

  async getSnapshotLedger(snapshotId: string): Promise<TreasuryLedgerEntry[]> {
    return await db
      .select()
      .from(treasuryLedgerEntries)
      .where(eq(treasuryLedgerEntries.snapshotId, snapshotId));
  }

  async syncFromDWSC(): Promise<{
    success: boolean;
    snapshotId?: string;
    error?: string;
    allocationsCount?: number;
    ledgerEntriesCount?: number;
  }> {
    if (!DWSC_TREASURY_URL) {
      return { success: false, error: "DWSC_TREASURY_URL not configured" };
    }
    if (!ORBIT_API_KEY || !ORBIT_API_SECRET) {
      return { success: false, error: "ORBIT API credentials not configured" };
    }

    try {
      const timestamp = Date.now().toString();
      const path = "/api/treasury/sync";
      const signature = generateHmacSignature(ORBIT_API_KEY, timestamp, path, ORBIT_API_SECRET);

      const response = await fetch(`${DWSC_TREASURY_URL}${path}`, {
        method: "GET",
        headers: {
          "X-Orbit-Key": ORBIT_API_KEY,
          "X-Orbit-Timestamp": timestamp,
          "X-Orbit-Signature": signature,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `DWSC API error: ${response.status} - ${errorText}` };
      }

      const data: TreasurySyncResponse = await response.json();

      const [snapshot] = await db
        .insert(treasurySnapshots)
        .values({
          sourceSystem: "DarkWave Smart Chain",
          treasuryAddress: data.snapshot.treasuryAddress,
          treasuryBalanceDwc: data.snapshot.treasuryBalanceDwc,
          snapshotAsOf: new Date(data.snapshot.asOf),
          dexSwapFee: data.protocolFees.dexSwapFee,
          nftMarketplaceFee: data.protocolFees.nftMarketplaceFee,
          bridgeFee: data.protocolFees.bridgeFee,
          rawResponse: data,
        })
        .returning();

      if (data.allocations?.length > 0) {
        await db.insert(treasuryAllocations).values(
          data.allocations.map((alloc) => ({
            snapshotId: snapshot.id,
            category: alloc.category,
            label: alloc.label,
            percentage: alloc.percentage.toString(),
          }))
        );
      }

      if (data.ledger?.length > 0) {
        await db.insert(treasuryLedgerEntries).values(
          data.ledger.map((entry) => ({
            snapshotId: snapshot.id,
            externalId: entry.id,
            category: entry.category,
            amountDwc: entry.amountDwc,
            transactionType: entry.transactionType,
            externalCreatedAt: entry.createdAt ? new Date(entry.createdAt) : null,
          }))
        );
      }

      return {
        success: true,
        snapshotId: snapshot.id,
        allocationsCount: data.allocations?.length || 0,
        ledgerEntriesCount: data.ledger?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown sync error",
      };
    }
  }

  async getSyncStatus(): Promise<{
    configured: boolean;
    lastSync: Date | null;
    totalSnapshots: number;
    dwscUrl: string | null;
  }> {
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(treasurySnapshots);

    const latestSnapshot = await this.getLatestSnapshot();

    return {
      configured: !!(DWSC_TREASURY_URL && ORBIT_API_KEY && ORBIT_API_SECRET),
      lastSync: latestSnapshot?.syncedAt || null,
      totalSnapshots: countResult?.count || 0,
      dwscUrl: DWSC_TREASURY_URL ? new URL(DWSC_TREASURY_URL).origin : null,
    };
  }

  async getTreasurySummary(): Promise<{
    latestBalance: string | null;
    latestAsOf: Date | null;
    allocations: TreasuryAllocation[];
    recentLedger: TreasuryLedgerEntry[];
    protocolFees: {
      dexSwapFee: string | null;
      nftMarketplaceFee: string | null;
      bridgeFee: string | null;
    };
  }> {
    const latestSnapshot = await this.getLatestSnapshot();

    if (!latestSnapshot) {
      return {
        latestBalance: null,
        latestAsOf: null,
        allocations: [],
        recentLedger: [],
        protocolFees: {
          dexSwapFee: null,
          nftMarketplaceFee: null,
          bridgeFee: null,
        },
      };
    }

    const allocations = await this.getSnapshotAllocations(latestSnapshot.id);
    const recentLedger = await this.getSnapshotLedger(latestSnapshot.id);

    return {
      latestBalance: latestSnapshot.treasuryBalanceDwc,
      latestAsOf: latestSnapshot.snapshotAsOf,
      allocations,
      recentLedger,
      protocolFees: {
        dexSwapFee: latestSnapshot.dexSwapFee,
        nftMarketplaceFee: latestSnapshot.nftMarketplaceFee,
        bridgeFee: latestSnapshot.bridgeFee,
      },
    };
  }
}

export const treasurySyncClient = new TreasurySyncClient();
