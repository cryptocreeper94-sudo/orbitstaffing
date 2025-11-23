import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap,
  CheckCircle,
  BarChart3,
  Users,
  Cpu,
  TrendingUp,
  Lock,
  Smartphone,
  DollarSign,
  Clock,
  MapPin,
  Shield,
} from "lucide-react";

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function ValuePropositionModal() {
  const [open, setOpen] = useState(() => {
    // Only show on first visit
    const hasSeenValueProp = localStorage.getItem("hasSeenValueProposition");
    return !hasSeenValueProp;
  });
  const [selected, setSelected] = useState<"small" | "large" | null>(null);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("hasSeenValueProposition", "true");
  };

  const smallBusinessBenefits: Benefit[] = [
    {
      icon: <DollarSign className="w-5 h-5 text-primary" />,
      title: "Cut Labor Costs 30%",
      description: "No more manual timesheets or payroll headaches. Automate everything.",
    },
    {
      icon: <Clock className="w-5 h-5 text-primary" />,
      title: "Save 10+ Hours Per Week",
      description: "Stop managing spreadsheets. Focus on growing your business.",
    },
    {
      icon: <MapPin className="w-5 h-5 text-primary" />,
      title: "GPS Verified Check-In",
      description: "Know exactly when workers arrive. No time theft. Ever.",
    },
    {
      icon: <Smartphone className="w-5 h-5 text-primary" />,
      title: "Mobile-First Platform",
      description: "Workers use their phones. It's simple. They actually like it.",
    },
    {
      icon: <Shield className="w-5 h-5 text-primary" />,
      title: "Compliance Built-In",
      description: "Labor laws, state regulations, audit trails. All automated.",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-primary" />,
      title: "Scale Without Growing Staff",
      description: "Handle 10x more workers with the same office team.",
    },
  ];

  const largeBusinessBenefits: Benefit[] = [
    {
      icon: <BarChart3 className="w-5 h-5 text-primary" />,
      title: "Enterprise-Grade Analytics",
      description: "Real-time dashboards. Predictive workforce planning. ROI visibility.",
    },
    {
      icon: <Cpu className="w-5 h-5 text-primary" />,
      title: "API-First Architecture",
      description: "Seamless integration with ADP, Workday, Salesforce, your stack.",
    },
    {
      icon: <Lock className="w-5 h-5 text-primary" />,
      title: "Enterprise Security",
      description: "SOC 2 compliance. Encrypted data. Role-based access control.",
    },
    {
      icon: <Users className="w-5 h-5 text-primary" />,
      title: "Unlimited Scalability",
      description: "10,000 workers. 100 locations. Multi-tenant support. No limits.",
    },
    {
      icon: <Zap className="w-5 h-5 text-primary" />,
      title: "Dedicated Support",
      description: "Concierge setup. Custom training. Dedicated account manager.",
    },
    {
      icon: <DollarSign className="w-5 h-5 text-primary" />,
      title: "Customizable Billing",
      description: "Fixed, revenue-share, or hybrid models. Whatever works for you.",
    },
  ];

  const benefits = selected === "small" ? smallBusinessBenefits : largeBusinessBenefits;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl border-border/50 bg-background max-h-[90vh] overflow-y-auto">
        {!selected ? (
          <>
            <DialogHeader className="text-center">
              <div className="flex justify-center mb-4">
                <img 
                  src="/assets/3d_saturn_with_dark_outline_and_shadow_depth.png" 
                  alt="ORBIT Logo" 
                  className="h-12 w-12"
                />
              </div>
              <DialogTitle className="text-3xl font-heading mb-2">
                Welcome to ORBIT
              </DialogTitle>
              <DialogDescription className="text-lg text-foreground/80">
                The staffing platform that actually works. Designed for your business size.
              </DialogDescription>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-6 py-8">
              {/* Small Business */}
              <Card
                className="border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelected("small")}
                data-testid="card-small-business"
              >
                <CardContent className="pt-8 text-center">
                  <div className="text-4xl mb-4">🏢</div>
                  <h3 className="text-xl font-bold mb-2">Small Staffing Agency</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    5-100 workers, 1-5 locations
                  </p>
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setSelected("small")}
                    data-testid="button-select-small"
                  >
                    Show Me What This Can Do
                  </Button>
                </CardContent>
              </Card>

              {/* Large Business */}
              <Card
                className="border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelected("large")}
                data-testid="card-large-business"
              >
                <CardContent className="pt-8 text-center">
                  <div className="text-4xl mb-4">🏛️</div>
                  <h3 className="text-xl font-bold mb-2">Enterprise Staffing</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    100+ workers, 5+ locations
                  </p>
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setSelected("large")}
                    data-testid="button-select-large"
                  >
                    Show Me What This Can Do
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <Button
                variant="ghost"
                className="absolute left-4 top-4"
                onClick={() => setSelected(null)}
                data-testid="button-back"
              >
                ← Back
              </Button>
              <DialogTitle className="text-3xl font-heading text-center mt-4">
                Why {selected === "small" ? "Small Agencies" : "Enterprises"} Choose ORBIT
              </DialogTitle>
              <DialogDescription className="text-center text-lg text-foreground/80">
                The #1 problem we solve for you:
              </DialogDescription>
            </DialogHeader>

            <div className="py-8">
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, idx) => (
                  <Card
                    key={idx}
                    className="border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
                    data-testid={`benefit-${idx}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">{benefit.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{benefit.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* The Competitive Advantage */}
              <Card className="border-primary/20 bg-primary/5 mb-6">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-lg mb-2">The Game-Changer:</h4>
                      <p className="text-foreground/90">
                        <strong>GPS-Verified Clock-In/Out.</strong> Your workers can't fake hours. Your clients can't dispute charges. Everything is verified, timestamped, and geo-located. This alone saves most agencies $50-200k per year in fraud prevention and billing disputes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="border-border"
                  onClick={() => setOpen(false)}
                  data-testid="button-explore"
                >
                  Explore Platform
                </Button>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  onClick={() => setOpen(false)}
                  data-testid="button-cta"
                >
                  Request a Demo
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
