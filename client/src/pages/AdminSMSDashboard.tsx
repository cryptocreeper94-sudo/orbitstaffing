import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MessageCircle, CheckCircle2, AlertCircle, Clock, Send } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

export function AdminSMSDashboard() {
  const [, setLocation] = useLocation();
  const [smsMessages, setSmsMessages] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSmsData();
  }, []);

  const fetchSmsData = async () => {
    try {
      const response = await fetch("/api/sms/stats");
      if (response.ok) {
        const data = await response.json();
        setSmsMessages(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const mockStats = {
    totalSent: 2847,
    successRate: 94.2,
    failedRate: 3.8,
    pendingCount: 45,
    todaySent: 234,
  };

  const messageTypeData = [
    { name: "Shift Offers", value: 892 },
    { name: "Confirmations", value: 756 },
    { name: "Reminders", value: 645 },
    { name: "Bonuses", value: 423 },
    { name: "Alerts", value: 131 },
  ];

  const COLORS = ["#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  const weeklyData = [
    { day: "Mon", sent: 340, success: 320, failed: 20 },
    { day: "Tue", sent: 385, success: 362, failed: 23 },
    { day: "Wed", sent: 412, success: 388, failed: 24 },
    { day: "Thu", sent: 398, success: 375, failed: 23 },
    { day: "Fri", sent: 456, success: 429, failed: 27 },
    { day: "Sat", sent: 312, success: 294, failed: 18 },
    { day: "Sun", sent: 244, success: 232, failed: 12 },
  ];

  const recentMessages = [
    { id: 1, worker: "Marcus Johnson", type: "shift_offer", message: "Your assignment starts tomorrow...", status: "sent", sentAt: "2 hours ago" },
    { id: 2, worker: "Sarah Williams", type: "reminder", message: "Your shift starts in 30 minutes...", status: "sent", sentAt: "30 mins ago" },
    { id: 3, worker: "David Martinez", type: "confirmation", message: "Confirmed - see you at 8 AM", status: "delivered", sentAt: "Just now" },
    { id: 4, worker: "Jessica Lee", type: "bonus_update", message: "You earned $50 referral bonus!", status: "pending", sentAt: "Queued" },
    { id: 5, worker: "Robert Brown", type: "alert", message: "Schedule change for today's assignment", status: "failed", sentAt: "10 mins ago" },
  ];

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <button
          onClick={() => setLocation("/admin-panel")}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">SMS Management</h1>
          <p className="text-xs sm:text-base text-gray-400">Monitor and manage all SMS communications</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Total Sent (All Time)</p>
            <p className="text-xl sm:text-3xl font-bold text-cyan-400">{mockStats.totalSent.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Success Rate</p>
            <p className="text-xl sm:text-3xl font-bold text-emerald-400">{mockStats.successRate}%</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Failed</p>
            <p className="text-xl sm:text-3xl font-bold text-red-400">{mockStats.failedRate}%</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Pending</p>
            <p className="text-xl sm:text-3xl font-bold text-amber-400">{mockStats.pendingCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Today</p>
            <p className="text-xl sm:text-3xl font-bold text-blue-400">{mockStats.todaySent}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Weekly Trend */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Weekly Trend</CardTitle>
            <CardDescription>SMS sent vs delivery success</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "8px" }} />
                <Legend />
                <Bar dataKey="success" stackId="a" fill="#10B981" />
                <Bar dataKey="failed" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Message Types */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Message Types</CardTitle>
            <CardDescription>Distribution by message category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={messageTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {messageTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Messages */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Recent Messages</CardTitle>
          <CardDescription>Latest SMS activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {recentMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 sm:p-4 border border-slate-700 rounded-lg hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="w-4 h-4 text-cyan-400" />
                    <p className="font-bold text-white text-sm sm:text-base">{msg.worker}</p>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400">{msg.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`text-xs whitespace-nowrap ${
                      msg.status === "sent" ? "bg-emerald-500/20 text-emerald-400" :
                      msg.status === "delivered" ? "bg-blue-500/20 text-blue-400" :
                      msg.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                      "bg-red-500/20 text-red-400"
                    }`}
                    data-testid={`badge-status-${msg.id}`}
                  >
                    {msg.status}
                  </Badge>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{msg.sentAt}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
