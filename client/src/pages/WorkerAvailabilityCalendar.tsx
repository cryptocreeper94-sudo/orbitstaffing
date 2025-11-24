import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus } from "lucide-react";

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
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">Your Availability</h1>
          <p className="text-xs sm:text-base text-gray-400">Set when you're available for work. More availability = more shift offers!</p>
        </div>

        {/* Quick Set Buttons - Mobile Responsive */}
        <div className="grid grid-cols-2 sm:flex gap-2 mb-6 flex-wrap">
          <Button variant="outline" size="sm" className="text-[10px] sm:text-xs min-h-[40px]" data-testid="button-set-full-week">
            Full Week
          </Button>
          <Button variant="outline" size="sm" className="text-[10px] sm:text-xs min-h-[40px]" data-testid="button-set-weekdays">
            Weekdays
          </Button>
          <Button variant="outline" size="sm" className="text-[10px] sm:text-xs min-h-[40px]" data-testid="button-clear-all">
            Clear All
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs min-h-[40px] sm:ml-auto col-span-2 sm:col-span-auto" data-testid="button-save">
            Save Changes
          </Button>
        </div>

        {/* Calendar Grid */}
        <Card className="bg-card/50 border-border/50 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Next 2 Weeks
            </CardTitle>
            <CardDescription>Click to toggle availability. Green = available, Gray = unavailable</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-2 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 sm:gap-4" style={{gap: "1rem" }}>
              {dates.map((date, dateIdx) => {
                const dateStr = date.toISOString().split("T")[0];
                const dayAvail = availability[dateStr] || {};
                const isAvailableDay = Object.values(dayAvail).some(v => v);

                return (
                  <div key={dateIdx} className="bg-slate-800/30 rounded-lg border border-slate-700/30 p-2 sm:p-4">
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
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-card/50 border-border/50 mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Pro Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
