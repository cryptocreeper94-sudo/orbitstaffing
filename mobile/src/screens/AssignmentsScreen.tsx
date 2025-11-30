import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuthStore } from '../store';
import { assignments } from '../utils/api';
import { format } from 'date-fns';

const theme = {
  dark: '#0f172a',
  darker: '#020617',
  primary: '#06b6d4',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#1e293b',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
};

interface Assignment {
  id: string;
  clientName: string;
  jobTitle: string;
  startTime: string;
  estimatedHours: number;
  hourlyRate: number;
  bonus?: number;
  urgency?: string;
  expiresAt: string;
}

export function AssignmentsScreen() {
  const { workerId } = useAuthStore();
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      if (!workerId) {
        setLoading(false);
        return;
      }
      const res = await assignments.getPending(workerId);
      setPendingAssignments(res.data.assignments || []);
    } catch (error) {
      console.error('Load error:', error);
      setPendingAssignments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAssignments();
  };

  const handleAccept = async (assignmentId: string) => {
    setProcessing(assignmentId);
    try {
      await assignments.accept(assignmentId);
      setPendingAssignments(prev => prev.filter(a => a.id !== assignmentId));
      Alert.alert('Success', 'Shift accepted! Check your schedule.');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to accept shift');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (assignmentId: string) => {
    Alert.alert(
      'Decline Shift',
      'Are you sure you want to decline this shift?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setProcessing(assignmentId);
            try {
              await assignments.reject(assignmentId, 'Declined by worker');
              setPendingAssignments(prev => prev.filter(a => a.id !== assignmentId));
              Alert.alert('Declined', 'Shift has been declined');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to decline');
            } finally {
              setProcessing(null);
            }
          },
        },
      ]
    );
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
        <Text style={styles.title}>Shift Offers</Text>
        <Text style={styles.subtitle}>{pendingAssignments.length} pending</Text>
      </View>

      {pendingAssignments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No pending shifts</Text>
          <Text style={styles.emptySubtext}>Check back soon for new opportunities</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {pendingAssignments.map((assignment) => (
            <View key={assignment.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.clientName}>{assignment.clientName}</Text>
                  <Text style={styles.jobTitle}>{assignment.jobTitle}</Text>
                </View>
                {assignment.urgency && (
                  <View style={styles.urgencyBadge}>
                    <Text style={styles.urgencyText}>{assignment.urgency}</Text>
                  </View>
                )}
              </View>

              <View style={styles.details}>
                <DetailRow icon="📅" label="Date" value={format(new Date(assignment.startTime), 'MMM dd, yyyy')} />
                <DetailRow icon="🕐" label="Time" value={format(new Date(assignment.startTime), 'h:mm a')} />
                <DetailRow icon="⏱️" label="Duration" value={`${assignment.estimatedHours || 8} hours`} />
                <DetailRow icon="💰" label="Rate" value={`$${assignment.hourlyRate}/hr`} />
              </View>

              {assignment.bonus && assignment.bonus > 0 && (
                <View style={styles.bonusBox}>
                  <Text style={styles.bonusText}>🎁 Bonus: ${assignment.bonus}</Text>
                </View>
              )}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.rejectBtn, processing === assignment.id && styles.btnDisabled]}
                  onPress={() => handleReject(assignment.id)}
                  disabled={processing === assignment.id}
                >
                  <Text style={styles.rejectText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.acceptBtn, processing === assignment.id && styles.btnDisabled]}
                  onPress={() => handleAccept(assignment.id)}
                  disabled={processing === assignment.id}
                >
                  {processing === assignment.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.acceptText}>Accept</Text>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.expiresText}>
                Expires: {format(new Date(assignment.expiresAt), 'h:mm a')}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.primary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: theme.dark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  jobTitle: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 2,
  },
  urgencyBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  urgencyText: {
    fontSize: 12,
    color: theme.error,
    fontWeight: 'bold',
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.textMuted,
    width: 70,
  },
  detailValue: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  bonusBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.success,
  },
  bonusText: {
    color: theme.success,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: theme.error,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rejectText: {
    color: theme.error,
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  expiresText: {
    fontSize: 12,
    color: theme.textMuted,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
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
