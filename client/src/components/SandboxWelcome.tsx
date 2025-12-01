import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FlaskConical, Compass, Sparkles, Play, ArrowRight } from 'lucide-react';
import { useMode } from '@/contexts/ModeContext';

const WELCOME_SEEN_KEY = 'orbit_sandbox_welcome_seen';

interface SandboxWelcomeProps {
  userName?: string;
  userRole?: string;
  onStartTour?: () => void;
}

export function SandboxWelcome({ userName, userRole, onStartTour }: SandboxWelcomeProps) {
  const { isSandbox } = useMode();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isSandbox) {
      const hasSeenWelcome = sessionStorage.getItem(WELCOME_SEEN_KEY);
      if (!hasSeenWelcome) {
        const timer = setTimeout(() => setIsOpen(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isSandbox]);

  const handleClose = () => {
    sessionStorage.setItem(WELCOME_SEEN_KEY, 'true');
    setIsOpen(false);
  };

  const handleStartTour = () => {
    sessionStorage.setItem(WELCOME_SEEN_KEY, 'true');
    setIsOpen(false);
    onStartTour?.();
  };

  if (!isSandbox) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 border-cyan-500/30 max-w-md" data-testid="sandbox-welcome-dialog">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
            <FlaskConical className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            Welcome to Sandbox Mode
            {userName && <span className="text-cyan-400">, {userName}</span>}!
          </DialogTitle>
          <DialogDescription className="text-gray-300 mt-2">
            {userRole && (
              <span className="inline-block px-3 py-1 bg-cyan-500/20 rounded-full text-cyan-300 text-sm mb-3">
                {userRole}
              </span>
            )}
            <br />
            You're now in a safe training environment with demo data. 
            Nothing you do here will affect real records.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-white font-medium text-sm">Demo Data Active</div>
              <div className="text-gray-400 text-xs">Sample workers, clients, and jobs are loaded</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <Compass className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-white font-medium text-sm">Safe to Explore</div>
              <div className="text-gray-400 text-xs">Try any feature - changes won't affect production</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-6">
          {onStartTour && (
            <Button 
              onClick={handleStartTour}
              className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 gap-2"
              data-testid="button-start-tour"
            >
              <Play className="w-4 h-4" />
              Start Guided Tour
            </Button>
          )}
          <Button 
            onClick={handleClose}
            variant="outline"
            className="w-full border-slate-600 text-gray-300 hover:bg-slate-800 gap-2"
            data-testid="button-explore-own"
          >
            <ArrowRight className="w-4 h-4" />
            Explore on My Own
          </Button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Look for the cyan banner at the top to exit sandbox anytime
        </p>
      </DialogContent>
    </Dialog>
  );
}

export function resetSandboxWelcome() {
  sessionStorage.removeItem(WELCOME_SEEN_KEY);
}
