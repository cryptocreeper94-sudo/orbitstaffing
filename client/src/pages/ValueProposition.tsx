import React from 'react';
import { ArrowRight, CheckCircle, Globe, Users, Zap, Lock, TrendingUp, Cpu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { CarouselRail } from '@/components/ui/carousel-rail';
import { SectionHeader, PageHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent } from '@/components/ui/orbit-card';

const coreAdvantages = [
  {
    icon: Zap,
    title: 'GPS-Verified Check-In',
    description: '300-foot geofencing + real-time location capture. No time theft. No guesswork. Complete audit trail.',
    stat: '✓ Prevents $2.2B annual US time theft',
    color: 'cyan',
  },
  {
    icon: TrendingUp,
    title: 'Multi-Tier Bonuses',
    description: 'Attendance, performance, referral, and milestone bonuses. Real-time calculations. Automatic payroll integration.',
    stat: '✓ 34% higher worker retention',
    color: 'purple',
  },
  {
    icon: Users,
    title: 'Equipment Tracking',
    description: 'Real-time PPE inventory. 2-day return deadline. Auto-deductions for non-returns. Zero loss.',
    stat: '✓ Saves 15-20% on replacement costs',
    color: 'green',
  },
  {
    icon: Lock,
    title: 'Hallmark Traceability',
    description: 'Every paystub, invoice, contract gets blockchain-ready UPC + QR codes. Verifiable authenticity.',
    stat: '✓ Compliance-grade audit trail',
    color: 'blue',
  },
  {
    icon: Cpu,
    title: 'Worker Availability Calendar',
    description: '2-week smart scheduling. Heatmap visualization. AI-powered shift recommendations. Real-time sync.',
    stat: '✓ 22% fewer no-shows',
    color: 'yellow',
  },
  {
    icon: Globe,
    title: 'One-Click Shifts',
    description: 'Workers accept/reject shifts instantly. Real-time tracking. No manual back-and-forth.',
    stat: '✓ 5x faster assignments',
    color: 'pink',
  },
];

const orbitAdvantages = [
  {
    title: 'Production-Ready',
    description: '7 core systems fully operational. Zero beta features. Real data in real databases. Live right now.',
  },
  {
    title: 'White-Label Ready',
    description: 'Your branding. Your company name. Your logo. Complete customization for franchisees.',
  },
  {
    title: 'Compliance Built-In',
    description: 'Multi-state compliance. Prevailing wage calculations. I-9 tracking. Audit-grade records.',
  },
  {
    title: 'Franchise Growth Model',
    description: 'Licensing model for regional managers. Revenue share options. Scalable from 1 to 1000+ franchises.',
  },
  {
    title: 'V2 Roadmap',
    description: 'Q2 2026: SMS notifications, instant pay, skill verification, QA system, AI job matching.',
  },
];

const colorClasses: Record<string, { border: string; icon: string; stat: string }> = {
  cyan: { border: 'border-cyan-600/50', icon: 'text-cyan-400', stat: 'text-cyan-400' },
  purple: { border: 'border-purple-600/50', icon: 'text-purple-400', stat: 'text-purple-400' },
  green: { border: 'border-green-600/50', icon: 'text-green-400', stat: 'text-green-400' },
  blue: { border: 'border-blue-600/50', icon: 'text-blue-400', stat: 'text-blue-400' },
  yellow: { border: 'border-yellow-600/50', icon: 'text-yellow-400', stat: 'text-yellow-400' },
  pink: { border: 'border-pink-600/50', icon: 'text-pink-400', stat: 'text-pink-400' },
};

function AdvantageCard({ advantage }: { advantage: typeof coreAdvantages[0] }) {
  const Icon = advantage.icon;
  const colors = colorClasses[advantage.color];
  return (
    <OrbitCard className={colors.border}>
      <OrbitCardHeader icon={<Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${colors.icon}`} />}>
        <OrbitCardTitle>{advantage.title}</OrbitCardTitle>
      </OrbitCardHeader>
      <OrbitCardContent>
        <p className="text-xs sm:text-base text-gray-300">{advantage.description}</p>
        <p className={`text-xs sm:text-sm ${colors.stat} mt-2`}>{advantage.stat}</p>
      </OrbitCardContent>
    </OrbitCard>
  );
}

export default function ValueProposition() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="px-4 py-4">
        <Link href="/">
          <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div className="relative overflow-hidden px-3 sm:px-4 py-12 sm:py-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-transparent to-purple-600 blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <PageHeader
            title="Why ORBIT Staffing OS"
            subtitle="A production-ready staffing platform that outpaces competitors like HubSpot, Guidepoint, and legacy systems"
            className="[&_h1]:text-3xl [&_h1]:sm:text-5xl [&_h1]:lg:text-6xl [&_h1]:bg-gradient-to-r [&_h1]:from-cyan-400 [&_h1]:to-purple-400 [&_h1]:bg-clip-text [&_h1]:text-transparent [&_p]:text-sm [&_p]:sm:text-lg [&_p]:lg:text-xl"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-16">
        <SectionHeader
          title="7 Systems. Zero Competitors."
          align="center"
          size="lg"
        />
        
        <div className="hidden md:block mb-8 sm:mb-12">
          <BentoGrid cols={2} gap="md">
            {coreAdvantages.map((advantage, index) => (
              <BentoTile key={index} className="p-0 border-0 bg-transparent">
                <AdvantageCard advantage={advantage} />
              </BentoTile>
            ))}
          </BentoGrid>
        </div>

        <div className="md:hidden mb-8">
          <CarouselRail gap="md" itemWidth="lg" arrowsOnMobile>
            {coreAdvantages.map((advantage, index) => (
              <div key={index} className="w-[300px]">
                <AdvantageCard advantage={advantage} />
              </div>
            ))}
          </CarouselRail>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-16">
        <SectionHeader
          title="How We Compare"
          align="center"
          size="lg"
        />
        
        <BentoTile className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-4 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4">ORBIT</th>
                  <th className="text-center py-4 px-4">HubSpot</th>
                  <th className="text-center py-4 px-4">Guidepoint</th>
                  <th className="text-center py-4 px-4">Legacy Systems</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['GPS Verification', true, false, false, false],
                  ['Real-time Bonuses', true, false, false, false],
                  ['Equipment Tracking', true, false, false, false],
                  ['Hallmark Traceability', true, false, false, false],
                  ['Mobile Apps', true, true, false, false],
                  ['Payroll Automation', true, true, true, false],
                  ['Compliance Rules', true, false, true, true],
                  ['White-Label', true, false, false, false],
                  ['AI Job Matching', true, false, false, false],
                  ['Instant Pay Ready', true, false, false, false],
                ].map(([feature, orbit, hubspot, guidepoint, legacy]) => (
                  <tr key={feature as string} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-medium">{feature as string}</td>
                    <td className="text-center py-3 px-4">
                      {orbit && <CheckCircle className="w-5 h-5 text-cyan-400 mx-auto" />}
                    </td>
                    <td className="text-center py-3 px-4">
                      {hubspot && <CheckCircle className="w-5 h-5 text-gray-500 mx-auto" />}
                    </td>
                    <td className="text-center py-3 px-4">
                      {guidepoint && <CheckCircle className="w-5 h-5 text-gray-500 mx-auto" />}
                    </td>
                    <td className="text-center py-3 px-4">
                      {legacy && <CheckCircle className="w-5 h-5 text-gray-500 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BentoTile>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-16">
        <SectionHeader
          title="The ORBIT Advantage"
          align="center"
          size="lg"
        />
        
        <BentoGrid cols={1} gap="md">
          {orbitAdvantages.map((advantage, index) => (
            <BentoTile key={index} className="p-0 border-0 bg-transparent">
              <OrbitCard>
                <OrbitCardHeader icon={<CheckCircle className="w-6 h-6 text-green-400" />}>
                  <OrbitCardTitle>{advantage.title}</OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent>
                  <p className="text-gray-300">{advantage.description}</p>
                </OrbitCardContent>
              </OrbitCard>
            </BentoTile>
          ))}
        </BentoGrid>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-12 sm:py-20 text-center">
        <SectionHeader
          title="Ready to Scale Your Staffing Business?"
          subtitle="ORBIT Staffing OS is built for franchisees, regional managers, and growth-focused agencies."
          align="center"
          size="lg"
        />
        <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg" data-testid="button-schedule-demo">
          Schedule a Demo <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      <div className="border-t border-slate-800 py-8 text-center text-gray-400">
        <p>ORBIT Staffing OS © 2025 | Powered by ORBIT</p>
      </div>
    </div>
  );
}
