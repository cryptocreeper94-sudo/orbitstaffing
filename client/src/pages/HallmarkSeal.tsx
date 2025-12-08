import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, CheckCircle2 } from 'lucide-react';
import { Link } from 'wouter';
import { OrbyHallmark } from '@/components/OrbyHallmark';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { CarouselRail, CarouselRailItem } from '@/components/ui/carousel-rail';
import { PageHeader, SectionHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent } from '@/components/ui/orbit-card';

export default function HallmarkSeal() {
  const [copied, setCopied] = useState(false);
  const serialNumber = '000000000-01';
  const hallmarkCode = `ORBIT-${serialNumber}`;
  const verificationUrl = `${window.location.origin}/verify/${hallmarkCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(hallmarkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
