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
  DollarSign, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  Users,
  FileText,
  Calendar,
  MapPin,
  Smartphone,
  Shield,
  BarChart3
} from "lucide-react";

export default function SmallBusinessPage() {
  const [showModal, setShowModal] = useState(false);

  const problems = [
    {
      icon: DollarSign,
      title: "Payroll Nightmare",
      problem: "Paying for QuickBooks, ADP, and separate payroll service = $1,200+/year",
      solution: "One integrated system. Payroll built in.",
      savings: "Save $1,200/year"
    },
    {
      icon: Clock,
      title: "20 Hours/Month Lost",
      problem: "Manually entering data across CRM, payroll, invoicing = 20 hours/month wasted",
      solution: "Everything syncs automatically. One source of truth.",
      savings: "Recover $4,800-7,200/year in lost time"
    },
    {
      icon: TrendingUp,
      title: "Can't See Your Business",
      problem: "Data scattered across 6-7 systems. No real-time visibility.",
      solution: "Real-time dashboard. Know exactly what's happening.",
      savings: "Better decisions = more profit"
    },
  ];

  const features = [
    { title: "CRM", desc: "Worker profiles, client records, complete history, notes, compliance tracking", icon: Users },
    { title: "Payroll", desc: "Automated, state-compliant, multi-state support, TN/KY rules built-in", icon: DollarSign },
    { title: "Invoicing", desc: "Auto-generated from assignments, customizable templates, payment tracking", icon: FileText },
    { title: "Scheduling", desc: "Job posting, worker assignment, bulk ops, real-time availability", icon: Calendar },
    { title: "GPS Verification", desc: "Workers clock in at job site via GPS. Prevent fraud, verify attendance.", icon: MapPin },
    { title: "Mobile App", desc: "Workers access assignments, communicate with managers, clock in/out anywhere", icon: Smartphone },
    { title: "Compliance", desc: "TN/KY state rules, I-9 tracking, prevailing wage, audit trails", icon: Shield },
    { title: "Real-Time Dashboard", desc: "See workers, clients, revenue, payroll status, everything at a glance", icon: BarChart3 },
  ];

  const comparison = [
    { feature: "CRM", current: "Separate system", orbit: "✓ Built-in" },
    { feature: "Payroll Processing", current: "ADP/Paychex ($600/yr)", orbit: "✓ Included" },
    { feature: "Invoicing", current: "QuickBooks ($480/yr)", orbit: "✓ Built-in" },
    { feature: "Scheduling", current: "Separate software ($300/yr)", orbit: "✓ Built-in" },
    { feature: "Compliance Tracking", current: "Manual/spreadsheets", orbit: "✓ Automated" },
    { feature: "GPS Verification", current: "Not available", orbit: "✓ Included" },
    { feature: "Mobile App", current: "Not available", orbit: "✓ Included" },
    { feature: "Customer Support", current: "$0-500/month", orbit: "✓ Included" },
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

      <PageHeader
        title="Replace Your 6-7 Systems with One"
        subtitle="You're wasting $8,000-10,000/year and 20 hours/month on disconnected systems. ORBIT is the staffing OS that replaces everything: CRM, payroll, invoicing, scheduling, compliance. All integrated. One login."
        breadcrumb={<Badge className="bg-green-500/20 text-green-600">For Independent Agencies</Badge>}
        actions={
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="lg" data-testid="button-start-demo">
              Start Your Demo (Free)
            </Button>
            <Button variant="outline" size="lg" data-testid="button-customer-story">
              Read Customer Story
            </Button>
          </div>
        }
      />

      <section className="mb-12">
        <SectionHeader
          title="The Problems You're Facing"
          subtitle="Your current setup is costing you more than you realize"
          size="lg"
        />
        
        <div className="hidden md:block">
          <BentoGrid cols={3} gap="md">
            {problems.map((p, i) => {
              const Icon = p.icon;
              return (
                <BentoTile key={i}>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-red-500/20">
                        <Icon className="w-5 h-5 text-red-400" />
                      </div>
                      <h3 className="font-bold text-white">{p.title}</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">
                      <span className="text-red-400 font-medium">Problem:</span> {p.problem}
                    </p>
                    <p className="text-sm text-slate-300 mb-3">
                      <span className="text-emerald-400 font-medium">With ORBIT:</span> {p.solution}
                    </p>
                    <Badge className="bg-emerald-500/20 text-emerald-400">{p.savings}</Badge>
                  </div>
                </BentoTile>
              );
            })}
          </BentoGrid>
        </div>

        <div className="md:hidden">
          <CarouselRail showArrows={false} gap="md" itemWidth="lg">
            {problems.map((p, i) => {
              const Icon = p.icon;
              return (
                <OrbitCard key={i} className="w-[300px]">
                  <OrbitCardHeader icon={
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <Icon className="w-5 h-5 text-red-400" />
                    </div>
                  }>
                    <OrbitCardTitle>{p.title}</OrbitCardTitle>
                  </OrbitCardHeader>
                  <OrbitCardContent>
                    <p className="text-sm text-slate-400 mb-3">
                      <span className="text-red-400 font-medium">Problem:</span> {p.problem}
                    </p>
                    <p className="text-sm text-slate-300 mb-3">
                      <span className="text-emerald-400 font-medium">With ORBIT:</span> {p.solution}
                    </p>
                    <Badge className="bg-emerald-500/20 text-emerald-400">{p.savings}</Badge>
                  </OrbitCardContent>
                </OrbitCard>
              );
            })}
          </CarouselRail>
        </div>
      </section>

      <section className="mb-12">
        <OrbitCard variant="glass" className="p-6 md:p-8 border-amber-500/30 bg-amber-900/10">
          <SectionHeader
            title="Why Switch From Your Current Systems?"
            size="md"
            className="mb-6"
          />
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "You're Losing Money", desc: "Paying for multiple subscriptions ($2,600+/year) + manual work = $8-10k/year waste" },
              { title: "Data is Fragmented", desc: "Worker info in one place, payroll in another, client records somewhere else. No single source of truth." },
              { title: "You Can't Scale", desc: "Every new worker, new client, new assignment = manual setup in multiple systems. Growth is painful." },
              { title: "Your Team Is Trapped", desc: "Phone calls to ADP, waiting on Paychex, logging into 3 different systems. Every task takes longer." },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-1">{item.title}</p>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </OrbitCard>
      </section>

      <section className="mb-12">
        <SectionHeader
          title="Everything You Need, Nothing You Don't"
          subtitle="Complete staffing operations in one platform"
          size="lg"
        />
        
        <div className="hidden md:block">
          <BentoGrid cols={4} gap="md">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <BentoTile key={i}>
                  <div className="p-4">
                    <div className="p-2 rounded-lg bg-cyan-500/20 w-fit mb-3">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <p className="font-semibold text-white text-sm mb-2">{f.title}</p>
                    <p className="text-xs text-slate-400">{f.desc}</p>
                  </div>
                </BentoTile>
              );
            })}
          </BentoGrid>
        </div>

        <div className="md:hidden">
          <CarouselRail showArrows={false} gap="md" itemWidth="md">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <OrbitCard key={i} className="w-[260px]">
                  <div className="p-2 rounded-lg bg-cyan-500/20 w-fit mb-3">
                    <Icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <OrbitCardTitle className="text-sm mb-2">{f.title}</OrbitCardTitle>
                  <p className="text-xs text-slate-400">{f.desc}</p>
                </OrbitCard>
              );
            })}
          </CarouselRail>
        </div>
      </section>

      <section className="mb-12">
        <SectionHeader
          title="You vs ORBIT"
          subtitle="See how much you can save by consolidating"
          size="lg"
        />
        <OrbitCard variant="default" hover={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-3 px-4 font-semibold text-white">Feature</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-400">Your Current Setup</th>
                  <th className="text-left py-3 px-4 font-semibold text-emerald-400">ORBIT</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-medium text-white">{row.feature}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{row.current}</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">{row.orbit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </OrbitCard>
      </section>

      <section className="mb-12">
        <SectionHeader
          title="Two Simple Pricing Options"
          subtitle="Choose what works best for your business"
          size="lg"
        />
        <BentoGrid cols={2} gap="lg">
          <BentoTile className="border-cyan-500/30 bg-gradient-to-br from-cyan-900/20 to-slate-900">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-1">Monthly Subscription</h3>
              <p className="text-sm text-slate-400 mb-6">Predictable costs, scale as you grow</p>
              
              <div className="mb-6">
                <div className="text-4xl font-bold text-cyan-400">$199<span className="text-lg text-slate-400">/mo</span></div>
                <p className="text-sm text-slate-400 mt-2">Startup Tier (50 workers)</p>
              </div>

              <div className="mb-6">
                <div className="text-lg font-bold text-white mb-3">Includes:</div>
                <ul className="space-y-2 text-sm">
                  {["CRM, payroll, invoicing", "Up to 50 workers", "Email support", "5 active clients"].map((item, i) => (
                    <li key={i} className="flex gap-2 text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white" size="lg" data-testid="button-start-trial">
                Start Free Trial (14 days)
              </Button>

              <p className="text-xs text-center text-slate-400 mt-4">
                ROI: Save $1,600+ in Year 1. $199/mo pays for itself in 1 month.
              </p>
            </div>
          </BentoTile>

          <BentoTile>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-1">Revenue Share</h3>
              <p className="text-sm text-slate-400 mb-6">Pay for what you make</p>
              
              <div className="mb-6">
                <div className="text-4xl font-bold text-cyan-400">2%<span className="text-lg text-slate-400"> of revenue</span></div>
                <p className="text-sm text-slate-400 mt-2">Scale automatically with your success</p>
              </div>

              <div className="mb-6">
                <div className="text-lg font-bold text-white mb-3">Perfect if:</div>
                <ul className="space-y-2 text-sm">
                  {["You have $50k+ monthly revenue", "You want growth aligned pricing", "No monthly minimum", "Switch back to monthly anytime"].map((item, i) => (
                    <li key={i} className="flex gap-2 text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button variant="outline" className="w-full border-slate-600 hover:border-cyan-500" size="lg" data-testid="button-compare-plans">
                Compare All Plans
              </Button>

              <p className="text-xs text-center text-slate-400 mt-4">
                Example: $96k/month = $1,920 ORBIT. Still cheaper than your current setup.
              </p>
            </div>
          </BentoTile>
        </BentoGrid>
      </section>

      <section className="mb-12">
        <OrbitCard variant="action" className="p-6 md:p-8 border-cyan-500/50" onClick={() => {}}>
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="p-3 rounded-lg bg-cyan-500/20 w-fit">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">Want Perpetual Ownership?</h3>
              <p className="text-slate-400">
                Get the full ORBIT platform white-labeled as your own brand for a one-time franchise license. Own it forever. No recurring fees.
              </p>
            </div>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white shrink-0" data-testid="button-franchise-licensing">
              Learn About Franchise Licensing
            </Button>
          </div>
        </OrbitCard>
      </section>

      <section className="text-center py-12">
        <SectionHeader
          title="Stop Wasting Time & Money"
          subtitle="Your competitors are already consolidating their systems. Don't get left behind with outdated disconnected software."
          align="center"
          size="lg"
        />
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white h-11" size="lg" data-testid="button-get-started-free">
            Get Started Free (No Credit Card)
          </Button>
          <Button variant="outline" className="h-11 border-slate-600 hover:border-cyan-500" size="lg" data-testid="button-schedule-demo">
            Schedule a Demo
          </Button>
        </div>
      </section>
    </Shell>
  );
}
