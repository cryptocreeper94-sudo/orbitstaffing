import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Stethoscope, UtensilsCrossed, Wrench, Calendar, Briefcase, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const INDUSTRY_CONFIGS = {
  staffing: {
    name: "General Staffing",
    icon: Briefcase,
    color: "bg-blue-500/20",
    description: "Temporary workforce placement",
    variables: [
      { key: "minMarkup", label: "Markup % (Industry Standard: 1.35x)", default: "1.35" },
      { key: "maxWorkers", label: "Max Workers per Assignment", default: "500" },
      { key: "invoiceTerm", label: "Invoice Term (Days)", default: "30" },
      { key: "payrollFreq", label: "Payroll Frequency", default: "bi-weekly" },
    ]
  },
  healthcare: {
    name: "Healthcare Staffing",
    icon: Stethoscope,
    color: "bg-red-500/20",
    description: "Nurses, therapists, medical professionals",
    variables: [
      { key: "minMarkup", label: "Markup % (Healthcare: 1.5x)", default: "1.5" },
      { key: "certReq", label: "Certification Requirement", default: "required" },
      { key: "backgroundCheck", label: "Background Check Level", default: "comprehensive" },
      { key: "maxShiftHours", label: "Max Shift Hours", default: "12" },
    ]
  },
  events: {
    name: "Event Staffing",
    icon: Calendar,
    color: "bg-purple-500/20",
    description: "Event crew, security, hospitality",
    variables: [
      { key: "minMarkup", label: "Markup % (Events: 1.4x)", default: "1.4" },
      { key: "shiftMin", label: "Minimum Shift Duration (hours)", default: "4" },
      { key: "paymentTerm", label: "Payment (Same-day/Next-day)", default: "same-day" },
      { key: "trainingReq", label: "Training Required", default: "yes" },
    ]
  },
  hospitality: {
    name: "Hospitality",
    icon: UtensilsCrossed,
    color: "bg-orange-500/20",
    description: "Restaurants, hotels, bars, catering",
    variables: [
      { key: "minMarkup", label: "Markup % (Hospitality: 1.35x)", default: "1.35" },
      { key: "tipHandling", label: "Tip Distribution", default: "direct-to-worker" },
      { key: "foodCert", label: "Food Handler Certification", default: "required" },
      { key: "callbackTime", label: "Callback Notice (hours)", default: "24" },
    ]
  },
  trades: {
    name: "Skilled Trades",
    icon: Wrench,
    color: "bg-amber-500/20",
    description: "Electricians, plumbers, carpenters, HVAC",
    variables: [
      { key: "minMarkup", label: "Markup % (Trades: 1.5x)", default: "1.5" },
      { key: "licenseReq", label: "License Requirement", default: "required" },
      { key: "safetyTraining", label: "OSHA Safety Training", default: "required" },
      { key: "toolProvision", label: "Tool Provision", default: "worker-owned" },
    ]
  },
  construction: {
    name: "Construction Labor",
    icon: Building2,
    color: "bg-stone-500/20",
    description: "General labor, equipment operation",
    variables: [
      { key: "minMarkup", label: "Markup % (Construction: 1.4x)", default: "1.4" },
      { key: "prevWageCompliance", label: "Prevailing Wage Compliance", default: "required" },
      { key: "safetyInduction", label: "Site Induction Required", default: "required" },
      { key: "hourMinimum", label: "Minimum Hours per Day", default: "8" },
    ]
  }
};

export default function Configuration() {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, string>>({});

  const handleSelectIndustry = (key: string) => {
    setSelectedIndustry(key);
    const industry = INDUSTRY_CONFIGS[key as keyof typeof INDUSTRY_CONFIGS];
    const initialConfig: Record<string, string> = {};
    industry.variables.forEach(v => {
      initialConfig[v.key] = v.default;
    });
    setConfig(initialConfig);
  };

  const handleConfigChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const selectedConfig = selectedIndustry ? INDUSTRY_CONFIGS[selectedIndustry as keyof typeof INDUSTRY_CONFIGS] : null;
  const IconComponent = selectedConfig?.icon;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <a className="font-heading font-bold text-lg tracking-wider hover:opacity-80">
              ORBIT
              <div className="text-[9px] text-muted-foreground tracking-widest">STAFFING OS</div>
            </a>
          </Link>
          <Link href="/">
            <a className="text-sm px-3 py-2 rounded-md border border-border/50 hover:bg-white/5">
              Back to Home
            </a>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-heading mb-3">Configure for Your Industry</h1>
          <p className="text-muted-foreground">Customize ORBIT to match your specific staffing needs and compliance requirements.</p>
        </div>

        {!selectedIndustry ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {Object.entries(INDUSTRY_CONFIGS).map(([key, industry]) => {
              const Icon = industry.icon;
              return (
                <Card key={key} className="border-border/50 hover:border-primary/30 cursor-pointer transition-all hover:scale-105" onClick={() => handleSelectIndustry(key)}>
                  <CardContent className="p-6">
                    <div className={`p-3 rounded-lg w-fit mb-4 ${industry.color}`}>
                      <Icon className="w-6 h-6 text-foreground" />
                    </div>
                    <h3 className="font-bold font-heading mb-2">{industry.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{industry.description}</p>
                    <Button variant="ghost" size="sm" className="group">
                      Configure <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Config Panel */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                {IconComponent && (
                  <div className={`p-3 rounded-lg ${selectedConfig?.color}`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold font-heading">{selectedConfig?.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedConfig?.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedConfig?.variables.map(variable => (
                  <div key={variable.key} className="bg-card/50 border border-border/50 rounded-lg p-4">
                    <label className="block text-sm font-semibold mb-2">{variable.label}</label>
                    {variable.key.includes("Requirement") || variable.key.includes("Required") ? (
                      <select
                        value={config[variable.key] || variable.default}
                        onChange={(e) => handleConfigChange(variable.key, e.target.value)}
                        className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="required">Required</option>
                        <option value="optional">Optional</option>
                        <option value="not-required">Not Required</option>
                      </select>
                    ) : variable.key.includes("Frequency") || variable.key.includes("Distribution") || variable.key.includes("Term") ? (
                      <select
                        value={config[variable.key] || variable.default}
                        onChange={(e) => handleConfigChange(variable.key, e.target.value)}
                        className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm"
                      >
                        {variable.key === "payrollFreq" && (
                          <>
                            <option value="weekly">Weekly</option>
                            <option value="bi-weekly">Bi-Weekly</option>
                            <option value="monthly">Monthly</option>
                          </>
                        )}
                        {variable.key === "tipHandling" && (
                          <>
                            <option value="direct-to-worker">Direct to Worker</option>
                            <option value="pooled">Pooled Distribution</option>
                            <option value="none">No Tips</option>
                          </>
                        )}
                        {variable.key === "paymentTerm" && (
                          <>
                            <option value="same-day">Same-Day Pay</option>
                            <option value="next-day">Next-Day Pay</option>
                            <option value="weekly">Weekly Pay</option>
                          </>
                        )}
                        {variable.key === "invoiceTerm" && (
                          <>
                            <option value="14">14 Days (Net 14)</option>
                            <option value="30">30 Days (Net 30)</option>
                            <option value="45">45 Days (Net 45)</option>
                          </>
                        )}
                      </select>
                    ) : (
                      <input
                        type={variable.key.includes("Mark") ? "number" : "text"}
                        value={config[variable.key] || variable.default}
                        onChange={(e) => handleConfigChange(variable.key, e.target.value)}
                        step={variable.key.includes("Mark") ? "0.01" : "1"}
                        className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-3">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => toast.info("Configuration capture feature coming soon - currently in design phase")}>
                  Save Configuration (Coming Soon)
                </Button>
                <Button variant="outline" onClick={() => { setSelectedIndustry(null); setConfig({}); }}>
                  Select Different Industry
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-1">
              <Card className="border-border/50 bg-card/50 sticky top-24">
                <CardContent className="p-6">
                  <h3 className="font-bold font-heading mb-4">Configuration Summary</h3>
                  <div className="space-y-3">
                    {selectedConfig?.variables.map(variable => (
                      <div key={variable.key} className="flex justify-between items-start text-sm border-b border-border/20 pb-3">
                        <span className="text-muted-foreground text-xs">{variable.label}:</span>
                        <span className="font-semibold text-right">{config[variable.key] || variable.default}</span>
                      </div>
                    ))}
                  </div>
                  <Badge className="mt-6 w-full justify-center bg-primary/20 text-primary">
                    Ready to Deploy
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
