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
  CheckCircle2,
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
import { OrbitChatAssistant } from "@/components/OrbitChatAssistant";
import { slidesData, orbitSlides } from "@/data/slidesData";
import { CarouselRail, CarouselRailItem } from "@/components/ui/carousel-rail";
import { SectionHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardContent, OrbitCardHeader, OrbitCardTitle, StatCard, ActionCard } from "@/components/ui/orbit-card";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { Card, CardContent } from "@/components/ui/card";
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
              src={orbyCommanderEmblem} 
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

      {/* TALENT EXCHANGE - TRUE BENTO GRID */}
      <section className="bg-gradient-to-r from-emerald-900/30 via-cyan-900/20 to-emerald-900/30 border-b border-emerald-500/30 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader 
            eyebrow="NEW - Talent Exchange"
            title="ORBIT Talent Exchange"
            subtitle="Two-way job marketplace"
            align="center"
            size="md"
            className="mb-4 sm:mb-6"
          />
          
          {/* Mobile: Horizontal Carousel */}
          <div className="sm:hidden">
            <CarouselRail showArrows={true} gap="sm">
              {[
                { href: "/jobs", image: "/images/scenarios/worker_matching_on_screen.png", label: "Browse Jobs" },
                { href: "/talent-pool", image: "/images/scenarios/diverse_workers_shift_prep.png", label: "Find Talent" },
                { href: "/employer/register", image: "/images/scenarios/professional_creating_invoices.png", label: "Post Jobs" },
                { href: "/apply", image: "/images/scenarios/multi-industry_gps_clock-in.png", label: "Apply Now" },
              ].map((item) => (
                <CarouselRailItem key={item.href} className="basis-[70%] min-w-[70%]">
                  <Link href={item.href} className="block rounded-xl overflow-hidden border border-emerald-500/40 shadow-lg">
                    <div className="relative h-32">
                      <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3">
                        <h3 className="font-bold text-white text-sm">{item.label}</h3>
                      </div>
                    </div>
                  </Link>
                </CarouselRailItem>
              ))}
            </CarouselRail>
          </div>

          {/* Desktop: True Bento Grid with varied sizes */}
          <div className="hidden sm:grid grid-cols-4 gap-4 auto-rows-[120px]">
            {/* Large hero tile - spans 2 cols, 2 rows */}
            <Link href="/jobs" className="col-span-2 row-span-2 group relative rounded-2xl overflow-hidden border border-emerald-500/40 hover:border-emerald-400 transition-all shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20" data-testid="link-job-board">
              <img src="/images/scenarios/worker_matching_on_screen.png" alt="Jobs" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Featured</span>
                <h3 className="text-2xl font-bold text-white mt-1">Browse Jobs</h3>
                <p className="text-slate-300 text-sm mt-1">Find your next opportunity</p>
              </div>
            </Link>

            {/* Medium tile - 2 cols, 1 row */}
            <Link href="/talent-pool" className="col-span-2 row-span-1 group relative rounded-xl overflow-hidden border border-cyan-500/40 hover:border-cyan-400 transition-all shadow-lg" data-testid="link-talent-pool">
              <img src="/images/scenarios/diverse_workers_shift_prep.png" alt="Talent" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-transparent" />
              <div className="absolute inset-y-0 left-4 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-white">Find Talent</h3>
                <p className="text-cyan-300 text-sm">Skilled workers ready now</p>
              </div>
            </Link>

            {/* Small tile */}
            <Link href="/employer/register" className="col-span-1 row-span-1 group relative rounded-xl overflow-hidden border border-violet-500/40 hover:border-violet-400 transition-all shadow-lg" data-testid="link-employer-register">
              <img src="/images/scenarios/professional_creating_invoices.png" alt="Post" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <h3 className="text-lg font-bold text-white">Post Jobs</h3>
              </div>
            </Link>

            {/* Small tile */}
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
      <section className="bg-slate-900/50 border-b border-cyan-500/20 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader 
            title="Platform Features"
            subtitle="Everything you need to run your staffing operation"
            align="center"
            size="md"
            className="mb-4 sm:mb-6"
          />
          
          {/* Mobile: Carousel */}
          <div className="sm:hidden">
            <CarouselRail showArrows={true} gap="sm">
              {[
                { href: "/gps-clock-in", image: "/images/scenarios/multi-industry_gps_clock-in.png", label: "GPS Clock-In", desc: "Verified time tracking" },
                { href: "/payroll-processing", image: "/images/scenarios/payroll_processing_scene.png", label: "Payroll", desc: "Automated processing" },
                { href: "/admin/compliance", image: "/images/scenarios/compliance_verification_interview.png", label: "Compliance", desc: "Stay compliant" },
                { href: "/crm", image: "/images/scenarios/coworkers_referral_handshake.png", label: "CRM", desc: "Client management" },
              ].map((item) => (
                <CarouselRailItem key={item.href} className="basis-[75%] min-w-[75%]">
                  <Link href={item.href} className="block rounded-xl overflow-hidden border border-cyan-500/30 shadow-lg">
                    <div className="relative h-36">
                      <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-bold text-white">{item.label}</h3>
                        <p className="text-cyan-300 text-xs">{item.desc}</p>
                      </div>
                    </div>
                  </Link>
                </CarouselRailItem>
              ))}
            </CarouselRail>
          </div>

          {/* Desktop: Bento Grid */}
          <div className="hidden sm:grid grid-cols-3 gap-4 auto-rows-[140px]">
            {/* Wide tile - spans 2 cols */}
            <Link href="/gps-clock-in" className="col-span-2 row-span-1 group relative rounded-xl overflow-hidden border border-cyan-500/40 hover:border-cyan-400 transition-all shadow-lg">
              <img src="/images/scenarios/multi-industry_gps_clock-in.png" alt="GPS" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
              <div className="absolute inset-y-0 left-5 flex flex-col justify-center">
                <span className="text-cyan-400 text-xs font-semibold uppercase">Location Verified</span>
                <h3 className="text-2xl font-bold text-white mt-1">GPS Clock-In</h3>
                <p className="text-slate-300 text-sm">Fraud-proof time tracking with geofencing</p>
              </div>
            </Link>

            {/* Tall tile - spans 2 rows */}
            <Link href="/payroll-processing" className="col-span-1 row-span-2 group relative rounded-xl overflow-hidden border border-emerald-500/40 hover:border-emerald-400 transition-all shadow-lg">
              <img src="/images/scenarios/payroll_processing_scene.png" alt="Payroll" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-emerald-400 text-xs font-semibold uppercase">Automated</span>
                <h3 className="text-xl font-bold text-white mt-1">Payroll Processing</h3>
                <p className="text-slate-300 text-sm mt-1">Multi-state compliant payroll automation</p>
              </div>
            </Link>

            {/* Small tiles */}
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

      {/* RECENTLY LAUNCHED - BENTO STYLE */}
      <section className="bg-gradient-to-br from-violet-950/40 via-purple-900/30 to-violet-950/40 border-b border-violet-500/30 py-4 sm:py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHeader 
            eyebrow="Live"
            title="Recently Launched"
            align="center"
            size="md"
            className="mb-4 sm:mb-6"
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

          {/* Desktop: Equal height cards */}
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
          
          <div className="text-center mt-4 sm:mt-6">
            <Link href="/roadmap" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-200 font-semibold text-sm transition-all" data-testid="link-view-roadmap">
              View Roadmap <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ACCESS BOXES */}
      <section className="bg-gradient-to-b from-background to-slate-900/30 py-3 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader 
            title="Get Started"
            align="center"
            size="md"
            className="mb-2 sm:mb-6"
          />

          {/* Mobile: Horizontal carousel with uniform cards */}
          <div className="sm:hidden">
            <CarouselRail showArrows={true} gap="sm">
              {[
                { href: "/admin", image: "/images/scenarios/professional_creating_invoices.png", label: "Owner", btn: "Login", color: "violet", testId: "button-owner-access" },
                { href: "/worker", image: "/images/scenarios/coworkers_referral_handshake.png", label: "Client", btn: "Login", color: "blue", testId: "button-customer-access" },
                { href: "/employee-hub", image: "/images/scenarios/diverse_workers_shift_prep.png", label: "Staff", btn: "Hub", color: "emerald", testId: "button-employee-access" },
                { href: "/developer", image: "/images/scenarios/it_system_integration.png", label: "Admin", btn: "Panel", color: "cyan", testId: "button-admin-access" },
              ].map((item) => (
                <CarouselRailItem key={item.href} className="basis-[42%] min-w-[42%]">
                  <Link href={item.href} className="block">
                    <div className={`rounded-xl overflow-hidden border border-${item.color}-500/50 shadow-lg`}>
                      <div className="relative h-20">
                        <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                      </div>
                      <div className="p-2 text-center bg-slate-900/80">
                        <h3 className={`text-xs font-bold text-${item.color}-300 whitespace-nowrap`}>{item.label}</h3>
                        <button className={`w-full mt-1 bg-${item.color}-500/80 text-white text-[9px] py-1 rounded font-semibold`} data-testid={item.testId}>
                          {item.btn}
                        </button>
                      </div>
                    </div>
                  </Link>
                </CarouselRailItem>
              ))}
            </CarouselRail>
          </div>

          {/* Desktop: Bento grid */}
          <div className="hidden sm:grid grid-cols-4 gap-4">
            <Link href="/admin" className="group relative rounded-xl overflow-hidden border border-violet-400/50 hover:border-violet-300 shadow-lg h-[180px]">
              <img src="/images/scenarios/professional_creating_invoices.png" alt="Owner" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <h3 className="text-lg font-bold text-violet-300">Owner</h3>
                <Button className="w-full mt-2 bg-violet-500/80 hover:bg-violet-600 text-white text-xs h-8" data-testid="button-owner-access">
                  Login
                </Button>
              </div>
            </Link>

            <Link href="/worker" className="group relative rounded-xl overflow-hidden border border-blue-500/50 hover:border-blue-400 shadow-lg h-[180px]">
              <img src="/images/scenarios/coworkers_referral_handshake.png" alt="Client" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <h3 className="text-lg font-bold text-blue-300">Client</h3>
                <Button className="w-full mt-2 bg-blue-500/80 hover:bg-blue-600 text-white text-xs h-8" data-testid="button-customer-access">
                  Login
                </Button>
              </div>
            </Link>

            <Link href="/employee-hub" className="group relative rounded-xl overflow-hidden border border-emerald-500/50 hover:border-emerald-400 shadow-lg h-[180px]" data-testid="card-employee-self-service">
              <img src="/images/scenarios/diverse_workers_shift_prep.png" alt="Staff" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <h3 className="text-lg font-bold text-emerald-300">Staff Hub</h3>
                <Button className="w-full mt-2 bg-emerald-500/80 hover:bg-emerald-600 text-white text-xs h-8" data-testid="button-employee-access">
                  Enter
                </Button>
              </div>
            </Link>

            <Link href="/developer" className="group relative rounded-xl overflow-hidden border border-cyan-500/50 hover:border-cyan-400 shadow-lg h-[180px]">
              <img src="/images/scenarios/it_system_integration.png" alt="Admin" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <h3 className="text-lg font-bold text-cyan-300">Admin</h3>
                <Button className="w-full mt-2 bg-cyan-500/80 hover:bg-cyan-600 text-white text-xs h-8" data-testid="button-admin-access">
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

      {/* Integrations - Compact Banner */}
      <section className="py-3 sm:py-4 bg-gradient-to-r from-cyan-950/30 via-blue-950/20 to-cyan-950/30 border-y border-cyan-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white">16+ Integrations</h3>
            <Link href="/integrations" className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <CarouselRail showArrows={true} gap="sm">
            {[
              { name: "QuickBooks", color: "text-green-400" },
              { name: "ADP", color: "text-red-400" },
              { name: "UKG", color: "text-blue-400" },
              { name: "Indeed", color: "text-indigo-400" },
              { name: "LinkedIn", color: "text-sky-400" },
              { name: "Slack", color: "text-purple-400" },
              { name: "Xero", color: "text-cyan-400" },
              { name: "Gusto", color: "text-pink-400" },
            ].map((item, idx) => (
              <CarouselRailItem key={idx} className="w-[70px] sm:w-[80px]">
                <div className="text-center px-2 py-1.5 rounded bg-slate-800/50 border border-cyan-500/30">
                  <div className={`text-[10px] font-bold ${item.color}`}>{item.name}</div>
                </div>
              </CarouselRailItem>
            ))}
          </CarouselRail>
        </div>
      </section>

      {/* Savings Banner - Compact */}
      <section className="py-3 sm:py-4 bg-gradient-to-r from-green-950/30 via-background to-green-950/30 border-y border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <div className="text-center px-3 py-1 rounded bg-red-950/40 border border-red-500/30">
                  <div className="text-[8px] text-red-400">Others</div>
                  <div className="text-sm font-bold text-red-400">1.6x</div>
                </div>
                <div className="text-center px-3 py-1 rounded bg-green-950/40 border border-green-500/40 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                  <div className="text-[8px] text-green-400">ORBIT</div>
                  <div className="text-sm font-bold text-green-400">1.45x</div>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-white">Save up to 35%</div>
                <div className="text-[10px] text-green-400">$6K+ annually</div>
              </div>
            </div>
            <Link href="/pricing" className="text-xs bg-green-600/80 hover:bg-green-600 text-white px-3 py-1.5 rounded font-medium">
              Calculate Savings
            </Link>
          </div>
        </div>
      </section>

      {/* Features - Compact Carousel */}
      <section className="py-3 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white">All-in-One Platform</h3>
            <Link href="/features" className="text-[10px] text-primary hover:underline">View All</Link>
          </div>
          <CarouselRail showArrows={true} gap="sm">
            {[
              { icon: Clock, title: "Time", desc: "GPS clock-in" },
              { icon: Users, title: "Hiring", desc: "AI matching" },
              { icon: DollarSign, title: "Payroll", desc: "Auto process" },
              { icon: Shield, title: "Compliance", desc: "I-9, E-Verify" },
              { icon: BarChart3, title: "Analytics", desc: "Real-time" },
              { icon: Lock, title: "Security", desc: "SOC 2" },
            ].map((f) => (
              <CarouselRailItem key={f.title} className="w-[100px] sm:w-[120px]">
                <OrbitCard variant="glass" className="h-full border-slate-700/50">
                  <OrbitCardContent className="p-2 sm:p-3 text-center">
                    <f.icon className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <div className="text-[10px] font-bold text-white">{f.title}</div>
                    <div className="text-[8px] text-slate-400">{f.desc}</div>
                  </OrbitCardContent>
                </OrbitCard>
              </CarouselRailItem>
            ))}
          </CarouselRail>
        </div>
      </section>

      {/* Pricing Section - Compact Carousel */}
      <section className="py-4 sm:py-8 bg-gradient-to-br from-violet-950/20 via-background to-cyan-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-3">
            <SectionHeader 
              title="Pricing"
              subtitle="From $39/mo. No hidden fees."
              align="left"
              size="sm"
              className="mb-0"
            />
            <Link href="/pricing" className="text-xs text-primary hover:underline flex items-center gap-1" data-testid="link-view-pricing">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <CarouselRail showArrows={true} gap="sm">
            {[
              { tier: "Starter", price: "$39", workers: "10 workers", color: "cyan" },
              { tier: "Pro", price: "$99", workers: "50 workers", color: "violet", featured: true },
              { tier: "Enterprise", price: "Custom", workers: "200+", color: "amber" },
            ].map((plan) => (
              <CarouselRailItem key={plan.tier} className="w-[180px] sm:w-[220px]">
                <OrbitCard variant="glass" className={`h-full border-${plan.color}-500/40 ${plan.featured ? 'shadow-[0_0_20px_rgba(139,92,246,0.3)]' : ''}`}>
                  <OrbitCardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold text-${plan.color}-400`}>{plan.tier}</span>
                      {plan.featured && <span className="text-[8px] bg-violet-500 text-white px-1.5 py-0.5 rounded">Popular</span>}
                    </div>
                    <div className="text-xl font-bold text-white mb-1">{plan.price}<span className="text-xs text-slate-400">/mo</span></div>
                    <div className="text-[10px] text-slate-400 mb-2">{plan.workers}</div>
                    <Link href="/pricing" className={`block text-center text-[10px] py-1.5 rounded bg-${plan.color}-500/20 hover:bg-${plan.color}-500/30 text-${plan.color}-300 font-medium transition-colors`}>
                      {plan.tier === "Enterprise" ? "Contact Sales" : "Start Trial"}
                    </Link>
                  </OrbitCardContent>
                </OrbitCard>
              </CarouselRailItem>
            ))}
          </CarouselRail>
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

      <OrbitChatAssistant />
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
