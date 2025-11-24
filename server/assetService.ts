import crypto from 'crypto';

/**
 * ORBIT Asset Service - Asset #1 = Jason (CEO), Asset #2 = Sidonie (COO)
 */

export function generateHallmarkNumber(): string {
  const date = new Date().toISOString().replace(/[-:]/g, '').substring(0, 8);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORBIT-${date}-${random}`;
}

export const ASSET_PROFILES = {
  1: {
    assetNumber: 1,
    name: 'Jason Summers',
    title: 'CEO & Owner',
    email: 'jason@orbitstaffing.net',
    phone: '(555) ORBIT-1',
    role: 'ceo',
  },
  2: {
    assetNumber: 2,
    name: 'Sidonie Summers',
    title: 'Chief Operating Officer',
    email: 'sidonie@orbitstaffing.net',
    phone: '(555) ORBIT-2',
    role: 'coo',
  },
};
