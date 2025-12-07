import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail, CarouselRailItem } from "@/components/ui/carousel-rail";
import { PageHeader, SectionHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent, StatCard } from "@/components/ui/orbit-card";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, Trophy, DollarSign, ArrowLeft } from "lucide-react";

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
        <PageHeader
          title="Bonus Tracker"
          subtitle="Real-time earnings and performance bonuses"
          breadcrumb={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-white -ml-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          }
        />

        <BentoGrid cols={4} gap="md" className="mb-8">
          <BentoTile>
            <StatCard
              label="This Week Total"
              value={`$${currentBonus.totalBonus.toFixed(2)}`}
              icon={<DollarSign className="w-6 h-6" />}
              className="border-0 bg-transparent h-full"
            />
            <div className="px-4 pb-4 -mt-2">
              <Badge className={currentBonus.status === "paid" ? "bg-green-500/20 text-green-600" : "bg-blue-500/20 text-blue-600"}>
                {currentBonus.status === "paid" ? "✓ Paid" : "Pending Approval"}
              </Badge>
            </div>
          </BentoTile>

          <BentoTile>
            <StatCard
              label="Attendance"
              value={`$${currentBonus.attendanceBonus.toFixed(2)}`}
              icon={<Trophy className="w-6 h-6 text-amber-500" />}
              className="border-0 bg-transparent h-full"
            />
            <div className="px-4 pb-4 -mt-2">
              <p className="text-xs text-muted-foreground">{currentBonus.perfectDays}/5 perfect days</p>
            </div>
          </BentoTile>

          <BentoTile>
            <StatCard
              label="Performance"
              value={`$${currentBonus.baseBonus.toFixed(2)}`}
              icon={<Zap className="w-6 h-6 text-blue-500" />}
              className="border-0 bg-transparent h-full"
            />
            <div className="px-4 pb-4 -mt-2">
              <p className="text-xs text-muted-foreground">Weekly base</p>
            </div>
          </BentoTile>

          <BentoTile>
            <StatCard
              label="Hours Milestone"
              value={`$${currentBonus.hoursBonus.toFixed(2)}`}
              icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
              className="border-0 bg-transparent h-full"
            />
            <div className="px-4 pb-4 -mt-2">
              <p className="text-xs text-muted-foreground">Extra hours worked</p>
            </div>
          </BentoTile>
        </BentoGrid>

        <BentoGrid cols={1} gap="md" className="mb-8">
          <BentoTile>
            <OrbitCard variant="glass" hover={false} className="border-0 bg-transparent">
              <OrbitCardHeader>
                <div>
                  <OrbitCardTitle>This Week Performance</OrbitCardTitle>
                  <OrbitCardDescription>Your earning breakdown</OrbitCardDescription>
                </div>
              </OrbitCardHeader>
              <OrbitCardContent>
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
              </OrbitCardContent>
            </OrbitCard>
          </BentoTile>
        </BentoGrid>

        <CarouselRail
          title="Bonus History"
          subtitle="Last 8 weeks of earnings"
          showArrows={true}
          gap="md"
          itemWidth="lg"
          className="mb-8"
        >
          {bonuses.map((bonus, idx) => (
            <CarouselRailItem key={idx}>
              <OrbitCard className="h-full min-w-[280px]">
                <OrbitCardHeader>
                  <div>
                    <OrbitCardTitle className="text-base">
                      Week of {new Date(bonus.weekStartDate).toLocaleDateString()}
                    </OrbitCardTitle>
                    <OrbitCardDescription>
                      Base: ${bonus.baseBonus} + Attendance: ${bonus.attendanceBonus} + Hours: ${bonus.hoursBonus}
                    </OrbitCardDescription>
                  </div>
                </OrbitCardHeader>
                <OrbitCardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-emerald-400">${bonus.totalBonus.toFixed(2)}</p>
                    <Badge className={bonus.status === "paid" ? "bg-green-500/20 text-green-600" : "bg-blue-500/20 text-blue-600"}>
                      {bonus.status === "paid" ? "✓ Paid" : "Pending"}
                    </Badge>
                  </div>
                </OrbitCardContent>
              </OrbitCard>
            </CarouselRailItem>
          ))}
        </CarouselRail>
      </div>
    </div>
  );
}
