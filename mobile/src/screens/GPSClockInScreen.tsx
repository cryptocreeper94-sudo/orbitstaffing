import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { useGPSStore, useAuthStore } from '../store';
import { gps } from '../utils/api';

const GEOFENCE_RADIUS = 300; // 300 feet

export function GPSClockInScreen() {
  const [loading, setLoading] = useState(false);
  const { latitude, longitude, setLocation, setClockIn, isClockIn } = useGPSStore();
  const { workerId } = useAuthStore();
  const [jobSite, setJobSite] = useState({ lat: 36.162, lon: -86.78, name: 'Client Site' });
  const [distance, setDistance] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    getLocation();
    const interval = setInterval(getLocation, 5000);
    return () => clearInterval(interval);
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access required for check-in');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(loc.coords.latitude, loc.coords.longitude, loc.coords.accuracy || 0);
      setAccuracy(loc.coords.accuracy || 0);

      // Calculate distance to job site
      const d = calculateDistance(
        loc.coords.latitude,
        loc.coords.longitude,
        jobSite.lat,
        jobSite.lon
      );
      setDistance(d);
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 20902231; // Earth's radius in feet
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleClockIn = async () => {
    if (distance > GEOFENCE_RADIUS) {
      Alert.alert(
        'Out of Range',
        `You are ${Math.round(distance)} feet away. Must be within ${GEOFENCE_RADIUS} feet.`
      );
      return;
    }

    if (!latitude || !longitude || !workerId) return;

    setLoading(true);
    try {
      await gps.clockIn(workerId, latitude, longitude, accuracy);
      setClockIn(true);
      Alert.alert('Success', 'Clocked in successfully ✓');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Clock-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!workerId) return;

    setLoading(true);
    try {
      await gps.clockOut(workerId);
      setClockIn(false);
      Alert.alert('Success', 'Clocked out successfully ✓');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Clock-out failed');
    } finally {
      setLoading(false);
    }
  };

  const isWithinRange = distance <= GEOFENCE_RADIUS;
  const statusColor = isWithinRange ? '#10b981' : '#ef4444';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>GPS Check-In</Text>
        <Text style={styles.jobSite}>{jobSite.name}</Text>

        <View style={styles.statusBox}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.statusText}>
            {isWithinRange ? 'Within Range ✓' : 'Out of Range ✗'}
          </Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Distance</Text>
            <Text style={styles.infoValue}>{Math.round(distance)} ft</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Accuracy</Text>
            <Text style={styles.infoValue}>{Math.round(accuracy)} m</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Latitude</Text>
            <Text style={styles.infoValue}>{latitude?.toFixed(4)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Longitude</Text>
            <Text style={styles.infoValue}>{longitude?.toFixed(4)}</Text>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.button,
              !isWithinRange && styles.buttonDisabled,
              isClockIn && styles.buttonSecondary,
            ]}
            onPress={isClockIn ? handleClockOut : handleClockIn}
            disabled={(!isWithinRange && !isClockIn) || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isClockIn ? 'Clock Out' : 'Clock In'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          300 ft geofence • {isClockIn ? 'Clocked IN' : 'Clocked OUT'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 24,
    borderColor: '#06b6d4',
    borderWidth: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#06b6d4',
    marginBottom: 8,
  },
  jobSite: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 24,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  infoItem: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonGroup: {
    gap: 12,
  },
  button: {
    backgroundColor: '#06b6d4',
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonSecondary: {
    backgroundColor: '#ef4444',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    marginTop: 16,
    color: '#666',
    textAlign: 'center',
    fontSize: 12,
  },
});
