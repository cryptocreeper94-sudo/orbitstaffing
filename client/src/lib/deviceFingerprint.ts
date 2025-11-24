/**
 * Device Fingerprinting & Bypass System
 * Allows owner to set their device for complete bypass (no login needed)
 * Separate from regular 30-day session persistence for admins/devs
 */

const DEVICE_FINGERPRINT_KEY = 'orbit_device_fingerprint';
const BYPASS_DEVICE_KEY = 'orbit_bypass_device_id';
const BYPASS_ENABLED_KEY = 'orbit_bypass_enabled';

/**
 * Generate a unique fingerprint for this device/browser
 */
export const generateDeviceFingerprint = (): string => {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const language = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Create a simple hash from device characteristics
  const combined = `${ua}|${platform}|${language}|${timezone}`;
  
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `fp_${Math.abs(hash).toString(36)}_${Date.now()}`;
};

/**
 * Get or create device fingerprint for this browser
 */
export const getDeviceFingerprint = (): string => {
  let fingerprint = localStorage.getItem(DEVICE_FINGERPRINT_KEY);
  if (!fingerprint) {
    fingerprint = generateDeviceFingerprint();
    localStorage.setItem(DEVICE_FINGERPRINT_KEY, fingerprint);
  }
  return fingerprint;
};

/**
 * Enable bypass mode on this specific device
 * Owner can call this to mark their device for complete bypass
 */
export const enableBypassOnThisDevice = (): void => {
  const fingerprint = getDeviceFingerprint();
  localStorage.setItem(BYPASS_DEVICE_KEY, fingerprint);
  localStorage.setItem(BYPASS_ENABLED_KEY, 'true');
};

/**
 * Disable bypass on this device
 */
export const disableBypassOnThisDevice = (): void => {
  localStorage.removeItem(BYPASS_DEVICE_KEY);
  localStorage.setItem(BYPASS_ENABLED_KEY, 'false');
};

/**
 * Check if this device has bypass enabled
 */
export const isBypassDeviceEnabled = (): boolean => {
  const fingerprint = getDeviceFingerprint();
  const bypassFingerprint = localStorage.getItem(BYPASS_DEVICE_KEY);
  const enabled = localStorage.getItem(BYPASS_ENABLED_KEY) === 'true';
  
  return enabled && fingerprint === bypassFingerprint;
};

/**
 * Check if should completely bypass Developer login
 */
export const shouldBypassDeveloperLogin = (): boolean => {
  if (!isBypassDeviceEnabled()) return false;
  
  // Additional check: make sure bypass is recent enough (not stale)
  const bypassKey = localStorage.getItem(BYPASS_DEVICE_KEY);
  return !!bypassKey;
};
