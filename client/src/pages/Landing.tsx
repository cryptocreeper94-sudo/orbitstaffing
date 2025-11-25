import { useState, useEffect } from "react";
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
  CheckCircle2,
  Lock
} from "lucide-react";
import { Link } from "wouter";
import { BusinessTypeModal } from "@/components/BusinessTypeModal";
import { ValuePropositionModal } from "@/components/ValuePropositionModal";
import { BenefitDetailsModal } from "@/components/BenefitDetailsModal";
import { DemoRequestForm } from "@/components/DemoRequestForm";
import { InteractiveOnboarding } from "@/components/InteractiveOnboarding";
import saturnLogo from "@assets/generated_images/saturn_on_solid_black_background.png";

export default function Landing() {
  const [showModal, setShowModal] = useState(false);
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<string | null>(null);

  useEffect(() => {
    // Show interactive onboarding for first-time visitors
    const hasSeenOnboarding = localStorage.getItem("hasSeenInteractiveOnboarding");
    if (!hasSeenOnboarding) {
      // Delay slightly to let page render
      const timer = setTimeout(() => {
        setShowOnboarding(true);
        localStorage.setItem("hasSeenInteractiveOnboarding", "true");
      }, 500);
      return () => clearTimeout(timer);
    }
    
    // Then show business type modal on first visit
    const hasSeenModal = localStorage.getItem("hasSeenBusinessTypeModal");
    if (!hasSeenModal) {
      setShowModal(true);
      localStorage.setItem("hasSeenBusinessTypeModal", "true");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Interactive Onboarding Tour */}
      <InteractiveOnboarding 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)}
      />

      {/* Value Proposition Modal */}
      <ValuePropositionModal />
      
      {/* Business Type Modal */}
      <BusinessTypeModal isOpen={showModal} onClose={() => setShowModal(false)} />

      {/* Benefit Details Modal */}
      <BenefitDetailsModal 
        isOpen={!!selectedBenefit} 
        benefitId={selectedBenefit}
        onClose={() => setSelectedBenefit(null)}
      />

      {/* Demo Request Form */}
      {showDemoForm && <DemoRequestForm onClose={() => setShowDemoForm(false)} />}

      {/* Saturn Watermark - Fixed Centered Background - Transparent */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <img 
          src={saturnLogo} 
          alt="" 
          className="w-[400px] h-[400px] opacity-15"
          style={{ 
            filter: 'drop-shadow(0 0 30px rgba(6, 182, 212, 0.25))',
          }}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
      
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-3 sm:gap-8">
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-h-[44px]">
            <img 
              src={saturnLogo} 
              alt="ORBIT" 
              className="w-8 sm:w-10 h-8 sm:h-10 flex-shrink-0"
            />
            <div className="font-heading font-bold text-sm sm:text-lg tracking-wider text-white whitespace-nowrap">
              <span className="block sm:hidden">ORBIT</span>
              <span className="hidden sm:block">Why ORBIT Staffing OS</span>
            </div>
          </div>
          
          <nav className="flex gap-0 bg-slate-800/50 backdrop-blur-sm px-2 sm:px-3 py-2 rounded-lg border border-slate-700/50 hover:border-slate-600 flex-shrink-0 min-h-[44px] items-center overflow-hidden">
            <Link href="/hallmark-seal" className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-900/30 rounded-md transition-all min-h-[40px] flex items-center" data-testid="link-hallmark-seal">
              <span className="hidden sm:inline">✓ Hallmark</span>
              <span className="sm:hidden">✓</span>
            </Link>
            <div className="h-6 w-px bg-slate-600/50 mx-0.5 sm:mx-0.5" />
            <Link href="/why-orbit" className="w-20 sm:w-28 px-1.5 sm:px-2 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-md transition-all h-[40px] flex items-center justify-center border border-slate-600/30 rounded-l-md" data-testid="link-why-orbit">
              <span className="hidden sm:inline">Why ORBIT</span>
              <span className="sm:hidden">Why</span>
            </Link>
            <div className="h-6 w-px bg-slate-600/50" />
            <Link href="/professional-staffing" className="w-20 sm:w-28 px-1.5 sm:px-2 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-md transition-all h-[40px] flex items-center justify-center border border-slate-600/30 rounded-r-md" data-testid="link-professional">
              <div className="text-center leading-tight">
                <div className="hidden sm:block text-xs sm:text-sm">Professional</div>
                <div className="text-[9px] text-slate-400 hidden sm:block">Division</div>
                <span className="sm:hidden text-xs">Pro</span>
              </div>
            </Link>
          </nav>
        </div>
      </header>

      {/* SANDBOX SHOWCASE SECTION - PLAY WITH FEATURES */}
      <section className="bg-slate-900/50 border-b border-cyan-500/20 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-cyan-300 mb-1 sm:mb-2">Try ORBIT Sandbox</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Play with live features risk-free before committing</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <Link href="/equipment-tracking" className="p-2 sm:p-4 rounded-lg border border-cyan-500/20 bg-cyan-900/10 hover:bg-cyan-900/20 hover:border-cyan-400/50 transition-all min-h-[100px] sm:min-h-auto flex flex-col justify-center">
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">📦</div>
              <div className="font-semibold text-white text-xs sm:text-sm">Equipment</div>
              <div className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">Manage worker gear</div>
            </Link>
            <Link href="/gps-clock-in" className="p-2 sm:p-4 rounded-lg border border-cyan-500/20 bg-cyan-900/10 hover:bg-cyan-900/20 hover:border-cyan-400/50 transition-all min-h-[100px] sm:min-h-auto flex flex-col justify-center">
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">📍</div>
              <div className="font-semibold text-white text-xs sm:text-sm">GPS Clock</div>
              <div className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">Verify location</div>
            </Link>
            <Link href="/payroll-processing" className="p-2 sm:p-4 rounded-lg border border-cyan-500/20 bg-cyan-900/10 hover:bg-cyan-900/20 hover:border-cyan-400/50 transition-all min-h-[100px] sm:min-h-auto flex flex-col justify-center">
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">💰</div>
              <div className="font-semibold text-white text-xs sm:text-sm">Payroll</div>
              <div className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">Process payments</div>
            </Link>
            <Link href="/worker-availability" className="p-2 sm:p-4 rounded-lg border border-cyan-500/20 bg-cyan-900/10 hover:bg-cyan-900/20 hover:border-cyan-400/50 transition-all min-h-[100px] sm:min-h-auto flex flex-col justify-center">
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">📅</div>
              <div className="font-semibold text-white text-xs sm:text-sm">Scheduling</div>
              <div className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">Manage availability</div>
            </Link>
          </div>
        </div>
      </section>

      {/* ACCESS BOXES - OWNER / CUSTOMER / ADMIN */}
      <section className="bg-gradient-to-b from-background to-slate-900/30 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Get Started with ORBIT</h2>
            <p className="text-xs sm:text-base text-muted-foreground">Choose your role to access the platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
            {/* Business Owner Login */}
            <Link href="/admin" className="group">
              <Card className="h-full border-2 border-violet-400/40 hover:border-violet-300/70 bg-gradient-to-br from-violet-400/15 to-purple-400/10 hover:from-violet-400/25 hover:to-purple-400/15 transition-all duration-300 cursor-pointer min-h-[300px] sm:min-h-auto">
                <CardContent className="p-4 sm:p-8 text-center flex flex-col justify-between h-full min-h-[300px] sm:min-h-auto">
                  <div>
                    <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">🏢</div>
                    <h3 className="text-lg sm:text-xl font-bold text-violet-300 mb-1 sm:mb-2">Business Owner</h3>
                    <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-6">Manage your staffing operations, workers, clients, and billing</p>
                    <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-violet-400 flex-shrink-0" />
                        <span>Worker & client management</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-violet-400 flex-shrink-0" />
                        <span>Real-time scheduling</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-violet-400 flex-shrink-0" />
                        <span>Payroll & invoicing</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-violet-500 hover:bg-violet-600 text-white text-xs sm:text-sm min-h-[44px]" data-testid="button-owner-access">
                    Owner Login <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Customer/Client Login */}
            <Link href="/worker" className="group">
              <Card className="h-full border-2 border-blue-600/30 hover:border-blue-400/60 bg-gradient-to-br from-blue-900/20 to-blue-950/10 hover:from-blue-900/40 hover:to-blue-900/20 transition-all duration-300 cursor-pointer min-h-[300px] sm:min-h-auto">
                <CardContent className="p-4 sm:p-8 text-center flex flex-col justify-between h-full min-h-[300px] sm:min-h-auto">
                  <div>
                    <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">👥</div>
                    <h3 className="text-lg sm:text-xl font-bold text-blue-300 mb-1 sm:mb-2">Customer/Client</h3>
                    <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-6">Submit staffing requests, manage assignments, and track performance</p>
                    <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                        <span>Request workers on-demand</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                        <span>Track assignments</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                        <span>Rate workers</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm min-h-[44px]" data-testid="button-customer-access">
                    Customer Login <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Admin Access */}
            <Link href="/developer" className="group">
              <Card className="h-full border-2 border-cyan-600/30 hover:border-cyan-400/60 bg-gradient-to-br from-cyan-900/20 to-cyan-950/10 hover:from-cyan-900/40 hover:to-cyan-900/20 transition-all duration-300 cursor-pointer min-h-[300px] sm:min-h-auto">
                <CardContent className="p-4 sm:p-8 text-center flex flex-col justify-between h-full min-h-[300px] sm:min-h-auto">
                  <div>
                    <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">⚙️</div>
                    <h3 className="text-lg sm:text-xl font-bold text-cyan-300 mb-1 sm:mb-2">System Admin</h3>
                    <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-6">Full platform control, employee registry, and settings</p>
                    <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0" />
                        <span>Employee registry</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0" />
                        <span>Contact notes & history</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0" />
                        <span>API testing</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs sm:text-sm min-h-[44px]" data-testid="button-admin-access">
                    Admin Panel <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

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

          <div className="flex flex-col md:flex-row gap-3 justify-center mb-12">
            <Button 
              onClick={() => setShowDemoForm(true)}
              className="h-10 text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              data-testid="button-landing-demo"
            >
              Request Free Demo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Link href="/configure" className="h-10 text-sm px-4 rounded-md border border-primary/30 hover:bg-primary/10 inline-flex items-center">
              Configure for Your Industry
            </Link>
          </div>

          {/* Benefit Cards - Tap for Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <BenefitCard 
              icon="⚡"
              title="Automate Everything"
              brief="Zero manual entry"
              onClick={() => setSelectedBenefit("automate")}
            />
            <BenefitCard 
              icon="👥"
              title="Keep Workers Longer"
              brief="3x longer retention"
              onClick={() => setSelectedBenefit("workers")}
            />
            <BenefitCard 
              icon="💰"
              title="Save Real Money"
              brief="35% cost reduction"
              onClick={() => setSelectedBenefit("money")}
            />
            <BenefitCard 
              icon="📈"
              title="Scale Without Limits"
              brief="10x more capacity"
              onClick={() => setSelectedBenefit("scale")}
            />
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
            <h2 className="text-3xl font-bold font-heading mb-2">Flexible Pricing for Every Staffing Model</h2>
            <p className="text-muted-foreground text-sm">Pay only for what you use. Fixed monthly, revenue-share, or white-label franchise options available.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PricingCard 
              tier="Solo/Micro"
              price="$199"
              period="/month"
              desc="Just starting out"
              workers="1-25 workers"
              features={[
                "Job posting & matching",
                "Mobile time tracking",
                "1-2 active clients",
                "Basic payroll export",
                "Email support"
              ]}
              cta="Get Started Free"
            />
            <PricingCard 
              tier="Small Agency"
              price="$499"
              period="/month"
              desc="For established staffing agencies"
              workers="25-150 workers"
              features={[
                "Everything in Solo",
                "Unlimited clients",
                "Full payroll automation",
                "GPS verification",
                "Compliance reports",
                "Priority email support"
              ]}
              cta="Start Free Trial"
              featured
            />
            <PricingCard 
              tier="Growth Agency"
              price="$999"
              period="/month"
              desc="Multi-location scaling"
              workers="150-500 workers"
              features={[
                "Everything in Small",
                "Multi-location management",
                "Advanced analytics",
                "Custom integrations",
                "Dedicated support",
                "API access"
              ]}
              cta="Schedule Demo"
            />
            <PricingCard 
              tier="Enterprise"
              price="Custom"
              period="pricing"
              desc="White-label & franchises"
              workers="500+ workers"
              features={[
                "Everything in Growth",
                "White-label platform",
                "Custom branding",
                "Multi-tenant support",
                "Account manager",
                "24/7 phone support"
              ]}
              cta="Contact Sales"
            />
          </div>

          {/* CTA to Pricing Page */}
          <div className="mt-8 text-center">
            <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-semibold transition-colors" data-testid="link-view-pricing">
              View Full Pricing & Payment Options
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Pricing Info */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-3">💰 Fixed Monthly</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Predictable monthly fee based on worker volume. Best for established agencies with stable staffing.
                </p>
                <p className="text-xs text-primary font-medium">No per-placement fees. No variable costs.</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-3">📈 Revenue Share</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Pay 3-6% of total placements. Perfect for franchises and scaling. You only pay when you earn.
                </p>
                <p className="text-xs text-primary font-medium">Scale without upfront costs. Aligned incentives.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Payment Banner - Prominent CTA */}
      <section className="py-8 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-y border-primary/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <DollarSign className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold font-heading">Flexible Pricing Plans Available</h2>
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm mb-5">Pay as you grow. Monthly plans from $199. Or revenue-share options for franchises.</p>
          <div className="flex flex-col md:flex-row gap-3 justify-center">
            <Link href="/pricing" className="h-10 px-6 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center font-semibold shadow-[0_0_20px_rgba(6,182,212,0.3)]" data-testid="button-upgrade-now">
              💳 Upgrade Now
            </Link>
            <Button variant="outline" className="h-10 text-sm" data-testid="button-contact-sales">
              📞 Contact Sales for Enterprise
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 bg-primary/5 border-y border-border/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold font-heading mb-3">Ready to Transform Your Staffing?</h2>
          <p className="text-muted-foreground text-sm mb-4">Join the next generation of staffing agencies.</p>
          <Link href="/pricing" className="inline-flex items-center h-10 px-6 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            Start Your Free Trial Today
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
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
            <div className="flex items-center gap-4">
              <Link href="https://darkwavestudios.net" target="_blank">
                <a className="text-primary hover:text-primary/80 transition-colors font-bold">
                  DarkWave Studios →
                </a>
              </Link>
              <Link href="/developer" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                ⚙️
              </Link>
            </div>
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

function BenefitCard({ icon, title, brief, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="p-6 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all group cursor-pointer text-left"
      data-testid={`benefit-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-xs text-muted-foreground mb-3">{brief}</p>
      <div className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Tap to learn more →
      </div>
    </button>
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