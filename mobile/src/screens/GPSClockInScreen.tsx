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

const theme = {
  dark: '#0f172a',
  darker: '#020617',
  primary: '#06b6d4',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#1e293b',
  success: '#22c55e',
  error: '#ef4444',
};

const GEOFENCE_RADIUS = 300;

export function GPSClockInScreen() {
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const { latitude, longitude, setLocation, setClockedIn, isClockedIn } = useGPSStore();
  const { workerId } = useAuthStore();
  const [jobSite] = useState({ lat: 36.162, lon: -86.78, name: 'Assigned Job Site' });
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
        Alert.alert('Permission Denied', 'Location access is required for GPS check-in');
        setLocationLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(loc.coords.latitude, loc.coords.longitude, loc.coords.accuracy || 0);
      setAccuracy(loc.coords.accuracy || 0);

      const d = calculateDistance(
        loc.coords.latitude,
        loc.coords.longitude,
        jobSite.lat,
        jobSite.lon
      );
      setDistance(d);
      setLocationLoading(false);
    } catch (error) {
      console.error('Location error:', error);
      setLocationLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 20902231;
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
        `You are ${Math.round(distance)} feet away from the job site. You must be within ${GEOFENCE_RADIUS} feet to clock in.`
      );
      return;
    }

    if (!latitude || !longitude || !workerId) {
      Alert.alert('Error', 'Unable to get your location. Please try again.');
      return;
    }

    setLoading(true);
    try {
      await gps.clockIn(workerId, latitude, longitude, accuracy);
      setClockedIn(true);
      Alert.alert('Success', 'You have clocked in successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Clock-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!workerId) return;

    setLoading(true);
    try {
      await gps.clockOut(workerId);
      setClockedIn(false);
      Alert.alert('Success', 'You have clocked out successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Clock-out failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isWithinRange = distance <= GEOFENCE_RADIUS;
  const statusColor = isWithinRange ? theme.success : theme.error;

  if (locationLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>GPS Check-In</Text>
        <Text style={styles.jobSite}>{jobSite.name}</Text>

        <View style={[styles.statusBox, { borderColor: statusColor }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {isWithinRange ? 'Within Range ✓' : 'Out of Range'}
          </Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Distance</Text>
            <Text style={styles.infoValue}>{Math.round(distance)} ft</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Accuracy</Text>
            <Text style={styles.infoValue}>±{Math.round(accuracy)}m</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Latitude</Text>
            <Text style={styles.infoValue}>{latitude?.toFixed(4) || '--'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Longitude</Text>
            <Text style={styles.infoValue}>{longitude?.toFixed(4) || '--'}</Text>
          </View>
        </View>

        <View style={styles.clockedStatus}>
          <Text style={styles.clockedLabel}>Current Status:</Text>
          <Text style={[styles.clockedValue, { color: isClockedIn ? theme.success : theme.textMuted }]}>
            {isClockedIn ? '🟢 CLOCKED IN' : '⚪ CLOCKED OUT'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            isClockedIn ? styles.buttonClockOut : styles.buttonClockIn,
            (!isWithinRange && !isClockedIn) && styles.buttonDisabled,
          ]}
          onPress={isClockedIn ? handleClockOut : handleClockIn}
          disabled={(!isWithinRange && !isClockedIn) || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isClockedIn ? 'Clock Out' : 'Clock In'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>
          {GEOFENCE_RADIUS} ft geofence • GPS verified
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.darker,
    padding: 16,
    justifyContent: 'center',
  },
  centered: {
    alignItems: 'center',
  },
  loadingText: {
    color: theme.textMuted,
    marginTop: 16,
    fontSize: 16,
  },
  card: {
    backgroundColor: theme.dark,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: theme.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 4,
  },
  jobSite: {
    fontSize: 16,
    color: theme.textMuted,
    marginBottom: 20,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  clockedStatus: {
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  clockedLabel: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 4,
  },
  clockedValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonClockIn: {
    backgroundColor: theme.primary,
  },
  buttonClockOut: {
    backgroundColor: theme.error,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 16,
    color: theme.textMuted,
    textAlign: 'center',
    fontSize: 12,
  },
});
