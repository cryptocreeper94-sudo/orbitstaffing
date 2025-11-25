import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AlertCircle, Briefcase, TrendingUp } from "lucide-react";

export default function AdminGarnishmentDashboard() {
  const [stats, setStats] = useState({
    childSupport: 0,
    taxLevy: 0,
    studentLoan: 0,
    creditor: 0,
    total: 0,
    pending: 0,
    completed: 0,
  });

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6"];

  const { connected } = useWebSocket("garnishments", (data) => {
    setStats((prev) => ({ ...prev, ...data }));
  });

  useEffect(() => {
    fetchGarnishmentStats();
  }, []);

  const fetchGarnishmentStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/garnishment-stats");
      const result = await response.json();

      if (result.success) {
        setStats(result.stats);
        setChartData([
          { name: "Child Support", value: result.stats.childSupport },
          { name: "Tax Levy", value: result.stats.taxLevy },
          { name: "Student Loan", value: result.stats.studentLoan },
          { name: "Creditor", value: result.stats.creditor },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch garnishment stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Garnishment Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track active garnishments and payment distributions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm text-gray-600">
            {connected ? "Live" : "Offline"}
          </span>
          <Button onClick={fetchGarnishmentStats} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Garnishments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.completed}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Garnishment Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Garnishment Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Child Support</span>
                <span className="font-semibold">{stats.childSupport}</span>
              </div>
              <div className="w-full bg-gray-200 rounded h-2">
                <div
                  className="bg-red-500 h-2 rounded"
                  style={{
                    width: `${(stats.childSupport / stats.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Tax Levy</span>
                <span className="font-semibold">{stats.taxLevy}</span>
              </div>
              <div className="w-full bg-gray-200 rounded h-2">
                <div
                  className="bg-yellow-500 h-2 rounded"
                  style={{ width: `${(stats.taxLevy / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Student Loan</span>
                <span className="font-semibold">{stats.studentLoan}</span>
              </div>
              <div className="w-full bg-gray-200 rounded h-2">
                <div
                  className="bg-blue-500 h-2 rounded"
                  style={{
                    width: `${(stats.studentLoan / stats.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Creditor</span>
                <span className="font-semibold">{stats.creditor}</span>
              </div>
              <div className="w-full bg-gray-200 rounded h-2">
                <div
                  className="bg-purple-500 h-2 rounded"
                  style={{ width: `${(stats.creditor / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiry Warnings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Expiring Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            No garnishments expiring in the next 30 days
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            Payment records will appear here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
