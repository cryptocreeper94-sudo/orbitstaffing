import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BusinessTypeModal } from "@/components/BusinessTypeModal";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { SectionHeader, PageHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, StatCard } from "@/components/ui/orbit-card";
import { 
  Building2,
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Users,
  Menu,
  Shield,
  Globe,
  Zap,
  HeadphonesIcon
} from "lucide-react";

export default function LargeBusinessPage() {
  const [showModal, setShowModal] = useState(false);

  const challenges = [
    {
      title: "Visibility Across Divisions",
      problem: "Each division runs independently. No consolidated reporting.",
      solution: "Parent company dashboard sees all divisions in real-time."
    },
    {
      title: "Compliance Nightmare",
      problem: "Multiple states, multiple rules. Inconsistent compliance across locations.",
      solution: "Centralized state compliance automation. TN, KY, and beyond."
    },
    {
      title: "Franchise Support",
      problem: "How do you empower franchisees without losing control?",
      solution: "White-label for each franchisee. Central management from HQ."
    },
    {
      title: "Expensive Infrastructure",
      problem: "Maintaining multiple systems across locations = $100k+/year",
      solution: "One platform for all. Unified, scalable, cost-effective."
    },
  ];

  const enterpriseFeatures = [
    {
      icon: <Building2 className="w-6 h-6 text-cyan-400" />,
      title: "Centralized Reporting",
      description: "Parent company sees all divisions, revenue, payroll, margins, worker utilization—real-time dashboards, custom reports."
    },
    {
      icon: <Users className="w-6 h-6 text-cyan-400" />,
      title: "Franchise Enablement",
      description: "Each franchisee gets white-labeled platform with their branding. HQ maintains oversight and support."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-cyan-400" />,
      title: "Scalable Infrastructure",
      description: "Add divisions easily. Each gets full platform features. Unified billing, unified support, unified compliance."
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-cyan-400" />,
      title: "Compliance At Scale",
      description: "State-specific rules automated across all locations. Audit trails, I-9 tracking, prevailing wage calculations."
    },
  ];

  const capabilitiesLeft = [
    { title: "Multi-Division Management", description: "Manage unlimited divisions/franchises from one control panel" },
    { title: "Custom Reporting & Analytics", description: "Revenue, margins, worker utilization, forecasting" },
    { title: "API Access", description: "Integrate with your existing systems (Salesforce, etc)" },
    { title: "White-Label Franchises", description: "Each franchise gets custom branding, custom domain" },
  ];

  const capabilitiesRight = [
    { title: "Centralized Compliance", description: "State-specific rules, audit trails, automated tracking" },
    { title: "SSO & Role Management", description: "Control access levels, permissions, data visibility" },
    { title: "Dedicated Support", description: "Account manager, priority support, custom development" },
    { title: "SLA & Performance Guarantees", description: "Uptime SLAs, performance monitoring, compliance reports" },
  ];

  return (
    <Shell>
      <div className="fixed top-4 right-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowModal(true)}
          className="gap-2"
          data-testid="button-reopen-modal"
        >
          <Menu className="w-4 h-4" />
          Business Type
        </Button>
      </div>

      <BusinessTypeModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <div className="mb-12">
        <Badge className="bg-blue-500/20 text-blue-400 mb-4">For Enterprise & Parent Companies</Badge>
        <PageHeader
          title="Unified Staffing Control Across All Divisions"
          subtitle="Managing multiple staffing divisions, franchises, or subsidiaries is complex. ORBIT gives you centralized control, compliance oversight, and white-label capabilities for each location—all from one dashboard."
          actions={
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white h-11" size="lg" data-testid="button-enterprise-demo">
                Request Enterprise Demo
              </Button>
              <Button variant="outline" className="h-11 border-slate-600 hover:border-cyan-500" size="lg" data-testid="button-multi-location">
                See Multi-Location Dashboard
              </Button>
            </div>
          }
        />
      </div>

      <div className="mb-12">
        <SectionHeader
          eyebrow="Enterprise Solutions"
          title="Why Large Organizations Choose ORBIT"
          subtitle="Purpose-built features for multi-location staffing operations"
          size="lg"
        />
        
        <div className="hidden md:block">
          <BentoGrid cols={2} gap="md">
            {enterpriseFeatures.map((feature, idx) => (
              <BentoTile key={idx} className="p-6">
                <OrbitCardHeader icon={feature.icon}>
                  <OrbitCardTitle>{feature.title}</OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </OrbitCardContent>
              </BentoTile>
            ))}
          </BentoGrid>
        </div>

        <div className="md:hidden">
          <CarouselRail gap="md" itemWidth="lg" showArrows={false}>
            {enterpriseFeatures.map((feature, idx) => (
              <OrbitCard key={idx} className="min-w-[280px]">
                <OrbitCardHeader icon={feature.icon}>
                  <OrbitCardTitle>{feature.title}</OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </OrbitCardContent>
              </OrbitCard>
            ))}
          </CarouselRail>
        </div>
      </div>

      <div className="mb-12">
        <SectionHeader
          eyebrow="Problem & Solution"
          title="Enterprise Challenges We Solve"
          size="md"
        />
        <div className="space-y-4">
          {challenges.map((c, i) => (
            <OrbitCard key={i} variant="default">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-2">{c.title}</h3>
                  <p className="text-sm text-slate-400 mb-3">
                    <span className="text-red-400 font-medium">Challenge:</span> {c.problem}
                  </p>
                  <p className="text-sm">
                    <span className="text-emerald-400 font-medium">ORBIT Solution:</span> {c.solution}
                  </p>
                </div>
              </div>
            </OrbitCard>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <SectionHeader
          eyebrow="Capabilities"
          title="Enterprise-Grade Features"
          size="md"
        />
        <BentoGrid cols={2} gap="md">
          <BentoTile className="p-6">
            <div className="space-y-4">
              {capabilitiesLeft.map((cap, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-white">{cap.title}</p>
                    <p className="text-xs text-slate-400">{cap.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </BentoTile>
          <BentoTile className="p-6">
            <div className="space-y-4">
              {capabilitiesRight.map((cap, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-white">{cap.title}</p>
                    <p className="text-xs text-slate-400">{cap.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </BentoTile>
        </BentoGrid>
      </div>

      <div className="mb-12">
        <SectionHeader
          eyebrow="Investment"
          title="Enterprise Pricing (Custom)"
          size="md"
        />
        <OrbitCard variant="glass" className="p-6 md:p-8 border-cyan-500/30">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatCard
              label="Base Platform"
              value="Custom"
              icon={<Building2 className="w-6 h-6" />}
              className="bg-slate-800/50"
            />
            <StatCard
              label="HQ Dashboard"
              value="Included"
              icon={<Globe className="w-6 h-6" />}
              className="bg-slate-800/50"
            />
            <StatCard
              label="Custom Development"
              value="Available"
              icon={<Zap className="w-6 h-6" />}
              className="bg-slate-800/50"
            />
          </div>

          <p className="text-sm text-slate-400 mb-6">
            We work with your specific needs. Multi-division? Multiple franchises? Custom integrations? Let's talk.
          </p>

          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" size="lg" data-testid="button-schedule-consultation">
            Schedule Enterprise Consultation
          </Button>
        </OrbitCard>
      </div>

      <div className="mb-12">
        <OrbitCard variant="action" hover={false} className="bg-gradient-to-r from-emerald-900/30 to-slate-900 border-emerald-500/30 p-6 md:p-8">
          <SectionHeader
            title="Why Your Franchisees Will Love It"
            size="md"
            className="mb-6"
          />
          <BentoGrid cols={2} gap="md">
            <div>
              <p className="font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                HQ Gets Control
              </p>
              <ul className="text-sm text-slate-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Real-time visibility into all franchises
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Enforce compliance across all locations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Monitor revenue, margins, performance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Remote support & training
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-3 flex items-center gap-2">
                <HeadphonesIcon className="w-5 h-5 text-cyan-400" />
                Franchisees Get Freedom
              </p>
              <ul className="text-sm text-slate-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Their own white-labeled platform
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  No complex integration work
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Easy-to-use interface
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Same automation you have
                </li>
              </ul>
            </div>
          </BentoGrid>
        </OrbitCard>
      </div>

      <div className="text-center py-12">
        <SectionHeader
          align="center"
          title="Build Your Staffing Empire"
          subtitle="ORBIT gives you the infrastructure to scale. Unified operations, white-label franchises, centralized control. Let's talk about your vision."
          size="lg"
        />
        <Button className="bg-cyan-500 hover:bg-cyan-600 text-white h-12 px-8" size="lg" data-testid="button-start-consultation">
          Start Your Enterprise Consultation
        </Button>
      </div>
    </Shell>
  );
}
