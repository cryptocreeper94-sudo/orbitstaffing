import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Shield, Lock, X } from 'lucide-react';
import { FooterWeatherWidget } from './FooterWeatherWidget';
import { FooterOrbyChat } from './FooterOrbyChat';

interface VersionInfo {
  version: string;
  buildNumber: number;
  lastPublished: string;
  trustvaultHash: string | null;
  transactionSignature: string | null;
}

interface MainFooterProps {
  onOpenRadar?: () => void;
}

function TeamLoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<'pin' | 'email'>('pin');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setEmail('');
      setPassword('');
      setError('');
      setIsLoading(false);
      setMode('pin');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/verify-admin-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      
      const data = await res.json();
      
      if (data.verified) {
        onClose();
        if (data.redirectTo) {
          setLocation(data.redirectTo);
        } else {
          setLocation('/admin-explore');
        }
      } else {
        setError(data.error || 'Invalid PIN');
        setPin('');
      }
    } catch {
      setError('Connection error. Try again.');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/partner-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (data.verified) {
        onClose();
        if (data.redirectTo) {
          setLocation(data.redirectTo);
        } else {
          setLocation('/admin-explore');
        }
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Connection error. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-xl p-6 w-[340px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition"
          data-testid="button-close-login"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Team Login</h3>
            <p className="text-slate-400 text-xs">
              {mode === 'pin' ? 'Enter your access PIN' : 'Sign in with your account'}
            </p>
          </div>
        </div>

        {mode === 'pin' ? (
          <form onSubmit={handlePinSubmit}>
            <input
              type="password"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(''); }}
              placeholder="Enter PIN"
              maxLength={8}
              autoFocus
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-center text-lg tracking-[0.3em] placeholder:text-slate-500 placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:border-cyan-500 transition mb-3"
              data-testid="input-team-pin"
            />
            {error && (
              <p className="text-red-400 text-xs text-center mb-3" data-testid="text-pin-error">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium py-2 rounded-lg text-sm hover:from-cyan-400 hover:to-blue-500 transition disabled:opacity-50"
              data-testid="button-submit-pin"
            >
              {isLoading ? 'Verifying...' : 'Access Portal'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="Email address"
              autoFocus
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition"
              data-testid="input-team-email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition"
              data-testid="input-team-password"
            />
            {error && (
              <p className="text-red-400 text-xs text-center" data-testid="text-login-error">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium py-2 rounded-lg text-sm hover:from-cyan-400 hover:to-blue-500 transition disabled:opacity-50"
              data-testid="button-submit-login"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        <div className="mt-4 pt-3 border-t border-slate-700/50 text-center">
          <button
            onClick={() => { setMode(mode === 'pin' ? 'email' : 'pin'); setError(''); }}
            className="text-xs text-slate-400 hover:text-cyan-400 transition"
            data-testid="button-toggle-login-mode"
          >
            {mode === 'pin' ? 'Sign in with email instead' : 'Sign in with PIN instead'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MainFooter({ onOpenRadar }: MainFooterProps) {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    version: '2.7.1',
    buildNumber: 1,
    lastPublished: '',
    trustvaultHash: null,
    transactionSignature: null
  });
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    fetch('/api/version')
      .then(res => res.json())
      .then((data: VersionInfo) => {
        if (data.version) setVersionInfo(data);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <footer 
        className="w-full bg-slate-950/95 backdrop-blur-sm border-t border-slate-800 py-1.5 px-3 shrink-0"
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 999
        }}
        data-testid="main-footer"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] sm:text-xs">
          <div className="flex items-center gap-2">
            <FooterWeatherWidget onOpenRadar={onOpenRadar} />
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 text-slate-500">
            <Link href="/trustvault-verification">
              <div className="flex items-center text-emerald-400 hover:text-emerald-300 transition cursor-pointer" data-testid="link-footer-verified">
                <Shield className="w-3 h-3" />
              </div>
            </Link>
            <Link href="/investors">
              <span className="hover:text-cyan-400 transition cursor-pointer" data-testid="link-footer-investors">Investors</span>
            </Link>
            <button
              onClick={() => setShowLogin(true)}
              className="hover:text-cyan-400 transition cursor-pointer flex items-center gap-1"
              data-testid="button-team-login"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Team Login</span>
            </button>
            <span className="text-slate-500 font-mono">v{versionInfo.version}</span>
            <span className="text-slate-700">|</span>
            <FooterOrbyChat />
          </div>
        </div>
      </footer>
      <TeamLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
