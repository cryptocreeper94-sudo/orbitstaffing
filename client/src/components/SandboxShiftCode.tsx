import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Key, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { useMode } from '@/contexts/ModeContext';

const SHIFT_CODE_BYPASS_KEY = 'orbit_shift_code_bypass';

function generateDailyCode(): string {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${today.getMonth()}${today.getDate()}`;
  const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `ORBIT-${(hash % 9000 + 1000)}`;
}

interface ShiftCodeGateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isSupervisor?: boolean;
}

export function ShiftCodeGate({ isOpen, onClose, onSuccess, isSupervisor = false }: ShiftCodeGateProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const dailyCode = generateDailyCode();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.toUpperCase() === dailyCode) {
      setShowSuccess(true);
      sessionStorage.setItem(SHIFT_CODE_BYPASS_KEY, 'true');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } else {
      setError('Invalid shift code. Please get a valid code from your supervisor.');
      setCode('');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(dailyCode);
  };

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-slate-900 to-green-950 border-green-500/30 max-w-sm text-center">
          <div className="py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Access Granted</h3>
            <p className="text-gray-400">Switching to Live Mode...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-orange-500/30 max-w-md" data-testid="shift-code-dialog">
        <DialogHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center mb-3">
            <Shield className="w-7 h-7 text-orange-400" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Go Live Verification
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter your shift code to access live production data
          </DialogDescription>
        </DialogHeader>

        {isSupervisor ? (
          <div className="mt-4 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-cyan-300 font-medium">Today's Shift Code</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyCode}
                className="text-cyan-400 hover:text-cyan-300 h-8 px-2"
              >
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
            </div>
            <div className="text-2xl font-mono font-bold text-white tracking-wider">
              {dailyCode}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this code with team members who need live access today
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-gray-400" />
                <label className="text-sm text-gray-300">Shift Code</label>
              </div>
              <Input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="ORBIT-XXXX"
                className="bg-slate-800 border-slate-600 text-white text-center text-lg tracking-widest font-mono"
                data-testid="input-shift-code"
              />
              {error && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose}
                className="flex-1 border-slate-600 text-gray-300"
              >
                Stay in Sandbox
              </Button>
              <Button 
                type="submit"
                className="flex-1 bg-orange-600 hover:bg-orange-500"
                data-testid="button-verify-code"
              >
                Verify & Go Live
              </Button>
            </div>
          </form>
        )}

        <p className="text-center text-xs text-gray-500 mt-2">
          {isSupervisor 
            ? 'Code resets daily at midnight' 
            : 'Get your code from a supervisor or admin'}
        </p>
      </DialogContent>
    </Dialog>
  );
}

export function hasValidShiftCode(): boolean {
  return sessionStorage.getItem(SHIFT_CODE_BYPASS_KEY) === 'true';
}

export function clearShiftCode() {
  sessionStorage.removeItem(SHIFT_CODE_BYPASS_KEY);
}
