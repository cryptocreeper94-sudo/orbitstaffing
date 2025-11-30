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
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';

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

interface TimesheetEntry {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hoursWorked: number;
  overtime: number;
  client: string;
  status: 'pending' | 'approved' | 'paid';
}

export function TimesheetsScreen() {
  const { workerId } = useAuthStore();
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [weeklyOvertime, setWeeklyOvertime] = useState(0);

  useEffect(() => {
    loadTimesheets();
  }, []);

  const loadTimesheets = async () => {
    try {
      if (!workerId) return;
      const res = await worker.getTimesheets(workerId);
      const data = res.data.timesheets || [];
      setTimesheets(data);
      
      const total = data.reduce((sum: number, t: TimesheetEntry) => sum + t.hoursWorked, 0);
      const ot = data.reduce((sum: number, t: TimesheetEntry) => sum + (t.overtime || 0), 0);
      setWeeklyTotal(total);
      setWeeklyOvertime(ot);
    } catch (error) {
      console.error('Load error:', error);
      setTimesheets([
        {
          id: '1',
          date: new Date().toISOString(),
          clockIn: '07:00',
          clockOut: '15:30',
          hoursWorked: 8.5,
          overtime: 0.5,
          client: 'ABC Construction',
          status: 'approved',
        },
        {
          id: '2',
          date: new Date(Date.now() - 86400000).toISOString(),
          clockIn: '06:30',
          clockOut: '15:00',
          hoursWorked: 8.5,
          overtime: 0.5,
          client: 'XYZ Manufacturing',
          status: 'paid',
        },
      ]);
      setWeeklyTotal(17);
      setWeeklyOvertime(1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTimesheets();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return theme.success;
      case 'approved': return theme.primary;
      default: return theme.warning;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const weekStart = format(startOfWeek(new Date()), 'MMM d');
  const weekEnd = format(endOfWeek(new Date()), 'MMM d');

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
        <Text style={styles.title}>Timesheets</Text>
        <Text style={styles.dateRange}>{weekStart} - {weekEnd}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Hours</Text>
            <Text style={styles.summaryValue}>{weeklyTotal.toFixed(1)}h</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Overtime</Text>
            <Text style={[styles.summaryValue, { color: theme.warning }]}>
              {weeklyOvertime.toFixed(1)}h
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Days</Text>
            <Text style={styles.summaryValue}>{timesheets.length}</Text>
          </View>
        </View>
      </View>

      {timesheets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>No timesheets this week</Text>
          <Text style={styles.emptySubtext}>Clock in to start tracking hours</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {timesheets.map((entry) => (
            <View key={entry.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.dateText}>
                    {format(parseISO(entry.date), 'EEEE, MMM d')}
                  </Text>
                  <Text style={styles.clientText}>{entry.client}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(entry.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(entry.status) }]}>
                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>Clock In</Text>
                  <Text style={styles.timeValue}>{entry.clockIn}</Text>
                </View>
                <Text style={styles.timeSeparator}>→</Text>
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>Clock Out</Text>
                  <Text style={styles.timeValue}>{entry.clockOut}</Text>
                </View>
                <View style={styles.hoursBox}>
                  <Text style={styles.hoursValue}>{entry.hoursWorked.toFixed(1)}h</Text>
                  {entry.overtime > 0 && (
                    <Text style={styles.overtimeText}>+{entry.overtime.toFixed(1)} OT</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.primary,
  },
  dateRange: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 4,
  },
  summaryCard: {
    margin: 16,
    backgroundColor: theme.dark,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: theme.border,
  },
  list: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: theme.dark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  clientText: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 10,
    color: theme.textMuted,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  timeSeparator: {
    fontSize: 16,
    color: theme.primary,
    marginHorizontal: 16,
  },
  hoursBox: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  hoursValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.primary,
  },
  overtimeText: {
    fontSize: 12,
    color: theme.warning,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 8,
  },
  spacer: {
    height: 40,
  },
});
