import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Crown,
  Key,
  BarChart3,
  CreditCard,
  RefreshCw,
  Copy,
  Check,
  ChevronLeft,
  Zap,
  AlertTriangle,
  ExternalLink,
  ArrowUpRight,
  Eye,
  EyeOff,
} from "lucide-react";

interface SubscriptionData {
  tier: string;
  subscriptionStatus: string;
  apiCallsThisMonth: number;
  apiCallLimit: number;
  stripeSubscriptionId: string | null;
  subscription: {
    status: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
  } | null;
}

interface DeveloperProfile {
  id: string;
  email: string;
  name: string;
  company: string;
  tier: string;
  apiCallsThisMonth: number;
  apiCallLimit: number;
  status: string;
  createdAt: string;
}

const TIER_INFO: Record<string, { name: string; color: string; icon: React.ReactNode }> = {
  starter: { name: "Starter", color: "from-slate-500 to-slate-600", icon: <Zap className="w-5 h-5" /> },
  pro: { name: "Pro", color: "from-cyan-500 to-blue-600", icon: <Crown className="w-5 h-5" /> },
  enterprise: { name: "Enterprise", color: "from-purple-500 to-indigo-600", icon: <Crown className="w-5 h-5" /> },
};

export default function DeveloperAccount() {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const { toast } = useToast();

  const apiKey = localStorage.getItem("orbit_developer_api_key");

  useEffect(() => {
    if (!apiKey) {
      setLocation("/developers");
      return;
    }
    fetchData();
  }, [apiKey]);

  const fetchData = async () => {
    if (!apiKey) return;
    
    try {
      const [profileRes, subscriptionRes] = await Promise.all([
        fetch("/api/developers/me", {
          headers: { Authorization: `Bearer ${apiKey}` },
        }),
        fetch("/api/developers/subscription", {
          headers: { Authorization: `Bearer ${apiKey}` },
        }),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      if (subscriptionRes.ok) {
        const subscriptionData = await subscriptionRes.json();
        setSubscription(subscriptionData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error",
        description: "Failed to load account data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyApiKey = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
    toast({ title: "API Key copied to clipboard" });
  };

  const handleRegenerateKey = async () => {
    if (!apiKey) return;
    setRegenerating(true);
    
    try {
      const response = await fetch("/api/developers/regenerate-key", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      const data = await response.json();
      if (data.success && data.apiSecret) {
        toast({
          title: "API Secret Regenerated",
          description: "Your new API secret has been generated. Save it securely!",
        });
      } else {
        throw new Error(data.error || "Failed to regenerate key");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate API key",
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!apiKey) return;
    setCanceling(true);
    
    try {
      const response = await fetch("/api/developers/cancel-subscription", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Subscription Canceled",
          description: data.message,
        });
        fetchData();
      } else {
        throw new Error(data.error || "Failed to cancel subscription");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    if (!apiKey) return;
    
    try {
      const response = await fetch("/api/developers/billing-portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      const data = await response.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error(data.error || "Failed to open billing portal");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal",
        variant: "destructive",
      });
    }
  };

  const handleUpgrade = (tier: string) => {
    setLocation(`/developers#pricing`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  const tier = subscription?.tier || "starter";
  const tierInfo = TIER_INFO[tier] || TIER_INFO.starter;
  const usagePercent = subscription ? (subscription.apiCallsThisMonth / subscription.apiCallLimit) * 100 : 0;
  const isNearLimit = usagePercent >= 80;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <button
        onClick={() => setLocation("/developers")}
        className="fixed top-6 left-6 z-50 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
        data-testid="button-back-portal"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-account-title">
            Developer Account
          </h1>
          <p className="text-gray-400">Manage your subscription, API keys, and usage</p>
        </div>

        <div className="grid gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50" data-testid="card-plan">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tierInfo.color} flex items-center justify-center text-white`}>
                  {tierInfo.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{tierInfo.name} Plan</h2>
                  <p className="text-gray-400">
                    {tier === "starter" && "Free tier with 1,000 API calls/month"}
                    {tier === "pro" && "$49/month • 50,000 API calls/month"}
                    {tier === "enterprise" && "Custom pricing • Unlimited API calls"}
                  </p>
                </div>
              </div>
              {subscription?.subscription?.cancelAtPeriodEnd && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Cancels Soon
                </Badge>
              )}
            </div>

            {subscription?.subscription && (
              <p className="text-sm text-gray-500 mb-4">
                {subscription.subscription.cancelAtPeriodEnd
                  ? `Access until ${new Date(subscription.subscription.currentPeriodEnd * 1000).toLocaleDateString()}`
                  : `Renews on ${new Date(subscription.subscription.currentPeriodEnd * 1000).toLocaleDateString()}`}
              </p>
            )}

            <div className="flex gap-3 flex-wrap">
              {tier === "starter" && (
                <Button
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  onClick={() => handleUpgrade("pro")}
                  data-testid="button-upgrade-pro"
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              )}
              {tier === "pro" && !subscription?.subscription?.cancelAtPeriodEnd && (
                <>
                  <Button
                    variant="outline"
                    className="border-slate-600"
                    onClick={handleCancelSubscription}
                    disabled={canceling}
                    data-testid="button-cancel-subscription"
                  >
                    {canceling ? "Canceling..." : "Cancel Subscription"}
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-purple-500 to-indigo-600"
                    onClick={() => handleUpgrade("enterprise")}
                    data-testid="button-upgrade-enterprise"
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Upgrade to Enterprise
                  </Button>
                </>
              )}
              {subscription?.stripeSubscriptionId && (
                <Button
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-400"
                  onClick={handleOpenBillingPortal}
                  data-testid="button-billing-portal"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing Portal
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50" data-testid="card-usage">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-bold">API Usage This Month</h3>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">
                  {subscription?.apiCallsThisMonth?.toLocaleString() || 0} / {subscription?.apiCallLimit?.toLocaleString() || 1000} calls
                </span>
                <span className={isNearLimit ? "text-yellow-400" : "text-gray-400"}>
                  {usagePercent.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={Math.min(usagePercent, 100)}
                className={`h-3 ${isNearLimit ? "[&>div]:bg-yellow-500" : "[&>div]:bg-cyan-500"}`}
              />
            </div>

            {isNearLimit && tier === "starter" && (
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-400">Approaching limit</p>
                  <p className="text-sm text-gray-400">
                    You're using {usagePercent.toFixed(0)}% of your monthly quota. Upgrade to Pro for 50x more API calls.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50" data-testid="card-api-key">
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-bold">API Key</h3>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 p-3 rounded-lg bg-slate-900 border border-slate-700 font-mono text-sm">
                {showApiKey ? apiKey : `${apiKey?.substring(0, 12)}${"•".repeat(24)}`}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-slate-600"
                onClick={() => setShowApiKey(!showApiKey)}
                data-testid="button-toggle-key"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-slate-600"
                onClick={handleCopyApiKey}
                data-testid="button-copy-key"
              >
                {apiKeyCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <Button
              variant="outline"
              className="border-slate-600"
              onClick={handleRegenerateKey}
              disabled={regenerating}
              data-testid="button-regenerate-key"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? "animate-spin" : ""}`} />
              {regenerating ? "Regenerating..." : "Regenerate API Secret"}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              This will invalidate your current API secret. Make sure to update your applications.
            </p>
          </div>

          {profile && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50" data-testid="card-profile">
              <h3 className="text-xl font-bold mb-4">Account Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{profile.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Company</p>
                  <p className="font-medium">{profile.company || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Member Since</p>
                  <p className="font-medium">
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
