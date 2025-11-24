import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useStripePayment, useCoinbasePayment } from '../api/payments';

interface PricingTier {
  id: string;
  name: string;
  price: number | null;
  description: string;
  workers: string;
  featured?: boolean;
  features: string[];
  priceId: string;
}

const PRICING_TIERS: PricingTier[] = [
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
      'Email support',
    ],
    priceId: 'price_1SWpbXBJN5j7Sqn0zOGmvG8c',
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
      'Priority support',
    ],
    priceId: 'price_1SWpbXBJN5j7Sqn097nk0sua',
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
      'API access',
    ],
    priceId: 'price_1SWpbXBJN5j7Sqn0iaE4uiPM',
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
      '24/7 phone support',
    ],
    priceId: '',
  },
];

export default function PricingScreen({ navigation }: any) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'coinbase' | null>(null);
  const [loading, setLoading] = useState(false);

  const stripeMutation = useStripePayment();
  const coinbaseMutation = useCoinbasePayment();

  const handlePaymentWithStripe = async (tier: PricingTier) => {
    if (!tier.priceId) {
      Alert.alert('Contact Sales', 'Please contact our sales team for Enterprise pricing.');
      return;
    }

    setLoading(true);
    try {
      const result = await stripeMutation.mutateAsync({
        priceId: tier.priceId,
        paymentMethod: 'stripe',
      });

      if (result.url) {
        // In production, open the Stripe checkout URL in a web view or redirect
        Alert.alert('Payment', `Redirecting to Stripe checkout for ${tier.name}...`);
        // navigation.navigate('StripeCheckout', { url: result.url });
      }
    } catch (error) {
      Alert.alert('Payment Error', 'Failed to initiate Stripe payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentWithCoinbase = async (tier: PricingTier) => {
    if (!tier.priceId) {
      Alert.alert('Contact Sales', 'Please contact our sales team for Enterprise pricing.');
      return;
    }

    setLoading(true);
    try {
      const result = await coinbaseMutation.mutateAsync({
        priceId: tier.priceId,
        paymentMethod: 'coinbase',
      });

      if (result.charge?.hosted_url) {
        // In production, open the Coinbase checkout URL
        Alert.alert('Payment', `Redirecting to Coinbase Commerce for ${tier.name}...`);
        // navigation.navigate('CoinbaseCheckout', { url: result.charge.hosted_url });
      }
    } catch (error) {
      Alert.alert('Payment Error', 'Coinbase payment unavailable. Try Stripe instead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Staffing Platform Pricing</Text>
          <Text style={styles.headerSubtitle}>
            Flexible plans for every size business
          </Text>
        </View>

        {/* Pricing Tiers */}
        {PRICING_TIERS.map((tier) => (
          <View
            key={tier.id}
            style={[
              styles.tierCard,
              tier.featured && styles.tierCardFeatured,
            ]}
          >
            {tier.featured && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badge}>MOST POPULAR</Text>
              </View>
            )}

            <Text style={styles.tierName}>{tier.name}</Text>
            <Text style={styles.tierDescription}>{tier.description}</Text>
            <Text style={styles.tierWorkers}>{tier.workers}</Text>

            {tier.price !== null ? (
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${tier.price}</Text>
                <Text style={styles.priceLabel}>/month</Text>
              </View>
            ) : (
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Custom Pricing</Text>
              </View>
            )}

            {/* Features List */}
            <View style={styles.featuresList}>
              {tier.features.map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <Text style={styles.featureCheck}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* Payment Buttons */}
            {tier.price !== null ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.stripeButton]}
                  onPress={() => handlePaymentWithStripe(tier)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>💳 Pay with Card</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.coinbaseButton]}
                  onPress={() => handlePaymentWithCoinbase(tier)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>🪙 Pay with Crypto</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.contactButton]}
                onPress={() =>
                  Alert.alert('Contact Sales', 'Email: sales@orbitstaffing.net')
                }
              >
                <Text style={styles.buttonText}>Contact Sales</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>FAQ</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              Can I switch plans anytime?
            </Text>
            <Text style={styles.faqAnswer}>
              Yes! Upgrade or downgrade instantly with prorated billing.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              Is there a free trial?
            </Text>
            <Text style={styles.faqAnswer}>
              Yes! 14 days free on any plan. No credit card required.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              What payment methods do you accept?
            </Text>
            <Text style={styles.faqAnswer}>
              We accept all major credit cards (Stripe) and cryptocurrency (Coinbase Commerce).
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Questions? Contact support@orbitstaffing.net
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  tierCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tierCardFeatured: {
    borderColor: '#06b6d4',
    borderWidth: 2,
    backgroundColor: '#0f2f3f',
  },
  badgeContainer: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  badge: {
    backgroundColor: '#06b6d4',
    color: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '600',
  },
  tierName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  tierDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  tierWorkers: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 16,
  },
  priceContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  priceLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 8,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureCheck: {
    color: '#06b6d4',
    fontSize: 16,
    marginRight: 8,
    fontWeight: 'bold',
  },
  featureText: {
    color: '#cbd5e1',
    fontSize: 14,
    flex: 1,
  },
  buttonContainer: {
    gap: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  stripeButton: {
    backgroundColor: '#06b6d4',
  },
  coinbaseButton: {
    backgroundColor: '#1e40af',
  },
  contactButton: {
    backgroundColor: '#475569',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  faqSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
  },
  footer: {
    marginTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 12,
  },
});
