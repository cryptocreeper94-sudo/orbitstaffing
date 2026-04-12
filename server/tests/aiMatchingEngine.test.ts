import { expect, test, describe } from 'vitest';
import { calculateAdvancedMatchScore } from '../aiMatchingEngine';
import type { Worker } from '@shared/schema';

describe('AI Matching Engine', () => {
  const mockJob = {
    id: 'j1',
    title: 'Warehouse Forklift',
    requiredSkills: ['forklift', 'warehouse'],
    preferredSkills: ['inventory'],
    city: 'Austin',
    state: 'TX',
    minExperienceYears: 2,
    shiftPreference: 'first_shift'
  };

  test('calculates high match for perfect candidate utilizing synonyms', () => {
    // Note: uses 'forklift operator' and 'warehouse work', which are synonyms in SKILL_SYNONYMS
    const perfectWorker = {
      id: 'w1',
      skills: ['forklift operator', 'warehouse work', 'inventory'],
      city: 'Austin',
      state: 'TX',
      yearsExperience: '5',
      preferredShift: 'first_shift',
      status: 'approved',
      availabilityStatus: 'available',
      availableToStart: 'immediately'
    } as unknown as Worker;

    const result = calculateAdvancedMatchScore(perfectWorker, mockJob);
    
    expect(result.breakdown.skills.score).toBe(40); // 100% skill match due to synonyms
    expect(result.overallScore).toBeGreaterThanOrEqual(85);
    expect(['A+', 'A']).toContain(result.matchGrade);
  });

  test('severely penalizes missing required skills', () => {
    const badWorker = {
      id: 'w2',
      skills: ['cleaning', 'painting'],
      city: 'Dallas',
      state: 'TX',
      yearsExperience: '0',
      status: 'pending_review'
    } as unknown as Worker;

    const result = calculateAdvancedMatchScore(badWorker, mockJob);
    
    expect(result.breakdown.skills.score).toBeLessThan(20);
    expect(['D', 'F']).toContain(result.matchGrade);
  });
});
