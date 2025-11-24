import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Bitcoin } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

const PRICING_TIERS = [
  {
    id: 'solo',
    name: 'Solo/Micro',
    price: 199,
    description: 'Just starting out',
    workers: '1-25 workers',
    features: [
      'Job posting & matching',
      'Mobile time tracking',
      '1-2 active clients',
      'Basic payroll export',
      'Email support'
    ],
    priceId: 'price_1SWpbXBJN5j7Sqn0zOGmvG8c', // Live Stripe price ID
  },
  {
    id: 'small',
    name: 'Small Agency',
    price: 499,
    description: 'Like Superior Staffing',
    workers: '25-150 workers',
    featured: true,
    features: [
      'Everything in Solo',
      'Unlimited clients',
      'Full payroll automation',
      'GPS verification',
      'Compliance reports',
      'Priority email support'
    ],
    priceId: 'price_1SWpbXBJN5j7Sqn097nk0sua', // Live Stripe price ID
  },
  {
    id: 'growth',
    name: 'Growth Agency',
    price: 999,
    description: 'Multi-location scaling',
    workers: '150-500 workers',
    features: [
      'Everything in Small',
      'Multi-location management',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated support',
      'API access'
    ],
    priceId: 'price_1SWpbXBJN5j7Sqn0iaE4uiPM', // Live Stripe price ID
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    description: 'White-label & franchises',
    workers: '500+ workers',
    features: [
      'Everything in Growth',
      'White-label platform',
      'Custom branding',
      'Multi-tenant support',
      'Account manager',
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
    <div className="min-h-screen bg-background text-foreground pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold font-heading mb-4">
            Staffing Platform for Every Scale
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From solo operators to enterprise franchises. Flexible pricing that grows with you.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                ) : (
                  <div className="mb-6">
                    <span className="text-2xl font-bold text-primary">Custom</span>
                    <p className="text-sm text-muted-foreground">Contact us</p>
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

                {tier.price !== null ? (
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
