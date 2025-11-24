import React from 'react';
import { ArrowRight, CheckCircle, Globe, Users, Zap, Lock, TrendingUp, Cpu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';

export default function ValueProposition() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Back Button */}
      <div className="px-4 py-4">
        <Link href="/">
          <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden px-3 sm:px-4 py-12 sm:py-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-transparent to-purple-600 blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Why ORBIT Staffing OS
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 px-2">
            A production-ready staffing platform that outpaces competitors like HubSpot, Guidepoint, and legacy systems
          </p>
        </div>
      </div>

      {/* Core Advantages */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-12 text-center">7 Systems. Zero Competitors.</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-8 sm:mb-12">
          <Card className="bg-slate-800 border-cyan-600/50 p-3 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">GPS-Verified Check-In</h3>
                <p className="text-xs sm:text-base text-gray-300">300-foot geofencing + real-time location capture. No time theft. No guesswork. Complete audit trail.</p>
                <p className="text-xs sm:text-sm text-cyan-400 mt-2">✓ Prevents $2.2B annual US time theft</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800 border-purple-600/50 p-6">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Multi-Tier Bonuses</h3>
                <p className="text-gray-300">Attendance, performance, referral, and milestone bonuses. Real-time calculations. Automatic payroll integration.</p>
                <p className="text-sm text-purple-400 mt-2">✓ 34% higher worker retention</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800 border-green-600/50 p-6">
            <div className="flex items-start gap-4">
              <Users className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Equipment Tracking</h3>
                <p className="text-gray-300">Real-time PPE inventory. 2-day return deadline. Auto-deductions for non-returns. Zero loss.</p>
                <p className="text-sm text-green-400 mt-2">✓ Saves 15-20% on replacement costs</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800 border-blue-600/50 p-6">
            <div className="flex items-start gap-4">
              <Lock className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Hallmark Traceability</h3>
                <p className="text-gray-300">Every paystub, invoice, contract gets blockchain-ready UPC + QR codes. Verifiable authenticity.</p>
                <p className="text-sm text-blue-400 mt-2">✓ Compliance-grade audit trail</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800 border-yellow-600/50 p-6">
            <div className="flex items-start gap-4">
              <Cpu className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Worker Availability Calendar</h3>
                <p className="text-gray-300">2-week smart scheduling. Heatmap visualization. AI-powered shift recommendations. Real-time sync.</p>
                <p className="text-sm text-yellow-400 mt-2">✓ 22% fewer no-shows</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800 border-pink-600/50 p-6">
            <div className="flex items-start gap-4">
              <Globe className="w-8 h-8 text-pink-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">One-Click Shifts</h3>
                <p className="text-gray-300">Workers accept/reject shifts instantly. Real-time tracking. No manual back-and-forth.</p>
                <p className="text-sm text-pink-400 mt-2">✓ 5x faster assignments</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Competitor Comparison */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">How We Compare</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
                <tr key={feature} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-medium">{feature}</td>
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
      </div>

      {/* Why ORBIT Wins */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">The ORBIT Advantage</h2>
        
        <div className="space-y-6">
          <div className="flex gap-4">
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Production-Ready</h3>
              <p className="text-gray-300">7 core systems fully operational. Zero beta features. Real data in real databases. Live right now.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">White-Label Ready</h3>
              <p className="text-gray-300">Your branding. Your company name. Your logo. Complete customization for franchisees.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Compliance Built-In</h3>
              <p className="text-gray-300">Multi-state compliance. Prevailing wage calculations. I-9 tracking. Audit-grade records.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Franchise Growth Model</h3>
              <p className="text-gray-300">Licensing model for regional managers. Revenue share options. Scalable from 1 to 1000+ franchises.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">V2 Roadmap</h3>
              <p className="text-gray-300">Q2 2026: SMS notifications, instant pay, skill verification, QA system, AI job matching.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Scale Your Staffing Business?</h2>
        <p className="text-xl text-gray-300 mb-8">
          ORBIT Staffing OS is built for franchisees, regional managers, and growth-focused agencies.
        </p>
        <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 px-8 py-6 text-lg">
          Schedule a Demo <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 py-8 text-center text-gray-400">
        <p>ORBIT Staffing OS © 2025 | Powered by ORBIT</p>
      </div>
    </div>
  );
}
