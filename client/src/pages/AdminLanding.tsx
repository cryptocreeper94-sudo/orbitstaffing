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
} from 'lucide-react';

export default function AdminLanding() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    compliance: false,
    revenue: false,
    operations: false,
    learning: false,
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

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-blue-300 mb-2">🔐 Phase 4: Data & Security (Months 4-8)</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ Privacy Policy & Terms of Service</li>
                    <li>✓ HIPAA Compliance</li>
                    <li>✓ SOC 2 Type II Certification</li>
                    <li>✓ PCI-DSS Compliance</li>
                    <li className="text-gray-500 text-xs">💰 Cost: $2,000-$5,000 (SOC 2 is $10K+/year)</li>
                  </ul>
                </div>

                <div className="bg-green-900/10 border border-green-700/50 rounded-lg p-3">
                  <p className="text-xs text-green-300 font-bold mb-1">
                    💡 Strategy: Phase 1-3 before first customer, Phase 4 before enterprise sales
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Revenue Models & Expansion */}
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
                  <p className="font-bold text-green-300 mb-2">💳 Drug Test Billing (Current)</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ Pre-employment tests: Employer pays ($50-$150/test)</li>
                    <li>✓ Incident tests: ORBIT covers (operational expense)</li>
                    <li>✓ Stripe + Invoice payment options</li>
                    <li className="text-gray-500 text-xs">💰 Profit margin: $20-$80 per test</li>
                  </ul>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-green-300 mb-2">🤝 Partnership Revenue</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ White-label licensing to other platforms</li>
                    <li>✓ API partnerships with staffing networks</li>
                    <li>✓ Payroll processor integrations (ADP, Paychex)</li>
                    <li className="text-gray-500 text-xs">💰 Potential: 10-20% of revenue by Year 3</li>
                  </ul>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-green-300 mb-2">📱 Mobile App Revenue</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ Google Play Store + Apple App Store</li>
                    <li>✓ Premium tier: In-app purchases, advanced features</li>
                    <li>✓ Sponsored content (job alerts, training)</li>
                    <li className="text-gray-500 text-xs">💰 Potential: $50K-$500K/year at scale</li>
                  </ul>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-green-300 mb-2">🎓 SaaS Training & Certification</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ Compliance certification courses ($99-$299/person)</li>
                    <li>✓ Drug testing procedures, GPS verification training</li>
                    <li>✓ Staffing agency management bootcamp</li>
                    <li className="text-gray-500 text-xs">💰 Potential: $100K-$500K/year</li>
                  </ul>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-green-300 mb-2">🏪 Data Marketplace</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ Anonymized staffing trends (aggregated, non-PII)</li>
                    <li>✓ Labor market insights for staffing consultants</li>
                    <li>✓ Compliance intelligence reports</li>
                    <li className="text-gray-500 text-xs">💰 Potential: $50K-$200K/year</li>
                  </ul>
                </div>

                <div className="bg-yellow-900/10 border border-yellow-700/50 rounded-lg p-3">
                  <p className="text-xs text-yellow-300 mb-2">
                    <strong>⚠️ Data Marketplace Rules:</strong> Only anonymized, aggregated data. No personal info. GDPR/CCPA compliant.
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Crypto & Blockchain Opportunities */}
        <Card
          className="border-border/50 cursor-pointer hover:bg-card/50 transition border-purple-700/30 bg-purple-900/5"
          onClick={() => toggleSection('operations')}
          data-testid="card-blockchain"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-purple-400" />
                Blockchain & Crypto Opportunities
              </CardTitle>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${expandedSections.operations ? 'rotate-180' : ''}`}
              />
            </div>
          </CardHeader>

          {expandedSections.operations && (
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-purple-300 mb-2">⚠️ IMPORTANT: Legal & Regulatory</p>
                  <p className="text-xs text-gray-400 ml-3 mb-2">
                    Any token offering requires SEC registration or exemption (Reg A+, Reg D, etc.). Consult attorney before proceeding.
                  </p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-purple-300 mb-2">🪙 Loyalty Token (ORBIT Coin)</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ Workers earn ORBIT coins for completed assignments</li>
                    <li>✓ Redeem for: Bonus pay, premium benefits, app features</li>
                    <li>✓ Could create secondary marketplace</li>
                    <li>✓ Uses: Solana, Polygon (low-cost blockchains)</li>
                    <li className="text-gray-500 text-xs">⚠️ Requires: Careful legal review, maybe not coin = tokenomics</li>
                  </ul>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-purple-300 mb-2">🤝 DAO-Style Governance</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ Workers vote on feature requests, platform changes</li>
                    <li>✓ Franchise owners have voting shares</li>
                    <li>✓ Community-driven development</li>
                    <li className="text-gray-500 text-xs">💰 Potential: Attracts web3-focused investors</li>
                  </ul>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-purple-300 mb-2">📜 Smart Contracts (Verification)</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ Blockchain-verified credentials (background checks, certifications)</li>
                    <li>✓ Immutable proof of skill/experience</li>
                    <li>✓ Workers own their credentials across platforms</li>
                    <li className="text-gray-500 text-xs">💰 Potential: Differentiator vs competitors</li>
                  </ul>
                </div>

                <div className="bg-purple-900/10 border border-purple-700/50 rounded-lg p-3">
                  <p className="text-xs text-purple-300 font-bold mb-1">
                    💡 Recommended: Start with non-token approach (points/loyalty) → Add blockchain credentials later if market develops
                  </p>
                </div>
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
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-cyan-300 mb-2">📖 ORBIT Platform Documentation</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ <a href="/docs/user-guide" className="text-cyan-400 hover:underline">User Guide</a> - How to use platform</li>
                    <li>✓ <a href="/docs/admin-guide" className="text-cyan-400 hover:underline">Admin Guide</a> - Manage your franchise</li>
                    <li>✓ <a href="/docs/api" className="text-cyan-400 hover:underline">API Documentation</a> - Integrations</li>
                    <li>✓ <a href="/docs/faq" className="text-cyan-400 hover:underline">FAQ</a> - Common questions</li>
                  </ul>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-cyan-300 mb-2">📊 Business Strategy Resources</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ ORBIT Business Plan (see Compliance section below)</li>
                    <li>✓ Revenue Model Playbook</li>
                    <li>✓ Franchise Partner Onboarding Guide</li>
                    <li>✓ Customer Case Studies</li>
                  </ul>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="font-bold text-cyan-300 mb-2">🎓 Compliance Training</p>
                  <ul className="text-xs text-gray-400 space-y-1 ml-3">
                    <li>✓ Drug Testing Best Practices</li>
                    <li>✓ Chain of Custody Procedures</li>
                    <li>✓ Workers Comp Compliance</li>
                    <li>✓ Background Check Legal Requirements</li>
                  </ul>
                </div>

                <div className="bg-blue-900/10 border border-blue-700/50 rounded-lg p-3">
                  <p className="text-xs text-blue-300">
                    💡 All materials available in shared `/docs` folder (read-only access to preserve integrity)
                  </p>
                </div>
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
