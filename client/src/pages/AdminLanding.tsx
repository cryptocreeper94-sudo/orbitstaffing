import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { CarouselRail } from '@/components/ui/carousel-rail';
import { SectionHeader, PageHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, ActionCard } from '@/components/ui/orbit-card';
import {
  ChevronDown,
  BookOpen,
  DollarSign,
  CheckSquare,
  TrendingUp,
  Settings,
  Zap,
} from 'lucide-react';

export default function AdminLanding() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    compliance: false,
    revenue: false,
    blockchain: false,
    learning: false,
    pitch: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const quickActions = [
    {
      title: 'Main App',
      description: 'Go to dashboard',
      icon: <Zap className="w-5 h-5" />,
      href: '/dashboard',
      testId: 'button-go-dashboard',
    },
    {
      title: 'Drug Tests',
      description: 'Billing management',
      icon: <DollarSign className="w-5 h-5" />,
      href: '/drug-test-billing',
      testId: 'button-go-billing',
    },
    {
      title: 'Work Comp',
      description: 'Compensation admin',
      icon: <CheckSquare className="w-5 h-5" />,
      href: '/workers-comp-admin',
      testId: 'button-go-workcomp',
    },
    {
      title: 'Incidents',
      description: 'Report management',
      icon: <TrendingUp className="w-5 h-5" />,
      href: '/incident-reporting',
      testId: 'button-go-incidents',
    },
  ];

  return (
    <Shell>
      <PageHeader
        title="ORBIT Admin Center"
        subtitle="Master control panel - manage platform from any device"
      />

      {/* Quick Actions - Desktop Grid */}
      <div className="hidden md:block mb-8">
        <BentoGrid cols={4} gap="md">
          {quickActions.map((action) => (
            <BentoTile key={action.testId}>
              <ActionCard
                title={action.title}
                description={action.description}
                icon={action.icon}
                onClick={() => window.location.href = action.href}
                className="h-full border-0 bg-transparent hover:bg-transparent"
                data-testid={action.testId}
              />
            </BentoTile>
          ))}
        </BentoGrid>
      </div>

      {/* Quick Actions - Mobile Carousel */}
      <div className="md:hidden mb-8">
        <CarouselRail
          title="Quick Actions"
          showArrows={false}
          gap="md"
          itemWidth="md"
        >
          {quickActions.map((action) => (
            <ActionCard
              key={action.testId}
              title={action.title}
              description={action.description}
              icon={action.icon}
              onClick={() => window.location.href = action.href}
              className="w-[200px]"
              data-testid={action.testId}
            />
          ))}
        </CarouselRail>
      </div>

      {/* Investor Pitch Section */}
      <OrbitCard 
        variant="glass" 
        className="mb-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/50"
      >
        <OrbitCardHeader
          icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
          action={
            <ChevronDown
              className={`w-5 h-5 transition-transform cursor-pointer ${expandedSections.pitch ? 'rotate-180' : ''}`}
              onClick={() => toggleSection('pitch')}
            />
          }
        >
          <OrbitCardTitle>Investor Pitch & Stats</OrbitCardTitle>
        </OrbitCardHeader>

        {expandedSections.pitch && (
          <OrbitCardContent className="space-y-4">
            <BentoGrid cols={2} gap="md">
              <BentoTile className="p-3">
                <p className="text-xs text-gray-400 mb-2 font-bold">Market Opportunity</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>✓ TAM: $150B+ US staffing market</li>
                  <li>✓ SAM: $2-5B digital staffing solutions</li>
                  <li>✓ Tech penetration: &lt;30% (huge gap)</li>
                </ul>
              </BentoTile>

              <BentoTile className="p-3">
                <p className="text-xs text-gray-400 mb-2 font-bold">Financial Projections</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>✓ Year 1: $205K ARR</li>
                  <li>✓ Year 3: $2.68M ARR (13x growth)</li>
                  <li>✓ Year 5: $13M ARR (63x growth)</li>
                </ul>
              </BentoTile>

              <BentoTile className="p-3">
                <p className="text-xs text-gray-400 mb-2 font-bold">Unit Economics</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>✓ Gross margin: 40-50%</li>
                  <li>✓ CAC: $3,000-$5,000</li>
                  <li>✓ Payback period: 6-9 months</li>
                  <li>✓ Churn: &lt;3% monthly</li>
                </ul>
              </BentoTile>

              <BentoTile className="p-3">
                <p className="text-xs text-gray-400 mb-2 font-bold">Revenue Streams</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>✓ SaaS subscriptions (60%)</li>
                  <li>✓ Partnerships & API (15%)</li>
                  <li>✓ Training & certifications (10%)</li>
                  <li>✓ Data marketplace, mobile, add-ons (15%)</li>
                </ul>
              </BentoTile>
            </BentoGrid>

            <div className="bg-blue-900/10 border border-blue-700/50 rounded-lg p-4">
              <p className="text-sm text-blue-300 font-bold mb-2">🎯 Investment Ask: $500K Seed</p>
              <ul className="text-xs text-blue-300 space-y-1">
                <li>Product development (mobile, API) - $200K</li>
                <li>Sales & marketing - $150K</li>
                <li>Team (CTO, VP Sales) - $100K</li>
                <li>Operations & compliance - $50K</li>
              </ul>
            </div>

            <div className="bg-green-900/10 border border-green-700/50 rounded-lg p-4">
              <p className="text-sm text-green-300 font-bold mb-2">💰 Exit Potential: $25-50M+</p>
              <p className="text-xs text-green-300">
                Acquisition targets: ADP ($15-30M), Workday ($20-40M), Staffing360 ($10-25M)
              </p>
            </div>

            <Button
              onClick={() => window.location.href = '/owner-pitch'}
              className="w-full bg-primary hover:bg-primary/90"
              data-testid="button-view-owner-pitch"
            >
              View Owner/Customer Pitch
            </Button>
          </OrbitCardContent>
        )}
      </OrbitCard>

      {/* Knowledge Base - Collapsible Sections */}
      <SectionHeader
        title="Knowledge Base & Business Materials"
        size="md"
      />

      <BentoGrid cols={1} gap="md" className="mb-8">
        {/* Compliance Roadmap */}
        <BentoTile
          className="cursor-pointer p-4"
          onClick={() => toggleSection('compliance')}
          data-testid="card-compliance"
        >
          <OrbitCardHeader
            icon={<CheckSquare className="w-5 h-5 text-blue-400" />}
            action={
              <ChevronDown
                className={`w-5 h-5 transition-transform ${expandedSections.compliance ? 'rotate-180' : ''}`}
              />
            }
          >
            <OrbitCardTitle>Compliance Roadmap</OrbitCardTitle>
          </OrbitCardHeader>

          {expandedSections.compliance && (
            <OrbitCardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-blue-300 mb-2">📋 Phase 1: Foundation (Months 1-2)</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ Business entity registration (LLC/C-Corp)</li>
                    <li>✓ FEIN/Tax ID (free, instant)</li>
                    <li>✓ Business bank account</li>
                    <li className="text-gray-500 text-xs">💰 Cost: $2,000-$5,000</li>
                  </ul>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-blue-300 mb-2">🏢 Phase 2: Basic Compliance (Months 2-4)</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ DBA/Business License</li>
                    <li>✓ Sales Tax Permit</li>
                    <li>✓ Insurance (General Liability, Professional, Cyber)</li>
                    <li className="text-gray-500 text-xs">💰 Cost: $500-$2,000</li>
                  </ul>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-blue-300 mb-2">⭐ Phase 3: Industry-Specific (Months 3-6)</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ Better Business Bureau (BBB)</li>
                    <li>✓ OSHA Registration & Compliance</li>
                    <li>✓ Drug Testing Program Compliance</li>
                    <li>✓ Chamber of Commerce</li>
                    <li className="text-gray-500 text-xs">💰 Cost: $3,000-$8,000</li>
                  </ul>
                </div>
              </div>
            </OrbitCardContent>
          )}
        </BentoTile>

        {/* Revenue Models */}
        <BentoTile
          className="cursor-pointer p-4"
          onClick={() => toggleSection('revenue')}
          data-testid="card-revenue"
        >
          <OrbitCardHeader
            icon={<DollarSign className="w-5 h-5 text-green-400" />}
            action={
              <ChevronDown
                className={`w-5 h-5 transition-transform ${expandedSections.revenue ? 'rotate-180' : ''}`}
              />
            }
          >
            <OrbitCardTitle>Revenue Streams & Growth</OrbitCardTitle>
          </OrbitCardHeader>

          {expandedSections.revenue && (
            <OrbitCardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-green-300 mb-2">💳 Drug Test Billing</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ Pre-employment: Employer pays ($50-$150)</li>
                    <li>✓ Incidents: ORBIT covers</li>
                    <li>✓ Profit margin: $20-$80 per test</li>
                  </ul>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-green-300 mb-2">🤝 Partnerships</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ White-label licensing ($10K-$50K + revenue share)</li>
                    <li>✓ API partnerships (ADP, Paychex, Gusto)</li>
                    <li>✓ Potential: 10-20% of revenue by Year 3</li>
                  </ul>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-green-300 mb-2">📱 Mobile App & Training</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ Google Play + Apple App Store ($50K-$500K/year)</li>
                    <li>✓ Compliance certification ($99-$299/person)</li>
                    <li>✓ Bootcamp programs ($2K-$5K per person)</li>
                  </ul>
                </div>
              </div>
            </OrbitCardContent>
          )}
        </BentoTile>

        {/* Blockchain */}
        <BentoTile
          className="cursor-pointer p-4 border-purple-700/30 bg-purple-900/5"
          onClick={() => toggleSection('blockchain')}
          data-testid="card-blockchain"
        >
          <OrbitCardHeader
            icon={<Zap className="w-5 h-5 text-purple-400" />}
            action={
              <ChevronDown
                className={`w-5 h-5 transition-transform ${expandedSections.blockchain ? 'rotate-180' : ''}`}
              />
            }
          >
            <OrbitCardTitle>Blockchain & Crypto Opportunities</OrbitCardTitle>
          </OrbitCardHeader>

          {expandedSections.blockchain && (
            <OrbitCardContent className="space-y-3 text-sm">
              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="font-bold text-purple-300 mb-2">🪙 ORBIT Loyalty Token</p>
                <ul className="text-xs text-gray-400 space-y-1 ml-3">
                  <li>✓ Workers earn for assignments (Solana/Polygon)</li>
                  <li>✓ Redeem for pay, features, training</li>
                  <li>⚠️ Requires legal review (NOT a security)</li>
                </ul>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="font-bold text-purple-300 mb-2">📜 Blockchain Credentials</p>
                <ul className="text-xs text-gray-400 space-y-1 ml-3">
                  <li>✓ Immutable proof of qualifications</li>
                  <li>✓ Workers own across platforms</li>
                  <li>✓ $20K-$100K/year licensing potential</li>
                </ul>
              </div>
            </OrbitCardContent>
          )}
        </BentoTile>

        {/* Learning & Resources */}
        <BentoTile
          className="cursor-pointer p-4"
          onClick={() => toggleSection('learning')}
          data-testid="card-learning"
        >
          <OrbitCardHeader
            icon={<BookOpen className="w-5 h-5 text-cyan-400" />}
            action={
              <ChevronDown
                className={`w-5 h-5 transition-transform ${expandedSections.learning ? 'rotate-180' : ''}`}
              />
            }
          >
            <OrbitCardTitle>Learning Materials & Resources</OrbitCardTitle>
          </OrbitCardHeader>

          {expandedSections.learning && (
            <OrbitCardContent className="space-y-3 text-sm">
              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="font-bold text-cyan-300 mb-2">📖 Platform Documentation</p>
                <ul className="text-xs text-gray-400 space-y-1 ml-3">
                  <li>✓ User Guide & Admin Guide</li>
                  <li>✓ API Documentation</li>
                  <li>✓ FAQ & Training Materials</li>
                </ul>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="font-bold text-cyan-300 mb-2">🎓 Compliance Training</p>
                <ul className="text-xs text-gray-400 space-y-1 ml-3">
                  <li>✓ Drug Testing Best Practices</li>
                  <li>✓ Chain of Custody Procedures</li>
                  <li>✓ Workers Comp Compliance</li>
                </ul>
              </div>
            </OrbitCardContent>
          )}
        </BentoTile>
      </BentoGrid>

      {/* System Status */}
      <OrbitCard variant="default" className="mt-8">
        <OrbitCardHeader icon={<Settings className="w-5 h-5" />}>
          <OrbitCardTitle>System Status</OrbitCardTitle>
        </OrbitCardHeader>
        <OrbitCardContent>
          <BentoGrid cols={4} gap="sm">
            <div>
              <p className="text-xs text-gray-400 mb-1">Platform Status</p>
              <Badge className="bg-green-900/30 text-green-300">✓ Production Ready</Badge>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Database</p>
              <Badge className="bg-green-900/30 text-green-300">✓ Connected</Badge>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">API Status</p>
              <Badge className="bg-green-900/30 text-green-300">✓ Running</Badge>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Mobile Apps</p>
              <Badge className="bg-yellow-900/30 text-yellow-300">⏳ Coming Soon</Badge>
            </div>
          </BentoGrid>
        </OrbitCardContent>
      </OrbitCard>
    </Shell>
  );
}
