import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { SectionHeader, PageHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent, StatCard } from "@/components/ui/orbit-card";
import {
  CreditCard,
  Zap,
  Shield,
  DollarSign,
  Smartphone,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Building2,
  Wallet,
  Send,
  AlertCircle,
  Star,
  Gift,
  TrendingUp,
  Lock
} from "lucide-react";

const orbitMascot = "/mascot/orbit_mascot_cyan_saturn_style_transparent.png";
const orbitThinking = "/mascot/orbit_mascot_thinking_pose_transparent.png";

export default function OrbitPayCard() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/pay-card/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'website' })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSubmitted(true);
        toast({
          title: data.alreadyRegistered ? "You're already signed up!" : "You're on the list!",
          description: data.message || "We'll notify you when ORBIT Pay Card launches.",
        });
      } else {
        throw new Error(data.error || 'Failed to join waitlist');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardFeatures = [
    {
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      title: "Instant Pay Access",
      description: "Get paid the same day you work. No waiting for payday."
    },
    {
      icon: <DollarSign className="w-6 h-6 text-green-400" />,
      title: "No Hidden Fees",
      description: "No monthly fees, no maintenance fees, no surprise charges."
    },
    {
      icon: <Smartphone className="w-6 h-6 text-cyan-400" />,
      title: "Mobile Wallet Ready",
      description: "Add to Apple Pay, Google Pay, or Samsung Pay instantly."
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-400" />,
      title: "Bank-Level Security",
      description: "Chip technology, fraud protection, instant lock/unlock."
    },
    {
      icon: <Building2 className="w-6 h-6 text-blue-400" />,
      title: "ATM Access",
      description: "Free withdrawals at 55,000+ ATMs nationwide."
    },
    {
      icon: <Gift className="w-6 h-6 text-pink-400" />,
      title: "Cashback Rewards",
      description: "Earn up to 2% cashback on everyday purchases."
    }
  ];

  const comparisonData = [
    { feature: "Same-Day Pay", orbit: true, traditional: false },
    { feature: "No Monthly Fees", orbit: true, traditional: false },
    { feature: "Free ATM Access", orbit: true, traditional: false },
    { feature: "Mobile Wallet", orbit: true, traditional: true },
    { feature: "Cashback Rewards", orbit: true, traditional: false },
    { feature: "Instant Lock/Unlock", orbit: true, traditional: false },
    { feature: "Direct Deposit", orbit: true, traditional: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <PageHeader
          title=""
          breadcrumb={
            <Link href="/">
              <Button variant="ghost" className="text-slate-400 hover:text-white -ml-2" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          }
        />

        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 animate-pulse z-10">
              <Sparkles className="w-3 h-3 mr-1" />
              Coming Soon
            </Badge>
            <div className="relative">
              <img
                src={orbitMascot}
                alt="Orbit Mascot"
                className="w-32 h-32 mx-auto drop-shadow-[0_0_25px_rgba(6,182,212,0.5)]"
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              ORBIT Pay Card
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            The smarter way to get paid. Instant access to your earnings with a branded Visa debit card designed for the modern workforce.
          </p>
        </div>

        <OrbitCard variant="glass" hover={false} className="mb-8 bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-purple-900/30 border-cyan-500/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-3xl" />
          <OrbitCardContent className="p-2 md:p-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="relative">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl border border-cyan-500/20 transform hover:scale-105 transition-transform duration-300">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="text-cyan-400 font-bold text-lg">ORBIT</div>
                      <div className="text-slate-500 text-sm">Pay Card</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full" />
                      <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full -ml-3" />
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md" />
                  </div>
                  <div className="text-xl tracking-widest font-mono text-slate-300 mb-4">
                    •••• •••• •••• 1234
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>
                      <div className="text-slate-500 text-xs">CARDHOLDER</div>
                      <div className="text-slate-300">YOUR NAME</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs">VALID THRU</div>
                      <div className="text-slate-300">12/28</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 opacity-50">
                  <img src={orbitThinking} alt="" className="w-full h-full object-contain" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Your Money, Your Way</h2>
                <p className="text-slate-300">
                  The ORBIT Pay Card is a premium Visa debit card that gives you instant access to your earnings. No more waiting for payday checks or slow bank transfers.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>FDIC insured through our banking partner</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Accepted everywhere Visa is accepted</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Real-time balance and transaction alerts</span>
                  </div>
                </div>
              </div>
            </div>
          </OrbitCardContent>
        </OrbitCard>

        <SectionHeader
          title="Card Features"
          subtitle="Everything you need for seamless payments"
          align="center"
          size="lg"
        />

        <div className="hidden md:block mb-12">
          <BentoGrid cols={3} gap="md">
            {cardFeatures.map((feature, idx) => (
              <BentoTile key={idx} data-testid={`card-feature-${idx}`}>
                <div className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </div>
              </BentoTile>
            ))}
          </BentoGrid>
        </div>

        <div className="md:hidden mb-12">
          <CarouselRail gap="md" itemWidth="lg" showArrows={false}>
            {cardFeatures.map((feature, idx) => (
              <StatCard
                key={idx}
                label={feature.title}
                value=""
                icon={feature.icon}
                className="min-w-[280px]"
                data-testid={`card-feature-mobile-${idx}`}
              />
            ))}
          </CarouselRail>
        </div>

        <OrbitCard variant="default" className="mb-12">
          <OrbitCardHeader icon={<TrendingUp className="w-5 h-5 text-cyan-400" />}>
            <OrbitCardTitle>ORBIT Pay Card vs Traditional Banking</OrbitCardTitle>
          </OrbitCardHeader>
          <OrbitCardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Feature</th>
                    <th className="text-center py-3 px-4 text-cyan-400 font-bold">ORBIT Pay Card</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Traditional Bank</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-800">
                      <td className="py-3 px-4 text-slate-300">{row.feature}</td>
                      <td className="py-3 px-4 text-center">
                        {row.orbit ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.traditional ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-slate-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </OrbitCardContent>
        </OrbitCard>

        <BentoGrid cols={2} gap="md" className="mb-12">
          <BentoTile>
            <div className="p-6">
              <OrbitCardHeader icon={<Wallet className="w-5 h-5 text-green-400" />}>
                <OrbitCardTitle>Direct Deposit Available Now</OrbitCardTitle>
                <OrbitCardDescription>
                  Already have a bank account? Set up direct deposit today.
                </OrbitCardDescription>
              </OrbitCardHeader>
              <OrbitCardContent>
                <p className="text-slate-300 mb-4 text-sm">
                  While you wait for the ORBIT Pay Card, you can still receive your pay directly to any bank account. Simply provide your routing and account number in your profile.
                </p>
                <Link href="/employee-app">
                  <Button className="w-full bg-green-600 hover:bg-green-700" data-testid="button-setup-direct-deposit">
                    <Send className="w-4 h-4 mr-2" />
                    Set Up Direct Deposit
                  </Button>
                </Link>
              </OrbitCardContent>
            </div>
          </BentoTile>

          <BentoTile className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border-cyan-500/30">
            <div className="p-6">
              <OrbitCardHeader icon={<Star className="w-5 h-5 text-yellow-400" />}>
                <OrbitCardTitle>Join the Waitlist</OrbitCardTitle>
                <OrbitCardDescription className="text-slate-300">
                  Be the first to get the ORBIT Pay Card when it launches.
                </OrbitCardDescription>
              </OrbitCardHeader>
              <OrbitCardContent>
                {!submitted ? (
                  <form onSubmit={handleWaitlistSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="bg-slate-800 border-slate-700 text-white"
                        required
                        data-testid="input-waitlist-email"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !email}
                      className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
                      data-testid="button-join-waitlist"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 animate-spin" />
                          Joining...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Join Waitlist
                        </span>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <p className="text-green-300 font-semibold">You're on the list!</p>
                    <p className="text-slate-400 text-sm mt-1">We'll email you when the ORBIT Pay Card is ready.</p>
                  </div>
                )}
              </OrbitCardContent>
            </div>
          </BentoTile>
        </BentoGrid>

        <OrbitCard variant="glass" hover={false} className="bg-amber-900/20 border-amber-500/30 mb-8">
          <OrbitCardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <img
                src={orbitThinking}
                alt="Orbit thinking"
                className="w-24 h-24 object-contain flex-shrink-0"
              />
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-bold text-amber-300 mb-2 flex items-center justify-center md:justify-start gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Coming Q2 2026
                </h3>
                <p className="text-slate-300 text-sm">
                  We're working hard to bring you the ORBIT Pay Card. It requires special approval from Visa and our banking partners to ensure your money is safe and secure. In the meantime, you can use direct deposit to receive your pay instantly to any bank account.
                </p>
              </div>
            </div>
          </OrbitCardContent>
        </OrbitCard>

        <div className="text-center text-slate-500 text-sm pb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-4 h-4" />
            <span>Bank-grade security • FDIC insured • Visa protected</span>
          </div>
          <p>ORBIT Pay Card is powered by Stripe and our FDIC-insured banking partner.</p>
        </div>
      </div>
    </div>
  );
}
