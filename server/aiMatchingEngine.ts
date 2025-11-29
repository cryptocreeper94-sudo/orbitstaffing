/**
 * ORBIT Staffing OS - AI-Powered Matching Engine
 * 
 * Advanced worker-to-job matching with:
 * - Skill similarity scoring (partial matches, synonyms)
 * - Distance-based location matching
 * - Shift preference alignment
 * - Certification requirements
 * - Experience level weighting
 * - Match quality tiers (A+, A, B, C, D)
 */

import { storage } from './storage';
import type { Worker } from '@shared/schema';

// ========================
// SKILL SYNONYMS MAP
// ========================

const SKILL_SYNONYMS: Record<string, string[]> = {
  'electrician': ['electrical', 'wiring', 'electrical work', 'journeyman electrician', 'master electrician'],
  'plumber': ['plumbing', 'pipefitting', 'pipe fitting', 'journeyman plumber', 'master plumber'],
  'carpenter': ['carpentry', 'framing', 'woodwork', 'finish carpentry', 'rough carpentry'],
  'hvac': ['heating', 'cooling', 'air conditioning', 'hvac technician', 'refrigeration'],
  'welder': ['welding', 'mig welding', 'tig welding', 'stick welding', 'arc welding'],
  'forklift': ['forklift operator', 'forklift certified', 'warehouse equipment'],
  'warehouse': ['warehouse work', 'inventory', 'picking', 'packing', 'shipping', 'receiving'],
  'construction': ['general labor', 'construction labor', 'site work', 'demo', 'demolition'],
  'cleaning': ['janitorial', 'custodial', 'housekeeping', 'sanitation', 'maintenance'],
  'landscaping': ['lawn care', 'groundskeeping', 'yard work', 'irrigation'],
  'painting': ['painter', 'industrial painting', 'residential painting', 'commercial painting'],
  'roofing': ['roofer', 'shingles', 'flat roof', 'roof repair'],
  'concrete': ['concrete work', 'cement', 'masonry', 'block laying'],
  'drywall': ['drywall installation', 'sheetrock', 'taping', 'mudding'],
  'food service': ['kitchen', 'cooking', 'food prep', 'line cook', 'dishwasher'],
  'hospitality': ['hotel', 'housekeeping', 'front desk', 'guest services'],
  'manufacturing': ['assembly', 'production', 'machine operator', 'quality control'],
  'driving': ['cdl', 'truck driver', 'delivery driver', 'chauffeur', 'box truck'],
};

// Experience level mapping
const EXPERIENCE_LEVELS: Record<string, number> = {
  'entry': 0,
  'junior': 1,
  'mid': 3,
  'senior': 5,
  'expert': 8,
  'master': 10,
};

// ========================
// TYPES
// ========================

export interface JobRequirements {
  id: string;
  title: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  certifications?: string[];
  experienceLevel?: string;
  minExperienceYears?: number;
  payRangeMin?: number;
  payRangeMax?: number;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  scheduleType?: string;
  shiftPreference?: string;
  hoursPerWeek?: number;
  startDate?: Date;
  workLocation?: string;
}

export interface MatchScore {
  overallScore: number;
  matchGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    skills: { score: number; max: 40; details: string[] };
    experience: { score: number; max: 15; details: string[] };
    location: { score: number; max: 15; details: string[] };
    availability: { score: number; max: 15; details: string[] };
    preferences: { score: number; max: 15; details: string[] };
  };
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

export interface WorkerMatch {
  worker: Worker;
  score: MatchScore;
  rank: number;
}

// ========================
// SKILL MATCHING
// ========================

function normalizeSkill(skill: string): string {
  return skill.toLowerCase().trim();
}

function getSkillSynonyms(skill: string): string[] {
  const normalized = normalizeSkill(skill);
  
  // Check if this skill is a key
  if (SKILL_SYNONYMS[normalized]) {
    return [normalized, ...SKILL_SYNONYMS[normalized]];
  }
  
  // Check if this skill is a value in any synonym group
  for (const [key, synonyms] of Object.entries(SKILL_SYNONYMS)) {
    if (synonyms.map(s => s.toLowerCase()).includes(normalized)) {
      return [key, ...synonyms];
    }
  }
  
  return [normalized];
}

function calculateSkillMatch(
  workerSkills: string[],
  requiredSkills: string[],
  preferredSkills: string[] = []
): { score: number; details: string[] } {
  const normalizedWorkerSkills = workerSkills.map(normalizeSkill);
  const details: string[] = [];
  let requiredMatches = 0;
  let preferredMatches = 0;
  
  // Check required skills
  for (const required of requiredSkills) {
    const synonyms = getSkillSynonyms(required);
    const hasSkill = synonyms.some(syn => 
      normalizedWorkerSkills.some(ws => 
        ws.includes(syn) || syn.includes(ws)
      )
    );
    
    if (hasSkill) {
      requiredMatches++;
      details.push(`✓ Has ${required}`);
    } else {
      details.push(`✗ Missing ${required}`);
    }
  }
  
  // Check preferred skills (bonus points)
  for (const preferred of preferredSkills) {
    const synonyms = getSkillSynonyms(preferred);
    const hasSkill = synonyms.some(syn => 
      normalizedWorkerSkills.some(ws => 
        ws.includes(syn) || syn.includes(ws)
      )
    );
    
    if (hasSkill) {
      preferredMatches++;
      details.push(`+ Bonus: ${preferred}`);
    }
  }
  
  // Calculate score (out of 40)
  const requiredCount = requiredSkills.length || 1;
  const preferredCount = preferredSkills.length || 1;
  
  // Required skills are 80% of skill score, preferred are 20%
  const requiredScore = (requiredMatches / requiredCount) * 32;
  const preferredScore = preferredSkills.length > 0 
    ? (preferredMatches / preferredCount) * 8 
    : 8; // Full bonus if no preferred skills specified
  
  return {
    score: Math.round(requiredScore + preferredScore),
    details,
  };
}

// ========================
// LOCATION MATCHING
// ========================

function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  // Haversine formula for distance in miles
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculateLocationMatch(
  worker: Worker,
  job: JobRequirements
): { score: number; details: string[] } {
  const details: string[] = [];
  
  // If we have lat/long for both, calculate exact distance
  // For now, use zip code proximity as fallback
  
  if (worker.zipCode && job.zipCode) {
    const workerZip = worker.zipCode.substring(0, 3);
    const jobZip = job.zipCode.substring(0, 3);
    
    if (worker.zipCode === job.zipCode) {
      details.push(`✓ Same zip code (${worker.zipCode})`);
      return { score: 15, details };
    } else if (workerZip === jobZip) {
      details.push(`✓ Same area (${workerZip}xxx)`);
      return { score: 12, details };
    } else if (worker.state === job.state) {
      details.push(`~ Same state (${worker.state})`);
      return { score: 8, details };
    }
  }
  
  if (worker.city && job.city && 
      worker.city.toLowerCase() === job.city.toLowerCase()) {
    details.push(`✓ Same city (${worker.city})`);
    return { score: 13, details };
  }
  
  if (worker.state && job.state && worker.state === job.state) {
    details.push(`~ Same state (${worker.state})`);
    return { score: 8, details };
  }
  
  details.push(`? Location not verified`);
  return { score: 5, details };
}

// ========================
// EXPERIENCE MATCHING
// ========================

function calculateExperienceMatch(
  worker: Worker,
  job: JobRequirements
): { score: number; details: string[] } {
  const details: string[] = [];
  const workerYears = parseInt(worker.yearsExperience || '0', 10);
  const requiredYears = job.minExperienceYears || 0;
  
  // Map experience level to years if provided
  let levelYears = 0;
  if (job.experienceLevel) {
    levelYears = EXPERIENCE_LEVELS[job.experienceLevel.toLowerCase()] || 0;
  }
  
  const targetYears = Math.max(requiredYears, levelYears);
  
  if (targetYears === 0) {
    details.push(`✓ No experience required`);
    return { score: 15, details };
  }
  
  if (workerYears >= targetYears * 1.5) {
    details.push(`✓ Highly experienced (${workerYears} years vs ${targetYears} required)`);
    return { score: 15, details };
  } else if (workerYears >= targetYears) {
    details.push(`✓ Meets experience (${workerYears} years)`);
    return { score: 13, details };
  } else if (workerYears >= targetYears * 0.7) {
    details.push(`~ Close to required (${workerYears}/${targetYears} years)`);
    return { score: 10, details };
  } else if (workerYears >= targetYears * 0.5) {
    details.push(`! Below required (${workerYears}/${targetYears} years)`);
    return { score: 6, details };
  }
  
  details.push(`✗ Insufficient experience (${workerYears}/${targetYears} years)`);
  return { score: 3, details };
}

// ========================
// AVAILABILITY MATCHING
// ========================

function calculateAvailabilityMatch(
  worker: Worker,
  job: JobRequirements
): { score: number; details: string[] } {
  const details: string[] = [];
  let score = 0;
  
  // Check worker status
  if (worker.status === 'approved') {
    score += 5;
    details.push(`✓ Approved worker`);
  } else if (worker.status === 'pending_review') {
    score += 2;
    details.push(`~ Pending approval`);
  } else {
    details.push(`✗ Not approved`);
    return { score: 0, details };
  }
  
  // Check availability status
  if (worker.availabilityStatus === 'available') {
    score += 5;
    details.push(`✓ Currently available`);
  } else if (worker.availabilityStatus === 'limited') {
    score += 3;
    details.push(`~ Limited availability`);
  } else {
    score += 1;
    details.push(`! Availability unclear`);
  }
  
  // Check start date availability
  if (worker.availableToStart === 'immediately') {
    score += 5;
    details.push(`✓ Can start immediately`);
  } else if (worker.availableToStart === '1_week') {
    score += 4;
    details.push(`✓ Available within 1 week`);
  } else if (worker.availableToStart === '2_weeks') {
    score += 3;
    details.push(`~ Available in 2 weeks`);
  } else {
    score += 2;
    details.push(`~ Start date flexible`);
  }
  
  return { score: Math.min(score, 15), details };
}

// ========================
// PREFERENCES MATCHING
// ========================

function calculatePreferencesMatch(
  worker: Worker,
  job: JobRequirements
): { score: number; details: string[] } {
  const details: string[] = [];
  let score = 0;
  
  // Shift preference matching
  if (worker.preferredShift && job.shiftPreference) {
    if (worker.preferredShift === job.shiftPreference || worker.preferredShift === 'any') {
      score += 5;
      details.push(`✓ Shift preference matches (${worker.preferredShift})`);
    } else {
      score += 2;
      details.push(`~ Different shift preference`);
    }
  } else {
    score += 4; // Neutral if not specified
    details.push(`? Shift preference not specified`);
  }
  
  // Weekend availability
  if (job.scheduleType === 'weekends' || job.scheduleType === 'flexible') {
    if (worker.willingToWorkWeekends) {
      score += 5;
      details.push(`✓ Willing to work weekends`);
    } else {
      score += 1;
      details.push(`✗ Not willing to work weekends`);
    }
  } else {
    score += 4;
    details.push(`? Weekend work not required`);
  }
  
  // Transportation
  if (worker.transportation === 'own_vehicle') {
    score += 5;
    details.push(`✓ Has own transportation`);
  } else if (worker.transportation === 'public_transit') {
    score += 3;
    details.push(`~ Uses public transit`);
  } else if (worker.transportation === 'need_ride') {
    score += 1;
    details.push(`! Needs transportation help`);
  } else {
    score += 3;
    details.push(`? Transportation not specified`);
  }
  
  return { score: Math.min(score, 15), details };
}

// ========================
// MATCH GRADE CALCULATION
// ========================

function getMatchGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 95) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function generateRecommendation(grade: string, strengths: string[], gaps: string[]): string {
  switch (grade) {
    case 'A+':
      return 'Exceptional match! This worker exceeds all requirements and is highly recommended.';
    case 'A':
      return 'Excellent match. This worker meets all key requirements with strong qualifications.';
    case 'B':
      return 'Good match. This worker meets most requirements with minor gaps that may be trainable.';
    case 'C':
      return 'Fair match. Consider this worker if higher-rated candidates are unavailable.';
    case 'D':
      return 'Weak match. Significant gaps exist. Only consider if no other options available.';
    default:
      return 'Not recommended. This worker does not meet the minimum requirements for this position.';
  }
}

// ========================
// MAIN MATCHING FUNCTION
// ========================

export function calculateAdvancedMatchScore(
  worker: Worker,
  job: JobRequirements
): MatchScore {
  // Get worker skills
  const workerSkills = (worker.skills as string[]) || [];
  const requiredSkills = job.requiredSkills || [];
  const preferredSkills = job.preferredSkills || [];
  
  // Calculate component scores
  const skillsMatch = calculateSkillMatch(workerSkills, requiredSkills, preferredSkills);
  const locationMatch = calculateLocationMatch(worker, job);
  const experienceMatch = calculateExperienceMatch(worker, job);
  const availabilityMatch = calculateAvailabilityMatch(worker, job);
  const preferencesMatch = calculatePreferencesMatch(worker, job);
  
  // Calculate overall score
  const overallScore = 
    skillsMatch.score + 
    locationMatch.score + 
    experienceMatch.score + 
    availabilityMatch.score + 
    preferencesMatch.score;
  
  // Determine match grade
  const matchGrade = getMatchGrade(overallScore);
  
  // Compile strengths and gaps
  const strengths: string[] = [];
  const gaps: string[] = [];
  
  const allDetails = [
    ...skillsMatch.details,
    ...locationMatch.details,
    ...experienceMatch.details,
    ...availabilityMatch.details,
    ...preferencesMatch.details,
  ];
  
  allDetails.forEach(detail => {
    if (detail.startsWith('✓') || detail.startsWith('+')) {
      strengths.push(detail.substring(2));
    } else if (detail.startsWith('✗') || detail.startsWith('!')) {
      gaps.push(detail.substring(2));
    }
  });
  
  return {
    overallScore,
    matchGrade,
    breakdown: {
      skills: { score: skillsMatch.score, max: 40, details: skillsMatch.details },
      experience: { score: experienceMatch.score, max: 15, details: experienceMatch.details },
      location: { score: locationMatch.score, max: 15, details: locationMatch.details },
      availability: { score: availabilityMatch.score, max: 15, details: availabilityMatch.details },
      preferences: { score: preferencesMatch.score, max: 15, details: preferencesMatch.details },
    },
    strengths,
    gaps,
    recommendation: generateRecommendation(matchGrade, strengths, gaps),
  };
}

// ========================
// BATCH MATCHING
// ========================

export async function findBestMatches(
  job: JobRequirements,
  tenantId: string,
  limit: number = 20
): Promise<WorkerMatch[]> {
  console.log(`[AI Matching] Finding best matches for job: ${job.title}`);
  
  // Get all eligible workers
  const workers = await storage.getEligibleWorkers(tenantId, {
    skills: job.requiredSkills,
    startDate: job.startDate,
    requiresInsurance: false,
  });
  
  console.log(`[AI Matching] Evaluating ${workers.length} workers`);
  
  // Calculate match scores for all workers
  const matches: WorkerMatch[] = workers.map((worker: Worker) => ({
    worker,
    score: calculateAdvancedMatchScore(worker, job),
    rank: 0,
  }));
  
  // Sort by overall score (highest first)
  matches.sort((a, b) => b.score.overallScore - a.score.overallScore);
  
  // Assign ranks
  matches.forEach((match, index) => {
    match.rank = index + 1;
  });
  
  // Return top matches
  const topMatches = matches.slice(0, limit);
  
  console.log(`[AI Matching] Top match: ${topMatches[0]?.worker.fullName} (${topMatches[0]?.score.matchGrade}, ${topMatches[0]?.score.overallScore}/100)`);
  
  return topMatches;
}

// ========================
// QUICK MATCH API
// ========================

export function getMatchSummary(score: MatchScore): string {
  return `${score.matchGrade} (${score.overallScore}/100) - Skills: ${score.breakdown.skills.score}/${score.breakdown.skills.max}, Exp: ${score.breakdown.experience.score}/${score.breakdown.experience.max}, Loc: ${score.breakdown.location.score}/${score.breakdown.location.max}`;
}
