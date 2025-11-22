import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../api/auth';
import { isBiometricAvailable, authenticate } from '../../utils/biometric';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const { login } = useAuth();

  React.useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const available = await isBiometricAvailable();
    setBiometricAvailable(available);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      login({ email, password });
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    const success = await authenticate();
    if (success) {
      // Would load saved credentials here
      Alert.alert('Success', 'Logged in with biometric authentication');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Text style={styles.logo}>🪐</Text>
            <Text style={styles.title}>ORBIT Staffing</Text>
            <Text style={styles.subtitle}>Worker App</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor="#999999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
            </TouchableOpacity>

            {biometricAvailable && (
              <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin}>
                <Text style={styles.biometricButtonText}>👆 Use Fingerprint</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('signup')}>
              <Text style={styles.signupLink}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By logging in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60,
  },
  logo: {
    fontSize: 60,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    fontSize: 15,
    color: '#000000',
  },
  loginButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  biometricButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#0ea5e9',
    borderRadius: 8,
    alignItems: 'center',
  },
  biometricButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  signupLink: {
    fontSize: 13,
    color: '#0ea5e9',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 16,
  },
});
