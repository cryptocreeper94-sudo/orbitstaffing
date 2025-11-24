import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../store';
import { worker } from '../utils/api';
import { format, addDays, startOfWeek } from 'date-fns';

export function AvailabilityScreen() {
  const { workerId } = useAuthStore();
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      if (!workerId) return;
      const dates = [];
      for (let i = 0; i < 14; i++) {
        const date = format(addDays(new Date(), i), 'yyyy-MM-dd');
        dates.push(date);
      }
      // Load availability for each date
      setAvailability(dates);
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
        <Text style={styles.title}>Your Availability</Text>
        <Text style={styles.subtitle}>Select days you're available to work</Text>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#06b6d4' }]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#1a1a2e' }]} />
          <Text style={styles.legendText}>Not Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>Unavailable</Text>
        </View>
      </View>

      <View style={styles.calendar}>
        {availability.map((date) => {
          const isSelected = selectedDays.has(date);
          const dateObj = new Date(date);
          const dayName = format(dateObj, 'EEE');
          const dayNum = format(dateObj, 'd');
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
            >
              <Text style={styles.dayName}>{dayName}</Text>
              <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>
                {dayNum}
              </Text>
              <Text style={styles.checkmark}>{isSelected ? '✓' : ''}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.timeSlots}>
        <Text style={styles.sectionTitle}>Preferred Times</Text>
        <TimeSlotToggle label="Early (6am - 12pm)" />
        <TimeSlotToggle label="Mid (12pm - 6pm)" />
        <TimeSlotToggle label="Late (6pm - 12am)" />
      </View>

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Availability</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

function TimeSlotToggle({ label }: { label: string }) {
  const [selected, setSelected] = useState(false);
  return (
    <TouchableOpacity
      style={[
        styles.timeSlot,
        selected && styles.timeSlotSelected,
      ]}
      onPress={() => setSelected(!selected)}
    >
      <Text style={[styles.timeSlotText, selected && styles.timeSlotTextSelected]}>
        {selected ? '✓' : ''} {label}
      </Text>
    </TouchableOpacity>
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#888',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  dayCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#334155',
    borderWidth: 1,
  },
  dayCardSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06b6d4',
  },
  dayCardToday: {
    borderColor: '#10b981',
    borderWidth: 2,
  },
  dayName: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
  },
  dayNum: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 4,
  },
  dayNumToday: {
    color: '#10b981',
  },
  checkmark: {
    fontSize: 16,
    color: '#06b6d4',
    marginTop: 4,
  },
  timeSlots: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopColor: '#334155',
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#06b6d4',
    marginBottom: 12,
  },
  timeSlot: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderColor: '#334155',
    borderWidth: 1,
  },
  timeSlotSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06b6d4',
  },
  timeSlotText: {
    color: '#ccc',
    fontWeight: '600',
  },
  timeSlotTextSelected: {
    color: '#06b6d4',
  },
  saveButton: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#06b6d4',
    paddingVertical: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacer: {
    height: 40,
  },
});
