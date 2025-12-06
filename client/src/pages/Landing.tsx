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
  Lock,
  ChevronRight,
  Menu,
  X,
  Settings,
  Info,
  Coins,
  FileText
} from "lucide-react";
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
import saturnWatermark from "@assets/generated_images/floating_saturn_planet_pure_transparency.png";
import orbyCommanderEmblem from "@assets/orby_commander_transparent.png";

export default function Landing() {
  const [showModal, setShowModal] = useState(false);
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcomeSlideshow, setShowWelcomeSlideshow] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<string | null>(null);
  const [showLotOpsSlideshow, setShowLotOpsSlideshow] = useState(false);
  const [showOrbitSlideshow, setShowOrbitSlideshow] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Show welcome slideshow for first-time visitors (new enhanced version)
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcomeSlideshow");
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setShowWelcomeSlideshow(true);
      }, 300);
      return () => clearTimeout(timer);
    }
    
    // Fallback to interactive onboarding if they've seen welcome but not onboarding
    const hasSeenOnboarding = localStorage.getItem("hasSeenInteractiveOnboarding");
    if (!hasSeenOnboarding) {
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

  const handleWelcomeClose = () => {
    setShowWelcomeSlideshow(false);
    localStorage.setItem("hasSeenWelcomeSlideshow", "true");
    localStorage.setItem("hasSeenInteractiveOnboarding", "true");
    localStorage.setItem("hasSeenBusinessTypeModal", "true");
    localStorage.setItem("hasSeenValueProposition", "true");
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-y-hidden">
      {/* Welcome Slideshow (Primary for new visitors) */}
      <WelcomeSlideshow
        isOpen={showWelcomeSlideshow}
        onClose={handleWelcomeClose}
      />

      {/* Interactive Onboarding Tour (Fallback) */}
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
          src={saturnWatermark} 
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
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 h-11 sm:h-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 w-full h-full flex items-end justify-between gap-2 sm:gap-6">
          <div className="flex h-full items-end gap-2 flex-shrink-0 pb-2">
            <span className="font-heading font-bold text-sm sm:text-lg tracking-wider text-white whitespace-nowrap leading-none sm:hidden">ORBIT</span>
            <span className="font-heading font-bold text-sm sm:text-lg tracking-wider text-white whitespace-nowrap leading-none hidden sm:inline">Why ORBIT Staffing OS</span>
          </div>
          
          {/* Mobile Hamburger Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-1.5 text-slate-400 hover:text-cyan-400 transition rounded-lg hover:bg-slate-800/50"
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <nav className="hidden sm:flex items-center gap-1 bg-slate-800/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700/50 flex-shrink-0">
            <Link href="/hallmark-seal" className="px-2 py-1 text-xs font-medium text-amber-300 hover:bg-amber-900/30 rounded transition-all flex items-center" data-testid="link-hallmark-seal">
              ✓ Hallmark
            </Link>
            <div className="h-4 w-px bg-slate-600/50" />
            <Link href="/why-orbit" className="px-2 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded transition-all" data-testid="link-why-orbit">
              Why ORBIT
            </Link>
            <div className="h-4 w-px bg-slate-600/50" />
            <Link href="/professional-staffing" className="px-2 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded transition-all" data-testid="link-professional">
              Professional
            </Link>
            <div className="h-4 w-px bg-slate-600/50" />
            <Link href="/about" className="px-2 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded transition-all" data-testid="link-about">
              About
            </Link>
          </nav>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 right-0 bg-slate-900/98 backdrop-blur-lg border-b border-slate-700/50 shadow-xl z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              <Link href="/changelog" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-cyan-400 hover:bg-slate-800 rounded-lg transition">
                <FileText className="w-4 h-4" />
                Version v2.6.5 - What's New
              </Link>
              <Link href="/solana-verification" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-purple-400 hover:bg-slate-800 rounded-lg transition">
                <Coins className="w-4 h-4" />
                Solana Blockchain Verification
              </Link>
              <div className="border-t border-slate-700/50 my-2" />
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition">
                <Info className="w-4 h-4" />
                About Us
              </Link>
              <Link href="/developer" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition">
                <Settings className="w-4 h-4" />
                Settings / Admin
              </Link>
              <div className="border-t border-slate-700/50 my-2" />
              <Link href="/hallmark-seal" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-amber-400 hover:bg-slate-800 rounded-lg transition">
                <CheckCircle2 className="w-4 h-4" />
                Hallmark Seal
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ISO 20022 BANKING ROADMAP BANNER - Hidden on mobile */}
      <div className="hidden sm:block">
        <ISO20022Banner />
      </div>

      {/* TALENT EXCHANGE SECTION - Carousel on mobile, grid on desktop */}
      <section className="bg-gradient-to-r from-emerald-900/30 via-cyan-900/20 to-emerald-900/30 border-b border-emerald-500/30 py-3 sm:py-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="text-center mb-2 sm:mb-4">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] sm:text-sm mb-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              NEW - Talent Exchange
            </Badge>
            <h2 className="text-sm sm:text-2xl font-bold text-white mb-0.5">ORBIT Talent Exchange</h2>
            <p className="text-[9px] sm:text-sm text-muted-foreground hidden sm:block">Two-way job marketplace</p>
          </div>
          {/* Mobile: Horizontal carousel | Desktop: 6-col grid */}
          <div className="relative">
            <div className="flex flex-row flex-nowrap carousel-flex sm:grid sm:grid-cols-6 gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 snap-x snap-mandatory scrollbar-hide pr-8 sm:pr-0">
              <Link href="/jobs" className="flex-shrink-0 basis-[48%] min-w-[48%] sm:basis-auto sm:min-w-0 sm:w-auto snap-start p-2 sm:p-4 rounded-lg border border-emerald-500/40 bg-emerald-900/30 hover:bg-emerald-900/50 hover:border-emerald-400/70 transition-all flex flex-col items-center text-center shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]" data-testid="link-job-board">
                <div className="text-xl sm:text-3xl mb-0.5">💼</div>
                <div className="font-semibold text-white text-[9px] sm:text-sm">Jobs</div>
              </Link>
              <Link href="/talent-pool" className="flex-shrink-0 basis-[48%] min-w-[48%] sm:basis-auto sm:min-w-0 sm:w-auto snap-start p-2 sm:p-4 rounded-lg border border-emerald-500/40 bg-emerald-900/30 hover:bg-emerald-900/50 hover:border-emerald-400/70 transition-all flex flex-col items-center text-center shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]" data-testid="link-talent-pool">
                <div className="text-xl sm:text-3xl mb-0.5">⭐</div>
                <div className="font-semibold text-white text-[9px] sm:text-sm">Talent</div>
              </Link>
              <Link href="/employer/register" className="flex-shrink-0 basis-[48%] min-w-[48%] sm:basis-auto sm:min-w-0 sm:w-auto snap-start p-2 sm:p-4 rounded-lg border border-cyan-500/40 bg-cyan-900/30 hover:bg-cyan-900/50 hover:border-cyan-400/70 transition-all flex flex-col items-center text-center shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]" data-testid="link-employer-register">
                <div className="text-xl sm:text-3xl mb-0.5">🏢</div>
                <div className="font-semibold text-white text-[9px] sm:text-sm">Post</div>
              </Link>
              <Link href="/apply" className="flex-shrink-0 basis-[48%] min-w-[48%] sm:basis-auto sm:min-w-0 sm:w-auto snap-start p-2 sm:p-4 rounded-lg border border-cyan-500/40 bg-cyan-900/30 hover:bg-cyan-900/50 hover:border-cyan-400/70 transition-all flex flex-col items-center text-center shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]" data-testid="link-apply">
                <div className="text-xl sm:text-3xl mb-0.5">👷</div>
                <div className="font-semibold text-white text-[9px] sm:text-sm">Apply</div>
              </Link>
              <Link href="/employee-hub" className="flex-shrink-0 basis-[48%] min-w-[48%] sm:basis-auto sm:min-w-0 sm:w-auto snap-start p-2 sm:p-4 rounded-lg border border-violet-500/40 bg-violet-900/30 hover:bg-violet-900/50 hover:border-violet-400/70 transition-all flex flex-col items-center text-center shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)]" data-testid="link-employee-hub">
                <div className="text-xl sm:text-3xl mb-0.5">🧑‍💼</div>
                <div className="font-semibold text-white text-[9px] sm:text-sm">Hub</div>
              </Link>
              <Link href="/owner-hub" className="flex-shrink-0 basis-[48%] min-w-[48%] sm:basis-auto sm:min-w-0 sm:w-auto snap-start p-2 sm:p-4 rounded-lg border border-violet-500/40 bg-violet-900/30 hover:bg-violet-900/50 hover:border-violet-400/70 transition-all flex flex-col items-center text-center shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)]" data-testid="link-owner-hub">
                <div className="text-xl sm:text-3xl mb-0.5">👔</div>
                <div className="font-semibold text-white text-[9px] sm:text-sm">Owner</div>
              </Link>
            </div>
            {/* Scroll indicator arrow - mobile only */}
            <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-emerald-950/90 to-transparent flex items-center justify-end pointer-events-none sm:hidden">
              <ChevronRight className="w-5 h-5 text-emerald-400 animate-pulse mr-1" />
            </div>
          </div>
        </div>
      </section>

      {/* SANDBOX - Horizontal Scroll Carousel */}
      <section className="bg-slate-900/50 border-b border-cyan-500/20 py-2 sm:py-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="text-center mb-2 sm:mb-4">
            <h2 className="text-xs sm:text-xl font-bold text-cyan-300">Try Sandbox</h2>
          </div>
          <div className="relative">
            <div className="flex flex-row flex-nowrap gap-2 overflow-x-auto pb-2 pr-10 sm:pr-0 sm:grid sm:grid-cols-8 sm:gap-3 sm:overflow-visible scrollbar-hide snap-x snap-mandatory">
              <Link href="/equipment-tracking" className="flex-shrink-0 w-[70px] sm:w-auto snap-start p-2 sm:p-3 rounded-lg border border-cyan-500/40 bg-cyan-900/30 hover:bg-cyan-900/50 flex flex-col items-center text-center">
                <div className="text-xl sm:text-2xl mb-0.5">📦</div>
                <div className="font-semibold text-white text-[9px] sm:text-xs">Gear</div>
              </Link>
              <Link href="/gps-clock-in" className="flex-shrink-0 w-[70px] sm:w-auto snap-start p-2 sm:p-3 rounded-lg border border-cyan-500/40 bg-cyan-900/30 hover:bg-cyan-900/50 flex flex-col items-center text-center">
                <div className="text-xl sm:text-2xl mb-0.5">📍</div>
                <div className="font-semibold text-white text-[9px] sm:text-xs">GPS</div>
              </Link>
              <Link href="/payroll-processing" className="flex-shrink-0 w-[70px] sm:w-auto snap-start p-2 sm:p-3 rounded-lg border border-cyan-500/40 bg-cyan-900/30 hover:bg-cyan-900/50 flex flex-col items-center text-center">
                <div className="text-xl sm:text-2xl mb-0.5">💰</div>
                <div className="font-semibold text-white text-[9px] sm:text-xs">Pay</div>
              </Link>
              <Link href="/worker-availability" className="flex-shrink-0 w-[70px] sm:w-auto snap-start p-2 sm:p-3 rounded-lg border border-cyan-500/40 bg-cyan-900/30 hover:bg-cyan-900/50 flex flex-col items-center text-center">
                <div className="text-xl sm:text-2xl mb-0.5">📅</div>
                <div className="font-semibold text-white text-[9px] sm:text-xs">Sched</div>
              </Link>
              <Link href="/admin/compliance" className="flex-shrink-0 w-[70px] sm:w-auto snap-start p-2 sm:p-3 rounded-lg border border-cyan-500/40 bg-cyan-900/30 hover:bg-cyan-900/50 flex flex-col items-center text-center">
                <div className="text-xl sm:text-2xl mb-0.5">✅</div>
                <div className="font-semibold text-white text-[9px] sm:text-xs">Comply</div>
              </Link>
              <Link href="/admin/payroll-dashboard" className="flex-shrink-0 w-[70px] sm:w-auto snap-start p-2 sm:p-3 rounded-lg border border-cyan-500/40 bg-cyan-900/30 hover:bg-cyan-900/50 flex flex-col items-center text-center">
                <div className="text-xl sm:text-2xl mb-0.5">🧾</div>
                <div className="font-semibold text-white text-[9px] sm:text-xs">Invoice</div>
              </Link>
              <Link href="/crm" className="flex-shrink-0 w-[70px] sm:w-auto snap-start p-2 sm:p-3 rounded-lg border border-cyan-500/40 bg-cyan-900/30 hover:bg-cyan-900/50 flex flex-col items-center text-center">
                <div className="text-xl sm:text-2xl mb-0.5">📇</div>
                <div className="font-semibold text-white text-[9px] sm:text-xs">CRM</div>
              </Link>
              <Link href="/features" className="flex-shrink-0 w-[70px] sm:w-auto snap-start p-2 sm:p-3 rounded-lg border border-cyan-500/40 bg-cyan-900/30 hover:bg-cyan-900/50 flex flex-col items-center text-center">
                <div className="text-xl sm:text-2xl mb-0.5">📊</div>
                <div className="font-semibold text-white text-[9px] sm:text-xs">More</div>
              </Link>
            </div>
            {/* Scroll indicator arrow - mobile only */}
            <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent flex items-center justify-end pointer-events-none sm:hidden">
              <ChevronRight className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* RECENTLY LAUNCHED - Carousel on mobile, 3-col grid on desktop */}
      <section className="bg-gradient-to-br from-violet-950/40 via-purple-900/30 to-violet-950/40 border-b border-violet-500/30 py-3 sm:py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-2 sm:px-6 relative z-10">
          <div className="text-center mb-2 sm:mb-6">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/40 text-[9px] sm:text-sm mb-1 shadow-[0_0_10px_rgba(34,197,94,0.3)]" data-testid="badge-now-live">
              <Zap className="w-2 h-2 sm:w-4 sm:h-4 mr-0.5" /> Live
            </Badge>
            <h2 className="text-sm sm:text-2xl font-bold text-white">Recently Launched</h2>
          </div>
          
          {/* Mobile: Horizontal carousel | Desktop: 3-col grid */}
          <div className="relative">
            <div className="flex flex-row flex-nowrap carousel-flex sm:grid sm:grid-cols-3 gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 snap-x snap-mandatory scrollbar-hide pr-8 sm:pr-0">
              <Link href="/hallmark-seal" className="flex-shrink-0 basis-[48%] min-w-[48%] sm:basis-auto sm:min-w-0 sm:w-auto snap-start">
                <Card className="h-full bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-green-500/50 hover:border-green-400/80 transition-all group shadow-[0_0_18px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]" data-testid="card-hallmarks">
                  <CardContent className="p-2 sm:p-4">
                    <div className="text-xl sm:text-3xl mb-0.5 group-hover:scale-110 transition-transform">🔐</div>
                    <h3 className="text-[9px] sm:text-sm font-bold text-green-200">Hallmarks</h3>
                    <span className="text-[7px] sm:text-[10px] bg-green-500/30 text-green-300 px-1 rounded">LIVE</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/crm" className="flex-shrink-0 basis-[48%] min-w-[48%] sm:basis-auto sm:min-w-0 sm:w-auto snap-start">
                <Card className="h-full bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-green-500/50 hover:border-green-400/80 transition-all group shadow-[0_0_18px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]" data-testid="card-crm">
                  <CardContent className="p-2 sm:p-4">
                    <div className="text-xl sm:text-3xl mb-0.5 group-hover:scale-110 transition-transform">📇</div>
                    <h3 className="text-[9px] sm:text-sm font-bold text-green-200">CRM</h3>
                    <span className="text-[7px] sm:text-[10px] bg-green-500/30 text-green-300 px-1 rounded">LIVE</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/pay-card" className="flex-shrink-0 basis-[48%] min-w-[48%] sm:basis-auto sm:min-w-0 sm:w-auto snap-start">
                <Card className="h-full bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-green-500/50 hover:border-green-400/80 transition-all group shadow-[0_0_18px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]" data-testid="card-pay-card">
                  <CardContent className="p-2 sm:p-4">
                    <div className="text-xl sm:text-3xl mb-0.5 group-hover:scale-110 transition-transform">💳</div>
                    <h3 className="text-[9px] sm:text-sm font-bold text-green-200">Pay Card</h3>
                    <span className="text-[7px] sm:text-[10px] bg-green-500/30 text-green-300 px-1 rounded">LIVE</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/marketing-hub" className="flex-shrink-0 basis-[48%] min-w-[48%] sm:basis-auto sm:min-w-0 sm:w-auto snap-start">
                <Card className="h-full bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-green-500/50 hover:border-green-400/80 transition-all group shadow-[0_0_18px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]" data-testid="card-marketing">
                  <CardContent className="p-2 sm:p-4">
                    <div className="text-xl sm:text-3xl mb-0.5 group-hover:scale-110 transition-transform">📢</div>
                    <h3 className="text-[9px] sm:text-sm font-bold text-green-200">Marketing</h3>
                    <span className="text-[7px] sm:text-[10px] bg-green-500/30 text-green-300 px-1 rounded">LIVE</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/talent-exchange" className="flex-shrink-0 basis-[48%] min-w-[48%] sm:basis-auto sm:min-w-0 sm:w-auto snap-start">
                <Card className="h-full bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-green-500/50 hover:border-green-400/80 transition-all group shadow-[0_0_18px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]" data-testid="card-exchange">
                  <CardContent className="p-2 sm:p-4">
                    <div className="text-xl sm:text-3xl mb-0.5 group-hover:scale-110 transition-transform">🔄</div>
                    <h3 className="text-[9px] sm:text-sm font-bold text-green-200">Exchange</h3>
                    <span className="text-[7px] sm:text-[10px] bg-green-500/30 text-green-300 px-1 rounded">LIVE</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/crypto-wallet" className="flex-shrink-0 basis-[48%] min-w-[48%] sm:basis-auto sm:min-w-0 sm:w-auto snap-start">
                <Card className="h-full bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-green-500/50 hover:border-green-400/80 transition-all group shadow-[0_0_18px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]" data-testid="card-crypto">
                  <CardContent className="p-2 sm:p-4">
                    <div className="text-xl sm:text-3xl mb-0.5 group-hover:scale-110 transition-transform">⛓️</div>
                    <h3 className="text-[9px] sm:text-sm font-bold text-green-200">Crypto</h3>
                    <span className="text-[7px] sm:text-[10px] bg-green-500/30 text-green-300 px-1 rounded">LIVE</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
            {/* Scroll indicator arrow - mobile only */}
            <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-violet-950/90 to-transparent flex items-center justify-end pointer-events-none sm:hidden">
              <ChevronRight className="w-5 h-5 text-green-400 animate-pulse mr-1" />
            </div>
          </div>
          
          <div className="text-center mt-2 sm:mt-6">
            <Link href="/roadmap" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-200 font-semibold text-[9px] sm:text-sm transition-all" data-testid="link-view-roadmap">
              Roadmap <ArrowRight className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ACCESS BOXES - Horizontal Carousel on mobile */}
      <section className="bg-gradient-to-b from-background to-slate-900/30 py-3 sm:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="text-center mb-2 sm:mb-6">
            <h2 className="text-sm sm:text-2xl font-bold text-white">Get Started</h2>
          </div>

          <div className="relative">
            <div className="flex flex-row flex-nowrap gap-2 overflow-x-auto pb-2 pr-10 sm:pr-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible scrollbar-hide snap-x snap-mandatory">
              {/* Business Owner Login */}
              <Link href="/admin" className="flex-shrink-0 w-[140px] sm:w-auto snap-start group">
                <Card className="h-full border border-violet-400/50 hover:border-violet-300/80 bg-gradient-to-br from-violet-400/15 to-purple-400/10 hover:from-violet-400/25 transition-all cursor-pointer shadow-[0_0_12px_rgba(139,92,246,0.15)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                  <CardContent className="p-2 sm:p-4 text-center">
                    <div className="text-xl sm:text-3xl mb-0.5">🏢</div>
                    <h3 className="text-[10px] sm:text-sm font-bold text-violet-300">Owner</h3>
                    <Button className="w-full mt-1.5 bg-violet-500/80 hover:bg-violet-600 text-white text-[8px] sm:text-xs h-6 sm:h-8" data-testid="button-owner-access">
                      Login
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* Customer/Client Login */}
              <Link href="/worker" className="flex-shrink-0 w-[140px] sm:w-auto snap-start group">
                <Card className="h-full border border-blue-500/50 hover:border-blue-400/80 bg-gradient-to-br from-blue-900/20 to-blue-950/10 hover:from-blue-900/40 transition-all cursor-pointer shadow-[0_0_12px_rgba(59,130,246,0.15)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <CardContent className="p-2 sm:p-4 text-center">
                    <div className="text-xl sm:text-3xl mb-0.5">👥</div>
                    <h3 className="text-[10px] sm:text-sm font-bold text-blue-300">Client</h3>
                    <Button className="w-full mt-1.5 bg-blue-500/80 hover:bg-blue-600 text-white text-[8px] sm:text-xs h-6 sm:h-8" data-testid="button-customer-access">
                      Login
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* Employee Self-Service */}
              <Link href="/employee-hub" className="flex-shrink-0 w-[140px] sm:w-auto snap-start group">
                <Card className="h-full border border-emerald-500/50 hover:border-emerald-400/80 bg-gradient-to-br from-emerald-900/20 to-emerald-950/10 hover:from-emerald-900/40 transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]" data-testid="card-employee-self-service">
                  <CardContent className="p-2 sm:p-4 text-center">
                    <div className="text-xl sm:text-3xl mb-0.5">📋</div>
                    <h3 className="text-[10px] sm:text-sm font-bold text-emerald-300">Employee</h3>
                    <Button className="w-full mt-1.5 bg-emerald-500/80 hover:bg-emerald-600 text-white text-[8px] sm:text-xs h-6 sm:h-8" data-testid="button-employee-access">
                      Hub
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* Admin Access */}
              <Link href="/developer" className="flex-shrink-0 w-[140px] sm:w-auto snap-start group">
                <Card className="h-full border border-cyan-500/50 hover:border-cyan-400/80 bg-gradient-to-br from-cyan-900/20 to-cyan-950/10 hover:from-cyan-900/40 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  <CardContent className="p-2 sm:p-4 text-center">
                    <div className="text-xl sm:text-3xl mb-0.5">⚙️</div>
                    <h3 className="text-[10px] sm:text-sm font-bold text-cyan-300">Admin</h3>
                    <Button className="w-full mt-1.5 bg-cyan-500/80 hover:bg-cyan-600 text-white text-[8px] sm:text-xs h-6 sm:h-8" data-testid="button-admin-access">
                      Panel
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
            {/* Scroll indicator - mobile only */}
            <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent flex items-center justify-end pointer-events-none sm:hidden">
              <ChevronRight className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Hero - Compact Mobile */}
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

          {/* Benefit Cards - Horizontal Carousel on mobile */}
          <div className="relative mb-6 sm:mb-8">
            <div className="flex flex-row flex-nowrap gap-3 overflow-x-auto pb-4 pr-16 sm:pr-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible scrollbar-hide snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0">
              <div className="flex-shrink-0 w-[140px] sm:w-auto snap-start">
                <BenefitCard 
                  icon="⚡"
                  title="Automate"
                  brief="Zero entry"
                  onClick={() => setSelectedBenefit("automate")}
                />
              </div>
              <div className="flex-shrink-0 w-[140px] sm:w-auto snap-start">
                <BenefitCard 
                  icon="👥"
                  title="Retain"
                  brief="3x longer"
                  onClick={() => setSelectedBenefit("workers")}
                />
              </div>
              <div className="flex-shrink-0 w-[140px] sm:w-auto snap-start">
                <BenefitCard 
                  icon="💰"
                  title="Save"
                  brief="35% off"
                  onClick={() => setSelectedBenefit("money")}
                />
              </div>
              <div className="flex-shrink-0 w-[140px] sm:w-auto snap-start">
                <BenefitCard 
                  icon="📈"
                  title="Scale"
                  brief="10x capacity"
                  onClick={() => setSelectedBenefit("scale")}
                />
              </div>
            </div>
            {/* Scroll indicator - mobile only */}
            <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-background via-background/80 to-transparent flex items-center justify-end pointer-events-none sm:hidden">
              <ChevronRight className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>

          {/* Stats - Compact horizontal scroll on mobile */}
          <div className="flex flex-row flex-nowrap carousel-flex sm:grid sm:grid-cols-4 gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 snap-x snap-mandatory scrollbar-hide">
            <div className="flex-shrink-0 basis-[45%] min-w-[45%] sm:basis-auto sm:min-w-0 sm:w-auto snap-start"><StatCard number="35%" label="Savings" /></div>
            <div className="flex-shrink-0 basis-[45%] min-w-[45%] sm:basis-auto sm:min-w-0 sm:w-auto snap-start"><StatCard number="2hrs" label="Onboard" /></div>
            <div className="flex-shrink-0 basis-[45%] min-w-[45%] sm:basis-auto sm:min-w-0 sm:w-auto snap-start"><StatCard number="$0" label="Setup" /></div>
            <div className="flex-shrink-0 basis-[45%] min-w-[45%] sm:basis-auto sm:min-w-0 sm:w-auto snap-start"><StatCard number="24/7" label="Support" /></div>
          </div>
        </div>
      </section>

      {/* CONNECT YOUR EXISTING SYSTEMS - Carousel mobile, Accordion desktop */}
      <section className="py-3 sm:py-8 bg-gradient-to-br from-cyan-950/30 via-blue-950/20 to-background border-y border-cyan-500/30">
        <div className="max-w-6xl mx-auto px-2 sm:px-6">
          <div className="text-center mb-3 sm:mb-6">
            <h2 className="text-sm sm:text-2xl font-bold text-white">Connect Your Systems</h2>
            <p className="text-[9px] sm:text-sm text-slate-400 mt-1">16+ integrations to streamline your workflow</p>
          </div>

          {/* Mobile: Horizontal scroll carousel */}
          <div className="sm:hidden relative mb-3">
            <div className="flex flex-row flex-nowrap gap-2 overflow-x-auto pb-2 pr-10 snap-x snap-mandatory scrollbar-hide -mx-2 px-2">
              {[
                { icon: "📊", name: "QuickBooks", cat: "Accounting" },
                { icon: "👥", name: "ADP", cat: "Payroll" },
                { icon: "📅", name: "UKG", cat: "HR" },
                { icon: "💼", name: "Paychex", cat: "Payroll" },
                { icon: "📈", name: "Xero", cat: "Accounting" },
                { icon: "🔗", name: "Indeed", cat: "Job Board" },
                { icon: "💬", name: "LinkedIn", cat: "Job Board" },
                { icon: "📋", name: "ZipRecruiter", cat: "Job Board" },
                { icon: "⚡", name: "Gusto", cat: "Payroll" },
                { icon: "🏢", name: "Workday", cat: "HR" },
                { icon: "📱", name: "Slack", cat: "Comms" },
                { icon: "📧", name: "Gmail", cat: "Comms" },
              ].map((item, idx) => (
                <Card key={idx} className="flex-shrink-0 w-[75px] snap-start bg-slate-900/50 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                  <CardContent className="p-2 text-center">
                    <div className="text-lg">{item.icon}</div>
                    <div className="text-[8px] font-bold text-white truncate">{item.name}</div>
                    <div className="text-[7px] text-cyan-400">{item.cat}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent flex items-center justify-end pointer-events-none">
              <ChevronRight className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
          </div>

          {/* Desktop: Category Grid with full width */}
          <div className="hidden sm:grid sm:grid-cols-4 gap-4">
            {[
              { icon: "💰", title: "Payroll", items: ["ADP", "Paychex", "Gusto", "OnPay"] },
              { icon: "📊", title: "Accounting", items: ["QuickBooks", "Xero", "FreshBooks", "Wave"] },
              { icon: "👥", title: "HR Systems", items: ["UKG", "Workday", "BambooHR", "Rippling"] },
              { icon: "🔗", title: "Job Boards", items: ["Indeed", "LinkedIn", "ZipRecruiter", "Glassdoor"] },
            ].map((category, idx) => (
              <Card key={idx} className="bg-slate-900/30 border-cyan-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{category.icon}</span>
                    <h3 className="font-semibold text-cyan-400 text-sm">{category.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {category.items.map(name => (
                      <div key={name} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        {name}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-3 sm:mt-6">
            <Link href="/integrations">
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] text-[9px] sm:text-sm h-7 sm:h-9 px-3">
                View All Integrations <ArrowRight className="w-2.5 h-2.5 sm:w-4 sm:h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* MARKUP COMPARISON - Compact mobile, full desktop */}
      <section className="py-3 sm:py-10 bg-gradient-to-br from-green-950/20 via-background to-emerald-950/10 border-y border-green-500/20">
        <div className="max-w-6xl mx-auto px-2 sm:px-6">
          {/* Mobile: Compact summary */}
          <div className="sm:hidden">
            <div className="text-center mb-3">
              <h2 className="text-sm font-bold text-white">Save Up to 35%</h2>
              <p className="text-[9px] text-slate-400">1.45x markup vs industry 1.6x</p>
            </div>
            <div className="flex gap-2 mb-2">
              <Card className="flex-1 bg-red-950/30 border-red-500/40">
                <CardContent className="p-2 text-center">
                  <div className="text-[8px] text-red-400">Others</div>
                  <div className="text-lg font-bold text-red-400">1.6x</div>
                  <div className="text-[8px] text-slate-400">$32/hr</div>
                </CardContent>
              </Card>
              <Card className="flex-1 bg-green-950/30 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                <CardContent className="p-2 text-center">
                  <div className="text-[8px] text-green-400">ORBIT</div>
                  <div className="text-lg font-bold text-green-400">1.45x</div>
                  <div className="text-[8px] text-green-300">$29/hr</div>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-amber-500/10 border-amber-500/40 mb-2">
              <CardContent className="p-2 text-center">
                <div className="text-[9px] text-amber-400">Your Savings</div>
                <div className="text-xl font-bold text-green-400">$3/hr · $6K/yr</div>
              </CardContent>
            </Card>
            <div className="text-center">
              <Link href="/pricing">
                <Button className="bg-green-600/80 hover:bg-green-600 text-white text-[9px] h-7 px-3 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                  See Full Breakdown <ArrowRight className="w-2.5 h-2.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Desktop: Full comparison */}
          <div className="hidden sm:block">
            <div className="text-center mb-8">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-sm mb-3">
                <DollarSign className="w-4 h-4 mr-2" /> Transparent Pricing
              </Badge>
              <h2 className="text-3xl font-bold text-white mb-2">Lower Markup = More Savings</h2>
              <p className="text-sm text-slate-400">ORBIT charges just 1.45x vs industry 1.6x</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card className="bg-red-950/30 border-red-500/30">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">🏢</div>
                  <h3 className="text-lg font-bold text-red-300 mb-1">Typical Agencies</h3>
                  <div className="text-4xl font-bold text-red-400 mb-2">1.6x</div>
                  <div className="bg-slate-950/50 rounded p-3 border border-red-900/30">
                    <div className="text-xs text-slate-400">$20/hr worker = <span className="text-white font-bold">$32/hr</span></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-green-950/30 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">✨</div>
                  <h3 className="text-lg font-bold text-green-300 mb-1">ORBIT</h3>
                  <div className="text-4xl font-bold text-green-400 mb-2">1.45x</div>
                  <div className="bg-slate-950/50 rounded p-3 border border-green-500/30">
                    <div className="text-xs text-slate-400">$20/hr worker = <span className="text-green-400 font-bold">$29/hr</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-amber-500/10 border-amber-500/30 mb-6">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="text-xs text-amber-400">Per Hour Savings</div>
                  <div className="text-2xl font-bold text-amber-300">$3.00</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-amber-400">Annual Savings</div>
                  <div className="text-2xl font-bold text-green-400">$6,240</div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button 
                onClick={() => setShowDemoForm(true)}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] text-sm px-6 py-3"
                data-testid="button-calculate-savings"
              >
                Calculate Your Exact Savings <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Horizontal Carousel on all screens */}
      <section className="py-3 sm:py-6 bg-card/30 backdrop-blur-sm border-y border-border/30">
        <div className="max-w-6xl mx-auto px-2 sm:px-6">
          <div className="mb-2 sm:mb-4 text-center sm:text-left">
            <h2 className="text-xs sm:text-xl font-bold">Full Staffing Lifecycle</h2>
          </div>
          
          {/* Horizontal Carousel on mobile, full-width grid on desktop */}
          <div className="relative">
            <div className="flex flex-row flex-nowrap gap-2 overflow-x-auto pb-2 pr-10 sm:pr-0 sm:grid sm:grid-cols-6 sm:gap-3 sm:overflow-visible scrollbar-hide snap-x snap-mandatory">
              {[
                { title: "Recruit", icon: "👥", description: "Job posting, ATS, background checks, I-9." },
                { title: "Match", icon: "🎯", description: "Smart matching, interviews, assignments." },
                { title: "Payroll", icon: "💰", description: "Timesheets, payroll, W-2s, Pay Card." },
                { title: "Billing", icon: "📊", description: "Invoicing, AR, P&L dashboards." },
                { title: "Comply", icon: "🛡️", description: "I-9, E-Verify, workers' comp." },
                { title: "Auto", icon: "⚡", description: "Zero entry, real-time sync." }
              ].map((item, idx) => (
                <div key={idx} className="flex-shrink-0 w-[120px] sm:w-auto snap-start">
                  <Card className="h-full bg-slate-900/50 border-cyan-500/30 hover:border-cyan-400/50 transition-all">
                    <CardContent className="p-2 sm:p-4 text-center">
                      <div className="text-2xl sm:text-3xl mb-1">{item.icon}</div>
                      <h3 className="text-[10px] sm:text-sm font-bold text-white mb-0.5">{item.title}</h3>
                      <p className="text-[8px] sm:text-xs text-slate-400 line-clamp-2">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            {/* Scroll indicator - mobile only */}
            <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-card/80 to-transparent flex items-center justify-end pointer-events-none sm:hidden">
              <ChevronRight className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase - Dual Platform */}
      <section className="py-4 sm:py-8 border-t border-border/50 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-2 sm:px-6">
          <div className="mb-3 sm:mb-6 text-center">
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[9px] sm:text-sm mb-2">
              <Zap className="w-2 h-2 sm:w-3 sm:h-3 mr-1" /> DarkWave Studios Ecosystem
            </Badge>
            <h2 className="text-sm sm:text-3xl font-bold font-heading mb-1">Dual Platform System</h2>
            <p className="text-muted-foreground text-[9px] sm:text-sm">Two powerful platforms that work together seamlessly.</p>
          </div>

          {/* Dual Platform Cards - Horizontal on mobile, full-width on desktop */}
          <div className="relative mb-4">
            <div className="flex flex-row flex-nowrap gap-3 overflow-x-auto pb-2 pr-10 sm:pr-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible scrollbar-hide snap-x snap-mandatory">
              {/* ORBIT Staffing OS */}
              <div className="flex-shrink-0 w-[260px] sm:w-auto snap-start">
                <Card className="h-full bg-gradient-to-br from-violet-900/40 to-purple-900/30 border-violet-500/50 hover:border-violet-400/80 transition-all shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                  <CardContent className="p-3 sm:p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <img 
                        src="/mascot/clean/orbit_mascot_cyan_saturn_style_transparent_clean.png" 
                        alt="Orby Mascot" 
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                      />
                      <div>
                        <h3 className="text-sm sm:text-xl font-bold text-violet-200">ORBIT Staffing OS</h3>
                        <p className="text-[8px] sm:text-xs text-violet-400">Full-Cycle Workforce Management</p>
                      </div>
                    </div>
                    <ul className="space-y-1 text-[8px] sm:text-xs text-slate-300 flex-1">
                      <li>✓ Recruit → Match → Payroll</li>
                      <li>✓ Time & Attendance</li>
                      <li>✓ Compliance & I-9</li>
                      <li>✓ Invoicing & Billing</li>
                    </ul>
                    <Button 
                      onClick={() => setShowOrbitSlideshow(!showOrbitSlideshow)}
                      className="w-full h-9 sm:h-10 bg-violet-600 hover:bg-violet-700 text-white text-[10px] sm:text-sm mt-3"
                      data-testid="button-show-orbit-slideshow"
                    >
                      {showOrbitSlideshow ? '▼ Hide' : '▶ View'} Walkthrough
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Orby Command Center */}
              <div className="flex-shrink-0 w-[260px] sm:w-auto snap-start">
                <Card className="h-full bg-gradient-to-br from-cyan-900/40 to-blue-900/30 border-cyan-500/50 hover:border-cyan-400/80 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <CardContent className="p-3 sm:p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <img 
                        src={orbyCommanderEmblem} 
                        alt="Orby Commander" 
                        className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
                      />
                      <div>
                        <h3 className="text-sm sm:text-xl font-bold text-cyan-200">Orby Command Center</h3>
                        <p className="text-[8px] sm:text-xs text-cyan-400">Real-Time Venue Operations</p>
                      </div>
                    </div>
                    <ul className="space-y-1 text-[8px] sm:text-xs text-slate-300 flex-1">
                      <li>✓ Emergency Command</li>
                      <li>✓ Inventory Tracking + AI Scanner</li>
                      <li>✓ Team Communications</li>
                      <li>✓ Compliance Monitoring</li>
                    </ul>
                    <Button 
                      className="w-full h-9 sm:h-10 bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] sm:text-sm mt-3"
                      data-testid="link-orby-command"
                      onClick={() => window.open('https://getorby.io', '_blank')}
                    >
                      Visit getorby.io →
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
            {/* Scroll indicator - mobile only */}
            <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-slate-900/80 to-transparent flex items-center justify-end pointer-events-none sm:hidden">
              <ChevronRight className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>

          {/* ORBIT Slideshow (expandable) */}
          {showOrbitSlideshow && (
            <div className="mt-4">
              <HomeSlideshow 
                slides={orbitSlides as any} 
                title="ORBIT Slides"
                product="ORBIT Staffing OS"
              />
            </div>
          )}

          {/* Integration Note */}
          <div className="text-center mt-4 sm:mt-6 p-3 rounded-lg bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-violet-500/10 border border-cyan-500/20">
            <p className="text-[9px] sm:text-sm text-slate-300">
              <span className="text-cyan-400 font-semibold">Seamless Integration:</span> Workers from ORBIT sync directly with Orby venue operations. One ecosystem, complete control.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-2 sm:px-6">
          <div className="mb-3 sm:mb-6 text-center sm:text-left">
            <h2 className="text-sm sm:text-3xl font-bold font-heading mb-1">Flexible Pricing</h2>
            <p className="text-muted-foreground text-[9px] sm:text-sm">Pay only for what you use. Monthly, revenue-share, or white-label options.</p>
          </div>

          {/* Mobile: Horizontal Carousel */}
          <div className="relative sm:hidden">
            <div className="flex flex-row flex-nowrap gap-3 overflow-x-auto pb-2 pr-10 scrollbar-hide snap-x snap-mandatory items-stretch">
              <div className="flex-shrink-0 w-[160px] h-[280px] snap-start">
                <PricingCard 
                  tier="Starter"
                  price="$39"
                  period="/month"
                  desc="68% less than Indeed"
                  workers="1-10 workers"
                  features={[
                    "Job posting & matching",
                    "GPS time tracking",
                    "Basic payroll export",
                    "Employee Hub access",
                    "Email support"
                  ]}
                  cta="Get Started Free"
                />
              </div>
              <div className="flex-shrink-0 w-[160px] h-[280px] snap-start">
                <PricingCard 
                  tier="Growth"
                  price="$99"
                  period="/month"
                  desc="67% less than ZipRecruiter"
                  workers="10-50 workers"
                  features={[
                    "Everything in Starter",
                    "Owner Hub access",
                    "Full payroll automation",
                    "ORBIT Pay Card access",
                    "Unlimited clients",
                    "Priority support"
                  ]}
                  cta="Start Free Trial"
                  featured
                />
              </div>
              <div className="flex-shrink-0 w-[160px] h-[280px] snap-start">
                <PricingCard 
                  tier="Professional"
                  price="$249"
                  period="/month"
                  desc="60% less than Bullhorn"
                  workers="50-200 workers"
                  features={[
                    "Everything in Growth",
                    "Multi-location",
                    "Instant Pay via Pay Card",
                    "Advanced analytics",
                    "Full API access",
                    "Dedicated support"
                  ]}
                  cta="Schedule Demo"
                />
              </div>
              <div className="flex-shrink-0 w-[160px] h-[280px] snap-start">
                <PricingCard 
                  tier="Enterprise"
                  price="Custom"
                  period="pricing"
                  desc="White-label & franchises"
                  workers="200+ workers"
                  features={[
                    "Everything in Pro",
                    "White-label platform",
                    "Custom branding",
                    "Multi-tenant support",
                    "Account manager",
                    "24/7 phone support"
                  ]}
                  cta="Contact Sales"
                />
              </div>
            </div>
            {/* Scroll indicator */}
            <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-background to-transparent flex items-center justify-end pointer-events-none">
              <ChevronRight className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          
          {/* Desktop: Grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PricingCard 
              tier="Starter"
              price="$39"
              period="/month"
              desc="68% less than Indeed"
              workers="1-10 workers"
              features={[
                "Job posting & matching",
                "GPS time tracking",
                "Basic payroll export",
                "Employee Hub access",
                "Email support"
              ]}
              cta="Get Started Free"
            />
            <PricingCard 
              tier="Growth"
              price="$99"
              period="/month"
              desc="67% less than ZipRecruiter"
              workers="10-50 workers"
              features={[
                "Everything in Starter",
                "Owner Hub access",
                "Full payroll automation",
                "ORBIT Pay Card access",
                "Unlimited clients",
                "Priority support"
              ]}
              cta="Start Free Trial"
              featured
            />
            <PricingCard 
              tier="Professional"
              price="$249"
              period="/month"
              desc="60% less than Bullhorn"
              workers="50-200 workers"
              features={[
                "Everything in Growth",
                "Multi-location",
                "Instant Pay via Pay Card",
                "Advanced analytics",
                "Full API access",
                "Dedicated support"
              ]}
              cta="Schedule Demo"
            />
            <PricingCard 
              tier="Enterprise"
              price="Custom"
              period="pricing"
              desc="White-label & franchises"
              workers="200+ workers"
              features={[
                "Everything in Pro",
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

          {/* Pricing Info - Horizontal Carousel on mobile, full-width grid on desktop */}
          <div className="relative mt-6 sm:mt-12">
            <div className="flex flex-row flex-nowrap gap-3 overflow-x-auto pb-2 pr-10 sm:pr-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible scrollbar-hide snap-x snap-mandatory">
              <div className="flex-shrink-0 w-[200px] sm:w-auto snap-start">
                <Card className="h-full bg-card/50 border-border/50">
                  <CardContent className="p-3 sm:pt-6">
                    <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-3">💰 Fixed Monthly</h3>
                    <p className="text-[9px] sm:text-sm text-muted-foreground mb-2 sm:mb-4">
                      Predictable monthly fee based on worker volume. Best for established agencies.
                    </p>
                    <p className="text-[8px] sm:text-xs text-primary font-medium">No per-placement fees.</p>
                  </CardContent>
                </Card>
              </div>
              <div className="flex-shrink-0 w-[200px] sm:w-auto snap-start">
                <Card className="h-full bg-card/50 border-border/50">
                  <CardContent className="p-3 sm:pt-6">
                    <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-3">📈 Revenue Share</h3>
                    <p className="text-[9px] sm:text-sm text-muted-foreground mb-2 sm:mb-4">
                      Pay 3-6% of placements. Perfect for franchises. Pay only when you earn.
                    </p>
                    <p className="text-[8px] sm:text-xs text-primary font-medium">Scale without upfront costs.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            {/* Scroll indicator - mobile only */}
            <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-background to-transparent flex items-center justify-end pointer-events-none sm:hidden">
              <ChevronRight className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
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
          <p className="text-muted-foreground text-sm mb-5">Pay as you grow. Monthly plans from $39. Or revenue-share options for franchises.</p>
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
            v2.6.5
          </Link>
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
      className="w-full h-full p-3 sm:p-6 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all group cursor-pointer text-left"
      data-testid={`benefit-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="font-bold text-sm sm:text-lg mb-1 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-[10px] sm:text-xs text-muted-foreground">{brief}</p>
    </button>
  );
}

function PricingCard({ tier, price, period, desc, workers, features, cta, featured }: any) {
  return (
    <Card className={`h-full border transition-all ${featured ? "border-primary bg-card/50" : "border-border/50"}`}>
      <CardContent className="p-3 sm:p-6 h-full flex flex-col">
        {featured && (
          <Badge className="mb-2 sm:mb-3 bg-primary/20 text-primary border-primary/30 text-[10px] sm:text-xs">Most Popular</Badge>
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
          {features.slice(0, 4).map((f: any, i: any) => (
            <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
              <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">{f}</span>
            </li>
          ))}
        </ul>

        <Button className={`w-full h-7 sm:h-9 text-[10px] sm:text-xs mt-3 sm:mt-6 ${featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border/50 hover:bg-white/5"}`}>
          {cta}
        </Button>
      </CardContent>
    </Card>
  );
}