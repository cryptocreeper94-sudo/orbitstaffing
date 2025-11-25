import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function AdminComplianceMonitor() {
  const [summary, setSummary] = useState({
    totalWorkers: 0,
    backgroundChecks: [],
    drugTests: [],
    complianceStatus: [],
  });

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [expiringCounts, setExpiringCounts] = useState({
    thirtyDays: 12,
    fourteenDays: 5,
    sevenDays: 2,
  });

  useEffect(() => {
    fetchComplianceSummary();
  }, []);

  const fetchComplianceSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/compliance-summary");
      const result = await response.json();

      if (result.success) {
        setSummary(result.summary);
        setChartData([
          { category: "Background Checks", pending: 8, completed: 92, failed: 2 },
          { category: "Drug Tests", pending: 5, completed: 94, failed: 1 },
          { category: "Compliance", pending: 3, completed: 97, failed: 0 },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch compliance summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Compliance Monitor</h1>
          <p className="text-gray-600 mt-1">
            Workforce compliance overview and management
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">Export Report</Button>
          <Button>Batch Request Checks</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Workers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalWorkers || 250}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {expiringCounts.thirtyDays}
            </div>
            <p className="text-xs text-gray-600 mt-1">Within 30 days</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">18</div>
            <p className="text-xs text-gray-600 mt-1">Awaiting results</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Compliant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">92%</div>
            <p className="text-xs text-gray-600 mt-1">Current status</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Status by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Compliant", value: 230 },
                    { name: "Non-Compliant", value: 15 },
                    { name: "Pending", value: 5 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#f59e0b" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Expiry Warnings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Expiry Warnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div>
                <p className="font-semibold">Critical (0-7 days)</p>
                <p className="text-sm text-gray-600">
                  {expiringCounts.sevenDays} workers need immediate renewal
                </p>
              </div>
              <Button size="sm" variant="destructive">
                Renew Now
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div>
                <p className="font-semibold">Warning (8-14 days)</p>
                <p className="text-sm text-gray-600">
                  {expiringCounts.fourteenDays} workers expiring soon
                </p>
              </div>
              <Button size="sm" variant="outline">
                Schedule Renewal
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="font-semibold">Upcoming (15-30 days)</p>
                <p className="text-sm text-gray-600">
                  {expiringCounts.thirtyDays - expiringCounts.fourteenDays} workers
                  expiring in 30 days
                </p>
              </div>
              <Button size="sm" variant="outline">
                Plan Ahead
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Gaps */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Gaps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Missing Background Checks</span>
              <Badge variant="secondary">8 workers</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Missing Drug Tests</span>
              <Badge variant="secondary">5 workers</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Missing I-9 Verification</span>
              <Badge variant="secondary">3 workers</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Expired Compliance Checks</span>
              <Badge variant="destructive">2 workers</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Items */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Compliance Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              18 compliance items pending completion:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>8 Background checks awaiting completion</li>
              <li>5 Drug tests pending results</li>
              <li>5 I-9 verifications pending</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
