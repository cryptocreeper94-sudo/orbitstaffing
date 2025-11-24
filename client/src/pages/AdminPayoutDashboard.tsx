import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";

export default function AdminPayoutDashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["admin-payouts-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/stripe/admin/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  const data = dashboardData || {
    totalWorkers: 0,
    workersOnboarded: 0,
    totalPayouted: 0,
    pendingPayouts: 0,
    failedPayouts: 0,
    failedWorkers: [],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400">Payout Management</h1>
        <p className="text-slate-400 mt-2">Monitor worker payout status and Stripe Connect accounts</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900/50 border-slate-700">
          <p className="text-slate-400 text-sm">Workers Onboarded</p>
          <p className="text-3xl font-bold text-cyan-400">
            {data.workersOnboarded}/{data.totalWorkers}
          </p>
        </Card>

        <Card className="p-4 bg-slate-900/50 border-slate-700">
          <p className="text-slate-400 text-sm">Total Paid Out</p>
          <p className="text-3xl font-bold text-green-400">${data.totalPayouted.toFixed(2)}</p>
        </Card>

        <Card className="p-4 bg-slate-900/50 border-slate-700">
          <p className="text-slate-400 text-sm">Pending Payouts</p>
          <p className="text-3xl font-bold text-yellow-400">${data.pendingPayouts.toFixed(2)}</p>
        </Card>
      </div>

      {/* Issues Alert */}
      {data.failedWorkers?.length > 0 && (
        <Card className="p-4 bg-red-500/10 border-red-500/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-400 mb-2">Failed Payouts</p>
              <p className="text-sm text-red-200">
                {data.failedWorkers.length} worker(s) have payout failures. Review bank account details.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Features Coming Soon */}
      <Card className="p-6 bg-slate-900/50 border-slate-700">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Full Dashboard Coming Soon
        </h2>
        <div className="space-y-2 text-slate-400 text-sm">
          <p>✓ Real-time payout status</p>
          <p>✓ Worker account verification status</p>
          <p>✓ Batch payout processing</p>
          <p>✓ Dispute resolution</p>
          <p>✓ Revenue share calculations</p>
        </div>
      </Card>
    </div>
  );
}
