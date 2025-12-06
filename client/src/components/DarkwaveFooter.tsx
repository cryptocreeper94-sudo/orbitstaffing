interface DarkwaveFooterProps {
  product?: string;
  hidePoweredBy?: boolean;
  minimal?: boolean;
}

export const DarkwaveFooter: React.FC<DarkwaveFooterProps> = ({ product = "Lot Ops Pro", hidePoweredBy = false, minimal = false }) => {
  if (minimal) {
    return (
      <footer className="w-full bg-slate-950 border-t border-slate-800 py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-baseline justify-between text-xs">
          <a 
            href="/developer" 
            className="text-slate-500 hover:text-cyan-400 transition leading-none"
            data-testid="link-developer-footer"
          >
            Developer
          </a>
          
          <p className="text-slate-500 leading-none">
            DarkWave Studios, LLC © 2025
          </p>
          
          <span className="text-slate-600 font-mono leading-none">
            v2.6.3
          </span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="w-16 h-16 mb-4 rounded-lg bg-gradient-to-br from-purple-900 to-slate-900 border border-purple-500/30 flex items-center justify-center">
              <div className="w-14 h-14 rounded-lg bg-black/50 flex items-center justify-center border border-purple-500/50">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  DW
                </span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">DarkWave Studios</h3>
            <p className="text-xs text-slate-400 mt-1">Enterprise Software Solutions</p>
          </div>

          <div className="flex flex-col items-center">
            <h4 className="text-sm font-semibold text-cyan-300 mb-3">Featured Product</h4>
            <p className="text-sm text-slate-300 text-center">{product}</p>
            <p className="text-xs text-slate-500 mt-2">Part of the DarkWave Studios Ecosystem</p>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <h4 className="text-sm font-semibold text-cyan-300 mb-3">Quick Links</h4>
            <div className="space-y-1 text-xs text-slate-400">
              <a href="https://darkwavestudios.io" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition block">
                DarkWave Studios
              </a>
              <a href="/products" className="hover:text-cyan-400 transition block">
                All Products
              </a>
              <a href="/developer" className="hover:text-cyan-400 transition block">
                Developer Access
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700/50 pt-6 mb-6"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="text-xs text-slate-500">
            <p>© 2025 DarkWave Studios, LLC. All rights reserved.</p>
            <p className="text-slate-600 mt-1">Enterprise-grade solutions for staffing, safety, and operations</p>
          </div>

          {!hidePoweredBy && (
            <div className="flex flex-col items-center md:items-end">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">Powered By</div>
              <div className="text-xs font-bold text-slate-300">DARKWAVE STUDIOS</div>
              <div className="text-[9px] text-slate-600 mt-1">v2.6.3 • Enterprise Edition</div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
