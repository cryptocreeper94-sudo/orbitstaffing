import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2, DollarSign, TrendingUp } from "lucide-react";

interface Payout {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  bankAccountLastFour?: string;
}

export default function WorkerPayouts() {
  const queryClient = useQueryClient();
  const [workerId] = useState("current-worker"); // Get from auth context
  const [onboardingUrl, setOnboardingUrl] = useState("");
  const [showSetup, setShowSetup] = useState(false);

  // Get account status
  const { data: accountData, isLoading: accountLoading } = useQuery({
    queryKey: ["stripe-account", workerId],
    queryFn: async () => {
      const res = await fetch(`/api/stripe/connect/account/${workerId}`);
      if (!res.ok) throw new Error("Failed to fetch account");
      return res.json();
    },
  });

  // Get payouts
  const { data: payoutsData, isLoading: payoutsLoading } = useQuery({
    queryKey: ["worker-payouts", workerId],
    queryFn: async () => {
      const res = await fetch(`/api/stripe/payouts/${workerId}`);
      if (!res.ok) throw new Error("Failed to fetch payouts");
      return res.json();
    },
    enabled: !!accountData?.account?.payoutsEnabled,
  });

  // Create account mutation
  const createAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/stripe/connect/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId,
          email: "worker@orbitstaffing.io", // Get from user context
          country: "US",
        }),
      });
      if (!res.ok) throw new Error("Failed to create account");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stripe-account"] });
      getOnboardingLink();
    },
  });

  // Get onboarding link
  const getOnboardingLink = async () => {
    try {
      const res = await fetch("/api/stripe/connect/onboarding-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId,
          returnUrl: "https://orbitstaffing.io/worker/payouts/success",
          refreshUrl: "https://orbitstaffing.io/worker/payouts/refresh",
        }),
      });
      const data = await res.json();
      setOnboardingUrl(data.onboardingUrl);
    } catch (error) {
      console.error("Failed to get onboarding link:", error);
    }
  };

  const account = accountData?.account;
  const payouts = payoutsData?.payouts || [];
  const stats = payoutsData?.stats || {};
  const isActive = account?.accountStatus === "active";
  const isSetupNeeded = !account;

  if (accountLoading || payoutsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400">Worker Payouts</h1>
        <p className="text-slate-400 mt-2">Manage your bank account and view payout history</p>
      </div>

      {/* Status Card */}
      {isSetupNeeded ? (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-semibold">Set up Stripe Connect to receive payouts</p>
              <Button
                onClick={() => createAccountMutation.mutate()}
                disabled={createAccountMutation.isPending}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {createAccountMutation.isPending ? "Setting up..." : "Get Started"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : !isActive ? (
        <Alert className="border-orange-500/50 bg-orange-500/10">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-semibold">Complete your Stripe Connect setup</p>
              <p className="text-sm text-slate-400">
                {account?.requirementsStatus === "currently_due" && "Required information is needed"}
              </p>
              {onboardingUrl && (
                <Button
                  onClick={() => window.open(onboardingUrl, "_blank")}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  Continue Setup
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-200">
            ✓ Your account is active and ready to receive payouts
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      {isActive && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-slate-900/50 border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Paid</p>
                <p className="text-2xl font-bold text-cyan-400">
                  ${(stats.paidAmount || 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-cyan-500/50" />
            </div>
          </Card>

          <Card className="p-4 bg-slate-900/50 border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">
                  ${(stats.pendingAmount || 0).toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500/50" />
            </div>
          </Card>

          <Card className="p-4 bg-slate-900/50 border-slate-700">
            <div>
              <p className="text-slate-400 text-sm">Total Payouts</p>
              <p className="text-2xl font-bold text-slate-200">{stats.totalPayouts || 0}</p>
            </div>
          </Card>

          <Card className="p-4 bg-slate-900/50 border-slate-700">
            <div>
              <p className="text-slate-400 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-slate-200">
                ${(stats.totalAmount || 0).toFixed(2)}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Payout History */}
      {isActive && payouts.length > 0 && (
        <Card className="p-6 bg-slate-900/50 border-slate-700">
          <h2 className="text-xl font-bold text-slate-200 mb-4">Payout History</h2>
          <div className="space-y-3">
            {payouts.map((payout: Payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <div className="flex-1">
                  <p className="font-semibold text-slate-200">
                    ${(Number(payout.amount) / 100).toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-400">
                    {new Date(payout.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    payout.status === "paid" ? "text-green-400" :
                    payout.status === "pending" ? "text-yellow-400" :
                    "text-red-400"
                  }`}>
                    {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                  </p>
                  <p className="text-xs text-slate-400">{payout.bankAccountLastFour && `●●●${payout.bankAccountLastFour}`}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {isActive && payouts.length === 0 && (
        <Card className="p-6 bg-slate-900/50 border-slate-700 text-center">
          <p className="text-slate-400">No payouts yet. Start working to earn money!</p>
        </Card>
      )}
    </div>
  );
}
