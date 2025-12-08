import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, CheckCircle2, Search, ExternalLink, Hash, Calendar, Blocks } from 'lucide-react';
import { Link } from 'wouter';
import { OrbyHallmark } from '@/components/OrbyHallmark';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { CarouselRail, CarouselRailItem } from '@/components/ui/carousel-rail';
import { PageHeader, SectionHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent } from '@/components/ui/orbit-card';
import { Input } from '@/components/ui/input';

// On-chain blockchain stamps data
const blockchainStamps = [
  {
    version: "v2.7.0",
    date: "December 6, 2025",
    products: [
      {
        name: "ORBIT Staffing OS",
        hash: "5d3d537ea1e19d9487d81e4e309af09369f2a095981c6a3158947713b56d750e",
        description: "Meeting Presentation Builder with CRM integration",
        serial: "000000000-01"
      },
      {
        name: "DarkWave Studios",
        hash: "d4f3bd5d23f7d4fd65d08c40959574e51776b6036899123de7cacc3c779a927f",
        description: "Product descriptions updated for v2.7.0",
        serial: "000000000-02"
      }
    ]
  },
  {
    version: "v2.6.5",
    date: "December 6, 2025",
    products: [
      {
        name: "ORBIT Staffing OS",
        hash: "acc66fbbc6ab8257bd2782e7a8eeb1c31c2c870cea482877d05931a0c2b9e5ea",
        description: "Footer version fix, header cleanup, minimal footer",
        serial: "000000000-01"
      }
    ]
  },
  {
    version: "v2.6.4",
    date: "December 6, 2025",
    products: [
      {
        name: "ORBIT Staffing OS",
        hash: "b37db47bb45ab9c34ac14bf125d1f930a918a0687210e79f7dff3d344c7f92a5",
        description: "Wave button bottom-right fix, conditional home button",
        serial: "000000000-01"
      }
    ]
  },
  {
    version: "v2.6.3",
    date: "December 6, 2025",
    products: [
      {
        name: "ORBIT Staffing OS",
        hash: "85478f33ea7987aeae03ddd1d21c20e4931b7abbbf0ba1bc7b847f8494d0cd4a",
        description: "Image imports fix, Wave button positioning",
        serial: "000000000-01"
      }
    ]
  },
  {
    version: "v2.6.1",
    date: "December 6, 2025",
    products: [
      {
        name: "ORBIT Staffing OS",
        hash: "ea7987aeae03ddd1d21c20e4931b7abbbf0ba1bc7b847f8494d0cd4a6c5a80dd",
        description: "Mobile fixes, PWA complete",
        serial: "000000000-01"
      }
    ]
  }
];

export default function HallmarkSeal() {
  const [copied, setCopied] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const serialNumber = '000000000-01';
  const hallmarkCode = `ORBIT-${serialNumber}`;
  const verificationUrl = `${window.location.origin}/verify/${hallmarkCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(hallmarkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Filter blockchain stamps based on search query
  const filteredStamps = useMemo(() => {
    if (!searchQuery.trim()) return blockchainStamps;
    
    const query = searchQuery.toLowerCase();
    return blockchainStamps
      .map(stamp => ({
        ...stamp,
        products: stamp.products.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.hash.toLowerCase().includes(query) ||
          p.serial.includes(query) ||
          stamp.version.toLowerCase().includes(query) ||
          stamp.date.toLowerCase().includes(query)
        )
      }))
      .filter(stamp => stamp.products.length > 0);
  }, [searchQuery]);

  const totalAssets = blockchainStamps.reduce((acc, s) => acc + s.products.length, 0);
  const filteredAssets = filteredStamps.reduce((acc, s) => acc + s.products.length, 0);

  const sealSizes = [
    { label: 'Thumbnail', size: 'thumbnail' as const },
    { label: 'Small', size: 'small' as const },
    { label: 'Medium', size: 'medium' as const },
    { label: 'Large', size: 'large' as const },
  ];

  const useCases = [
    { icon: '📧', title: 'Communications', desc: 'Email signatures, notifications, alerts' },
    { icon: '💳', title: 'Credentials', desc: 'Business cards, badges, employee IDs' },
    { icon: '📄', title: 'Documents', desc: 'Paychecks, invoices, contracts, certificates' },
    { icon: '🌐', title: 'Online', desc: 'Profile headers, achievement badges, portfolio' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="ORBIT Seal™"
          subtitle="Official Badge of Authenticity"
          breadcrumb={
            <Link href="/">
              <Button variant="outline" className="gap-2" data-testid="button-back-seal">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          }
        />

        <BentoGrid cols={2} gap="lg" className="mb-12">
          <BentoTile rowSpan={2} className="flex items-center justify-center min-h-[500px] border-2 border-cyan-400/50">
            <div className="flex flex-col items-center justify-center p-8 md:p-12">
              <div className="mb-8">
                <OrbyHallmark serialNumber={serialNumber} size="large" verificationUrl={verificationUrl} showExpand={false} />
              </div>
              <p className="text-center text-sm text-gray-400 max-w-xs">
                This seal verifies authenticity, compliance, and ORBIT quality
              </p>
            </div>
          </BentoTile>

          <BentoTile className="p-0">
            <OrbitCard variant="glass" hover={false} className="h-full border-0 rounded-none">
              <OrbitCardHeader>
                <OrbitCardTitle className="text-cyan-300">Your Guarantee</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent className="space-y-4 text-sm text-gray-300">
                <p>
                  Every ORBIT asset bears this official seal. It's your mark of approval—proof that this came from us, it's verified, and it's legitimate.
                </p>
                <div className="space-y-2 text-xs">
                  <p className="flex gap-2"><span className="text-amber-300">✓</span> Scanned & tracked</p>
                  <p className="flex gap-2"><span className="text-amber-300">✓</span> Holographically enhanced</p>
                  <p className="flex gap-2"><span className="text-amber-300">✓</span> Tamper-evident design</p>
                  <p className="flex gap-2"><span className="text-amber-300">✓</span> Unique serial number</p>
                </div>
              </OrbitCardContent>
            </OrbitCard>
          </BentoTile>

          <BentoTile className="p-0">
            <OrbitCard variant="glass" hover={false} className="h-full border-0 rounded-none">
              <OrbitCardHeader>
                <OrbitCardTitle className="text-cyan-300">Serial Information</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent className="space-y-4">
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
              </OrbitCardContent>
            </OrbitCard>
          </BentoTile>
        </BentoGrid>

        <OrbitCard variant="action" hover={false} className="mb-12 border-green-500/30 bg-green-950/20">
          <OrbitCardHeader>
            <OrbitCardTitle className="text-green-400">✓ Verified</OrbitCardTitle>
          </OrbitCardHeader>
          <OrbitCardContent>
            <p className="text-sm text-green-300">
              Scan the QR code to verify this seal and view its complete audit trail.
            </p>
          </OrbitCardContent>
        </OrbitCard>

        {/* On-Chain Asset Search */}
        <div className="mb-12">
          <SectionHeader
            title="On-Chain Asset Registry"
            subtitle="Search verified blockchain stamps by name, date, version, or hash"
          />

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search assets... (e.g., ORBIT, December, v2.7.0)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 h-12"
              data-testid="input-asset-search"
            />
          </div>

          <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <Blocks className="w-4 h-4 text-purple-400" />
              {filteredAssets} of {totalAssets} assets
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-cyan-400 hover:text-cyan-300 underline"
                data-testid="button-clear-search"
              >
                Clear search
              </button>
            )}
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {filteredStamps.length === 0 ? (
              <OrbitCard variant="glass" className="text-center py-8">
                <OrbitCardContent>
                  <p className="text-gray-400">No assets match your search.</p>
                  <p className="text-sm text-gray-500 mt-2">Try a different term like "ORBIT", "December", or a version number.</p>
                </OrbitCardContent>
              </OrbitCard>
            ) : (
              filteredStamps.map((stamp) => (
                <div key={stamp.version} className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded font-mono">{stamp.version}</span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {stamp.date}
                    </span>
                  </div>
                  
                  {stamp.products.map((product) => (
                    <OrbitCard key={product.hash} variant="glass" hover className="border-purple-500/20">
                      <OrbitCardContent className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-bold text-white">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.description}</p>
                          </div>
                          <span className="shrink-0 px-2 py-1 bg-amber-500/20 text-amber-300 rounded font-mono text-xs">
                            #{product.serial}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-slate-950/50 rounded p-2">
                          <Hash className="w-4 h-4 text-purple-400 shrink-0" />
                          <code className="text-xs font-mono text-purple-300 break-all flex-1">
                            {product.hash}
                          </code>
                          <button
                            onClick={() => copyHash(product.hash)}
                            className="shrink-0 p-1 hover:bg-slate-700 rounded transition-colors"
                            data-testid={`button-copy-hash-${product.hash.slice(0, 8)}`}
                          >
                            {copiedHash === product.hash ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        
                        <Link href="/solana-verification">
                          <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1" data-testid="link-view-on-chain">
                            <ExternalLink className="w-3 h-3" />
                            View on Solana Explorer
                          </button>
                        </Link>
                      </OrbitCardContent>
                    </OrbitCard>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mb-12">
          <SectionHeader
            title="Seal Sizes"
            subtitle="Available in multiple sizes for different use cases"
          />
          
          <div className="hidden md:block">
            <BentoGrid cols={4} gap="md">
              {sealSizes.map((item) => (
                <BentoTile key={item.size} className="flex flex-col items-center justify-center py-8">
                  <p className="text-xs text-gray-400 mb-4">{item.label}</p>
                  <OrbyHallmark serialNumber={serialNumber} size={item.size} />
                </BentoTile>
              ))}
            </BentoGrid>
          </div>

          <div className="md:hidden">
            <CarouselRail gap="md" itemWidth="md" showArrows={false}>
              {sealSizes.map((item) => (
                <CarouselRailItem key={item.size}>
                  <OrbitCard className="flex flex-col items-center justify-center py-8 min-w-[200px]">
                    <p className="text-xs text-gray-400 mb-4">{item.label}</p>
                    <OrbyHallmark serialNumber={serialNumber} size={item.size} />
                  </OrbitCard>
                </CarouselRailItem>
              ))}
            </CarouselRail>
          </div>
        </div>

        <div className="mb-8">
          <SectionHeader
            title="Where Seals Appear"
            subtitle="ORBIT seals are used across all official communications and documents"
          />
          
          <div className="hidden md:block">
            <BentoGrid cols={2} gap="md">
              {useCases.map((item) => (
                <BentoTile key={item.title} className="p-0">
                  <OrbitCard variant="glass" hover={false} className="h-full border-0 rounded-none">
                    <OrbitCardContent>
                      <p className="font-bold text-cyan-300 mb-2">{item.icon} {item.title}</p>
                      <p className="text-gray-400 text-xs">{item.desc}</p>
                    </OrbitCardContent>
                  </OrbitCard>
                </BentoTile>
              ))}
            </BentoGrid>
          </div>

          <div className="md:hidden">
            <CarouselRail gap="md" itemWidth="lg" showArrows={false}>
              {useCases.map((item) => (
                <CarouselRailItem key={item.title}>
                  <OrbitCard className="min-w-[260px]">
                    <OrbitCardContent>
                      <p className="font-bold text-cyan-300 mb-2">{item.icon} {item.title}</p>
                      <p className="text-gray-400 text-xs">{item.desc}</p>
                    </OrbitCardContent>
                  </OrbitCard>
                </CarouselRailItem>
              ))}
            </CarouselRail>
          </div>
        </div>
      </div>
    </div>
  );
}
