import React, { useState, useEffect } from 'react';
import { useMode } from '@/contexts/ModeContext';
import { Button } from '@/components/ui/button';
import { FlaskConical, ArrowLeft, Sparkles, Lightbulb, Key } from 'lucide-react';
import { ShiftCodeGate, hasValidShiftCode } from './SandboxShiftCode';
import { getRandomTip } from '@/data/sandbox/simulation';
import { useLocation } from 'wouter';

const REQUIRE_SHIFT_CODE = false;

export function SandboxBanner() {
  const { isSandbox, exitSandbox, returnPath } = useMode();
  const [showShiftCode, setShowShiftCode] = useState(false);
  const [showSupervisorCode, setShowSupervisorCode] = useState(false);
  const [location] = useLocation();
  const [tip, setTip] = useState('');

  useEffect(() => {
    if (isSandbox) {
      setTip(getRandomTip(location));
    }
  }, [isSandbox, location]);

  const handleExitClick = () => {
    if (!REQUIRE_SHIFT_CODE || hasValidShiftCode()) {
      exitSandbox();
    } else {
      setShowShiftCode(true);
    }
  };

  if (!isSandbox) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/20" data-testid="sandbox-banner">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 animate-pulse">
              <FlaskConical className="w-4 h-4" />
              <span className="font-bold text-sm">SANDBOX MODE</span>
            </div>
            <span className="text-sm text-white/90 hidden md:inline">
              Demo data active. Safe to explore!
            </span>
          </div>
          <div className="flex items-center gap-2">
            {REQUIRE_SHIFT_CODE && (
              <Button
                onClick={() => setShowSupervisorCode(true)}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
                title="View shift code (supervisors)"
              >
                <Key className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={handleExitClick}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2"
              data-testid="button-exit-sandbox"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Exit to Live</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>
        {tip && (
          <div className="bg-cyan-700/50 px-4 py-1.5 text-center">
            <span className="text-xs text-white/80 flex items-center justify-center gap-2">
              <Lightbulb className="w-3 h-3" />
              {tip}
            </span>
          </div>
        )}
      </div>
      
      <ShiftCodeGate
        isOpen={showShiftCode}
        onClose={() => setShowShiftCode(false)}
        onSuccess={exitSandbox}
      />
      
      <ShiftCodeGate
        isOpen={showSupervisorCode}
        onClose={() => setShowSupervisorCode(false)}
        onSuccess={() => setShowSupervisorCode(false)}
        isSupervisor={true}
      />
    </>
  );
}

interface SandboxToggleProps {
  className?: string;
  size?: 'sm' | 'default';
}

export function SandboxToggle({ className = '', size = 'sm' }: SandboxToggleProps) {
  const { isSandbox, enterSandbox, exitSandbox } = useMode();

  if (isSandbox) {
    return (
      <Button
        onClick={exitSandbox}
        variant="outline"
        size={size}
        className={`gap-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 ${className}`}
        data-testid="button-exit-sandbox-toggle"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Live
      </Button>
    );
  }

  return (
    <Button
      onClick={() => enterSandbox()}
      variant="outline"
      size={size}
      className={`gap-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10 ${className}`}
      data-testid="button-enter-sandbox"
    >
      <FlaskConical className="w-4 h-4" />
      Try in Sandbox
    </Button>
  );
}

export function SandboxBadge() {
  const { isSandbox } = useMode();
  
  if (!isSandbox) return null;
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/30 animate-pulse" data-testid="badge-sandbox">
      <FlaskConical className="w-3 h-3" />
      Demo
    </span>
  );
}

export function SandboxStatusCard() {
  const { isSandbox, exitSandbox } = useMode();
  
  if (!isSandbox) return null;
  
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/30 p-4 shadow-lg shadow-cyan-500/10" data-testid="sandbox-status-card">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-cyan-300 font-bold text-sm flex items-center gap-2">
              Sandbox Mode
              <Sparkles className="w-3 h-3 text-yellow-400" />
            </div>
            <div className="text-xs text-gray-400">Demo data • Safe to explore</div>
          </div>
        </div>
        <Button
          onClick={exitSandbox}
          size="sm"
          variant="outline"
          className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
        >
          Go Live
        </Button>
      </div>
    </div>
  );
}

export function SandboxStatusCompact() {
  const { isSandbox } = useMode();
  
  if (!isSandbox) return null;
  
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20" data-testid="sandbox-status-compact">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      <span className="text-xs text-cyan-400 font-medium">Sandbox</span>
    </div>
  );
}
