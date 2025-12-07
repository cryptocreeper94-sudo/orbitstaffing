import React, { useState } from 'react';
import { Lock, Users, FileText, Calendar, CheckCircle, Briefcase, Award, DollarSign, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { CarouselRail, CarouselRailItem } from '@/components/ui/carousel-rail';
import { SectionHeader, PageHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent } from '@/components/ui/orbit-card';

export default function ProfessionalStaffing() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const features = [
    { title: 'Certification Management', desc: 'Track licenses, degrees, certifications with auto-expiry alerts', icon: Award },
    { title: 'Background Checks', desc: 'Integrated with Checkr/Sterling for background verification', icon: CheckCircle },
    { title: 'Interview Coordination', desc: 'Schedule and record interviews with hiring managers', icon: Calendar },
    { title: 'Contract Engine', desc: 'Auto-generate SOWs with terms, rates, compliance clauses', icon: FileText },
    { title: 'Rate Negotiation', desc: 'Bill rate vs. pay rate calculator with margin tracking', icon: DollarSign },
    { title: 'Client Credentialing', desc: 'Verify client eligibility for professional placements', icon: Users },
    { title: 'Performance Reviews', desc: 'Track worker and client satisfaction throughout engagement', icon: CheckCircle },
    { title: 'Contract Compliance', desc: 'Multi-state compliance, tax documentation, SOX audit-ready', icon: FileText },
  ];

  const workflowSteps = [
    { step: 1, title: 'Client Pre-Qualification', desc: 'Verify client credentialing, budget, and contract terms', icon: CheckCircle },
    { step: 2, title: 'Professional Application', desc: 'Worker applies with resume, certifications, availability', icon: FileText },
    { step: 3, title: 'Background Check & Verification', desc: '3rd party background check, certificate expiry verification (48-72hrs)', icon: Award },
    { step: 4, title: 'Interview Scheduling', desc: 'Coordinate interview between worker and client hiring manager', icon: Calendar },
    { step: 5, title: 'Contract Negotiation', desc: 'Generate SOW, negotiate bill rate/pay rate, e-signature', icon: FileText },
    { step: 6, title: 'Start & Monitoring', desc: 'Track contract duration, performance reviews, renewal', icon: Briefcase },
  ];

  const roadmapItems = [
    { month: 'NOW 🚀', tasks: 'SMS Notifications (2-4 weeks), Pay Card Ready', active: true },
    { month: 'Q1 2026', tasks: 'Live for 50+ Person Companies', active: false },
    { month: 'Q3 2026', tasks: 'Professional Division Alpha', active: false },
    { month: 'Q4 2026', tasks: 'Contract Engine & AI Matching', active: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Professional Staffing Division"
          subtitle="ORBIT Professional Staffing handles high-value placements: nurses, accountants, engineers, consultants, and specialized professionals."
          breadcrumb={
            <Link href="/">
              <Button variant="ghost" className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 min-h-[44px] -ml-3" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          }
          actions={
            <div className="flex items-center gap-2 text-purple-300">
              <Lock className="w-5 h-5" />
              <span className="text-xs sm:text-sm">Coming Q3 2026 - Preview Mode</span>
            </div>
          }
        />

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8 bg-slate-800 border border-slate-700 p-1 gap-0">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 text-[10px] sm:text-xs lg:text-sm min-h-[40px]">Overview</TabsTrigger>
            <TabsTrigger value="workflow" className="data-[state=active]:bg-purple-600 text-[10px] sm:text-xs lg:text-sm min-h-[40px]">Workflow</TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-purple-600 text-[10px] sm:text-xs lg:text-sm min-h-[40px]">Features</TabsTrigger>
            <TabsTrigger value="specs" className="data-[state=active]:bg-purple-600 text-[10px] sm:text-xs lg:text-sm min-h-[40px]">Tech Specs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OrbitCard variant="glass" className="border-purple-600/50 p-6 md:p-8">
              <SectionHeader
                title="Professional Placement Model"
                size="md"
                className="mb-6"
              />
              
              <BentoGrid cols={2} gap="lg">
                <BentoTile className="p-6 border-purple-600/30">
                  <OrbitCardHeader icon={<Briefcase className="w-5 h-5 text-purple-400" />}>
                    <OrbitCardTitle>Supported Professions</OrbitCardTitle>
                  </OrbitCardHeader>
                  <OrbitCardContent>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>✓ Healthcare (RN, LPN, CNA, traveling nurses)</li>
                      <li>✓ Finance (CPA, accountant, bookkeeper)</li>
                      <li>✓ Engineering (software, civil, mechanical)</li>
                      <li>✓ Legal (paralegal, contract attorney)</li>
                      <li>✓ Tech (IT support, network admin, DBAs)</li>
                      <li>✓ Management (project manager, operations)</li>
                      <li>✓ Sales (enterprise, inside sales)</li>
                      <li>✓ Consulting (business analyst, strategist)</li>
                    </ul>
                  </OrbitCardContent>
                </BentoTile>

                <BentoTile className="p-6 border-purple-600/30">
                  <OrbitCardHeader icon={<DollarSign className="w-5 h-5 text-purple-400" />}>
                    <OrbitCardTitle>Economic Model</OrbitCardTitle>
                  </OrbitCardHeader>
                  <OrbitCardContent>
                    <div className="space-y-3 text-gray-300 text-sm">
                      <p><span className="font-semibold text-white">Margin: 30-35%</span> (vs. 15-20% general labor)</p>
                      <p><span className="font-semibold text-white">Contract Type:</span> W-2 or 1099 (client choice)</p>
                      <p><span className="font-semibold text-white">Payment Terms:</span> Net-15 to Net-30</p>
                      <p><span className="font-semibold text-white">Placement Rate:</span> 60-90 days (vs. same-day labor)</p>
                      <p><span className="font-semibold text-white">Annual Contract Value:</span> $80K-$250K+ per placement</p>
                    </div>
                  </OrbitCardContent>
                </BentoTile>
              </BentoGrid>
            </OrbitCard>

            <OrbitCard variant="glass" className="border-yellow-600/50 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-300 mb-2">Currently in Preview Mode</h3>
                  <p className="text-gray-300">This interface is a preview of coming functionality. Full professional staffing will be enabled in Version 2, including background checks, certification verification, interview scheduling, and contract generation.</p>
                </div>
              </div>
            </OrbitCard>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-6">
            <OrbitCard variant="glass" className="border-purple-600/50 p-6 md:p-8">
              <SectionHeader
                title="Professional Placement Workflow"
                size="md"
                className="mb-8"
              />
              
              <div className="space-y-6">
                {workflowSteps.map(({ step, title, desc, icon: Icon }) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white">
                        {step}
                      </div>
                      {step < 6 && <div className="w-1 h-12 bg-purple-600/30 mt-2" />}
                    </div>
                    <div className="pb-6">
                      <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                        <Icon className="w-4 h-4 text-purple-400" />
                        {title}
                      </h3>
                      <p className="text-gray-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </OrbitCard>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="hidden md:block">
              <BentoGrid cols={2} gap="md">
                {features.map(({ title, desc, icon: Icon }) => (
                  <BentoTile key={title} className="p-6 border-purple-600/30 hover:border-purple-600/60 transition-colors">
                    <Icon className="w-6 h-6 text-purple-400 mb-3" />
                    <h3 className="font-semibold text-white mb-2">{title}</h3>
                    <p className="text-gray-400 text-sm">{desc}</p>
                  </BentoTile>
                ))}
              </BentoGrid>
            </div>

            <div className="md:hidden">
              <CarouselRail
                title="Platform Features"
                subtitle="Swipe to explore"
                gap="md"
                itemWidth="lg"
              >
                {features.map(({ title, desc, icon: Icon }) => (
                  <CarouselRailItem key={title}>
                    <OrbitCard className="h-full border-purple-600/30 min-h-[160px]">
                      <Icon className="w-6 h-6 text-purple-400 mb-3" />
                      <h3 className="font-semibold text-white mb-2">{title}</h3>
                      <p className="text-gray-400 text-sm">{desc}</p>
                    </OrbitCard>
                  </CarouselRailItem>
                ))}
              </CarouselRail>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="space-y-6">
            <OrbitCard variant="glass" className="border-purple-600/50 p-6 md:p-8">
              <SectionHeader
                title="Backend Architecture (V2)"
                size="md"
                className="mb-6"
              />
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">New Database Tables</h3>
                  <BentoGrid cols={2} gap="sm">
                    {[
                      { name: 'workerCertifications', fields: 'certType, issuer, expiryDate, verificationStatus' },
                      { name: 'professionalContracts', fields: 'workerId, clientId, soW, billRate, payRate, terms, signature' },
                      { name: 'interviewSchedules', fields: 'candidateId, clientId, scheduledTime, interviewer, notes, decision' },
                      { name: 'backgroundChecks', fields: 'workerId, vendor, status, results, clearanceDate' },
                      { name: 'clientPreQualification', fields: 'clientId, verificationStatus, creditScore, maxBillingRate' },
                      { name: 'professionalJobs', fields: 'title, certRequired, minExperience, contractLength, billRate' },
                    ].map(({ name, fields }) => (
                      <BentoTile key={name} className="bg-slate-900 p-3 border-slate-700">
                        <p className="text-purple-300 font-mono text-sm">{name}</p>
                        <p className="text-xs text-gray-400">{fields}</p>
                      </BentoTile>
                    ))}
                  </BentoGrid>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-3">Third-Party Integrations</h3>
                  <div className="space-y-2 text-gray-300">
                    <p>✓ <span className="font-semibold">Checkr/Sterling</span> - Background check API</p>
                    <p>✓ <span className="font-semibold">DocuSign/HelloSign</span> - E-signature for contracts</p>
                    <p>✓ <span className="font-semibold">State License Databases</span> - Auto-verify certifications</p>
                    <p>✓ <span className="font-semibold">Stripe Connect</span> - Professional rate payments</p>
                    <p>✓ <span className="font-semibold">ADP/Guidepoint</span> - Enterprise payroll sync</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-3">API Endpoints (V2)</h3>
                  <div className="space-y-2 text-sm font-mono text-purple-300">
                    <p>POST /api/professional/worker/apply</p>
                    <p>GET /api/professional/certifications/:workerId</p>
                    <p>POST /api/professional/background-check/initiate</p>
                    <p>POST /api/professional/interview/schedule</p>
                    <p>POST /api/professional/contract/generate</p>
                    <p>GET /api/professional/contract/:contractId</p>
                  </div>
                </div>
              </div>
            </OrbitCard>
          </TabsContent>
        </Tabs>

        <div className="mt-12">
          <OrbitCard variant="glass" className="border-purple-600/50 p-6 md:p-8">
            <SectionHeader
              title="Feature Roadmap"
              size="md"
              className="mb-6"
            />
            
            <BentoGrid cols={4} gap="sm">
              {roadmapItems.map(({ month, tasks, active }) => (
                <BentoTile 
                  key={month} 
                  className={`p-4 ${active ? 'bg-gradient-to-br from-green-900/40 to-slate-900/30 border-green-600/50' : 'bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-600/30'}`}
                >
                  <p className={`font-semibold mb-2 ${active ? 'text-green-300' : 'text-purple-300'}`}>{month}</p>
                  <p className="text-sm text-gray-300">{tasks}</p>
                </BentoTile>
              ))}
            </BentoGrid>

            <div className="mt-8 pt-8 border-t border-slate-700">
              <SectionHeader
                title="Coming Very Soon"
                size="sm"
                className="mb-4"
              />
              <BentoGrid cols={2} gap="md">
                <BentoTile className="bg-green-900/10 border-green-600/30 p-6">
                  <p className="font-semibold text-green-300 mb-2">📱 SMS Notifications</p>
                  <p className="text-sm text-gray-300 mb-3">Real-time SMS alerts for shift offers, confirmations, reminders, and bonus updates. Waiting for Twilio approval - should be live in 2-4 weeks.</p>
                  <p className="text-xs text-green-400">Status: Pending Twilio Integration</p>
                </BentoTile>
                <BentoTile className="bg-blue-900/10 border-blue-600/30 p-6">
                  <p className="font-semibold text-blue-300 mb-2">💳 Instant Pay Card</p>
                  <p className="text-sm text-gray-300 mb-3">Fast worker payments via Stripe Connect. Workers can access earnings on-demand with minimal fees ($2.50 per transaction or 2.5%).</p>
                  <p className="text-xs text-blue-400">Status: Ready to integrate, depends on Stripe setup</p>
                </BentoTile>
              </BentoGrid>
              <p className="text-xs text-gray-400 mt-4">Both features will be rolled out once ORBIT meets 100% compliance and security standards for small businesses (50 or fewer employees).</p>
            </div>
          </OrbitCard>
        </div>

        <div className="mt-8 text-center">
          <Button disabled className="bg-gray-600 cursor-not-allowed px-8 py-6">
            <Lock className="w-4 h-4 mr-2" />
            Professional Division - Locked (V2 Preview)
          </Button>
          <p className="text-gray-400 mt-4 text-sm">
            This feature will be fully functional in Version 2. Current focus: Skilled Trades & Hospitality optimization.
          </p>
        </div>
      </div>
    </div>
  );
}
