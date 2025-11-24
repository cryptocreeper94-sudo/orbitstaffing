import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Copy, CheckCircle2 } from 'lucide-react';

interface CompanyHallmark {
  id: string;
  companyId: string;
  hallmarkPrefix: string;
  nextSerialNumber: number;
  brandColor: string;
  isActive: boolean;
  createdAt: string;
}

export function CompanyHallmarkManager({ companyId, companyName }: { companyId: string; companyName: string }) {
  const [hallmark, setHallmark] = useState<CompanyHallmark | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [brandColor, setBrandColor] = useState('#06B6D4');

  const initializeHallmark = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/company-hallmarks/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          companyName,
          brandColor,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setHallmark(data);
      }
    } catch (error) {
      console.error('Failed to initialize hallmark:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextSerialNumber = () => {
    if (!hallmark) return 'N/A';
    const padded = String(hallmark.nextSerialNumber).padStart(6, '0');
    return `${hallmark.hallmarkPrefix}-${padded}`;
  };

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  if (!hallmark) {
    return (
      <Card className="bg-slate-800/50 border border-cyan-400/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-cyan-300">Company Hallmark System</span>
            <Settings className="w-5 h-5" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-400">
            {companyName} doesn't have a hallmark system yet. Create one to start stamping and tracking your assets.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-2">Brand Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                  data-testid="input-brand-color"
                />
                <span className="text-sm text-gray-300 py-1">{brandColor}</span>
              </div>
            </div>

            <Button
              onClick={initializeHallmark}
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 gap-2"
              data-testid="button-create-hallmark"
            >
              <Plus className="w-4 h-4" />
              Create Hallmark System
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border border-green-500/50">
      <CardHeader className="bg-gradient-to-r from-green-900/30 to-slate-900 border-b border-green-500/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-300 flex items-center gap-2">
            ✓ Company Hallmark System
          </CardTitle>
          <Badge className="bg-green-600">{companyName}</Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Hallmark Prefix & Info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-2">Hallmark Prefix</p>
            <div className="bg-slate-900 border border-cyan-500/50 rounded p-3 flex items-center justify-between">
              <code className="font-mono text-cyan-300 font-bold">{hallmark.hallmarkPrefix}</code>
              <button
                onClick={() => copyCode(hallmark.hallmarkPrefix, 'prefix')}
                className="text-gray-400 hover:text-cyan-300"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copied === 'prefix' && <p className="text-xs text-green-400 mt-1">Copied!</p>}
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-2">Next Serial Number</p>
            <div className="bg-slate-900 border border-amber-500/50 rounded p-3 font-mono text-amber-300 font-bold">
              {getNextSerialNumber()}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-slate-900/50 rounded p-4 border border-slate-700 space-y-2">
          <p className="font-bold text-white mb-3">✓ Features Enabled</p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-2">
              <span className="text-cyan-400">✓</span>
              <span>Auto-stamp all assets with your company hallmark</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">✓</span>
              <span>Generate unique QR codes for each asset</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">✓</span>
              <span>Track by serial number, CSA, date, or metadata</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">✓</span>
              <span>Complete audit trail for compliance</span>
            </li>
          </ul>
        </div>

        {/* Brand Color Display */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-lg border-2"
            style={{ backgroundColor: hallmark.brandColor, borderColor: hallmark.brandColor }}
          />
          <div>
            <p className="text-sm text-gray-400">Brand Color</p>
            <p className="font-mono text-white">{hallmark.brandColor}</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          All assets created after {new Date(hallmark.createdAt).toLocaleDateString()} will be automatically stamped
        </p>
      </CardContent>
    </Card>
  );
}
