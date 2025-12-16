import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { backgroundChecks, workers, type BackgroundCheck, type InsertBackgroundCheck } from "@shared/schema";

const CHECKR_API_KEY = process.env.CHECKR_API_KEY;
const CHECKR_SANDBOX_URL = "https://api.checkr-staging.com/v1";
const CHECKR_PRODUCTION_URL = "https://api.checkr.com/v1";

const CHECKR_BASE_URL = process.env.NODE_ENV === "production" && CHECKR_API_KEY 
  ? CHECKR_PRODUCTION_URL 
  : CHECKR_SANDBOX_URL;

export interface CheckrPackage {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  screenings: string[];
  turnaroundDays: string;
}

export const CHECKR_PACKAGES: CheckrPackage[] = [
  {
    id: "basic",
    name: "Basic",
    slug: "tasker_standard",
    price: 29.99,
    description: "Essential background check for standard positions",
    screenings: [
      "SSN Trace",
      "National Criminal Search",
      "Sex Offender Registry",
    ],
    turnaroundDays: "1-3 business days",
  },
  {
    id: "standard",
    name: "Standard",
    slug: "driver_standard",
    price: 54.99,
    description: "Comprehensive check for driving positions",
    screenings: [
      "SSN Trace",
      "National Criminal Search",
      "Sex Offender Registry",
      "Motor Vehicle Report",
      "County Criminal Search (7 years)",
    ],
    turnaroundDays: "3-5 business days",
  },
  {
    id: "pro",
    name: "Professional",
    slug: "driver_pro",
    price: 79.99,
    description: "Full screening for sensitive roles",
    screenings: [
      "SSN Trace",
      "National Criminal Search",
      "Sex Offender Registry",
      "Motor Vehicle Report",
      "County Criminal Search (7 years)",
      "Employment Verification",
      "Education Verification",
      "Professional Reference Check",
    ],
    turnaroundDays: "5-7 business days",
  },
];

export interface CheckrCandidate {
  id: string;
  object: string;
  uri: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  dob?: string;
  ssn?: string;
  driver_license_number?: string;
  driver_license_state?: string;
  created_at: string;
}

export interface CheckrReport {
  id: string;
  object: string;
  uri: string;
  status: "pending" | "clear" | "consider" | "suspended" | "dispute";
  adjudication?: "engaged" | "pre_adverse_action" | "adverse_action" | null;
  package: string;
  candidate_id: string;
  created_at: string;
  completed_at?: string;
  turnaround_time?: number;
  report_url?: string;
}

export interface CheckrInvitation {
  id: string;
  object: string;
  uri: string;
  status: string;
  invitation_url: string;
  candidate_id: string;
  package: string;
  created_at: string;
  expires_at: string;
}

export interface CheckrWebhookPayload {
  id: string;
  object: string;
  type: string;
  created_at: string;
  webhook_url: string;
  data: {
    object: CheckrReport | CheckrCandidate;
  };
}

class CheckrService {
  private apiKey: string | undefined;
  private baseUrl: string;

  constructor() {
    this.apiKey = CHECKR_API_KEY;
    this.baseUrl = CHECKR_BASE_URL;
  }

  private getAuthHeader(): string {
    if (!this.apiKey) {
      throw new Error("CHECKR_API_KEY not configured");
    }
    return `Basic ${Buffer.from(this.apiKey + ":").toString("base64")}`;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async createCandidate(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dob?: string;
    ssn?: string;
    driversLicenseNumber?: string;
    driversLicenseState?: string;
    zipcode?: string;
  }): Promise<CheckrCandidate> {
    if (!this.isConfigured()) {
      console.log("[Checkr] API not configured - returning mock candidate");
      return this.mockCandidate(data);
    }

    const response = await fetch(`${this.baseUrl}/candidates`, {
      method: "POST",
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        dob: data.dob,
        ssn: data.ssn,
        driver_license_number: data.driversLicenseNumber,
        driver_license_state: data.driversLicenseState,
        zipcode: data.zipcode,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Checkr] Create candidate error:", error);
      throw new Error(`Checkr API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async createInvitation(
    candidateId: string,
    packageSlug: string
  ): Promise<CheckrInvitation> {
    if (!this.isConfigured()) {
      console.log("[Checkr] API not configured - returning mock invitation");
      return this.mockInvitation(candidateId, packageSlug);
    }

    const response = await fetch(`${this.baseUrl}/invitations`, {
      method: "POST",
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        candidate_id: candidateId,
        package: packageSlug,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Checkr] Create invitation error:", error);
      throw new Error(`Checkr API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async createReport(
    candidateId: string,
    packageSlug: string
  ): Promise<CheckrReport> {
    if (!this.isConfigured()) {
      console.log("[Checkr] API not configured - returning mock report");
      return this.mockReport(candidateId, packageSlug);
    }

    const response = await fetch(`${this.baseUrl}/reports`, {
      method: "POST",
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        candidate_id: candidateId,
        package: packageSlug,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Checkr] Create report error:", error);
      throw new Error(`Checkr API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async getReport(reportId: string): Promise<CheckrReport> {
    if (!this.isConfigured()) {
      console.log("[Checkr] API not configured - returning mock report");
      return {
        id: reportId,
        object: "report",
        uri: `/v1/reports/${reportId}`,
        status: "pending",
        package: "tasker_standard",
        candidate_id: "mock_candidate",
        created_at: new Date().toISOString(),
      };
    }

    const response = await fetch(`${this.baseUrl}/reports/${reportId}`, {
      headers: {
        Authorization: this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Checkr] Get report error:", error);
      throw new Error(`Checkr API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async getCandidate(candidateId: string): Promise<CheckrCandidate> {
    if (!this.isConfigured()) {
      return {
        id: candidateId,
        object: "candidate",
        uri: `/v1/candidates/${candidateId}`,
        first_name: "Mock",
        last_name: "Candidate",
        email: "mock@example.com",
        created_at: new Date().toISOString(),
      };
    }

    const response = await fetch(`${this.baseUrl}/candidates/${candidateId}`, {
      headers: {
        Authorization: this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Checkr API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async handleWebhook(payload: CheckrWebhookPayload): Promise<BackgroundCheck | null> {
    console.log("[Checkr] Processing webhook:", payload.type);

    if (payload.type === "report.completed" || payload.type === "report.updated") {
      const report = payload.data.object as CheckrReport;
      
      const existing = await db
        .select()
        .from(backgroundChecks)
        .where(eq(backgroundChecks.checkrReportId, report.id))
        .limit(1);

      if (existing.length > 0) {
        const updated = await db
          .update(backgroundChecks)
          .set({
            status: report.status,
            adjudication: report.adjudication || null,
            completedAt: report.completed_at ? new Date(report.completed_at) : null,
            reportUrl: report.report_url || null,
            externalStatus: report.status,
            lastWebhookAt: new Date(),
            webhookEventType: payload.type,
            updatedAt: new Date(),
          })
          .where(eq(backgroundChecks.id, existing[0].id))
          .returning();

        console.log("[Checkr] Updated background check:", updated[0].id);
        return updated[0];
      }
    }

    return null;
  }

  async initiateCheck(
    tenantId: string,
    workerId: string,
    packageId: string,
    requestedBy: string
  ): Promise<BackgroundCheck> {
    const pkg = CHECKR_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      throw new Error(`Invalid package: ${packageId}`);
    }

    const worker = await db
      .select()
      .from(workers)
      .where(eq(workers.id, workerId))
      .limit(1);

    if (!worker.length) {
      throw new Error("Worker not found");
    }

    const workerData = worker[0];
    const nameParts = (workerData.fullName || "Unknown Worker").split(" ");
    const firstName = nameParts[0] || "Unknown";
    const lastName = nameParts.slice(1).join(" ") || "Worker";

    const candidate = await this.createCandidate({
      firstName,
      lastName,
      email: workerData.email || `worker-${workerId}@orbit-staffing.com`,
      phone: workerData.phone || undefined,
      dob: workerData.dateOfBirth || undefined,
      driversLicenseNumber: workerData.driversLicense || undefined,
      driversLicenseState: workerData.driversLicenseState || undefined,
      zipcode: workerData.zipCode || undefined,
    });

    const report = await this.createReport(candidate.id, pkg.slug);

    const [bgCheck] = await db
      .insert(backgroundChecks)
      .values({
        tenantId,
        workerId,
        checkrCandidateId: candidate.id,
        checkrReportId: report.id,
        package: packageId,
        checkType: packageId === "basic" ? "criminal" : "comprehensive",
        status: "pending",
        externalId: report.id,
        externalStatus: report.status,
        requestedBy,
        reportUrl: report.report_url,
      })
      .returning();

    console.log("[Checkr] Created background check:", bgCheck.id);
    return bgCheck;
  }

  async getBackgroundChecks(tenantId: string): Promise<BackgroundCheck[]> {
    return db
      .select()
      .from(backgroundChecks)
      .where(eq(backgroundChecks.tenantId, tenantId))
      .orderBy(desc(backgroundChecks.createdAt));
  }

  async getWorkerBackgroundChecks(
    tenantId: string,
    workerId: string
  ): Promise<BackgroundCheck[]> {
    return db
      .select()
      .from(backgroundChecks)
      .where(
        and(
          eq(backgroundChecks.tenantId, tenantId),
          eq(backgroundChecks.workerId, workerId)
        )
      )
      .orderBy(desc(backgroundChecks.createdAt));
  }

  async getBackgroundCheck(id: string): Promise<BackgroundCheck | null> {
    const result = await db
      .select()
      .from(backgroundChecks)
      .where(eq(backgroundChecks.id, id))
      .limit(1);

    return result[0] || null;
  }

  private mockCandidate(data: any): CheckrCandidate {
    const id = `mock_cand_${Date.now()}`;
    return {
      id,
      object: "candidate",
      uri: `/v1/candidates/${id}`,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      dob: data.dob,
      created_at: new Date().toISOString(),
    };
  }

  private mockInvitation(candidateId: string, packageSlug: string): CheckrInvitation {
    const id = `mock_inv_${Date.now()}`;
    return {
      id,
      object: "invitation",
      uri: `/v1/invitations/${id}`,
      status: "pending",
      invitation_url: `https://checkr-staging.com/apply/${id}`,
      candidate_id: candidateId,
      package: packageSlug,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  private mockReport(candidateId: string, packageSlug: string): CheckrReport {
    const id = `mock_rep_${Date.now()}`;
    return {
      id,
      object: "report",
      uri: `/v1/reports/${id}`,
      status: "pending",
      package: packageSlug,
      candidate_id: candidateId,
      created_at: new Date().toISOString(),
    };
  }
}

export const checkrService = new CheckrService();
