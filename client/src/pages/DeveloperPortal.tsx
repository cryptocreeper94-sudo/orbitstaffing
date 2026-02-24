import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DeveloperRegistration from "@/components/DeveloperRegistration";
import { useToast } from "@/hooks/use-toast";
import {
  Code,
  Zap,
  Shield,
  Link2,
  DollarSign,
  Box,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Rocket,
  Sparkles,
  Users,
  Bot,
  Coffee,
  Car,
  ParkingCircle,
  BarChart3,
  ChevronLeft,
  Crown,
  Mail,
} from "lucide-react";

const CONNECTED_PRODUCTS = [
  {
    id: "orbit-staffing",
    name: "ORBIT Staffing OS",
    description: "Enterprise staffing automation platform",
    icon: <Users className="h-6 w-6" />,
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "garagebot",
    name: "GarageBot",
    description: "Automotive management system",
    icon: <Car className="h-6 w-6" />,
    color: "from-orange-500 to-red-600",
  },
  {
    id: "brew-board",
    name: "Brew & Board Coffee",
    description: "Hospitality POS solution",
    icon: <Coffee className="h-6 w-6" />,
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "lot-ops",
    name: "Lot Ops Pro",
    description: "Parking & lot management",
    icon: <ParkingCircle className="h-6 w-6" />,
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "darkwave",
    name: "DarkWave Pulse",
    description: "Real-time analytics engine",
    icon: <BarChart3 className="h-6 w-6" />,
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: "orby",
    name: "Orby",
    description: "AI-powered assistant",
    icon: <Bot className="h-6 w-6" />,
    color: "from-pink-500 to-rose-600",
  },
];

const PRICING_TIERS = [
  {
    id: "starter",
    name: "Starter",
    price: "Free",
    description: "Get started with the basics",
    features: [
      "1,000 API calls/month",
      "Sandbox environment access",
      "Community support",
      "Basic documentation",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    period: "/mo",
    description: "For growing applications",
    features: [
      "50,000 API calls/month",
      "Production environment access",
      "Webhook integrations",
      "Priority support",
      "Advanced analytics",
    ],
    cta: "Go Pro",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale deployments",
    features: [
      "Unlimited API calls",
      "White-label solutions",
      "Revenue sharing program",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const CODE_EXAMPLE = `import { OrbitClient } from '@orbit-ecosystem/sdk';

// Initialize the client
const orbit = new OrbitClient({
  apiKey: process.env.ORBIT_API_KEY,
  environment: 'production'
});

// Fetch worker data
const workers = await orbit.workers.list({
  status: 'active',
  limit: 50
});

// Create a new assignment
const assignment = await orbit.assignments.create({
  workerId: workers[0].id,
  clientId: 'client_abc123',
  startDate: '2025-01-15'
});

console.log('Assignment created:', assignment.id);`;

export default function DeveloperPortal() {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const apiKey = localStorage.getItem("orbit_developer_api_key");
    if (apiKey) {
      setIsLoggedIn(true);
      fetch("/api/developers/subscription", {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.tier) setCurrentTier(data.tier);
        })
        .catch(console.error);
    }
  }, []);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(CODE_EXAMPLE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTierAction = async (tierId: string) => {
    if (tierId === "starter") {
      document.getElementById("cta-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (tierId === "enterprise") {
      window.location.href = "mailto:enterprise@orbit.build?subject=Enterprise Developer Plan Inquiry";
      return;
    }

    if (!isLoggedIn) {
      toast({
        title: "Registration Required",
        description: "Please register as a developer first to upgrade your plan.",
        variant: "destructive",
      });
      document.getElementById("cta-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const apiKey = localStorage.getItem("orbit_developer_api_key");
    if (!apiKey) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/developers/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ tier: tierId }),
      });

      const data = await response.json();
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error: any) {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Could not initiate checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <button
        onClick={() => setLocation("/")}
        className="fixed top-6 left-6 z-50 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
        data-testid="button-back-home"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <Badge className="mb-6 bg-cyan-500/20 text-cyan-300 border-cyan-500/30 px-4 py-1">
            <Sparkles className="w-3 h-3 mr-1" />
            Partner API v1 Now Available
          </Badge>

          <h1
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
            data-testid="text-portal-headline"
          >
            Orbit Developer Portal
          </h1>

          <p
            className="text-2xl md:text-3xl text-gray-300 mb-4"
            data-testid="text-portal-tagline"
          >
            Build on the Orbit Ecosystem
          </p>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Connect your applications to 6+ integrated products. Access staffing
            data, automate workflows, and unlock new revenue streams with our
            powerful Partner API.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-8 py-6 text-lg"
              onClick={() =>
                document
                  .getElementById("api-quickstart")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              data-testid="button-get-started"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-800 font-bold px-8 py-6 text-lg"
              onClick={() => setLocation("/api/docs")}
              data-testid="button-view-docs"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View Docs
            </Button>
          </div>

          <div className="mt-16 flex justify-center">
            <img
              src="/mascot/clean/orbit_mascot_pointing_teaching_transparent_clean.png"
              alt="Orby mascot"
              className="h-48 object-contain drop-shadow-2xl"
              data-testid="img-orby-mascot"
            />
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              data-testid="text-why-build-heading"
            >
              Why Build on Orbit?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to integrate, scale, and monetize your applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm"
              data-testid="card-benefit-api"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Integration</h3>
              <p className="text-gray-400">
                Partner API v1 with comprehensive documentation, SDKs, and sandbox
                environment for rapid development.
              </p>
            </div>

            <div
              className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm"
              data-testid="card-benefit-blockchain"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Blockchain-Verified</h3>
              <p className="text-gray-400">
                All records secured on TrustVault blockchain for tamper-proof
                verification and compliance.
              </p>
            </div>

            <div
              className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm"
              data-testid="card-benefit-sdks"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Box className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Pre-built SDKs</h3>
              <p className="text-gray-400">
                Official SDKs for JavaScript and Python. Get started in minutes
                with type-safe clients.
              </p>
            </div>

            <div
              className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm"
              data-testid="card-benefit-revenue"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Revenue Sharing</h3>
              <p className="text-gray-400">
                Earn up to 30% revenue share on transactions processed through
                your integrations.
              </p>
            </div>

            <div
              className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm"
              data-testid="card-benefit-products"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
                <Link2 className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">6+ Connected Products</h3>
              <p className="text-gray-400">
                Access data and workflows across our entire ecosystem of business
                applications.
              </p>
            </div>

            <div
              className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm"
              data-testid="card-benefit-speed"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-gray-400">
                Sub-100ms response times with global edge caching and real-time
                webhooks.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              data-testid="text-products-heading"
            >
              Connected Products
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              One API to access our entire ecosystem of business tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONNECTED_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="group relative p-6 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300"
                data-testid={`card-product-${product.id}`}
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center mb-4 text-white shadow-lg`}
                >
                  {product.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-400">{product.description}</p>
                <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="api-quickstart" className="py-24 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              data-testid="text-quickstart-heading"
            >
              API Quick Start
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Get up and running in under 5 minutes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-25" />
              <div className="relative bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-gray-500">app.js</span>
                  <button
                    onClick={handleCopyCode}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                    data-testid="button-copy-code"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <pre className="p-6 text-sm overflow-x-auto">
                  <code className="text-gray-300" data-testid="text-code-snippet">
                    {CODE_EXAMPLE}
                  </code>
                </pre>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50">
                <h3 className="text-xl font-bold mb-4">Download SDKs</h3>
                <div className="space-y-3">
                  <a
                    href="/sdks/orbit-sdk-js.zip"
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-colors group"
                    data-testid="link-sdk-javascript"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                        <Code className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-semibold">JavaScript SDK</p>
                        <p className="text-sm text-gray-500">npm install @orbit-ecosystem/sdk</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </a>

                  <a
                    href="/sdks/orbit-sdk-py.zip"
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-colors group"
                    data-testid="link-sdk-python"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Code className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold">Python SDK</p>
                        <p className="text-sm text-gray-500">pip install orbit-ecosystem</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </a>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 font-bold py-6"
                onClick={() => setLocation("/api/docs")}
                data-testid="button-interactive-docs"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Interactive API Docs
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              data-testid="text-pricing-heading"
            >
              Developer Tiers
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Choose the plan that fits your needs
            </p>
            {isLoggedIn && (
              <Button
                variant="outline"
                className="mt-4 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                onClick={() => setLocation("/developer-account")}
                data-testid="button-manage-account"
              >
                <Crown className="w-4 h-4 mr-2" />
                Manage Your Account
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_TIERS.map((tier) => {
              const isCurrentTier = currentTier === tier.id;
              return (
                <div
                  key={tier.id}
                  className={`relative p-8 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                    tier.highlighted
                      ? "bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-500/50 scale-105"
                      : "bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50 hover:border-slate-600"
                  } ${isCurrentTier ? "ring-2 ring-green-500" : ""}`}
                  data-testid={`card-tier-${tier.id}`}
                >
                  {tier.highlighted && !isCurrentTier && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
                      Most Popular
                    </Badge>
                  )}
                  {isCurrentTier && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      Current Plan
                    </Badge>
                  )}

                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && (
                      <span className="text-gray-400">{tier.period}</span>
                    )}
                  </div>
                  <p className="text-gray-400 mb-6">{tier.description}</p>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full font-bold py-6 ${
                      isCurrentTier
                        ? "bg-green-600 hover:bg-green-700 text-white cursor-default"
                        : tier.highlighted
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                          : "bg-slate-700 hover:bg-slate-600 text-white"
                    }`}
                    onClick={() => !isCurrentTier && handleTierAction(tier.id)}
                    disabled={isCurrentTier || isLoading}
                    data-testid={`button-tier-${tier.id}`}
                  >
                    {isLoading && tier.id === "pro" ? (
                      "Redirecting..."
                    ) : isCurrentTier ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Your Current Plan
                      </>
                    ) : tier.id === "enterprise" ? (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Sales
                      </>
                    ) : (
                      tier.cta
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="cta-section" className="py-24 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 backdrop-blur-sm text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-600/5 rounded-3xl" />

            <div className="relative">
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                data-testid="text-cta-heading"
              >
                Join the Orbit Ecosystem
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Register as a developer to get your API keys and start building powerful
                integrations with our ecosystem.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <DeveloperRegistration
                  trigger={
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-8 py-6 text-lg"
                      data-testid="button-register-developer"
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      Register as Developer
                    </Button>
                  }
                />

                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-800 font-bold px-8 py-6 text-lg"
                  onClick={() => setLocation("/api/docs")}
                  data-testid="button-browse-docs"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Browse API Docs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/orbit-saturn-logo.png"
                alt="Orbit"
                className="h-8 w-8"
              />
              <span className="font-bold text-lg">Orbit Ecosystem</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a
                href="/api/docs"
                className="hover:text-white transition-colors"
                data-testid="link-footer-docs"
              >
                Documentation
              </a>
              <a
                href="/about"
                className="hover:text-white transition-colors"
                data-testid="link-footer-about"
              >
                About
              </a>
              <a
                href="/help"
                className="hover:text-white transition-colors"
                data-testid="link-footer-support"
              >
                Support
              </a>
            </div>

            <p className="text-sm text-gray-500">
              © 2025 DarkWave Studios LLC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
