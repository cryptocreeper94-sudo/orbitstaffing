import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, DollarSign, MapPin, Users } from "lucide-react";

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
          <DialogTitle className="text-2xl text-cyan-300">Welcome to ORBIT, {employeeName}! 🎯</DialogTitle>
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
              <p>💰 Instant payroll processing</p>
              <p>🎁 Bonus opportunities</p>
              <p>📊 Real-time earnings dashboard</p>
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
              <p>📱 Download the ORBIT mobile app (iOS/Android)</p>
              <p>🔐 Biometric login for security</p>
              <p>📍 GPS-verified clock-in at job sites</p>
              <p>🔔 Real-time shift notifications</p>
            </CardContent>
          </Card>

          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-300">
              Questions? Contact your manager or support@orbitstaffing.io
            </p>
          </div>
        </div>

        <Button onClick={onClose} className="w-full bg-cyan-600 hover:bg-cyan-700" data-testid="button-employee-welcome-close">
          Ready to Work! 💪
        </Button>
      </DialogContent>
    </Dialog>
  );
}
