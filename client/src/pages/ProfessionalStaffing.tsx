import React, { useState } from 'react';
import { Lock, Users, FileText, Calendar, CheckCircle, Briefcase, Award, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfessionalStaffing() {
  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4 md:p-8">
      {/* Header with Lock Badge */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-purple-400" />
          <div>
            <h1 className="text-4xl font-bold text-white">Professional Staffing Division</h1>
            <p className="text-sm text-purple-300 mt-1">Coming in Version 2 (Q3 2026) - Preview Mode</p>
          </div>
        </div>
        <p className="text-gray-300 mb-6">
          ORBIT Professional Staffing handles high-value placements: nurses, accountants, engineers, consultants, and specialized professionals.
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 bg-slate-800 border border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 text-xs md:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="workflow" className="data-[state=active]:bg-purple-600 text-xs md:text-sm">Workflow</TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-purple-600 text-xs md:text-sm">Features</TabsTrigger>
            <TabsTrigger value="specs" className="data-[state=active]:bg-purple-600 text-xs md:text-sm">Tech Specs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-slate-800 border-purple-600/50 p-8">
              <h2 className="text-2xl font-bold mb-6 text-purple-300">Professional Placement Model</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-purple-400" />
                    Supported Professions
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>✓ Healthcare (RN, LPN, CNA, traveling nurses)</li>
                    <li>✓ Finance (CPA, accountant, bookkeeper)</li>
                    <li>✓ Engineering (software, civil, mechanical)</li>
                    <li>✓ Legal (paralegal, contract attorney)</li>
                    <li>✓ Tech (IT support, network admin, DBAs)</li>
                    <li>✓ Management (project manager, operations)</li>
                    <li>✓ Sales (enterprise, inside sales)</li>
                    <li>✓ Consulting (business analyst, strategist)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    Economic Model
                  </h3>
                  <div className="space-y-3 text-gray-300">
                    <p><span className="font-semibold text-white">Margin: 30-35%</span> (vs. 15-20% general labor)</p>
                    <p><span className="font-semibold text-white">Contract Type:</span> W-2 or 1099 (client choice)</p>
                    <p><span className="font-semibold text-white">Payment Terms:</span> Net-15 to Net-30</p>
                    <p><span className="font-semibold text-white">Placement Rate:</span> 60-90 days (vs. same-day labor)</p>
                    <p><span className="font-semibold text-white">Annual Contract Value:</span> $80K-$250K+ per placement</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800 border-yellow-600/50 p-8">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-300 mb-2">Currently in Preview Mode</h3>
                  <p className="text-gray-300">This interface is a preview of coming functionality. Full professional staffing will be enabled in Version 2, including background checks, certification verification, interview scheduling, and contract generation.</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="space-y-6">
            <Card className="bg-slate-800 border-purple-600/50 p-8">
              <h2 className="text-2xl font-bold mb-8 text-purple-300">Professional Placement Workflow</h2>
              
              <div className="space-y-6">
                {[
                  { step: 1, title: 'Client Pre-Qualification', desc: 'Verify client credentialing, budget, and contract terms', icon: CheckCircle },
                  { step: 2, title: 'Professional Application', desc: 'Worker applies with resume, certifications, availability', icon: FileText },
                  { step: 3, title: 'Background Check & Verification', desc: '3rd party background check, certificate expiry verification (48-72hrs)', icon: Award },
                  { step: 4, title: 'Interview Scheduling', desc: 'Coordinate interview between worker and client hiring manager', icon: Calendar },
                  { step: 5, title: 'Contract Negotiation', desc: 'Generate SOW, negotiate bill rate/pay rate, e-signature', icon: FileText },
                  { step: 6, title: 'Start & Monitoring', desc: 'Track contract duration, performance reviews, renewal', icon: Briefcase },
                ].map(({ step, title, desc, icon: Icon }) => (
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
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'Certification Management', desc: 'Track licenses, degrees, certifications with auto-expiry alerts', icon: Award },
                { title: 'Background Checks', desc: 'Integrated with Checkr/Sterling for background verification', icon: CheckCircle },
                { title: 'Interview Coordination', desc: 'Schedule and record interviews with hiring managers', icon: Calendar },
                { title: 'Contract Engine', desc: 'Auto-generate SOWs with terms, rates, compliance clauses', icon: FileText },
                { title: 'Rate Negotiation', desc: 'Bill rate vs. pay rate calculator with margin tracking', icon: DollarSign },
                { title: 'Client Credentialing', desc: 'Verify client eligibility for professional placements', icon: Users },
                { title: 'Performance Reviews', desc: 'Track worker and client satisfaction throughout engagement', icon: CheckCircle },
                { title: 'Contract Compliance', desc: 'Multi-state compliance, tax documentation, SOX audit-ready', icon: FileText },
              ].map(({ title, desc, icon: Icon }) => (
                <Card key={title} className="bg-slate-800 border-purple-600/30 p-6 hover:border-purple-600/60 transition-colors">
                  <Icon className="w-6 h-6 text-purple-400 mb-3" />
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm">{desc}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tech Specs Tab */}
          <TabsContent value="specs" className="space-y-6">
            <Card className="bg-slate-800 border-purple-600/50 p-8">
              <h2 className="text-2xl font-bold mb-6 text-purple-300">Backend Architecture (V2)</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">New Database Tables</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300 font-mono">
                    <div className="bg-slate-900 p-3 rounded border border-slate-700">
                      <p className="text-purple-300">workerCertifications</p>
                      <p className="text-xs">certType, issuer, expiryDate, verificationStatus</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-700">
                      <p className="text-purple-300">professionalContracts</p>
                      <p className="text-xs">workerId, clientId, soW, billRate, payRate, terms, signature</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-700">
                      <p className="text-purple-300">interviewSchedules</p>
                      <p className="text-xs">candidateId, clientId, scheduledTime, interviewer, notes, decision</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-700">
                      <p className="text-purple-300">backgroundChecks</p>
                      <p className="text-xs">workerId, vendor, status, results, clearanceDate</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-700">
                      <p className="text-purple-300">clientPreQualification</p>
                      <p className="text-xs">clientId, verificationStatus, creditScore, maxBillingRate</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-700">
                      <p className="text-purple-300">professionalJobs</p>
                      <p className="text-xs">title, certRequired, minExperience, contractLength, billRate</p>
                    </div>
                  </div>
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
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Timeline */}
      <div className="max-w-6xl mx-auto mt-12">
        <Card className="bg-slate-800 border-purple-600/50 p-8">
          <h2 className="text-2xl font-bold mb-6 text-purple-300">Feature Roadmap</h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { month: 'NOW 🚀', tasks: 'SMS Notifications (2-4 weeks), Pay Card Ready' },
              { month: 'Q1 2026', tasks: 'Live for 50+ Person Companies' },
              { month: 'Q3 2026', tasks: 'Professional Division Alpha' },
              { month: 'Q4 2026', tasks: 'Contract Engine & AI Matching' },
            ].map(({ month, tasks }) => (
              <div key={month} className={`${month === 'NOW 🚀' ? 'bg-gradient-to-br from-green-900/40 to-slate-900/30 border-green-600/50' : 'bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-600/30'} border rounded-lg p-4`}>
                <p className={`font-semibold mb-2 ${month === 'NOW 🚀' ? 'text-green-300' : 'text-purple-300'}`}>{month}</p>
                <p className="text-sm text-gray-300">{tasks}</p>
              </div>
            ))}
          </div>

          {/* SMS & Pay Card Details */}
          <div className="mt-8 pt-8 border-t border-slate-700">
            <h3 className="text-lg font-semibold text-green-300 mb-4">Coming Very Soon</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-900/10 border border-green-600/30 rounded-lg p-6">
                <p className="font-semibold text-green-300 mb-2">📱 SMS Notifications</p>
                <p className="text-sm text-gray-300 mb-3">Real-time SMS alerts for shift offers, confirmations, reminders, and bonus updates. Waiting for Twilio approval - should be live in 2-4 weeks.</p>
                <p className="text-xs text-green-400">Status: Pending Twilio Integration</p>
              </div>
              <div className="bg-blue-900/10 border border-blue-600/30 rounded-lg p-6">
                <p className="font-semibold text-blue-300 mb-2">💳 Instant Pay Card</p>
                <p className="text-sm text-gray-300 mb-3">Fast worker payments via Stripe Connect. Workers can access earnings on-demand with minimal fees ($2.50 per transaction or 2.5%).</p>
                <p className="text-xs text-blue-400">Status: Ready to integrate, depends on Stripe setup</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">Both features will be rolled out once ORBIT meets 100% compliance and security standards for small businesses (50 or fewer employees).</p>
          </div>
        </Card>
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto mt-8 text-center">
        <Button disabled className="bg-gray-600 cursor-not-allowed px-8 py-6">
          <Lock className="w-4 h-4 mr-2" />
          Professional Division - Locked (V2 Preview)
        </Button>
        <p className="text-gray-400 mt-4 text-sm">
          This feature will be fully functional in Version 2. Current focus: Skilled Trades & Hospitality optimization.
        </p>
      </div>
    </div>
  );
}
