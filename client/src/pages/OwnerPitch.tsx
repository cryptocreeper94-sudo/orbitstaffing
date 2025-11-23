import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CheckCircle2, Users, TrendingUp, Share2 } from 'lucide-react';

export default function OwnerPitch() {
  return (
    <Shell>
      {/* Back Button */}
      <Button
        onClick={() => window.location.href = '/'}
        variant="outline"
        size="sm"
        className="mb-6"
        data-testid="button-back-admin"
      >
        ← Back to Admin
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading mb-2">Why Staffing Agencies Choose ORBIT</h1>
        <p className="text-muted-foreground">
          Automated platform trusted by growing agencies to save time, reduce costs, and scale operations
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-green-700/50 bg-green-900/10">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 mb-1">Time Saved/Month</p>
            <p className="text-2xl font-bold text-green-300">50+ Hours</p>
            <p className="text-xs text-gray-500 mt-1">Automation & manual work</p>
          </CardContent>
        </Card>

        <Card className="border-blue-700/50 bg-blue-900/10">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 mb-1">Cost Per Hire Reduction</p>
            <p className="text-2xl font-bold text-blue-300">$500-$2K</p>
            <p className="text-xs text-gray-500 mt-1">Vs traditional methods</p>
          </CardContent>
        </Card>

        <Card className="border-purple-700/50 bg-purple-900/10">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 mb-1">Worker Retention</p>
            <p className="text-2xl font-bold text-purple-300">+35%</p>
            <p className="text-xs text-gray-500 mt-1">Better UX & loyalty</p>
          </CardContent>
        </Card>

        <Card className="border-orange-700/50 bg-orange-900/10">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 mb-1">Satisfaction</p>
            <p className="text-2xl font-bold text-orange-300">95%+</p>
            <p className="text-xs text-gray-500 mt-1">NPS from users</p>
          </CardContent>
        </Card>
      </div>

      {/* ROI Calculator */}
      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Your ROI with ORBIT
          </CardTitle>
          <CardDescription>Based on 50-person staffing agency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Current Costs (Monthly)</p>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>Manual scheduling: $5,000</li>
                <li>Compliance tracking: $2,000</li>
                <li>Payroll processing: $1,500</li>
                <li className="border-t border-border/50 pt-1 mt-1 font-bold">Total: $8,500</li>
              </ul>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">ORBIT Cost (Monthly)</p>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>ORBIT Platform: $999</li>
                <li>Stripe/Payment fee: ~$200</li>
                <li>Drug test billing: $0</li>
                <li className="border-t border-border/50 pt-1 mt-1 font-bold">Total: $1,199</li>
              </ul>
            </div>

            <div className="bg-green-900/10 border border-green-700/50 rounded-lg p-4">
              <p className="text-sm text-green-300 font-bold mb-2">Monthly Savings</p>
              <p className="text-2xl font-bold text-green-300 mb-2">$7,301</p>
              <p className="text-xs text-green-300">= $87,612 / year</p>
            </div>
          </div>

          <div className="bg-blue-900/10 border border-blue-700/50 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              <strong>✓ Payback Period: 2-3 weeks</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            What You Get
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-foreground mb-3">Operations</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Automated job postings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Bulk worker management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Real-time payroll</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Automated invoicing</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-3">Compliance & Safety</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Background checks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Drug testing (5+ providers)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">GPS verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Workers comp automation</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="border-green-700/50 bg-green-900/10 mb-8">
        <CardHeader>
          <CardTitle>Simple Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-bold text-foreground mb-2">Starter</p>
              <p className="text-2xl font-bold text-green-300 mb-2">$499/mo</p>
              <p className="text-xs text-gray-400 mb-3">25-150 workers</p>
              <Button className="w-full bg-primary hover:bg-primary/90" data-testid="button-starter">
                Get Started
              </Button>
            </div>

            <div className="border border-green-700/50 rounded-lg p-4">
              <p className="text-sm font-bold text-foreground mb-2">Growth</p>
              <p className="text-2xl font-bold text-green-300 mb-2">$999/mo</p>
              <p className="text-xs text-gray-400 mb-3">150-500 workers</p>
              <Button className="w-full bg-primary hover:bg-primary/90" data-testid="button-growth">
                Get Started
              </Button>
            </div>

            <div>
              <p className="text-sm font-bold text-foreground mb-2">Enterprise</p>
              <p className="text-2xl font-bold text-green-300 mb-2">Custom</p>
              <p className="text-xs text-gray-400 mb-3">500+ workers</p>
              <Button variant="outline" className="w-full" data-testid="button-contact">
                Contact Sales
              </Button>
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-300">
              ✓ 14-day free trial • ✓ No credit card required
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Share */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share This Page
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-400">
            Share this page with other staffing agency owners:
          </p>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <p className="text-xs text-gray-300 break-all font-mono">
              {typeof window !== 'undefined' && window.location.origin}/owner-pitch
            </p>
          </div>
          <Button
            onClick={() => {
              const url = `${window.location.origin}/owner-pitch`;
              navigator.clipboard.writeText(url);
              alert('Link copied!');
            }}
            className="w-full bg-primary hover:bg-primary/90"
            data-testid="button-copy-link"
          >
            Copy Link
          </Button>
        </CardContent>
      </Card>
    </Shell>
  );
}
