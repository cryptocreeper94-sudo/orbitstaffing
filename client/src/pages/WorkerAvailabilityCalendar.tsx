import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, ArrowLeft } from "lucide-react";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { PageHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent } from "@/components/ui/orbit-card";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS = ["Morning (6-12)", "Afternoon (12-5)", "Evening (5-10)", "Night (10-6)"];

export function WorkerAvailabilityCalendar() {
  const [availability, setAvailability] = useState<Record<string, Record<string, boolean>>>({
    "2025-11-24": { morning: true, afternoon: true, evening: false, night: false },
    "2025-11-25": { morning: true, afternoon: true, evening: true, night: false },
  });

  const toggleSlot = (date: string, slot: string) => {
    setAvailability({
      ...availability,
      [date]: {
        ...availability[date],
        [slot]: !availability[date]?.[slot],
      },
    });
  };

  const getDatesForWeek = () => {
    const today = new Date(2025, 10, 24); // Nov 24, 2025
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = getDatesForWeek();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Your Availability"
          subtitle="Set when you're available for work. More availability = more shift offers!"
          breadcrumb={
            <button
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-white transition-colors p-2 -ml-2 min-h-[44px] flex items-center gap-1"
              data-testid="button-back"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          }
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="text-[10px] sm:text-xs min-h-[40px]" data-testid="button-set-full-week">
                Full Week
              </Button>
              <Button variant="outline" size="sm" className="text-[10px] sm:text-xs min-h-[40px]" data-testid="button-set-weekdays">
                Weekdays
              </Button>
              <Button variant="outline" size="sm" className="text-[10px] sm:text-xs min-h-[40px]" data-testid="button-clear-all">
                Clear All
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs min-h-[40px]" data-testid="button-save">
                Save Changes
              </Button>
            </div>
          }
        />

        <OrbitCard variant="glass" className="mb-6">
          <OrbitCardHeader icon={<Calendar className="w-5 h-5 text-cyan-400" />}>
            <OrbitCardTitle>Next 2 Weeks</OrbitCardTitle>
            <OrbitCardDescription>Click to toggle availability. Green = available, Gray = unavailable</OrbitCardDescription>
          </OrbitCardHeader>
          <OrbitCardContent className="overflow-x-auto">
            <BentoGrid cols={4} gap="sm" className="lg:grid-cols-7">
              {dates.map((date, dateIdx) => {
                const dateStr = date.toISOString().split("T")[0];
                const dayAvail = availability[dateStr] || {};
                const isAvailableDay = Object.values(dayAvail).some(v => v);

                return (
                  <BentoTile key={dateIdx} className="p-2 sm:p-4">
                    <div className="mb-2 sm:mb-4 pb-2 sm:pb-3 border-b border-slate-700/30">
                      <p className="font-semibold text-white text-sm sm:text-base">{DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{date.toLocaleDateString()}</p>
                      {isAvailableDay && <Badge className="bg-green-500/20 text-green-600 text-[10px] sm:text-xs mt-1 sm:mt-2">Available</Badge>}
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      {TIME_SLOTS.map((slot, idx) => {
                        const slotKey = slot.split(" ")[0].toLowerCase();
                        const isSelected = dayAvail[slotKey] || false;

                        return (
                          <button
                            key={idx}
                            onClick={() => toggleSlot(dateStr, slotKey)}
                            className={`w-full text-left p-2 sm:p-3 rounded-lg border transition-all text-xs sm:text-sm min-h-[40px] flex items-center ${
                              isSelected
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                                : "bg-slate-700/20 border-slate-600/30 text-muted-foreground hover:bg-slate-700/40"
                            }`}
                            data-testid={`slot-${dateStr}-${slotKey}`}
                          >
                            <Clock className="w-3 h-3 flex-shrink-0 mr-1 sm:mr-2" />
                            <span className="truncate">{slot}</span>
                          </button>
                        );
                      })}
                    </div>
                  </BentoTile>
                );
              })}
            </BentoGrid>
          </OrbitCardContent>
        </OrbitCard>

        <OrbitCard variant="default">
          <OrbitCardHeader>
            <OrbitCardTitle>Pro Tips</OrbitCardTitle>
          </OrbitCardHeader>
          <OrbitCardContent className="space-y-3">
            <div className="flex gap-3">
              <Plus className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-white text-sm">More Slots = More Offers</p>
                <p className="text-sm text-muted-foreground">Workers with flexible availability get first pick of premium shifts</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Plus className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-white text-sm">Update Weekly</p>
                <p className="text-sm text-muted-foreground">Update your availability each week to ensure you get shifts that fit your schedule</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Plus className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-white text-sm">Premium Hours = Higher Pay</p>
                <p className="text-sm text-muted-foreground">Night shifts and weekends often pay 15-25% more</p>
              </div>
            </div>
          </OrbitCardContent>
        </OrbitCard>
      </div>
    </div>
  );
}
