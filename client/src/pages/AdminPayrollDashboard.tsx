import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PageHeader, SectionHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, StatCard } from "@/components/ui/orbit-card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Clock, CheckCircle2, AlertCircle, DollarSign, FileText, RefreshCw } from "lucide-react";

export default function AdminPayrollDashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    failed: 0,
    total: 0,
    garnishments: 0,
  });

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const { connected } = useWebSocket("payroll", (data) => {
    setStats((prev) => ({
      ...prev,
      ...data,
    }));
  });

  useEffect(() => {
    fetchPayrollStats();
  }, []);

  const fetchPayrollStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/payroll-stats");
      const result = await response.json();

      if (result.success) {
        setStats(result.stats);
        setChartData([
          { date: "Mon", processed: 45, pending: 12, failed: 2 },
          { date: "Tue", processed: 52, pending: 8, failed: 1 },
          { date: "Wed", processed: 48, pending: 15, failed: 3 },
          { date: "Thu", processed: 61, pending: 5, failed: 0 },
          { date: "Fri", processed: 55, pending: 10, failed: 1 },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch payroll stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <PageHeader
        title="Payroll Dashboard"
        subtitle="Real-time payroll processing and status tracking"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-slate-400">
                {connected ? "Live" : "Offline"}
              </span>
            </div>
            <Button 
              onClick={fetchPayrollStats} 
              variant="outline" 
              size="sm"
              className="border-slate-600 hover:border-cyan-500 hover:bg-slate-800"
              data-testid="button-refresh-payroll"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      <BentoGrid cols={4} gap="md">
        <BentoTile>
          <StatCard
            label="Total Records"
            value={stats.total}
            icon={<FileText className="w-6 h-6" />}
            className="border-0 bg-transparent"
          />
        </BentoTile>

        <BentoTile>
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
            className="border-0 bg-transparent"
          />
        </BentoTile>

        <BentoTile>
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<Clock className="w-6 h-6 text-yellow-400" />}
            className="border-0 bg-transparent"
          />
        </BentoTile>

        <BentoTile>
          <StatCard
            label="Failed"
            value={stats.failed}
            icon={<AlertCircle className="w-6 h-6 text-red-400" />}
            className="border-0 bg-transparent"
          />
        </BentoTile>
      </BentoGrid>

      <BentoGrid cols={1}>
        <BentoTile>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wide">Active Garnishments</p>
                <p className="text-3xl md:text-4xl font-bold text-white mt-1">{stats.garnishments}</p>
              </div>
              <DollarSign className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
        </BentoTile>
      </BentoGrid>

      <SectionHeader
        title="Analytics"
        subtitle="Payroll processing trends and distribution"
        size="md"
      />

      <BentoGrid cols={2} gap="lg">
        <BentoTile>
          <OrbitCard variant="glass" hover={false} className="h-full border-0 bg-transparent">
            <OrbitCardHeader>
              <OrbitCardTitle>Payroll Trend (Last 5 Days)</OrbitCardTitle>
            </OrbitCardHeader>
            <OrbitCardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line
                    type="monotone"
                    dataKey="processed"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pending"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </OrbitCardContent>
          </OrbitCard>
        </BentoTile>

        <BentoTile>
          <OrbitCard variant="glass" hover={false} className="h-full border-0 bg-transparent">
            <OrbitCardHeader>
              <OrbitCardTitle>Status Distribution</OrbitCardTitle>
            </OrbitCardHeader>
            <OrbitCardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="processed" fill="#10b981" name="Processed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </OrbitCardContent>
          </OrbitCard>
        </BentoTile>
      </BentoGrid>

      <SectionHeader
        title="Recent Activity"
        subtitle="Latest payroll processing records"
        size="md"
      />

      <BentoGrid cols={1}>
        <BentoTile>
          <OrbitCard variant="default" hover={false} className="border-0 bg-transparent">
            <OrbitCardHeader>
              <OrbitCardTitle>Recent Payroll Records</OrbitCardTitle>
            </OrbitCardHeader>
            <OrbitCardContent>
              <div className="text-sm text-slate-400 py-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p>Payroll records will appear here when processing starts</p>
              </div>
            </OrbitCardContent>
          </OrbitCard>
        </BentoTile>
      </BentoGrid>
    </div>
  );
}
