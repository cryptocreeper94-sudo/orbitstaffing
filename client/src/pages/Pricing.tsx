import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Bitcoin, ArrowLeft, TrendingDown } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';

interface PricingTier {
  id: string;
  name: string;
  price: number | null;
  description: string;
  workers: string;
  features: string[];
  priceId?: string;
  featured?: boolean;
  competitorComparison?: {
    competitor: string;
    savings: string;
  };
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 39,
    description: 'Perfect for small teams',
    workers: '1-10 workers',
    competitorComparison: {
      competitor: 'Indeed',
      savings: '68% less',
    },
    features: [
      'Job posting & matching',
      'GPS time tracking',
      'Basic payroll export',
      'Employee Hub access',
      'Email support'
    ],
    priceId: 'price_1SWpbXBJN5j7Sqn0zOGmvG8c',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 99,
    description: 'For growing staffing agencies',
    workers: '10-50 workers',
    featured: true,
    competitorComparison: {
      competitor: 'ZipRecruiter',
      savings: '67% less',
    },
    features: [
      'Everything in Starter',
      'Owner Hub access',
      'Full payroll automation',
      'Reports API',
      'Unlimited clients',
      'Priority support'
    ],
    priceId: 'price_1SWpbXBJN5j7Sqn097nk0sua',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 249,
    description: 'Multi-location operations',
    workers: '50-200 workers',
    competitorComparison: {
      competitor: 'Bullhorn',
      savings: '60% less',
    },
    features: [
      'Everything in Growth',
      'Multi-location management',
      'Advanced analytics',
      'Full API access',
      'Weather verification',
      'Dedicated support'
    ],
    priceId: 'price_1SWpbXBJN5j7Sqn0iaE4uiPM',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    description: 'White-label & franchises',
    workers: '200+ workers',
    features: [
      'Everything in Professional',
      'White-label platform',
      'Custom branding',
      'Multi-tenant support',
      'Dedicated account manager',
      '24/7 phone support'
    ],
  },
];

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'coinbase' | null>(null);

  const checkoutMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, paymentMethod }),
      });
      if (!res.ok) throw new Error('Checkout failed');
      const data = await res.json();
      return data;
    },
    onSuccess: (data) => {
      if (paymentMethod === 'stripe' && data.url) {
        window.location.href = data.url;
      } else if (paymentMethod === 'coinbase' && data.charge) {
        window.location.href = data.charge.hosted_url;
      }
    },
  });

  const handleCheckout = (priceId: string, method: 'stripe' | 'coinbase') => {
    setPaymentMethod(method);
    setSelectedPlan(priceId);
    checkoutMutation.mutate(priceId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-6 sm:pt-8 pb-12 px-3 sm:px-6">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto mb-4">
        <Link href="/">
          <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20 min-h-[44px]" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading mb-3 sm:mb-4">
            Staffing Platform for Every Scale
          </h1>
          <p className="text-xs sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            From solo operators to enterprise franchises. Flexible pricing that grows with you.
          </p>
        </div>

        {/* Pricing Cards - Mobile Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          {PRICING_TIERS.map((tier) => (
            <Card
              key={tier.id}
              className={`relative flex flex-col transition-all ${
                tier.featured
                  ? 'border-primary/50 bg-gradient-to-b from-primary/10 to-transparent ring-2 ring-primary/20 md:scale-105'
                  : 'hover:border-primary/30'
              }`}
              data-testid={`pricing-card-${tier.id}`}
            >
              {tier.featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}

              <CardContent className="pt-6 flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{tier.description}</p>
                  <p className="text-xs text-muted-foreground">{tier.workers}</p>
                </div>

                {tier.price !== null ? (
                  <div className="mb-4">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                ) : (
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-primary">Custom</span>
                    <p className="text-sm text-muted-foreground">Contact us</p>
                  </div>
                )}

                {tier.competitorComparison && (
                  <div className="mb-4" data-testid={`comparison-badge-${tier.id}`}>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      {tier.competitorComparison.savings} than {tier.competitorComparison.competitor}
                    </Badge>
                  </div>
                )}

                <div className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {tier.priceId ? (
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleCheckout(tier.priceId!, 'stripe')}
                      disabled={checkoutMutation.isPending}
                      className="w-full"
                      variant={tier.featured ? 'default' : 'outline'}
                      data-testid={`button-checkout-stripe-${tier.id}`}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {checkoutMutation.isPending ? 'Processing...' : 'Pay with Card'}
                    </Button>
                    <Button
                      onClick={() => handleCheckout(tier.priceId!, 'coinbase')}
                      disabled={checkoutMutation.isPending}
                      variant="outline"
                      className="w-full"
                      data-testid={`button-checkout-crypto-${tier.id}`}
                    >
                      <Bitcoin className="w-4 h-4 mr-2" />
                      Pay with Crypto
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" data-testid={`button-contact-sales-${tier.id}`}>
                    Contact Sales
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
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

        {/* Payment Methods */}
        <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20 mb-12">
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-4">Flexible Payment Options</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Credit Card (Stripe)
                </h4>
                <p className="text-sm text-muted-foreground">
                  Visa, Mastercard, Amex. Instant activation. Receipts and invoices via email.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Bitcoin className="w-4 h-4 text-primary" />
                  Crypto (Coinbase Commerce)
                </h4>
                <p className="text-sm text-muted-foreground">
                  Bitcoin, Ethereum, USDC. Converted to USD on settlement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="text-left">
              <h4 className="font-semibold mb-2">Can I switch plans anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! Upgrade or downgrade instantly. We'll prorate your next billing cycle.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold mb-2">Is there a free trial?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! Start with 14 days free on any plan. No credit card required for the trial.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold mb-2">What about setup and support?</h4>
              <p className="text-sm text-muted-foreground">
                We include onboarding assistance for all plans. Enterprise includes a dedicated account manager.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
