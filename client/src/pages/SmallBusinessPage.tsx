import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessTypeModal } from "@/components/BusinessTypeModal";
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Settings,
  Menu
} from "lucide-react";
import { toast } from "sonner";

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
    { title: "CRM", desc: "Worker profiles, client records, complete history, notes, compliance tracking" },
    { title: "Payroll", desc: "Automated, state-compliant, multi-state support, TN/KY rules built-in" },
    { title: "Invoicing", desc: "Auto-generated from assignments, customizable templates, payment tracking" },
    { title: "Scheduling", desc: "Job posting, worker assignment, bulk ops, real-time availability" },
    { title: "GPS Verification", desc: "Workers clock in at job site via GPS. Prevent fraud, verify attendance." },
    { title: "Mobile App", desc: "Workers access assignments, communicate with managers, clock in/out anywhere" },
    { title: "Compliance", desc: "TN/KY state rules, I-9 tracking, prevailing wage, audit trails" },
    { title: "Real-Time Dashboard", desc: "See workers, clients, revenue, payroll status, everything at a glance" },
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
      {/* Top Right Menu Button */}
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

      {/* Hero Section */}
      <div className="mb-12">
        <Badge className="bg-green-500/20 text-green-600 mb-4">For Independent Agencies</Badge>
        <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight mb-4">
          Replace Your 6-7 Systems with One
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-6">
          You're wasting $8,000-10,000/year and 20 hours/month on disconnected systems. ORBIT is the staffing OS that replaces everything: CRM, payroll, invoicing, scheduling, compliance. All integrated. One login.
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-11" size="lg">
            Start Your Demo (Free)
          </Button>
          <Button variant="outline" className="h-11" size="lg">
            Read Customer Story: Superior Staffing
          </Button>
        </div>
      </div>

      {/* The Problems You Face */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold font-heading mb-8">The Problems You're Facing</h2>
        <div className="space-y-4">
          {problems.map((p, i) => {
            const Icon = p.icon;
            return (
              <Card key={i} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Icon className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-2">{p.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        <span className="text-red-600 font-medium">Problem:</span> {p.problem}
                      </p>
                      <p className="text-sm mb-2">
                        <span className="text-green-600 font-medium">With ORBIT:</span> {p.solution}
                      </p>
                      <Badge className="bg-green-500/20 text-green-600">{p.savings}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Why Switch? */}
      <div className="mb-12 bg-primary/5 border border-primary/30 rounded-lg p-8">
        <h2 className="text-2xl font-bold font-heading mb-6">Why Switch From Your Current Systems?</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">You're Losing Money</p>
              <p className="text-sm text-muted-foreground">Paying for multiple subscriptions ($2,600+/year) + manual work = $8-10k/year waste</p>
            </div>
          </div>
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Data is Fragmented</p>
              <p className="text-sm text-muted-foreground">Worker info in one place, payroll in another, client records somewhere else. No single source of truth.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">You Can't Scale</p>
              <p className="text-sm text-muted-foreground">Every new worker, new client, new assignment = manual setup in multiple systems. Growth is painful.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Your Team Is Trapped</p>
              <p className="text-sm text-muted-foreground">Phone calls to ADP, waiting on Paychex, logging into 3 different systems. Every task takes longer.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold font-heading mb-8">Everything You Need, Nothing You Don't</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="pt-6">
                <CheckCircle2 className="w-5 h-5 text-green-600 mb-3" />
                <p className="font-semibold text-sm mb-2">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Comparison */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold font-heading mb-8">You vs ORBIT</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 font-semibold">Feature</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Your Current Setup</th>
                <th className="text-left py-3 px-4 font-semibold text-green-600">ORBIT</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-card/50">
                  <td className="py-3 px-4 font-medium">{row.feature}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{row.current}</td>
                  <td className="py-3 px-4 text-green-600 font-semibold">{row.orbit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold font-heading mb-8">Two Simple Pricing Options</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Fixed Monthly */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle>Monthly Subscription</CardTitle>
              <CardDescription>Predictable costs, scale as you grow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-4xl font-bold text-primary">$199<span className="text-lg text-muted-foreground">/mo</span></div>
                <p className="text-sm text-muted-foreground mt-2">Startup Tier (50 workers)</p>
              </div>

              <div>
                <div className="text-2xl font-bold mb-3">Includes:</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>CRM, payroll, invoicing</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Up to 50 workers</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Email support</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>5 active clients</span>
                  </li>
                </ul>
              </div>

              <Button className="w-full bg-primary text-primary-foreground" size="lg">
                Start Free Trial (14 days)
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                ROI: Save $1,600+ in Year 1. $199/mo pays for itself in 1 month.
              </p>
            </CardContent>
          </Card>

          {/* Revenue Share */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Revenue Share</CardTitle>
              <CardDescription>Pay for what you make</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-4xl font-bold text-primary">2%<span className="text-lg text-muted-foreground"> of revenue</span></div>
                <p className="text-sm text-muted-foreground mt-2">Scale automatically with your success</p>
              </div>

              <div>
                <div className="text-2xl font-bold mb-3">Perfect if:</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>You have $50k+ monthly revenue</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>You want growth aligned pricing</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>No monthly minimum</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Switch back to monthly anytime</span>
                  </li>
                </ul>
              </div>

              <Button variant="outline" className="w-full" size="lg">
                Compare All Plans
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Example: $96k/month = $1,920 ORBIT. Still cheaper than your current setup.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* One-Time Franchise Option */}
      <div className="mb-12 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/50 rounded-lg p-8">
        <div className="flex gap-4">
          <TrendingUp className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-2xl font-bold font-heading mb-2">Want Perpetual Ownership?</h3>
            <p className="text-muted-foreground mb-4">
              Get the full ORBIT platform white-labeled as your own brand for a one-time franchise license. Own it forever. No recurring fees.
            </p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Learn About Franchise Licensing
            </Button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold font-heading mb-4">Stop Wasting Time & Money</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Your competitors are already consolidating their systems. Don't get left behind with outdated disconnected software.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-11" size="lg">
            Get Started Free (No Credit Card)
          </Button>
          <Button variant="outline" className="h-11" size="lg">
            Schedule a Demo
          </Button>
        </div>
      </div>
    </Shell>
  );
}
