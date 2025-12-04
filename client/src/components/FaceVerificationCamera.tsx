import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, CheckCircle2, AlertTriangle, XCircle, RefreshCw, User, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FaceVerificationCameraProps {
  workerId: string;
  mode: 'profile' | 'clock-in' | 'clock-out';
  onCapture: (photoBase64: string) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  profilePhotoUrl?: string;
}

interface VerificationStatus {
  status: 'idle' | 'capturing' | 'processing' | 'verified' | 'flagged' | 'rejected' | 'error';
  confidence?: number;
  message?: string;
}

export function FaceVerificationCamera({
  workerId,
  mode,
  onCapture,
  onCancel,
  isSubmitting = false,
  profilePhotoUrl,
}: FaceVerificationCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({ status: 'idle' });
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        setVerificationStatus({ status: 'capturing' });
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please allow camera access and try again.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0);
    
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(photoDataUrl);
    stopCamera();
    setVerificationStatus({ status: 'processing', message: 'Analyzing photo...' });
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
    setVerificationStatus({ status: 'idle' });
    startCamera();
  }, [startCamera]);

  const submitPhoto = useCallback(async () => {
    if (!capturedPhoto) return;
    
    setVerificationStatus({ status: 'processing', message: 'Verifying identity...' });
    
    try {
      const base64Data = capturedPhoto.split(',')[1];
      await onCapture(base64Data);
      setVerificationStatus({ status: 'verified', message: 'Photo submitted successfully' });
    } catch (err: any) {
      console.error('Photo submission error:', err);
      setVerificationStatus({ 
        status: 'error', 
        message: err.message || 'Failed to submit photo. Please try again.' 
      });
    }
  }, [capturedPhoto, onCapture]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const getModeTitle = () => {
    switch (mode) {
      case 'profile': return 'Upload Profile Photo';
      case 'clock-in': return 'Clock-In Verification';
      case 'clock-out': return 'Clock-Out Verification';
      default: return 'Face Verification';
    }
  };

  const getModeDescription = () => {
    switch (mode) {
      case 'profile': return 'Take a clear photo of your face for identity verification';
      case 'clock-in': return 'Take a selfie to verify your identity when clocking in';
      case 'clock-out': return 'Take a selfie to verify your identity when clocking out';
      default: return 'Take a photo for verification';
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus.status) {
      case 'verified':
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case 'flagged':
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-8 w-8 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus.status) {
      case 'verified': return 'border-green-500 bg-green-500/10';
      case 'flagged': return 'border-yellow-500 bg-yellow-500/10';
      case 'rejected': return 'border-red-500 bg-red-500/10';
      case 'processing': return 'border-cyan-500 bg-cyan-500/10';
      default: return 'border-slate-700';
    }
  };

  return (
    <Card className="bg-slate-900/90 border-slate-700 max-w-lg mx-auto" data-testid="face-verification-camera">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <Shield className="h-8 w-8 text-cyan-400" />
          </div>
        </div>
        <CardTitle className="text-white">{getModeTitle()}</CardTitle>
        <CardDescription className="text-slate-400">{getModeDescription()}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {mode !== 'profile' && profilePhotoUrl && (
          <div className="flex items-center justify-center gap-4 p-3 bg-slate-800/50 rounded-lg mb-4">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Profile Photo</p>
              <img 
                src={profilePhotoUrl} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
              />
            </div>
            <div className="text-slate-500">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Live Selfie</p>
              <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center overflow-hidden ${getStatusColor()}`}>
                {capturedPhoto ? (
                  <img src={capturedPhoto} alt="Selfie" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-slate-500" />
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center" data-testid="camera-error">
            {error}
          </div>
        )}

        <div className={`relative aspect-[4/3] bg-slate-800 rounded-lg overflow-hidden border-2 ${getStatusColor()}`}>
          {!cameraActive && !capturedPhoto && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
              <Camera className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-sm">Camera not active</p>
              <p className="text-xs text-slate-500 mt-1">Click "Start Camera" to begin</p>
            </div>
          )}
          
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${cameraActive ? '' : 'hidden'}`}
            data-testid="camera-video"
          />
          
          {capturedPhoto && (
            <img 
              src={capturedPhoto} 
              alt="Captured" 
              className="w-full h-full object-cover"
              data-testid="captured-photo"
            />
          )}
          
          {verificationStatus.status !== 'idle' && verificationStatus.status !== 'capturing' && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-center gap-2">
                {getStatusIcon()}
                {verificationStatus.confidence !== undefined && (
                  <span className={`text-lg font-bold ${
                    verificationStatus.status === 'verified' ? 'text-green-400' :
                    verificationStatus.status === 'flagged' ? 'text-yellow-400' :
                    verificationStatus.status === 'rejected' ? 'text-red-400' :
                    'text-cyan-400'
                  }`}>
                    {verificationStatus.confidence}%
                  </span>
                )}
              </div>
              {verificationStatus.message && (
                <p className="text-center text-sm text-white/80 mt-1">{verificationStatus.message}</p>
              )}
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {!cameraActive && !capturedPhoto && (
            <>
              <Button
                onClick={startCamera}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                data-testid="start-camera-button"
              >
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
              {onCancel && (
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="flex-1 border-slate-600"
                  data-testid="cancel-button"
                >
                  Cancel
                </Button>
              )}
            </>
          )}
          
          {cameraActive && (
            <>
              <Button
                onClick={capturePhoto}
                className="flex-1 bg-green-600 hover:bg-green-700"
                data-testid="capture-button"
              >
                <Camera className="mr-2 h-4 w-4" />
                Capture Photo
              </Button>
              <Button
                onClick={() => {
                  stopCamera();
                  onCancel?.();
                }}
                variant="outline"
                className="flex-1 border-slate-600"
                data-testid="stop-camera-button"
              >
                Cancel
              </Button>
            </>
          )}
          
          {capturedPhoto && verificationStatus.status !== 'verified' && (
            <>
              <Button
                onClick={submitPhoto}
                disabled={isSubmitting || verificationStatus.status === 'processing'}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                data-testid="submit-photo-button"
              >
                {isSubmitting || verificationStatus.status === 'processing' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Submit Photo
                  </>
                )}
              </Button>
              <Button
                onClick={retakePhoto}
                disabled={isSubmitting || verificationStatus.status === 'processing'}
                variant="outline"
                className="flex-1 border-slate-600"
                data-testid="retake-button"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retake
              </Button>
            </>
          )}
          
          {verificationStatus.status === 'verified' && onCancel && (
            <Button
              onClick={onCancel}
              className="flex-1 bg-green-600 hover:bg-green-700"
              data-testid="done-button"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Done
            </Button>
          )}
        </div>

        <div className="pt-4 border-t border-slate-700">
          <h4 className="text-sm font-medium text-white mb-2">Tips for a clear photo:</h4>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• Face the camera directly with good lighting</li>
            <li>• Remove sunglasses, hats, or face coverings</li>
            <li>• Keep a neutral expression</li>
            <li>• Ensure your whole face is visible in the frame</li>
          </ul>
        </div>

        {mode !== 'profile' && (
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span>This photo is compared against your profile photo to prevent buddy punching</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProfilePhotoUpload({ 
  workerId, 
  currentPhotoUrl,
  onPhotoUpdated 
}: { 
  workerId: string;
  currentPhotoUrl?: string;
  onPhotoUpdated?: () => void;
}) {
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCapture = async (photoBase64: string) => {
    setUploading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/workers/${workerId}/profile-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoBase64 }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload photo');
      }
      
      setSuccess(true);
      setShowCamera(false);
      onPhotoUpdated?.();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  if (showCamera) {
    return (
      <FaceVerificationCamera
        workerId={workerId}
        mode="profile"
        onCapture={handleCapture}
        onCancel={() => setShowCamera(false)}
        isSubmitting={uploading}
      />
    );
  }

  return (
    <Card className="bg-slate-900/90 border-slate-700" data-testid="profile-photo-upload">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Camera className="h-5 w-5 text-cyan-400" />
          Profile Photo
        </CardTitle>
        <CardDescription className="text-slate-400">
          Your profile photo is used for identity verification during clock-in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentPhotoUrl ? (
          <div className="flex flex-col items-center gap-4">
            <img 
              src={currentPhotoUrl} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-2 border-cyan-500"
              data-testid="current-profile-photo"
            />
            <p className="text-sm text-green-400">Photo on file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-32 h-32 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center">
              <User className="h-16 w-16 text-slate-600" />
            </div>
            <p className="text-sm text-slate-400">No photo uploaded</p>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm text-center">
            Photo uploaded successfully! Pending admin verification.
          </div>
        )}
        
        <Button
          onClick={() => setShowCamera(true)}
          className="w-full bg-cyan-600 hover:bg-cyan-700"
          data-testid="upload-photo-button"
        >
          <Camera className="mr-2 h-4 w-4" />
          {currentPhotoUrl ? 'Update Photo' : 'Take Photo'}
        </Button>
      </CardContent>
    </Card>
  );
}
