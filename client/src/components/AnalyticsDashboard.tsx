import { useQuery } from "@tanstack/react-query";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { StatCard } from "@/components/ui/orbit-card";
import { Eye, Users, Monitor, Smartphone, Tablet, TrendingUp, Clock, FileText } from "lucide-react";

interface AnalyticsDashboardData {
  today: { views: number; visitors: number };
  week: { views: number; visitors: number };
  month: { views: number; visitors: number };
  allTime: { views: number; visitors: number };
  topPages: { page: string; views: number }[];
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  deviceTotal: number;
  hourlyTraffic: { hour: number; views: number }[];
}

export function AnalyticsDashboard() {
  const { data: liveCount = 0 } = useQuery<number>({
    queryKey: ["/api/analytics/live"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/live");
      if (!res.ok) throw new Error("Failed to fetch live count");
      const data = await res.json();
      return data.count;
    },
    refetchInterval: 30000,
  });

  const { data: dashboard, isLoading } = useQuery<AnalyticsDashboardData>({
    queryKey: ["/api/analytics/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const devicePercent = (type: keyof typeof dashboard.deviceBreakdown) => {
    if (!dashboard?.deviceTotal || dashboard.deviceTotal === 0) return 0;
    return Math.round((dashboard.deviceBreakdown[type] / dashboard.deviceTotal) * 100);
  };

  const maxHourlyViews = Math.max(...(dashboard?.hourlyTraffic?.map((h) => h.views) || [1]), 1);

  return (
    <div className="p-6 space-y-6" data-testid="analytics-dashboard">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <div className="flex items-center gap-2 text-emerald-400" data-testid="live-visitors">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <span className="font-medium">{liveCount} live visitor{liveCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <BentoGrid cols={4} gap="md">
        <BentoTile className="p-4" data-testid="stat-today">
          <StatCard
            label="Today"
            value={dashboard?.today.views || 0}
            icon={<Eye className="w-5 h-5" />}
            className="!p-0 !border-0 !bg-transparent"
          />
          <p className="text-xs text-slate-400 mt-2">{dashboard?.today.visitors || 0} unique visitors</p>
        </BentoTile>

        <BentoTile className="p-4" data-testid="stat-week">
          <StatCard
            label="This Week"
            value={dashboard?.week.views || 0}
            icon={<TrendingUp className="w-5 h-5" />}
            className="!p-0 !border-0 !bg-transparent"
          />
          <p className="text-xs text-slate-400 mt-2">{dashboard?.week.visitors || 0} unique visitors</p>
        </BentoTile>

        <BentoTile className="p-4" data-testid="stat-month">
          <StatCard
            label="This Month"
            value={dashboard?.month.views || 0}
            icon={<Users className="w-5 h-5" />}
            className="!p-0 !border-0 !bg-transparent"
          />
          <p className="text-xs text-slate-400 mt-2">{dashboard?.month.visitors || 0} unique visitors</p>
        </BentoTile>

        <BentoTile className="p-4" data-testid="stat-alltime">
          <StatCard
            label="All Time"
            value={dashboard?.allTime.views || 0}
            icon={<Clock className="w-5 h-5" />}
            className="!p-0 !border-0 !bg-transparent"
          />
          <p className="text-xs text-slate-400 mt-2">{dashboard?.allTime.visitors || 0} unique visitors</p>
        </BentoTile>

        <BentoTile span={2} className="p-5" data-testid="top-pages">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Top Pages
          </h3>
          <div className="space-y-2">
            {dashboard?.topPages?.slice(0, 8).map((page, i) => (
              <div key={page.page} className="flex items-center justify-between text-sm">
                <span className="text-slate-400 truncate max-w-[200px]" title={page.page}>
                  {i + 1}. {page.page}
                </span>
                <span className="text-white font-medium">{page.views}</span>
              </div>
            ))}
            {(!dashboard?.topPages || dashboard.topPages.length === 0) && (
              <p className="text-slate-500 text-sm">No page data yet</p>
            )}
          </div>
        </BentoTile>

        <BentoTile className="p-5" data-testid="device-breakdown">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Device Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Desktop</span>
                  <span className="text-white">{devicePercent("desktop")}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all"
                    style={{ width: `${devicePercent("desktop")}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Mobile</span>
                  <span className="text-white">{devicePercent("mobile")}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${devicePercent("mobile")}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tablet className="w-4 h-4 text-purple-400" />
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Tablet</span>
                  <span className="text-white">{devicePercent("tablet")}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${devicePercent("tablet")}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </BentoTile>

        <BentoTile span={2} rowSpan={1} className="p-5" data-testid="hourly-traffic">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Today's Hourly Traffic</h3>
          <div className="flex items-end gap-1 h-24">
            {Array.from({ length: 24 }, (_, hour) => {
              const traffic = dashboard?.hourlyTraffic?.find((h) => h.hour === hour);
              const views = traffic?.views || 0;
              const height = maxHourlyViews > 0 ? (views / maxHourlyViews) * 100 : 0;
              const currentHour = new Date().getHours();
              return (
                <div
                  key={hour}
                  className="flex-1 flex flex-col items-center gap-1"
                  title={`${hour}:00 - ${views} views`}
                >
                  <div
                    className={`w-full rounded-t transition-all ${
                      hour === currentHour ? "bg-cyan-400" : "bg-slate-600"
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  {hour % 6 === 0 && (
                    <span className="text-[10px] text-slate-500">{hour}</span>
                  )}
                </div>
              );
            })}
          </div>
        </BentoTile>
      </BentoGrid>
    </div>
  );
}

export default AnalyticsDashboard;
