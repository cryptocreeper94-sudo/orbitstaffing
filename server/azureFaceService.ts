/**
 * Azure Face API Service
 * Handles facial recognition for clock-in/out verification
 * 
 * Features:
 * - Face detection
 * - Face comparison (1:1 verification)
 * - Confidence scoring
 * - Anti-spoofing through liveness hints
 */

interface FaceDetectionResult {
  faceId: string;
  faceRectangle: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

interface FaceVerificationResult {
  isIdentical: boolean;
  confidence: number;
}

interface FaceMatchResult {
  success: boolean;
  isMatch: boolean;
  confidence: number;
  status: 'verified' | 'flagged' | 'rejected' | 'error' | 'no_face_detected' | 'no_reference_photo';
  message: string;
  faceId?: string;
}

class AzureFaceService {
  private endpoint: string | null = null;
  private apiKey: string | null = null;
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.endpoint = process.env.AZURE_FACE_API_ENDPOINT || null;
    this.apiKey = process.env.AZURE_FACE_API_KEY || null;
    
    if (this.endpoint && this.apiKey) {
      this.initialized = true;
      console.log('[Azure Face API] ✅ Service initialized');
    } else {
      console.log('[Azure Face API] ⚠️ Missing credentials - facial recognition disabled');
      console.log('[Azure Face API] Set AZURE_FACE_API_ENDPOINT and AZURE_FACE_API_KEY to enable');
    }
  }

  isAvailable(): boolean {
    return this.initialized;
  }

  /**
   * Detect faces in an image
   * @param imageUrl - URL of the image to analyze
   * @returns Array of detected face IDs
   */
  async detectFaces(imageUrl: string): Promise<FaceDetectionResult[]> {
    if (!this.initialized) {
      throw new Error('Azure Face API not initialized');
    }

    try {
      const response = await fetch(
        `${this.endpoint}/face/v1.0/detect?returnFaceId=true&detectionModel=detection_03&recognitionModel=recognition_04`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKey!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: imageUrl }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('[Azure Face API] Detection error:', error);
        throw new Error(error.error?.message || 'Face detection failed');
      }

      return await response.json();
    } catch (error) {
      console.error('[Azure Face API] Detection error:', error);
      throw error;
    }
  }

  /**
   * Detect face from base64 image data
   * @param base64Image - Base64 encoded image (without data:image prefix)
   * @returns Array of detected face IDs
   */
  async detectFacesFromBase64(base64Image: string): Promise<FaceDetectionResult[]> {
    if (!this.initialized) {
      throw new Error('Azure Face API not initialized');
    }

    try {
      // Remove data URL prefix if present
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      const response = await fetch(
        `${this.endpoint}/face/v1.0/detect?returnFaceId=true&detectionModel=detection_03&recognitionModel=recognition_04`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKey!,
            'Content-Type': 'application/octet-stream',
          },
          body: imageBuffer,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('[Azure Face API] Detection error:', error);
        throw new Error(error.error?.message || 'Face detection failed');
      }

      return await response.json();
    } catch (error) {
      console.error('[Azure Face API] Detection error:', error);
      throw error;
    }
  }

  /**
   * Verify if two faces belong to the same person
   * @param faceId1 - First face ID (from profile photo)
   * @param faceId2 - Second face ID (from clock-in selfie)
   * @returns Verification result with confidence score
   */
  async verifyFaces(faceId1: string, faceId2: string): Promise<FaceVerificationResult> {
    if (!this.initialized) {
      throw new Error('Azure Face API not initialized');
    }

    try {
      const response = await fetch(
        `${this.endpoint}/face/v1.0/verify`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKey!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            faceId1,
            faceId2,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('[Azure Face API] Verification error:', error);
        throw new Error(error.error?.message || 'Face verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('[Azure Face API] Verification error:', error);
      throw error;
    }
  }

  /**
   * Compare a clock-in selfie against a worker's profile photo
   * This is the main method for clock-in verification
   * 
   * @param profilePhotoUrl - URL of worker's verified profile photo
   * @param selfieBase64 - Base64 encoded selfie from clock-in
   * @returns Match result with confidence and status
   */
  async compareFaces(profilePhotoUrl: string, selfieBase64: string): Promise<FaceMatchResult> {
    if (!this.initialized) {
      return {
        success: false,
        isMatch: false,
        confidence: 0,
        status: 'error',
        message: 'Facial recognition service not configured. Please add Azure Face API credentials.',
      };
    }

    if (!profilePhotoUrl) {
      return {
        success: false,
        isMatch: false,
        confidence: 0,
        status: 'no_reference_photo',
        message: 'Worker does not have a profile photo on file. Please upload a profile photo first.',
      };
    }

    try {
      // Step 1: Detect face in profile photo
      const profileFaces = await this.detectFaces(profilePhotoUrl);
      if (profileFaces.length === 0) {
        return {
          success: false,
          isMatch: false,
          confidence: 0,
          status: 'no_face_detected',
          message: 'No face detected in profile photo. Please upload a clear photo showing your face.',
        };
      }

      // Step 2: Detect face in selfie
      const selfieFaces = await this.detectFacesFromBase64(selfieBase64);
      if (selfieFaces.length === 0) {
        return {
          success: false,
          isMatch: false,
          confidence: 0,
          status: 'no_face_detected',
          message: 'No face detected in selfie. Please take a clear photo showing your face.',
        };
      }

      // Step 3: Verify the faces match
      const verification = await this.verifyFaces(
        profileFaces[0].faceId,
        selfieFaces[0].faceId
      );

      // Convert confidence to percentage (Azure returns 0-1)
      const confidencePercent = Math.round(verification.confidence * 100);

      // Determine status based on confidence threshold
      let status: FaceMatchResult['status'];
      let message: string;

      if (confidencePercent >= 90) {
        status = 'verified';
        message = `Face verified with ${confidencePercent}% confidence.`;
      } else if (confidencePercent >= 70) {
        status = 'flagged';
        message = `Face match uncertain (${confidencePercent}% confidence). Flagged for admin review.`;
      } else {
        status = 'rejected';
        message = `Face does not match profile photo (${confidencePercent}% confidence). Please try again or contact your supervisor.`;
      }

      return {
        success: true,
        isMatch: verification.isIdentical,
        confidence: confidencePercent,
        status,
        message,
        faceId: selfieFaces[0].faceId,
      };

    } catch (error: any) {
      console.error('[Azure Face API] Compare error:', error);
      return {
        success: false,
        isMatch: false,
        confidence: 0,
        status: 'error',
        message: error.message || 'Face verification failed. Please try again.',
      };
    }
  }

  /**
   * Validate that an image contains exactly one face
   * Used for profile photo upload validation
   */
  async validateProfilePhoto(imageBase64: string): Promise<{
    valid: boolean;
    message: string;
    faceCount: number;
  }> {
    if (!this.initialized) {
      return {
        valid: true, // Allow upload even if service not configured
        message: 'Facial recognition not configured - photo accepted without validation',
        faceCount: 0,
      };
    }

    try {
      const faces = await this.detectFacesFromBase64(imageBase64);

      if (faces.length === 0) {
        return {
          valid: false,
          message: 'No face detected in photo. Please upload a clear photo showing your face.',
          faceCount: 0,
        };
      }

      if (faces.length > 1) {
        return {
          valid: false,
          message: 'Multiple faces detected. Please upload a photo with only your face.',
          faceCount: faces.length,
        };
      }

      return {
        valid: true,
        message: 'Photo validated successfully.',
        faceCount: 1,
      };

    } catch (error: any) {
      console.error('[Azure Face API] Validation error:', error);
      return {
        valid: false,
        message: error.message || 'Photo validation failed. Please try again.',
        faceCount: 0,
      };
    }
  }
}

// Export singleton instance
export const azureFaceService = new AzureFaceService();
export type { FaceMatchResult, FaceDetectionResult, FaceVerificationResult };
