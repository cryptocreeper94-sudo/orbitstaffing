import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from './store';

import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { GPSClockInScreen } from './screens/GPSClockInScreen';
import { AssignmentsScreen } from './screens/AssignmentsScreen';
import { BonusesScreen } from './screens/BonusesScreen';
import { AvailabilityScreen } from './screens/AvailabilityScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f172a', borderBottomColor: '#06b6d4', borderBottomWidth: 1 },
        headerTintColor: '#06b6d4',
        headerTitleStyle: { color: '#fff', fontWeight: 'bold' },
        tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#06b6d4', borderTopWidth: 1 },
        tabBarActiveTintColor: '#06b6d4',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Assignments"
        component={AssignmentsScreen}
        options={{
          title: 'Shifts',
          tabBarLabel: 'Shifts',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="GPSClockIn"
        component={GPSClockInScreen}
        options={{
          title: 'Check-In',
          tabBarLabel: 'Check-In',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📍</Text>,
        }}
      />
      <Tab.Screen
        name="Bonuses"
        component={BonusesScreen}
        options={{
          title: 'Bonuses',
          tabBarLabel: 'Bonuses',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🎁</Text>,
        }}
      />
      <Tab.Screen
        name="Availability"
        component={AvailabilityScreen}
        options={{
          title: 'Calendar',
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📅</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const savedToken = await SecureStore.getItemAsync('authToken');
      if (savedToken) {
        setAuth(savedToken, 'restored-worker-id', 'ORBIT Staffing');
      }
    } catch (e) {
      console.error('Error restoring token:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      {token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
