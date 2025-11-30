import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuthStore, useGPSStore } from '../store';
import { worker } from '../utils/api';
import { format } from 'date-fns';

const theme = {
  dark: '#0f172a',
  darker: '#020617',
  primary: '#06b6d4',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#1e293b',
  success: '#22c55e',
  warning: '#f59e0b',
};

export function DashboardScreen({ navigation }: any) {
  const { user, workerId } = useAuthStore();
  const { isClockedIn } = useGPSStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!workerId) {
        setStats({
          weeklyEarnings: 0,
          hoursWorked: 0,
          shiftsCompleted: 0,
          rating: 4.8,
        });
        return;
      }
      
      const weekStart = format(new Date(), 'yyyy-MM-dd');
      const res = await worker.getBonuses(workerId, weekStart);
      setStats(res.data);
    } catch (error) {
      console.error('Load error:', error);
      setStats({
        weeklyEarnings: 0,
        hoursWorked: 0,
        shiftsCompleted: 0,
        rating: 4.8,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

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
        <View>
          <Text style={styles.greeting}>Hello, {user?.firstName || 'Worker'}</Text>
          <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>
        </View>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🪐</Text>
        </View>
      </View>

      <View style={styles.clockStatus}>
        <View style={[styles.statusDot, { backgroundColor: isClockedIn ? theme.success : theme.textMuted }]} />
        <Text style={styles.statusText}>
          {isClockedIn ? 'Currently Clocked In' : 'Not Clocked In'}
        </Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('GPSClockIn')}
        >
          <Text style={styles.actionIcon}>📍</Text>
          <Text style={styles.actionText}>{isClockedIn ? 'Clock Out' : 'Clock In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Assignments')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>Shifts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Bonuses')}
        >
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionText}>Bonuses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Availability')}
        >
          <Text style={styles.actionIcon}>📅</Text>
          <Text style={styles.actionText}>Schedule</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${stats?.weeklyEarnings || '0'}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.hoursWorked || '0'}h</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.shiftsCompleted || '0'}</Text>
            <Text style={styles.statLabel}>Shifts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.rating || '4.8'}⭐</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerLogo}>🪐</Text>
        <Text style={styles.footerText}>Powered by ORBIT Staffing OS</Text>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },
  date: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 4,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.dark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.primary,
  },
  logoEmoji: {
    fontSize: 28,
  },
  clockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: theme.dark,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: theme.dark,
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.primary,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    color: theme.text,
    fontWeight: '600',
    fontSize: 14,
  },
  statsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerLogo: {
    fontSize: 32,
    marginBottom: 8,
  },
  footerText: {
    color: theme.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  spacer: {
    height: 20,
  },
});
