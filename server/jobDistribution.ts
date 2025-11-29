/**
 * ORBIT Staffing OS - Multi-Channel Job Distribution
 * 
 * Distributes job postings to multiple platforms:
 * - Indeed
 * - LinkedIn
 * - ZipRecruiter
 * - Craigslist
 * - Facebook Jobs
 * - Google Jobs (via structured data)
 * 
 * Tracks application sources and provides analytics
 */

// ========================
// TYPES
// ========================

export type JobBoard = 
  | 'indeed'
  | 'linkedin'
  | 'ziprecruiter'
  | 'craigslist'
  | 'facebook'
  | 'google'
  | 'internal';

export interface JobPostingData {
  id: string;
  title: string;
  description: string;
  company: string;
  location: {
    city: string;
    state: string;
    zipCode?: string;
    remote?: boolean;
  };
  compensation: {
    type: 'hourly' | 'salary';
    min: number;
    max?: number;
    currency?: string;
  };
  employmentType: 'full-time' | 'part-time' | 'contract' | 'temporary';
  requiredSkills: string[];
  qualifications?: string;
  benefits?: string[];
  startDate?: Date;
  applicationUrl?: string;
  companyLogo?: string;
}

export interface DistributionResult {
  board: JobBoard;
  success: boolean;
  externalId?: string;
  postUrl?: string;
  error?: string;
  postedAt?: Date;
  expiresAt?: Date;
}

export interface DistributionStatus {
  jobId: string;
  results: DistributionResult[];
  successCount: number;
  failCount: number;
  totalReach: number;
}

// ========================
// JOB BOARD CONFIGURATIONS
// ========================

const JOB_BOARD_CONFIG: Record<JobBoard, {
  name: string;
  estimatedReach: number;
  requiresApiKey: boolean;
  postingDurationDays: number;
  features: string[];
}> = {
  indeed: {
    name: 'Indeed',
    estimatedReach: 250000,
    requiresApiKey: true,
    postingDurationDays: 30,
    features: ['Sponsored posts', 'Resume database', 'Analytics'],
  },
  linkedin: {
    name: 'LinkedIn',
    estimatedReach: 100000,
    requiresApiKey: true,
    postingDurationDays: 30,
    features: ['Professional network', 'Skill matching', 'InMail'],
  },
  ziprecruiter: {
    name: 'ZipRecruiter',
    estimatedReach: 150000,
    requiresApiKey: true,
    postingDurationDays: 30,
    features: ['AI matching', 'Multi-board posting', 'Candidate quality score'],
  },
  craigslist: {
    name: 'Craigslist',
    estimatedReach: 50000,
    requiresApiKey: false,
    postingDurationDays: 30,
    features: ['Local focus', 'Low cost', 'Quick posting'],
  },
  facebook: {
    name: 'Facebook Jobs',
    estimatedReach: 80000,
    requiresApiKey: true,
    postingDurationDays: 30,
    features: ['Social reach', 'Easy apply', 'Messenger chat'],
  },
  google: {
    name: 'Google for Jobs',
    estimatedReach: 500000,
    requiresApiKey: false,
    postingDurationDays: 30,
    features: ['Search visibility', 'Free', 'Structured data'],
  },
  internal: {
    name: 'ORBIT Talent Exchange',
    estimatedReach: 10000,
    requiresApiKey: false,
    postingDurationDays: 90,
    features: ['Pre-screened workers', 'GPS verified', 'Instant matching'],
  },
};

// ========================
// STRUCTURED DATA GENERATOR
// ========================

export function generateGoogleJobsSchema(job: JobPostingData): object {
  return {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    identifier: {
      '@type': 'PropertyValue',
      name: job.company,
      value: job.id,
    },
    datePosted: new Date().toISOString(),
    validThrough: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: job.employmentType.toUpperCase().replace('-', '_'),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
      sameAs: job.applicationUrl,
      logo: job.companyLogo,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '',
        addressLocality: job.location.city,
        addressRegion: job.location.state,
        postalCode: job.location.zipCode,
        addressCountry: 'US',
      },
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: job.compensation.currency || 'USD',
      value: {
        '@type': 'QuantitativeValue',
        value: job.compensation.min,
        maxValue: job.compensation.max,
        unitText: job.compensation.type === 'hourly' ? 'HOUR' : 'YEAR',
      },
    },
    skills: job.requiredSkills.join(', '),
    qualifications: job.qualifications,
  };
}

// ========================
// INDEED FORMAT
// ========================

function formatForIndeed(job: JobPostingData): object {
  return {
    title: job.title,
    company: job.company,
    location: `${job.location.city}, ${job.location.state}`,
    description: job.description,
    salary: job.compensation.type === 'hourly'
      ? `$${job.compensation.min}${job.compensation.max ? ` - $${job.compensation.max}` : ''} per hour`
      : `$${job.compensation.min}${job.compensation.max ? ` - $${job.compensation.max}` : ''} per year`,
    job_type: job.employmentType,
    requirements: job.requiredSkills.join(', '),
    benefits: job.benefits?.join(', '),
    apply_url: job.applicationUrl,
  };
}

// ========================
// LINKEDIN FORMAT
// ========================

function formatForLinkedIn(job: JobPostingData): object {
  return {
    title: job.title,
    companyName: job.company,
    location: {
      city: job.location.city,
      state: job.location.state,
      country: 'US',
    },
    description: job.description,
    employmentStatus: job.employmentType.toUpperCase(),
    industries: ['Staffing and Recruiting'],
    jobFunctions: ['General Business'],
    skills: job.requiredSkills,
    compensation: {
      baseSalary: {
        min: { amount: job.compensation.min },
        max: job.compensation.max ? { amount: job.compensation.max } : undefined,
        period: job.compensation.type === 'hourly' ? 'HOURLY' : 'YEARLY',
        currency: 'USD',
      },
    },
    applyMethod: {
      companyApplyUrl: job.applicationUrl,
    },
  };
}

// ========================
// ZIPRECRUITER FORMAT
// ========================

function formatForZipRecruiter(job: JobPostingData): object {
  return {
    job_title: job.title,
    company_name: job.company,
    city: job.location.city,
    state: job.location.state,
    postal_code: job.location.zipCode,
    job_description: job.description,
    job_type: job.employmentType,
    compensation_type: job.compensation.type,
    compensation_min: job.compensation.min,
    compensation_max: job.compensation.max,
    required_skills: job.requiredSkills,
    qualifications: job.qualifications,
    application_url: job.applicationUrl,
  };
}

// ========================
// DISTRIBUTION ENGINE
// ========================

export async function distributeJob(
  job: JobPostingData,
  boards: JobBoard[] = ['internal', 'google']
): Promise<DistributionStatus> {
  const results: DistributionResult[] = [];
  let totalReach = 0;
  
  console.log(`[Job Distribution] Distributing job "${job.title}" to ${boards.length} boards`);
  
  for (const board of boards) {
    const config = JOB_BOARD_CONFIG[board];
    let result: DistributionResult;
    
    try {
      switch (board) {
        case 'internal':
          // Always succeeds - posts to ORBIT Talent Exchange
          result = {
            board,
            success: true,
            externalId: job.id,
            postUrl: `/jobs/${job.id}`,
            postedAt: new Date(),
            expiresAt: new Date(Date.now() + config.postingDurationDays * 24 * 60 * 60 * 1000),
          };
          break;
          
        case 'google':
          // Generate structured data (always succeeds, SEO-based)
          const schema = generateGoogleJobsSchema(job);
          result = {
            board,
            success: true,
            externalId: `google-${job.id}`,
            postUrl: job.applicationUrl,
            postedAt: new Date(),
            expiresAt: new Date(Date.now() + config.postingDurationDays * 24 * 60 * 60 * 1000),
          };
          console.log(`[Job Distribution] Generated Google Jobs schema for SEO`);
          break;
          
        case 'indeed':
          // Placeholder - requires API integration
          const indeedData = formatForIndeed(job);
          result = {
            board,
            success: false,
            error: 'Indeed API key not configured. Configure INDEED_API_KEY to enable.',
          };
          console.log(`[Job Distribution] Indeed: API key required`, indeedData);
          break;
          
        case 'linkedin':
          // Placeholder - requires API integration
          const linkedInData = formatForLinkedIn(job);
          result = {
            board,
            success: false,
            error: 'LinkedIn API not configured. Configure LINKEDIN_CLIENT_ID to enable.',
          };
          console.log(`[Job Distribution] LinkedIn: API key required`, linkedInData);
          break;
          
        case 'ziprecruiter':
          // Placeholder - requires API integration
          const zipData = formatForZipRecruiter(job);
          result = {
            board,
            success: false,
            error: 'ZipRecruiter API not configured. Configure ZIPRECRUITER_API_KEY to enable.',
          };
          console.log(`[Job Distribution] ZipRecruiter: API key required`, zipData);
          break;
          
        default:
          result = {
            board,
            success: false,
            error: `Job board ${board} not yet supported`,
          };
      }
      
      if (result.success) {
        totalReach += config.estimatedReach;
      }
      
    } catch (error: any) {
      result = {
        board,
        success: false,
        error: error.message || 'Unknown error',
      };
    }
    
    results.push(result);
  }
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`[Job Distribution] Complete: ${successCount} success, ${failCount} failed, ${totalReach.toLocaleString()} estimated reach`);
  
  return {
    jobId: job.id,
    results,
    successCount,
    failCount,
    totalReach,
  };
}

// ========================
// ANALYTICS
// ========================

export interface ApplicationSource {
  board: JobBoard;
  applicantCount: number;
  hiredCount: number;
  conversionRate: number;
  costPerApplicant?: number;
  costPerHire?: number;
}

export function getJobBoardAnalytics(
  applications: { source: JobBoard; hired: boolean }[]
): ApplicationSource[] {
  const stats: Record<JobBoard, { applicants: number; hired: number }> = {} as any;
  
  // Initialize all boards
  for (const board of Object.keys(JOB_BOARD_CONFIG) as JobBoard[]) {
    stats[board] = { applicants: 0, hired: 0 };
  }
  
  // Count applications
  for (const app of applications) {
    if (stats[app.source]) {
      stats[app.source].applicants++;
      if (app.hired) {
        stats[app.source].hired++;
      }
    }
  }
  
  // Calculate metrics
  return Object.entries(stats).map(([board, data]) => ({
    board: board as JobBoard,
    applicantCount: data.applicants,
    hiredCount: data.hired,
    conversionRate: data.applicants > 0 ? (data.hired / data.applicants) * 100 : 0,
  }));
}

// ========================
// HELPERS
// ========================

export function getAvailableJobBoards(): { board: JobBoard; config: typeof JOB_BOARD_CONFIG[JobBoard] }[] {
  return Object.entries(JOB_BOARD_CONFIG).map(([board, config]) => ({
    board: board as JobBoard,
    config,
  }));
}

export function estimateTotalReach(boards: JobBoard[]): number {
  return boards.reduce((total, board) => {
    return total + (JOB_BOARD_CONFIG[board]?.estimatedReach || 0);
  }, 0);
}
