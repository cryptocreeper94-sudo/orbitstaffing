import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Copy, CheckCircle2, ArrowLeft, Download, Share2 } from 'lucide-react';
import { Link } from 'wouter';
import { QRCodeSVG } from 'qrcode.react';
import saturnLogo from "@assets/generated_images/floating_saturn_planet_pure_transparency.png";

export default function HallmarkVerification() {
  const [copied, setCopied] = useState(false);
  
  // Serial number counter - starts at 000
  // In production, this would come from database
  const serialNumber = '000';
  const hallmarkCode = `ORBIT-SEAL-${serialNumber}`;
  const verificationUrl = `${window.location.origin}/verify/${hallmarkCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(hallmarkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHallmark = () => {
    const qrCanvas = document.querySelector('canvas');
    if (qrCanvas) {
      const link = document.createElement('a');
      link.href = qrCanvas.toDataURL('image/png');
      link.download = `ORBIT-Hallmark-${serialNumber}.png`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link href="/">
          <Button variant="outline" className="gap-2" data-testid="button-back-hallmark">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">ORBIT Hallmark™</h1>
          <p className="text-gray-400 text-lg">Our Seal of Authenticity & Guarantee</p>
        </div>

        {/* Main Hallmark Card */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-400/50 shadow-2xl mb-12">
          <CardHeader className="text-center bg-gradient-to-r from-slate-900 to-black border-b border-cyan-400/30">
            <CardTitle className="text-2xl text-cyan-300 flex items-center justify-center gap-3">
              <Shield className="w-8 h-8" />
              Your Seal of Approval
            </CardTitle>
            <p className="text-sm text-gray-400 mt-2">Every asset stamped with ORBIT's hallmark is verified, tracked, and guaranteed</p>
          </CardHeader>

          <CardContent className="p-8 sm:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Emblem & Info */}
              <div className="flex flex-col items-center">
                {/* ORBIT Logo/Emblem */}
                <div className="bg-black p-8 rounded-2xl border-2 border-cyan-400/30 mb-8 w-full max-w-xs">
                  <img 
                    src={saturnLogo} 
                    alt="ORBIT Hallmark" 
                    className="w-full h-auto"
                  />
                </div>

                {/* Serial Number Display */}
                <div className="text-center mb-8 w-full">
                  <p className="text-sm text-gray-400 mb-2">Hallmark Serial Number</p>
                  <div className="bg-slate-950 border-2 border-cyan-400/50 rounded-lg p-4">
                    <p className="text-3xl font-mono font-bold text-cyan-300">{serialNumber}</p>
                    <p className="text-xs text-gray-500 mt-2">Asset #1 - First Hallmark Issued</p>
                  </div>
                </div>

                {/* Full Hallmark Code */}
                <div className="w-full">
                  <p className="text-xs text-gray-400 mb-2">Full Hallmark Code</p>
                  <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
                    <code className="text-xs sm:text-sm font-mono text-cyan-300 break-all">{hallmarkCode}</code>
                    <button
                      onClick={copyCode}
                      className="ml-2 text-gray-400 hover:text-cyan-300 transition-colors"
                      data-testid="button-copy-hallmark"
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
              </div>

              {/* Right: QR Code & Actions */}
              <div className="flex flex-col items-center">
                {/* QR Code */}
                <div className="bg-white p-6 rounded-2xl border-2 border-cyan-400/30 mb-8">
                  <QRCodeSVG
                    value={verificationUrl}
                    size={256}
                    level="H"
                    includeMargin={true}
                    data-testid="qrcode-hallmark"
                  />
                </div>

                {/* What is Hallmark Info */}
                <div className="bg-slate-800/50 border border-cyan-400/20 rounded-lg p-6 w-full">
                  <p className="text-sm font-bold text-cyan-300 mb-3">What This Means:</p>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
                    <li className="flex gap-2">
                      <span className="text-cyan-400">✓</span>
                      <span><strong>Verified:</strong> This asset has been authenticated by ORBIT</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-400">✓</span>
                      <span><strong>Tracked:</strong> Every hallmark is logged in our registry</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-400">✓</span>
                      <span><strong>Guaranteed:</strong> Quality and compliance assured</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-400">✓</span>
                      <span><strong>Unique:</strong> Serial #000 identifies this specific asset</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Verification URL */}
            <div className="mt-12 pt-8 border-t border-slate-700">
              <p className="text-sm text-gray-400 mb-3">Verification Link (for customers & partners):</p>
              <div className="bg-slate-950 border border-slate-700 rounded-lg p-4">
                <p className="text-xs sm:text-sm font-mono text-gray-300 break-all">{verificationUrl}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid sm:grid-cols-2 gap-4 mt-12">
              <Button
                onClick={downloadHallmark}
                className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2"
                data-testid="button-download-hallmark"
              >
                <Download className="w-4 h-4" />
                Download Hallmark
              </Button>
              <Button
                onClick={() => {
                  navigator.share({
                    title: 'ORBIT Hallmark',
                    text: `Verify this asset: ${hallmarkCode}`,
                    url: verificationUrl,
                  }).catch(() => {
                    // Fallback: just copy the URL
                    navigator.clipboard.writeText(verificationUrl);
                  });
                }}
                variant="outline"
                className="gap-2"
                data-testid="button-share-hallmark"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How Hallmarks Work */}
        <Card className="bg-slate-800/50 border border-cyan-400/20 mb-8">
          <CardHeader>
            <CardTitle className="text-cyan-300">How ORBIT Hallmarks Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-white font-bold mb-2">🔢 Serial Numbering System</h3>
              <p className="text-gray-300 text-sm">
                Every ORBIT asset gets a unique serial number starting from <strong>000</strong>:
              </p>
              <div className="bg-slate-900 rounded-lg p-4 mt-3 space-y-2 text-xs font-mono text-cyan-300">
                <p>Asset #1 (this one): <strong>000</strong></p>
                <p>Asset #2 (next): <strong>001</strong></p>
                <p>Asset #3: <strong>002</strong></p>
                <p>... and so on</p>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-2">📋 What Gets Hallmarked</h3>
              <p className="text-gray-300 text-sm mb-3">
                ORBIT stamps hallmarks on:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
                  <p className="text-cyan-300 font-semibold text-sm">Business Cards</p>
                  <p className="text-xs text-gray-400">Admin & leadership credentials</p>
                </div>
                <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
                  <p className="text-cyan-300 font-semibold text-sm">Paychecks</p>
                  <p className="text-xs text-gray-400">Worker payment documents</p>
                </div>
                <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
                  <p className="text-cyan-300 font-semibold text-sm">Invoices</p>
                  <p className="text-xs text-gray-400">Client billing & contracts</p>
                </div>
                <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
                  <p className="text-cyan-300 font-semibold text-sm">Certificates</p>
                  <p className="text-xs text-gray-400">Completion & verification docs</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-2">✅ Why It Matters</h3>
              <p className="text-gray-300 text-sm">
                The hallmark is your guarantee. It says: <strong>"This came from ORBIT, it's been verified, and it's legitimate."</strong> 
                Customers, partners, and regulators can scan the QR code to confirm authenticity instantly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
