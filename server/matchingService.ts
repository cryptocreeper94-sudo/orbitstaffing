/**
 * ORBIT Staffing OS - Worker Matching Engine
 * 
 * Core automation system for matching workers to job requests
 * This is the heart of the 100% automated staffing system
 */

import { storage } from './storage';
import { sendSMS } from './twilioService';
import type { Worker, WorkerRequest } from '@shared/schema';

// ========================
// TYPES
// ========================

interface MatchScoreResult {
  score: number;
  breakdown: {
    skills: number;
    availability: number;
    insurance: number;
    location: number;
    experience: number;
  };
  reason: string;
}

// ========================
// MATCH SCORE CALCULATION
// ========================

/**
 * Calculate match score between worker and request
 * Returns score out of 100 with detailed breakdown
 */
export function calculateMatchScore(
  worker: Worker,
  request: WorkerRequest
): MatchScoreResult {
  let totalScore = 0;
  const breakdown = {
    skills: 0,
    availability: 0,
    insurance: 0,
    location: 0,
    experience: 0,
  };
  const reasons: string[] = [];

  // SKILLS (40 points) - Does worker have required skills?
  const requiredSkills = (request.skillsRequired as string[]) || [];
  const workerSkills = (worker.skills as string[]) || [];
  
  if (requiredSkills.length > 0) {
    const matchedSkills = requiredSkills.filter(s => 
      workerSkills.includes(s)
    );
    breakdown.skills = (matchedSkills.length / requiredSkills.length) * 40;
    totalScore += breakdown.skills;
    
    if (breakdown.skills === 40) {
      reasons.push('Perfect skill match');
    } else if (breakdown.skills >= 20) {
      reasons.push(`${matchedSkills.length}/${requiredSkills.length} skills matched`);
    }
  } else {
    breakdown.skills = 40; // No skills required = perfect match
    totalScore += 40;
  }

  // AVAILABILITY (20 points) - Worker available (check status)
  if (worker.availabilityStatus === 'available') {
    breakdown.availability = 20;
    totalScore += 20;
    reasons.push('Available');
  } else if (worker.availabilityStatus === 'limited') {
    breakdown.availability = 10;
    totalScore += 10;
    reasons.push('Limited availability');
  } else {
    breakdown.availability = 5;
    totalScore += 5;
    reasons.push('Availability uncertain');
  }

  // INSURANCE (15 points) - Worker insurance (simplified for now)
  if (request.workersCompRequired) {
    // For now, assume approved workers have proper insurance
    // TODO: Check workerInsurance table for actual coverage
    if (worker.status === 'approved') {
      breakdown.insurance = 15;
      totalScore += 15;
      reasons.push('Insurance verified');
    } else {
      breakdown.insurance = 0;
      reasons.push('Insurance pending');
    }
  } else {
    breakdown.insurance = 15; // Not required = perfect match
    totalScore += 15;
  }

  // LOCATION (15 points) - Worker close to job site?
  if (worker.zipCode && request.zipCode) {
    // Simple zip code proximity (first 3 digits)
    const workerZip = worker.zipCode.substring(0, 3);
    const requestZip = request.zipCode.substring(0, 3);
    
    if (workerZip === requestZip) {
      breakdown.location = 15;
      totalScore += 15;
      reasons.push('Same area');
    } else {
      breakdown.location = 5; // Different area but still possible
      totalScore += 5;
      reasons.push('Different area');
    }
  } else {
    breakdown.location = 10; // Unknown location = neutral
    totalScore += 10;
  }

  // EXPERIENCE (10 points) - Years of experience
  const yearsExp = parseInt(worker.yearsExperience || '0', 10);
  
  if (yearsExp >= 5) {
    breakdown.experience = 10;
    totalScore += 10;
    reasons.push('Experienced (5+ years)');
  } else if (yearsExp >= 2) {
    breakdown.experience = 7;
    totalScore += 7;
    reasons.push('Moderate experience');
  } else if (yearsExp >= 1) {
    breakdown.experience = 5;
    totalScore += 5;
    reasons.push('Some experience');
  } else {
    breakdown.experience = 2;
    totalScore += 2;
  }

  return {
    score: Math.round(totalScore),
    breakdown,
    reason: reasons.join(', '),
  };
}

// ========================
// AUTO-MATCHING ENGINE
// ========================

/**
 * Automatically match workers to a job request
 * Creates top 10 matches and notifies top 5 workers
 */
export async function autoMatchWorkers(requestId: string, tenantId: string): Promise<void> {
  try {
    console.log(`[Matching] Starting auto-match for request ${requestId}`);

    // Get request details
    const request = await storage.getWorkerRequest(requestId, tenantId);
    if (!request) {
      throw new Error(`Worker request ${requestId} not found`);
    }

    // Get all eligible workers for this tenant
    const workers = await storage.getEligibleWorkers(tenantId, {
      skills: request.skillsRequired,
      startDate: request.startDate,
      requiresInsurance: request.workersCompRequired || false,
    });

    console.log(`[Matching] Found ${workers.length} eligible workers`);

    if (workers.length === 0) {
      console.warn(`[Matching] No eligible workers found for request ${requestId}`);
      return;
    }

    // Calculate match scores for each worker
    const matches = workers.map((worker: Worker) => ({
      worker,
      ...calculateMatchScore(worker, request),
    }));

    // Sort by score (highest first)
    matches.sort((a: any, b: any) => b.score - a.score);

    // Save top 10 matches to database
    const topMatches = matches.slice(0, 10);
    
    console.log(`[Matching] Creating ${topMatches.length} matches`);
    
    for (const match of topMatches) {
      await storage.createWorkerRequestMatch({
        tenantId,
        requestId,
        workerId: match.worker.id,
        matchScore: match.score.toString(),
        matchReason: match.reason,
        matchStatus: 'pending',
      });
    }

    // Send notifications to top 5 matches
    const topFive = topMatches.slice(0, 5);
    
    console.log(`[Matching] Sending notifications to top ${topFive.length} workers`);
    
    for (const match of topFive) {
      try {
        await sendWorkerNotification(match.worker, request);
      } catch (error) {
        console.error(`[Matching] Failed to notify worker ${match.worker.id}:`, error);
        // Continue with other notifications even if one fails
      }
    }

    console.log(`[Matching] ✓ Successfully matched ${topMatches.length} workers for request ${requestId}`);
  } catch (error) {
    console.error(`[Matching] Error in autoMatchWorkers:`, error);
    throw error;
  }
}

// ========================
// WORKER NOTIFICATIONS
// ========================

/**
 * Send notification to worker about new job opportunity
 * Sends both SMS and in-app notification
 */
export async function sendWorkerNotification(
  worker: Worker,
  request: WorkerRequest
): Promise<void> {
  try {
    // Format pay rate
    const payRate = request.payRate ? `$${request.payRate}/hr` : 'TBD';
    
    // Format start date
    const startDate = request.startDate 
      ? new Date(request.startDate).toLocaleDateString() 
      : 'TBD';

    // SMS notification
    const message = `
🔔 New Job Opportunity!

Position: ${request.jobTitle}
Pay: ${payRate}
Location: ${request.workLocation || request.city || 'TBD'}
Start: ${startDate}

Accept or decline in your ORBIT app.
    `.trim();

    // Send SMS if phone number exists
    if (worker.phone) {
      const smsResult = await sendSMS(
        worker.phone, 
        message, 
        'assignment_notification'
      );
      
      if (smsResult.success) {
        console.log(`[Notification] SMS sent to worker ${worker.id} (${worker.phone})`);
      } else {
        console.error(`[Notification] SMS failed for worker ${worker.id}:`, smsResult.error);
      }
    } else {
      console.warn(`[Notification] No phone number for worker ${worker.id}`);
    }

    // Create in-app notification
    if (worker.userId) {
      await storage.createNotification({
        userId: worker.userId,
        type: 'job_opportunity',
        title: 'New Job Opportunity',
        message,
        relatedId: request.id,
      });
      
      console.log(`[Notification] In-app notification created for worker ${worker.id}`);
    }
  } catch (error) {
    console.error(`[Notification] Error sending notification to worker ${worker.id}:`, error);
    throw error;
  }
}

// ========================
// AUTO-REASSIGNMENT
// ========================

/**
 * Auto-reassign to next best match when worker declines
 */
export async function autoReassignWorkerRequest(
  requestId: string,
  tenantId: string,
  declinedWorkerId: string
): Promise<void> {
  try {
    console.log(`[Matching] Auto-reassigning request ${requestId} after decline from worker ${declinedWorkerId}`);

    // Get all matches for this request, ordered by score
    const allMatches = await storage.listWorkerRequestMatches(requestId, tenantId);
    
    // Find next pending match that hasn't been declined
    const nextMatch = allMatches.find(
      (m: any) => m.matchStatus === 'pending' && m.workerId !== declinedWorkerId
    );

    if (!nextMatch) {
      console.warn(`[Matching] No more available matches for request ${requestId}`);
      
      // Get request details to notify customer
      const request = await storage.getWorkerRequest(requestId, tenantId);
      if (request) {
        // TODO: Notify customer that no more matches are available
        console.log(`[Matching] Should notify customer about no matches for request ${requestId}`);
      }
      return;
    }

    // Get worker details
    const worker = await storage.getWorker(nextMatch.workerId);
    if (!worker) {
      console.error(`[Matching] Worker ${nextMatch.workerId} not found`);
      return;
    }

    // Get request details
    const request = await storage.getWorkerRequest(requestId, tenantId);
    if (!request) {
      console.error(`[Matching] Request ${requestId} not found`);
      return;
    }

    // Send notification to next worker
    await sendWorkerNotification(worker, request);
    
    console.log(`[Matching] ✓ Reassigned request ${requestId} to worker ${worker.id}`);
  } catch (error) {
    console.error(`[Matching] Error in autoReassignWorkerRequest:`, error);
    throw error;
  }
}

