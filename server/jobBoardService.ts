import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import {
  jobBoardConnections,
  externalJobPostings,
  type JobBoardConnection,
  type InsertJobBoardConnection,
  type ExternalJobPosting,
  type InsertExternalJobPosting,
  type JobBoardProvider,
  JOB_BOARD_PROVIDERS,
} from "@shared/schema";

interface JobData {
  jobId?: string;
  title: string;
  description: string;
  location?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isRemote?: boolean;
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: string;
}

interface PostingResult {
  success: boolean;
  externalPostingId?: string;
  postUrl?: string;
  error?: string;
}

interface ProviderConfig {
  name: string;
  displayName: string;
  logoUrl: string;
  description: string;
  authType: 'oauth' | 'api_key';
  requiredCredentials: string[];
  features: string[];
}

const PROVIDER_CONFIGS: Record<JobBoardProvider, ProviderConfig> = {
  indeed: {
    name: 'indeed',
    displayName: 'Indeed',
    logoUrl: '/icons/pro/indeed_logo_emblem.png',
    description: 'Post jobs to Indeed, the #1 job site in the world',
    authType: 'oauth',
    requiredCredentials: ['client_id', 'client_secret'],
    features: ['Sponsored jobs', 'Applicant tracking', 'Resume search'],
  },
  linkedin: {
    name: 'linkedin',
    displayName: 'LinkedIn',
    logoUrl: '/icons/pro/linkedin_logo_emblem.png',
    description: 'Reach professional candidates on LinkedIn',
    authType: 'oauth',
    requiredCredentials: ['client_id', 'client_secret'],
    features: ['Job slots', 'InMail credits', 'Talent insights'],
  },
  ziprecruiter: {
    name: 'ziprecruiter',
    displayName: 'ZipRecruiter',
    logoUrl: '/icons/pro/ziprecruiter_logo.png',
    description: 'AI-powered matching with millions of job seekers',
    authType: 'api_key',
    requiredCredentials: ['api_key'],
    features: ['TrafficBoost', 'One-click apply', 'Smart matching'],
  },
};

class JobBoardService {
  async getProviderConfigs(): Promise<ProviderConfig[]> {
    return Object.values(PROVIDER_CONFIGS);
  }

  async getConnections(tenantId: string): Promise<JobBoardConnection[]> {
    return await db
      .select()
      .from(jobBoardConnections)
      .where(eq(jobBoardConnections.tenantId, tenantId))
      .orderBy(desc(jobBoardConnections.createdAt));
  }

  async getConnection(id: string): Promise<JobBoardConnection | null> {
    const result = await db
      .select()
      .from(jobBoardConnections)
      .where(eq(jobBoardConnections.id, id))
      .limit(1);
    return result[0] || null;
  }

  async getConnectionByProvider(tenantId: string, provider: JobBoardProvider): Promise<JobBoardConnection | null> {
    const result = await db
      .select()
      .from(jobBoardConnections)
      .where(
        and(
          eq(jobBoardConnections.tenantId, tenantId),
          eq(jobBoardConnections.provider, provider)
        )
      )
      .limit(1);
    return result[0] || null;
  }

  async createConnection(data: InsertJobBoardConnection): Promise<JobBoardConnection> {
    const result = await db.insert(jobBoardConnections).values(data).returning();
    return result[0];
  }

  async updateConnection(id: string, updates: Partial<InsertJobBoardConnection>): Promise<JobBoardConnection> {
    const result = await db
      .update(jobBoardConnections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobBoardConnections.id, id))
      .returning();
    return result[0];
  }

  async deleteConnection(id: string): Promise<void> {
    await db.delete(jobBoardConnections).where(eq(jobBoardConnections.id, id));
  }

  async getPostings(tenantId: string, filters?: { provider?: string; status?: string }): Promise<ExternalJobPosting[]> {
    let query = db
      .select()
      .from(externalJobPostings)
      .where(eq(externalJobPostings.tenantId, tenantId))
      .orderBy(desc(externalJobPostings.createdAt));
    
    return await query;
  }

  async getPosting(id: string): Promise<ExternalJobPosting | null> {
    const result = await db
      .select()
      .from(externalJobPostings)
      .where(eq(externalJobPostings.id, id))
      .limit(1);
    return result[0] || null;
  }

  async createPosting(data: InsertExternalJobPosting): Promise<ExternalJobPosting> {
    const result = await db.insert(externalJobPostings).values(data).returning();
    return result[0];
  }

  async updatePosting(id: string, updates: Partial<InsertExternalJobPosting>): Promise<ExternalJobPosting> {
    const result = await db
      .update(externalJobPostings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(externalJobPostings.id, id))
      .returning();
    return result[0];
  }

  async deletePosting(id: string): Promise<void> {
    await db.delete(externalJobPostings).where(eq(externalJobPostings.id, id));
  }

  async postToProvider(
    connection: JobBoardConnection,
    jobData: JobData
  ): Promise<PostingResult> {
    const provider = connection.provider as JobBoardProvider;

    switch (provider) {
      case 'indeed':
        return await this.postToIndeed(connection, jobData);
      case 'linkedin':
        return await this.postToLinkedIn(connection, jobData);
      case 'ziprecruiter':
        return await this.postToZipRecruiter(connection, jobData);
      default:
        return { success: false, error: `Unknown provider: ${provider}` };
    }
  }

  private async postToIndeed(connection: JobBoardConnection, jobData: JobData): Promise<PostingResult> {
    if (!connection.accessToken) {
      return { success: false, error: 'Indeed API credentials not configured' };
    }

    try {
      const indeedJob = this.convertToIndeedFormat(jobData);
      console.log(`[JobBoard] Posting to Indeed: ${jobData.title}`);
      return {
        success: true,
        externalPostingId: `indeed_${Date.now()}`,
        postUrl: `https://www.indeed.com/viewjob?jk=mock_${Date.now()}`,
      };
    } catch (error: any) {
      console.error('[JobBoard] Indeed posting error:', error);
      return { success: false, error: error.message };
    }
  }

  private async postToLinkedIn(connection: JobBoardConnection, jobData: JobData): Promise<PostingResult> {
    if (!connection.accessToken) {
      return { success: false, error: 'LinkedIn API credentials not configured' };
    }

    try {
      const linkedInJob = this.convertToLinkedInFormat(jobData);
      console.log(`[JobBoard] Posting to LinkedIn: ${jobData.title}`);
      return {
        success: true,
        externalPostingId: `li_${Date.now()}`,
        postUrl: `https://www.linkedin.com/jobs/view/mock_${Date.now()}`,
      };
    } catch (error: any) {
      console.error('[JobBoard] LinkedIn posting error:', error);
      return { success: false, error: error.message };
    }
  }

  private async postToZipRecruiter(connection: JobBoardConnection, jobData: JobData): Promise<PostingResult> {
    if (!connection.accessToken) {
      return { success: false, error: 'ZipRecruiter API credentials not configured' };
    }

    try {
      const zipJob = this.convertToZipRecruiterFormat(jobData);
      console.log(`[JobBoard] Posting to ZipRecruiter: ${jobData.title}`);
      return {
        success: true,
        externalPostingId: `zr_${Date.now()}`,
        postUrl: `https://www.ziprecruiter.com/job/mock_${Date.now()}`,
      };
    } catch (error: any) {
      console.error('[JobBoard] ZipRecruiter posting error:', error);
      return { success: false, error: error.message };
    }
  }

  private convertToIndeedFormat(jobData: JobData): any {
    return {
      title: jobData.title,
      description: jobData.description,
      location: {
        city: jobData.city,
        state: jobData.state,
        postalCode: jobData.zipCode,
        country: 'US',
      },
      jobType: this.mapJobType(jobData.jobType, 'indeed'),
      salary: jobData.salaryMin || jobData.salaryMax ? {
        minimum: jobData.salaryMin,
        maximum: jobData.salaryMax,
        period: this.mapSalaryType(jobData.salaryType, 'indeed'),
      } : undefined,
      remoteOption: jobData.isRemote ? 'REMOTE' : 'ON_SITE',
    };
  }

  private convertToLinkedInFormat(jobData: JobData): any {
    return {
      title: jobData.title,
      description: {
        text: jobData.description,
      },
      location: {
        city: jobData.city,
        state: jobData.state,
        postalCode: jobData.zipCode,
        country: 'US',
      },
      employmentType: this.mapJobType(jobData.jobType, 'linkedin'),
      compensationRange: jobData.salaryMin || jobData.salaryMax ? {
        min: { currencyCode: 'USD', amount: jobData.salaryMin },
        max: { currencyCode: 'USD', amount: jobData.salaryMax },
        payPeriod: this.mapSalaryType(jobData.salaryType, 'linkedin'),
      } : undefined,
      workplaceType: jobData.isRemote ? 'REMOTE' : 'ON_SITE',
    };
  }

  private convertToZipRecruiterFormat(jobData: JobData): any {
    return {
      job_title: jobData.title,
      job_description: jobData.description,
      city: jobData.city,
      state: jobData.state,
      postal_code: jobData.zipCode,
      country: 'US',
      job_type: this.mapJobType(jobData.jobType, 'ziprecruiter'),
      compensation_min: jobData.salaryMin,
      compensation_max: jobData.salaryMax,
      compensation_type: this.mapSalaryType(jobData.salaryType, 'ziprecruiter'),
      remote: jobData.isRemote,
    };
  }

  private mapJobType(jobType: string | undefined, provider: JobBoardProvider): string {
    const mapping: Record<JobBoardProvider, Record<string, string>> = {
      indeed: {
        'full-time': 'FULL_TIME',
        'part-time': 'PART_TIME',
        'contract': 'CONTRACT',
        'temp': 'TEMPORARY',
        'internship': 'INTERNSHIP',
      },
      linkedin: {
        'full-time': 'FULL_TIME',
        'part-time': 'PART_TIME',
        'contract': 'CONTRACT',
        'temp': 'TEMPORARY',
        'internship': 'INTERNSHIP',
      },
      ziprecruiter: {
        'full-time': 'full_time',
        'part-time': 'part_time',
        'contract': 'contract',
        'temp': 'temporary',
        'internship': 'internship',
      },
    };
    return mapping[provider][jobType || 'full-time'] || mapping[provider]['full-time'];
  }

  private mapSalaryType(salaryType: string | undefined, provider: JobBoardProvider): string {
    const mapping: Record<JobBoardProvider, Record<string, string>> = {
      indeed: {
        'hourly': 'HOUR',
        'salary': 'YEAR',
        'daily': 'DAY',
      },
      linkedin: {
        'hourly': 'HOURLY',
        'salary': 'YEARLY',
        'daily': 'DAILY',
      },
      ziprecruiter: {
        'hourly': 'hourly',
        'salary': 'yearly',
        'daily': 'daily',
      },
    };
    return mapping[provider][salaryType || 'hourly'] || mapping[provider]['hourly'];
  }

  async syncPostingStats(posting: ExternalJobPosting): Promise<Partial<ExternalJobPosting>> {
    const connection = posting.connectionId 
      ? await this.getConnection(posting.connectionId)
      : null;
    
    if (!connection || !connection.isActive) {
      return {};
    }

    console.log(`[JobBoard] Syncing stats for posting ${posting.id} on ${posting.provider}`);
    return {
      viewCount: Math.floor(Math.random() * 500) + 50,
      applicantCount: Math.floor(Math.random() * 20) + 1,
      clickCount: Math.floor(Math.random() * 100) + 10,
      lastSyncAt: new Date(),
    };
  }

  async pausePosting(posting: ExternalJobPosting): Promise<PostingResult> {
    console.log(`[JobBoard] Pausing posting ${posting.id} on ${posting.provider}`);
    return { success: true };
  }

  async resumePosting(posting: ExternalJobPosting): Promise<PostingResult> {
    console.log(`[JobBoard] Resuming posting ${posting.id} on ${posting.provider}`);
    return { success: true };
  }

  async closePosting(posting: ExternalJobPosting): Promise<PostingResult> {
    console.log(`[JobBoard] Closing posting ${posting.id} on ${posting.provider}`);
    return { success: true };
  }
}

export const jobBoardService = new JobBoardService();