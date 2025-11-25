import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Lock, Zap, BarChart3, Users, Shield, Sparkles, ArrowRight } from "lucide-react";
import saturnLogo from "@assets/generated_images/pure_aqua_saturn_planet_on_transparency.png";

interface SidonieWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidonieWelcomeModal({ isOpen, onClose }: SidonieWelcomeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-cyan-500/30">
        <DialogHeader className="pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3 mb-3">
            <img src={saturnLogo} alt="ORBIT" className="w-10 h-10" />
            <DialogTitle className="text-2xl font-bold text-cyan-300">
              Welcome to ORBIT Staffing OS, Sidonie
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-300">
            Your administrative control center for a complete staffing ecosystem
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Security Notice */}
          <Card className="bg-violet-950/40 border border-violet-500/30">
            <CardHeader>
              <CardTitle className="text-violet-300 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                First Steps: Change Your PIN
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>✓ Your current PIN: <span className="font-mono font-bold text-violet-300">4444</span></p>
              <p>⚠️ Change this to a secure PIN you remember (4+ digits)</p>
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
                <ArrowRight className="w-5 h-5" />
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
