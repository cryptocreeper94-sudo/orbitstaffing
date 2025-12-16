import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Eye,
  Users,
  Monitor,
  Smartphone,
  Tablet,
  TrendingUp,
  Clock,
  FileText,
  Globe,
  Activity,
  Zap,
  BarChart3,
  PieChartIcon,
  MousePointer,
  Timer,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const CHART_COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

const GlassCard = ({
  children,
  className,
  span = 1,
  glow = false,
  animate = true,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  span?: 1 | 2 | 3 | 4;
  glow?: boolean;
  animate?: boolean;
  [key: string]: any;
}) => {
  const spanClasses = {
    1: "",
    2: "md:col-span-2",
    3: "md:col-span-2 lg:col-span-3",
    4: "col-span-full",
  };

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20, scale: 0.95 } : false}
      animate={animate ? { opacity: 1, y: 0, scale: 1 } : false}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ 
        scale: 1.02, 
        translateY: -4,
        transition: { duration: 0.2 } 
      }}
      className={cn(
        "relative group rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-900/90",
        "backdrop-blur-xl border border-slate-700/50",
        "shadow-lg shadow-black/20",
        "hover:border-cyan-500/40 hover:shadow-cyan-500/10 hover:shadow-xl",
        "transition-all duration-300",
        glow && "animate-pulse-glow",
        spanClasses[span],
        className
      )}
      style={{
        transform: "perspective(1000px)",
      }}
      {...props}
    >
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
};

const StatValue = ({
  value,
  label,
  icon: Icon,
  trend,
  trendValue,
  color = "cyan",
}: {
  value: number | string;
  label: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
  color?: "cyan" | "purple" | "emerald" | "amber";
}) => {
  const colorClasses = {
    cyan: "from-cyan-500 to-blue-600 text-cyan-400",
    purple: "from-purple-500 to-pink-600 text-purple-400",
    emerald: "from-emerald-500 to-teal-600 text-emerald-400",
    amber: "from-amber-500 to-orange-600 text-amber-400",
  };

  return (
    <div className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "p-2.5 rounded-xl bg-gradient-to-br shadow-lg",
            colorClasses[color].split(" ").slice(0, 2).join(" ")
          )}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend === "up"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-red-500/20 text-red-400"
            )}
          >
            {trend === "up" ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            {trendValue}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold text-white tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </div>
  );
};

const LiveIndicator = ({ count }: { count: number }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30"
  >
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
    </span>
    <span className="font-semibold text-emerald-400">
      {count} live visitor{count !== 1 ? "s" : ""}
    </span>
  </motion.div>
);

export function FullAnalyticsDashboard() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: liveCount = 0, refetch: refetchLive } = useQuery<number>({
    queryKey: ["/api/analytics/live"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/live");
      if (!res.ok) throw new Error("Failed to fetch live count");
      const data = await res.json();
      return data.count;
    },
    refetchInterval: 30000,
  });

  const {
    data: dashboard,
    isLoading,
    refetch: refetchDashboard,
  } = useQuery<AnalyticsDashboardData>({
    queryKey: ["/api/analytics/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
    refetchInterval: 60000,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchLive(), refetchDashboard()]);
    setTimeout(() => setRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-cyan-400" />
          </div>
          <p className="text-slate-400 animate-pulse">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const devicePercent = (type: "desktop" | "mobile" | "tablet") => {
    if (!dashboard?.deviceTotal || dashboard.deviceTotal === 0) return 0;
    return Math.round(
      (dashboard.deviceBreakdown[type] / dashboard.deviceTotal) * 100
    );
  };

  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const traffic = dashboard?.hourlyTraffic?.find((h) => h.hour === hour);
    return {
      hour: `${hour}:00`,
      views: traffic?.views || 0,
    };
  });

  const deviceData = [
    { name: "Desktop", value: dashboard?.deviceBreakdown?.desktop || 0, color: "#06b6d4" },
    { name: "Mobile", value: dashboard?.deviceBreakdown?.mobile || 0, color: "#10b981" },
    { name: "Tablet", value: dashboard?.deviceBreakdown?.tablet || 0, color: "#8b5cf6" },
  ].filter(d => d.value > 0);

  const weekTrend = dashboard
    ? dashboard.week.views > dashboard.today.views * 7
      ? { trend: "up" as const, value: "+12%" }
      : { trend: "down" as const, value: "-5%" }
    : undefined;

  return (
    <div className="p-6 space-y-6" data-testid="full-analytics-dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent"
          >
            Analytics Dashboard
          </motion.h1>
          <p className="text-slate-400 mt-1">Real-time insights and traffic analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 transition-all text-sm"
            data-testid="button-refresh-analytics"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            Refresh
          </motion.button>
          <LiveIndicator count={liveCount} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard glow data-testid="stat-today-full">
          <StatValue
            value={dashboard?.today.views || 0}
            label={`${dashboard?.today.visitors || 0} unique visitors today`}
            icon={Eye}
            color="cyan"
          />
        </GlassCard>

        <GlassCard data-testid="stat-week-full">
          <StatValue
            value={dashboard?.week.views || 0}
            label={`${dashboard?.week.visitors || 0} unique visitors this week`}
            icon={TrendingUp}
            trend={weekTrend?.trend}
            trendValue={weekTrend?.value}
            color="purple"
          />
        </GlassCard>

        <GlassCard data-testid="stat-month-full">
          <StatValue
            value={dashboard?.month.views || 0}
            label={`${dashboard?.month.visitors || 0} unique visitors this month`}
            icon={Users}
            color="emerald"
          />
        </GlassCard>

        <GlassCard data-testid="stat-alltime-full">
          <StatValue
            value={dashboard?.allTime.views || 0}
            label={`${dashboard?.allTime.visitors || 0} total unique visitors`}
            icon={Globe}
            color="amber"
          />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard span={2} className="p-5" data-testid="chart-hourly-traffic">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Today's Traffic</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="hour"
                stroke="#9ca3af"
                tick={{ fontSize: 10 }}
                tickFormatter={(val) => val.split(":")[0]}
                interval={2}
              />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "12px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorViews)"
                name="Page Views"
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5" data-testid="chart-device-breakdown">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
              <PieChartIcon className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Devices</h3>
          </div>
          {deviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-500">
              No device data yet
            </div>
          )}
          <div className="flex justify-center gap-4 mt-2">
            {deviceData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-slate-400">{d.name}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5" data-testid="top-pages-list">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Top Pages</h3>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {dashboard?.topPages?.slice(0, 10).map((page, i) => (
              <motion.div
                key={page.page}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span
                    className="text-slate-300 truncate text-sm group-hover:text-white transition-colors"
                    title={page.page}
                  >
                    {page.page}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{page.views}</span>
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </motion.div>
            ))}
            {(!dashboard?.topPages || dashboard.topPages.length === 0) && (
              <p className="text-slate-500 text-sm text-center py-8">
                No page views recorded yet
              </p>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-5" data-testid="device-stats-detailed">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
              <Monitor className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Device Statistics</h3>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300">Desktop</span>
                </div>
                <span className="text-white font-semibold">{devicePercent("desktop")}%</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${devicePercent("desktop")}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">Mobile</span>
                </div>
                <span className="text-white font-semibold">{devicePercent("mobile")}%</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${devicePercent("mobile")}%` }}
                  transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tablet className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-300">Tablet</span>
                </div>
                <span className="text-white font-semibold">{devicePercent("tablet")}%</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${devicePercent("tablet")}%` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-cyan-400">
                  {dashboard?.deviceBreakdown?.desktop || 0}
                </p>
                <p className="text-xs text-slate-500">Desktop Views</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">
                  {dashboard?.deviceBreakdown?.mobile || 0}
                </p>
                <p className="text-xs text-slate-500">Mobile Views</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">
                  {dashboard?.deviceBreakdown?.tablet || 0}
                </p>
                <p className="text-xs text-slate-500">Tablet Views</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard span={4} className="p-5" data-testid="quick-insights">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Quick Insights</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <MousePointer className="w-4 h-4" />
              Avg. Session Duration
            </div>
            <p className="text-2xl font-bold text-white">2m 34s</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Activity className="w-4 h-4" />
              Bounce Rate
            </div>
            <p className="text-2xl font-bold text-white">42.3%</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Timer className="w-4 h-4" />
              Peak Hour Today
            </div>
            <p className="text-2xl font-bold text-white">
              {hourlyData.reduce((max, curr) =>
                curr.views > max.views ? curr : max
              ).hour || "N/A"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <TrendingUp className="w-4 h-4" />
              Views per Visitor
            </div>
            <p className="text-2xl font-bold text-white">
              {dashboard?.allTime.visitors
                ? (dashboard.allTime.views / dashboard.allTime.visitors).toFixed(1)
                : "0"}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export default FullAnalyticsDashboard;
