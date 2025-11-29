/**
 * ORBIT Staffing OS - E-Signature Service
 * 
 * Digital signature system for onboarding documents:
 * - Offer letters
 * - NDAs
 * - I-9 forms
 * - W-4 forms
 * - Direct deposit authorization
 * - Equipment agreements
 * 
 * Features:
 * - In-app signature capture
 * - Audit trail with IP address and timestamp
 * - Document templates
 * - Signature verification
 */

import { storage } from './storage';

// ========================
// TYPES
// ========================

export type DocumentType = 
  | 'offer_letter'
  | 'nda'
  | 'i9'
  | 'w4'
  | 'direct_deposit'
  | 'equipment_agreement'
  | 'background_check_consent'
  | 'drug_test_consent'
  | 'handbook_acknowledgment'
  | 'safety_training'
  | 'custom';

export interface SignatureData {
  signatureImage?: string; // Base64 encoded signature image
  signatureName: string; // Typed name
  signatureDate: Date;
  signatureIpAddress: string;
  signatureUserAgent?: string;
  signatureLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface DocumentSignature {
  id: string;
  documentId: string;
  documentType: DocumentType;
  signerId: string;
  signerName: string;
  signerEmail?: string;
  status: 'pending' | 'signed' | 'declined' | 'expired';
  signatureData?: SignatureData;
  requestedAt: Date;
  signedAt?: Date;
  expiresAt?: Date;
  declinedReason?: string;
}

export interface DocumentTemplate {
  id: string;
  type: DocumentType;
  name: string;
  description: string;
  content: string; // HTML template with placeholders
  requiredFields: string[];
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignatureRequest {
  documentType: DocumentType;
  templateId?: string;
  signerId: string;
  signerName: string;
  signerEmail?: string;
  expiresInDays?: number;
  customContent?: string;
  fieldData?: Record<string, string>;
  sendEmail?: boolean;
  sendSms?: boolean;
}

export interface SignatureVerification {
  isValid: boolean;
  signedAt?: Date;
  signerName?: string;
  ipAddress?: string;
  documentHash?: string;
  errors?: string[];
}

// ========================
// DOCUMENT TEMPLATES
// ========================

const DOCUMENT_TEMPLATES: Record<DocumentType, DocumentTemplate> = {
  offer_letter: {
    id: 'tpl_offer_letter',
    type: 'offer_letter',
    name: 'Employment Offer Letter',
    description: 'Standard offer letter for temporary/contract workers',
    content: `
      <div class="document">
        <h1>Employment Offer Letter</h1>
        <p>Date: {{date}}</p>
        <p>Dear {{workerName}},</p>
        <p>We are pleased to offer you a position as <strong>{{jobTitle}}</strong> with {{companyName}}.</p>
        
        <h2>Position Details</h2>
        <ul>
          <li><strong>Start Date:</strong> {{startDate}}</li>
          <li><strong>Pay Rate:</strong> ` + `$` + `{{payRate}}/hour</li>
          <li><strong>Work Location:</strong> {{workLocation}}</li>
          <li><strong>Schedule:</strong> {{schedule}}</li>
        </ul>
        
        <h2>Terms</h2>
        <p>This is a temporary/contract position. Employment is at-will and may be terminated by either party at any time.</p>
        
        <p>By signing below, you accept this offer and agree to the terms outlined above.</p>
        
        <div class="signature-block">
          <p>Signature: ___________________________</p>
          <p>Printed Name: {{workerName}}</p>
          <p>Date: {{signatureDate}}</p>
        </div>
      </div>
    `,
    requiredFields: ['workerName', 'jobTitle', 'companyName', 'startDate', 'payRate', 'workLocation', 'schedule'],
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  nda: {
    id: 'tpl_nda',
    type: 'nda',
    name: 'Non-Disclosure Agreement',
    description: 'Standard NDA for protecting confidential information',
    content: `
      <div class="document">
        <h1>Non-Disclosure Agreement</h1>
        <p>This Non-Disclosure Agreement ("Agreement") is entered into as of {{date}} between:</p>
        <p><strong>Company:</strong> {{companyName}}</p>
        <p><strong>Worker:</strong> {{workerName}}</p>
        
        <h2>Confidential Information</h2>
        <p>The Worker agrees to hold in confidence and not disclose any confidential information belonging to the Company or its clients, including but not limited to:</p>
        <ul>
          <li>Client lists and contact information</li>
          <li>Business processes and procedures</li>
          <li>Pricing and financial information</li>
          <li>Trade secrets and proprietary methods</li>
        </ul>
        
        <h2>Duration</h2>
        <p>This agreement remains in effect for 2 years after the termination of employment.</p>
        
        <div class="signature-block">
          <p>Signature: ___________________________</p>
          <p>Printed Name: {{workerName}}</p>
          <p>Date: {{signatureDate}}</p>
        </div>
      </div>
    `,
    requiredFields: ['workerName', 'companyName'],
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  i9: {
    id: 'tpl_i9',
    type: 'i9',
    name: 'I-9 Employment Eligibility Verification',
    description: 'Federal I-9 form for verifying employment eligibility',
    content: `
      <div class="document">
        <h1>Form I-9: Employment Eligibility Verification</h1>
        <p><strong>Department of Homeland Security - U.S. Citizenship and Immigration Services</strong></p>
        
        <h2>Section 1: Employee Information and Attestation</h2>
        <p>I attest, under penalty of perjury, that I am (check one of the following boxes):</p>
        <ul>
          <li>☐ A citizen of the United States</li>
          <li>☐ A noncitizen national of the United States</li>
          <li>☐ A lawful permanent resident (Alien Registration Number/USCIS Number: ________)</li>
          <li>☐ An alien authorized to work until (expiration date): ________</li>
        </ul>
        
        <p><strong>Employee Name:</strong> {{workerName}}</p>
        <p><strong>Date of Birth:</strong> {{dateOfBirth}}</p>
        <p><strong>SSN (last 4):</strong> {{ssnLast4}}</p>
        
        <div class="signature-block">
          <p>Signature: ___________________________</p>
          <p>Date: {{signatureDate}}</p>
        </div>
        
        <p><em>Note: This is a summary. Complete I-9 form must be completed with List A, B, or C documents.</em></p>
      </div>
    `,
    requiredFields: ['workerName', 'dateOfBirth', 'ssnLast4'],
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  w4: {
    id: 'tpl_w4',
    type: 'w4',
    name: 'W-4 Employee Withholding Certificate',
    description: 'IRS W-4 form for tax withholding',
    content: `
      <div class="document">
        <h1>Form W-4: Employee's Withholding Certificate</h1>
        <p><strong>Internal Revenue Service</strong></p>
        
        <h2>Employee Information</h2>
        <p><strong>Name:</strong> {{workerName}}</p>
        <p><strong>Social Security Number:</strong> XXX-XX-{{ssnLast4}}</p>
        <p><strong>Address:</strong> {{address}}</p>
        
        <h2>Filing Status</h2>
        <p>☐ Single or Married filing separately</p>
        <p>☐ Married filing jointly</p>
        <p>☐ Head of household</p>
        
        <h2>Certification</h2>
        <p>Under penalties of perjury, I declare that this certificate, to the best of my knowledge and belief, is true, correct, and complete.</p>
        
        <div class="signature-block">
          <p>Signature: ___________________________</p>
          <p>Date: {{signatureDate}}</p>
        </div>
      </div>
    `,
    requiredFields: ['workerName', 'ssnLast4', 'address'],
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  direct_deposit: {
    id: 'tpl_direct_deposit',
    type: 'direct_deposit',
    name: 'Direct Deposit Authorization',
    description: 'Authorization form for direct deposit payments',
    content: `
      <div class="document">
        <h1>Direct Deposit Authorization Form</h1>
        
        <h2>Employee Information</h2>
        <p><strong>Name:</strong> {{workerName}}</p>
        <p><strong>Employee ID:</strong> {{employeeId}}</p>
        
        <h2>Bank Account Information</h2>
        <p><strong>Bank Name:</strong> {{bankName}}</p>
        <p><strong>Account Type:</strong> ☐ Checking  ☐ Savings</p>
        <p><strong>Routing Number:</strong> {{routingNumber}}</p>
        <p><strong>Account Number:</strong> {{accountNumber}}</p>
        
        <h2>Authorization</h2>
        <p>I hereby authorize {{companyName}} to deposit my pay directly into the account specified above. I understand that it may take up to two pay periods for direct deposit to begin.</p>
        
        <div class="signature-block">
          <p>Signature: ___________________________</p>
          <p>Printed Name: {{workerName}}</p>
          <p>Date: {{signatureDate}}</p>
        </div>
      </div>
    `,
    requiredFields: ['workerName', 'employeeId', 'bankName', 'routingNumber', 'accountNumber', 'companyName'],
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  equipment_agreement: {
    id: 'tpl_equipment',
    type: 'equipment_agreement',
    name: 'Equipment Acknowledgment',
    description: 'Agreement for issued equipment and PPE',
    content: `
      <div class="document">
        <h1>Equipment Acknowledgment Form</h1>
        
        <h2>Employee Information</h2>
        <p><strong>Name:</strong> {{workerName}}</p>
        <p><strong>Date:</strong> {{date}}</p>
        
        <h2>Equipment Issued</h2>
        <p>I acknowledge receipt of the following equipment:</p>
        <ul>
          {{equipmentList}}
        </ul>
        
        <h2>Terms</h2>
        <p>I agree to:</p>
        <ul>
          <li>Use this equipment only for work purposes</li>
          <li>Return all equipment upon termination of employment</li>
          <li>Report any damage or loss immediately</li>
          <li>Pay for replacement of lost or damaged equipment (reasonable wear excluded)</li>
        </ul>
        
        <div class="signature-block">
          <p>Signature: ___________________________</p>
          <p>Printed Name: {{workerName}}</p>
          <p>Date: {{signatureDate}}</p>
        </div>
      </div>
    `,
    requiredFields: ['workerName', 'equipmentList'],
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  background_check_consent: {
    id: 'tpl_bg_check',
    type: 'background_check_consent',
    name: 'Background Check Authorization',
    description: 'Consent for background check investigation',
    content: `
      <div class="document">
        <h1>Background Check Authorization</h1>
        
        <h2>Applicant Information</h2>
        <p><strong>Name:</strong> {{workerName}}</p>
        <p><strong>Date of Birth:</strong> {{dateOfBirth}}</p>
        
        <h2>Authorization</h2>
        <p>I hereby authorize {{companyName}} and its designated agents to conduct a background investigation, which may include:</p>
        <ul>
          <li>Criminal history records check</li>
          <li>Employment verification</li>
          <li>Education verification</li>
          <li>Reference checks</li>
          <li>Drug screening</li>
        </ul>
        
        <p>I understand that I have the right to request a copy of any report prepared and to dispute any inaccurate information.</p>
        
        <div class="signature-block">
          <p>Signature: ___________________________</p>
          <p>Printed Name: {{workerName}}</p>
          <p>Date: {{signatureDate}}</p>
        </div>
      </div>
    `,
    requiredFields: ['workerName', 'dateOfBirth', 'companyName'],
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  drug_test_consent: {
    id: 'tpl_drug_test',
    type: 'drug_test_consent',
    name: 'Drug Testing Consent',
    description: 'Consent for drug testing',
    content: `
      <div class="document">
        <h1>Drug Testing Consent Form</h1>
        
        <p>I, {{workerName}}, hereby consent to drug and/or alcohol testing as a condition of employment with {{companyName}}.</p>
        
        <p>I understand that:</p>
        <ul>
          <li>Testing may occur pre-employment, randomly, post-accident, or for reasonable suspicion</li>
          <li>Positive results may result in termination or withdrawal of job offer</li>
          <li>Refusal to test will be treated as a positive result</li>
          <li>Results are confidential and shared only on a need-to-know basis</li>
        </ul>
        
        <div class="signature-block">
          <p>Signature: ___________________________</p>
          <p>Printed Name: {{workerName}}</p>
          <p>Date: {{signatureDate}}</p>
        </div>
      </div>
    `,
    requiredFields: ['workerName', 'companyName'],
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  handbook_acknowledgment: {
    id: 'tpl_handbook',
    type: 'handbook_acknowledgment',
    name: 'Employee Handbook Acknowledgment',
    description: 'Acknowledgment of receiving employee handbook',
    content: `
      <div class="document">
        <h1>Employee Handbook Acknowledgment</h1>
        
        <p>I, {{workerName}}, acknowledge that I have received a copy of the {{companyName}} Employee Handbook.</p>
        
        <p>I understand that:</p>
        <ul>
          <li>I am responsible for reading and understanding the policies</li>
          <li>The handbook does not constitute an employment contract</li>
          <li>Policies may be updated at any time</li>
          <li>I should direct questions to my supervisor or HR</li>
        </ul>
        
        <div class="signature-block">
          <p>Signature: ___________________________</p>
          <p>Printed Name: {{workerName}}</p>
          <p>Date: {{signatureDate}}</p>
        </div>
      </div>
    `,
    requiredFields: ['workerName', 'companyName'],
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  safety_training: {
    id: 'tpl_safety',
    type: 'safety_training',
    name: 'Safety Training Acknowledgment',
    description: 'Acknowledgment of completing safety training',
    content: `
      <div class="document">
        <h1>Safety Training Acknowledgment</h1>
        
        <p>I, {{workerName}}, certify that I have completed the following safety training:</p>
        
        <ul>
          {{trainingList}}
        </ul>
        
        <p>I understand my responsibility to:</p>
        <ul>
          <li>Follow all safety procedures</li>
          <li>Use provided PPE correctly</li>
          <li>Report safety hazards immediately</li>
          <li>Participate in required safety meetings</li>
        </ul>
        
        <div class="signature-block">
          <p>Signature: ___________________________</p>
          <p>Printed Name: {{workerName}}</p>
          <p>Date: {{signatureDate}}</p>
        </div>
      </div>
    `,
    requiredFields: ['workerName', 'trainingList'],
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  custom: {
    id: 'tpl_custom',
    type: 'custom',
    name: 'Custom Document',
    description: 'Custom document with user-provided content',
    content: '{{customContent}}',
    requiredFields: ['customContent'],
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

// ========================
// SIGNATURE FUNCTIONS
// ========================

export function getDocumentTemplate(type: DocumentType): DocumentTemplate {
  return DOCUMENT_TEMPLATES[type];
}

export function getAllTemplates(): DocumentTemplate[] {
  return Object.values(DOCUMENT_TEMPLATES);
}

export function renderDocument(
  template: DocumentTemplate,
  data: Record<string, string>
): string {
  let content = template.content;
  
  // Replace placeholders
  for (const [key, value] of Object.entries(data)) {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  // Add signature date if not provided
  if (!data.signatureDate) {
    content = content.replace(/{{signatureDate}}/g, new Date().toLocaleDateString());
  }
  
  // Add current date if not provided
  if (!data.date) {
    content = content.replace(/{{date}}/g, new Date().toLocaleDateString());
  }
  
  return content;
}

export function createSignatureRequest(request: SignatureRequest): DocumentSignature {
  const template = DOCUMENT_TEMPLATES[request.documentType];
  const expiresAt = request.expiresInDays 
    ? new Date(Date.now() + request.expiresInDays * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
  
  return {
    id: `sig_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    documentId: request.templateId || template.id,
    documentType: request.documentType,
    signerId: request.signerId,
    signerName: request.signerName,
    signerEmail: request.signerEmail,
    status: 'pending',
    requestedAt: new Date(),
    expiresAt,
  };
}

export function recordSignature(
  signature: DocumentSignature,
  signatureData: SignatureData
): DocumentSignature {
  return {
    ...signature,
    status: 'signed',
    signatureData,
    signedAt: new Date(),
  };
}

export function verifySignature(signature: DocumentSignature): SignatureVerification {
  const errors: string[] = [];
  
  if (signature.status !== 'signed') {
    errors.push('Document has not been signed');
  }
  
  if (!signature.signatureData) {
    errors.push('No signature data found');
  }
  
  if (signature.expiresAt && new Date() > signature.expiresAt) {
    errors.push('Signature request has expired');
  }
  
  if (!signature.signatureData?.signatureName) {
    errors.push('Missing signer name');
  }
  
  if (!signature.signatureData?.signatureIpAddress) {
    errors.push('Missing IP address for audit trail');
  }
  
  return {
    isValid: errors.length === 0,
    signedAt: signature.signedAt,
    signerName: signature.signatureData?.signatureName,
    ipAddress: signature.signatureData?.signatureIpAddress,
    documentHash: signature.id, // In production, use actual document hash
    errors: errors.length > 0 ? errors : undefined,
  };
}

// ========================
// AUDIT TRAIL
// ========================

export interface SignatureAuditEntry {
  timestamp: Date;
  action: 'requested' | 'viewed' | 'signed' | 'declined' | 'expired' | 'voided';
  signatureId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

export function createAuditEntry(
  signatureId: string,
  action: SignatureAuditEntry['action'],
  details?: Partial<SignatureAuditEntry>
): SignatureAuditEntry {
  return {
    timestamp: new Date(),
    action,
    signatureId,
    ...details,
  };
}

// ========================
// BATCH SIGNATURES
// ========================

export interface OnboardingPacket {
  workerId: string;
  workerName: string;
  workerEmail?: string;
  documents: DocumentType[];
  fieldData: Record<string, string>;
}

export function createOnboardingPacket(packet: OnboardingPacket): DocumentSignature[] {
  return packet.documents.map(docType => 
    createSignatureRequest({
      documentType: docType,
      signerId: packet.workerId,
      signerName: packet.workerName,
      signerEmail: packet.workerEmail,
      expiresInDays: 7,
      fieldData: packet.fieldData,
    })
  );
}

export function getStandardOnboardingDocuments(): DocumentType[] {
  return [
    'offer_letter',
    'nda',
    'i9',
    'w4',
    'direct_deposit',
    'background_check_consent',
    'drug_test_consent',
    'handbook_acknowledgment',
  ];
}
