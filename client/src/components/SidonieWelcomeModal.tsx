import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Lock, Zap, Users, Shield, Sparkles, Rocket, Bot, MapPin, DollarSign, Calendar, FileCheck, Globe } from "lucide-react";

interface SidonieWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidonieWelcomeModal({ isOpen, onClose }: SidonieWelcomeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-cyan-500/30">
        <DialogHeader className="pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            <DialogTitle className="text-3xl font-bold text-cyan-300">
              🎉 Welcome Back, Sidonie!
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-300 text-lg">
            Major Updates: 100% Automation System Now Live!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* BIG NEWS - 100% Automation */}
          <Card className="bg-gradient-to-br from-green-950/60 to-emerald-950/60 border border-green-500/50 shadow-lg shadow-green-500/20">
            <CardHeader>
              <CardTitle className="text-green-300 flex items-center gap-2 text-xl">
                <Rocket className="w-6 h-6" />
                🚀 BREAKTHROUGH: 100% Automation Achieved!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-green-100 font-semibold text-lg">
                Zero manual intervention from customer request → worker payment!
              </p>
              <div className="bg-slate-900/50 rounded-lg p-4 space-y-2 text-sm">
                <p className="text-slate-300">✅ Customer creates request</p>
                <p className="text-slate-300">✅ AI auto-matches top workers</p>
                <p className="text-slate-300">✅ Workers notified instantly (SMS + in-app)</p>
                <p className="text-slate-300">✅ Onboarding deadlines enforced automatically</p>
                <p className="text-slate-300">✅ GPS clock-ins create timesheets</p>
                <p className="text-slate-300">✅ Timesheets auto-approve when valid</p>
                <p className="text-slate-300">✅ Payroll runs on schedule (no admin needed)</p>
                <p className="text-slate-300">✅ Paystubs generated & workers notified</p>
                <p className="text-green-400 font-bold mt-2">🎯 Runs 24/7 - Completely hands-free!</p>
              </div>
            </CardContent>
          </Card>

          {/* What's New Section */}
          <Card className="bg-cyan-950/40 border border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300 flex items-center gap-2 text-xl">
                <Sparkles className="w-6 h-6" />
                What's New Since Your Last Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Worker Matching Engine */}
                <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                    <Bot className="w-5 h-5" />
                    AI Worker Matching
                  </div>
                  <p className="text-sm text-slate-300">
                    5-criteria scoring algorithm auto-matches workers:
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 pl-4">
                    <li>• Skills match (40 points)</li>
                    <li>• Availability (20 points)</li>
                    <li>• Insurance status (15 points)</li>
                    <li>• Location proximity (15 points)</li>
                    <li>• Experience level (10 points)</li>
                  </ul>
                </div>

                {/* GPS Automation */}
                <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-green-300 font-semibold">
                    <MapPin className="w-5 h-5" />
                    GPS → Timesheet Automation
                  </div>
                  <p className="text-sm text-slate-300">
                    Workers clock in/out with GPS verification
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 pl-4">
                    <li>• 300ft geofence validation</li>
                    <li>• Auto-creates timesheet entries</li>
                    <li>• Auto-approves when GPS verified</li>
                    <li>• Flags edge cases for review</li>
                  </ul>
                </div>

                {/* Automated Payroll */}
                <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                    <DollarSign className="w-5 h-5" />
                    Automated Payroll Scheduler
                  </div>
                  <p className="text-sm text-slate-300">
                    Payroll runs automatically on pay day
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 pl-4">
                    <li>• Daily background job</li>
                    <li>• Configurable pay schedule</li>
                    <li>• 2025 tax calculations (TN/KY)</li>
                    <li>• PDF paystubs with hallmark</li>
                  </ul>
                </div>

                {/* Onboarding Enforcement */}
                <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold">
                    <Calendar className="w-5 h-5" />
                    Onboarding Deadlines
                  </div>
                  <p className="text-sm text-slate-300">
                    Automatic deadline enforcement
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 pl-4">
                    <li>• 3 business days for application</li>
                    <li>• 1 business day after assignment</li>
                    <li>• Auto-reassigns if incomplete</li>
                    <li>• Hourly background checks</li>
                  </ul>
                </div>

                {/* CSA System */}
                <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-purple-300 font-semibold">
                    <FileCheck className="w-5 h-5" />
                    CSA Digital Signing
                  </div>
                  <p className="text-sm text-slate-300">
                    Complete customer agreements system
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 pl-4">
                    <li>• 1.45x transparent markup</li>
                    <li>• Electronic signatures</li>
                    <li>• Version control</li>
                    <li>• Payment terms (Net 7/15/30)</li>
                  </ul>
                </div>

                {/* OAuth Integration */}
                <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-blue-300 font-semibold">
                    <Globe className="w-5 h-5" />
                    OAuth Connection Wizard
                  </div>
                  <p className="text-sm text-slate-300">
                    Connect 16 business systems
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 pl-4">
                    <li>• QuickBooks, ADP, Paychex</li>
                    <li>• Stripe, Square, PayPal</li>
                    <li>• Multi-step wizard UI</li>
                    <li>• Secure token management</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dual Referral Systems */}
          <Card className="bg-yellow-950/40 border border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-yellow-300 flex items-center gap-2">
                <Users className="w-5 h-5" />
                💰 Dual Referral Bonus Systems
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-200 font-semibold">Worker-to-Worker: $100 Bonus</p>
                  <p className="text-slate-400 text-xs">Paid after referred worker completes 40 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-200 font-semibold">Public Referrals: $50 Bonus</p>
                  <p className="text-slate-400 text-xs">Anyone can refer workers for $50 after 80 hours (viral marketing!)</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Payment via Venmo, CashApp, or Zelle</p>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="bg-violet-950/40 border border-violet-500/30">
            <CardHeader>
              <CardTitle className="text-violet-300 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                🔐 Security Reminder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>✓ Your current PIN: <span className="font-mono font-bold text-violet-300">4444</span></p>
              <p>⚠️ Recommended: Change to a secure PIN you'll remember</p>
              <p>🔐 Dev team has emergency override access if needed</p>
            </CardContent>
          </Card>

          {/* How To Use */}
          <Card className="bg-cyan-950/40 border border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                How to Use ORBIT Sandbox
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <h4 className="font-semibold text-cyan-200 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Staffing Operations
                  </h4>
                  <ul className="space-y-1 text-slate-300 pl-6">
                    <li>✓ Create and manage workers</li>
                    <li>✓ Post jobs and assignments</li>
                    <li>✓ Schedule worker availability</li>
                    <li>✓ Track assignments in real-time</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-cyan-200 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Financial Management
                  </h4>
                  <ul className="space-y-1 text-slate-300 pl-6">
                    <li>✓ Process payroll instantly</li>
                    <li>✓ Calculate worker bonuses</li>
                    <li>✓ Generate invoices</li>
                    <li>✓ Track revenue & expenses</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version 2 Roadmap */}
          <Card className="bg-amber-950/40 border border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-amber-300 flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Coming in Version 2.0 (Q1 2025)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-amber-200">SMS Notifications</h5>
                    <p className="text-xs text-slate-400">Real-time shift updates via SMS</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-amber-200">Mobile App</h5>
                    <p className="text-xs text-slate-400">iOS & Android with GPS verification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-amber-200">Stripe Payouts</h5>
                    <p className="text-xs text-slate-400">Instant worker payments</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-amber-200">Blockchain Hallmarks</h5>
                    <p className="text-xs text-slate-400">Secure asset verification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-amber-200">Equipment Tracking</h5>
                    <p className="text-xs text-slate-400">PPE management & auto-deduction</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-amber-200">Advanced Analytics</h5>
                    <p className="text-xs text-slate-400">Detailed workforce intelligence</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card className="bg-green-950/40 border border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-300 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Key Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-slate-300">
                <p>✓ <span className="text-green-200 font-semibold">Multi-tenant white-label</span> - Supports unlimited franchises</p>
                <p>✓ <span className="text-green-200 font-semibold">Complete compliance</span> - State-specific rules, I-9 tracking, prevailing wage</p>
                <p>✓ <span className="text-green-200 font-semibold">Real-time dashboard</span> - See all operations at a glance</p>
                <p>✓ <span className="text-green-200 font-semibold">100% secure</span> - Encrypted data, RBAC, audit trails</p>
                <p>✓ <span className="text-green-200 font-semibold">ORBIT Hallmark</span> - Unique asset number on all outputs</p>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-300 mb-3">
              Ready to explore? Start by creating a test company and staffing a demo assignment.
            </p>
            <p className="text-xs text-slate-500">
              Questions? Email: support@orbitstaffing.net | Docs: https://orbitstaffing.net/docs
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-700">
          <Button
            onClick={onClose}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
            data-testid="button-close-welcome"
          >
            Let's Go! 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
