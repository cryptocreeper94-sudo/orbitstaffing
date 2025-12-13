import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, ExternalLink, Copy, CheckCircle2, Blocks, Hash, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PageHeader, SectionHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardContent, StatCard } from "@/components/ui/orbit-card";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { OrbyHallmark } from "@/components/OrbyHallmark";

const blockchainStamps = [
  {
    version: "v2.7.0",
    date: "December 6, 2025",
    products: [
      {
        name: "ORBIT Staffing OS",
        hash: "5d3d537ea1e19d9487d81e4e309af09369f2a095981c6a3158947713b56d750e",
        description: "Meeting Presentation Builder with CRM integration"
      },
      {
        name: "DarkWave Studios",
        hash: "d4f3bd5d23f7d4fd65d08c40959574e51776b6036899123de7cacc3c779a927f",
        description: "Product descriptions updated for v2.7.0"
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
        description: "Footer version fix, header cleanup, minimal footer"
      },
      {
        name: "DarkWave Studios",
        hash: "d4f3bd5d23f7d4fd65d08c40959574e51776b6036899123de7cacc3c779a927f",
        description: "Wave assistant positioned correctly"
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
        description: "Wave button bottom-right fix, conditional home button"
      },
      {
        name: "DarkWave Studios",
        hash: "d4f3bd5d23f7d4fd65d08c40959574e51776b6036899123de7cacc3c779a927f",
        description: "Wave assistant positioned correctly"
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
        description: "Image imports fix, Wave button positioning"
      },
      {
        name: "DarkWave Studios",
        hash: "b2d094402e68fc1b0a7f0e31e3404083a3cd90ea22a34df0478e94f12e5f7b21",
        description: "Products gallery enhancements"
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
        description: "Mobile fixes, PWA complete"
      },
      {
        name: "DarkWave Studios",
        hash: "68fc1b0a7f0e31e3404083a3cd90ea22a34df0478e94f12e5f7b21c5a3f53fba",
        description: "Full-screen product cards with carousel"
      }
    ]
  }
];

export default function SolanaVerification() {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleBack = () => {
    navigate('/');
  };

  const totalVersions = blockchainStamps.length;
  const totalProducts = blockchainStamps.reduce((acc, stamp) => acc + stamp.products.length, 0);
  const uniqueHashes = new Set(blockchainStamps.flatMap(s => s.products.map(p => p.hash))).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 text-white">
      <header className="border-b border-purple-500/30 backdrop-blur-sm sticky top-0 z-50 bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <PageHeader
            title="Solana Blockchain Verification"
            subtitle="Immutable cryptographic verification for all platform versions"
            breadcrumb={
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-400 hover:text-white -ml-2"
                onClick={handleBack}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            }
            actions={
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                Powered by Solana Mainnet
              </Badge>
            }
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <section className="text-center space-y-6">
          <h1 className="text-2xl sm:text-4xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Blockchain Verified
            </span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Every version of ORBIT Staffing OS is cryptographically stamped on the Solana blockchain 
            for immutable verification and transparency.
          </p>
          
          <div className="flex justify-center py-4">
            <OrbyHallmark 
              serialNumber="000000000-01" 
              size="large"
              showExpand={true}
            />
          </div>
        </section>

        <BentoGrid cols={3} gap="md">
          <BentoTile className="p-0">
            <StatCard
              label="Total Versions"
              value={totalVersions}
              icon={<Blocks className="w-6 h-6" />}
              className="border-0 h-full"
            />
          </BentoTile>
          <BentoTile className="p-0">
            <StatCard
              label="Products Stamped"
              value={totalProducts}
              icon={<Hash className="w-6 h-6" />}
              className="border-0 h-full"
            />
          </BentoTile>
          <BentoTile className="p-0">
            <StatCard
              label="Unique Hashes"
              value={uniqueHashes}
              icon={<Calendar className="w-6 h-6" />}
              className="border-0 h-full"
            />
          </BentoTile>
        </BentoGrid>

        <section>
          <SectionHeader
            eyebrow="Version History"
            title="Blockchain Stamps"
            subtitle="SHA-256 cryptographic signatures for each release"
            size="md"
          />

          <div className="space-y-6">
            {blockchainStamps.map((stamp, i) => (
              <OrbitCard key={i} variant="default" className="border-purple-500/30">
                <OrbitCardHeader
                  icon={
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-mono">
                      {stamp.version}
                    </Badge>
                  }
                  action={
                    i === 0 ? (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                        Latest
                      </Badge>
                    ) : undefined
                  }
                >
                  <span className="text-xs text-slate-500">{stamp.date}</span>
                </OrbitCardHeader>

                <OrbitCardContent>
                  <CarouselRail gap="md" showArrows={false}>
                    {stamp.products.map((product, j) => (
                      <div key={j} className="min-w-[300px] max-w-[400px] p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-white">{product.name}</h3>
                            <p className="text-xs text-slate-400 mb-2">{product.description}</p>
                            <div className="flex items-center gap-2">
                              <code className="text-[10px] sm:text-xs font-mono text-purple-300 bg-purple-900/30 px-2 py-1 rounded truncate max-w-[200px] sm:max-w-none">
                                {product.hash.slice(0, 16)}...{product.hash.slice(-8)}
                              </code>
                              <button
                                onClick={() => copyToClipboard(product.hash)}
                                className="p-1 hover:bg-slate-700 rounded transition"
                                data-testid={`copy-hash-${j}`}
                              >
                                {copiedHash === product.hash ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-slate-400" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="hidden sm:block">
                            <div className="w-16 h-16 bg-white rounded p-1">
                              <QRCodeSVG
                                value={product.hash}
                                size={56}
                                level="M"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CarouselRail>
                </OrbitCardContent>
              </OrbitCard>
            ))}
          </div>
        </section>

        <section className="text-center py-8 border-t border-slate-800/50 space-y-4">
          <p className="text-xs text-slate-500">
            Hashes are SHA-256 signatures of version metadata. Verify on any Solana explorer.
          </p>
          <a 
            href="https://explorer.solana.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition"
          >
            Open Solana Explorer <ExternalLink className="w-3 h-3" />
          </a>
        </section>
      </main>
    </div>
  );
}
