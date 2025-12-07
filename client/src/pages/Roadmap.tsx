import { Shell } from "@/components/layout/Shell";
import { Badge } from "@/components/ui/badge";
import { Lock, Zap, Users, DollarSign, Camera, Brain, MessageSquare, CheckCircle2 } from "lucide-react";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail, CarouselRailItem } from "@/components/ui/carousel-rail";
import { SectionHeader, PageHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent } from "@/components/ui/orbit-card";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Roadmap() {
  const isMobile = useIsMobile();

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
        { name: "Professional Staffing Division", description: "Nurses, accountants, engineers, consultants - high-margin placements", status: "locked", icon: Users },
        { name: "Background Check Integration", description: "Checkr/Sterling API for professional verification", status: "locked", icon: CheckCircle2 },
        { name: "Contract Engine", description: "Auto-generate SOWs with e-signature", status: "locked", icon: DollarSign },
        { name: "AI Job Matching", description: "Auto-recommend best workers for each job", status: "locked", icon: Brain },
        { name: "Predictive Analytics", description: "Forecast staffing needs and no-shows", status: "locked", icon: Zap },
      ]
    }
  ];

  const renderFeatureCard = (item: typeof features[0]["items"][0], idx: number) => {
    const Icon = item.icon;
    const isLive = item.status === "live";
    const isLocked = item.status === "locked";

    return (
      <OrbitCard
        key={idx}
        variant={isLive ? "default" : "glass"}
        hover={true}
        className={`h-full ${
          isLive
            ? "border-green-500/50 bg-gradient-to-br from-green-500/10 to-slate-900"
            : isLocked
              ? "border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-slate-900 opacity-90"
              : ""
        }`}
        data-testid={`roadmap-item-${idx}`}
      >
        <OrbitCardHeader
          icon={
            <Icon className={`w-5 h-5 ${
              isLive ? "text-green-400" : isLocked ? "text-amber-400" : "text-cyan-400"
            }`} />
          }
          action={
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
          }
        >
          <OrbitCardTitle>{item.name}</OrbitCardTitle>
          <OrbitCardDescription>{item.description}</OrbitCardDescription>
        </OrbitCardHeader>
      </OrbitCard>
    );
  };

  return (
    <Shell>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="ORBIT V2 Roadmap"
          subtitle="Coming Q2 2026: SMS, Instant Pay, Skills, QA & More"
          className="text-center mb-12"
        />

        {features.map((section, sectionIdx) => (
          <div key={section.category} className="mb-12" data-testid={`roadmap-section-${sectionIdx}`}>
            <SectionHeader
              title={section.category}
              size="md"
              className="mb-6"
            />
            
            {isMobile ? (
              <CarouselRail
                showArrows={false}
                gap="md"
                itemWidth="lg"
              >
                {section.items.map((item, idx) => (
                  <CarouselRailItem key={idx} className="w-[300px]">
                    {renderFeatureCard(item, idx)}
                  </CarouselRailItem>
                ))}
              </CarouselRail>
            ) : (
              <BentoGrid cols={2} gap="md">
                {section.items.map((item, idx) => (
                  <BentoTile key={idx} className="p-0 border-0 bg-transparent">
                    {renderFeatureCard(item, idx)}
                  </BentoTile>
                ))}
              </BentoGrid>
            )}
          </div>
        ))}

        <OrbitCard 
          variant="action" 
          className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30"
          data-testid="feature-request-card"
        >
          <OrbitCardHeader>
            <OrbitCardTitle className="text-lg">Feature Requests Welcome</OrbitCardTitle>
          </OrbitCardHeader>
          <OrbitCardContent>
            <p className="text-gray-300 mb-4">
              Don't see what you need? Submit feature requests directly in the app. Your feedback shapes V2 priorities.
            </p>
            <p className="text-sm text-gray-400">
              Our goal: Build the staffing platform that ACTUALLY meets your needs.
            </p>
          </OrbitCardContent>
        </OrbitCard>
      </div>
    </Shell>
  );
}
