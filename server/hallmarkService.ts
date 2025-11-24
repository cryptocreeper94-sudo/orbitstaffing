/**
 * Hallmark Service
 * Generates unique UPC codes and QR codes for all ORBIT assets
 * Every business card, paystub, invoice, contract automatically gets a hallmark stamp
 */

import { v4 as uuidv4 } from 'crypto-random-string';

interface HallmarkConfig {
  assetType: 'business_card' | 'paystub' | 'invoice' | 'contract' | 'report' | 'certification';
  ownerId: string;
  ownerName: string;
  metadata?: Record<string, any>;
  stampColor?: string; // hex color for the stamp (default: gold #FFD700)
}

interface GeneratedHallmark {
  hallmarkId: string;
  upcCode: string;
  serialNumber: string;
  qrCodeData: string;
  verificationUrl: string;
  stampColor: string;
  generatedAt: Date;
}

export class HallmarkService {
  private static readonly HALLMARK_PREFIX = 'ORBIT-ASSET';
  private static readonly DEFAULT_STAMP_COLOR = '#FFD700'; // Gold

  /**
   * Generate unique hallmark for any asset
   * Format: ORBIT-ASSET-XXXXXX-XXXXXX (20 chars total)
   */
  static generateHallmark(config: HallmarkConfig): GeneratedHallmark {
    const timestamp = Date.now().toString(36).toUpperCase().slice(-6); // Last 6 chars of timestamp
    const random = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 random alphanumeric
    
    const hallmarkId = `${this.HALLMARK_PREFIX}-${timestamp}-${random}`;
    const serialNumber = `${hallmarkId.replace(/^ORBIT-/, '')}`; // Remove prefix for serial display
    
    // UPC format for print (12 digits)
    const upcCode = this.generateUPC();
    
    // QR Code data: verifiable asset URL
    const verificationUrl = `/verify/${hallmarkId}`;
    const qrCodeData = JSON.stringify({
      hallmarkId,
      assetType: config.assetType,
      ownerId: config.ownerId,
      ownerName: config.ownerName,
      generatedAt: new Date().toISOString(),
      verificationUrl,
      metadata: config.metadata || {}
    });

    return {
      hallmarkId,
      upcCode,
      serialNumber,
      qrCodeData,
      verificationUrl,
      stampColor: config.stampColor || this.DEFAULT_STAMP_COLOR,
      generatedAt: new Date()
    };
  }

  /**
   * Generate 12-digit UPC code (EAN-13 compatible)
   */
  private static generateUPC(): string {
    const digits = [];
    for (let i = 0; i < 11; i++) {
      digits.push(Math.floor(Math.random() * 10));
    }
    
    // Calculate check digit
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    digits.push(checkDigit);
    
    return digits.join('');
  }

  /**
   * Generate HTML stamp to overlay on assets
   */
  static generateStampHTML(hallmark: GeneratedHallmark, size: 'small' | 'medium' | 'large' = 'small'): string {
    const sizes = {
      small: { qrWidth: 40, fontSize: 6, padding: 4 },
      medium: { qrWidth: 60, fontSize: 8, padding: 6 },
      large: { qrWidth: 80, fontSize: 10, padding: 8 }
    };
    
    const s = sizes[size];
    
    return `
      <div class="hallmark-stamp" style="
        position: absolute;
        bottom: 8px;
        left: 8px;
        padding: ${s.padding}px;
        background: rgba(0, 0, 0, 0.85);
        border: 2px solid ${hallmark.stampColor};
        border-radius: 4px;
        z-index: 1000;
        font-family: 'Courier New', monospace;
      ">
        <div style="margin-bottom: 4px;">
          <img 
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${s.qrWidth}' height='${s.qrWidth}'%3E%3Crect fill='white' width='${s.qrWidth}' height='${s.qrWidth}'/%3E%3C/svg%3E"
            alt="QR"
            width="${s.qrWidth}"
            height="${s.qrWidth}"
            style="display: block; border: 1px solid ${hallmark.stampColor};"
          />
        </div>
        <div style="
          color: ${hallmark.stampColor};
          font-size: ${s.fontSize}px;
          font-weight: bold;
          letter-spacing: 1px;
          text-align: center;
          margin-top: 2px;
        ">${hallmark.serialNumber}</div>
        <div style="
          color: #999;
          font-size: ${s.fontSize - 2}px;
          text-align: center;
          margin-top: 1px;
        ">UPC: ${hallmark.upcCode}</div>
      </div>
    `;
  }

  /**
   * Generate CSS for hallmark styling
   */
  static getStampCSS(): string {
    return `
      .hallmark-stamp {
        pointer-events: none;
      }
      .hallmark-stamp img {
        image-rendering: pixelated;
      }
    `;
  }
}
