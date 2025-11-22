import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { CreditCard, Zap, TrendingUp, Lock, Bitcoin } from 'lucide-react-native';

type PaymentMethod = 'stripe_card' | 'direct_deposit' | 'crypto' | 'check';

export default function PaymentsScreen() {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('stripe_card');
  const [cryptoEnabled, setCryptoEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMethodChange = (method: PaymentMethod) => {
    if (method === 'crypto' && !cryptoEnabled) {
      Alert.alert(
        'Coming Soon',
        'Crypto payments are coming in the next update. Be the first to enable it!'
      );
      return;
    }
    setSelectedMethod(method);
  };

  const handleSaveMethod = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: selectedMethod }),
      });

      if (response.ok) {
        Alert.alert('Saved!', `Payment method updated to ${formatMethodName(selectedMethod)}`);
      } else {
        Alert.alert('Error', 'Failed to save payment method.');
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatMethodName = (method: PaymentMethod) => {
    const names: Record<PaymentMethod, string> = {
      stripe_card: 'ORBIT Card',
      direct_deposit: 'Direct Deposit',
      crypto: 'Crypto Wallet',
      check: 'Check',
    };
    return names[method];
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Payment Methods</Text>
        <Text style={styles.subtitle}>Choose how you receive your earnings</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <StatCard icon="💰" label="This Week" value="$840.50" />
        <StatCard icon="📅" label="Next Pay" value="Friday" />
      </View>

      {/* ORBIT Card - Featured */}
      <View style={styles.featuredSection}>
        <View style={styles.featuredBadge}>
          <Text style={styles.badgeText}>⭐ RECOMMENDED</Text>
        </View>
        <PaymentOptionCard
          icon="💳"
          title="ORBIT Card"
          description="Instant access to your earnings. White-labeled debit card by Stripe."
          benefits={['Instant transfers', 'No hidden fees', 'Mobile wallet ready', 'Contactless payments']}
          isSelected={selectedMethod === 'stripe_card'}
          onPress={() => handleMethodChange('stripe_card')}
          featured
        />
        <View style={styles.cardDetails}>
          <Text style={styles.detailsTitle}>How It Works</Text>
          <DetailItem
            icon="⚡"
            title="Instant Access"
            desc="Money available in minutes, not days. Your pay, your card, your rules."
          />
          <DetailItem
            icon="🔒"
            title="Secure & Verified"
            desc="Stripe-powered security. Your data encrypted. Industry standard."
          />
          <DetailItem
            icon="🌍"
            title="Use Anywhere"
            desc="ATM withdrawals, online purchases, contactless—your choice."
          />
          <DetailItem
            icon="💯"
            title="Transparent Fees"
            desc="$0 activation. $0 monthly. Pay only $2.50 if you use non-network ATM."
          />
        </View>
      </View>

      {/* Other Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other Options</Text>

        <PaymentOptionCard
          icon="🏦"
          title="Direct Deposit"
          description="Traditional bank transfer. Arrives in 1-2 business days."
          benefits={['Free', 'No fees', 'Direct to any bank']}
          isSelected={selectedMethod === 'direct_deposit'}
          onPress={() => handleMethodChange('direct_deposit')}
        />

        <PaymentOptionCard
          icon="🪙"
          title="Crypto (Beta)"
          description="Get paid in Bitcoin or Ethereum. Coming next update."
          benefits={['Instant settlement', 'Global access', 'Future-proof earnings']}
          isSelected={selectedMethod === 'crypto'}
          onPress={() => handleMethodChange('crypto')}
          disabled
        />

        <PaymentOptionCard
          icon="📮"
          title="Check"
          description="Traditional paper check. Slow but reliable."
          benefits={['$3.50 fee', 'Mailed in 5-7 days']}
          isSelected={selectedMethod === 'check'}
          onPress={() => handleMethodChange('check')}
        />
      </View>

      {/* FAQ Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked</Text>

        <FAQItem
          q="Is my money safe on ORBIT Card?"
          a="Yes. Stripe handles security. FDIC insured up to $250k. Encrypted transactions. Zero fraud liability."
        />
        <FAQItem
          q="What if I lose my card?"
          a="Instant freezing via app. Replacement shipped in 3-5 days. Your balance stays safe."
        />
        <FAQItem
          q="Can I switch payment methods anytime?"
          a="Absolutely. Change anytime in settings. Takes effect on next pay cycle."
        />
        <FAQItem
          q="Are there hidden fees?"
          a="No. We believe in transparency. Only fee: $2.50 for out-of-network ATM withdrawals."
        />
      </View>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveMethod}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : `Use ${formatMethodName(selectedMethod)}`}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacing} />
    </ScrollView>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function PaymentOptionCard({
  icon,
  title,
  description,
  benefits,
  isSelected,
  onPress,
  featured = false,
  disabled = false,
}: {
  icon: string;
  title: string;
  description: string;
  benefits: string[];
  isSelected: boolean;
  onPress: () => void;
  featured?: boolean;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.paymentCard,
        isSelected && styles.selectedCard,
        featured && styles.featuredCard,
        disabled && styles.disabledCard,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </View>
      <View style={styles.benefitsList}>
        {benefits.map((benefit, idx) => (
          <Text key={idx} style={styles.benefit}>
            ✓ {benefit}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );
}

function DetailItem({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <View style={styles.detailContent}>
        <Text style={styles.detailTitle}>{title}</Text>
        <Text style={styles.detailDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.faqQuestion}>
        <Text style={styles.faqQ}>{q}</Text>
        <Text style={styles.faqToggle}>{expanded ? '−' : '+'}</Text>
      </View>
      {expanded && <Text style={styles.faqAnswer}>{a}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f0f9ff',
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0c63e4',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
    marginTop: 4,
  },
  featuredSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78350f',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  paymentCard: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  selectedCard: {
    borderColor: '#0ea5e9',
    backgroundColor: '#f0f9ff',
  },
  featuredCard: {
    borderColor: '#0ea5e9',
    backgroundColor: '#f0f9ff',
  },
  disabledCard: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  cardDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  benefitsList: {
    gap: 6,
  },
  benefit: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  cardDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  detailIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  detailDesc: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
    lineHeight: 16,
  },
  faqItem: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQ: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  faqToggle: {
    fontSize: 18,
    color: '#0ea5e9',
    fontWeight: '700',
  },
  faqAnswer: {
    fontSize: 12,
    color: '#666666',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    lineHeight: 16,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  saveButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  spacing: {
    height: 40,
  },
});
