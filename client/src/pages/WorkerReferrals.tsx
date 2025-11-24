import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Share2, DollarSign, TrendingUp } from "lucide-react";

interface Referral {
  id: string;
  referredName: string;
  startDate: string;
  status: string;
  bonusEarned: number;
  daysEmployed: number;
}

export function WorkerReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const mockReferrals: Referral[] = [
      {
        id: "1",
        referredName: "Marcus Johnson",
        startDate: "Oct 15, 2025",
        status: "paid",
        bonusEarned: 100,
        daysEmployed: 40,
      },
      {
        id: "2",
        referredName: "Sarah Williams",
        startDate: "Oct 28, 2025",
        status: "paid",
        bonusEarned: 100,
        daysEmployed: 25,
      },
      {
        id: "3",
        referredName: "David Martinez",
        startDate: "Nov 5, 2025",
        status: "earning",
        bonusEarned: 0,
        daysEmployed: 19,
      },
    ];
    setReferrals(mockReferrals);
    setTotalEarnings(200); // Paid referrals only
  }, []);

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
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-500">${totalEarnings}</div>
              <p className="text-xs text-muted-foreground mt-1">From paid referrals</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{referrals.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Total referred</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Still Earning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">{referrals.filter(r => r.status === "earning").length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active bonuses pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Share Button */}
        <Card className="bg-card/50 border-border/50 mb-8 border-2 border-emerald-500/30">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">Refer a Friend</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Share your unique referral code to earn $100 per qualified hire</p>
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm min-h-[44px] whitespace-nowrap" data-testid="button-share-referral">
                <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Share Code
              </Button>
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
            <div className="space-y-3">
              {referrals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No referrals yet. Start referring friends!</p>
              ) : (
                referrals.map((ref) => (
                  <div key={ref.id} className="flex justify-between items-start p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold text-white">{ref.referredName}</p>
                      <p className="text-sm text-muted-foreground">Started {ref.startDate}</p>
                      <p className="text-xs text-muted-foreground mt-1">{ref.daysEmployed} days employed</p>
                    </div>
                    <div className="text-right">
                      {ref.status === "paid" ? (
                        <>
                          <p className="text-lg font-bold text-emerald-400">${ref.bonusEarned}</p>
                          <Badge className="bg-green-500/20 text-green-600 text-xs mt-2">✓ Paid</Badge>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-bold text-yellow-500">Pending</p>
                          <Badge className="bg-yellow-500/20 text-yellow-600 text-xs mt-2">30-day wait</Badge>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
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
