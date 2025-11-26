import { useState, useRef, useEffect } from 'react';
import { X, Camera as CameraIcon, Video as VideoIcon, Circle, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CameraModal({ isOpen, onClose }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'video' | 'photo'>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Initialize camera on mount
  useEffect(() => {
    if (!isOpen) return;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: mode === 'video', // Only request audio for video mode
        });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        toast.error('Unable to access camera');
        onClose();
      }
    };

    initCamera();

    return () => {
      // Cleanup: stop all tracks
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isOpen, mode]);

  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    // Convert to image and download
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `photo-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Photo captured and saved');
      }
    });
  };

  const handleStartRecording = () => {
    if (!mediaStream) return;

    recordedChunksRef.current = [];
    const options: MediaRecorderOptions = { mimeType: 'video/webm;codecs=vp9' };
    
    try {
      const mediaRecorder = new MediaRecorder(mediaStream, options);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Video recorded and saved');
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      toast.error('Unable to start recording');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleModeChange = (newMode: 'video' | 'photo') => {
    if (isRecording) {
      handleStopRecording();
    }
    setMode(newMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/50 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-cyan-500/30 flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <CameraIcon className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Camera</h2>
            <span className="text-xs text-cyan-300">Photo • Video</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300"
            data-testid="button-close-camera"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => handleModeChange('photo')}
              variant={mode === 'photo' ? 'default' : 'outline'}
              className={`flex-1 gap-2 ${
                mode === 'photo'
                  ? 'bg-cyan-600 hover:bg-cyan-700'
                  : 'border-slate-600 hover:bg-slate-700'
              }`}
              data-testid="button-photo-mode"
            >
              <Square className="w-4 h-4" />
              Photo
            </Button>
            <Button
              onClick={() => handleModeChange('video')}
              variant={mode === 'video' ? 'default' : 'outline'}
              className={`flex-1 gap-2 ${
                mode === 'video'
                  ? 'bg-cyan-600 hover:bg-cyan-700'
                  : 'border-slate-600 hover:bg-slate-700'
              }`}
              data-testid="button-video-mode"
            >
              <VideoIcon className="w-4 h-4" />
              Video
            </Button>
          </div>

          {/* Video Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              data-testid="video-preview"
            />
            {isRecording && (
              <div className="absolute top-4 right-4 bg-red-600 rounded-full p-2 animate-pulse">
                <Circle className="w-4 h-4 text-white fill-white" />
              </div>
            )}
          </div>

          {/* Hidden Canvas for Photo Capture */}
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
            data-testid="capture-canvas"
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            {mode === 'photo' ? (
              <Button
                onClick={handleTakePhoto}
                className="flex-1 gap-2 bg-cyan-600 hover:bg-cyan-700"
                data-testid="button-take-photo"
              >
                <CameraIcon className="w-4 h-4" />
                Capture Photo
              </Button>
            ) : (
              <>
                <Button
                  onClick={
                    isRecording
                      ? handleStopRecording
                      : handleStartRecording
                  }
                  className={`flex-1 gap-2 ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-cyan-600 hover:bg-cyan-700'
                  }`}
                  data-testid={`button-${isRecording ? 'stop' : 'start'}-recording`}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-4 h-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" />
                      Start Recording
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Info */}
          <div className="text-xs text-gray-400 text-center">
            {mode === 'photo'
              ? 'Click "Capture Photo" to take a snapshot'
              : isRecording
              ? 'Recording... Click "Stop Recording" to save'
              : 'Click "Start Recording" to record video'}
          </div>
        </div>
      </div>
    </div>
  );
}
