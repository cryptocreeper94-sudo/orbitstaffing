import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Users, Shield, Zap, Globe, Award, Building2 } from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/ui/section-header";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent } from "@/components/ui/orbit-card";
import { CarouselRail, CarouselRailItem } from "@/components/ui/carousel-rail";

export default function AboutUs() {
  const features = [
    { icon: Zap, title: "Zero Manual Entry", desc: "Automated matching, scheduling, and payroll processing" },
    { icon: Globe, title: "GPS Verification", desc: "Real-time location tracking for clock-in/out verification" },
    { icon: Users, title: "Talent Exchange", desc: "Two-way marketplace connecting workers and employers" },
    { icon: Shield, title: "Blockchain Stamps", desc: "Solana-verified credentials and audit trails" },
    { icon: Award, title: "White Label Ready", desc: "Full customization for franchise and enterprise clients" },
    { icon: Building2, title: "Multi-Tenant", desc: "Complete data isolation with scalable architecture" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="border-b border-slate-800/50 backdrop-blur-sm sticky top-0 z-50 bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <PageHeader
            title="About Us"
            breadcrumb={
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white -ml-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            }
            className="mb-0"
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        <section className="text-center space-y-4">
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">DarkWave Studios, LLC</Badge>
          <SectionHeader
            title="ORBIT Staffing OS"
            subtitle="100% automated, white-label staffing platform designed to revolutionize temporary workforce management across skilled trades, hospitality, and general labor sectors."
            align="center"
            size="lg"
            className="mb-0 [&_h2]:bg-gradient-to-r [&_h2]:from-cyan-400 [&_h2]:to-purple-400 [&_h2]:bg-clip-text [&_h2]:text-transparent"
          />
        </section>

        <BentoGrid cols={2} gap="md">
          <BentoTile>
            <OrbitCard variant="glass" hover={false} className="h-full border-0 bg-transparent p-6">
              <OrbitCardHeader
                icon={
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Building2 className="w-6 h-6 text-cyan-400" />
                  </div>
                }
              >
                <OrbitCardTitle className="text-xl">Our Mission</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent>
                <p className="text-slate-400 text-sm">
                  To eliminate manual intervention in staffing operations through intelligent automation, 
                  GPS-verified check-ins, and comprehensive payroll integration. We're building the future 
                  of workforce management where agencies can scale from 10 to 10,000 workers without 
                  proportionally increasing overhead.
                </p>
              </OrbitCardContent>
            </OrbitCard>
          </BentoTile>

          <BentoTile>
            <OrbitCard variant="glass" hover={false} className="h-full border-0 bg-transparent p-6">
              <OrbitCardHeader
                icon={
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                }
              >
                <OrbitCardTitle className="text-xl">Security & Compliance</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent>
                <p className="text-slate-400 text-sm">
                  Enterprise-grade security with encrypted SSN storage, session-based authentication, 
                  comprehensive audit trails, and RBAC. Built-in compliance for state-specific rules 
                  (TN/KY), prevailing wage calculations, and I-9 tracking.
                </p>
              </OrbitCardContent>
            </OrbitCard>
          </BentoTile>
        </BentoGrid>

        <section>
          <SectionHeader
            title="Key Features"
            align="center"
            size="md"
          />
          <BentoGrid cols={3} gap="sm">
            {features.map((feature, i) => (
              <BentoTile key={i}>
                <OrbitCard variant="default" className="h-full border-0 bg-transparent">
                  <div className="flex items-start gap-3">
                    <feature.icon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm text-white">{feature.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{feature.desc}</p>
                    </div>
                  </div>
                </OrbitCard>
              </BentoTile>
            ))}
          </BentoGrid>
        </section>

        <section>
          <CarouselRail
            title="Platform Highlights"
            subtitle="Swipe to explore our key capabilities"
            itemWidth="md"
            gap="md"
          >
            {features.map((feature, i) => (
              <CarouselRailItem key={i}>
                <OrbitCard variant="stat" className="h-full min-h-[120px]">
                  <div className="flex flex-col gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg w-fit">
                      <feature.icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{feature.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{feature.desc}</p>
                    </div>
                  </div>
                </OrbitCard>
              </CarouselRailItem>
            ))}
          </CarouselRail>
        </section>

        <section className="text-center space-y-4 py-8 border-t border-slate-800/50">
          <p className="text-slate-500 text-xs">
            DarkWave Studios, LLC &copy; 2025 | Nashville, TN
          </p>
          <p className="text-slate-600 text-xs">
            Version 2.6.5 | Powered by ORBIT Technology
          </p>
        </section>
      </main>
    </div>
  );
}
