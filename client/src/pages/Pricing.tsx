import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, CreditCard, Bitcoin, ArrowLeft, TrendingDown, Star,
  Users, Calendar, DollarSign, MapPin, Shield, BarChart3,
  Briefcase, Clock, FileCheck, Zap, Building2, Rocket,
  Gift, Share2, Crown, HelpCircle, ChevronRight, Package,
  Plus, Minus, Layers
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Switch } from '@/components/ui/switch';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { CarouselRail, CarouselRailItem } from '@/components/ui/carousel-rail';
import { SectionHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent, OrbitCardFooter } from '@/components/ui/orbit-card';

interface PlatformModule {
  id: string;
  name: string;
  description: string;
  category: string;
  monthlyPrice: string;
  annualPrice: string;
  stripePriceIdMonthly: string | null;
  stripePriceIdAnnual: string | null;
  isRequired: boolean;
  isAddon: boolean;
  sortOrder: number;
  iconEmoji: string;
  features: string[];
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  tagline: string;
  monthlyPrice: string;
  annualPrice: string;
  stripePriceIdMonthly: string | null;
  stripePriceIdAnnual: string | null;
  includedModules: string[];
  maxWorkers: number;
  maxAdmins: number;
  storageGb: number;
  isPopular: boolean;
  isFeatured: boolean;
  badgeText: string | null;
}

interface StandaloneTool {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: any;
  color: string;
  features: string[];
  competitor: string;
  competitorPrice: string;
  savings: string;
  priceId?: string;
}

interface PlatformBundle {
  id: string;
  name: string;
  price: number | null;
  description: string;
  workers: string;
  features: string[];
  priceId?: string;
  featured?: boolean;
  savings?: string;
}

const STANDALONE_TOOLS: StandaloneTool[] = [
  {
    id: 'crm',
    name: 'ORBIT CRM',
    price: 19,
    description: 'Complete customer relationship management',
    icon: BarChart3,
    color: 'from-cyan-500 to-blue-600',
    features: [
      'Deal pipeline with drag-and-drop',
      'Activity timeline tracking',
      'Meeting scheduler',
      'Email open/click tracking',
      'Duplicate detection',
      'Notes & tasks',
      'Unlimited contacts'
    ],
    competitor: 'HubSpot',
    competitorPrice: '$50/user/mo',
    savings: '62% less',
  },
  {
    id: 'talent',
    name: 'ORBIT Talent Exchange',
    price: 29,
    description: 'Job board & talent pool management',
    icon: Users,
    color: 'from-purple-500 to-pink-600',
    features: [
      'Unlimited job postings',
      'Talent pool database',
      'Smart job matching',
      'Application tracking',
      'Candidate messaging',
      'Skills verification',
      'Indeed-style search'
    ],
    competitor: 'Indeed',
    competitorPrice: '$400/mo',
    savings: '93% less',
  },
  {
    id: 'payroll',
    name: 'ORBIT Payroll',
    price: 39,
    description: 'Automated multi-state payroll processing',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
    features: [
      'Unlimited employees',
      'Multi-state tax compliance',
      'Garnishment processing',
      'Direct deposit',
      'Paystub generation',
      'Prevailing wage support',
      'Automated calculations'
    ],
    competitor: 'ADP',
    competitorPrice: '$39 + $5/employee',
    savings: '60-80% less',
  },
  {
    id: 'time',
    name: 'ORBIT Time & GPS',
    price: 15,
    description: 'GPS-verified clock-in/out tracking',
    icon: MapPin,
    color: 'from-amber-500 to-orange-600',
    features: [
      'GPS geofencing (200-300ft)',
      'Mobile clock-in/out',
      'Timesheet management',
      'Overtime calculations',
      'Break tracking',
      'Photo verification',
      'Real-time location'
    ],
    competitor: 'Deputy',
    competitorPrice: '$4/user/mo',
    savings: 'Flat rate!',
  },
  {
    id: 'compliance',
    name: 'ORBIT Compliance',
    price: 25,
    description: 'I-9, certifications & background checks',
    icon: Shield,
    color: 'from-red-500 to-rose-600',
    features: [
      'I-9 verification tracking',
      'Certification management',
      'Expiration alerts',
      'Document storage',
      'Background check integration',
      'Drug testing tracking',
      'Audit-ready reports'
    ],
    competitor: 'Checkr',
    competitorPrice: '$35+ per check',
    savings: 'Unlimited tracking',
  },
];

const PLATFORM_BUNDLES: PlatformBundle[] = [
  {
    id: 'starter',
    name: 'Starter Bundle',
    price: 99,
    description: 'Essential tools for small teams',
    workers: '1-25 workers',
    savings: 'Save $28/mo',
    features: [
      'ORBIT CRM ($19 value)',
      'ORBIT Time & GPS ($15 value)',
      'ORBIT Compliance ($25 value)',
      'Employee Hub access',
      'Basic reporting',
      'Email support'
    ],
    priceId: 'price_1SYoQkPQpkkF93FKsLEssZzb',
  },
  {
    id: 'growth',
    name: 'Growth Bundle',
    price: 149,
    description: 'Everything for growing agencies',
    workers: '25-100 workers',
    featured: true,
    savings: 'Save $48/mo',
    features: [
      'All Starter features',
      'ORBIT Talent Exchange ($29 value)',
      'ORBIT Payroll ($39 value)',
      'Owner Hub access',
      'Advanced analytics',
      'Priority support'
    ],
    priceId: 'price_1SYoQlPQpkkF93FKh9pRxrdL',
  },
  {
    id: 'professional',
    name: 'Professional Bundle',
    price: 249,
    description: 'Full platform for scaling operations',
    workers: '100-500 workers',
    savings: 'Save $78/mo',
    features: [
      'All Growth features',
      'Multi-location management',
      'Full API access',
      'White-label options',
      'Weather verification',
      'Dedicated support'
    ],
    priceId: 'price_1SYoQlPQpkkF93FKaNLqc6T6',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    description: 'Custom solutions for large operations',
    workers: '500+ workers',
    features: [
      'All Professional features',
      'Unlimited workers',
      'Custom integrations',
      'SLA guarantees',
      '24/7 phone support',
      'Dedicated account manager'
    ],
  },
];

export default function Pricing() {
  const [activeTab, setActiveTab] = useState('bundles');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'coinbase' | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set(['core']));

  const { data: dbModules = [], isLoading: isLoadingModules } = useQuery<PlatformModule[]>({
    queryKey: ['/api/modules'],
    queryFn: async () => {
      const res = await fetch('/api/modules');
      if (!res.ok) throw new Error('Failed to fetch modules');
      return res.json();
    }
  });

  const { data: dbPlans = [], isLoading: isLoadingPlans } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
    queryFn: async () => {
      const res = await fetch('/api/subscription-plans');
      if (!res.ok) throw new Error('Failed to fetch plans');
      return res.json();
    }
  });

  const isLoading = isLoadingModules || isLoadingPlans;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedPlan(null);
    setPaymentMethod(null);
  };

  const toggleModule = (moduleId: string) => {
    const module = dbModules.find(m => m.id === moduleId);
    if (module?.isRequired) return;
    
    const newSelected = new Set(selectedModules);
    if (newSelected.has(moduleId)) {
      newSelected.delete(moduleId);
    } else {
      newSelected.add(moduleId);
    }
    setSelectedModules(newSelected);
  };

  const calculateTotal = () => {
    let total = 0;
    selectedModules.forEach(id => {
      const module = dbModules.find(m => m.id === id);
      if (module) {
        const price = billingCycle === 'annual' 
          ? parseFloat(module.annualPrice) / 12 
          : parseFloat(module.monthlyPrice);
        total += price;
      }
    });
    return total;
  };

  const getModulesForPlan = (plan: SubscriptionPlan) => {
    return dbModules.filter(m => plan.includedModules.includes(m.id));
  };

  const checkoutMutation = useMutation({
    mutationFn: async (data: { priceId: string; productType: string }) => {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, paymentMethod }),
      });
      if (!res.ok) throw new Error('Checkout failed');
      return res.json();
    },
    onSuccess: (data) => {
      if (paymentMethod === 'stripe' && data.url) {
        window.location.href = data.url;
      } else if (paymentMethod === 'coinbase' && data.charge) {
        window.location.href = data.charge.hosted_url;
      }
    },
  });

  const handleCheckout = (priceId: string, productType: string, method: 'stripe' | 'coinbase') => {
    setPaymentMethod(method);
    setSelectedPlan(priceId);
    checkoutMutation.mutate({ priceId, productType });
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const planModules = getModulesForPlan(plan);
    const priceId = plan.stripePriceIdMonthly || PLATFORM_BUNDLES.find(b => b.id === plan.id)?.priceId;
    
    return (
      <OrbitCard
        key={plan.id}
        className={`relative flex flex-col h-full ${
          plan.isPopular ? 'ring-2 ring-cyan-500/50 border-cyan-500/50' : ''
        }`}
        data-testid={`bundle-card-${plan.id}`}
      >
        {plan.badgeText && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4">
              <Star className="w-3 h-3 mr-1" />
              {plan.badgeText}
            </Badge>
          </div>
        )}

        <OrbitCardHeader>
          <div className="flex items-center justify-between mb-2">
            <OrbitCardTitle>{plan.name}</OrbitCardTitle>
            {plan.isFeatured && (
              <Badge variant="outline" className="text-green-400 border-green-500/30 text-xs">
                Best Value
              </Badge>
            )}
          </div>
          <OrbitCardDescription>{plan.description}</OrbitCardDescription>
        </OrbitCardHeader>

        <OrbitCardContent className="flex-1 flex flex-col">
          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">${parseFloat(plan.monthlyPrice).toFixed(0)}</span>
              <span className="text-slate-400">/month</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{plan.tagline}</p>
          </div>

          <ul className="space-y-3 mb-6 flex-1">
            {planModules.map((module) => (
              <li key={module.id} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                <span className="text-sm text-slate-300">
                  {module.iconEmoji} {module.name}
                </span>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
              <span className="text-sm text-slate-300">Up to {plan.maxWorkers.toLocaleString()} workers</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
              <span className="text-sm text-slate-300">{plan.storageGb}GB storage</span>
            </li>
          </ul>

          {priceId ? (
            <div className="space-y-2">
              <Button
                onClick={() => handleCheckout(priceId, 'bundle', 'stripe')}
                className={`w-full ${plan.isPopular ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                disabled={checkoutMutation.isPending}
                data-testid={`button-checkout-${plan.id}`}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {checkoutMutation.isPending && selectedPlan === priceId ? 'Processing...' : 'Subscribe with Card'}
              </Button>
              <Button
                onClick={() => handleCheckout(priceId, 'bundle', 'coinbase')}
                variant="outline"
                className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                disabled={checkoutMutation.isPending}
                data-testid={`button-crypto-${plan.id}`}
              >
                <Bitcoin className="w-4 h-4 mr-2" />
                Pay with Crypto
              </Button>
            </div>
          ) : (
            <Button className="w-full bg-slate-700 hover:bg-slate-600" data-testid="button-contact-sales">
              Contact Sales
            </Button>
          )}
        </OrbitCardContent>
      </OrbitCard>
    );
  };

  const renderToolCard = (module: PlatformModule) => {
    const gradientColors: Record<string, string> = {
      payroll: 'from-green-500 to-emerald-600',
      compliance: 'from-red-500 to-rose-600',
      pay_card: 'from-amber-500 to-orange-600',
      talent_exchange: 'from-purple-500 to-pink-600',
      crm: 'from-cyan-500 to-blue-600',
      blockchain: 'from-violet-500 to-purple-600',
      ai_assistant: 'from-pink-500 to-rose-600',
    };
    const color = gradientColors[module.id] || 'from-cyan-500 to-blue-600';
    const priceId = module.stripePriceIdMonthly || STANDALONE_TOOLS.find(t => t.id === module.id)?.priceId;
    
    return (
      <OrbitCard
        key={module.id}
        className="relative flex flex-col h-full overflow-hidden"
        data-testid={`tool-card-${module.id}`}
      >
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color}`} />
        
        <OrbitCardHeader>
          <div className="flex items-start justify-between">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center mb-3`}>
              <span className="text-2xl">{module.iconEmoji}</span>
            </div>
            <Badge variant="outline" className="text-green-400 border-green-500/30 text-xs">
              Addon
            </Badge>
          </div>
          <OrbitCardTitle>{module.name}</OrbitCardTitle>
          <OrbitCardDescription>{module.description}</OrbitCardDescription>
        </OrbitCardHeader>

        <OrbitCardContent className="flex-1 flex flex-col">
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">${parseFloat(module.monthlyPrice).toFixed(0)}</span>
              <span className="text-slate-400">/month</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              or ${parseFloat(module.annualPrice).toFixed(0)}/year (save 17%)
            </div>
          </div>

          <ul className="space-y-2 mb-6 flex-1">
            {module.features && (module.features as string[]).map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-300">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-2">
            {priceId ? (
              <Button
                onClick={() => handleCheckout(priceId, 'module', 'stripe')}
                className={`w-full bg-gradient-to-r ${color} hover:opacity-90`}
                disabled={checkoutMutation.isPending}
                data-testid={`button-subscribe-${module.id}`}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {checkoutMutation.isPending && selectedPlan === priceId ? 'Processing...' : 'Add Module'}
              </Button>
            ) : (
              <Button
                className={`w-full bg-gradient-to-r ${color} hover:opacity-90`}
                onClick={() => handleTabChange('modular')}
                data-testid={`button-subscribe-${module.id}`}
              >
                <Package className="w-4 h-4 mr-2" />
                Build Custom Package
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => handleTabChange('bundles')}
              data-testid={`button-bundle-${module.id}`}
            >
              Get in Bundle
            </Button>
          </div>
        </OrbitCardContent>
      </OrbitCard>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-12">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 pt-6 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="text-center mb-8">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-4 text-sm px-4 py-1">
              <TrendingDown className="w-4 h-4 mr-2 inline" />
              60-95% Less Than Competitors
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" data-testid="text-pricing-title">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Choose individual tools or save with bundles. No hidden fees. No per-user charges. Cancel anytime.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <div className="flex justify-center overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <TabsList className="bg-slate-800 border border-slate-700 p-1 flex-shrink-0">
              <TabsTrigger 
                value="bundles" 
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base whitespace-nowrap"
                data-testid="tab-bundles"
              >
                <Package className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Platform </span>Bundles
              </TabsTrigger>
              <TabsTrigger 
                value="modular" 
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base whitespace-nowrap"
                data-testid="tab-modular"
              >
                <Layers className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Build Your </span>Own
              </TabsTrigger>
              <TabsTrigger 
                value="tools" 
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base whitespace-nowrap"
                data-testid="tab-tools"
              >
                <Zap className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Standalone </span>Tools
              </TabsTrigger>
              <TabsTrigger 
                value="affiliate" 
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base whitespace-nowrap"
                data-testid="tab-affiliate"
              >
                <Gift className="w-4 h-4 mr-1 sm:mr-2" />
                Affiliate
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="bundles" className="space-y-8">
            <SectionHeader 
              title="All-in-One Platform Bundles"
              subtitle="Get everything you need at one low price. Best value for most businesses."
              align="center"
              size="md"
            />

            {isLoading ? (
              <CarouselRail showArrows={false} gap="md" itemWidth="md">
                {[1, 2, 3, 4].map(i => (
                  <CarouselRailItem key={i}>
                    <OrbitCard className="w-[280px] sm:w-[300px] animate-pulse">
                      <OrbitCardHeader><div className="h-8 bg-slate-700 rounded w-3/4" /></OrbitCardHeader>
                      <OrbitCardContent><div className="space-y-3"><div className="h-10 bg-slate-700 rounded w-1/2" /><div className="h-4 bg-slate-700 rounded" /><div className="h-4 bg-slate-700 rounded w-5/6" /></div></OrbitCardContent>
                    </OrbitCard>
                  </CarouselRailItem>
                ))}
              </CarouselRail>
            ) : dbPlans.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No subscription plans available. Check back soon!</p>
              </div>
            ) : (
              <>
                <div className="hidden sm:block">
                  <BentoGrid cols={4} gap="md">
                    {dbPlans.map((plan) => (
                      <BentoTile key={plan.id} className="p-0 border-0 bg-transparent">
                        {renderPlanCard(plan)}
                      </BentoTile>
                    ))}
                  </BentoGrid>
                </div>
                <div className="sm:hidden">
                  <CarouselRail showArrows={false} gap="md" itemWidth="md">
                    {dbPlans.map((plan) => (
                      <CarouselRailItem key={plan.id} className="w-[280px]">
                        {renderPlanCard(plan)}
                      </CarouselRailItem>
                    ))}
                  </CarouselRail>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="tools" className="space-y-8">
            <SectionHeader 
              title="Pick Only What You Need"
              subtitle="Each tool works standalone. Mix and match as your business grows."
              align="center"
              size="md"
            />

            {isLoading ? (
              <CarouselRail showArrows={false} gap="md" itemWidth="md">
                {[1, 2, 3].map(i => (
                  <CarouselRailItem key={i}>
                    <OrbitCard className="w-[260px] sm:w-[280px] animate-pulse">
                      <OrbitCardHeader><div className="h-12 w-12 bg-slate-700 rounded-xl mb-3" /><div className="h-6 bg-slate-700 rounded w-3/4" /></OrbitCardHeader>
                      <OrbitCardContent><div className="space-y-3"><div className="h-8 bg-slate-700 rounded w-1/3" /><div className="h-4 bg-slate-700 rounded" /><div className="h-4 bg-slate-700 rounded w-5/6" /></div></OrbitCardContent>
                    </OrbitCard>
                  </CarouselRailItem>
                ))}
              </CarouselRail>
            ) : dbModules.filter(m => m.isAddon && !m.isRequired).length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No standalone tools available. Check back soon!</p>
              </div>
            ) : (
              <>
                <div className="hidden sm:block">
                  <BentoGrid cols={3} gap="md">
                    {dbModules.filter(m => m.isAddon && !m.isRequired).map((module) => (
                      <BentoTile key={module.id} className="p-0 border-0 bg-transparent">
                        {renderToolCard(module)}
                      </BentoTile>
                    ))}
                  </BentoGrid>
                </div>
                <div className="sm:hidden">
                  <CarouselRail showArrows={false} gap="md" itemWidth="md">
                    {dbModules.filter(m => m.isAddon && !m.isRequired).map((module) => (
                      <CarouselRailItem key={module.id} className="w-[260px]">
                        {renderToolCard(module)}
                      </CarouselRailItem>
                    ))}
                  </CarouselRail>
                </div>
              </>
            )}

            <OrbitCard variant="action" className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-500/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Need Everything?</h3>
                  <p className="text-slate-400">
                    All modules purchased separately = ${dbModules.reduce((sum, m) => sum + parseFloat(m.monthlyPrice || '0'), 0)}/mo. Get them in an Enterprise bundle!
                  </p>
                </div>
                <Button 
                  onClick={() => handleTabChange('bundles')}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 whitespace-nowrap"
                  data-testid="button-view-bundles-cta"
                >
                  View Bundles
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </OrbitCard>
          </TabsContent>

          <TabsContent value="modular" className="space-y-8">
            <SectionHeader 
              title="Build Your Perfect Package"
              subtitle="Select only the modules you need. Mix and match to create your ideal solution."
              align="center"
              size="md"
            />

            <div className="flex justify-center mb-6">
              <div className="bg-slate-800 rounded-full p-1 flex items-center gap-2">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    billingCycle === 'monthly' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  data-testid="button-monthly"
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    billingCycle === 'annual' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  data-testid="button-annual"
                >
                  Annual
                  <Badge className="bg-green-500/20 text-green-400 text-xs">Save 17%</Badge>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-slate-300 mb-4">Available Modules</h3>
                
                {dbModules.map((module) => (
                  <OrbitCard 
                    key={module.id}
                    className={`cursor-pointer ${
                      selectedModules.has(module.id) ? 'ring-2 ring-cyan-500/50 border-cyan-500/50' : ''
                    } ${module.isRequired ? 'opacity-75' : ''}`}
                    onClick={() => toggleModule(module.id)}
                    data-testid={`module-card-${module.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{module.iconEmoji}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-white">{module.name}</h4>
                            {module.isRequired && (
                              <Badge variant="outline" className="text-xs text-cyan-400 border-cyan-500/30">Required</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">{module.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-white">
                            ${billingCycle === 'annual' 
                              ? (parseFloat(module.annualPrice) / 12).toFixed(0) 
                              : parseFloat(module.monthlyPrice).toFixed(0)}
                          </div>
                          <div className="text-xs text-slate-500">/month</div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedModules.has(module.id) 
                            ? 'bg-cyan-500 border-cyan-500' 
                            : 'border-slate-600'
                        }`}>
                          {selectedModules.has(module.id) && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                    </div>
                    
                    {selectedModules.has(module.id) && module.features && (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="grid grid-cols-2 gap-2">
                          {(module.features as string[]).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-400">
                              <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </OrbitCard>
                ))}
              </div>

              <div className="lg:col-span-1">
                <OrbitCard className="sticky top-6">
                  <OrbitCardHeader>
                    <OrbitCardTitle>Your Package</OrbitCardTitle>
                    <OrbitCardDescription>Selected modules and pricing</OrbitCardDescription>
                  </OrbitCardHeader>
                  <OrbitCardContent className="space-y-4">
                    <div className="space-y-2">
                      {dbModules
                        .filter(m => selectedModules.has(m.id))
                        .map(module => (
                          <div key={module.id} className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2">
                              <span>{module.iconEmoji}</span>
                              <span className="text-slate-300">{module.name}</span>
                            </span>
                            <span className="text-slate-400">
                              ${billingCycle === 'annual' 
                                ? (parseFloat(module.annualPrice) / 12).toFixed(0) 
                                : parseFloat(module.monthlyPrice).toFixed(0)}
                            </span>
                          </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-700 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400">Monthly Total</span>
                        <span className="text-2xl font-bold text-white">${calculateTotal().toFixed(0)}</span>
                      </div>
                      {billingCycle === 'annual' && (
                        <div className="text-sm text-green-400 text-right">
                          Save ${((calculateTotal() * 12) - (calculateTotal() * 12 * 0.83)).toFixed(0)}/year
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"
                      disabled={selectedModules.size === 0}
                      data-testid="button-checkout-custom"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Start Subscription
                    </Button>

                    <p className="text-xs text-slate-500 text-center">
                      Cancel anytime. No long-term contracts.
                    </p>
                  </OrbitCardContent>
                </OrbitCard>

                <OrbitCard variant="action" className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-500/30 mt-6">
                  <h4 className="font-semibold text-white mb-2">Compare to Pre-built Plans</h4>
                  <p className="text-sm text-slate-400 mb-3">
                    Pre-built bundles may save you money if you need multiple modules.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTabChange('bundles')}
                    className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                    data-testid="button-compare-plans"
                  >
                    View Pre-built Plans
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </OrbitCard>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="affiliate" className="space-y-8">
            <SectionHeader 
              title="Earn While You Share"
              subtitle="Join our affiliate program and earn recurring commissions for every referral."
              align="center"
              size="md"
            />

            <div className="hidden sm:block">
              <BentoGrid cols={3} gap="md">
                <BentoTile className="p-0 border-0 bg-transparent">
                  <OrbitCard className="text-center h-full">
                    <OrbitCardContent className="pt-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                        <Share2 className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Referral Partner</h3>
                      <div className="text-3xl font-bold text-green-400 mb-2">20%</div>
                      <p className="text-slate-400 text-sm mb-4">Recurring commission on all referrals</p>
                      <ul className="text-left text-sm text-slate-300 space-y-2 mb-6">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Unique referral link</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Monthly payouts</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Performance dashboard</li>
                      </ul>
                      <Link href="/register?type=referral">
                        <Button className="w-full bg-green-600 hover:bg-green-700" data-testid="button-join-referral">
                          Join Program
                        </Button>
                      </Link>
                    </OrbitCardContent>
                  </OrbitCard>
                </BentoTile>

                <BentoTile className="p-0 border-0 bg-transparent">
                  <OrbitCard className="text-center h-full ring-2 ring-cyan-500/20 relative">
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 z-10">
                      Best Value
                    </Badge>
                    <OrbitCardContent className="pt-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 mt-4">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Agency Partner</h3>
                      <div className="text-3xl font-bold text-cyan-400 mb-2">30%</div>
                      <p className="text-slate-400 text-sm mb-4">For staffing agencies & consultants</p>
                      <ul className="text-left text-sm text-slate-300 space-y-2 mb-6">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> White-label options</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Co-marketing support</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Priority onboarding</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Dedicated partner manager</li>
                      </ul>
                      <Link href="/register?type=agency">
                        <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600" data-testid="button-join-agency">
                          Apply Now
                        </Button>
                      </Link>
                    </OrbitCardContent>
                  </OrbitCard>
                </BentoTile>

                <BentoTile className="p-0 border-0 bg-transparent">
                  <OrbitCard className="text-center h-full bg-gradient-to-br from-purple-900/50 to-pink-900/30 border-purple-500/30 ring-2 ring-purple-500/20">
                    <OrbitCardContent className="pt-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Franchise Partner</h3>
                      <div className="text-3xl font-bold text-purple-400 mb-1">$7.5K-$35K</div>
                      <p className="text-xs text-slate-400 mb-2">One-time fee + royalties</p>
                      <p className="text-slate-400 text-sm mb-4">Own your territory forever</p>
                      <ul className="text-left text-sm text-slate-300 space-y-2 mb-6">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Exclusive territory rights</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Full white-label platform</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> NFT revenue share (70-90%)</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> All modules included</li>
                      </ul>
                      <Link href="/franchise">
                        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" data-testid="button-join-franchise">
                          View Franchise Tiers
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </OrbitCardContent>
                  </OrbitCard>
                </BentoTile>
              </BentoGrid>
            </div>

            <div className="sm:hidden">
              <CarouselRail showArrows={false} gap="md" itemWidth="md">
                <CarouselRailItem className="w-[280px]">
                  <OrbitCard className="text-center h-full">
                    <OrbitCardContent className="pt-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                        <Share2 className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Referral Partner</h3>
                      <div className="text-3xl font-bold text-green-400 mb-2">20%</div>
                      <p className="text-slate-400 text-sm mb-4">Recurring commission on all referrals</p>
                      <ul className="text-left text-sm text-slate-300 space-y-2 mb-6">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Unique referral link</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Monthly payouts</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Performance dashboard</li>
                      </ul>
                      <Link href="/register?type=referral">
                        <Button className="w-full bg-green-600 hover:bg-green-700" data-testid="button-join-referral">
                          Join Program
                        </Button>
                      </Link>
                    </OrbitCardContent>
                  </OrbitCard>
                </CarouselRailItem>

                <CarouselRailItem className="w-[280px]">
                  <OrbitCard className="text-center h-full ring-2 ring-cyan-500/20 relative">
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 z-10">
                      Best Value
                    </Badge>
                    <OrbitCardContent className="pt-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 mt-4">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Agency Partner</h3>
                      <div className="text-3xl font-bold text-cyan-400 mb-2">30%</div>
                      <p className="text-slate-400 text-sm mb-4">For staffing agencies & consultants</p>
                      <ul className="text-left text-sm text-slate-300 space-y-2 mb-6">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> White-label options</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Co-marketing support</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Priority onboarding</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Dedicated partner manager</li>
                      </ul>
                      <Link href="/register?type=agency">
                        <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600" data-testid="button-join-agency">
                          Apply Now
                        </Button>
                      </Link>
                    </OrbitCardContent>
                  </OrbitCard>
                </CarouselRailItem>

                <CarouselRailItem className="w-[280px]">
                  <OrbitCard className="text-center h-full bg-gradient-to-br from-purple-900/50 to-pink-900/30 border-purple-500/30 ring-2 ring-purple-500/20">
                    <OrbitCardContent className="pt-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Franchise Partner</h3>
                      <div className="text-3xl font-bold text-purple-400 mb-1">$7.5K-$35K</div>
                      <p className="text-xs text-slate-400 mb-2">One-time fee + royalties</p>
                      <p className="text-slate-400 text-sm mb-4">Own your territory forever</p>
                      <ul className="text-left text-sm text-slate-300 space-y-2 mb-6">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Exclusive territory rights</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Full white-label platform</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> NFT revenue share (70-90%)</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> All modules included</li>
                      </ul>
                      <Link href="/franchise">
                        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" data-testid="button-join-franchise">
                          View Franchise Tiers
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </OrbitCardContent>
                  </OrbitCard>
                </CarouselRailItem>
              </CarouselRail>
            </div>

            <OrbitCard variant="action" className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-500/30">
              <div className="flex items-start gap-4">
                <Gift className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Customer Referral Bonus</h3>
                  <p className="text-slate-300 mb-4">
                    Already a customer? Refer other businesses and get <span className="text-amber-400 font-bold">$50 credit</span> for each successful referral, plus <span className="text-amber-400 font-bold">10% recurring</span> on their subscription.
                  </p>
                  <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10" data-testid="button-refer-friend">
                    Refer a Friend
                  </Button>
                </div>
              </div>
            </OrbitCard>
          </TabsContent>
        </Tabs>

        <div className="mt-16">
          <div className="hidden sm:block">
            <BentoGrid cols={3} gap="md">
              <BentoTile className="p-0 border-0 bg-transparent">
                <OrbitCard className="text-center h-full">
                  <OrbitCardContent className="py-6">
                    <CreditCard className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                    <h3 className="font-bold text-white mb-2">Secure Payments</h3>
                    <p className="text-sm text-slate-400">Credit card, ACH, and crypto accepted. PCI-DSS compliant.</p>
                  </OrbitCardContent>
                </OrbitCard>
              </BentoTile>
              <BentoTile className="p-0 border-0 bg-transparent">
                <OrbitCard className="text-center h-full">
                  <OrbitCardContent className="py-6">
                    <Rocket className="w-10 h-10 text-green-400 mx-auto mb-3" />
                    <h3 className="font-bold text-white mb-2">14-Day Free Trial</h3>
                    <p className="text-sm text-slate-400">Try any plan free. No credit card required to start.</p>
                  </OrbitCardContent>
                </OrbitCard>
              </BentoTile>
              <BentoTile className="p-0 border-0 bg-transparent">
                <OrbitCard className="text-center h-full">
                  <OrbitCardContent className="py-6">
                    <HelpCircle className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                    <h3 className="font-bold text-white mb-2">Expert Support</h3>
                    <p className="text-sm text-slate-400">Live chat, phone, and email support from real humans.</p>
                  </OrbitCardContent>
                </OrbitCard>
              </BentoTile>
            </BentoGrid>
          </div>
          <div className="sm:hidden">
            <CarouselRail showArrows={false} gap="md" itemWidth="sm">
              <CarouselRailItem className="w-[220px]">
                <OrbitCard className="text-center h-full">
                  <OrbitCardContent className="py-6">
                    <CreditCard className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                    <h3 className="font-bold text-white mb-2">Secure Payments</h3>
                    <p className="text-sm text-slate-400">Credit card, ACH, and crypto accepted. PCI-DSS compliant.</p>
                  </OrbitCardContent>
                </OrbitCard>
              </CarouselRailItem>
              <CarouselRailItem className="w-[220px]">
                <OrbitCard className="text-center h-full">
                  <OrbitCardContent className="py-6">
                    <Rocket className="w-10 h-10 text-green-400 mx-auto mb-3" />
                    <h3 className="font-bold text-white mb-2">14-Day Free Trial</h3>
                    <p className="text-sm text-slate-400">Try any plan free. No credit card required to start.</p>
                  </OrbitCardContent>
                </OrbitCard>
              </CarouselRailItem>
              <CarouselRailItem className="w-[220px]">
                <OrbitCard className="text-center h-full">
                  <OrbitCardContent className="py-6">
                    <HelpCircle className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                    <h3 className="font-bold text-white mb-2">Expert Support</h3>
                    <p className="text-sm text-slate-400">Live chat, phone, and email support from real humans.</p>
                  </OrbitCardContent>
                </OrbitCard>
              </CarouselRailItem>
            </CarouselRail>
          </div>
        </div>

        <div className="mt-12 text-center text-slate-400">
          <p className="text-sm">
            Have questions? <Link href="/contact" className="text-cyan-400 hover:text-cyan-300">Contact our sales team</Link> or 
            call <span className="text-cyan-400">(555) 123-4567</span>
          </p>
        </div>
      </div>
    </div>
  );
}
