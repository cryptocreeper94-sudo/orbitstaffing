import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Users, BarChart3, Zap } from "lucide-react";

const ICON_MAP: Record<string, string> = {
  "🚀": "/icons/pro/3d_lightning_bolt_icon_clean.png",
  "💳": "/icons/pro/3d_credit_card_icon_clean.png",
  "📊": "/icons/pro/3d_chart_reports_icon_clean.png",
  "💰": "/icons/pro/3d_money_pay_icon_clean.png",
  "📈": "/icons/pro/3d_chart_reports_icon_clean.png",
  "🎯": "/icons/pro/3d_target_goal_icon_clean.png",
  "📱": "/icons/pro/3d_smartphone_mobile_icon_clean.png",
  "🎁": "/icons/pro/3d_diamond_gem_icon_clean.png",
  "📋": "/icons/pro/3d_clipboard_worker_icon_clean.png",
};

function Icon3D({ emoji, size = "sm" }: { emoji: string; size?: "sm" | "md" | "lg" }) {
  const iconPath = ICON_MAP[emoji];
  const sizeClasses = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  if (iconPath) {
    return <img src={`${iconPath}?v=3`} alt="" className={`${sizeClasses[size]} inline-block object-contain mr-1 drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]`} />;
  }
  return <span>{emoji}</span>;
}

interface OwnerWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName?: string;
}

export function OwnerWelcomeModal({ isOpen, onClose, companyName = "Company" }: OwnerWelcomeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-purple-300 flex items-center gap-2">Welcome to ORBIT, {companyName}! <Icon3D emoji="🚀" size="md" /></DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="bg-purple-950/40 border border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Build Your Workforce
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <p>✓ Create and manage worker profiles</p>
              <p>✓ Post jobs and post to talent network</p>
              <p>✓ Assign workers to projects</p>
              <p>✓ Track availability and scheduling</p>
            </CardContent>
          </Card>

          <Card className="bg-green-950/40 border border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-300 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Financial Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <p className="flex items-center gap-2"><Icon3D emoji="💳" /> Process payroll instantly</p>
              <p className="flex items-center gap-2"><Icon3D emoji="📊" /> Generate invoices automatically</p>
              <p className="flex items-center gap-2"><Icon3D emoji="💰" /> Track revenue and expenses</p>
              <p className="flex items-center gap-2"><Icon3D emoji="📈" /> Real-time profitability dashboard</p>
            </CardContent>
          </Card>

          <Card className="bg-cyan-950/40 border border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <p className="flex items-center gap-2"><Icon3D emoji="🎯" /> Real-time dashboard</p>
              <p className="flex items-center gap-2"><Icon3D emoji="📱" /> Mobile app for workforce</p>
              <p>🔐 Secure data & compliance</p>
              <p className="flex items-center gap-2"><Icon3D emoji="🎁" /> Bonus & incentive management</p>
            </CardContent>
          </Card>

          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-300">
              Setup complete! Start by creating your first worker and posting a job.
            </p>
          </div>
        </div>

        <Button onClick={onClose} className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2" data-testid="button-owner-welcome-close">
          Start Managing <Icon3D emoji="📋" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
