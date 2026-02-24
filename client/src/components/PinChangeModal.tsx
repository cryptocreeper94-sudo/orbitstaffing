import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, CheckCircle2, AlertCircle, Shield, Mail, Eye, EyeOff, Check, X } from "lucide-react";

interface PinChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  adminName: string;
}

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="w-3 h-3 text-emerald-400" />
      ) : (
        <X className="w-3 h-3 text-slate-500" />
      )}
      <span className={met ? 'text-emerald-300' : 'text-slate-500'}>{label}</span>
    </div>
  );
}

export function PinChangeModal({ isOpen, onClose, onSkip, adminName }: PinChangeModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasCapital = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const allValid = hasMinLength && hasCapital && hasSpecial && passwordsMatch && isValidEmail;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail) {
      setError('Please enter a valid email address');
      return;
    }

    if (!hasMinLength) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!hasCapital) {
      setError('Password must contain at least 1 capital letter');
      return;
    }

    if (!hasSpecial) {
      setError('Password must contain at least 1 special character');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/setup-partner-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, adminName }),
      });

      if (res.ok) {
        setSuccess(true);
        localStorage.setItem(`${adminName.replace(/\s/g, '_')}_accountSetup`, 'true');
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create account');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(`${adminName.replace(/\s/g, '_')}_skippedAccountSetup`, 'true');
    onSkip();
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-slate-950 border border-emerald-500/30">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-pulse" />
            <h3 className="text-xl font-bold text-emerald-300">Account Created!</h3>
            <p className="text-slate-400 text-center text-sm">
              Your permanent login has been set up. Use your email and password to log in next time.
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
              Create Your Account
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-300">
            Welcome, {adminName}! Set up your permanent login credentials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-200 font-semibold text-sm">First-Time Setup Required</p>
                <p className="text-slate-400 text-xs mt-1">
                  Your temporary PIN will be replaced with a permanent email and password login.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="your@email.com"
                className="bg-slate-900 border-slate-700 text-white"
                data-testid="input-setup-email"
              />
              {email && !isValidEmail && (
                <p className="text-xs text-amber-400">Please enter a valid email</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Create a strong password"
                  className="bg-slate-900 border-slate-700 text-white pr-10"
                  data-testid="input-setup-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password && (
                <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 space-y-1.5">
                  <PasswordRule met={hasMinLength} label="At least 8 characters" />
                  <PasswordRule met={hasCapital} label="At least 1 capital letter" />
                  <PasswordRule met={hasSpecial} label="At least 1 special character (!@#$%...)" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Confirm your password"
                  className="bg-slate-900 border-slate-700 text-white pr-10"
                  data-testid="input-setup-confirm-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  data-testid="button-toggle-confirm"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-400">Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Passwords match
                </p>
              )}
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
              data-testid="button-skip-account-setup"
            >
              Skip for Now
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !allValid}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-40"
              data-testid="button-create-account"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            Your email and password will replace the temporary PIN for all future logins.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
