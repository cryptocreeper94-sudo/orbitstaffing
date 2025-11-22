import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Zap, 
  BarChart3, 
  Clock, 
  DollarSign, 
  Users, 
  Shield,
  CheckCircle2
} from "lucide-react";
import { Link } from "wouter";
import saturnLogo from "@assets/generated_images/aqua_saturn_planet_with_glowing_rings.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Saturn Watermark - Fixed Centered Background */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <img 
          src={saturnLogo} 
          alt="" 
          className="w-[800px] h-[800px] opacity-15 object-contain"
          style={{ 
            filter: 'drop-shadow(0 0 40px rgba(6, 182, 212, 0.4)) drop-shadow(0 0 80px rgba(6, 182, 212, 0.2))',
            willChange: 'transform'
          }}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
      
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="font-heading font-bold text-lg tracking-wider">
            ORBIT
            <div className="text-[9px] text-muted-foreground tracking-widest">STAFFING OS</div>
          </div>
          <div className="flex gap-2">
            <Link href="/login">
              <a className="px-3 py-2 text-sm rounded-md border border-border/50 hover:bg-white/5 transition-colors">
                Login
              </a>
            </Link>
            <Link href="/dashboard">
              <a className="px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                Dashboard
              </a>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background"></div>
        <div className="absolute top-10 right-10 w-60 h-60 bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="mb-6 px-6 py-4 rounded-lg bg-primary/15 border border-primary/30 inline-block">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-sm">
              <Zap className="w-4 h-4 mr-2" /> Automate Your Business
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-heading mb-4 tracking-tight">
            Staffing Reimagined
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            <span className="text-primary font-semibold">Full-Cycle Staffing Operations</span> in one platform. From recruit to payroll to invoice—complete control, complete compliance. Save up to 35% on staffing costs.
          </p>

          <div className="flex flex-col md:flex-row gap-3 justify-center mb-8">
            <Button className="h-10 text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              Request Demo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Link href="/configure">
              <a className="h-10 text-sm px-4 rounded-md border border-primary/30 hover:bg-primary/10 inline-flex items-center">
                Configure for Your Industry
              </a>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard number="35%" label="Cost Savings vs Competitors" />
            <StatCard number="2hrs" label="Complete Onboarding" />
            <StatCard number="$0" label="Setup Fee" />
            <StatCard number="24/7" label="Support" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-card/30 backdrop-blur-sm border-y border-border/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-heading mb-2">End-to-End Staffing Lifecycle</h2>
            <p className="text-muted-foreground text-sm">Complete control from recruitment through payroll and billing. No missing pieces.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard 
              icon={Users}
              title="Recruit & Source"
              desc="Multi-channel job posting, ATS, resume parsing, background checks, I-9 verification, reference checks, credential validation."
            />
            <FeatureCard 
              icon={Clock}
              title="Match & Place"
              desc="Smart candidate matching, client interviews, offer negotiation, assignment tracking, fast fulfillment in minutes not hours."
            />
            <FeatureCard 
              icon={DollarSign}
              title="Time & Payroll"
              desc="Mobile timesheets, client approval workflows, payroll processing, tax withholding, W-2s, direct deposit, compliance reporting."
            />
            <FeatureCard 
              icon={BarChart3}
              title="Billing & Revenue"
              desc="Automatic invoice generation, bill rate management, AR tracking, payment collections, P&L dashboards, margin analysis."
            />
            <FeatureCard 
              icon={Shield}
              title="Compliance & Risk"
              desc="I-9 management, E-Verify, background screening, prevailing wage, workers' comp, tax filings (941, W-2), OSHA safety."
            />
            <FeatureCard 
              icon={Zap}
              title="Full Automation"
              desc="Zero manual entry. Rules-based workflows. Audit-ready. Everything logged. Multi-state tax handling. Real-time notifications."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-heading mb-2">Simple Pricing</h2>
            <p className="text-muted-foreground text-sm">No hidden fees. No long contracts. Get started at orbitstaffing.net</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PricingCard 
              tier="Startup"
              price="$99"
              period="/month"
              desc="Perfect for small agencies"
              workers="Up to 50 workers"
              features={[
                "Job posting & matching",
                "Basic payroll (via CSV export)",
                "5 active clients",
                "Email support"
              ]}
              cta="Get Started"
            />
            <PricingCard 
              tier="Growth"
              price="$299"
              period="/month"
              desc="For scaling teams"
              workers="Up to 500 workers"
              features={[
                "Everything in Startup",
                "Automated payroll integration",
                "Unlimited clients",
                "Gov job compliance",
                "Priority support"
              ]}
              cta="Start Free Trial"
              featured
            />
            <PricingCard 
              tier="Enterprise"
              price="Custom"
              period="pricing"
              desc="For large operations"
              workers="1000+ workers"
              features={[
                "Everything in Growth",
                "Custom integrations",
                "White-label options",
                "Dedicated account manager",
                "24/7 phone support"
              ]}
              cta="Contact Sales"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 bg-primary/5 border-y border-border/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold font-heading mb-3">Ready to Transform Your Staffing?</h2>
          <p className="text-muted-foreground text-sm mb-4">Join the next generation of staffing agencies.</p>
          <Button className="h-10 text-sm bg-primary text-primary-foreground hover:bg-primary/90">
            Start Your Free Trial Today
          </Button>
        </div>
      </section>

      {/* Footer Banner */}
      <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-primary/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={saturnLogo} alt="ORBIT Saturn" className="w-12 h-12" />
              <div>
                <div className="font-heading font-bold text-lg text-white">ORBIT Staffing</div>
                <div className="text-xs text-slate-400">Powered by DarkWave Studios</div>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              <p>© 2025 ORBIT Staffing. All rights reserved.</p>
            </div>
            <Link href="https://darkwavestudios.net" target="_blank">
              <a className="text-primary hover:text-primary/80 transition-colors font-bold">
                DarkWave Studios →
              </a>
            </Link>
          </div>
        </div>
      </footer>

      </div>
    </div>
  );
}

function StatCard({ number, label }: any) {
  return (
    <div className="p-3 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-colors">
      <div className="text-2xl font-bold font-mono text-primary mb-1">{number}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <Card className="bg-card/50 border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all group">
      <CardContent className="p-4">
        <div className="p-2 bg-primary/10 rounded-lg w-fit mb-3 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-bold font-heading mb-1 text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

function PricingCard({ tier, price, period, desc, workers, features, cta, featured }: any) {
  return (
    <Card className={`border transition-all ${featured ? "border-primary bg-card/50 scale-105" : "border-border/50"}`}>
      <CardContent className="p-6">
        {featured && (
          <Badge className="mb-3 bg-primary/20 text-primary border-primary/30 text-xs">Most Popular</Badge>
        )}
        <h3 className="text-xl font-bold font-heading mb-1">{tier}</h3>
        <p className="text-xs text-muted-foreground mb-3">{desc}</p>
        
        <div className="mb-4">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-muted-foreground text-xs">/{period}</span>
        </div>

        <div className="mb-4 p-2 bg-background/50 rounded-lg border border-border/50">
          <div className="text-xs text-muted-foreground">{workers}</div>
        </div>

        <ul className="space-y-2 mb-6">
          {features.map((f: any, i: any) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <Button className={`w-full h-9 text-xs ${featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border/50 hover:bg-white/5"}`}>
          {cta}
        </Button>
      </CardContent>
    </Card>
  );
}