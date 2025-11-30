import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '../store';
import { auth, setAuthToken } from '../utils/api';

const theme = {
  dark: '#0f172a',
  darker: '#020617',
  primary: '#06b6d4',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#1e293b',
  inputBg: '#1e293b',
  error: '#ef4444',
};

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await auth.loginEmail(email.trim(), password);
      const { token, user } = response.data;
      
      await setAuthToken(token);
      setAuth(token, user);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert('Not Available', 'Biometric authentication is not available on this device');
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('Not Set Up', 'Please set up biometric authentication in your device settings');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login to ORBIT',
        fallbackLabel: 'Use Password',
      });

      if (result.success) {
        const { restoreSession } = useAuthStore.getState();
        const restored = await restoreSession();
        if (!restored) {
          Alert.alert('Session Expired', 'Please login with your credentials first.');
        }
      }
    } catch (err) {
      console.error('Biometric error:', err);
      Alert.alert('Error', 'Biometric authentication failed');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🪐</Text>
          <Text style={styles.logoText}>ORBIT</Text>
          <Text style={styles.tagline}>Staffing OS</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>Sign in to access your shifts</Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={theme.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.darker} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricLogin}
          >
            <Text style={styles.biometricText}>🔐 Use Biometric Login</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Powered by</Text>
            <Text style={styles.footerBrand}>ORBIT Staffing OS</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.darker,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 72,
    marginBottom: 12,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: theme.primary,
    letterSpacing: 6,
  },
  tagline: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 8,
    letterSpacing: 3,
  },
  formContainer: {
    backgroundColor: theme.dark,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.error,
  },
  errorText: {
    color: theme.error,
    fontSize: 14,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.inputBg,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
  },
  button: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: theme.darker,
    fontSize: 18,
    fontWeight: 'bold',
  },
  biometricButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  biometricText: {
    color: theme.primary,
    fontSize: 16,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: theme.textMuted,
  },
  footerBrand: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '600',
    marginTop: 4,
  },
});
