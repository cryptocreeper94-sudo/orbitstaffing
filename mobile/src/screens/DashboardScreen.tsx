import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../store';
import { worker } from '../utils/api';
import { format, addDays } from 'date-fns';

export function DashboardScreen({ navigation }: any) {
  const { companyName, workerId } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [bonuses, setBonuses] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!workerId) return;
      const profileRes = await worker.getProfile(workerId);
      setProfile(profileRes.data);

      const weekStart = format(new Date(), 'yyyy-MM-dd');
      const bonusRes = await worker.getBonuses(workerId, weekStart);
      setBonuses(bonusRes.data);
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

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {profile?.firstName || 'Worker'}</Text>
          <Text style={styles.company}>{companyName || 'ORBIT Staffing'}</Text>
        </View>
        <Image source={require('../assets/orbit-logo.png')} style={styles.headerLogo} />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('GPSClockIn')}
          >
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.actionText}>Clock In</Text>
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
            <Text style={styles.actionIcon}>🎁</Text>
            <Text style={styles.actionText}>Bonuses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Availability')}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>Calendar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Earnings</Text>
            <Text style={styles.statValue}>${bonuses?.weeklyEarnings || '0'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Bonuses</Text>
            <Text style={styles.statValue}>${bonuses?.totalBonuses || '0'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Hours</Text>
            <Text style={styles.statValue}>{bonuses?.hoursWorked || '0'}h</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Rating</Text>
            <Text style={styles.statValue}>{profile?.rating || '4.8'}⭐</Text>
          </View>
        </View>
      </View>

      {/* Hallmark */}
      <View style={styles.section}>
        <Image source={require('../assets/orbit-verification-badge.png')} style={styles.hallmark} />
        <Text style={styles.hallmarkText}>Powered by ORBIT Staffing OS</Text>
        <Text style={styles.hallmarkId}>Asset #{profile?.assetNumber || 'N/A'}</Text>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomColor: '#06b6d4',
    borderBottomWidth: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  company: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  headerLogo: {
    width: 60,
    height: 60,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    borderColor: '#06b6d4',
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    color: '#ccc',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderColor: '#06b6d4',
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  hallmark: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginVertical: 16,
  },
  hallmarkText: {
    textAlign: 'center',
    color: '#06b6d4',
    fontWeight: 'bold',
    fontSize: 14,
  },
  hallmarkId: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  spacer: {
    height: 40,
  },
});
