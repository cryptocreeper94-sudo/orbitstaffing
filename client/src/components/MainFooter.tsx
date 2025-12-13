import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Shield, Hash } from 'lucide-react';
import { FooterWeatherWidget } from './FooterWeatherWidget';
import { FooterOrbyChat } from './FooterOrbyChat';

interface VersionInfo {
  version: string;
  buildNumber: number;
  lastPublished: string;
  solanaHash: string | null;
  transactionSignature: string | null;
}

export function MainFooter() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    version: '2.7.1',
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
    <footer 
      className="w-full bg-slate-950/95 backdrop-blur-sm border-t border-slate-800 py-1.5 px-3 shrink-0"
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 999
      }}
      data-testid="main-footer"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-[10px] sm:text-xs">
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <FooterWeatherWidget />
          <Link href="/solana-verification">
            <div className="flex items-center gap-0.5 text-emerald-400 hover:text-emerald-300 transition cursor-pointer" data-testid="link-footer-verified">
              <Shield className="w-3 h-3" />
            </div>
          </Link>
          <span className="text-slate-500 font-mono">v{versionInfo.version}</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 text-slate-500 flex-shrink-0">
          <Link href="/investors">
            <span className="hover:text-cyan-400 transition cursor-pointer" data-testid="link-footer-investors">Investors</span>
          </Link>
          <Link href="/admin-landing">
            <span className="hover:text-cyan-400 transition cursor-pointer" data-testid="link-footer-admin">Admin</span>
          </Link>
          <Link href="/developer">
            <span className="hover:text-cyan-400 transition cursor-pointer" data-testid="link-footer-dev">Dev</span>
          </Link>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <FooterOrbyChat />
        </div>
      </div>
    </footer>
  );
}
