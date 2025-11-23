import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../api/auth';
import { useMyAssignments } from '../api/assignments';
import { getSandboxMode } from '../utils/env';
import { isBiometricEnabled } from '../utils/biometric';

export default function HomeScreen({ navigation }: any) {
  const { user, isLoading: userLoading } = useAuth();
  const { data: assignments, isLoading: assignmentsLoading } = useMyAssignments();
  const [sandboxMode, setSandboxMode] = React.useState<'sandbox' | 'live'>('live');
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);

  useEffect(() => {
    (async () => {
      const mode = await getSandboxMode();
      setSandboxMode(mode);
      const bio = await isBiometricEnabled();
      setBiometricEnabled(bio);
    })();
  }, []);

  const activeAssignments = assignments?.filter(a => a.status === 'assigned' || a.status === 'confirmed') || [];
  const completedAssignments = assignments?.filter(a => a.status === 'completed') || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Sandbox Mode Badge */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome, {user?.firstName || 'Worker'}
            </Text>
            <Text style={styles.subtitle}>ORBIT</Text>
          </View>
          {sandboxMode === 'sandbox' && (
            <View style={styles.sandboxBadge}>
              <Text style={styles.sandboxText}>TEST MODE</Text>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.stat, styles.activeCard]}>
            <Text style={styles.statLabel}>Active Jobs</Text>
            <Text style={styles.statValue}>{activeAssignments.length}</Text>
          </View>
          <View style={[styles.stat, styles.completedCard]}>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>{completedAssignments.length}</Text>
          </View>
        </View>

        {/* Active Assignments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Assignments</Text>
          
          {assignmentsLoading ? (
            <Text style={styles.loadingText}>Loading assignments...</Text>
          ) : activeAssignments.length > 0 ? (
            activeAssignments.map(assignment => (
              <TouchableOpacity
                key={assignment.id}
                style={styles.assignmentCard}
                onPress={() => navigation.navigate('AssignmentDetail', { id: assignment.id })}
              >
                <View style={styles.assignmentHeader}>
                  <Text style={styles.jobTitle}>{assignment.jobTitle}</Text>
                  <View style={[styles.badge, 
                    assignment.status === 'confirmed' && styles.confirmedBadge,
                    assignment.status === 'assigned' && styles.assignedBadge
                  ]}>
                    <Text style={styles.badgeText}>
                      {assignment.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.clientName}>{assignment.clientName}</Text>
                <Text style={styles.location}>📍 {assignment.location}</Text>
                
                <View style={styles.assignmentDetails}>
                  <Text style={styles.detailText}>
                    📅 {new Date(assignment.startDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.detailText}>
                    ⏰ {assignment.startTime} - {assignment.endTime}
                  </Text>
                  <Text style={styles.detailText}>
                    💰 ${assignment.hourlyRate}/hr
                  </Text>
                </View>

                {assignment.status === 'assigned' && !assignment.confirmedByWorker && (
                  <View style={styles.actionPrompt}>
                    <Text style={styles.actionText}>⚠️ Confirm this assignment</Text>
                  </View>
                )}

                {assignment.status === 'confirmed' && (
                  <TouchableOpacity 
                    style={styles.checkInButton}
                    onPress={() => navigation.navigate('GPSCheckIn', { assignmentId: assignment.id })}
                  >
                    <Text style={styles.checkInText}>📍 Check In</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noAssignmentsCard}>
              <Text style={styles.noAssignmentsText}>No active assignments right now</Text>
              <Text style={styles.noAssignmentsSubtext}>Check back soon or contact support</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.actionButtonText}>👤 View Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('WorkOrders')}
          >
            <Text style={styles.actionButtonText}>📋 View Work Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.actionButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Test Mode Info */}
        {sandboxMode === 'sandbox' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>ℹ️ Sandbox Mode</Text>
            <Text style={styles.infoText}>
              You're using test data. All features work normally. Switch to Live mode in Settings when ready.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  sandboxBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sandboxText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78350f',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  stat: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  activeCard: {
    backgroundColor: '#dbeafe',
  },
  completedCard: {
    backgroundColor: '#dcfce7',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  assignmentCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confirmedBadge: {
    backgroundColor: '#dcfce7',
  },
  assignedBadge: {
    backgroundColor: '#dbeafe',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1f2937',
  },
  clientName: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 10,
  },
  assignmentDetails: {
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#666666',
  },
  actionPrompt: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
  },
  actionText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
  },
  checkInButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#0ea5e9',
    borderRadius: 6,
  },
  checkInText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  noAssignmentsCard: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    alignItems: 'center',
  },
  noAssignmentsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  noAssignmentsSubtext: {
    fontSize: 13,
    color: '#999999',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  infoBox: {
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fef08a',
    borderRadius: 8,
    marginBottom: 40,
    borderLeftWidth: 4,
    borderLeftColor: '#ca8a04',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350f',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 16,
  },
});
