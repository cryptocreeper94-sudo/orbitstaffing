import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Mail, Phone, CheckCircle2, Sparkles, Zap, Bot, Shield, BarChart3 } from "lucide-react";

interface V2SignupModalProps {
  triggerAfterSeconds?: number;
}

export function V2SignupModal({ triggerAfterSeconds = 30 }: V2SignupModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [contactMethod, setContactMethod] = useState<'email' | 'sms'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const hasSeenV2Signup = localStorage.getItem('hasSeenV2Signup');
    if (hasSeenV2Signup) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, triggerAfterSeconds * 1000);

    return () => clearTimeout(timer);
  }, [triggerAfterSeconds]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenV2Signup', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/v2-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactMethod,
          email: contactMethod === 'email' ? email : undefined,
          phone: contactMethod === 'sms' ? phone : undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        localStorage.setItem('hasSeenV2Signup', 'true');
        setTimeout(() => {
          setIsOpen(false);
        }, 3000);
      }
    } catch (err) {
      console.error('V2 signup failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 to-slate-950 border border-green-500/50">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-400 animate-pulse" />
            <h3 className="text-xl font-bold text-green-300">You're on the list!</h3>
            <p className="text-slate-400 text-center text-sm">
              We'll notify you when Version 2 features launch.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/40">
        <DialogHeader className="pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3 mb-2">
            <Rocket className="w-8 h-8 text-cyan-400 animate-bounce" />
            <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
              Version 2 Coming Soon!
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-300">
            Get early access to game-changing features
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>AI Job Matching</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Real-Time Alerts</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Remote Support</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Advanced Analytics</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setContactMethod('email')}
                className={`flex-1 ${contactMethod === 'email' 
                  ? 'bg-cyan-600 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                data-testid="button-contact-email"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                type="button"
                onClick={() => setContactMethod('sms')}
                className={`flex-1 ${contactMethod === 'sms' 
                  ? 'bg-cyan-600 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                data-testid="button-contact-sms"
              >
                <Phone className="w-4 h-4 mr-2" />
                SMS
              </Button>
            </div>

            {contactMethod === 'email' ? (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                  data-testid="input-v2-email"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                  data-testid="input-v2-phone"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || (contactMethod === 'email' ? !email : !phone)}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3"
              data-testid="button-v2-signup-submit"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Signing up...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Rocket className="w-4 h-4" />
                  Get Early Access
                </span>
              )}
            </Button>
          </form>

          <p className="text-xs text-slate-500 text-center">
            No spam. We'll only notify you about V2 launch and major updates.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
