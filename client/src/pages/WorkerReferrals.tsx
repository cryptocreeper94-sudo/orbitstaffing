import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Share2, DollarSign, TrendingUp, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Referral {
  id: string;
  referredWorkerId: string;
  referredWorkerName: string;
  referredWorkerPhone: string;
  referredWorkerStatus: string;
  bonusStatus: string;
  bonusAmount: string;
  hoursWorkedByReferred: string;
  minimumHoursRequired: string;
  referralDate: string;
  bonusEarnedDate?: string;
  bonusPaidDate?: string;
}

interface ReferralEarnings {
  totalEarnings: number;
  earnedButUnpaid: number;
  totalPaid: number;
}

export function WorkerReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [earnings, setEarnings] = useState<ReferralEarnings>({ totalEarnings: 0, earnedButUnpaid: 0, totalPaid: 0 });
  const [referralLink, setReferralLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const mockWorkerId = "demo-worker-123";

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const [referralsRes, earningsRes, linkRes] = await Promise.all([
        fetch(`/api/workers/${mockWorkerId}/referrals`),
        fetch(`/api/workers/${mockWorkerId}/referral-earnings`),
        fetch(`/api/workers/${mockWorkerId}/referral-link`, { method: "POST" })
      ]);

      if (referralsRes.ok) {
        const referralsData = await referralsRes.json();
        setReferrals(referralsData);
      }

      if (earningsRes.ok) {
        const earningsData = await earningsRes.json();
        setEarnings(earningsData);
      }

      if (linkRes.ok) {
        const linkData = await linkRes.json();
        setReferralLink(linkData.referralLink);
      }
    } catch (error) {
      console.error("Failed to load referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Share your referral link to start earning bonuses",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please manually copy the link",
        variant: "destructive",
      });
    }
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join ORBIT Staffing",
        text: "Apply to work with ORBIT using my referral link and we both earn!",
        url: referralLink,
      }).catch((error) => console.log("Error sharing:", error));
    } else {
      copyReferralLink();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (referral: Referral) => {
    if (referral.bonusStatus === "paid") {
      return <Badge className="bg-green-500/20 text-green-600 text-xs">✓ Paid</Badge>;
    } else if (referral.bonusStatus === "earned") {
      return <Badge className="bg-yellow-500/20 text-yellow-600 text-xs">Earned (Pending Payroll)</Badge>;
    } else {
      const hours = parseFloat(referral.hoursWorkedByReferred || "0");
      const required = parseFloat(referral.minimumHoursRequired || "40");
      const remaining = Math.max(0, required - hours);
      return <Badge className="bg-blue-500/20 text-blue-600 text-xs">{remaining.toFixed(0)} hrs to bonus</Badge>;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => window.history.back()}
            className="text-gray-400 hover:text-white transition-colors p-2 -ml-2 min-h-[44px] flex items-center"
            data-testid="button-back"
            title="Back"
          >
            ← Back
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">Referral Program</h1>
          <p className="text-xs sm:text-base text-gray-400">Earn $100 for each qualified worker you refer</p>
        </div>

        {/* Summary Cards - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-8">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Total Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-500" data-testid="total-paid-earnings">${earnings.totalPaid}</div>
              <p className="text-xs text-muted-foreground mt-1">From paid referrals</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500" data-testid="total-referrals">{referrals.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Workers referred</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-500" />
                Pending Bonuses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500" data-testid="earned-unpaid">${earnings.earnedButUnpaid}</div>
              <p className="text-xs text-muted-foreground mt-1">Earned, awaiting payroll</p>
            </CardContent>
          </Card>
        </div>

        {/* Share Button */}
        <Card className="bg-card/50 border-border/50 mb-8 border-2 border-emerald-500/30">
          <CardContent className="pt-4 sm:pt-6">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">Refer a Friend - Earn $100</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Share your unique referral link to earn $100 per qualified hire</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={copyReferralLink} 
                    variant="outline"
                    className="text-xs sm:text-sm min-h-[44px]" 
                    data-testid="button-copy-link"
                    disabled={!referralLink}
                  >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                  <Button 
                    onClick={shareReferralLink} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm min-h-[44px] whitespace-nowrap" 
                    data-testid="button-share-referral"
                    disabled={!referralLink}
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Share
                  </Button>
                </div>
              </div>
              {referralLink && (
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Your referral link:</p>
                  <p className="text-xs text-white font-mono break-all" data-testid="referral-link">{referralLink}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Referrals List */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
            <CardDescription>Track who you've referred and bonus status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading referrals...</p>
            ) : (
              <div className="space-y-3">
                {referrals.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No referrals yet. Start referring friends!</p>
                    <p className="text-sm text-gray-400">Share your referral link above to earn $100 per hire</p>
                  </div>
                ) : (
                  referrals.map((ref) => (
                    <div key={ref.id} className="flex justify-between items-start p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:bg-slate-800/50 transition-colors" data-testid={`referral-item-${ref.id}`}>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{ref.referredWorkerName}</p>
                        <p className="text-sm text-muted-foreground">Applied {formatDate(ref.referralDate)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {parseFloat(ref.hoursWorkedByReferred || "0").toFixed(1)} hrs worked
                          {ref.referredWorkerStatus && ` • Status: ${ref.referredWorkerStatus}`}
                        </p>
                      </div>
                      <div className="text-right">
                        {ref.bonusStatus === "paid" ? (
                          <>
                            <p className="text-lg font-bold text-emerald-400">${parseFloat(ref.bonusAmount || "0").toFixed(0)}</p>
                            {getStatusBadge(ref)}
                          </>
                        ) : ref.bonusStatus === "earned" ? (
                          <>
                            <p className="text-lg font-bold text-yellow-500">${parseFloat(ref.bonusAmount || "0").toFixed(0)}</p>
                            {getStatusBadge(ref)}
                          </>
                        ) : (
                          <>
                            <p className="text-lg font-bold text-blue-400">$100</p>
                            {getStatusBadge(ref)}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-card/50 border-border/50 mt-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-semibold flex-shrink-0">1</div>
                <div>
                  <p className="font-semibold text-white">Share Your Code</p>
                  <p className="text-sm text-muted-foreground">Give your unique referral code to anyone interested in working</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-500 font-semibold flex-shrink-0">2</div>
                <div>
                  <p className="font-semibold text-white">They Apply & Get Hired</p>
                  <p className="text-sm text-muted-foreground">Your friend applies using your code and completes their first assignment</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-500 font-semibold flex-shrink-0">3</div>
                <div>
                  <p className="font-semibold text-white">Earn $100 Bonus</p>
                  <p className="text-sm text-muted-foreground">After 30 days of employment, $100 is added to your next paycheck</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
