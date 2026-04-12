import { expect, test, describe, beforeEach } from 'vitest';
import { isRateLimited, recordLoginAttempt } from '../auth';
import type { Request } from 'express';

describe('Auth Rate Limiting', () => {
  let mockReq: Request;

  beforeEach(() => {
    // Unique IP per test to avoid cross-contamination in memory store
    const uniqueIp = `192.168.1.${Math.floor(Math.random() * 255)}`;
    mockReq = {
      ip: uniqueIp,
      body: { email: `test${Math.random()}@orbit.test` }
    } as Request;
  });

  test('allows login under max attempts', async () => {
    await recordLoginAttempt(mockReq, false);
    await recordLoginAttempt(mockReq, false);
    
    const { limited } = await isRateLimited(mockReq);
    expect(limited).toBe(false);
  });

  test('locks out after 5 max attempts', async () => {
    // 5 consecutive failures
    for (let i = 0; i < 5; i++) {
      await recordLoginAttempt(mockReq, false);
    }
    
    const { limited, retryAfterMs } = await isRateLimited(mockReq);
    expect(limited).toBe(true);
    expect(retryAfterMs).toBeGreaterThan(0);
  });

  test('resets rate limit on success', async () => {
    // 3 failures
    for (let i = 0; i < 3; i++) {
      await recordLoginAttempt(mockReq, false);
    }
    
    // 1 success clears failures
    await recordLoginAttempt(mockReq, true);
    
    // Next attempt should hit fresh
    await recordLoginAttempt(mockReq, false);
    
    // Now at 1 failure, shouldn't be limited
    const { limited } = await isRateLimited(mockReq);
    expect(limited).toBe(false);
  });
});
