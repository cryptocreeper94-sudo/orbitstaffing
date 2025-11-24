/**
 * Session Persistence Utility
 * Manages 30-day browser-based session persistence for admins/developers
 */

const SESSION_PREFIX = 'orbit_session_';
const EXPIRY_SUFFIX = '_expiry';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface SessionData {
  authenticated: boolean;
  role?: string;
  name?: string;
  timestamp: number;
  expiresAt: number;
}

/**
 * Check if user is on mobile device
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
};

/**
 * Set persistent session with 30-day expiry
 */
export const setSessionWithExpiry = (
  sessionKey: string,
  data: Omit<SessionData, 'timestamp' | 'expiresAt'>
): void => {
  const now = Date.now();
  const expiresAt = now + THIRTY_DAYS_MS;
  
  const sessionData: SessionData = {
    ...data,
    timestamp: now,
    expiresAt,
  };
  
  localStorage.setItem(SESSION_PREFIX + sessionKey, JSON.stringify(sessionData));
  localStorage.setItem(SESSION_PREFIX + sessionKey + EXPIRY_SUFFIX, expiresAt.toString());
};

/**
 * Get session if valid (not expired)
 */
export const getValidSession = (sessionKey: string): SessionData | null => {
  const stored = localStorage.getItem(SESSION_PREFIX + sessionKey);
  const expiryStr = localStorage.getItem(SESSION_PREFIX + sessionKey + EXPIRY_SUFFIX);
  
  if (!stored || !expiryStr) return null;
  
  try {
    const expiresAt = parseInt(expiryStr, 10);
    
    // Check if session has expired
    if (Date.now() > expiresAt) {
      clearSession(sessionKey);
      return null;
    }
    
    const sessionData = JSON.parse(stored) as SessionData;
    return sessionData;
  } catch (err) {
    console.error('Session parse error:', err);
    clearSession(sessionKey);
    return null;
  }
};

/**
 * Clear session completely
 */
export const clearSession = (sessionKey: string): void => {
  localStorage.removeItem(SESSION_PREFIX + sessionKey);
  localStorage.removeItem(SESSION_PREFIX + sessionKey + EXPIRY_SUFFIX);
};

/**
 * Check if should bypass login on mobile
 */
export const shouldBypassMobileLogin = (sessionKey: string): boolean => {
  if (!isMobileDevice()) return false;
  
  const session = getValidSession(sessionKey);
  return session?.authenticated === true;
};
