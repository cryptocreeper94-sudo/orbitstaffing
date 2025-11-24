import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, QrCode, Copy, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface AssetData {
  id: string;
  hallmarkNumber: string;
  assetType: string;
  referenceId: string | null;
  createdBy: string | null;
  recipientName: string | null;
  recipientRole: string | null;
  createdAt: string;
  verifiedAt: string | null;
  metadata: any;
}

export function AssetTracker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const searchAsset = async (query: string) => {
    if (!query.trim()) {
      setError('Enter an asset number or QR code');
      return;
    }

    setLoading(true);
    setError('');
    setSelectedAsset(null);

    try {
      const response = await fetch(`/api/hallmarks/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Asset not found. Check the number and try again.');
        } else {
          setError('Search failed. Please try again.');
        }
        return;
      }

      const data = await response.json();
      setSelectedAsset(data);
    } catch (err) {
      setError('Search error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchAsset(searchQuery);
  };

  const copyCode = () => {
    if (selectedAsset) {
      navigator.clipboard.writeText(selectedAsset.hallmarkNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getAssetTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'business-card': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      'paycheck': 'bg-green-500/20 text-green-300 border-green-500/50',
      'invoice': 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      'certificate': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      'default': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
    };
    return colors[type] || colors['default'];
  };

  return (
    <div className="space-y-6">
      {/* Search Box */}
      <Card className="bg-slate-800/50 border border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-cyan-300 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Asset Tracker
          </CardTitle>
          <p className="text-xs text-gray-400 mt-2">Search by asset number (e.g., ORBIT-SEAL-000) or scan QR code</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="ORBIT-SEAL-000 or paste QR data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border-slate-700"
              data-testid="input-asset-search"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-700"
              data-testid="button-search-asset"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
          
          {error && (
            <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Asset Details */}
      {selectedAsset && (
        <Card className="bg-slate-800/50 border border-green-500/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-900/30 to-slate-900 border-b border-green-500/30">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-green-300">Asset Found ✓</CardTitle>
                <p className="text-xs text-gray-400 mt-2">Asset ID: {selectedAsset.id.slice(0, 12)}...</p>
              </div>
              <div className={`px-3 py-1 rounded border text-xs font-semibold ${getAssetTypeColor(selectedAsset.assetType)}`}>
                {selectedAsset.assetType.toUpperCase()}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Hallmark Number */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Hallmark Number</p>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                <code className="font-mono text-sm text-cyan-300 font-bold break-all">{selectedAsset.hallmarkNumber}</code>
                <button
                  onClick={copyCode}
                  className="ml-3 text-gray-400 hover:text-cyan-300 transition-colors"
                  data-testid="button-copy-asset"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied && (
                <div className="flex items-center gap-1 text-xs text-green-400 mt-2">
                  <CheckCircle2 className="w-3 h-3" />
                  Copied!
                </div>
              )}
            </div>

            {/* Created Information */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-400 mb-2">Created By</p>
                <p className="text-white font-semibold">{selectedAsset.createdBy || 'System'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Date Created</p>
                <p className="text-white font-semibold">{new Date(selectedAsset.createdAt).toLocaleDateString()} {new Date(selectedAsset.createdAt).toLocaleTimeString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Recipient</p>
                <p className="text-white font-semibold">{selectedAsset.recipientName || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Role</p>
                <p className="text-white font-semibold">{selectedAsset.recipientRole || 'N/A'}</p>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedAsset.verifiedAt ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-green-300 font-semibold">Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-300 font-semibold">Pending Verification</span>
                    </>
                  )}
                </div>
                {selectedAsset.verifiedAt && (
                  <p className="text-xs text-gray-400">
                    {new Date(selectedAsset.verifiedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Reference Information */}
            {selectedAsset.referenceId && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Reference ID</p>
                <p className="text-white font-mono text-sm bg-slate-900/50 p-3 rounded border border-slate-700">
                  {selectedAsset.referenceId}
                </p>
              </div>
            )}

            {/* Metadata (if any) */}
            {selectedAsset.metadata && Object.keys(selectedAsset.metadata).length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Additional Information</p>
                <div className="bg-slate-900/50 rounded p-4 border border-slate-700 space-y-2 text-sm">
                  {Object.entries(selectedAsset.metadata).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between text-gray-300">
                      <span className="text-gray-400">{key}:</span>
                      <span className="text-white font-semibold">{JSON.stringify(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verify Button */}
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2" data-testid="button-verify-asset">
              <CheckCircle2 className="w-4 h-4" />
              View Verification Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedAsset && !loading && (
        <Card className="bg-slate-800/30 border border-slate-700 text-center p-8">
          <QrCode className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-gray-400">Enter an asset number to view details</p>
        </Card>
      )}
    </div>
  );
}
