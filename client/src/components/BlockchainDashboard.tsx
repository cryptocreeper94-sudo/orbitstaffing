import React, { useState, useEffect } from 'react';
import { Shield, Hash, Clock, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VersionInfo {
  version: string;
  buildNumber: number;
  lastPublished: string;
  solanaHash: string | null;
  transactionSignature: string | null;
}

interface BlockchainStats {
  mode: string;
  queueSize: number;
  totalBatches: number;
  totalAnchored: number;
  anchorableTypes: string[];
}

interface AnchoredBatch {
  id: string;
  merkleRoot: string;
  transactionSignature: string;
  hashCount: number;
  anchoredAt: string;
  explorerUrl: string;
}

export function BlockchainDashboard() {
  const [version, setVersion] = useState<VersionInfo | null>(null);
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [batches, setBatches] = useState<AnchoredBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [versionRes, statsRes, batchesRes] = await Promise.all([
        fetch('/api/version'),
        fetch('/api/blockchain/status'),
        fetch('/api/blockchain/batches'),
      ]);

      if (versionRes.ok) {
        setVersion(await versionRes.json());
      }
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (batchesRes.ok) {
        const data = await batchesRes.json();
        setBatches(data.batches || []);
      }
    } catch (error) {
      console.error('Failed to fetch blockchain data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePublish = async (bumpType: 'patch' | 'minor' | 'major') => {
    setPublishing(true);
    try {
      const res = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bumpType }),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Publish failed:', error);
    }
    setPublishing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Blockchain & Version Control</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
          data-testid="button-refresh-blockchain"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Current Version</div>
          <div className="text-2xl font-bold text-cyan-400" data-testid="text-current-version">
            v{version?.version || '0.0.0'}
          </div>
          <div className="text-slate-500 text-xs mt-1">Build #{version?.buildNumber || 0}</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Blockchain Mode</div>
          <div className="flex items-center gap-2">
            {stats?.mode === 'live' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            )}
            <span className={`text-lg font-semibold ${stats?.mode === 'live' ? 'text-green-400' : 'text-yellow-400'}`}>
              {stats?.mode === 'live' ? 'LIVE (Mainnet)' : 'Simulation'}
            </span>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Total Anchored</div>
          <div className="text-2xl font-bold text-white">{stats?.totalAnchored || 0}</div>
          <div className="text-slate-500 text-xs mt-1">documents on-chain</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Queue Size</div>
          <div className="text-2xl font-bold text-white">{stats?.queueSize || 0}</div>
          <div className="text-slate-500 text-xs mt-1">pending anchoring</div>
        </div>
      </div>

      {version?.solanaHash && (
        <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300 font-semibold">Latest Release Hash</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(version.solanaHash!)}
              className="text-slate-400 hover:text-white"
              data-testid="button-copy-hash"
            >
              {copiedHash === version.solanaHash ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="font-mono text-sm text-white bg-slate-900/50 p-3 rounded break-all" data-testid="text-release-hash">
            {version.solanaHash}
          </div>
          {version.lastPublished && (
            <div className="flex items-center gap-2 mt-3 text-slate-400 text-sm">
              <Clock className="w-4 h-4" />
              Last published: {formatDate(version.lastPublished)} CST
            </div>
          )}
          {version.transactionSignature && (
            <a
              href={`https://explorer.solana.com/tx/${version.transactionSignature}?cluster=mainnet-beta`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 text-cyan-400 hover:text-cyan-300 text-sm"
              data-testid="link-solana-explorer"
            >
              <ExternalLink className="w-4 h-4" />
              View on Solana Explorer
            </a>
          )}
        </div>
      )}

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Manual Publish & Hash</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => handlePublish('patch')}
            disabled={publishing}
            className="bg-cyan-600 hover:bg-cyan-700"
            data-testid="button-publish-patch"
          >
            {publishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Patch Release (x.x.+1)
          </Button>
          <Button
            onClick={() => handlePublish('minor')}
            disabled={publishing}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            data-testid="button-publish-minor"
          >
            Minor Release (x.+1.0)
          </Button>
          <Button
            onClick={() => handlePublish('major')}
            disabled={publishing}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            data-testid="button-publish-major"
          >
            Major Release (+1.0.0)
          </Button>
        </div>
        <p className="text-slate-500 text-sm mt-3">
          Publishing bumps the version, generates a SHA-256 hash, and anchors it to Solana blockchain.
        </p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Blockchain Anchors</h3>
        {batches.length === 0 ? (
          <div className="text-slate-500 text-center py-4">No blockchain anchors yet</div>
        ) : (
          <div className="space-y-3">
            {batches.slice(0, 5).map((batch, index) => (
              <div
                key={batch.id || index}
                className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
                data-testid={`batch-anchor-${index}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-mono text-sm">
                      {batch.merkleRoot.substring(0, 16)}...
                    </span>
                    <span className="text-slate-500 text-xs">
                      ({batch.hashCount} docs)
                    </span>
                  </div>
                  <div className="text-slate-500 text-xs mt-1">
                    {formatDate(batch.anchoredAt)}
                  </div>
                </div>
                <a
                  href={batch.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 p-2"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Anchorable Document Types</h3>
        <div className="flex flex-wrap gap-2">
          {stats?.anchorableTypes.map((type) => (
            <span
              key={type}
              className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm"
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
