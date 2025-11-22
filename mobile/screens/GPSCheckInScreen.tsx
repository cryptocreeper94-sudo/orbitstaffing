import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useCheckInGPS, calculateDistance } from '../api/gps';
import { useAssignmentDetails } from '../api/assignments';
import * as Location from 'expo-location';

export default function GPSCheckInScreen({ route, navigation }: any) {
  const { assignmentId } = route.params;
  const { data: assignment } = useAssignmentDetails(assignmentId);
  const checkInMutation = useCheckInGPS();
  
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [withinGeofence, setWithinGeofence] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Best });
      setCurrentLocation(location.coords);

      if (assignment) {
        const dist = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          assignment.latitude,
          assignment.longitude
        );
        setDistance(dist);
        setWithinGeofence(dist <= 250 * 0.3048); // 250 feet in meters
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please enable location services.');
    }
  };

  const handleCheckIn = async () => {
    if (!assignment || !currentLocation) return;

    setLoading(true);
    try {
      await checkInMutation.mutateAsync({
        assignmentId,
        jobSiteLat: assignment.latitude,
        jobSiteLon: assignment.longitude,
      });

      Alert.alert('Check-In Successful', 'Your GPS location has been verified.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Check-In Failed', 'There was an error checking you in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!assignment) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading assignment...</Text>
      </SafeAreaView>
    );
  }

  const distanceText = distance !== null 
    ? (distance / 1000).toFixed(2) + ' km' 
    : 'Calculating...';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>GPS Check-In</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Job Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Job Details</Text>
          <Text style={styles.jobTitle}>{assignment.jobTitle}</Text>
          <Text style={styles.clientName}>{assignment.clientName}</Text>
          <Text style={styles.location}>📍 {assignment.location}</Text>
        </View>

        {/* GPS Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Location</Text>
          
          {currentLocation ? (
            <>
              <View style={styles.coordinateBox}>
                <Text style={styles.coordinateLabel}>Latitude</Text>
                <Text style={styles.coordinateValue}>{currentLocation.latitude.toFixed(6)}</Text>
              </View>
              <View style={styles.coordinateBox}>
                <Text style={styles.coordinateLabel}>Longitude</Text>
                <Text style={styles.coordinateValue}>{currentLocation.longitude.toFixed(6)}</Text>
              </View>
              <View style={styles.coordinateBox}>
                <Text style={styles.coordinateLabel}>Accuracy</Text>
                <Text style={styles.coordinateValue}>{currentLocation.accuracy?.toFixed(1) || 'N/A'} m</Text>
              </View>
            </>
          ) : (
            <Text style={styles.loadingText}>Getting your location...</Text>
          )}
        </View>

        {/* Distance Check */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Distance to Job Site</Text>
          
          <View style={[styles.distanceBox, withinGeofence && styles.withinGeofence]}>
            <Text style={styles.distanceValue}>{distanceText}</Text>
            {withinGeofence ? (
              <Text style={styles.withinGeofenceText}>✓ Within geofence (250 feet)</Text>
            ) : (
              <Text style={styles.outsideGeofenceText}>⚠️ Outside geofence (250 feet)</Text>
            )}
          </View>

          <Text style={styles.geofenceInfo}>
            You must be within 250 feet (76 meters) of the job site to check in.
          </Text>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={getLocation}
          disabled={loading}
        >
          <Text style={styles.refreshButtonText}>🔄 Refresh Location</Text>
        </TouchableOpacity>

        {/* Check-In Button */}
        <TouchableOpacity 
          style={[
            styles.checkInButton,
            (!withinGeofence || loading) && styles.checkInButtonDisabled
          ]}
          onPress={handleCheckIn}
          disabled={!withinGeofence || loading}
        >
          <Text style={styles.checkInButtonText}>
            {loading ? 'Checking In...' : '✓ Check In'}
          </Text>
        </TouchableOpacity>

        {!withinGeofence && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ Not At Job Site</Text>
            <Text style={styles.warningText}>
              Move closer to the job site to check in. Your GPS location must be within the geofence area.
            </Text>
          </View>
        )}

        {/* Sandbox Mode Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 In test mode, geofence verification is less strict. In live mode, you must be precisely at the job site location.
          </Text>
        </View>
      </View>
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
  backButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: '#666666',
  },
  coordinateBox: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  coordinateLabel: {
    fontSize: 11,
    color: '#999999',
    fontWeight: '600',
    marginBottom: 2,
  },
  coordinateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Courier New',
  },
  loadingText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  distanceBox: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  withinGeofence: {
    backgroundColor: '#dcfce7',
  },
  distanceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  withinGeofenceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16a34a',
  },
  outsideGeofenceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
  },
  geofenceInfo: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  refreshButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  checkInButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#22c55e',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  checkInButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  checkInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ca8a04',
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 16,
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  infoText: {
    fontSize: 12,
    color: '#0c4a6e',
    lineHeight: 16,
  },
});
