import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  } catch {
    return false;
  }
}

export async function getBiometricType(): Promise<'fingerprint' | 'face' | 'iris' | null> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'fingerprint';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'face';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'iris';
    }
  } catch {}
  return null;
}

export async function authenticate(): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      disableDeviceFallback: false,
      reason: 'Authenticate to access ORBIT Staffing',
    });
    return result.success;
  } catch {
    return false;
  }
}

export async function enableBiometric(): Promise<void> {
  const available = await isBiometricAvailable();
  if (!available) {
    throw new Error('Biometric authentication not available on this device');
  }

  const authenticated = await authenticate();
  if (authenticated) {
    await SecureStore.setItemAsync('biometricEnabled', 'true');
  } else {
    throw new Error('Biometric authentication failed');
  }
}

export async function disableBiometric(): Promise<void> {
  await SecureStore.deleteItemAsync('biometricEnabled');
}

export async function isBiometricEnabled(): Promise<boolean> {
  const enabled = await SecureStore.getItemAsync('biometricEnabled');
  return enabled === 'true';
}
