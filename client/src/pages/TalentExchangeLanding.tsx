import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail, CarouselRailItem } from "@/components/ui/carousel-rail";
import { SectionHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent, StatCard, ActionCard } from "@/components/ui/orbit-card";
import { 
  Users, Building2, Rocket, Star, CheckCircle2, Zap, 
  Sparkles, Trophy, Gift, Clock,
  Briefcase
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TalentExchangeLanding() {
  const { toast } = useToast();
  const [workerEmail, setWorkerEmail] = useState("");
  const [employerEmail, setEmployerEmail] = useState("");
  const [isWorkerLoading, setIsWorkerLoading] = useState(false);
  const [isEmployerLoading, setIsEmployerLoading] = useState(false);

  const handleWorkerQuickSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerEmail) return;
    
    setIsWorkerLoading(true);
    try {
      const res = await fetch('/api/talent-exchange/quick-signup/worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: workerEmail, isFoundingMember: true }),
      });
      
      if (res.ok) {
        toast({
          title: "Welcome, Founding Member!",
          description: "Check your email to complete your profile and start finding jobs.",
        });
        setWorkerEmail("");
      } else {
        const data = await res.json();
        toast({
          title: "Already registered?",
          description: data.error || "Try logging in instead.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWorkerLoading(false);
    }
  };

  const handleEmployerQuickSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employerEmail) return;
    
    setIsEmployerLoading(true);
    try {
      const res = await fetch('/api/talent-exchange/quick-signup/employer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: employerEmail, isFoundingMember: true }),
      });
      
      if (res.ok) {
        toast({
          title: "Welcome, Founding Employer!",
          description: "Check your email to set up your company and post your first job FREE.",
        });
        setEmployerEmail("");
      } else {
        const data = await res.json();
        toast({
          title: "Already registered?",
          description: data.error || "Try logging in instead.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEmployerLoading(false);
    }
  };

  const foundingMemberBenefits = [
    {
      icon: <Trophy className="w-10 h-10 text-amber-400" />,
      title: "Founding Badge",
      description: "Permanent \"Founding Member\" status on your profile"
    },
    {
      icon: <Gift className="w-10 h-10 text-green-400" />,
      title: "Free Features",
      description: "Lock in free access to premium features forever"
    },
    {
      icon: <Star className="w-10 h-10 text-cyan-400" />,
      title: "Priority Matching",
      description: "Get matched before regular users as we grow"
    },
    {
      icon: <Zap className="w-10 h-10 text-purple-400" />,
      title: "Shape the Platform",
      description: "Your feedback directly influences our features"
    }
  ];

  const howItWorksSteps = [
    { step: 1, title: "Quick Sign Up", description: "Just enter your email - takes 30 seconds" },
    { step: 2, title: "Complete Profile", description: "Add your skills or post your first job" },
    { step: 3, title: "Get Matched", description: "Our AI connects you with perfect matches" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 py-12 sm:py-20 relative z-10">
          {/* Founding Member Badge */}
          <div className="flex justify-center mb-6">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-sm font-bold animate-pulse">
              <Trophy className="w-4 h-4 mr-2" />
              FOUNDING MEMBER SPECIAL - Join Free & Shape Our Community
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-center mb-4 sm:mb-6">
            <span className="text-white">ORBIT</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Talent Exchange
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-300 text-center max-w-2xl mx-auto mb-8 sm:mb-12 px-4">
            Be a <span className="text-cyan-400 font-semibold">Founding Member</span> of the fastest-growing 
            talent marketplace. Free signup. Help us build something amazing.
          </p>

          {/* Two-Column Signup using BentoGrid */}
          <BentoGrid cols={2} gap="md" className="max-w-4xl mx-auto">
            {/* Worker Quick Signup */}
            <BentoTile className="p-0 border-cyan-500/30 hover:border-cyan-500/50" data-testid="card-worker-signup">
              <OrbitCard variant="default" hover={false} className="h-full border-0 bg-transparent">
                <OrbitCardHeader className="flex-col items-center text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/25">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <OrbitCardTitle className="text-xl sm:text-2xl">Find Work</OrbitCardTitle>
                  <OrbitCardDescription>Join our talent pool - it takes 30 seconds</OrbitCardDescription>
                </OrbitCardHeader>
                <OrbitCardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>Free forever for workers</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>Get matched to jobs automatically</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-400">
                      <Star className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold">Founding Member badge on profile</span>
                    </div>
                  </div>

                  <form onSubmit={handleWorkerQuickSignup} className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={workerEmail}
                      onChange={(e) => setWorkerEmail(e.target.value)}
                      className="bg-slate-900/50 border-slate-600 focus:border-cyan-500 text-white"
                      data-testid="input-worker-email"
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3"
                      disabled={isWorkerLoading}
                      data-testid="button-worker-signup"
                    >
                      {isWorkerLoading ? (
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 animate-spin" />
                          Joining...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Rocket className="w-4 h-4" />
                          Join as Founding Member
                        </span>
                      )}
                    </Button>
                  </form>

                  <p className="text-xs text-slate-500 text-center">
                    Already have an account?{" "}
                    <Link href="/apply" className="text-cyan-400 hover:underline">
                      Complete your profile
                    </Link>
                  </p>
                </OrbitCardContent>
              </OrbitCard>
            </BentoTile>

            {/* Employer Quick Signup */}
            <BentoTile className="p-0 border-purple-500/30 hover:border-purple-500/50" data-testid="card-employer-signup">
              <OrbitCard variant="default" hover={false} className="h-full border-0 bg-transparent">
                <OrbitCardHeader className="flex-col items-center text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <OrbitCardTitle className="text-xl sm:text-2xl">Hire Talent</OrbitCardTitle>
                  <OrbitCardDescription>Post jobs and find workers instantly</OrbitCardDescription>
                </OrbitCardHeader>
                <OrbitCardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-green-400">
                      <Gift className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold">First job post FREE</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>AI-powered candidate matching</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-400">
                      <Trophy className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold">Founding Employer status</span>
                    </div>
                  </div>

                  <form onSubmit={handleEmployerQuickSignup} className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Enter your work email"
                      value={employerEmail}
                      onChange={(e) => setEmployerEmail(e.target.value)}
                      className="bg-slate-900/50 border-slate-600 focus:border-purple-500 text-white"
                      data-testid="input-employer-email"
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3"
                      disabled={isEmployerLoading}
                      data-testid="button-employer-signup"
                    >
                      {isEmployerLoading ? (
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 animate-spin" />
                          Joining...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Join as Founding Employer
                        </span>
                      )}
                    </Button>
                  </form>

                  <p className="text-xs text-slate-500 text-center">
                    Already registered?{" "}
                    <Link href="/employer/login" className="text-purple-400 hover:underline">
                      Log in here
                    </Link>
                  </p>
                </OrbitCardContent>
              </OrbitCard>
            </BentoTile>
          </BentoGrid>
        </div>
      </div>

      {/* Why Join Early Section */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <SectionHeader
          eyebrow="Exclusive Benefits"
          title="Why Be a Founding Member?"
          subtitle="Join now and get exclusive benefits that will never be offered again"
          align="center"
          size="lg"
        />

        {/* Desktop: BentoGrid */}
        <div className="hidden md:block">
          <BentoGrid cols={4} gap="md" className="max-w-5xl mx-auto">
            {foundingMemberBenefits.map((benefit, index) => (
              <BentoTile key={index}>
                <div className="flex flex-col items-center text-center p-2">
                  {benefit.icon}
                  <h3 className="font-semibold text-white mt-3 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-400">{benefit.description}</p>
                </div>
              </BentoTile>
            ))}
          </BentoGrid>
        </div>

        {/* Mobile: CarouselRail */}
        <div className="md:hidden">
          <CarouselRail gap="md" itemWidth="lg" showArrows={false}>
            {foundingMemberBenefits.map((benefit, index) => (
              <CarouselRailItem key={index}>
                <OrbitCard variant="stat" className="text-center p-6 h-full min-w-[280px]">
                  <div className="flex flex-col items-center">
                    {benefit.icon}
                    <h3 className="font-semibold text-white mt-3 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-slate-400">{benefit.description}</p>
                  </div>
                </OrbitCard>
              </CarouselRailItem>
            ))}
          </CarouselRail>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-12 sm:py-16 border-t border-slate-800">
        <SectionHeader
          title="How It Works"
          align="center"
          size="lg"
          className="mb-8 sm:mb-12"
        />

        <BentoGrid cols={3} gap="lg" className="max-w-4xl mx-auto">
          {howItWorksSteps.map((item) => (
            <BentoTile key={item.step} className="bg-transparent border-0 hover:border-0">
              <div className="text-center">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-cyan-500">
                  <span className="text-cyan-400 font-bold text-lg">{item.step}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.description}</p>
              </div>
            </BentoTile>
          ))}
        </BentoGrid>
      </div>

      {/* Bottom CTA */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <OrbitCard variant="action" hover={false} className="p-6 sm:p-8 text-center max-w-2xl mx-auto bg-gradient-to-r from-cyan-900/30 to-purple-900/30 cursor-default">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Help Us Build Something Great
          </h2>
          <p className="text-slate-300 mb-6 max-w-md mx-auto">
            We're just getting started. Every early member helps us grow. 
            Join today and be part of the foundation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/jobs">
              <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 w-full sm:w-auto">
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Jobs
              </Button>
            </Link>
            <Link href="/talent-pool">
              <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10 w-full sm:w-auto">
                <Users className="w-4 h-4 mr-2" />
                View Talent Pool
              </Button>
            </Link>
          </div>
        </OrbitCard>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 py-6">
        <p className="text-center text-xs text-slate-500">
          ORBIT Talent Exchange • Powered by DarkWave Studios • Connecting talent with opportunity
        </p>
      </div>
    </div>
  );
}
