import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { BRANDING, THEME } from '../config/branding';

interface Shift {
  id: string;
  clientName: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'in_progress' | 'completed';
}

interface Earnings {
  currentWeek: number;
  lastPaycheck: number;
  ytdTotal: number;
}

export default function DashboardScreen() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [earnings, setEarnings] = useState<Earnings>({
    currentWeek: 0,
    lastPaycheck: 0,
    ytdTotal: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [workerName, setWorkerName] = useState('Worker');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      
      const response = await fetch(`${BRANDING.apiBaseUrl}/worker/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setShifts(data.upcomingShifts || []);
        setEarnings(data.earnings || { currentWeek: 0, lastPaycheck: 0, ytdTotal: 0 });
        setWorkerName(data.workerName || 'Worker');
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return THEME.colors.primary;
      case 'in_progress':
        return THEME.colors.success;
      case 'completed':
        return THEME.colors.textSecondary;
      default:
        return THEME.colors.textSecondary;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadData} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{workerName}</Text>
      </View>

      <View style={styles.earningsContainer}>
        <Text style={styles.sectionTitle}>Earnings Overview</Text>
        <View style={styles.earningsGrid}>
          <View style={styles.earningCard}>
            <Ionicons name="calendar" size={24} color={BRANDING.primaryColor} />
            <Text style={styles.earningLabel}>This Week</Text>
            <Text style={styles.earningAmount}>{formatCurrency(earnings.currentWeek)}</Text>
          </View>
          <View style={styles.earningCard}>
            <Ionicons name="wallet" size={24} color={BRANDING.primaryColor} />
            <Text style={styles.earningLabel}>Last Paycheck</Text>
            <Text style={styles.earningAmount}>{formatCurrency(earnings.lastPaycheck)}</Text>
          </View>
          <View style={styles.earningCard}>
            <Ionicons name="trending-up" size={24} color={BRANDING.primaryColor} />
            <Text style={styles.earningLabel}>YTD Total</Text>
            <Text style={styles.earningAmount}>{formatCurrency(earnings.ytdTotal)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.shiftsContainer}>
        <Text style={styles.sectionTitle}>Upcoming Shifts</Text>
        {shifts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={THEME.colors.textSecondary} />
            <Text style={styles.emptyText}>No upcoming shifts</Text>
            <Text style={styles.emptySubtext}>Check back later for new assignments</Text>
          </View>
        ) : (
          shifts.map((shift) => (
            <TouchableOpacity key={shift.id} style={styles.shiftCard}>
              <View style={styles.shiftHeader}>
                <Text style={styles.clientName}>{shift.clientName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shift.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(shift.status) }]}>
                    {shift.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.shiftDetails}>
                <View style={styles.shiftRow}>
                  <Ionicons name="location-outline" size={16} color={THEME.colors.textSecondary} />
                  <Text style={styles.shiftText}>{shift.location}</Text>
                </View>
                <View style={styles.shiftRow}>
                  <Ionicons name="calendar-outline" size={16} color={THEME.colors.textSecondary} />
                  <Text style={styles.shiftText}>{formatDate(shift.date)}</Text>
                </View>
                <View style={styles.shiftRow}>
                  <Ionicons name="time-outline" size={16} color={THEME.colors.textSecondary} />
                  <Text style={styles.shiftText}>{shift.startTime} - {shift.endTime}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    padding: THEME.spacing.lg,
    backgroundColor: BRANDING.primaryColor,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  earningsContainer: {
    padding: THEME.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  earningsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningCard: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginHorizontal: THEME.spacing.xs,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  earningLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.xs,
    textAlign: 'center',
  },
  earningAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginTop: THEME.spacing.xs,
  },
  shiftsContainer: {
    padding: THEME.spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: THEME.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
    marginTop: THEME.spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.xs,
  },
  shiftCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  statusBadge: {
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  shiftDetails: {
    gap: THEME.spacing.xs,
  },
  shiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  shiftText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
});
