import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, TrendingUp, Trophy, DollarSign } from "lucide-react";

interface BonusData {
  weekStartDate: string;
  baseBonus: number;
  attendanceBonus: number;
  hoursBonus: number;
  referralBonus: number;
  totalBonus: number;
  attendanceStreak: number;
  perfectDays: number;
  status: string;
}

export function WorkerBonusTracker() {
  const [bonuses, setBonuses] = useState<BonusData[]>([]);
  const [currentBonus, setCurrentBonus] = useState<BonusData | null>(null);

  useEffect(() => {
    const mockBonuses: BonusData[] = [
      {
        weekStartDate: "2025-11-24",
        baseBonus: 50,
        attendanceBonus: 35,
        hoursBonus: 0,
        referralBonus: 0,
        totalBonus: 85,
        attendanceStreak: 5,
        perfectDays: 5,
        status: "pending",
      },
      {
        weekStartDate: "2025-11-17",
        baseBonus: 50,
        attendanceBonus: 35,
        hoursBonus: 25,
        referralBonus: 0,
        totalBonus: 110,
        attendanceStreak: 10,
        perfectDays: 5,
        status: "paid",
      },
    ];
    setBonuses(mockBonuses);
    setCurrentBonus(mockBonuses[0]);
  }, []);

  if (!currentBonus) return null;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">Bonus Tracker</h1>
          <p className="text-xs sm:text-base text-gray-400">Real-time earnings and performance bonuses</p>
        </div>

        {/* This Week Overview - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
          {/* Total Bonus */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                This Week Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">${currentBonus.totalBonus.toFixed(2)}</div>
              <Badge className={currentBonus.status === "paid" ? "bg-green-500/20 text-green-600 mt-2" : "bg-blue-500/20 text-blue-600 mt-2"}>
                {currentBonus.status === "paid" ? "✓ Paid" : "Pending Approval"}
              </Badge>
            </CardContent>
          </Card>

          {/* Attendance Bonus */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">${currentBonus.attendanceBonus.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-2">{currentBonus.perfectDays}/5 perfect days</p>
            </CardContent>
          </Card>

          {/* Base Bonus */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">${currentBonus.baseBonus.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-2">Weekly base</p>
            </CardContent>
          </Card>

          {/* Hours Bonus */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Hours Milestone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">${currentBonus.hoursBonus.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-2">Extra hours worked</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Details */}
        <Card className="bg-card/50 border-border/50 mb-8">
          <CardHeader>
            <CardTitle>This Week Performance</CardTitle>
            <CardDescription>Your earning breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <span className="text-muted-foreground">Perfect Days (No Tardiness)</span>
                <Badge className="bg-green-500/20 text-green-600">{currentBonus.perfectDays} / 5 ✓</Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <span className="text-muted-foreground">Attendance Streak</span>
                <Badge className="bg-amber-500/20 text-amber-600">{currentBonus.attendanceStreak} days</Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <span className="text-muted-foreground">Status</span>
                <Badge className={currentBonus.status === "paid" ? "bg-green-500/20 text-green-600" : "bg-yellow-500/20 text-yellow-600"}>
                  {currentBonus.status === "paid" ? "Paid ✓" : "Pending Review"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bonus History */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Bonus History</CardTitle>
            <CardDescription>Last 8 weeks of earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bonuses.map((bonus, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">Week of {new Date(bonus.weekStartDate).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">Base: ${bonus.baseBonus} + Attendance: ${bonus.attendanceBonus} + Hours: ${bonus.hoursBonus}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-400">${bonus.totalBonus.toFixed(2)}</p>
                    <Badge className={bonus.status === "paid" ? "bg-green-500/20 text-green-600 text-xs" : "bg-blue-500/20 text-blue-600 text-xs"}>
                      {bonus.status === "paid" ? "✓ Paid" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
