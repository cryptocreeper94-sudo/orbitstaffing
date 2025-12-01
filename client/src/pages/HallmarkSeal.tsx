import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Copy, CheckCircle2, Download } from 'lucide-react';
import { Link } from 'wouter';
import { OrbyHallmark } from '@/components/OrbyHallmark';

export default function HallmarkSeal() {
  const [copied, setCopied] = useState(false);
  const serialNumber = '000000001-00';
  const hallmarkCode = `ORBIT-${serialNumber}`;
  const verificationUrl = `${window.location.origin}/verify/${hallmarkCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(hallmarkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto mb-8">
        <Link href="/">
          <Button variant="outline" className="gap-2" data-testid="button-back-seal">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">ORBIT Seal™</h1>
          <p className="text-gray-400 text-lg">Official Badge of Authenticity</p>
        </div>

        {/* Main Display */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Left: Badge Display */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-400/50 shadow-2xl flex items-center justify-center min-h-[500px]">
            <CardContent className="flex flex-col items-center justify-center p-12">
              <div className="mb-8">
                <OrbyHallmark serialNumber={serialNumber} size="large" verificationUrl={verificationUrl} showExpand={false} />
              </div>
              <p className="text-center text-sm text-gray-400 max-w-xs">
                This seal verifies authenticity, compliance, and ORBIT quality
              </p>
            </CardContent>
          </Card>

          {/* Right: Information */}
          <div className="space-y-6">
            {/* What It Is */}
            <Card className="bg-slate-800/50 border border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-cyan-300">Your Guarantee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-300">
                <p>
                  Every ORBIT asset bears this official seal. It's your mark of approval—proof that this came from us, it's verified, and it's legitimate.
                </p>
                <div className="space-y-2 text-xs">
                  <p className="flex gap-2"><span className="text-amber-300">✓</span> Scanned & tracked</p>
                  <p className="flex gap-2"><span className="text-amber-300">✓</span> Holographically enhanced</p>
                  <p className="flex gap-2"><span className="text-amber-300">✓</span> Tamper-evident design</p>
                  <p className="flex gap-2"><span className="text-amber-300">✓</span> Unique serial number</p>
                </div>
              </CardContent>
            </Card>

            {/* Code & Serial */}
            <Card className="bg-slate-800/50 border border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-cyan-300">Serial Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-2">Seal Number</p>
                  <div className="bg-slate-950 border border-amber-500/50 rounded p-3 font-mono text-amber-300 font-bold">
                    {serialNumber}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2">Full Code</p>
                  <div className="bg-slate-950 border border-slate-700 rounded p-3 flex items-center justify-between">
                    <code className="text-xs font-mono text-cyan-300 break-all">{hallmarkCode}</code>
                    <button
                      onClick={copyCode}
                      className="ml-2 text-gray-400 hover:text-amber-300"
                      data-testid="button-copy-seal"
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
              </CardContent>
            </Card>

            {/* Verification */}
            <Card className="bg-slate-800/50 border border-green-500/30 bg-green-950/20">
              <CardHeader>
                <CardTitle className="text-green-400">✓ Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-300">
                  Scan the QR code to verify this seal and view its complete audit trail.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Sizes */}
        <Card className="bg-slate-800/50 border border-cyan-400/20 mb-12">
          <CardHeader>
            <CardTitle className="text-cyan-300">Seal Sizes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-end justify-items-center">
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-4">Thumbnail</p>
                <OrbyHallmark serialNumber={serialNumber} size="thumbnail" />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-4">Small</p>
                <OrbyHallmark serialNumber={serialNumber} size="small" />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-4">Medium</p>
                <OrbyHallmark serialNumber={serialNumber} size="medium" />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-4">Large</p>
                <OrbyHallmark serialNumber={serialNumber} size="large" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation */}
        <Card className="bg-slate-800/50 border border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-300">Where Seals Appear</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-900/50 rounded p-4 border border-slate-700">
              <p className="font-bold text-cyan-300 mb-2">📧 Communications</p>
              <p className="text-gray-400 text-xs">Email signatures, notifications, alerts</p>
            </div>
            <div className="bg-slate-900/50 rounded p-4 border border-slate-700">
              <p className="font-bold text-cyan-300 mb-2">💳 Credentials</p>
              <p className="text-gray-400 text-xs">Business cards, badges, employee IDs</p>
            </div>
            <div className="bg-slate-900/50 rounded p-4 border border-slate-700">
              <p className="font-bold text-cyan-300 mb-2">📄 Documents</p>
              <p className="text-gray-400 text-xs">Paychecks, invoices, contracts, certificates</p>
            </div>
            <div className="bg-slate-900/50 rounded p-4 border border-slate-700">
              <p className="font-bold text-cyan-300 mb-2">🌐 Online</p>
              <p className="text-gray-400 text-xs">Profile headers, achievement badges, portfolio</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
