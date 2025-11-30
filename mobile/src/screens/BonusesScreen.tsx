import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuthStore } from '../store';
import { worker } from '../utils/api';
import { format, startOfWeek } from 'date-fns';

const theme = {
  dark: '#0f172a',
  darker: '#020617',
  primary: '#06b6d4',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#1e293b',
  success: '#22c55e',
};

export function BonusesScreen() {
  const { workerId } = useAuthStore();
  const [bonuses, setBonuses] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBonuses();
  }, []);

  const loadBonuses = async () => {
    try {
      if (!workerId) {
        setBonuses({ performanceBonus: 0, referralBonus: 0, attendanceBonus: 0, speedBonus: 0 });
        return;
      }
      const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
      const res = await worker.getBonuses(workerId, weekStart);
      setBonuses(res.data);
    } catch (error) {
      console.error('Load error:', error);
      setBonuses({ performanceBonus: 0, referralBonus: 0, attendanceBonus: 0, speedBonus: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBonuses();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const bonusTypes = [
    { name: 'Performance', amount: bonuses?.performanceBonus || 0, icon: '⭐', desc: 'Quality ratings' },
    { name: 'Referral', amount: bonuses?.referralBonus || 0, icon: '👥', desc: 'Friend sign-ups' },
    { name: 'Attendance', amount: bonuses?.attendanceBonus || 0, icon: '✓', desc: 'Perfect week' },
    { name: 'Speed', amount: bonuses?.speedBonus || 0, icon: '⚡', desc: 'Early completion' },
  ];

  const totalBonus = bonusTypes.reduce((sum, b) => sum + b.amount, 0);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Bonuses This Week</Text>
        <Text style={styles.total}>${totalBonus.toFixed(2)}</Text>
      </View>

      <View style={styles.grid}>
        {bonusTypes.map((bonus) => (
          <View key={bonus.name} style={styles.bonusCard}>
            <Text style={styles.bonusIcon}>{bonus.icon}</Text>
            <Text style={styles.bonusName}>{bonus.name}</Text>
            <Text style={styles.bonusAmount}>${bonus.amount.toFixed(2)}</Text>
            <Text style={styles.bonusDesc}>{bonus.desc}</Text>
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
            bonus="+$25/week"
          />
          <TipCard
            number="2"
            title="5-Star Rating"
            description="Complete jobs with high quality"
            bonus="+$50/week"
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
    backgroundColor: theme.darker,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderBottomWidth: 2,
    borderBottomColor: theme.success,
  },
  headerLabel: {
    fontSize: 16,
    color: theme.textMuted,
  },
  total: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.success,
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
    width: '47%',
    backgroundColor: theme.dark,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.success,
  },
  bonusIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  bonusName: {
    fontSize: 14,
    color: theme.textMuted,
    marginBottom: 4,
  },
  bonusAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.success,
  },
  bonusDesc: {
    fontSize: 11,
    color: theme.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 16,
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: theme.dark,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  tipNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
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
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.text,
  },
  tipDescription: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 2,
  },
  tipBonus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.success,
  },
  spacer: {
    height: 40,
  },
});
