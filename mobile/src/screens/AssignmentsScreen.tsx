import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuthStore } from '../store';
import { assignments } from '../utils/api';
import { format } from 'date-fns';

export function AssignmentsScreen() {
  const { workerId } = useAuthStore();
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      if (!workerId) return;
      const res = await assignments.getPending(workerId);
      setPendingAssignments(res.data.assignments || []);
    } catch (error) {
      console.error('Load error:', error);
      Alert.alert('Error', 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (acceptanceId: string) => {
    setProcessing(acceptanceId);
    try {
      await assignments.accept(acceptanceId);
      setPendingAssignments(
        pendingAssignments.filter((a) => a.id !== acceptanceId)
      );
      Alert.alert('Success', 'Shift accepted ✓');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to accept');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (acceptanceId: string) => {
    Alert.prompt(
      'Reject Shift',
      'Why are you declining?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Submit',
          onPress: (reason) => submitReject(acceptanceId, reason || ''),
        },
      ],
      'plain-text'
    );
  };

  const submitReject = async (acceptanceId: string, reason: string) => {
    setProcessing(acceptanceId);
    try {
      await assignments.reject(acceptanceId, reason);
      setPendingAssignments(
        pendingAssignments.filter((a) => a.id !== acceptanceId)
      );
      Alert.alert('Declined', 'Shift declined');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessing(null);
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
      <View style={styles.header}>
        <Text style={styles.title}>Shift Offers</Text>
        <Text style={styles.subtitle}>
          {pendingAssignments.length} pending
        </Text>
      </View>

      {pendingAssignments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No pending shifts</Text>
          <Text style={styles.emptySubtext}>
            Check back soon for new opportunities
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {pendingAssignments.map((assignment) => (
            <View key={assignment.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.clientName}>{assignment.clientName}</Text>
                  <Text style={styles.jobTitle}>{assignment.jobTitle}</Text>
                </View>
                <View style={styles.urgency}>
                  <Text style={styles.urgencyText}>
                    {assignment.urgency || 'Normal'}
                  </Text>
                </View>
              </View>

              <View style={styles.details}>
                <DetailItem icon="📅" label="Date" value={format(new Date(assignment.startTime), 'MMM dd')} />
                <DetailItem icon="🕐" label="Time" value={format(new Date(assignment.startTime), 'h:mm a')} />
                <DetailItem icon="⏱️" label="Duration" value={`${assignment.estimatedHours || 8}h`} />
                <DetailItem icon="💰" label="Rate" value={`$${assignment.hourlyRate}/hr`} />
              </View>

              {assignment.bonus && (
                <View style={styles.bonusBox}>
                  <Text style={styles.bonusText}>
                    🎁 Bonus: ${assignment.bonus}
                  </Text>
                </View>
              )}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.rejectBtn,
                    processing === assignment.id && styles.btnDisabled,
                  ]}
                  onPress={() => handleReject(assignment.id)}
                  disabled={processing === assignment.id}
                >
                  <Text style={styles.rejectText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.acceptBtn,
                    processing === assignment.id && styles.btnDisabled,
                  ]}
                  onPress={() => handleAccept(assignment.id)}
                  disabled={processing === assignment.id}
                >
                  <Text style={styles.acceptText}>
                    {processing === assignment.id ? '...' : 'Accept'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.expiresText}>
                Expires: {format(new Date(assignment.expiresAt), 'h:mm a')}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function DetailItem({ icon, label, value }: any) {
  return (
    <View style={styles.detailItem}>
      <Text>{icon}</Text>
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
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
    paddingVertical: 16,
    borderBottomColor: '#06b6d4',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderColor: '#06b6d4',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  jobTitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  urgency: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  details: {
    gap: 8,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  bonusBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  bonusText: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#06b6d4',
    paddingVertical: 12,
    borderRadius: 8,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#ef4444',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
  },
  acceptText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  rejectText: {
    color: '#ef4444',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  expiresText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ccc',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});
