import { Zap, TrendingUp, Lock } from "lucide-react";

export function ISO20022Banner() {
  return (
    <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-blue-950/60 border-b border-blue-500/40 py-3 sm:py-6">
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              <Lock className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-blue-300">
                ISO 20022 Banking Compliance Coming Q3-Q4 2026
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Direct bank integration • Enterprise-grade payroll • Fortune 500 ready
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-300 bg-blue-900/40 px-3 py-2 rounded-lg border border-blue-500/30 flex-shrink-0">
            <TrendingUp className="w-4 h-4" />
            <span>Technical Credibility</span>
          </div>
        </div>
      </div>
    </div>
  );
}
