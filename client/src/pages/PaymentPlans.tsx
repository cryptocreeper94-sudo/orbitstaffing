import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, DollarSign, Zap } from "lucide-react";

export default function PaymentPlans() {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "Forever",
      description: "Perfect for testing and development",
      features: [
        "Up to 50 workers",
        "Basic GPS check-in",
        "Manual scheduling",
        "Email support",
        "Equipment tracking (basic)",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Professional",
      price: "$299",
      period: "/month",
      description: "For growing staffing agencies",
      features: [
        "Up to 500 workers",
        "Advanced GPS + geofencing",
        "Smart scheduling",
        "Real bonus calculations",
        "Equipment tracking (full)",
        "Payroll + invoicing",
        "Priority support",
        "Custom branding",
        "SMS notifications (Q2 2026)",
        "Skill verification (Q2 2026)",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large-scale operations",
      features: [
        "Unlimited workers",
        "Multi-location support",
        "Advanced analytics",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantees",
        "All Pro features +",
        "AI job matching (Q3 2026)",
        "Instant/daily pay (Q2 2026)",
        "Predictive staffing (Q3 2026)",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <Shell>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Transparent Pricing</h1>
          <p className="text-gray-400 text-lg">No hidden fees. No contracts. Scale as you grow.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col ${
                plan.highlighted
                  ? "border-cyan-500 ring-2 ring-cyan-500/20 bg-slate-800/80"
                  : "border-slate-700"
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.highlighted && (
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      Most Popular
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-400">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-cyan-600 hover:bg-cyan-700"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                  data-testid={`button-plan-${plan.name.toLowerCase()}`}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-300">✓ Credit/Debit Card (Stripe)</p>
              <p className="text-sm text-gray-300">✓ Bank Transfer</p>
              <p className="text-sm text-gray-300">✓ ACH Direct Debit</p>
              <p className="text-sm text-gray-300">✓ Invoice (30-day terms for Enterprise)</p>
              <p className="text-sm text-gray-400 mt-4">All payments are encrypted and PCI compliant</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Instant Pay (Q2 2026)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-300">Workers can request instant access to earned wages</p>
              <p className="text-sm text-gray-300 font-bold text-cyan-400">2.5% processing fee</p>
              <p className="text-sm text-gray-300">Integrated with Stripe Connect for seamless payouts</p>
              <p className="text-sm text-gray-300">Available immediately after shift completion</p>
              <p className="text-sm text-gray-400 mt-4">Increases retention and worker satisfaction</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Add-On Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="font-bold text-white mb-2">Background Checks</p>
                <p className="text-sm text-gray-400">$25-50 per worker depending on check level</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="font-bold text-white mb-2">Drug Testing</p>
                <p className="text-sm text-gray-400">$30-150 depending on test type (5-panel to hair)</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="font-bold text-white mb-2">I-9 Verification</p>
                <p className="text-sm text-gray-400">Included with all plans + eVerify integration</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
