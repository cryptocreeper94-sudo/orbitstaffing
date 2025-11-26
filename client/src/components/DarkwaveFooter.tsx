import { Lock } from 'lucide-react';

interface DarkwaveFooterProps {
  product?: string;
}

export const DarkwaveFooter: React.FC<DarkwaveFooterProps> = ({ product = "Lot Ops Pro" }) => {
  return (
    <footer className="w-full bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Top section with product link */}
        <div className="text-center mb-12">
          <h3 className="text-lg text-cyan-400 hover:text-cyan-300 transition cursor-pointer mb-3">
            About {product} →
          </h3>
          <p className="text-sm text-gray-500">
            Protected by Enterprise-Grade Security • v2.5.0
          </p>
        </div>

        {/* Developer Login */}
        <div className="text-center mb-8">
          <a
            href="/developer"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition font-semibold"
            data-testid="link-developer-login"
          >
            <Lock className="w-4 h-4" />
            Developer Login
          </a>
        </div>

        {/* Policy buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            className="px-8 py-3 rounded-lg border border-slate-700 hover:border-cyan-500/50 text-gray-300 hover:text-cyan-400 transition font-semibold"
            data-testid="button-privacy-policy"
          >
            Privacy Policy
          </button>
          <button
            className="px-8 py-3 rounded-lg border border-slate-700 hover:border-cyan-500/50 text-gray-300 hover:text-cyan-400 transition font-semibold"
            data-testid="button-terms-of-service"
          >
            Terms of Service
          </button>
        </div>

        {/* Logo and branding section */}
        <div className="border-t border-slate-800 pt-12 flex flex-col items-center">
          {/* DarkWave Logo */}
          <div className="w-24 h-24 mb-6 rounded-lg bg-gradient-to-br from-purple-900 to-slate-900 border border-purple-500/30 flex items-center justify-center">
            <div className="w-20 h-20 rounded-lg bg-black/50 flex items-center justify-center border border-purple-500/50">
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                DW
              </span>
            </div>
          </div>

          {/* Company info */}
          <h4 className="text-xl font-bold text-white mb-2">
            © 2025 DarkWave Studios, LLC
          </h4>
          <p className="text-gray-400 mb-1">
            {product} - All Rights Reserved
          </p>
          <p className="text-sm text-gray-500">
            Enterprise-Grade {product.includes('Lot') ? 'Lot Management' : product.includes('Pulse') ? 'Compliance & Safety' : 'Staffing'} System
          </p>
        </div>

        {/* Bottom border line */}
        <div className="mt-12 pt-8 border-t border-slate-800/50 text-center text-xs text-gray-600">
          <p>Powered by DarkWave Studios Innovation Platform</p>
        </div>
      </div>
    </footer>
  );
};
