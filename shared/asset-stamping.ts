/**
 * ORBIT Asset Stamping Utility
 * Automatically stamps any tangible output (documents, reports, deployments, etc) with
 * a unique hallmark asset number + QR code for verification
 * 
 * Used for: Invoices, paystubs, contracts, reports, certifications, deployments, etc.
 */

import { generateAssetNumber, type AssetType } from './asset-tracking';

export interface StampedAsset {
  assetNumber: string;
  type: AssetType;
  qrCode?: string;
  verificationUrl: string;
  createdAt: Date;
  metadata: Record<string, any>;
}

/**
 * Asset Stamping Service
 * Call this whenever you produce a tangible output that needs verification
 */
export class AssetStampingService {
  /**
   * Stamp any tangible output
   * @param type - Type of asset (invoice, paystub, contract, etc)
   * @param metadata - Context about the asset (franchiseeId, companyId, documentId, etc)
   * @returns StampedAsset with unique hallmark number & verification details
   */
  static stampAsset(
    type: AssetType,
    metadata: {
      franchiseeId?: string;
      customerId?: string;
      documentId?: string;
      documentType?: string;
      amount?: number;
      recipient?: string;
      createdBy?: string;
      [key: string]: any;
    }
  ): StampedAsset {
    const assetNumber = generateAssetNumber();
    const verificationUrl = `${process.env.APP_URL || 'https://orbitstaffing.io'}/verify/${assetNumber}`;
    
    return {
      assetNumber,
      type,
      verificationUrl,
      createdAt: new Date(),
      metadata: {
        ...metadata,
        stamped: true,
        stampedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Stamp an invoice
   */
  static stampInvoice(customerId: string, invoiceId: string, amount: number, metadata?: any) {
    return this.stampAsset('invoice', {
      customerId,
      documentId: invoiceId,
      documentType: 'invoice',
      amount,
      ...metadata,
    });
  }

  /**
   * Stamp a paystub
   */
  static stampPaystub(workerId: string, paystubId: string, amount: number, metadata?: any) {
    return this.stampAsset('paystub', {
      customerId: workerId,
      documentId: paystubId,
      documentType: 'paystub',
      amount,
      ...metadata,
    });
  }

  /**
   * Stamp a contract/agreement
   */
  static stampContract(franchiseeId: string, contractId: string, type: string, metadata?: any) {
    return this.stampAsset('contract', {
      franchiseeId,
      documentId: contractId,
      documentType: `contract_${type}`,
      ...metadata,
    });
  }

  /**
   * Stamp a report
   */
  static stampReport(franchiseeId: string, reportId: string, reportType: string, metadata?: any) {
    return this.stampAsset('report', {
      franchiseeId,
      documentId: reportId,
      reportType,
      ...metadata,
    });
  }

  /**
   * Stamp a new franchisee deployment
   */
  static stampDeployment(franchiseeId: string, domain: string, metadata?: any) {
    return this.stampAsset('deployment', {
      franchiseeId,
      domain,
      deploymentType: 'franchisee_instance',
      ...metadata,
    });
  }

  /**
   * Stamp a worker certification
   */
  static stampCertification(workerId: string, certId: string, certType: string, metadata?: any) {
    return this.stampAsset('certification', {
      customerId: workerId,
      documentId: certId,
      certificationType: certType,
      ...metadata,
    });
  }

  /**
   * Stamp generic document
   */
  static stampDocument(customerId: string, docId: string, docType: string, metadata?: any) {
    return this.stampAsset('document', {
      customerId,
      documentId: docId,
      documentType: docType,
      ...metadata,
    });
  }
}

/**
 * Format asset number for display
 * ORBIT-ASSET-20250123-A7X2K9 -> nicely formatted
 */
export function formatAssetNumber(assetNumber: string): string {
  return assetNumber.toUpperCase();
}

/**
 * Generate QR code data for asset verification
 * Returns the URL that should be encoded in the QR code
 */
export function getAssetQRCodeData(assetNumber: string): string {
  const domain = process.env.ASSET_VERIFICATION_URL || 'https://verify.orbitstaffing.io';
  return `${domain}/${assetNumber}`;
}
