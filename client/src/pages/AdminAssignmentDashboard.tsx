import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MapPin, Users, Briefcase, CheckCircle2 } from "lucide-react";

export default function AdminAssignmentDashboard() {
  const [stats, setStats] = useState({
    open: 0,
    assigned: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const { connected } = useWebSocket("assignments", (data) => {
    setStats((prev) => ({ ...prev, ...data }));
  });

  useEffect(() => {
    fetchAssignmentStats();
  }, []);

  const fetchAssignmentStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/assignment-stats");
      const result = await response.json();

      if (result.success) {
        setStats(result.stats);
        setChartData([
          { status: "Open", count: result.stats.open },
          { status: "Assigned", count: result.stats.assigned },
          { status: "Completed", count: result.stats.completed },
          { status: "Cancelled", count: result.stats.cancelled },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch assignment stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Assignment Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track job assignments and worker availability
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
          <Button onClick={fetchAssignmentStats} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.open}</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {stats.assigned}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.completed}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">
              {stats.cancelled}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assignment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              Post New Job
            </Button>
            <Button className="w-full" variant="outline">
              View Open Positions
            </Button>
            <Button className="w-full" variant="outline">
              Manage Workers
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Worker Availability Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Worker Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            Worker availability data will appear here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
