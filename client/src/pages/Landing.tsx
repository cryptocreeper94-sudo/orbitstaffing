import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Zap, 
  BarChart3, 
  Clock, 
  DollarSign, 
  Users, 
  Shield,
  MapPin,
  CheckCircle2,
  Check,
  Lock,
  ChevronRight,
  Menu,
  X,
  Settings,
  Info,
  Coins,
  FileText,
  Search
} from "lucide-react";
import { Web3SearchBar } from "@/components/Web3SearchBar";
import { Link } from "wouter";
import { BusinessTypeModal } from "@/components/BusinessTypeModal";
import { ValuePropositionModal } from "@/components/ValuePropositionModal";
import { BenefitDetailsModal } from "@/components/BenefitDetailsModal";
import { DemoRequestForm } from "@/components/DemoRequestForm";
import { InteractiveOnboarding } from "@/components/InteractiveOnboarding";
import { HomeSlideshow } from "@/components/HomeSlideshow";
import { WelcomeSlideshow } from "@/components/WelcomeSlideshow";
import { Accordion } from "@/components/Accordion";
import { ISO20022Banner } from "@/components/ISO20022Banner";
import { slidesData, orbitSlides } from "@/data/slidesData";
import { CarouselRail, CarouselRailItem } from "@/components/ui/carousel-rail";
import { SectionHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardContent, OrbitCardHeader, OrbitCardTitle, StatCard, ActionCard } from "@/components/ui/orbit-card";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { Card, CardContent } from "@/components/ui/card";
import saturnWatermark from "@assets/generated_images/floating_saturn_planet_pure_transparency.png";
import orbyMascot from "@assets/generated_images/orby_mascot_presenting_pose.png";
import quickbooksLogo from "@assets/generated_images/quickbooks_logo_emblem.png";
import adpLogo from "@assets/generated_images/adp_logo_emblem.png";
import indeedLogo from "@assets/generated_images/indeed_logo_emblem.png";
import linkedinLogo from "@assets/generated_images/linkedin_logo_emblem.png";
import slackLogo from "@assets/generated_images/slack_logo_emblem.png";
import stripeLogo from "@assets/generated_images/stripe_logo_emblem.png";
import xeroLogo from "@assets/generated_images/xero_logo_emblem.png";
import gustoLogo from "@assets/generated_images/gusto_logo_emblem.png";

const integrationDetails: Record<string, { title: string; description: string; features: string[]; status: string }> = {
  "QuickBooks": {
    title: "QuickBooks Integration",
    description: "Seamlessly sync your ORBIT payroll data with QuickBooks for automated accounting and financial reporting.",
    features: ["Auto-sync payroll expenses", "Export invoices directly", "Real-time financial reconciliation", "Tax-ready reports"],
    status: "Live"
  },
  "ADP": {
    title: "ADP Integration",
    description: "Connect ORBIT with ADP for enterprise-grade payroll processing and compliance management.",
    features: ["Payroll data export", "Benefits administration sync", "Compliance reporting", "W-2 and 1099 generation"],
    status: "Live"
  },
  "Indeed": {
    title: "Indeed Integration",
    description: "Post jobs directly from ORBIT to Indeed and import applicants automatically into your talent pool.",
    features: ["One-click job posting", "Applicant auto-import", "Job performance analytics", "Sponsored job support"],
    status: "Live"
  },
  "LinkedIn": {
    title: "LinkedIn Integration",
    description: "Leverage LinkedIn's professional network to find qualified candidates and verify work history.",
    features: ["Job posting sync", "Profile verification", "Candidate messaging", "Recruiter tools access"],
    status: "Coming Soon"
  },
  "Slack": {
    title: "Slack Integration",
    description: "Get real-time notifications and manage staffing operations directly from your Slack workspace.",
    features: ["Shift alerts & reminders", "Clock-in/out notifications", "Approval workflows", "Team communication"],
    status: "Live"
  },
  "Stripe": {
    title: "Stripe Integration",
    description: "Process payments, handle invoicing, and manage the ORBIT Pay Card system with Stripe.",
    features: ["Invoice payments", "Pay card issuing", "Instant payouts", "Subscription billing"],
    status: "Live"
  },
  "Xero": {
    title: "Xero Integration",
    description: "Sync your ORBIT financial data with Xero for streamlined bookkeeping and accounting.",
    features: ["Expense tracking sync", "Invoice generation", "Bank reconciliation", "Multi-currency support"],
    status: "Live"
  },
  "Gusto": {
    title: "Gusto Integration",
    description: "Connect ORBIT timesheets and worker data with Gusto for simplified payroll and benefits.",
    features: ["Timesheet sync", "PTO management", "Benefits enrollment", "Tax filing automation"],
    status: "Coming Soon"
  }
};

export default function Landing() {
  const [showModal, setShowModal] = useState(false);
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcomeSlideshow, setShowWelcomeSlideshow] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<string | null>(null);
  const [showLotOpsSlideshow, setShowLotOpsSlideshow] = useState(false);
  const [showOrbitSlideshow, setShowOrbitSlideshow] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcomeSlideshow");
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setShowWelcomeSlideshow(true);
      }, 300);
      return () => clearTimeout(timer);
    }
    
    const hasSeenOnboarding = localStorage.getItem("hasSeenInteractiveOnboarding");
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => {
        setShowOnboarding(true);
        localStorage.setItem("hasSeenInteractiveOnboarding", "true");
      }, 500);
      return () => clearTimeout(timer);
    }
    
    const hasSeenModal = localStorage.getItem("hasSeenBusinessTypeModal");
    if (!hasSeenModal) {
      setShowModal(true);
      localStorage.setItem("hasSeenBusinessTypeModal", "true");
    }
  }, []);

  const handleWelcomeClose = () => {
    setShowWelcomeSlideshow(false);
    localStorage.setItem("hasSeenWelcomeSlideshow", "true");
    localStorage.setItem("hasSeenInteractiveOnboarding", "true");
    localStorage.setItem("hasSeenBusinessTypeModal", "true");
    localStorage.setItem("hasSeenValueProposition", "true");
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-y-hidden">
      <WelcomeSlideshow
        isOpen={showWelcomeSlideshow}
        onClose={handleWelcomeClose}
      />

      <InteractiveOnboarding 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)}
      />

      <ValuePropositionModal />
      <BusinessTypeModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <BenefitDetailsModal 
        isOpen={!!selectedBenefit} 
        benefitId={selectedBenefit}
        onClose={() => setSelectedBenefit(null)}
      />

      {showDemoForm && <DemoRequestForm onClose={() => setShowDemoForm(false)} />}

      {selectedIntegration && integrationDetails[selectedIntegration] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="integration-modal">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedIntegration(null)}
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedIntegration(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              data-testid="close-integration-modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-600 flex-shrink-0">
                <img 
                  src={
                    selectedIntegration === "QuickBooks" ? quickbooksLogo :
                    selectedIntegration === "ADP" ? adpLogo :
                    selectedIntegration === "Indeed" ? indeedLogo :
                    selectedIntegration === "LinkedIn" ? linkedinLogo :
                    selectedIntegration === "Slack" ? slackLogo :
                    selectedIntegration === "Stripe" ? stripeLogo :
                    selectedIntegration === "Xero" ? xeroLogo :
                    gustoLogo
                  }
                  alt={selectedIntegration}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{integrationDetails[selectedIntegration].title}</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  integrationDetails[selectedIntegration].status === "Live" 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "bg-amber-500/20 text-amber-400"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    integrationDetails[selectedIntegration].status === "Live" ? "bg-emerald-400" : "bg-amber-400"
                  }`} />
                  {integrationDetails[selectedIntegration].status}
                </span>
              </div>
            </div>
            
            <p className="text-slate-300 text-sm mb-4">{integrationDetails[selectedIntegration].description}</p>
            
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Key Features</h4>
              <ul className="space-y-2">
                {integrationDetails[selectedIntegration].features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Link 
                href="/integrations"
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-center py-2 rounded-lg text-sm font-medium transition-colors"
              >
                View All Integrations
              </Link>
              <button 
                onClick={() => setSelectedIntegration(null)}
                className="px-4 py-2 border border-slate-600 hover:border-slate-500 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <img 
          src={saturnWatermark} 
          alt="" 
          className="w-[400px] h-[400px] opacity-15"
          style={{ 
            filter: 'drop-shadow(0 0 30px rgba(6, 182, 212, 0.25))',
          }}
        />
      </div>

      <div className="relative z-10">
      
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 w-full py-2 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <img 
              src={orbyMascot} 
              alt="Orby" 
              className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
            />
            <span className="font-heading font-bold text-xs sm:text-base tracking-wider text-white whitespace-nowrap leading-none hidden sm:inline">Welcome to ORBIT Full Cycle Staffing</span>
            <span className="font-heading font-bold text-xs tracking-wider text-white sm:hidden">ORBIT</span>
          </div>
          
          {/* Desktop: Full search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <Web3SearchBar />
          </div>
          
          {/* Mobile: Search icon + Menu */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="p-1.5 text-cyan-400 hover:text-cyan-300 transition rounded-lg hover:bg-slate-800/50 md:hidden"
              data-testid="button-landing-search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-400 hover:text-cyan-400 transition rounded-lg hover:bg-slate-800/50"
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile search bar dropdown */}
        {mobileSearchOpen && (
          <div className="md:hidden px-3 pb-3 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50">
            <Web3SearchBar />
          </div>
        )}
        
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-slate-900/98 backdrop-blur-lg border-b border-slate-700/50 shadow-xl z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              <Link href="/hallmark-seal" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-amber-300 hover:bg-slate-800 rounded-lg transition font-medium">
                <CheckCircle2 className="w-4 h-4" />
                ✓ Hallmark
              </Link>
              <Link href="/why-orbit" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition">
                <Info className="w-4 h-4" />
                Why ORBIT
              </Link>
              <Link href="/professional-staffing" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition">
                <Users className="w-4 h-4" />
                Professional
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition">
                <Info className="w-4 h-4" />
                About
              </Link>
              <div className="border-t border-slate-700/50 my-2" />
              <Link href="/changelog" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-cyan-400 hover:bg-slate-800 rounded-lg transition">
                <FileText className="w-4 h-4" />
                What's New
              </Link>
              <Link href="/solana-verification" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-purple-400 hover:bg-slate-800 rounded-lg transition">
                <Coins className="w-4 h-4" />
                Blockchain
              </Link>
              <div className="border-t border-slate-700/50 my-2" />
              <Link href="/developer" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition">
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            </div>
          </div>
        )}
      </header>

      <div className="hidden sm:block">
        <ISO20022Banner />
      </div>

      {/* TALENT EXCHANGE - BENTO GRID */}
      <section className="bg-gradient-to-r from-emerald-900/30 via-cyan-900/20 to-emerald-900/30 border-b border-emerald-500/30 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader 
            eyebrow="NEW - Talent Exchange"
            title="ORBIT Talent Exchange"
            subtitle="Two-way job marketplace"
            align="center"
            size="md"
            className="mb-6"
          />
          
          {/* Bento Grid - 2 cols mobile, 4 cols desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 auto-rows-[100px] sm:auto-rows-[120px]">
            <Link href="/jobs" className="col-span-2 row-span-2 group relative rounded-2xl overflow-hidden border border-emerald-500/40 hover:border-emerald-400 transition-all shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20" data-testid="link-job-board">
              <img src="/images/scenarios/worker_matching_on_screen.png" alt="Jobs" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Featured</span>
                <h3 className="text-2xl font-bold text-white mt-1">Browse Jobs</h3>
                <p className="text-slate-300 text-sm mt-1">Find your next opportunity</p>
              </div>
            </Link>

            <Link href="/talent-pool" className="col-span-2 row-span-1 group relative rounded-xl overflow-hidden border border-cyan-500/40 hover:border-cyan-400 transition-all shadow-lg" data-testid="link-talent-pool">
              <img src="/images/scenarios/diverse_workers_shift_prep.png" alt="Talent" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-transparent" />
              <div className="absolute inset-y-0 left-4 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-white">Find Talent</h3>
                <p className="text-cyan-300 text-sm">Skilled workers ready now</p>
              </div>
            </Link>

            <Link href="/employer/register" className="col-span-1 row-span-1 group relative rounded-xl overflow-hidden border border-violet-500/40 hover:border-violet-400 transition-all shadow-lg" data-testid="link-employer-register">
              <img src="/images/scenarios/professional_creating_invoices.png" alt="Post" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <h3 className="text-lg font-bold text-white">Post Jobs</h3>
              </div>
            </Link>

            <Link href="/apply" className="col-span-1 row-span-1 group relative rounded-xl overflow-hidden border border-amber-500/40 hover:border-amber-400 transition-all shadow-lg" data-testid="link-apply">
              <img src="/images/scenarios/multi-industry_gps_clock-in.png" alt="Apply" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <h3 className="text-lg font-bold text-white">Apply Now</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES - BENTO GRID */}
      <section className="bg-slate-900/50 border-b border-cyan-500/20 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader 
            title="Platform Features"
            subtitle="Everything you need to run your staffing operation"
            align="center"
            size="md"
            className="mb-6"
          />
          
          {/* Bento Grid - 2 cols mobile, 3 cols desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 auto-rows-[110px] sm:auto-rows-[140px]">
            <Link href="/gps-clock-in" className="col-span-2 row-span-1 group relative rounded-xl overflow-hidden border border-cyan-500/40 hover:border-cyan-400 transition-all shadow-lg">
              <img src="/images/scenarios/multi-industry_gps_clock-in.png" alt="GPS" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
              <div className="absolute inset-y-0 left-5 flex flex-col justify-center">
                <span className="text-cyan-400 text-xs font-semibold uppercase">Location Verified</span>
                <h3 className="text-2xl font-bold text-white mt-1">GPS Clock-In</h3>
                <p className="text-slate-300 text-sm">Fraud-proof time tracking with geofencing</p>
              </div>
            </Link>

            <Link href="/payroll-processing" className="col-span-1 row-span-2 group relative rounded-xl overflow-hidden border border-emerald-500/40 hover:border-emerald-400 transition-all shadow-lg">
              <img src="/images/scenarios/payroll_processing_scene.png" alt="Payroll" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-emerald-400 text-xs font-semibold uppercase">Automated</span>
                <h3 className="text-xl font-bold text-white mt-1">Payroll Processing</h3>
                <p className="text-slate-300 text-sm mt-1">Multi-state compliant payroll automation</p>
              </div>
            </Link>

            <Link href="/admin/compliance" className="col-span-1 row-span-1 group relative rounded-xl overflow-hidden border border-amber-500/40 hover:border-amber-400 transition-all shadow-lg">
              <img src="/images/scenarios/compliance_verification_interview.png" alt="Compliance" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <h3 className="text-lg font-bold text-white">Compliance</h3>
                <p className="text-amber-300 text-xs">I-9, E-Verify, certifications</p>
              </div>
            </Link>

            <Link href="/crm" className="col-span-1 row-span-1 group relative rounded-xl overflow-hidden border border-violet-500/40 hover:border-violet-400 transition-all shadow-lg">
              <img src="/images/scenarios/coworkers_referral_handshake.png" alt="CRM" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <h3 className="text-lg font-bold text-white">CRM</h3>
                <p className="text-violet-300 text-xs">Client relationships</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* RECENTLY LAUNCHED - BENTO GRID */}
      <section className="bg-gradient-to-br from-violet-950/40 via-purple-900/30 to-violet-950/40 border-b border-violet-500/30 py-6 sm:py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader 
            eyebrow="Live"
            title="Recently Launched"
            align="center"
            size="md"
            className="mb-6"
          />
          
          {/* Mobile Carousel */}
          <div className="sm:hidden">
            <CarouselRail showArrows={true} gap="sm">
              {[
                { href: "/hallmark-seal", image: "/images/scenarios/security_verification_process.png", label: "Hallmarks" },
                { href: "/pay-card", image: "/images/scenarios/diverse_workers_checking_wages.png", label: "Pay Card" },
                { href: "/marketing-hub", image: "/images/scenarios/team_celebrating_bonuses.png", label: "Marketing" },
                { href: "/crypto-wallet", image: "/images/scenarios/it_system_integration.png", label: "Crypto" },
              ].map((item) => (
                <CarouselRailItem key={item.href} className="basis-[65%] min-w-[65%]">
                  <Link href={item.href} className="block rounded-xl overflow-hidden border border-green-500/50 shadow-lg">
                    <div className="relative h-28">
                      <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                      <span className="absolute top-2 right-2 text-[8px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">LIVE</span>
                      <div className="absolute bottom-2 left-3">
                        <h3 className="font-bold text-white text-sm">{item.label}</h3>
                      </div>
                    </div>
                  </Link>
                </CarouselRailItem>
              ))}
            </CarouselRail>
          </div>

          {/* Desktop: Bento Grid */}
          <div className="hidden sm:grid grid-cols-3 gap-4">
            <Link href="/hallmark-seal" className="group relative rounded-xl overflow-hidden border border-green-500/50 hover:border-green-400 shadow-lg h-[160px]" data-testid="card-hallmarks">
              <img src="/images/scenarios/security_verification_process.png" alt="Hallmarks" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-transparent" />
              <span className="absolute top-3 right-3 text-xs bg-green-500 text-white px-2 py-1 rounded-full font-bold">LIVE</span>
              <div className="absolute inset-y-0 left-4 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-white">Hallmark Seals</h3>
                <p className="text-green-300 text-sm">Verified authenticity badges</p>
              </div>
            </Link>

            <Link href="/pay-card" className="group relative rounded-xl overflow-hidden border border-green-500/50 hover:border-green-400 shadow-lg h-[160px]" data-testid="card-pay-card">
              <img src="/images/scenarios/diverse_workers_checking_wages.png" alt="Pay Card" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
              <span className="absolute top-3 right-3 text-xs bg-green-500 text-white px-2 py-1 rounded-full font-bold">LIVE</span>
              <div className="absolute inset-y-0 left-4 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-white">Pay Card</h3>
                <p className="text-green-300 text-sm">Instant worker payments</p>
              </div>
            </Link>

            <Link href="/marketing-hub" className="group relative rounded-xl overflow-hidden border border-green-500/50 hover:border-green-400 shadow-lg h-[160px]" data-testid="card-marketing">
              <img src="/images/scenarios/team_celebrating_bonuses.png" alt="Marketing" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
              <span className="absolute top-3 right-3 text-xs bg-green-500 text-white px-2 py-1 rounded-full font-bold">LIVE</span>
              <div className="absolute inset-y-0 left-4 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-white">Marketing</h3>
                <p className="text-green-300 text-sm">Recruitment campaigns</p>
              </div>
            </Link>
          </div>
          
          <div className="text-center mt-6">
            <Link href="/roadmap" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-200 font-semibold text-sm transition-all" data-testid="link-view-roadmap">
              View Roadmap <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ACCESS BOXES - BENTO GRID */}
      <section className="bg-gradient-to-b from-background to-slate-900/30 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader 
            title="Get Started"
            align="center"
            size="md"
            className="mb-6"
          />

          {/* Bento Grid - 2 cols mobile, 4 cols desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Link href="/admin" className="group relative rounded-xl overflow-hidden border border-violet-400/50 hover:border-violet-300 shadow-lg h-[140px] sm:h-[180px]">
              <img src="/images/scenarios/professional_creating_invoices.png" alt="Owner" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-center">
                <h3 className="text-sm sm:text-lg font-bold text-violet-300">Owner</h3>
                <Button className="w-full mt-1.5 sm:mt-2 bg-violet-500/80 hover:bg-violet-600 text-white text-[10px] sm:text-xs h-7 sm:h-8" data-testid="button-owner-access">
                  Login
                </Button>
              </div>
            </Link>

            <Link href="/worker" className="group relative rounded-xl overflow-hidden border border-blue-500/50 hover:border-blue-400 shadow-lg h-[140px] sm:h-[180px]">
              <img src="/images/scenarios/coworkers_referral_handshake.png" alt="Client" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-center">
                <h3 className="text-sm sm:text-lg font-bold text-blue-300">Client</h3>
                <Button className="w-full mt-1.5 sm:mt-2 bg-blue-500/80 hover:bg-blue-600 text-white text-[10px] sm:text-xs h-7 sm:h-8" data-testid="button-customer-access">
                  Login
                </Button>
              </div>
            </Link>

            <Link href="/employee-hub" className="group relative rounded-xl overflow-hidden border border-emerald-500/50 hover:border-emerald-400 shadow-lg h-[140px] sm:h-[180px]" data-testid="card-employee-self-service">
              <img src="/images/scenarios/diverse_workers_shift_prep.png" alt="Staff" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-center">
                <h3 className="text-sm sm:text-lg font-bold text-emerald-300">Staff Hub</h3>
                <Button className="w-full mt-1.5 sm:mt-2 bg-emerald-500/80 hover:bg-emerald-600 text-white text-[10px] sm:text-xs h-7 sm:h-8" data-testid="button-employee-access">
                  Enter
                </Button>
              </div>
            </Link>

            <Link href="/developer" className="group relative rounded-xl overflow-hidden border border-cyan-500/50 hover:border-cyan-400 shadow-lg h-[140px] sm:h-[180px]">
              <img src="/images/scenarios/it_system_integration.png" alt="Admin" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-center">
                <h3 className="text-sm sm:text-lg font-bold text-cyan-300">Admin</h3>
                <Button className="w-full mt-1.5 sm:mt-2 bg-cyan-500/80 hover:bg-cyan-600 text-white text-[10px] sm:text-xs h-7 sm:h-8" data-testid="button-admin-access">
                  Panel
                </Button>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative py-4 sm:py-12 md:py-20 sm:overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background"></div>
        <div className="absolute top-10 right-10 w-60 h-60 bg-primary/10 rounded-full blur-3xl hidden sm:block"></div>
        
        <div className="relative max-w-4xl mx-auto px-3 sm:px-6 text-center">
          <div className="mb-3 sm:mb-6 px-3 sm:px-6 py-2 sm:py-4 rounded-lg bg-primary/15 border border-primary/30 inline-block">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] sm:text-sm">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Automate Your Business
            </Badge>
          </div>
          
          <h1 className="text-2xl sm:text-5xl md:text-7xl font-bold font-heading mb-2 sm:mb-4 tracking-tight">
            Staffing Reimagined
          </h1>
          
          <p className="text-xs sm:text-lg md:text-xl text-muted-foreground mb-3 sm:mb-6 max-w-2xl mx-auto line-clamp-2 sm:line-clamp-none">
            <span className="text-primary font-semibold">Full-Cycle Staffing</span> — recruit to payroll. Save up to 35%.
          </p>

          <div className="flex flex-row gap-2 sm:gap-3 justify-center mb-4 sm:mb-12">
            <Button 
              onClick={() => setShowDemoForm(true)}
              className="h-8 sm:h-10 text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)] px-3 sm:px-4"
              data-testid="button-landing-demo"
            >
              Demo <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
            </Button>
            <Link href="/configure" className="h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4 rounded-md border border-primary/30 hover:bg-primary/10 inline-flex items-center">
              Configure
            </Link>
          </div>

        </div>
        
        {/* Benefit Cards - Full Width */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { image: "/images/scenarios/it_system_integration.png", title: "Automate", brief: "Zero entry", id: "automate" },
              { image: "/images/scenarios/diverse_workers_shift_prep.png", title: "Retain", brief: "3x longer", id: "workers" },
              { image: "/images/scenarios/diverse_workers_checking_wages.png", title: "Save", brief: "35% off", id: "money" },
              { image: "/images/scenarios/worker_matching_on_screen.png", title: "Scale", brief: "10x capacity", id: "scale" },
            ].map((item) => (
              <div key={item.id} className="flex-1">
                <ScenarioBenefitCard 
                  image={item.image}
                  title={item.title}
                  brief={item.brief}
                  onClick={() => setSelectedBenefit(item.id)}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Stats Row - Inline */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-center gap-4 sm:gap-8 text-center">
            {[
              { num: "35%", label: "Savings" },
              { num: "2hrs", label: "Onboard" },
              { num: "$0", label: "Setup" },
              { num: "24/7", label: "Support" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-lg sm:text-xl font-bold text-primary">{s.num}</div>
                <div className="text-[9px] sm:text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations - Cards with Logos */}
      <section className="py-4 sm:py-6 bg-gradient-to-r from-cyan-950/30 via-blue-950/20 to-cyan-950/30 border-y border-cyan-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">16+ Integrations</h3>
            <Link href="/integrations" className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <CarouselRail showArrows={true} gap="md">
            {[
              { name: "QuickBooks", logo: quickbooksLogo },
              { name: "ADP", logo: adpLogo },
              { name: "Indeed", logo: indeedLogo },
              { name: "LinkedIn", logo: linkedinLogo },
              { name: "Slack", logo: slackLogo },
              { name: "Stripe", logo: stripeLogo },
              { name: "Xero", logo: xeroLogo },
              { name: "Gusto", logo: gustoLogo },
            ].map((item, idx) => (
              <CarouselRailItem key={idx} className="w-[120px] sm:w-[140px]">
                <button 
                  onClick={() => setSelectedIntegration(item.name)}
                  className="relative rounded-xl overflow-hidden border border-slate-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all h-[90px] w-full cursor-pointer"
                  data-testid={`integration-${item.name.toLowerCase()}`}
                >
                  <img src={item.logo} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-0 right-0 text-center">
                    <span className="text-[10px] font-medium text-white">{item.name}</span>
                  </div>
                </button>
              </CarouselRailItem>
            ))}
          </CarouselRail>
        </div>
      </section>

      {/* Savings Banner - Compact Inline */}
      <section className="py-2 sm:py-3 bg-green-950/20 border-y border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400 line-through">1.6x</span>
              <span className="text-sm font-bold text-green-400">1.45x markup</span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <span className="text-xs text-white font-medium">Save 35% · $6K+/year</span>
            <Link href="/pricing" className="text-[10px] bg-green-600/80 hover:bg-green-600 text-white px-2 py-1 rounded font-medium">
              Calculate
            </Link>
          </div>
        </div>
      </section>

      {/* All-in-One Platform - Image Cards */}
      <section className="py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">All-in-One Platform</h3>
            <Link href="/features" className="text-[10px] text-primary hover:underline">View All</Link>
          </div>
          <CarouselRail showArrows={true} gap="md">
            {[
              { image: "/images/scenarios/multi-industry_gps_clock-in.png", title: "Time", desc: "GPS Clock-In", href: "/gps-clock-in" },
              { image: "/images/scenarios/worker_matching_on_screen.png", title: "Hiring", desc: "AI Matching", href: "/hiring" },
              { image: "/images/scenarios/payroll_processing_scene.png", title: "Payroll", desc: "Auto Process", href: "/payroll-processing" },
              { image: "/images/scenarios/compliance_verification_interview.png", title: "Compliance", desc: "I-9, E-Verify", href: "/admin/compliance" },
              { image: "/images/scenarios/team_celebrating_bonuses.png", title: "Analytics", desc: "Real-time", href: "/analytics" },
              { image: "/images/scenarios/security_verification_process.png", title: "Security", desc: "SOC 2", href: "/security" },
            ].map((f) => (
              <CarouselRailItem key={f.title} className="w-[140px] sm:w-[180px]">
                <Link href={f.href} className="block rounded-xl overflow-hidden border border-cyan-500/30 hover:border-cyan-400 transition-all">
                  <div className="relative h-24 sm:h-28">
                    <img src={f.image} alt={f.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="text-xs font-bold text-white">{f.title}</div>
                      <div className="text-[9px] text-cyan-300">{f.desc}</div>
                    </div>
                  </div>
                </Link>
              </CarouselRailItem>
            ))}
          </CarouselRail>
        </div>
      </section>

      {/* Pricing Section - Full Width Grid */}
      <section className="py-6 sm:py-10 bg-gradient-to-br from-slate-900 via-background to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader 
              title="Simple Pricing"
              subtitle="Bundles or à la carte. No hidden fees."
              align="left"
              size="sm"
              className="mb-0"
            />
            <Link href="/pricing" className="text-xs text-primary hover:underline flex items-center gap-1" data-testid="link-view-pricing">
              Compare Plans <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Pricing Mode Toggle */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-full p-1">
              <span className="px-3 py-1.5 text-xs font-medium text-white bg-cyan-500/20 rounded-full">Bundles</span>
              <Link href="/pricing?tab=tools" className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors">À La Carte</Link>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline">Pick individual tools starting at $15/mo</span>
          </div>

          {/* Bento Grid - stacked on mobile, 3 cols desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { tier: "Starter", price: "$39", workers: "Up to 10 workers", features: ["GPS Clock-In", "Basic Payroll", "Email Support", "Mobile App"] },
              { tier: "Pro", price: "$99", workers: "Up to 50 workers", features: ["Everything in Starter", "AI Worker Matching", "Priority Support", "Analytics Dashboard"], featured: true },
              { tier: "Enterprise", price: "Custom", workers: "Unlimited workers", features: ["Everything in Pro", "Dedicated Account Manager", "Custom Integrations", "SLA Guarantee"] },
            ].map((plan) => (
              <div key={plan.tier} className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 ${plan.featured ? 'bg-gradient-to-br from-violet-900/40 to-purple-900/40 border-2 border-violet-500/50 shadow-[0_0_30px_rgba(139,92,246,0.2)]' : 'bg-slate-800/50 border border-slate-700/50'}`}>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className={`text-sm sm:text-lg font-bold ${plan.featured ? 'text-violet-300' : 'text-cyan-300'}`}>{plan.tier}</span>
                  {plan.featured && <span className="text-[8px] sm:text-[10px] bg-violet-500 text-white px-2 py-0.5 sm:py-1 rounded-full font-medium">MOST POPULAR</span>}
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{plan.price}<span className="text-xs sm:text-sm text-slate-400">/mo</span></div>
                <div className="text-[10px] sm:text-xs text-slate-400 mb-3 sm:mb-4">{plan.workers}</div>
                <ul className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="text-[10px] sm:text-sm text-slate-300 flex items-center gap-1.5 sm:gap-2">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className={`block text-center py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${plan.featured ? 'bg-violet-500 hover:bg-violet-600 text-white' : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300'}`}>
                  {plan.tier === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                </Link>
              </div>
            ))}
          </div>

          {/* À La Carte Preview */}
          <div className="mt-6 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-white">Or Build Your Own</h4>
                <p className="text-[10px] text-slate-400">Pick only the tools you need</p>
              </div>
              <Link href="/pricing?tab=tools" className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1">
                See All Tools <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { name: "CRM", price: "$19", Icon: BarChart3, color: "text-cyan-400" },
                { name: "Time & GPS", price: "$15", Icon: MapPin, color: "text-violet-400" },
                { name: "Payroll", price: "$39", Icon: DollarSign, color: "text-emerald-400" },
                { name: "Talent Pool", price: "$29", Icon: Users, color: "text-blue-400" },
                { name: "Compliance", price: "$25", Icon: Shield, color: "text-amber-400" },
              ].map((tool) => (
                <Link 
                  key={tool.name}
                  href="/pricing?tab=tools"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-cyan-500/50 transition-colors"
                >
                  <tool.Icon className={`w-4 h-4 ${tool.color}`} />
                  <span className="text-xs text-white font-medium">{tool.name}</span>
                  <span className="text-xs text-cyan-400">{tool.price}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-6 bg-primary/5 border-y border-border/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-2">Ready to Transform Your Staffing?</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mb-3">Join the next generation of staffing agencies.</p>
          <Link href="/pricing" className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-semibold whitespace-nowrap">
            Start Your Free Trial Today
            <ArrowRight className="w-4 h-4 ml-2 flex-shrink-0" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-baseline justify-center gap-2 text-xs text-slate-500">
          <span>DarkWave Studios, LLC</span>
          <span>|</span>
          <span>© 2025</span>
          <span>|</span>
          <Link href="/changelog" className="text-cyan-400 hover:text-cyan-300 transition-colors" data-testid="link-version-footer">
            v2.7.0
          </Link>
        </div>
      </footer>

      </div>
    </div>
  );
}

function LandingStatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="p-3 h-full flex flex-col justify-center">
      <div className="text-2xl font-bold font-mono text-primary mb-1">{number}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <OrbitCard variant="default" className="h-full">
      <OrbitCardContent className="p-4">
        <div className="p-2 bg-primary/10 rounded-lg w-fit mb-3 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-bold font-heading mb-1 text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </OrbitCardContent>
    </OrbitCard>
  );
}

function BenefitCard({ icon, title, brief, onClick }: { icon: string; title: string; brief: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full h-full p-3 sm:p-6 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all group cursor-pointer text-left"
      data-testid={`benefit-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="font-bold text-sm sm:text-lg mb-1 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-[10px] sm:text-xs text-muted-foreground">{brief}</p>
    </button>
  );
}

function ScenarioBenefitCard({ image, title, brief, onClick }: { image: string; title: string; brief: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full h-full rounded-xl border border-primary/30 bg-slate-900/80 hover:bg-slate-800/80 hover:border-primary/60 transition-all group cursor-pointer text-left overflow-hidden shadow-lg hover:shadow-xl hover:shadow-primary/10"
      data-testid={`benefit-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="relative h-20 sm:h-28 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
      </div>
      <div className="p-2 sm:p-4">
        <h3 className="font-bold text-sm sm:text-lg text-white group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-[10px] sm:text-xs text-slate-400">{brief}</p>
      </div>
    </button>
  );
}

function PricingCard({ tier, price, period, desc, workers, features, cta, featured }: { 
  tier: string; 
  price: string; 
  period: string; 
  desc: string; 
  workers: string; 
  features: string[]; 
  cta: string; 
  featured?: boolean;
}) {
  return (
    <OrbitCard variant={featured ? "stat" : "default"} className={`h-full ${featured ? "border-primary" : ""}`}>
      <OrbitCardContent className="p-3 sm:p-6 h-full flex flex-col">
        {featured && (
          <Badge className="mb-2 sm:mb-3 bg-primary/20 text-primary border-primary/30 text-[10px] sm:text-xs w-fit">Most Popular</Badge>
        )}
        <h3 className="text-base sm:text-xl font-bold font-heading mb-1">{tier}</h3>
        <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">{desc}</p>
        
        <div className="mb-2 sm:mb-4">
          <span className="text-xl sm:text-3xl font-bold">{price}</span>
          <span className="text-muted-foreground text-[10px] sm:text-xs">/{period}</span>
        </div>

        <div className="mb-2 sm:mb-4 p-1.5 sm:p-2 bg-background/50 rounded-lg border border-border/50">
          <div className="text-[10px] sm:text-xs text-muted-foreground">{workers}</div>
        </div>

        <ul className="space-y-1 sm:space-y-2 flex-1 overflow-hidden">
          {features.slice(0, 4).map((f, i) => (
            <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
              <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">{f}</span>
            </li>
          ))}
        </ul>

        <Button className={`w-full h-7 sm:h-9 text-[10px] sm:text-xs mt-3 sm:mt-6 ${featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border/50 hover:bg-white/5"}`}>
          {cta}
        </Button>
      </OrbitCardContent>
    </OrbitCard>
  );
}
