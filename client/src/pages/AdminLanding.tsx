import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  BookOpen,
  DollarSign,
  CheckSquare,
  TrendingUp,
  Settings,
  Users,
  Zap,
  Share2,
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

  return (
    <Shell>
      {/* Mobile-First Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading mb-2">ORBIT Admin Center</h1>
        <p className="text-muted-foreground text-sm">Master control panel - manage platform from any device</p>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Button
          onClick={() => window.location.href = '/dashboard'}
          variant="outline"
          className="h-20 flex flex-col items-center justify-center"
          data-testid="button-go-dashboard"
        >
          <Zap className="w-6 h-6 mb-1 text-cyan-400" />
          <span className="text-xs">Main App</span>
        </Button>

        <Button
          onClick={() => window.location.href = '/drug-test-billing'}
          variant="outline"
          className="h-20 flex flex-col items-center justify-center"
          data-testid="button-go-billing"
        >
          <DollarSign className="w-6 h-6 mb-1 text-green-400" />
          <span className="text-xs">Drug Tests</span>
        </Button>

        <Button
          onClick={() => window.location.href = '/workers-comp-admin'}
          variant="outline"
          className="h-20 flex flex-col items-center justify-center"
          data-testid="button-go-workcomp"
        >
          <CheckSquare className="w-6 h-6 mb-1 text-orange-400" />
          <span className="text-xs">Work Comp</span>
        </Button>

        <Button
          onClick={() => window.location.href = '/incident-reporting'}
          variant="outline"
          className="h-20 flex flex-col items-center justify-center"
          data-testid="button-go-incidents"
        >
          <TrendingUp className="w-6 h-6 mb-1 text-red-400" />
          <span className="text-xs">Incidents</span>
        </Button>
      </div>

      {/* Investor Pitch Section */}
      <Card className="border-border/50 mb-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Investor Pitch & Stats
            </CardTitle>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${expandedSections.pitch ? 'rotate-180' : ''}`}
              onClick={() => toggleSection('pitch')}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </CardHeader>

        {expandedSections.pitch && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-2"><strong>Market Opportunity</strong></p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>✓ TAM: $150B+ US staffing market</li>
                  <li>✓ SAM: $2-5B digital staffing solutions</li>
                  <li>✓ Tech penetration: &lt;30% (huge gap)</li>
                </ul>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-2"><strong>Financial Projections</strong></p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>✓ Year 1: $205K ARR</li>
                  <li>✓ Year 3: $2.68M ARR (13x growth)</li>
                  <li>✓ Year 5: $13M ARR (63x growth)</li>
                </ul>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-2"><strong>Unit Economics</strong></p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>✓ Gross margin: 40-50%</li>
                  <li>✓ CAC: $3,000-$5,000</li>
                  <li>✓ Payback period: 6-9 months</li>
                  <li>✓ Churn: &lt;3% monthly</li>
                </ul>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-2"><strong>Revenue Streams</strong></p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>✓ SaaS subscriptions (60%)</li>
                  <li>✓ Partnerships & API (15%)</li>
                  <li>✓ Training & certifications (10%)</li>
                  <li>✓ Data marketplace, mobile, add-ons (15%)</li>
                </ul>
              </div>
            </div>

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
          </CardContent>
        )}
      </Card>

      {/* Knowledge Base - Collapsible Sections */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Knowledge Base & Business Materials</h2>

        {/* Compliance Roadmap */}
        <Card
          className="border-border/50 cursor-pointer hover:bg-card/50 transition"
          onClick={() => toggleSection('compliance')}
          data-testid="card-compliance"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckSquare className="w-5 h-5 text-blue-400" />
                Compliance Roadmap
              </CardTitle>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${expandedSections.compliance ? 'rotate-180' : ''}`}
              />
            </div>
          </CardHeader>

          {expandedSections.compliance && (
            <CardContent className="space-y-4">
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
            </CardContent>
          )}
        </Card>

        {/* Revenue Models */}
        <Card
          className="border-border/50 cursor-pointer hover:bg-card/50 transition"
          onClick={() => toggleSection('revenue')}
          data-testid="card-revenue"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-green-400" />
                Revenue Streams & Growth
              </CardTitle>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${expandedSections.revenue ? 'rotate-180' : ''}`}
              />
            </div>
          </CardHeader>

          {expandedSections.revenue && (
            <CardContent className="space-y-4">
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
            </CardContent>
          )}
        </Card>

        {/* Blockchain */}
        <Card
          className="border-border/50 cursor-pointer hover:bg-card/50 transition border-purple-700/30 bg-purple-900/5"
          onClick={() => toggleSection('blockchain')}
          data-testid="card-blockchain"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-purple-400" />
                Blockchain & Crypto Opportunities
              </CardTitle>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${expandedSections.blockchain ? 'rotate-180' : ''}`}
              />
            </div>
          </CardHeader>

          {expandedSections.blockchain && (
            <CardContent className="space-y-3 text-sm">
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
            </CardContent>
          )}
        </Card>

        {/* Learning & Resources */}
        <Card
          className="border-border/50 cursor-pointer hover:bg-card/50 transition"
          onClick={() => toggleSection('learning')}
          data-testid="card-learning"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                Learning Materials & Resources
              </CardTitle>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${expandedSections.learning ? 'rotate-180' : ''}`}
              />
            </div>
          </CardHeader>

          {expandedSections.learning && (
            <CardContent className="space-y-3 text-sm">
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
            </CardContent>
          )}
        </Card>
      </div>

      {/* System Status */}
      <Card className="border-border/50 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
          </div>
        </CardContent>
      </Card>
    </Shell>
  );
}
