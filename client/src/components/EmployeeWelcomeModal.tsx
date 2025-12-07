import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, DollarSign, MapPin, Users } from "lucide-react";

const ICON_MAP: Record<string, string> = {
  "🎯": "/icons/pro/3d_target_goal_icon_clean.png",
  "💰": "/icons/pro/3d_money_pay_icon_clean.png",
  "🎁": "/icons/pro/3d_diamond_gem_icon_clean.png",
  "📊": "/icons/pro/3d_chart_reports_icon_clean.png",
  "📱": "/icons/pro/3d_smartphone_mobile_icon_clean.png",
  "📍": "/icons/pro/3d_gps_location_icon_clean.png",
  "🔔": "/icons/pro/3d_megaphone_announce_icon_clean.png",
  "💪": "/icons/pro/3d_trophy_winner_icon_clean.png",
};

function Icon3D({ emoji, size = "sm" }: { emoji: string; size?: "sm" | "md" | "lg" }) {
  const iconPath = ICON_MAP[emoji];
  const sizeClasses = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  if (iconPath) {
    return <img src={`${iconPath}?v=3`} alt="" className={`${sizeClasses[size]} inline-block object-contain mr-1 drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]`} />;
  }
  return <span>{emoji}</span>;
}

interface EmployeeWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName?: string;
}

export function EmployeeWelcomeModal({ isOpen, onClose, employeeName = "Team Member" }: EmployeeWelcomeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-cyan-300 flex items-center gap-2">Welcome to ORBIT, {employeeName}! <Icon3D emoji="🎯" size="md" /></DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="bg-cyan-950/40 border border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <p>✓ View available shifts and assignments</p>
              <p>✓ Accept or reject shifts instantly</p>
              <p>✓ Track your earnings in real-time</p>
              <p>✓ Clock in/out with GPS verification</p>
            </CardContent>
          </Card>

          <Card className="bg-green-950/40 border border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-300 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Earn & Track
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <p className="flex items-center gap-2"><Icon3D emoji="💰" /> Instant payroll processing</p>
              <p className="flex items-center gap-2"><Icon3D emoji="🎁" /> Bonus opportunities</p>
              <p className="flex items-center gap-2"><Icon3D emoji="📊" /> Real-time earnings dashboard</p>
            </CardContent>
          </Card>

          <Card className="bg-amber-950/40 border border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-amber-300 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Mobile Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <p className="flex items-center gap-2"><Icon3D emoji="📱" /> Download the ORBIT mobile app (iOS/Android)</p>
              <p>🔐 Biometric login for security</p>
              <p className="flex items-center gap-2"><Icon3D emoji="📍" /> GPS-verified clock-in at job sites</p>
              <p className="flex items-center gap-2"><Icon3D emoji="🔔" /> Real-time shift notifications</p>
            </CardContent>
          </Card>

          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-300">
              Questions? Contact your manager or support@orbitstaffing.io
            </p>
          </div>
        </div>

        <Button onClick={onClose} className="w-full bg-cyan-600 hover:bg-cyan-700 flex items-center justify-center gap-2" data-testid="button-employee-welcome-close">
          Ready to Work! <Icon3D emoji="💪" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
