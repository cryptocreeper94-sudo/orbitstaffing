import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { everifyCases, workers } from "@shared/schema";
import type { InsertEverifyCase, EverifyCase } from "@shared/schema";

const EVERIFY_API_URL = process.env.EVERIFY_API_URL || "https://e-verify.uscis.gov/api/v1";
const EVERIFY_USER_ID = process.env.EVERIFY_USER_ID;
const EVERIFY_PASSWORD = process.env.EVERIFY_PASSWORD;

interface EVerifySubmissionData {
  workerId: string;
  tenantId: string;
  i9Id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string;
  documentType: string;
  documentNumber: string;
  documentExpiration?: string;
  citizenshipStatus: string;
}

interface EVerifyCaseResponse {
  caseNumber: string;
  caseStatus: string;
  eligibilityStatement?: string;
  photoMatchResult?: string;
  tncReasonCode?: string;
  tncDetails?: string;
  referralDeadline?: string;
}

class EVerifyService {
  private mockMode: boolean;

  constructor() {
    this.mockMode = !EVERIFY_USER_ID || !EVERIFY_PASSWORD;
    if (this.mockMode) {
      console.log("[E-Verify] Running in MOCK MODE - no credentials configured");
    }
  }

  isConfigured(): boolean {
    return !this.mockMode;
  }

  getStatus(): { configured: boolean; mockMode: boolean; message: string } {
    return {
      configured: this.isConfigured(),
      mockMode: this.mockMode,
      message: this.mockMode 
        ? "E-Verify credentials not configured. Running in mock mode for testing."
        : "E-Verify API configured and ready."
    };
  }

  async submitCase(data: EVerifySubmissionData): Promise<EverifyCase> {
    if (this.mockMode) {
      return this.mockSubmitCase(data);
    }
    return this.liveSubmitCase(data);
  }

  private async mockSubmitCase(data: EVerifySubmissionData): Promise<EverifyCase> {
    console.log("[E-Verify Mock] Submitting case for worker:", data.workerId);
    
    const mockCaseNumber = `EV${Date.now().toString().slice(-10)}`;
    const mockStatuses = ["authorized", "referred", "initial"];
    const mockStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    
    const caseData: InsertEverifyCase = {
      tenantId: data.tenantId,
      workerId: data.workerId,
      caseNumber: mockCaseNumber,
      caseStatus: mockStatus,
      eligibilityStatement: mockStatus === "authorized" ? "Employment Authorized" : undefined,
      photoMatchResult: mockStatus === "authorized" ? "match" : undefined,
      documentType: data.documentType,
      i9Id: data.i9Id,
      everifyResponse: {
        mock: true,
        submittedAt: new Date().toISOString(),
        workerName: `${data.firstName} ${data.lastName}`,
      },
      tncReasonCode: mockStatus === "referred" ? "SSA_TNC" : undefined,
      tncDetails: mockStatus === "referred" ? "Social Security Administration Tentative Nonconfirmation" : undefined,
      referralDeadline: mockStatus === "referred" 
        ? new Date(Date.now() + 8 * 24 * 60 * 60 * 1000) // 8 business days
        : undefined,
    };

    const result = await db.insert(everifyCases).values({
      ...caseData,
      submittedAt: new Date(),
    }).returning();

    console.log("[E-Verify Mock] Case created:", result[0].caseNumber, "Status:", result[0].caseStatus);
    return result[0];
  }

  private async liveSubmitCase(data: EVerifySubmissionData): Promise<EverifyCase> {
    console.log("[E-Verify] Submitting live case for worker:", data.workerId);
    
    try {
      const response = await fetch(`${EVERIFY_API_URL}/cases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${Buffer.from(`${EVERIFY_USER_ID}:${EVERIFY_PASSWORD}`).toString("base64")}`,
        },
        body: JSON.stringify({
          employee: {
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            ssn: data.ssn,
          },
          document: {
            type: data.documentType,
            number: data.documentNumber,
            expiration: data.documentExpiration,
          },
          citizenshipStatus: data.citizenshipStatus,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`E-Verify API error: ${response.status} - ${errorText}`);
      }

      const apiResponse: EVerifyCaseResponse = await response.json();

      const caseData: InsertEverifyCase = {
        tenantId: data.tenantId,
        workerId: data.workerId,
        caseNumber: apiResponse.caseNumber,
        caseStatus: apiResponse.caseStatus,
        eligibilityStatement: apiResponse.eligibilityStatement,
        photoMatchResult: apiResponse.photoMatchResult,
        documentType: data.documentType,
        i9Id: data.i9Id,
        everifyResponse: apiResponse,
        tncReasonCode: apiResponse.tncReasonCode,
        tncDetails: apiResponse.tncDetails,
        referralDeadline: apiResponse.referralDeadline ? new Date(apiResponse.referralDeadline) : undefined,
      };

      const result = await db.insert(everifyCases).values({
        ...caseData,
        submittedAt: new Date(),
      }).returning();

      return result[0];
    } catch (error) {
      console.error("[E-Verify] API Error:", error);
      throw error;
    }
  }

  async getCaseStatus(caseId: string): Promise<EverifyCase | null> {
    const result = await db.select()
      .from(everifyCases)
      .where(eq(everifyCases.id, caseId))
      .limit(1);
    
    return result[0] || null;
  }

  async getCaseByNumber(caseNumber: string): Promise<EverifyCase | null> {
    const result = await db.select()
      .from(everifyCases)
      .where(eq(everifyCases.caseNumber, caseNumber))
      .limit(1);
    
    return result[0] || null;
  }

  async getCasesForWorker(workerId: string): Promise<EverifyCase[]> {
    return await db.select()
      .from(everifyCases)
      .where(eq(everifyCases.workerId, workerId))
      .orderBy(desc(everifyCases.submittedAt));
  }

  async getCasesForTenant(tenantId: string): Promise<EverifyCase[]> {
    return await db.select()
      .from(everifyCases)
      .where(eq(everifyCases.tenantId, tenantId))
      .orderBy(desc(everifyCases.submittedAt));
  }

  async getAllCases(): Promise<EverifyCase[]> {
    return await db.select()
      .from(everifyCases)
      .orderBy(desc(everifyCases.submittedAt));
  }

  async closeCase(caseId: string, resolutionNotes: string, resolvedById: string): Promise<EverifyCase> {
    const existingCase = await this.getCaseStatus(caseId);
    if (!existingCase) {
      throw new Error("Case not found");
    }

    if (!this.mockMode && existingCase.caseNumber) {
      try {
        await fetch(`${EVERIFY_API_URL}/cases/${existingCase.caseNumber}/close`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${Buffer.from(`${EVERIFY_USER_ID}:${EVERIFY_PASSWORD}`).toString("base64")}`,
          },
        });
      } catch (error) {
        console.error("[E-Verify] Error closing case with API:", error);
      }
    }

    const result = await db.update(everifyCases)
      .set({
        caseStatus: "closed",
        resolutionNotes,
        resolvedBy: resolvedById,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(everifyCases.id, caseId))
      .returning();

    return result[0];
  }

  async handleCallback(payload: any): Promise<void> {
    console.log("[E-Verify] Received callback:", JSON.stringify(payload));
    
    const { caseNumber, caseStatus, eligibilityStatement, photoMatchResult, tncReasonCode, tncDetails } = payload;
    
    if (!caseNumber) {
      console.error("[E-Verify] Callback missing case number");
      return;
    }

    const existingCase = await this.getCaseByNumber(caseNumber);
    if (!existingCase) {
      console.error("[E-Verify] Case not found for callback:", caseNumber);
      return;
    }

    await db.update(everifyCases)
      .set({
        caseStatus: caseStatus || existingCase.caseStatus,
        eligibilityStatement: eligibilityStatement || existingCase.eligibilityStatement,
        photoMatchResult: photoMatchResult || existingCase.photoMatchResult,
        tncReasonCode: tncReasonCode || existingCase.tncReasonCode,
        tncDetails: tncDetails || existingCase.tncDetails,
        everifyResponse: payload,
        updatedAt: new Date(),
      })
      .where(eq(everifyCases.id, existingCase.id));

    console.log("[E-Verify] Case updated from callback:", caseNumber);
  }

  async refreshCaseStatus(caseId: string): Promise<EverifyCase | null> {
    const existingCase = await this.getCaseStatus(caseId);
    if (!existingCase || !existingCase.caseNumber) {
      return null;
    }

    if (this.mockMode) {
      const mockUpdatedStatuses = ["authorized", "final_nonconfirmation"];
      const newStatus = mockUpdatedStatuses[Math.floor(Math.random() * mockUpdatedStatuses.length)];
      
      const result = await db.update(everifyCases)
        .set({
          caseStatus: newStatus,
          eligibilityStatement: newStatus === "authorized" ? "Employment Authorized" : "Final Nonconfirmation",
          updatedAt: new Date(),
        })
        .where(eq(everifyCases.id, caseId))
        .returning();
      
      return result[0];
    }

    try {
      const response = await fetch(`${EVERIFY_API_URL}/cases/${existingCase.caseNumber}`, {
        headers: {
          "Authorization": `Basic ${Buffer.from(`${EVERIFY_USER_ID}:${EVERIFY_PASSWORD}`).toString("base64")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh case status: ${response.status}`);
      }

      const apiResponse = await response.json();
      
      const result = await db.update(everifyCases)
        .set({
          caseStatus: apiResponse.caseStatus,
          eligibilityStatement: apiResponse.eligibilityStatement,
          photoMatchResult: apiResponse.photoMatchResult,
          tncReasonCode: apiResponse.tncReasonCode,
          tncDetails: apiResponse.tncDetails,
          everifyResponse: apiResponse,
          updatedAt: new Date(),
        })
        .where(eq(everifyCases.id, caseId))
        .returning();

      return result[0];
    } catch (error) {
      console.error("[E-Verify] Error refreshing case status:", error);
      return existingCase;
    }
  }
}

export const everifyService = new EVerifyService();
