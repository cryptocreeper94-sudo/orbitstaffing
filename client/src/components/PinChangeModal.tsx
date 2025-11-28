import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, CheckCircle2, AlertCircle, Shield, TrendingUp, Zap } from "lucide-react";

interface PinChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  adminName: string;
}

export function PinChangeModal({ isOpen, onClose, onSkip, adminName }: PinChangeModalProps) {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    if (newPin.length > 8) {
      setError('PIN cannot exceed 8 digits');
      return;
    }

    if (!/^\d+$/.test(newPin)) {
      setError('PIN must contain only numbers');
      return;
    }

    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (newPin === '4444') {
      setError('Please choose a different PIN than the default');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/change-admin-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPin, adminName }),
      });

      if (res.ok) {
        setSuccess(true);
        localStorage.setItem('sidonieChangedPin', 'true');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to change PIN');
      }
    } catch (err) {
      setError('Failed to change PIN. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('sidonieSkippedPinChange', 'true');
    onSkip();
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-slate-950 border border-green-500/30">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-400 animate-pulse" />
            <h3 className="text-xl font-bold text-green-300">PIN Changed Successfully!</h3>
            <p className="text-slate-400 text-center">
              Your new PIN is now active. Use it to log in next time.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-950 border border-cyan-500/30">
        <DialogHeader className="pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <DialogTitle className="text-2xl font-bold text-cyan-300">
              Secure Your Account
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-300">
            Welcome, {adminName}! For security, please set a new personal PIN.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-200 font-semibold text-sm">First-Time Login</p>
                <p className="text-slate-400 text-xs mt-1">
                  Your current PIN (4444) is the default. Please choose a unique PIN that only you know.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPin" className="text-slate-300">New PIN (4-8 digits)</Label>
              <Input
                id="newPin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter new PIN"
                className="bg-slate-900 border-slate-700 text-white text-center text-lg tracking-widest"
                data-testid="input-new-pin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPin" className="text-slate-300">Confirm PIN</Label>
              <Input
                id="confirmPin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Confirm new PIN"
                className="bg-slate-900 border-slate-700 text-white text-center text-lg tracking-widest"
                data-testid="input-confirm-pin"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 p-3 rounded-lg border border-red-500/30">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              className="flex-1 border-slate-600 text-slate-400 hover:bg-slate-800"
              data-testid="button-skip-pin-change"
            >
              Skip for Now
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || newPin.length < 4}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
              data-testid="button-save-new-pin"
            >
              {isSubmitting ? 'Saving...' : 'Save New PIN'}
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            You can also change your PIN later from Settings.
          </p>
        </form>

        {/* ISO 20022 Enterprise Roadmap Info */}
        <div className="border-t border-slate-700/50 pt-4 mt-4">
          <div className="bg-blue-950/40 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 font-semibold text-sm">Enterprise Roadmap: ISO 20022 Banking</p>
                <p className="text-slate-400 text-xs mt-2">
                  Coming Q3-Q4 2026: Direct bank integration, Fortune 500 payroll processing, and SWIFT network connectivity. Enterprise credibility tier: $5K-10K/mo.
                </p>
                <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  See docs/ISO_20022_IMPLEMENTATION.md for full details
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
