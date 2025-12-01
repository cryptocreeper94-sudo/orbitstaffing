import React from 'react';
import { useMode } from '@/contexts/ModeContext';
import { Button } from '@/components/ui/button';
import { FlaskConical, ArrowLeft, X } from 'lucide-react';

export function SandboxBanner() {
  const { isSandbox, exitSandbox, returnPath } = useMode();

  if (!isSandbox) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-500 text-white py-2 px-4 shadow-lg" data-testid="sandbox-banner">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
            <FlaskConical className="w-4 h-4" />
            <span className="font-bold text-sm">SANDBOX MODE</span>
          </div>
          <span className="text-sm text-white/90 hidden sm:inline">
            You're viewing demo data. Changes won't affect real records.
          </span>
        </div>
        <Button
          onClick={exitSandbox}
          variant="outline"
          size="sm"
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2"
          data-testid="button-exit-sandbox"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit to Live
          {returnPath && <span className="text-xs opacity-75">({returnPath})</span>}
        </Button>
      </div>
    </div>
  );
}

interface SandboxToggleProps {
  className?: string;
  size?: 'sm' | 'default';
}

export function SandboxToggle({ className = '', size = 'sm' }: SandboxToggleProps) {
  const { isSandbox, isLive, enterSandbox, exitSandbox } = useMode();

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
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/30" data-testid="badge-sandbox">
      <FlaskConical className="w-3 h-3" />
      Demo
    </span>
  );
}
