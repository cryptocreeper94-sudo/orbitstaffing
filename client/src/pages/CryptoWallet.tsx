import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Wallet, Send, ArrowDownLeft, QrCode, Copy, ExternalLink, Shield, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { CarouselRail, CarouselRailItem } from '@/components/ui/carousel-rail';
import { PageHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, StatCard } from '@/components/ui/orbit-card';

export default function CryptoWallet() {
  const [copied, setCopied] = useState(false);
  const walletAddress = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
  
  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const transactions: { id: number; type: string; amount: string; date: string }[] = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="ORBIT Crypto Wallet"
          subtitle="Secure blockchain payments for staffing"
          breadcrumb={
            <Link href="/">
              <Button variant="outline" className="gap-2" data-testid="button-back">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          }
          actions={
            <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0">
              <Zap className="w-3 h-3 mr-1" /> Solana Powered
            </Badge>
          }
        />

        <BentoGrid cols={2} gap="lg" className="mb-12">
          <BentoTile className="border-2 border-purple-500/30">
            <OrbitCard variant="default" hover={false} className="h-full border-0 bg-transparent p-0">
              <OrbitCardHeader
                icon={<Wallet className="w-5 h-5 text-purple-300" />}
                action={
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/40">
                    Connected
                  </Badge>
                }
              >
                <OrbitCardTitle className="text-purple-300">ORBIT Treasury</OrbitCardTitle>
              </OrbitCardHeader>
              
              <OrbitCardContent className="space-y-6">
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

                <StatCard
                  label="Current Balance"
                  value="0.00 SOL"
                  icon={<Wallet className="w-6 h-6" />}
                  className="bg-slate-950/30 border-purple-500/20"
                />
                <div className="text-sm text-gray-500 text-center -mt-4">≈ $0.00 USD</div>

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
              </OrbitCardContent>
            </OrbitCard>
          </BentoTile>

          <BentoTile className="bg-transparent border-0 space-y-6 p-0">
            <OrbitCard variant="glass" className="border-cyan-500/20">
              <OrbitCardHeader>
                <OrbitCardTitle className="text-cyan-300">Why Crypto Payments?</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent className="space-y-4">
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
              </OrbitCardContent>
            </OrbitCard>

            <OrbitCard variant="default" className="bg-gradient-to-br from-purple-900/30 to-cyan-900/20 border-purple-500/30">
              <OrbitCardContent className="text-center">
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
              </OrbitCardContent>
            </OrbitCard>
          </BentoTile>
        </BentoGrid>

        <div className="md:hidden mb-8">
          <CarouselRail
            title="Recent Transactions"
            showArrows={false}
            gap="md"
            itemWidth="lg"
          >
            {transactions.length === 0 ? (
              <CarouselRailItem>
                <OrbitCard className="w-[300px]">
                  <div className="text-center py-8 text-gray-500">
                    <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No transactions yet</p>
                    <p className="text-xs mt-1">Crypto payments will appear here</p>
                  </div>
                </OrbitCard>
              </CarouselRailItem>
            ) : (
              transactions.map((tx) => (
                <CarouselRailItem key={tx.id}>
                  <OrbitCard className="w-[300px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {tx.type === 'receive' ? (
                          <ArrowDownLeft className="w-5 h-5 text-green-400" />
                        ) : (
                          <Send className="w-5 h-5 text-red-400" />
                        )}
                        <div>
                          <p className="font-medium text-white">{tx.amount}</p>
                          <p className="text-xs text-gray-500">{tx.date}</p>
                        </div>
                      </div>
                    </div>
                  </OrbitCard>
                </CarouselRailItem>
              ))
            )}
          </CarouselRail>
        </div>

        <div className="hidden md:block">
          <OrbitCard variant="default" className="border-slate-700">
            <OrbitCardHeader>
              <OrbitCardTitle>Recent Transactions</OrbitCardTitle>
            </OrbitCardHeader>
            <OrbitCardContent>
              <div className="text-center py-12 text-gray-500">
                <Wallet className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No transactions yet</p>
                <p className="text-sm mt-1">Crypto payments will appear here</p>
              </div>
            </OrbitCardContent>
          </OrbitCard>
        </div>
      </div>
    </div>
  );
}
