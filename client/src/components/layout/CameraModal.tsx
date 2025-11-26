import { useState, useRef, useEffect } from 'react';
import { X, Camera as CameraIcon, Video as VideoIcon, Circle, Square, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PhotoData {
  blob: Blob;
  timestamp: number;
  url: string;
}

export function CameraModal({ isOpen, onClose }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'video' | 'photo'>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [capturedPhotos, setCapturedPhotos] = useState<PhotoData[]>([]);
  const [showPdfOptions, setShowPdfOptions] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Initialize camera on mount
  useEffect(() => {
    if (!isOpen) return;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: mode === 'video',
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

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const photo: PhotoData = {
          blob,
          timestamp: Date.now(),
          url,
        };
        setCapturedPhotos([...capturedPhotos, photo]);
        toast.success(`Photo ${capturedPhotos.length + 1} captured`);
      }
    });
  };

  const handleDownloadPhoto = (photo: PhotoData) => {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = `photo-${photo.timestamp}.png`;
    a.click();
    toast.success('Photo downloaded');
  };

  const handlePhotoToPDF = async () => {
    if (capturedPhotos.length === 0) {
      toast.error('No photos to convert');
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      for (let i = 0; i < capturedPhotos.length; i++) {
        const photo = capturedPhotos[i];
        const img = new Image();

        await new Promise((resolve, reject) => {
          img.onload = () => {
            if (i > 0) {
              pdf.addPage();
            }

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth - 20;
            const imgHeight = (img.height / img.width) * imgWidth;

            const x = 10;
            const y = 10;

            pdf.addImage(img, 'PNG', x, y, imgWidth, Math.min(imgHeight, pageHeight - 20));
            resolve(null);
          };
          img.onerror = reject;
          img.src = photo.url;
        });
      }

      pdf.save(`photos-${Date.now()}.pdf`);
      toast.success(`PDF created with ${capturedPhotos.length} photo(s)`);
      setShowPdfOptions(false);
    } catch (err) {
      toast.error('Failed to create PDF');
      console.error(err);
    }
  };

  const handleEmailPDF = async () => {
    if (!emailTo || !emailTo.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (capturedPhotos.length === 0) {
      toast.error('No photos to send');
      return;
    }

    setIsSending(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      for (let i = 0; i < capturedPhotos.length; i++) {
        const photo = capturedPhotos[i];
        const img = new Image();

        await new Promise((resolve, reject) => {
          img.onload = () => {
            if (i > 0) {
              pdf.addPage();
            }

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth - 20;
            const imgHeight = (img.height / img.width) * imgWidth;

            const x = 10;
            const y = 10;

            pdf.addImage(img, 'PNG', x, y, imgWidth, Math.min(imgHeight, pageHeight - 20));
            resolve(null);
          };
          img.onerror = reject;
          img.src = photo.url;
        });
      }

      const pdfBlob = pdf.output('blob');
      const formData = new FormData();
      formData.append('to', emailTo);
      formData.append('subject', `Photo Documentation - ${new Date().toLocaleDateString()}`);
      formData.append('body', 'Please find attached the captured photos.');
      formData.append('pdf', pdfBlob, `photos-${Date.now()}.pdf`);

      const response = await fetch('/api/send-photos-email', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast.success(`Email sent to ${emailTo}`);
      setEmailTo('');
      setCapturedPhotos([]);
      setShowPdfOptions(false);
    } catch (err) {
      toast.error('Failed to send email');
      console.error(err);
    } finally {
      setIsSending(false);
    }
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
            <h2 className="text-lg font-bold text-white">Camera & Document Scanner</h2>
            <span className="text-xs text-cyan-300">Photo • Video • PDF • Email</span>
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
        <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {showPdfOptions ? (
            <>
              {/* PDF Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">
                  {capturedPhotos.length} Photo(s) Captured
                </h3>

                {/* Photo Preview Grid */}
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {capturedPhotos.map((photo, idx) => (
                    <div
                      key={photo.timestamp}
                      className="relative border border-slate-600 rounded-lg overflow-hidden group"
                      data-testid={`photo-preview-${idx}`}
                    >
                      <img src={photo.url} alt={`Photo ${idx + 1}`} className="w-full h-32 object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadPhoto(photo)}
                          className="text-cyan-400"
                          data-testid={`button-download-photo-${idx}`}
                        >
                          ⬇️
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Email Input */}
                <div className="space-y-3 bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                  <label className="text-sm font-bold text-white">Send PDF to Email:</label>
                  <Input
                    type="email"
                    placeholder="recipient@example.com"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-gray-500"
                    data-testid="input-email-recipient"
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePhotoToPDF}
                      className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                      data-testid="button-save-pdf"
                    >
                      <FileText className="w-4 h-4" />
                      Save PDF
                    </Button>
                    <Button
                      onClick={handleEmailPDF}
                      disabled={isSending}
                      className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
                      data-testid="button-email-pdf"
                    >
                      <Mail className="w-4 h-4" />
                      {isSending ? 'Sending...' : 'Email PDF'}
                    </Button>
                  </div>
                </div>

                {/* Back Button */}
                <Button
                  onClick={() => setShowPdfOptions(false)}
                  variant="outline"
                  className="w-full border-slate-600 hover:bg-slate-700"
                  data-testid="button-back-to-camera"
                >
                  Back to Camera
                </Button>
              </div>
            </>
          ) : (
            <>
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
                  <>
                    <Button
                      onClick={handleTakePhoto}
                      className="flex-1 gap-2 bg-cyan-600 hover:bg-cyan-700"
                      data-testid="button-take-photo"
                    >
                      <CameraIcon className="w-4 h-4" />
                      Capture Photo
                    </Button>
                    {capturedPhotos.length > 0 && (
                      <Button
                        onClick={() => setShowPdfOptions(true)}
                        className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                        data-testid="button-convert-pdf"
                      >
                        <FileText className="w-4 h-4" />
                        Convert to PDF ({capturedPhotos.length})
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    onClick={
                      isRecording ? handleStopRecording : handleStartRecording
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
