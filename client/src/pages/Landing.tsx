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
import { HomeSlideshow } from "@/components/HomeSlideshow";
import { Accordion } from "@/components/Accordion";
import { V2SignupModal } from "@/components/V2SignupModal";
import { ISO20022Banner } from "@/components/ISO20022Banner";
import { slidesData, orbitSlides } from "@/data/slidesData";
import saturnWatermark from "@assets/generated_images/floating_saturn_planet_pure_transparency.png";

export default function Landing() {
  const [showModal, setShowModal] = useState(false);
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<string | null>(null);
  const [showLotOpsSlideshow, setShowLotOpsSlideshow] = useState(false);
  const [showOrbitSlideshow, setShowOrbitSlideshow] = useState(false);

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

      {/* V2 Signup Modal - Shows after 30 seconds on first visit */}
      <V2SignupModal triggerAfterSeconds={30} />

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
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-3 sm:gap-8">
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-h-[44px]">
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

      {/* ISO 20022 BANKING ROADMAP BANNER */}
      <ISO20022Banner />

      {/* TALENT EXCHANGE SECTION */}
      <section className="bg-gradient-to-r from-emerald-900/30 via-cyan-900/20 to-emerald-900/30 border-b border-emerald-500/30 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="text-center mb-3 sm:mb-6">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] sm:text-sm mb-1">
              NEW - Talent Exchange
            </Badge>
            <h2 className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-2">ORBIT Talent Exchange</h2>
            <p className="text-[10px] sm:text-sm text-muted-foreground">Two-way job marketplace connecting employers with pre-vetted workers</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-4">
            <Link href="/jobs" className="p-2 sm:p-5 rounded-lg border border-emerald-500/30 bg-emerald-900/20 hover:bg-emerald-900/40 hover:border-emerald-400/60 transition-all flex flex-col items-center text-center" data-testid="link-job-board">
              <div className="text-lg sm:text-4xl mb-1">💼</div>
              <div className="font-semibold text-white text-[10px] sm:text-sm">Jobs</div>
              <div className="text-[8px] sm:text-xs text-gray-400 hidden sm:block">Browse positions</div>
            </Link>
            <Link href="/talent-pool" className="p-2 sm:p-5 rounded-lg border border-emerald-500/30 bg-emerald-900/20 hover:bg-emerald-900/40 hover:border-emerald-400/60 transition-all flex flex-col items-center text-center" data-testid="link-talent-pool">
              <div className="text-lg sm:text-4xl mb-1">⭐</div>
              <div className="font-semibold text-white text-[10px] sm:text-sm">Talent</div>
              <div className="text-[8px] sm:text-xs text-gray-400 hidden sm:block">Find workers</div>
            </Link>
            <Link href="/employer/register" className="p-2 sm:p-5 rounded-lg border border-cyan-500/30 bg-cyan-900/20 hover:bg-cyan-900/40 hover:border-cyan-400/60 transition-all flex flex-col items-center text-center" data-testid="link-employer-register">
              <div className="text-lg sm:text-4xl mb-1">🏢</div>
              <div className="font-semibold text-white text-[10px] sm:text-sm">Post</div>
              <div className="text-[8px] sm:text-xs text-gray-400 hidden sm:block">Employer signup</div>
            </Link>
            <Link href="/apply" className="p-2 sm:p-5 rounded-lg border border-cyan-500/30 bg-cyan-900/20 hover:bg-cyan-900/40 hover:border-cyan-400/60 transition-all flex flex-col items-center text-center" data-testid="link-apply">
              <div className="text-lg sm:text-4xl mb-1">👷</div>
              <div className="font-semibold text-white text-[10px] sm:text-sm">Apply</div>
              <div className="text-[8px] sm:text-xs text-gray-400 hidden sm:block">Worker app</div>
            </Link>
            <Link href="/employee-hub" className="p-2 sm:p-5 rounded-lg border border-violet-500/30 bg-violet-900/20 hover:bg-violet-900/40 hover:border-violet-400/60 transition-all flex flex-col items-center text-center" data-testid="link-employee-hub">
              <div className="text-lg sm:text-4xl mb-1">🧑‍💼</div>
              <div className="font-semibold text-white text-[10px] sm:text-sm">My Hub</div>
              <div className="text-[8px] sm:text-xs text-gray-400 hidden sm:block">Self-service</div>
            </Link>
            <Link href="/owner-hub" className="p-2 sm:p-5 rounded-lg border border-violet-500/30 bg-violet-900/20 hover:bg-violet-900/40 hover:border-violet-400/60 transition-all flex flex-col items-center text-center" data-testid="link-owner-hub">
              <div className="text-lg sm:text-4xl mb-1">👔</div>
              <div className="font-semibold text-white text-[10px] sm:text-sm">Owner</div>
              <div className="text-[8px] sm:text-xs text-gray-400 hidden sm:block">Dashboard</div>
            </Link>
          </div>
        </div>
      </section>

      {/* SANDBOX SHOWCASE SECTION - PLAY WITH FEATURES */}
      <section className="bg-slate-900/50 border-b border-cyan-500/20 py-3 sm:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="text-center mb-2 sm:mb-6">
            <h2 className="text-base sm:text-2xl font-bold text-cyan-300 mb-0.5 sm:mb-2">Try ORBIT Sandbox</h2>
            <p className="text-[10px] sm:text-sm text-muted-foreground">Play with live features risk-free</p>
          </div>
          <div className="grid grid-cols-4 lg:grid-cols-4 gap-1.5 sm:gap-3">
            <Link href="/equipment-tracking" className="p-1.5 sm:p-4 rounded-lg border border-cyan-500/20 bg-cyan-900/10 hover:bg-cyan-900/20 hover:border-cyan-400/50 transition-all flex flex-col items-center justify-center">
              <div className="text-lg sm:text-3xl mb-0.5 sm:mb-2">📦</div>
              <div className="font-semibold text-white text-[9px] sm:text-sm">Gear</div>
            </Link>
            <Link href="/gps-clock-in" className="p-1.5 sm:p-4 rounded-lg border border-cyan-500/20 bg-cyan-900/10 hover:bg-cyan-900/20 hover:border-cyan-400/50 transition-all flex flex-col items-center justify-center">
              <div className="text-lg sm:text-3xl mb-0.5 sm:mb-2">📍</div>
              <div className="font-semibold text-white text-[9px] sm:text-sm">GPS</div>
            </Link>
            <Link href="/payroll-processing" className="p-1.5 sm:p-4 rounded-lg border border-cyan-500/20 bg-cyan-900/10 hover:bg-cyan-900/20 hover:border-cyan-400/50 transition-all flex flex-col items-center justify-center">
              <div className="text-lg sm:text-3xl mb-0.5 sm:mb-2">💰</div>
              <div className="font-semibold text-white text-[9px] sm:text-sm">Pay</div>
            </Link>
            <Link href="/worker-availability" className="p-1.5 sm:p-4 rounded-lg border border-cyan-500/20 bg-cyan-900/10 hover:bg-cyan-900/20 hover:border-cyan-400/50 transition-all flex flex-col items-center justify-center">
              <div className="text-lg sm:text-3xl mb-0.5 sm:mb-2">📅</div>
              <div className="font-semibold text-white text-[9px] sm:text-sm">Schedule</div>
            </Link>
          </div>
        </div>
      </section>

      {/* NEXT WAVE - UPCOMING FEATURES */}
      <section className="bg-gradient-to-br from-violet-950/40 via-purple-900/30 to-violet-950/40 border-b border-violet-500/30 py-4 sm:py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-2 sm:px-6 relative z-10">
          <div className="text-center mb-3 sm:mb-8">
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/40 text-[10px] sm:text-sm mb-1 sm:mb-3" data-testid="badge-next-wave">
              <Zap className="w-2.5 h-2.5 sm:w-4 sm:h-4 mr-1" /> Next Wave
            </Badge>
            <h2 className="text-lg sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-3">What's on the Horizon</h2>
            <p className="text-[10px] sm:text-sm text-violet-200/70 max-w-2xl mx-auto hidden sm:block">Powerful new capabilities already in development</p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-3 gap-1.5 sm:gap-4">
            <Card className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 hover:border-violet-400/60 transition-all duration-300 group" data-testid="card-ai-scheduling">
              <CardContent className="p-2 sm:p-6">
                <div className="text-xl sm:text-4xl mb-1 sm:mb-3 group-hover:scale-110 transition-transform">🤖</div>
                <h3 className="text-[10px] sm:text-lg font-bold text-violet-200 mb-0.5 sm:mb-2">AI Scheduling</h3>
                <p className="text-[8px] sm:text-xs text-violet-300/70 hidden sm:block">Predictive shift optimization with ML</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 hover:border-violet-400/60 transition-all duration-300 group" data-testid="card-background-checks">
              <CardContent className="p-2 sm:p-6">
                <div className="text-xl sm:text-4xl mb-1 sm:mb-3 group-hover:scale-110 transition-transform">⚡</div>
                <h3 className="text-[10px] sm:text-lg font-bold text-violet-200 mb-0.5 sm:mb-2">BG Checks</h3>
                <p className="text-[8px] sm:text-xs text-violet-300/70 hidden sm:block">Same-day verification</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 hover:border-violet-400/60 transition-all duration-300 group" data-testid="card-multi-state">
              <CardContent className="p-2 sm:p-6">
                <div className="text-xl sm:text-4xl mb-1 sm:mb-3 group-hover:scale-110 transition-transform">🌎</div>
                <h3 className="text-[10px] sm:text-lg font-bold text-violet-200 mb-0.5 sm:mb-2">50 States</h3>
                <p className="text-[8px] sm:text-xs text-violet-300/70 hidden sm:block">Nationwide compliance</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 hover:border-violet-400/60 transition-all duration-300 group" data-testid="card-mobile-parity">
              <CardContent className="p-2 sm:p-6">
                <div className="text-xl sm:text-4xl mb-1 sm:mb-3 group-hover:scale-110 transition-transform">📱</div>
                <h3 className="text-[10px] sm:text-lg font-bold text-violet-200 mb-0.5 sm:mb-2">Mobile App</h3>
                <p className="text-[8px] sm:text-xs text-violet-300/70 hidden sm:block">iOS & Android apps</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 hover:border-violet-400/60 transition-all duration-300 group" data-testid="card-advanced-analytics">
              <CardContent className="p-2 sm:p-6">
                <div className="text-xl sm:text-4xl mb-1 sm:mb-3 group-hover:scale-110 transition-transform">📊</div>
                <h3 className="text-[10px] sm:text-lg font-bold text-violet-200 mb-0.5 sm:mb-2">Analytics</h3>
                <p className="text-[8px] sm:text-xs text-violet-300/70 hidden sm:block">AI-driven insights</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 hover:border-violet-400/60 transition-all duration-300 group" data-testid="card-franchise-tooling">
              <CardContent className="p-2 sm:p-6">
                <div className="text-xl sm:text-4xl mb-1 sm:mb-3 group-hover:scale-110 transition-transform">🏗️</div>
                <h3 className="text-[10px] sm:text-lg font-bold text-violet-200 mb-0.5 sm:mb-2">Franchise</h3>
                <p className="text-[8px] sm:text-xs text-violet-300/70 hidden sm:block">White-label ready</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-3 sm:mt-8">
            <Link href="/roadmap" className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-3 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 hover:border-violet-400/60 text-violet-200 font-semibold text-[10px] sm:text-sm transition-all" data-testid="link-view-roadmap">
              View Roadmap <ArrowRight className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ACCESS BOXES - OWNER / CUSTOMER / ADMIN */}
      <section className="bg-gradient-to-b from-background to-slate-900/30 py-4 sm:py-12">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="text-center mb-3 sm:mb-10">
            <h2 className="text-lg sm:text-3xl font-bold text-white mb-0.5 sm:mb-2">Get Started with ORBIT</h2>
            <p className="text-[10px] sm:text-base text-muted-foreground">Choose your role to access</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 mb-4 sm:mb-8">
            {/* Business Owner Login */}
            <Link href="/admin" className="group">
              <Card className="h-full border-2 border-violet-400/40 hover:border-violet-300/70 bg-gradient-to-br from-violet-400/15 to-purple-400/10 hover:from-violet-400/25 hover:to-purple-400/15 transition-all duration-300 cursor-pointer">
                <CardContent className="p-2 sm:p-6 text-center flex flex-col justify-between h-full">
                  <div>
                    <div className="text-2xl sm:text-5xl mb-1 sm:mb-3">🏢</div>
                    <h3 className="text-xs sm:text-lg font-bold text-violet-300 mb-0.5 sm:mb-2">Owner</h3>
                    <p className="text-[8px] sm:text-xs text-gray-400 mb-1.5 sm:mb-4 hidden sm:block">Manage operations & billing</p>
                    <div className="space-y-0.5 sm:space-y-2 mb-1.5 sm:mb-4 hidden sm:block">
                      <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-violet-400 flex-shrink-0" />
                        <span>Workers & clients</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-violet-400 flex-shrink-0" />
                        <span>Scheduling</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-violet-400 flex-shrink-0" />
                        <span>Payroll</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-violet-500 hover:bg-violet-600 text-white text-[9px] sm:text-sm h-7 sm:min-h-[44px]" data-testid="button-owner-access">
                    Login <ArrowRight className="w-2.5 h-2.5 sm:w-4 sm:h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Customer/Client Login */}
            <Link href="/worker" className="group">
              <Card className="h-full border-2 border-blue-600/30 hover:border-blue-400/60 bg-gradient-to-br from-blue-900/20 to-blue-950/10 hover:from-blue-900/40 hover:to-blue-900/20 transition-all duration-300 cursor-pointer">
                <CardContent className="p-2 sm:p-6 text-center flex flex-col justify-between h-full">
                  <div>
                    <div className="text-2xl sm:text-5xl mb-1 sm:mb-3">👥</div>
                    <h3 className="text-xs sm:text-lg font-bold text-blue-300 mb-0.5 sm:mb-2">Client</h3>
                    <p className="text-[8px] sm:text-xs text-gray-400 mb-1.5 sm:mb-4 hidden sm:block">Manage assignments</p>
                    <div className="space-y-0.5 sm:space-y-2 mb-1.5 sm:mb-4 hidden sm:block">
                      <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400 flex-shrink-0" />
                        <span>Request workers</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400 flex-shrink-0" />
                        <span>Track progress</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400 flex-shrink-0" />
                        <span>Rate workers</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[9px] sm:text-sm h-7 sm:min-h-[44px]" data-testid="button-customer-access">
                    Login <ArrowRight className="w-2.5 h-2.5 sm:w-4 sm:h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Employee Self-Service */}
            <Link href="/employee-hub" className="group">
              <Card className="h-full border-2 border-emerald-600/30 hover:border-emerald-400/60 bg-gradient-to-br from-emerald-900/20 to-emerald-950/10 hover:from-emerald-900/40 hover:to-emerald-900/20 transition-all duration-300 cursor-pointer" data-testid="card-employee-self-service">
                <CardContent className="p-2 sm:p-6 text-center flex flex-col justify-between h-full">
                  <div>
                    <div className="text-2xl sm:text-5xl mb-1 sm:mb-3">📋</div>
                    <h3 className="text-xs sm:text-lg font-bold text-emerald-300 mb-0.5 sm:mb-2">Employee</h3>
                    <p className="text-[8px] sm:text-xs text-gray-400 mb-1.5 sm:mb-4 hidden sm:block">Self-service portal</p>
                    <div className="space-y-0.5 sm:space-y-2 mb-1.5 sm:mb-4 hidden sm:block">
                      <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 flex-shrink-0" />
                        <span>Tax docs & W-2s</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 flex-shrink-0" />
                        <span>Pay stubs</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 flex-shrink-0" />
                        <span>Time cards</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] sm:text-sm h-7 sm:min-h-[44px]" data-testid="button-employee-self-service">
                    My Hub <ArrowRight className="w-2.5 h-2.5 sm:w-4 sm:h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Admin Access */}
            <Link href="/developer" className="group">
              <Card className="h-full border-2 border-cyan-600/30 hover:border-cyan-400/60 bg-gradient-to-br from-cyan-900/20 to-cyan-950/10 hover:from-cyan-900/40 hover:to-cyan-900/20 transition-all duration-300 cursor-pointer">
                <CardContent className="p-2 sm:p-6 text-center flex flex-col justify-between h-full">
                  <div>
                    <div className="text-2xl sm:text-5xl mb-1 sm:mb-3">⚙️</div>
                    <h3 className="text-xs sm:text-lg font-bold text-cyan-300 mb-0.5 sm:mb-2">Admin</h3>
                    <p className="text-[8px] sm:text-xs text-gray-400 mb-1.5 sm:mb-4 hidden sm:block">Platform control</p>
                    <div className="space-y-0.5 sm:space-y-2 mb-1.5 sm:mb-4 hidden sm:block">
                      <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400 flex-shrink-0" />
                        <span>Registry</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400 flex-shrink-0" />
                        <span>Contact notes</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-xs text-gray-300">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400 flex-shrink-0" />
                        <span>API testing</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-[9px] sm:text-sm h-7 sm:min-h-[44px]" data-testid="button-admin-access">
                    Panel <ArrowRight className="w-2.5 h-2.5 sm:w-4 sm:h-4 ml-1" />
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

      {/* CONNECT YOUR EXISTING SYSTEMS - HERO INTEGRATION CALLOUT */}
      <section className="py-12 bg-gradient-to-br from-cyan-950/30 via-blue-950/20 to-background border-y border-cyan-500/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-sm mb-4">
              <Zap className="w-4 h-4 mr-2" /> Seamless Integration
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white">
              Keep Using Your Existing Systems
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-3">
              Already using <span className="text-cyan-400 font-bold">QuickBooks, ADP, Google Workspace, or Microsoft 365?</span> No problem.
            </p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              ORBIT connects directly to your current payroll, accounting, productivity, and HR systems. <span className="text-white font-semibold">No data re-entry. No migration headaches.</span> Just sync and go.
            </p>
          </div>

          {/* Integration Logos/Names - Top 6 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            <Card className="bg-slate-900/50 border-cyan-500/30 hover:border-cyan-400/60 transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-sm font-bold text-white">QuickBooks</div>
                <div className="text-xs text-slate-400 mt-1">Accounting & Invoicing</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-cyan-500/30 hover:border-cyan-400/60 transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">👥</div>
                <div className="text-sm font-bold text-white">ADP Workforce Now</div>
                <div className="text-xs text-slate-400 mt-1">Payroll & HR</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-cyan-500/30 hover:border-cyan-400/60 transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">📅</div>
                <div className="text-sm font-bold text-white">UKG Pro</div>
                <div className="text-xs text-slate-400 mt-1">Scheduling & Time</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-cyan-500/30 hover:border-cyan-400/60 transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">💼</div>
                <div className="text-sm font-bold text-white">Paychex Flex</div>
                <div className="text-xs text-slate-400 mt-1">Payroll Automation</div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🔗</div>
                  <div>
                    <h3 className="text-lg font-bold text-cyan-300 mb-2">Connect in Minutes</h3>
                    <p className="text-sm text-slate-400">One-click OAuth connection. ORBIT automatically syncs your data daily (or in real-time).</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">⚡</div>
                  <div>
                    <h3 className="text-lg font-bold text-cyan-300 mb-2">Zero Manual Entry</h3>
                    <p className="text-sm text-slate-400">Employees, pay rates, invoices, and schedules sync automatically. No duplicate data entry.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🛡️</div>
                  <div>
                    <h3 className="text-lg font-bold text-cyan-300 mb-2">Keep Your Data</h3>
                    <p className="text-sm text-slate-400">Your existing systems stay active. ORBIT reads and syncs—you maintain complete control.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-4">
              <span className="text-cyan-400 font-semibold">16 integrations ready</span> including Gusto, Rippling, Workday, Paylocity, Google Workspace, and Microsoft 365
            </p>
            <Link href="/integrations">
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                View All Integrations <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* MARKUP COMPARISON - Show 1.45x vs 1.6x Advantage */}
      <section className="py-16 bg-gradient-to-br from-green-950/20 via-background to-emerald-950/10 border-y border-green-500/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-sm mb-4">
              <DollarSign className="w-4 h-4 mr-2" /> Transparent Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-3 text-white">
              Lower Markup = More Savings
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              While most staffing agencies in Tennessee charge 1.6x markup, <span className="text-green-400 font-bold">ORBIT charges just 1.45x</span> — saving you real money on every hour worked.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Industry Average */}
            <Card className="bg-gradient-to-br from-red-950/40 to-slate-900 border-2 border-red-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1 rounded-bl-lg">
                INDUSTRY AVERAGE
              </div>
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4 opacity-50">🏢</div>
                <h3 className="text-2xl font-bold text-red-300 mb-2">Typical Agencies</h3>
                <div className="text-5xl font-bold text-red-400 mb-4">1.6x</div>
                <p className="text-slate-400 text-sm mb-6">Markup on Worker Pay Rate</p>
                <div className="bg-slate-950/50 rounded-lg p-4 border border-red-900/30">
                  <div className="text-xs text-slate-400 mb-2">Example: $20/hr worker</div>
                  <div className="text-2xl font-bold text-white">
                    $32.00<span className="text-sm text-slate-400">/hr</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">You pay to agency</div>
                </div>
              </CardContent>
            </Card>

            {/* ORBIT */}
            <Card className="bg-gradient-to-br from-green-950/40 to-emerald-900/30 border-2 border-green-500/50 relative overflow-hidden shadow-[0_0_40px_rgba(34,197,94,0.2)]">
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ORBIT ADVANTAGE
              </div>
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-2xl font-bold text-green-300 mb-2">ORBIT Staffing OS</h3>
                <div className="text-5xl font-bold text-green-400 mb-4">1.45x</div>
                <p className="text-slate-400 text-sm mb-6">Lower Markup, Same Quality</p>
                <div className="bg-slate-950/50 rounded-lg p-4 border border-green-500/30">
                  <div className="text-xs text-slate-400 mb-2">Example: $20/hr worker</div>
                  <div className="text-2xl font-bold text-green-400">
                    $29.00<span className="text-sm text-slate-400">/hr</span>
                  </div>
                  <div className="text-xs text-green-500 mt-1 font-semibold">You pay to ORBIT</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Savings Callout */}
          <Card className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-green-500/10 border-2 border-amber-500/30">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="text-sm text-amber-400 font-semibold mb-2">YOUR SAVINGS PER HOUR</div>
                  <div className="text-5xl font-bold text-amber-300 mb-2">
                    $3.00<span className="text-2xl text-slate-400">/hr</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    On a $20/hr worker • <span className="text-green-400 font-semibold">10% cost reduction</span>
                  </div>
                </div>
                <div className="h-px md:h-16 w-full md:w-px bg-gradient-to-r md:bg-gradient-to-b from-transparent via-amber-500/50 to-transparent"></div>
                <div className="text-center md:text-right">
                  <div className="text-sm text-amber-400 font-semibold mb-2">ANNUAL SAVINGS</div>
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    $6,240<span className="text-xl text-slate-400">/yr</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    Per full-time worker (40 hrs/week × 52 weeks)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8 mb-12">
            <p className="text-slate-400 text-sm mb-4">
              <Lock className="w-4 h-4 inline mr-2 text-amber-500" />
              Our 1.45x markup is <span className="text-amber-300 font-semibold">locked and transparent</span> — no hidden fees, no surprises.
            </p>
          </div>

          {/* TOTAL COST SAVINGS BREAKDOWN */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-500/40 rounded-2xl p-8 mb-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-3">But Wait — There's More Savings</h3>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto">
                The 1.45x markup is just the beginning. When you factor in <span className="text-cyan-400 font-semibold">everything ORBIT replaces</span>, your real savings are <span className="text-green-400 font-bold text-xl">35-50%+ of total operating costs.</span>
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Traditional Agency Costs */}
              <div>
                <h4 className="text-lg font-bold text-red-300 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💸</span> Traditional Agency Monthly Costs
                </h4>
                <div className="space-y-2 bg-slate-950/50 rounded-lg p-4 border border-red-900/30">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Payroll processing service</span>
                    <span className="text-white font-mono">$500-2,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Time tracking software</span>
                    <span className="text-white font-mono">$300-500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Scheduling software</span>
                    <span className="text-white font-mono">$200-400</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">HR/compliance software</span>
                    <span className="text-white font-mono">$300-600</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Office space rent</span>
                    <span className="text-white font-mono">$1,500-3,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Office manager salary</span>
                    <span className="text-white font-mono">$3,333-5,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Admin assistant salary</span>
                    <span className="text-white font-mono">$2,500-3,333</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Accounting fees</span>
                    <span className="text-white font-mono">$500-1,500</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-red-900/30 pt-2 mt-2">
                    <span className="text-red-300 font-bold">TOTAL MONTHLY:</span>
                    <span className="text-red-400 font-bold font-mono">$9,000-16,000</span>
                  </div>
                  <div className="flex justify-between text-xs text-red-400">
                    <span>ANNUAL:</span>
                    <span className="font-mono">$108,000-192,000</span>
                  </div>
                </div>
              </div>

              {/* ORBIT Cost */}
              <div>
                <h4 className="text-lg font-bold text-green-300 mb-4 flex items-center gap-2">
                  <span className="text-2xl">✨</span> ORBIT All-In-One Cost
                </h4>
                <div className="space-y-4 bg-slate-950/50 rounded-lg p-4 border border-green-500/30">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-slate-400 text-sm">ORBIT Subscription</span>
                      <span className="text-green-400 font-bold font-mono">$499/mo</span>
                    </div>
                    <ul className="text-xs text-slate-500 space-y-1 ml-4">
                      <li>✓ Payroll processing included</li>
                      <li>✓ Time tracking included</li>
                      <li>✓ Scheduling included</li>
                      <li>✓ Compliance tools included</li>
                      <li>✓ No office needed</li>
                      <li>✓ No office staff needed</li>
                      <li>✓ Run everything from phone</li>
                      <li>✓ Unlimited users</li>
                    </ul>
                  </div>
                  <div className="flex justify-between text-sm border-t border-green-900/30 pt-2">
                    <span className="text-green-300 font-bold">TOTAL MONTHLY:</span>
                    <span className="text-green-400 font-bold font-mono">$499</span>
                  </div>
                  <div className="flex justify-between text-xs text-green-400">
                    <span>ANNUAL:</span>
                    <span className="font-mono">$5,988</span>
                  </div>
                </div>

                <div className="mt-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 border-2 border-green-500/50">
                  <div className="text-center">
                    <div className="text-xs text-green-400 font-semibold mb-1">YOUR OPERATIONAL SAVINGS</div>
                    <div className="text-4xl font-bold text-green-400 mb-1">
                      $102K-186K<span className="text-lg text-slate-400">/year</span>
                    </div>
                    <div className="text-sm text-slate-300">That's real money back in your pocket</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Savings Summary */}
            <Card className="bg-gradient-to-r from-purple-950/40 via-blue-950/40 to-cyan-950/40 border-2 border-cyan-500/50">
              <CardContent className="p-6">
                <h4 className="text-2xl font-bold text-white mb-6 text-center">Total Cost Savings Breakdown</h4>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-xs text-cyan-400 font-semibold mb-2">Lower Markup Savings</div>
                    <div className="text-4xl font-bold text-cyan-300 mb-1">~10%</div>
                    <div className="text-xs text-slate-400">On billable labor costs</div>
                  </div>
                  <div className="border-l border-r border-cyan-900/30">
                    <div className="text-xs text-green-400 font-semibold mb-2">Operational Cost Savings</div>
                    <div className="text-4xl font-bold text-green-400 mb-1">20-35%</div>
                    <div className="text-xs text-slate-400">Eliminated overhead</div>
                  </div>
                  <div>
                    <div className="text-xs text-amber-400 font-semibold mb-2">TOTAL SAVINGS</div>
                    <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-1">35-50%+</div>
                    <div className="text-xs text-slate-400">Of your total costs</div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-300 mb-4">
                    For a <span className="text-white font-semibold">$500K/year agency</span>, that's <span className="text-green-400 font-bold">$175K-250K in annual savings</span> — enough to hire 3-5 more salespeople or expand to new markets.
                  </p>
                  <Button 
                    onClick={() => setShowDemoForm(true)}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] text-xs sm:text-lg px-3 sm:px-8 py-3 sm:py-6 h-auto inline-flex items-center justify-center flex-wrap gap-1 sm:gap-2"
                    data-testid="button-calculate-savings"
                  >
                    <span>Calculate Your Exact Savings</span>
                    <ArrowRight className="w-3 h-3 sm:w-5 sm:h-5 flex-shrink-0" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features - Collapsible */}
      <section className="py-6 sm:py-8 bg-card/30 backdrop-blur-sm border-y border-border/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-1">End-to-End Staffing Lifecycle</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">Click to explore features. Complete control from recruitment through payroll.</p>
          </div>

          <Accordion 
            items={[
              {
                title: "Recruit & Source",
                icon: "👥",
                description: "Multi-channel job posting, ATS, resume parsing, background checks, I-9 verification, reference checks, credential validation."
              },
              {
                title: "Match & Place",
                icon: "🎯",
                description: "Smart candidate matching, client interviews, offer negotiation, assignment tracking, fast fulfillment in minutes not hours."
              },
              {
                title: "Time & Payroll",
                icon: "💰",
                description: "Mobile timesheets, client approval workflows, payroll processing, tax withholding, W-2s, direct deposit, compliance reporting."
              },
              {
                title: "Billing & Revenue",
                icon: "📊",
                description: "Automatic invoice generation, bill rate management, AR tracking, payment collections, P&L dashboards, margin analysis."
              },
              {
                title: "Compliance & Risk",
                icon: "🛡️",
                description: "I-9 management, E-Verify, background screening, prevailing wage, workers' comp, tax filings (941, W-2), OSHA safety."
              },
              {
                title: "Full Automation",
                icon: "⚡",
                description: "Zero manual entry. Rules-based workflows. Audit-ready. Everything logged. Multi-state tax handling. Real-time notifications."
              }
            ]}
          />
        </div>
      </section>

      {/* Product Showcases */}
      <section className="py-6 sm:py-8 border-t border-border/50 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-1">Product Showcases</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">Click to explore detailed feature walkthroughs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Lot Ops Pro Showcase */}
            <div className="space-y-4">
              <Button 
                onClick={() => setShowLotOpsSlideshow(!showLotOpsSlideshow)}
                className="w-full h-12 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-semibold text-lg"
                data-testid="button-show-lot-ops-slideshow"
              >
                {showLotOpsSlideshow ? '▼ Hide' : '▶ View'} Lot Ops Pro Showcase
              </Button>
              {showLotOpsSlideshow && (
                <HomeSlideshow 
                  slides={slidesData as any} 
                  title="Lot Ops Pro Slides"
                  product="Lot Ops Pro"
                />
              )}
            </div>

            {/* ORBIT Staffing OS Showcase */}
            <div className="space-y-4">
              <Button 
                onClick={() => setShowOrbitSlideshow(!showOrbitSlideshow)}
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white font-semibold text-lg"
                data-testid="button-show-orbit-slideshow"
              >
                {showOrbitSlideshow ? '▼ Hide' : '▶ View'} ORBIT Staffing OS Showcase
              </Button>
              {showOrbitSlideshow && (
                <HomeSlideshow 
                  slides={orbitSlides as any} 
                  title="ORBIT Slides"
                  product="ORBIT Staffing OS"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-1">Flexible Pricing</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">Pay only for what you use. Monthly, revenue-share, or white-label options.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                "Reports API",
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
                "Advanced analytics",
                "Weather verification",
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

      {/* Footer Banner */}
      <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-primary/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div>
                <div className="font-heading font-bold text-lg text-white">ORBIT Staffing</div>
                <div className="text-xs text-slate-400">Powered by DarkWave Studios</div>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              <p>© 2025 ORBIT Staffing. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="https://darkwavestudios.net" target="_blank" className="text-primary hover:text-primary/80 transition-colors font-bold">
                DarkWave Studios →
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