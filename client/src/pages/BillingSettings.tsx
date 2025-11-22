import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Check, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";

const BILLING_MODELS = {
  fixed: {
    name: "Monthly Subscription",
    icon: DollarSign,
    description: "Predictable monthly cost, perfect for planning",
    tiers: {
      startup: { price: "$199/mo", workers: "Up to 50", features: ["Job posting", "Basic payroll", "5 active clients"] },
      growth: { price: "$599/mo", workers: "Up to 500", features: ["Everything in Startup", "Automated payroll", "Unlimited clients", "Priority support"] },
      enterprise: { price: "Custom", workers: "1000+", features: ["Everything in Growth", "White-label", "API access", "Dedicated manager"] },
    },
  },
  revenue_share: {
    name: "Revenue Share",
    icon: TrendingUp,
    description: "Pay based on your success - 2% of placement revenue",
    example: "$96k monthly revenue = $1,920/month platform fee",
    features: ["Scales with your growth", "Only pay for success", "Perfect for high-volume agencies"],
  },
};

export default function BillingSettings() {
  const [currentModel, setCurrentModel] = useState<"fixed" | "revenue_share">("fixed");
  const [currentTier, setCurrentTier] = useState("startup");
  const [selectedModel, setSelectedModel] = useState<"fixed" | "revenue_share">("fixed");
  const [selectedTier, setSelectedTier] = useState("startup");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [switchFee, setSwitchFee] = useState<number | null>(null);

  const handleModelChange = (model: "fixed" | "revenue_share", tier?: string) => {
    setSelectedModel(model);
    if (tier) setSelectedTier(tier);

    // Check if this requires a fee
    if (model !== currentModel && currentModel) {
      setSwitchFee(299); // Extra switches cost $299
    } else {
      setSwitchFee(null); // Free switch available
    }

    setShowConfirmation(true);
  };

  const handleConfirmSwitch = () => {
    // API call would go here
    toast.success(`Switched to ${selectedModel === "fixed" ? "Monthly Subscription" : "Revenue Share"}`);
    setCurrentModel(selectedModel);
    if (selectedTier) setCurrentTier(selectedTier);
    setShowConfirmation(false);
  };

  return (
    <Shell>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Billing Settings</h1>
          <p className="text-muted-foreground">Choose how you pay for ORBIT</p>
        </div>
      </div>

      {/* Current Plan */}
      <Card className="mb-8 bg-primary/5 border-primary/30">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
              <p className="text-2xl font-bold">
                {currentModel === "fixed"
                  ? `${currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} - ${BILLING_MODELS.fixed.tiers[currentTier as keyof typeof BILLING_MODELS.fixed.tiers]?.price}`
                  : "Revenue Share (2%)"}
              </p>
            </div>
            <Badge className="bg-primary/20 text-primary">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Billing Options */}
      <Tabs defaultValue="fixed" className="space-y-6">
        <TabsList className="bg-card border border-border/50 w-full">
          <TabsTrigger value="fixed" className="flex-1">Monthly Subscription</TabsTrigger>
          <TabsTrigger value="revenue_share" className="flex-1">Revenue Share</TabsTrigger>
        </TabsList>

        {/* Fixed Pricing */}
        <TabsContent value="fixed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(BILLING_MODELS.fixed.tiers).map(([key, tier]: any) => (
              <Card
                key={key}
                className={`cursor-pointer transition-all ${
                  selectedModel === "fixed" && selectedTier === key
                    ? "border-primary bg-primary/10"
                    : "border-border/50 hover:border-primary/30"
                }`}
                onClick={() => handleModelChange("fixed", key)}
              >
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-1">{key.toUpperCase()}</p>
                  <p className="text-2xl font-bold mb-1">{tier.price}</p>
                  <p className="text-xs text-muted-foreground mb-4">{tier.workers}</p>

                  <ul className="space-y-2 mb-4">
                    {tier.features.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {currentModel === "fixed" && currentTier === key ? (
                    <Button className="w-full h-8 text-xs bg-primary/20 text-primary" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full h-8 text-xs border border-primary/50 hover:bg-primary/10"
                      onClick={() => handleModelChange("fixed", key)}
                    >
                      Switch to {key}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Revenue Share */}
        <TabsContent value="revenue_share" className="space-y-4">
          <Card className={`cursor-pointer transition-all ${
            selectedModel === "revenue_share"
              ? "border-primary bg-primary/10"
              : "border-border/50 hover:border-primary/30"
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Revenue Share Model
              </CardTitle>
              <CardDescription>Pay only for what you make</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                <p className="text-sm font-semibold mb-2">How it works:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>2% of monthly placement revenue</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>No monthly minimum</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Scales automatically with growth</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <p className="text-sm text-muted-foreground mb-2">Example:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>100 placements × $960 average billing</span>
                    <span className="font-bold">$96,000</span>
                  </div>
                  <div className="flex justify-between border-t border-primary/50 pt-2 mt-2">
                    <span>Platform fee (2%)</span>
                    <span className="font-bold text-primary">$1,920/month</span>
                  </div>
                </div>
              </div>

              {currentModel === "revenue_share" ? (
                <Button className="w-full bg-primary/20 text-primary" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button className="w-full" onClick={() => handleModelChange("revenue_share")}>
                  Switch to Revenue Share
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Switch Rules */}
      <Card className="mt-8 bg-blue-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Switching Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Free switch every 6 months</p>
              <p className="text-xs text-muted-foreground">Next free switch available: June 23, 2025</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <DollarSign className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">$299 for additional switches</p>
              <p className="text-xs text-muted-foreground">Change as often as you need</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Confirm Billing Model Switch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Switching to:</p>
                <p className="font-bold">
                  {selectedModel === "fixed"
                    ? `${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Plan`
                    : "Revenue Share (2%)"}
                </p>
              </div>

              {switchFee && (
                <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
                  <p className="text-sm">
                    <span className="text-orange-600 font-semibold">${switchFee}</span> switch fee applies
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">This change is outside your free 6-month period</p>
                </div>
              )}

              {!switchFee && (
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <p className="text-sm text-green-600 font-semibold">Free switch</p>
                  <p className="text-xs text-muted-foreground mt-1">This is within your free 6-month switch period</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowConfirmation(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-primary" onClick={handleConfirmSwitch}>
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Shell>
  );
}
