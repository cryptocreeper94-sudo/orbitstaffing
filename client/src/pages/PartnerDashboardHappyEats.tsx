import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  DollarSign, TrendingUp, Receipt, PieChart, LogOut, ArrowLeft, 
  ShieldCheck, Clock, UtensilsCrossed, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PinChangeModal } from "@/components/PinChangeModal";

interface AuthInfo {
  authenticated: boolean;
  name: string;
  role: string;
  isReadOnlyPartner: boolean;
  requirePinChange: boolean;
  capabilities: {
    canViewPartnerFinancials: boolean;
    partnerProduct: string | null;
  };
}

interface Transaction {
  id: number;
  date: string;
  type: string;
  description: string;
  amount: number;
  status: string;
}

interface PartnerEarnings {
  product: string;
  partnerName: string;
  splitPercentage: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  partnerShare: number;
  transactionCount: number;
  recentTransactions: Transaction[];
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  const colorMap: Record<string, string> = {
    pink: "from-pink-500/20 to-pink-600/10 border-pink-500/30 text-pink-300",
    green: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-300",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-300",
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-300",
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-5`} data-testid={`card-stat-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5 opacity-70" />
        <span className="text-[10px] uppercase tracking-wider opacity-50">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function PartnerDashboardHappyEats() {
  const [, setLocation] = useLocation();
  const [showPinChange, setShowPinChange] = useState(false);

  const { data: auth, isLoading: authLoading } = useQuery<AuthInfo>({
    queryKey: ['/api/auth/me'],
  });

  const { data: earnings, isLoading: earningsLoading } = useQuery<PartnerEarnings>({
    queryKey: ['/api/partner/product/earnings'],
    enabled: auth?.authenticated === true,
  });

  useEffect(() => {
    if (auth && auth.requirePinChange) {
      setShowPinChange(true);
    }
  }, [auth]);

  useEffect(() => {
    if (auth && !auth.authenticated) {
      setLocation('/');
    }
    if (auth && auth.authenticated && !auth.isReadOnlyPartner && auth.role !== 'developer') {
      setLocation('/admin-explore');
    }
  }, [auth, setLocation]);

  const handleLogout = async () => {
    await fetch('/api/auth/admin-logout', { method: 'POST' });
    setLocation('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-pink-400 text-lg">Loading...</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PinChangeModal 
        isOpen={showPinChange} 
        onClose={() => setShowPinChange(false)} 
        onSkip={() => setShowPinChange(false)}
        adminName="Kathy Grater"
      />

      <header className="border-b border-pink-500/20 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-pink-300">Happy Eats Partner Portal</h1>
              <p className="text-[10px] text-slate-400">Welcome, {auth?.name || 'Partner'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="text-slate-400 hover:text-white text-xs"
              data-testid="button-back-explore"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Home
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 text-xs"
              data-testid="button-logout"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-pink-400" />
            <span className="text-xs text-pink-400 uppercase tracking-wider font-semibold">Read-Only Access</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Happy Eats Revenue Dashboard</h2>
          <p className="text-sm text-slate-400">
            Nashville franchise — {earnings?.splitPercentage || 60}% equity partner
          </p>
        </div>

        {earningsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 rounded-xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Revenue"
              value={formatCurrency(earnings?.totalRevenue || 0)}
              icon={DollarSign}
              color="pink"
            />
            <StatCard
              label="Expenses"
              value={formatCurrency(earnings?.totalExpenses || 0)}
              icon={Receipt}
              color="amber"
            />
            <StatCard
              label="Net Profit"
              value={formatCurrency(earnings?.netProfit || 0)}
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              label="Your Share (60%)"
              value={formatCurrency(earnings?.partnerShare || 0)}
              icon={PieChart}
              color="blue"
            />
          </div>
        )}

        <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
            </div>
            <span className="text-xs text-slate-500">{earnings?.transactionCount || 0} total</span>
          </div>

          {!earnings?.recentTransactions?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <AlertCircle className="w-8 h-8 mb-3 opacity-40" />
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs mt-1 text-slate-600">Revenue will appear here once Happy Eats goes live</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {earnings.recentTransactions.map((tx) => (
                <div key={tx.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-800/30 transition" data-testid={`row-transaction-${tx.id}`}>
                  <div>
                    <p className="text-sm text-white">{tx.description}</p>
                    <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${tx.type === 'revenue' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'revenue' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-pink-950/20 border border-pink-500/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <UtensilsCrossed className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-pink-300 font-semibold text-sm">Happy Eats Nashville</p>
              <p className="text-slate-400 text-xs mt-1">
                Primary corridor: Hwy 109 & I-840 (Lebanon, Mt. Juliet, Wilson County) · 11 delivery zones configured · Pre-launch
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
