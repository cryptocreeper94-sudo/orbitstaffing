import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BusinessTypeModal } from "@/components/BusinessTypeModal";
import { 
  Building2,
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Users,
  Menu
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
        <Badge className="bg-blue-500/20 text-blue-600 mb-4">For Enterprise & Parent Companies</Badge>
        <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight mb-4">
          Unified Staffing Control Across All Divisions
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-6">
          Managing multiple staffing divisions, franchises, or subsidiaries is complex. ORBIT gives you centralized control, compliance oversight, and white-label capabilities for each location—all from one dashboard.
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-11" size="lg">
            Request Enterprise Demo
          </Button>
          <Button variant="outline" className="h-11" size="lg">
            See Multi-Location Dashboard
          </Button>
        </div>
      </div>

      {/* Enterprise Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold font-heading mb-8">Why Large Organizations Choose ORBIT</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-primary/30">
            <CardHeader>
              <Building2 className="w-6 h-6 text-primary mb-2" />
              <CardTitle>Centralized Reporting</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Parent company sees all divisions, revenue, payroll, margins, worker utilization—real-time dashboards, custom reports.
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <Users className="w-6 h-6 text-primary mb-2" />
              <CardTitle>Franchise Enablement</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Each franchisee gets white-labeled platform with their branding. HQ maintains oversight and support.
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <TrendingUp className="w-6 h-6 text-primary mb-2" />
              <CardTitle>Scalable Infrastructure</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Add divisions easily. Each gets full platform features. Unified billing, unified support, unified compliance.
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <CheckCircle2 className="w-6 h-6 text-primary mb-2" />
              <CardTitle>Compliance At Scale</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              State-specific rules automated across all locations. Audit trails, I-9 tracking, prevailing wage calculations.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* The Problems */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold font-heading mb-8">Enterprise Challenges We Solve</h2>
        <div className="space-y-4">
          {challenges.map((c, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold mb-2">{c.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      <span className="text-red-600 font-medium">Challenge:</span> {c.problem}
                    </p>
                    <p className="text-sm">
                      <span className="text-green-600 font-medium">ORBIT Solution:</span> {c.solution}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Enterprise Capabilities */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold font-heading mb-8">Enterprise-Grade Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Multi-Division Management</p>
                <p className="text-xs text-muted-foreground">Manage unlimited divisions/franchises from one control panel</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Custom Reporting & Analytics</p>
                <p className="text-xs text-muted-foreground">Revenue, margins, worker utilization, forecasting</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">API Access</p>
                <p className="text-xs text-muted-foreground">Integrate with your existing systems (Salesforce, etc)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">White-Label Franchises</p>
                <p className="text-xs text-muted-foreground">Each franchise gets custom branding, custom domain</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Centralized Compliance</p>
                <p className="text-xs text-muted-foreground">State-specific rules, audit trails, automated tracking</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">SSO & Role Management</p>
                <p className="text-xs text-muted-foreground">Control access levels, permissions, data visibility</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Dedicated Support</p>
                <p className="text-xs text-muted-foreground">Account manager, priority support, custom development</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">SLA & Performance Guarantees</p>
                <p className="text-xs text-muted-foreground">Uptime SLAs, performance monitoring, compliance reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Pricing */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold font-heading mb-8">Enterprise Pricing (Custom)</h2>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-8">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Base Platform</p>
                <p className="text-3xl font-bold">Custom</p>
                <p className="text-xs text-muted-foreground mt-2">Per division, based on workers & volume</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">HQ Dashboard</p>
                <p className="text-3xl font-bold">Included</p>
                <p className="text-xs text-muted-foreground mt-2">Centralized reporting for all divisions</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Custom Development</p>
                <p className="text-3xl font-bold">Available</p>
                <p className="text-xs text-muted-foreground mt-2">Integrate with your existing systems</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              We work with your specific needs. Multi-division? Multiple franchises? Custom integrations? Let's talk.
            </p>

            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
              Schedule Enterprise Consultation
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Why Franchisees Love ORBIT */}
      <div className="mb-12 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold font-heading mb-6">Why Your Franchisees Will Love It</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="font-semibold mb-2">HQ Gets Control</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Real-time visibility into all franchises</li>
              <li>✓ Enforce compliance across all locations</li>
              <li>✓ Monitor revenue, margins, performance</li>
              <li>✓ Remote support & training</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Franchisees Get Freedom</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Their own white-labeled platform</li>
              <li>✓ No complex integration work</li>
              <li>✓ Easy-to-use interface</li>
              <li>✓ Same automation you have</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold font-heading mb-4">Build Your Staffing Empire</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          ORBIT gives you the infrastructure to scale. Unified operations, white-label franchises, centralized control. Let's talk about your vision.
        </p>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-11" size="lg">
          Start Your Enterprise Consultation
        </Button>
      </div>
    </Shell>
  );
}
