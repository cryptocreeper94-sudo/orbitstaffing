import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../store';
import { worker } from '../utils/api';
import { format, startOfWeek } from 'date-fns';

export function BonusesScreen() {
  const { workerId } = useAuthStore();
  const [bonuses, setBonuses] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBonuses();
  }, []);

  const loadBonuses = async () => {
    try {
      if (!workerId) return;
      const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
      const res = await worker.getBonuses(workerId, weekStart);
      setBonuses(res.data);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  const bonusTypes = [
    { name: 'Performance', amount: bonuses?.performanceBonus || 0, icon: '⭐' },
    { name: 'Referral', amount: bonuses?.referralBonus || 0, icon: '👥' },
    { name: 'Attendance', amount: bonuses?.attendanceBonus || 0, icon: '✓' },
    { name: 'Speed', amount: bonuses?.speedBonus || 0, icon: '⚡' },
  ];

  const totalBonus = bonusTypes.reduce((sum, b) => sum + b.amount, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bonuses This Week</Text>
        <Text style={styles.total}>${totalBonus.toFixed(2)}</Text>
      </View>

      <View style={styles.grid}>
        {bonusTypes.map((bonus) => (
          <View key={bonus.name} style={styles.bonusCard}>
            <Text style={styles.bonusIcon}>{bonus.icon}</Text>
            <Text style={styles.bonusName}>{bonus.name}</Text>
            <Text style={styles.bonusAmount}>${bonus.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How to Earn More</Text>
        <View style={styles.tipsContainer}>
          <TipCard
            number="1"
            title="Perfect Attendance"
            description="Show up on time for all shifts"
            bonus="+$25"
          />
          <TipCard
            number="2"
            title="5-Star Rating"
            description="Complete jobs with high quality"
            bonus="+$50"
          />
          <TipCard
            number="3"
            title="Refer a Friend"
            description="Get $100 for each worker you refer"
            bonus="+$100"
          />
          <TipCard
            number="4"
            title="Fast Completion"
            description="Finish jobs before deadline"
            bonus="+$10/job"
          />
        </View>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

function TipCard({ number, title, description, bonus }: any) {
  return (
    <View style={styles.tipCard}>
      <View style={styles.tipNumber}>
        <Text style={styles.tipNumberText}>{number}</Text>
      </View>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{title}</Text>
        <Text style={styles.tipDescription}>{description}</Text>
      </View>
      <Text style={styles.tipBonus}>{bonus}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderBottomColor: '#10b981',
    borderBottomWidth: 2,
  },
  title: {
    fontSize: 20,
    color: '#888',
  },
  total: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  bonusCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    borderColor: '#10b981',
    borderWidth: 1,
  },
  bonusIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  bonusName: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  bonusAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#06b6d4',
    marginBottom: 12,
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderColor: '#06b6d4',
    borderWidth: 1,
  },
  tipNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  tipDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  tipBonus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  spacer: {
    height: 40,
  },
});
