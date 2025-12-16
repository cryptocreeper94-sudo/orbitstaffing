import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { BRANDING, THEME } from '../config/branding';

interface ClockStatus {
  isClockedIn: boolean;
  clockInTime?: string;
  currentShift?: {
    id: string;
    clientName: string;
    location: string;
  };
  totalHoursToday: number;
}

export default function TimeclockScreen() {
  const [status, setStatus] = useState<ClockStatus>({
    isClockedIn: false,
    totalHoursToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadClockStatus();
    requestLocationPermission();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location Required',
        'GPS location is required for clock in/out verification. Please enable location services.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadClockStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      
      const response = await fetch(`${BRANDING.apiBaseUrl}/worker/timeclock/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to load clock status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(location);
      return location;
    } catch (error) {
      Alert.alert('Location Error', 'Unable to get current location. Please try again.');
      return null;
    }
  };

  const handleClockAction = async () => {
    setIsProcessing(true);

    try {
      const currentLocation = await getCurrentLocation();
      if (!currentLocation) {
        setIsProcessing(false);
        return;
      }

      const token = await SecureStore.getItemAsync('authToken');
      const action = status.isClockedIn ? 'clock-out' : 'clock-in';

      const response = await fetch(`${BRANDING.apiBaseUrl}/worker/timeclock/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(data);
        Alert.alert(
          'Success',
          status.isClockedIn 
            ? 'You have clocked out successfully!'
            : 'You have clocked in successfully!'
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to process clock action');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to the server. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRANDING.primaryColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.clockDisplay}>
        <Text style={styles.time}>{formatTime(currentTime)}</Text>
        <Text style={styles.date}>
          {currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons
            name={status.isClockedIn ? 'checkmark-circle' : 'time-outline'}
            size={48}
            color={status.isClockedIn ? THEME.colors.success : THEME.colors.textSecondary}
          />
          <Text style={styles.statusTitle}>
            {status.isClockedIn ? 'Currently Working' : 'Not Clocked In'}
          </Text>
        </View>

        {status.isClockedIn && status.currentShift && (
          <View style={styles.shiftInfo}>
            <Text style={styles.shiftLabel}>Working at:</Text>
            <Text style={styles.shiftClient}>{status.currentShift.clientName}</Text>
            <Text style={styles.shiftLocation}>{status.currentShift.location}</Text>
            <Text style={styles.clockInTime}>
              Clocked in at {status.clockInTime}
            </Text>
          </View>
        )}

        <View style={styles.todayHours}>
          <Ionicons name="hourglass-outline" size={20} color={BRANDING.primaryColor} />
          <Text style={styles.todayHoursText}>
            Today: {formatDuration(status.totalHoursToday)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.clockButton,
          status.isClockedIn ? styles.clockOutButton : styles.clockInButton,
          isProcessing && styles.buttonDisabled,
        ]}
        onPress={handleClockAction}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <>
            <Ionicons
              name={status.isClockedIn ? 'stop-circle' : 'play-circle'}
              size={40}
              color="#fff"
            />
            <Text style={styles.clockButtonText}>
              {status.isClockedIn ? 'CLOCK OUT' : 'CLOCK IN'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.gpsInfo}>
        <Ionicons name="location" size={16} color={THEME.colors.textSecondary} />
        <Text style={styles.gpsText}>GPS verification enabled</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockDisplay: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  date: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.xs,
  },
  statusCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginTop: THEME.spacing.sm,
  },
  shiftInfo: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  shiftLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  shiftClient: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  shiftLocation: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  clockInTime: {
    fontSize: 12,
    color: BRANDING.primaryColor,
    marginTop: THEME.spacing.sm,
  },
  todayHours: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
  },
  todayHoursText: {
    fontSize: 16,
    color: THEME.colors.text,
    fontWeight: '600',
  },
  clockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.md,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.lg,
  },
  clockInButton: {
    backgroundColor: THEME.colors.success,
  },
  clockOutButton: {
    backgroundColor: THEME.colors.error,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  clockButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  gpsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.xs,
  },
  gpsText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
});
