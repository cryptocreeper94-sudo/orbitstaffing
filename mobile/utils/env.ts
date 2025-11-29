import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

export interface AppConfig {
  apiUrl: string;
  isSandbox: boolean;
  sandboxMode: 'sandbox' | 'live';
}

/**
 * Get app configuration including sandbox/live mode
 */
export async function getAppConfig(): Promise<AppConfig> {
  const sandboxMode = (await SecureStore.getItemAsync('sandboxMode')) || 'live';
  const isSandbox = sandboxMode === 'sandbox';

  return {
    isSandbox,
    sandboxMode: sandboxMode as 'sandbox' | 'live',
    apiUrl: isSandbox
      ? Constants.expoConfig?.extra?.sandboxApiUrl || 'https://sandbox.orbitstaffing.io/api'
      : Constants.expoConfig?.extra?.apiUrl || 'https://orbitstaffing.io/api',
  };
}

/**
 * Toggle between sandbox and live mode (for testing)
 * ADMIN ONLY - requires special password
 */
export async function toggleSandboxMode(mode: 'sandbox' | 'live'): Promise<void> {
  await SecureStore.setItemAsync('sandboxMode', mode);
  // Force app restart or navigation back to login
}

/**
 * Get current sandbox mode
 */
export async function getSandboxMode(): Promise<'sandbox' | 'live'> {
  return ((await SecureStore.getItemAsync('sandboxMode')) || 'live') as 'sandbox' | 'live';
}
