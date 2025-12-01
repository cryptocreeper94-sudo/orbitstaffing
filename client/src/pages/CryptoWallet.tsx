import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Wallet, Send, ArrowDownLeft, QrCode, Copy, ExternalLink, Shield, Zap } from 'lucide-react';
import { Link } from 'wouter';

export default function CryptoWallet() {
  const [copied, setCopied] = useState(false);
  const walletAddress = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
  
  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto mb-8">
        <Link href="/">
          <Button variant="outline" className="gap-2" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0 mb-4">
            <Zap className="w-3 h-3 mr-1" /> Solana Powered
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">ORBIT Crypto Wallet</h1>
          <p className="text-gray-400 text-lg">Secure blockchain payments for staffing</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-purple-500/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-purple-300 flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  ORBIT Treasury
                </CardTitle>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/40">
                  Connected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-950/50 rounded-xl p-4 border border-purple-500/20">
                <div className="text-xs text-gray-500 mb-1">Wallet Address</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-purple-300 font-mono break-all flex-1">
                    {walletAddress}
                  </code>
                  <button 
                    onClick={copyAddress}
                    className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
                    data-testid="button-copy-address"
                  >
                    <Copy className="w-4 h-4 text-purple-400" />
                  </button>
                </div>
                {copied && <div className="text-xs text-green-400 mt-2">Copied!</div>}
              </div>

              <div className="text-center py-6">
                <div className="text-4xl font-bold text-white mb-1">
                  <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    0.00 SOL
                  </span>
                </div>
                <div className="text-sm text-gray-500">≈ $0.00 USD</div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button className="bg-purple-600 hover:bg-purple-500 flex-col h-auto py-4" data-testid="button-receive">
                  <ArrowDownLeft className="w-5 h-5 mb-1" />
                  <span className="text-xs">Receive</span>
                </Button>
                <Button className="bg-cyan-600 hover:bg-cyan-500 flex-col h-auto py-4" data-testid="button-send">
                  <Send className="w-5 h-5 mb-1" />
                  <span className="text-xs">Send</span>
                </Button>
                <Button variant="outline" className="border-purple-500/40 text-purple-300 flex-col h-auto py-4" data-testid="button-qr">
                  <QrCode className="w-5 h-5 mb-1" />
                  <span className="text-xs">QR Code</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-slate-800/50 border border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-300 text-lg">Why Crypto Payments?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">Instant Settlements</div>
                    <div className="text-xs text-gray-400">Payments clear in seconds, not days</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">Blockchain Security</div>
                    <div className="text-xs text-gray-400">Every transaction is immutable & verifiable</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">Lower Fees</div>
                    <div className="text-xs text-gray-400">Fraction of traditional payment costs</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/30 to-cyan-900/20 border border-purple-500/30">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-3">⛓️</div>
                <h3 className="text-lg font-bold text-white mb-2">Solana Network</h3>
                <p className="text-sm text-gray-400 mb-4">
                  ORBIT uses Solana for lightning-fast, low-cost transactions with enterprise-grade security.
                </p>
                <a 
                  href="https://solana.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
                >
                  Learn about Solana <ExternalLink className="w-3 h-3" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="bg-slate-800/50 border border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No transactions yet</p>
              <p className="text-sm mt-1">Crypto payments will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
