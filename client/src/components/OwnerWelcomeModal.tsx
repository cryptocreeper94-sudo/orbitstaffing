import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Users, BarChart3, Zap } from "lucide-react";

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
          <DialogTitle className="text-2xl text-purple-300">Welcome to ORBIT, {companyName}! 🚀</DialogTitle>
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
              <p>💳 Process payroll instantly</p>
              <p>📊 Generate invoices automatically</p>
              <p>💰 Track revenue and expenses</p>
              <p>📈 Real-time profitability dashboard</p>
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
              <p>🎯 Real-time dashboard</p>
              <p>📱 Mobile app for workforce</p>
              <p>🔐 Secure data & compliance</p>
              <p>🎁 Bonus & incentive management</p>
            </CardContent>
          </Card>

          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-300">
              Setup complete! Start by creating your first worker and posting a job.
            </p>
          </div>
        </div>

        <Button onClick={onClose} className="w-full bg-purple-600 hover:bg-purple-700" data-testid="button-owner-welcome-close">
          Start Managing 📋
        </Button>
      </DialogContent>
    </Dialog>
  );
}
