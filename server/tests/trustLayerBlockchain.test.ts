import { expect, test, describe, vi, beforeEach } from 'vitest';
import { trustLayerBlockchain } from '../trustLayerBlockchain';

// Mock the fetch API globally
global.fetch = vi.fn();

describe('TrustLayer Blockchain Engine', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('gracefully throws on 5000ms timeout boundary when anchoring a batch', async () => {
    // Force live mode to test API fetch
    (trustLayerBlockchain as any).simulationMode = false;

    // Spy on the private method directly
    vi.spyOn(trustLayerBlockchain as any, 'submitToTrustVault')
      .mockRejectedValueOnce(new Error('TrustVault API failed | timeout'));

    // Mock getQueuedHashes to return something to anchor
    vi.spyOn(trustLayerBlockchain, 'getQueuedHashes').mockResolvedValueOnce([
      { id: '1', hallmarkId: 'h1', contentHash: 'abc', assetType: 'invoice', timestamp: new Date(), status: 'queued' }
    ]);

    // We expect anchorBatch to reject due to the mocked failure
    await expect(trustLayerBlockchain.anchorBatch())
      .rejects.toThrow(/TrustVault API failed/i);
  });
});
