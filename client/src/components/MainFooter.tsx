import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Shield, Hash } from 'lucide-react';

interface VersionInfo {
  version: string;
  buildNumber: number;
  lastPublished: string;
  solanaHash: string | null;
  transactionSignature: string | null;
}

export function MainFooter() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    version: '2.7.0',
    buildNumber: 1,
    lastPublished: '',
    solanaHash: null,
    transactionSignature: null
  });

  useEffect(() => {
    fetch('/api/version')
      .then(res => res.json())
      .then((data: VersionInfo) => {
        if (data.version) setVersionInfo(data);
      })
      .catch(() => {});
  }, []);

  const shortHash = versionInfo.solanaHash ? versionInfo.solanaHash.substring(0, 8) : null;

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800 py-4 px-4 shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <Link href="/solana-verification">
            <div className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition cursor-pointer" data-testid="link-footer-verified">
              <Shield className="w-3.5 h-3.5" />
              <span>Solana Verified</span>
            </div>
          </Link>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-500 font-mono">v{versionInfo.version}</span>
          {shortHash && (
            <>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <div className="flex items-center gap-1 text-cyan-500/70 font-mono" title={`Full hash: ${versionInfo.solanaHash}`}>
                <Hash className="w-3 h-3" />
                <span>{shortHash}</span>
              </div>
            </>
          )}
        </div>
        
        <p className="text-slate-400 text-center">
          Powered by DarkWave Studios, LLC © 2025
        </p>
        
        <div className="flex items-center gap-4 text-slate-500">
          <Link href="/investors">
            <span className="hover:text-cyan-400 transition cursor-pointer" data-testid="link-footer-investors">Investors</span>
          </Link>
          <Link href="/admin-landing">
            <span className="hover:text-cyan-400 transition cursor-pointer" data-testid="link-footer-admin">Admin</span>
          </Link>
          <Link href="/developer">
            <span className="hover:text-cyan-400 transition cursor-pointer" data-testid="link-footer-dev">Developer</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
