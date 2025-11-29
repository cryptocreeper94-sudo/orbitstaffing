import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { ChevronRight, Send, MessageSquare } from 'lucide-react-native';

export default function AboutScreen() {
  const [activeTab, setActiveTab] = useState<'about' | 'feedback'>('about');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert('Empty feedback', 'Please share your thoughts before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3001/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: feedbackText,
          type: 'worker_feedback',
        }),
      });

      if (response.ok) {
        Alert.alert('Thanks!', 'Your feedback helps us improve.');
        setFeedbackText('');
      } else {
        Alert.alert('Error', 'Failed to submit feedback. Try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed. Check your internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ORBIT Staffing</Text>
        <Text style={styles.subtitle}>Built by staffing industry veterans</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'about' && styles.activeTab]}
          onPress={() => setActiveTab('about')}
        >
          <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
            About Us
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'feedback' && styles.activeTab]}
          onPress={() => setActiveTab('feedback')}
        >
          <Text style={[styles.tabText, activeTab === 'feedback' && styles.activeTabText]}>
            Feedback
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'about' ? (
        <View style={styles.content}>
          {/* Mission */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.sectionText}>
              We've spent years in the staffing industry. We know the frustration:
              inconsistent pay schedules, unreliable managers, lack of loyalty rewards,
              and feeling like just a number.
            </Text>
            <Text style={styles.sectionText}>
              ORBIT is built to change that. You deserve better.
            </Text>
          </View>

          {/* The Problem */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>We Understand Your Pain</Text>
            <View style={styles.problemList}>
              <ProblemItem icon="💸" text="Waiting 2 weeks to get paid—when you need it now" />
              <ProblemItem icon="📱" text="No visibility into your earnings until payday" />
              <ProblemItem icon="😞" text="Loyalty means nothing—managers forget your name" />
              <ProblemItem icon="⏰" text="Unreliable schedules and last-minute cancellations" />
              <ProblemItem icon="🚫" text="No incentive to show up if the money's the same" />
            </View>
          </View>

          {/* The Solution */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Solution</Text>
            <FeatureCard
              icon="💳"
              title="Get Paid Instantly"
              description="Branded debit card through Stripe. Your pay, your card, your rules."
            />
            <FeatureCard
              icon="📊"
              title="Real-Time Earnings"
              description="See every dollar before it hits your card. No surprises."
            />
            <FeatureCard
              icon="🏆"
              title="Loyalty Rewards"
              description="Show up reliably. Earn $480–$5,000/year in loyalty bonuses."
            />
            <FeatureCard
              icon="💰"
              title="Weekly Bonuses"
              description="Consistent performance earns $35/week after 2 perfect weeks."
            />
            <FeatureCard
              icon="🔒"
              title="Verified GPS Check-In"
              description="Fair verification. Biometric secure. No guessing."
            />
            <FeatureCard
              icon="💬"
              title="Direct Communication"
              description="Message your manager anytime. Straight answers, no games."
            />
          </View>

          {/* Who We Are */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Who Built This</Text>
            <Text style={styles.sectionText}>
              The ORBIT team includes:
            </Text>
            <View style={styles.teamList}>
              <TeamMember
                role="CEO"
                background="10+ years as staffing operations manager, scaling teams from 5 to 500+ workers."
              />
              <TeamMember
                role="Tech Lead"
                background="Built payment systems and compliance software for 3 major staffing platforms."
              />
              <TeamMember
                role="Workers' Advocate"
                background="Former temp worker. Knows the struggle. Designed bonuses to actually matter."
              />
            </View>
          </View>

          {/* Why We're Different */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why We're Different</Text>
            <DifferenceItem text="We actually understand your frustration—we've been in your shoes." />
            <DifferenceItem text="We profit when you succeed, not by cutting your pay." />
            <DifferenceItem text="Transparency first: see every fee, every bonus, every calculation." />
            <DifferenceItem text="We listen. Your feedback directly shapes product updates." />
            <DifferenceItem text="We're scaling fast: 15+ franchise partners already using ORBIT." />
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Let's Talk</Text>
            <Text style={styles.sectionText}>
              Questions, concerns, or just want to chat?
            </Text>
            <TouchableOpacity style={styles.contactButton}>
              <MessageSquare color="#ffffff" size={20} />
              <Text style={styles.contactButtonText}>Send Feedback</Text>
            </TouchableOpacity>
            <Text style={styles.contactEmail}>support@orbitstaffing.io</Text>
          </View>
        </View>
      ) : (
        <View style={styles.feedbackContent}>
          <Text style={styles.feedbackTitle}>We're Listening</Text>
          <Text style={styles.feedbackSubtitle}>
            Your feedback directly shapes ORBIT. If something's not working, tell us.
            If you have an idea, we want to hear it.
          </Text>

          <TextInput
            style={styles.feedbackInput}
            placeholder="Tell us what you think..."
            placeholderTextColor="#999999"
            multiline
            numberOfLines={6}
            value={feedbackText}
            onChangeText={setFeedbackText}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmitFeedback}
            disabled={isSubmitting}
          >
            <Send color="#ffffff" size={20} />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Text>
          </TouchableOpacity>

          <View style={styles.feedbackNote}>
            <Text style={styles.feedbackNoteText}>
              💡 Tip: Be specific. "Pay is delayed" is great. "App is slow" is better
              with "when I tap Check-In."
            </Text>
          </View>

          <View style={styles.recentFeedback}>
            <Text style={styles.recentTitle}>Recent Updates Based on Feedback</Text>
            <FeedbackItem title="GPS Verification" desc="Added offline mode after users reported lost signals on job sites." />
            <FeedbackItem title="Bonus Dashboard" desc="Real-time progress tracking—workers asked for visibility." />
            <FeedbackItem title="Instant Notifications" desc="Mobile alerts when bonuses are earned, not just weekly summaries." />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function ProblemItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.problemItem}>
      <Text style={styles.problemIcon}>{icon}</Text>
      <Text style={styles.problemText}>{text}</Text>
    </View>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
      <ChevronRight color="#0ea5e9" size={20} />
    </View>
  );
}

function TeamMember({ role, background }: { role: string; background: string }) {
  return (
    <View style={styles.teamMember}>
      <Text style={styles.teamRole}>{role}</Text>
      <Text style={styles.teamBackground}>{background}</Text>
    </View>
  );
}

function DifferenceItem({ text }: { text: string }) {
  return (
    <View style={styles.differenceItem}>
      <Text style={styles.differenceCheck}>✓</Text>
      <Text style={styles.differenceText}>{text}</Text>
    </View>
  );
}

function FeedbackItem({ title, desc }: { title: string; desc: string }) {
  return (
    <View style={styles.feedbackHistoryItem}>
      <Text style={styles.feedbackHistoryTitle}>{title}</Text>
      <Text style={styles.feedbackHistoryDesc}>{desc}</Text>
    </View>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0c63e4',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0ea5e9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#0ea5e9',
  },
  content: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  problemList: {
    gap: 12,
  },
  problemItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  problemIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  problemText: {
    flex: 1,
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  featureDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  teamList: {
    gap: 16,
  },
  teamMember: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  teamRole: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0ea5e9',
    marginBottom: 4,
  },
  teamBackground: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  differenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  differenceCheck: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '700',
  },
  differenceText: {
    flex: 1,
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  contactButton: {
    flexDirection: 'row',
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  contactEmail: {
    fontSize: 12,
    color: '#999999',
    marginTop: 12,
    textAlign: 'center',
  },
  feedbackContent: {
    padding: 20,
  },
  feedbackTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  feedbackSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 20,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000000',
    minHeight: 120,
    marginBottom: 12,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  feedbackNote: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#ca8a04',
  },
  feedbackNoteText: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 16,
  },
  recentFeedback: {
    marginTop: 24,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  feedbackHistoryItem: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  feedbackHistoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  feedbackHistoryDesc: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    lineHeight: 16,
  },
});
