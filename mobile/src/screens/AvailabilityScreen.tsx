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
import { worker } from '../utils/api';
import { format, addDays } from 'date-fns';

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

export function AvailabilityScreen() {
  const { workerId } = useAuthStore();
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [preferredTimes, setPreferredTimes] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const dateList = [];
      for (let i = 0; i < 14; i++) {
        const date = format(addDays(new Date(), i), 'yyyy-MM-dd');
        dateList.push(date);
      }
      setDates(dateList);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (date: string) => {
    const newSelected = new Set(selectedDays);
    if (newSelected.has(date)) {
      newSelected.delete(date);
    } else {
      newSelected.add(date);
    }
    setSelectedDays(newSelected);
  };

  const toggleTime = (time: string) => {
    const newTimes = new Set(preferredTimes);
    if (newTimes.has(time)) {
      newTimes.delete(time);
    } else {
      newTimes.add(time);
    }
    setPreferredTimes(newTimes);
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      if (workerId) {
        for (const date of selectedDays) {
          await worker.setAvailability(workerId, date, true);
        }
      }
      Alert.alert('Saved', 'Your availability has been updated');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save availability. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Availability</Text>
        <Text style={styles.subtitle}>Tap days you're available to work</Text>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.border }]} />
          <Text style={styles.legendText}>Not Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.success }]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
      </View>

      <View style={styles.calendar}>
        {dates.map((date) => {
          const isSelected = selectedDays.has(date);
          const dateObj = new Date(date);
          const dayName = format(dateObj, 'EEE');
          const dayNum = format(dateObj, 'd');
          const monthName = format(dateObj, 'MMM');
          const isToday = format(new Date(), 'yyyy-MM-dd') === date;

          return (
            <TouchableOpacity
              key={date}
              style={[
                styles.dayCard,
                isSelected && styles.dayCardSelected,
                isToday && styles.dayCardToday,
              ]}
              onPress={() => toggleDay(date)}
              activeOpacity={0.7}
            >
              <Text style={styles.dayName}>{dayName}</Text>
              <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>{dayNum}</Text>
              <Text style={styles.monthName}>{monthName}</Text>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.timeSection}>
        <Text style={styles.sectionTitle}>Preferred Shift Times</Text>
        
        <TouchableOpacity
          style={[styles.timeSlot, preferredTimes.has('early') && styles.timeSlotSelected]}
          onPress={() => toggleTime('early')}
        >
          <Text style={styles.timeIcon}>🌅</Text>
          <View style={styles.timeContent}>
            <Text style={[styles.timeLabel, preferredTimes.has('early') && styles.timeLabelSelected]}>
              Early Shift
            </Text>
            <Text style={styles.timeRange}>6:00 AM - 12:00 PM</Text>
          </View>
          {preferredTimes.has('early') && <Text style={styles.timeCheck}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timeSlot, preferredTimes.has('mid') && styles.timeSlotSelected]}
          onPress={() => toggleTime('mid')}
        >
          <Text style={styles.timeIcon}>☀️</Text>
          <View style={styles.timeContent}>
            <Text style={[styles.timeLabel, preferredTimes.has('mid') && styles.timeLabelSelected]}>
              Mid Shift
            </Text>
            <Text style={styles.timeRange}>12:00 PM - 6:00 PM</Text>
          </View>
          {preferredTimes.has('mid') && <Text style={styles.timeCheck}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timeSlot, preferredTimes.has('late') && styles.timeSlotSelected]}
          onPress={() => toggleTime('late')}
        >
          <Text style={styles.timeIcon}>🌙</Text>
          <View style={styles.timeContent}>
            <Text style={[styles.timeLabel, preferredTimes.has('late') && styles.timeLabelSelected]}>
              Late Shift
            </Text>
            <Text style={styles.timeRange}>6:00 PM - 12:00 AM</Text>
          </View>
          {preferredTimes.has('late') && <Text style={styles.timeCheck}>✓</Text>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
        onPress={saveAvailability}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={theme.darker} />
        ) : (
          <Text style={styles.saveButtonText}>Save Availability</Text>
        )}
      </TouchableOpacity>

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
  subtitle: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: theme.textMuted,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  dayCard: {
    width: '30%',
    aspectRatio: 0.85,
    backgroundColor: theme.dark,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  dayCardSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: theme.primary,
    borderWidth: 2,
  },
  dayCardToday: {
    borderColor: theme.success,
    borderWidth: 2,
  },
  dayName: {
    fontSize: 12,
    color: theme.textMuted,
    textTransform: 'uppercase',
  },
  dayNum: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginVertical: 4,
  },
  dayNumToday: {
    color: theme.success,
  },
  monthName: {
    fontSize: 11,
    color: theme.textMuted,
  },
  checkmark: {
    fontSize: 16,
    color: theme.primary,
    marginTop: 4,
    fontWeight: 'bold',
  },
  timeSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 16,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.dark,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  timeSlotSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderColor: theme.primary,
  },
  timeIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  timeContent: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  timeLabelSelected: {
    color: theme.primary,
  },
  timeRange: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 2,
  },
  timeCheck: {
    fontSize: 18,
    color: theme.primary,
    fontWeight: 'bold',
  },
  saveButton: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: theme.darker,
    fontSize: 18,
    fontWeight: 'bold',
  },
  spacer: {
    height: 40,
  },
});
