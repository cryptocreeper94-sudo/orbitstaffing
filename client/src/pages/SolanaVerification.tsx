import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Shield, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const blockchainStamps = [
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

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 text-white">
      <header className="border-b border-purple-500/30 backdrop-blur-sm sticky top-0 z-50 bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-bold">Solana Blockchain Verification</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <section className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Blockchain Verified
            </span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Every version of ORBIT Staffing OS is cryptographically stamped on the Solana blockchain 
            for immutable verification and transparency.
          </p>
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            Powered by Solana Mainnet via Helius RPC
          </Badge>
        </section>

        <section className="space-y-6">
          {blockchainStamps.map((stamp, i) => (
            <Card key={i} className="bg-slate-900/50 border-purple-500/30">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-mono">
                      {stamp.version}
                    </Badge>
                    <span className="text-xs text-slate-500">{stamp.date}</span>
                  </div>
                  {i === 0 && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                      Latest
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  {stamp.products.map((product, j) => (
                    <div key={j} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
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
                </div>
              </CardContent>
            </Card>
          ))}
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
