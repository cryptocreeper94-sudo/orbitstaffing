import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Zap, Users, DollarSign, Camera, Brain, MessageSquare, CheckCircle2 } from "lucide-react";

export default function Roadmap() {
  const features = [
    {
      category: "Q4 2025 (NOW)",
      items: [
        { name: "GPS Check-In with Geofencing", description: "300-foot radius verification", status: "live", icon: CheckCircle2 },
        { name: "Equipment Tracking", description: "PPE management with auto-deductions", status: "live", icon: CheckCircle2 },
        { name: "Payroll Processing", description: "With hallmark codes and QR verification", status: "live", icon: CheckCircle2 },
        { name: "Worker Bonuses", description: "Real-time bonus calculations & tracking", status: "live", icon: CheckCircle2 },
        { name: "Availability Calendar", description: "2-week scheduling for workers", status: "live", icon: CheckCircle2 },
        { name: "Quick Shift Accept/Reject", description: "1-click offer management", status: "live", icon: CheckCircle2 },
      ]
    },
    {
      category: "Q2 2026",
      items: [
        { name: "SMS Notifications", description: "Real-time shift offers and updates via SMS", status: "locked", icon: MessageSquare },
        { name: "Instant/Daily Pay", description: "Workers access earnings immediately (2.5% fee)", status: "locked", icon: DollarSign },
        { name: "Skill Verification & Badges", description: "Certifications + verified skill badges", status: "locked", icon: CheckCircle2 },
        { name: "Quality Assurance System", description: "Photo/video verification of work", status: "locked", icon: Camera },
      ]
    },
    {
      category: "Q3 2026",
      items: [
        { name: "AI Job Matching", description: "Auto-recommend best workers for each job", status: "locked", icon: Brain },
        { name: "Predictive Analytics", description: "Forecast staffing needs and no-shows", status: "locked", icon: Zap },
        { name: "Two-Sided Marketplace", description: "Workers browse and self-select jobs", status: "locked", icon: Users },
      ]
    }
  ];

  return (
    <Shell>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">ORBIT V2 Roadmap</h1>
          <p className="text-gray-400 text-lg">Coming Q2 2026: SMS, Instant Pay, Skills, QA & More</p>
        </div>

        {features.map((section) => (
          <div key={section.category} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">{section.category}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                const isLive = item.status === "live";
                const isLocked = item.status === "locked";

                return (
                  <Card
                    key={idx}
                    className={`${
                      isLive
                        ? "border-green-500/50 bg-green-500/5"
                        : isLocked
                          ? "border-amber-500/30 bg-amber-500/5 opacity-75"
                          : "border-slate-700"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            isLive ? "text-green-400" : isLocked ? "text-amber-400" : "text-cyan-400"
                          }`} />
                          <div>
                            <CardTitle className="text-base">{item.name}</CardTitle>
                            <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                          </div>
                        </div>
                        <Badge
                          className={`flex-shrink-0 ${
                            isLive
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : isLocked
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                : "bg-slate-700 text-gray-300"
                          }`}
                          variant="outline"
                        >
                          {isLocked ? (
                            <><Lock className="w-3 h-3 mr-1" />Coming</>
                          ) : isLive ? (
                            "✓ Live"
                          ) : (
                            "Beta"
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
          <CardHeader>
            <CardTitle>Feature Requests Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              Don't see what you need? Submit feature requests directly in the app. Your feedback shapes V2 priorities.
            </p>
            <p className="text-sm text-gray-400">
              Our goal: Build the staffing platform that ACTUALLY meets your needs.
            </p>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
