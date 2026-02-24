import { useState, useEffect } from "react";
import { 
  Network, AlertTriangle, TrendingUp, Zap, Globe, Activity,
  ExternalLink, CheckCircle2, Clock
} from "lucide-react";

interface EcoApp {
  id: string;
  name: string;
  url: string;
  ownership: string;
  color: string;
  status: string;
  connected: boolean;
  lastSync: string | null;
  syncCount: number;
  revenue: number;
  eventCount: number;
  registeredAt: string | null;
}

interface EcoPerformance {
  totalApps: number;
  connectedApps: number;
  totalRevenue: number;
  totalExpenses: number;
  totalEvents: number;
  apps: EcoApp[];
}

interface Props {
  compact?: boolean;
}

export function EcosystemPerformanceDashboard({ compact = false }: Props) {
  const [data, setData] = useState<EcoPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/ecosystem/performance', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load'); setLoading(false); });
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const colorMap: Record<string, { border: string; bg: string; text: string; glow: string; dot: string }> = {
    cyan: { border: 'border-cyan-500/30', bg: 'from-cyan-500/10 to-cyan-600/5', text: 'text-cyan-300', glow: 'shadow-cyan-500/10', dot: 'bg-cyan-400' },
    emerald: { border: 'border-emerald-500/30', bg: 'from-emerald-500/10 to-emerald-600/5', text: 'text-emerald-300', glow: 'shadow-emerald-500/10', dot: 'bg-emerald-400' },
    blue: { border: 'border-blue-500/30', bg: 'from-blue-500/10 to-blue-600/5', text: 'text-blue-300', glow: 'shadow-blue-500/10', dot: 'bg-blue-400' },
    purple: { border: 'border-purple-500/30', bg: 'from-purple-500/10 to-purple-600/5', text: 'text-purple-300', glow: 'shadow-purple-500/10', dot: 'bg-purple-400' },
    lime: { border: 'border-lime-500/30', bg: 'from-lime-500/10 to-lime-600/5', text: 'text-lime-300', glow: 'shadow-lime-500/10', dot: 'bg-lime-400' },
    teal: { border: 'border-teal-500/30', bg: 'from-teal-500/10 to-teal-600/5', text: 'text-teal-300', glow: 'shadow-teal-500/10', dot: 'bg-teal-400' },
    pink: { border: 'border-pink-500/30', bg: 'from-pink-500/10 to-pink-600/5', text: 'text-pink-300', glow: 'shadow-pink-500/10', dot: 'bg-pink-400' },
    amber: { border: 'border-amber-500/30', bg: 'from-amber-500/10 to-amber-600/5', text: 'text-amber-300', glow: 'shadow-amber-500/10', dot: 'bg-amber-400' },
    rose: { border: 'border-rose-500/30', bg: 'from-rose-500/10 to-rose-600/5', text: 'text-rose-300', glow: 'shadow-rose-500/10', dot: 'bg-rose-400' },
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      live: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      connected: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'pre-launch': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    };
    return map[status] || map['pre-launch'];
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 rounded-xl bg-slate-800/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 text-red-400">
        <AlertTriangle className="w-8 h-8 mx-auto mb-3" />
        <p>{error || 'No data'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`${compact ? 'text-lg' : 'text-xl'} font-bold text-white flex items-center gap-2`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/20 flex items-center justify-center backdrop-blur-sm">
              <Network className="w-4 h-4 text-cyan-400" />
            </div>
            Ecosystem Performance
          </h2>
          <p className="text-sm text-slate-400 mt-1 ml-10">All connected DarkWave apps at a glance</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300" data-testid="card-stat-total-apps">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-3.5 h-3.5 text-cyan-400/60" />
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Total Apps</p>
          </div>
          <p className="text-2xl font-bold text-cyan-300">{data.totalApps}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300" data-testid="card-stat-connected">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/60" />
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Connected</p>
          </div>
          <p className="text-2xl font-bold text-emerald-300">{data.connectedApps}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden group hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300" data-testid="card-stat-revenue">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400/60" />
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Revenue (Month)</p>
          </div>
          <p className="text-2xl font-bold text-amber-300">{fmt(data.totalRevenue)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300" data-testid="card-stat-events">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-purple-400/60" />
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Total Events</p>
          </div>
          <p className="text-2xl font-bold text-purple-300">{data.totalEvents}</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.apps.map((app) => {
          const colors = colorMap[app.color] || { border: 'border-slate-700', bg: 'from-slate-800/30 to-slate-900/30', text: 'text-slate-300', glow: 'shadow-slate-500/5', dot: 'bg-slate-400' };
          return (
            <div
              key={app.id}
              className={`bg-gradient-to-br ${colors.bg} ${colors.border} border rounded-xl p-4 backdrop-blur-sm relative overflow-hidden group hover:shadow-lg ${colors.glow} transition-all duration-300`}
              data-testid={`card-app-${app.id}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl group-hover:bg-white/[0.04] transition-all" />
              
              <div className="flex items-center justify-between mb-3 relative">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-2.5 h-2.5 rounded-full ${colors.dot} ${app.connected ? 'animate-pulse' : 'opacity-40'}`} />
                    {app.connected && (
                      <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${colors.dot} animate-ping opacity-30`} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{app.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      {app.url}
                      {app.url && <ExternalLink className="w-2.5 h-2.5 opacity-40" />}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border backdrop-blur-sm ${statusBadge(app.status)}`}>
                    {app.status}
                  </span>
                  {app.connected && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm flex items-center gap-1">
                      <Activity className="w-2.5 h-2.5" />
                      linked
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
                <div className="bg-slate-900/40 rounded-lg px-3 py-2 border border-slate-700/30">
                  <p className="text-[10px] text-slate-500 uppercase">Revenue</p>
                  <p className="text-sm font-semibold text-white">{fmt(app.revenue)}</p>
                </div>
                <div className="bg-slate-900/40 rounded-lg px-3 py-2 border border-slate-700/30">
                  <p className="text-[10px] text-slate-500 uppercase">Events</p>
                  <p className="text-sm font-semibold text-white">{app.eventCount}</p>
                </div>
                <div className="bg-slate-900/40 rounded-lg px-3 py-2 border border-slate-700/30">
                  <p className="text-[10px] text-slate-500 uppercase">Syncs</p>
                  <p className="text-sm font-semibold text-white">{app.syncCount}</p>
                </div>
                <div className="bg-slate-900/40 rounded-lg px-3 py-2 border border-slate-700/30">
                  <p className="text-[10px] text-slate-500 uppercase">Ownership</p>
                  <p className="text-sm font-semibold text-white">{app.ownership}</p>
                </div>
              </div>

              {app.lastSync && (
                <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1 relative">
                  <Clock className="w-2.5 h-2.5" />
                  Last sync: {new Date(app.lastSync).toLocaleString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}