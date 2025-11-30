import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, CreditCard, Bitcoin, ArrowLeft, TrendingDown, Star,
  Users, Calendar, DollarSign, MapPin, Shield, BarChart3,
  Briefcase, Clock, FileCheck, Zap, Building2, Rocket,
  Gift, Share2, Crown, HelpCircle, ChevronRight, Package
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedPlan(null);
    setPaymentMethod(null);
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
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">All-in-One Platform Bundles</h2>
              <p className="text-slate-400">Get everything you need at one low price. Best value for most businesses.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PLATFORM_BUNDLES.map((bundle) => (
                <Card
                  key={bundle.id}
                  className={`relative flex flex-col bg-slate-800/50 border-slate-700/50 transition-all hover:border-cyan-500/30 ${
                    bundle.featured ? 'ring-2 ring-cyan-500/50 border-cyan-500/50' : ''
                  }`}
                  data-testid={`bundle-card-${bundle.id}`}
                >
                  {bundle.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl">{bundle.name}</CardTitle>
                      {bundle.savings && (
                        <Badge variant="outline" className="text-green-400 border-green-500/30 text-xs">
                          {bundle.savings}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-slate-400">{bundle.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <div className="mb-6">
                      {bundle.price !== null ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-white">${bundle.price}</span>
                          <span className="text-slate-400">/month</span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-cyan-400">Custom Pricing</span>
                      )}
                      <p className="text-sm text-slate-500 mt-1">{bundle.workers}</p>
                    </div>

                    <ul className="space-y-3 mb-6 flex-1">
                      {bundle.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                          <span className="text-sm text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {bundle.priceId ? (
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleCheckout(bundle.priceId!, 'bundle', 'stripe')}
                          className={`w-full ${bundle.featured ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                          disabled={checkoutMutation.isPending}
                          data-testid={`button-checkout-${bundle.id}`}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          {checkoutMutation.isPending && selectedPlan === bundle.priceId ? 'Processing...' : 'Subscribe with Card'}
                        </Button>
                        <Button
                          onClick={() => handleCheckout(bundle.priceId!, 'bundle', 'coinbase')}
                          variant="outline"
                          className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                          disabled={checkoutMutation.isPending}
                          data-testid={`button-crypto-${bundle.id}`}
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Pick Only What You Need</h2>
              <p className="text-slate-400">Each tool works standalone. Mix and match as your business grows.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {STANDALONE_TOOLS.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <Card
                    key={tool.id}
                    className="relative flex flex-col bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/30 transition-all overflow-hidden"
                    data-testid={`tool-card-${tool.id}`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.color}`} />
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tool.color} flex items-center justify-center mb-3`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <Badge variant="outline" className="text-green-400 border-green-500/30 text-xs">
                          {tool.savings}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{tool.name}</CardTitle>
                      <CardDescription className="text-slate-400">{tool.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col">
                      <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white">${tool.price}</span>
                          <span className="text-slate-400">/month</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <span className="text-slate-500">vs {tool.competitor}:</span>
                          <span className="text-slate-400 line-through">{tool.competitorPrice}</span>
                        </div>
                      </div>

                      <ul className="space-y-2 mb-6 flex-1">
                        {tool.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="space-y-2">
                        {tool.priceId ? (
                          <Button
                            onClick={() => handleCheckout(tool.priceId!, 'tool', 'stripe')}
                            className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90`}
                            disabled={checkoutMutation.isPending}
                            data-testid={`button-subscribe-${tool.id}`}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            {checkoutMutation.isPending && selectedPlan === tool.priceId ? 'Processing...' : 'Subscribe Now'}
                          </Button>
                        ) : (
                          <Button
                            className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90`}
                            onClick={() => handleTabChange('bundles')}
                            data-testid={`button-subscribe-${tool.id}`}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Get in Bundle
                          </Button>
                        )}
                        <Link href="/jobs">
                          <Button
                            variant="outline"
                            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                            data-testid={`button-demo-${tool.id}`}
                          >
                            Try Free Demo
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-500/30 p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Need Everything?</h3>
                  <p className="text-slate-400">
                    All 5 tools purchased separately = $127/mo. Get them all in a bundle for just $99-249/mo!
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
            </Card>
          </TabsContent>

          <TabsContent value="affiliate" className="space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Earn While You Share</h2>
              <p className="text-slate-400">Join our affiliate program and earn recurring commissions for every referral.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50 text-center p-6">
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
              </Card>

              <Card className="bg-slate-800/50 border-cyan-500/50 ring-2 ring-cyan-500/20 text-center p-6 relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500">
                  Best Value
                </Badge>
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
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50 text-center p-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Franchise Partner</h3>
                <div className="text-3xl font-bold text-purple-400 mb-2">40%+</div>
                <p className="text-slate-400 text-sm mb-4">Territory exclusivity available</p>
                <ul className="text-left text-sm text-slate-300 space-y-2 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Exclusive territory</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Full white-label platform</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Training & certification</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Revenue share model</li>
                </ul>
                <a href="mailto:partnerships@orbitstaffing.io?subject=Franchise%20Partner%20Inquiry">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" data-testid="button-join-franchise">
                    Contact Us
                  </Button>
                </a>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-500/30 p-6">
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
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700/50 p-6 text-center">
            <CreditCard className="w-10 h-10 text-blue-400 mx-auto mb-3" />
            <h3 className="font-bold text-white mb-2">Secure Payments</h3>
            <p className="text-sm text-slate-400">Credit card, ACH, and crypto accepted. PCI-DSS compliant.</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700/50 p-6 text-center">
            <Rocket className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <h3 className="font-bold text-white mb-2">14-Day Free Trial</h3>
            <p className="text-sm text-slate-400">Try any plan free. No credit card required to start.</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700/50 p-6 text-center">
            <HelpCircle className="w-10 h-10 text-purple-400 mx-auto mb-3" />
            <h3 className="font-bold text-white mb-2">Cancel Anytime</h3>
            <p className="text-sm text-slate-400">No contracts, no penalties. Downgrade or cancel freely.</p>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Questions?</h2>
          <p className="text-slate-400 mb-6">Our team is here to help you choose the right plan.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="border-slate-600" data-testid="button-schedule-demo">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule a Demo
            </Button>
            <Link href="/roadmap">
              <Button variant="outline" className="border-slate-600" data-testid="button-view-roadmap">
                <FileCheck className="w-4 h-4 mr-2" />
                View Feature Roadmap
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
