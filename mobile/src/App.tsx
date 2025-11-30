import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from './store';

import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { GPSClockInScreen } from './screens/GPSClockInScreen';
import { AssignmentsScreen } from './screens/AssignmentsScreen';
import { BonusesScreen } from './screens/BonusesScreen';
import { AvailabilityScreen } from './screens/AvailabilityScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { TimesheetsScreen } from './screens/TimesheetsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const theme = {
  dark: '#0f172a',
  darker: '#020617',
  primary: '#06b6d4',
  accent: '#22d3ee',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#1e293b',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

function EmployeeHub() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { 
          backgroundColor: theme.darker, 
          borderBottomColor: theme.primary, 
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.primary,
        headerTitleStyle: { color: theme.text, fontWeight: 'bold', fontSize: 18 },
        tabBarStyle: { 
          backgroundColor: theme.darker, 
          borderTopColor: theme.border, 
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'ORBIT Hub',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Assignments"
        component={AssignmentsScreen}
        options={{
          title: 'My Shifts',
          tabBarLabel: 'Shifts',
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="GPSClockIn"
        component={GPSClockInScreen}
        options={{
          title: 'Check In/Out',
          tabBarLabel: 'Clock',
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>📍</Text>,
        }}
      />
      <Tab.Screen
        name="Timesheets"
        component={TimesheetsScreen}
        options={{
          title: 'Timesheets',
          tabBarLabel: 'Hours',
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>⏰</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'My Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>🪐</Text>
        <Text style={styles.brandText}>ORBIT</Text>
        <Text style={styles.taglineText}>Staffing OS</Text>
      </View>
      <ActivityIndicator size="large" color={theme.primary} style={styles.spinner} />
    </View>
  );
}

export default function App() {
  const { token, isLoading, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {token ? <EmployeeHub /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.darker,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 80,
    marginBottom: 16,
  },
  brandText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.primary,
    letterSpacing: 4,
  },
  taglineText: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 8,
    letterSpacing: 2,
  },
  spinner: {
    marginTop: 20,
  },
});
