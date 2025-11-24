import { useState, useRef } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertCircle, MapPin, Phone, Clock, CheckCircle2, FileText, Zap, Camera, Video } from 'lucide-react';
import { toast } from 'sonner';

interface Clinic {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  distance: number;
  services: string[];
  acceptsWalkIns: boolean;
  hours: string;
}

interface IncidentReport {
  id: string;
  date: Date;
  type: string;
  severity: string;
  employee: string;
  location: string;
  status: string;
  drugTestScheduled: boolean;
  nearestClinic?: string;
}

export default function IncidentReportingApp() {
  const [step, setStep] = useState<'search' | 'report' | 'drugtest' | 'success'>('search');
  const [zipCode, setZipCode] = useState('37201');
  const [clinics, setClinics] = useState<Clinic[]>([
    {
      id: '1',
      name: 'Concentra - Downtown Nashville',
      type: 'Urgent Care Clinic',
      address: '123 Medical Plaza Dr, Nashville, TN 37201',
      phone: '(615) 555-0100',
      distance: 0.3,
      services: ['5-Panel', '10-Panel', '14-Panel', 'Hair Sample'],
      acceptsWalkIns: true,
      hours: '7am-7pm (M-F), 9am-5pm (Sat-Sun)'
    },
    {
      id: '2',
      name: 'Fast Pace Health - Medical Center',
      type: 'Urgent Care',
      address: '456 Medical Way, Nashville, TN 37201',
      phone: '(615) 555-0200',
      distance: 0.8,
      services: ['5-Panel', '10-Panel'],
      acceptsWalkIns: true,
      hours: '8am-8pm (Daily)'
    },
    {
      id: '3',
      name: 'Busy Bee Occupational Health',
      type: 'Occupational Health Center',
      address: '789 Industrial Blvd, Nashville, TN 37201',
      phone: '(615) 555-0300',
      distance: 2.1,
      services: ['5-Panel', '10-Panel', '14-Panel'],
      acceptsWalkIns: false,
      hours: '7am-6pm (M-F)'
    }
  ]);

  const [incidentData, setIncidentData] = useState({
    employeeName: '',
    injuryType: '',
    bodyPart: '',
    severity: 'moderate',
    description: '',
    incidentLocation: '',
    timestamp: new Date().toISOString().slice(0, 16),
    witnesses: [] as string[],
    photoEvidence: null as File | null,
    videoEvidence: null as File | null,
  });

  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const [reports, setReports] = useState<IncidentReport[]>([
    {
      id: '1',
      date: new Date(Date.now() - 86400000),
      type: 'Cut/Laceration',
      severity: 'moderate',
      employee: 'John Doe',
      location: 'ABC Manufacturing - Floor 2',
      status: 'resolved',
      drugTestScheduled: true,
      nearestClinic: 'Concentra - Downtown Nashville'
    }
  ]);

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      cameraStreamRef.current = stream;
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = stream;
        toast.success('Camera active - position to capture incident scene');
      }
    } catch (err) {
      toast.error('Camera access denied');
      console.error('Camera error:', err);
    }
  };

  const handlePhotoCapture = async () => {
    if (videoElementRef.current && cameraStreamRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoElementRef.current.videoWidth;
      canvas.height = videoElementRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoElementRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'incident-photo.jpg', { type: 'image/jpeg' });
          setIncidentData({ ...incidentData, photoEvidence: file });
          toast.success('Photo captured and attached to incident report');
          // Stop camera
          cameraStreamRef.current?.getTracks().forEach(track => track.stop());
          if (videoElementRef.current) videoElementRef.current.srcObject = null;
        }
      }, 'image/jpeg');
    }
  };

  const handleReportIncident = () => {
    setStep('drugtest');
  };

  const handleScheduleDrugTest = () => {
    if (selectedClinic) {
      setStep('success');
    }
  };

  if (step === 'success') {
    return (
      <Shell>
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-700/50 bg-green-900/10">
            <CardContent className="p-12 text-center space-y-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Incident Reported & Drug Test Scheduled</h2>
                <p className="text-muted-foreground">
                  Employee has been notified and drug test is scheduled at nearest facility.
                </p>
              </div>

              <div className="bg-card/50 border border-border/50 rounded-lg p-6 text-left space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1"><strong>Facility:</strong></p>
                  <p className="text-foreground">{selectedClinic?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1"><strong>Phone:</strong></p>
                  <p className="text-foreground">{selectedClinic?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1"><strong>Address:</strong></p>
                  <p className="text-foreground">{selectedClinic?.address}</p>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90" data-testid="button-done-incident">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading mb-2 flex items-center gap-2">
          <AlertCircle className="w-8 h-8 text-red-400" />
          Incident Reporting & Response
        </h1>
        <p className="text-muted-foreground">
          Report workplace incidents and immediately schedule drug testing at nearest facility
        </p>
      </div>

      {step === 'search' && (
        <>
          {/* Find Nearby Clinics */}
          <Card className="border-border/50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Find Nearest Drug Testing Facilities
              </CardTitle>
              <CardDescription>
                Enter ZIP code to find all nearby clinics that can conduct immediate drug tests for workman's comp incidents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter ZIP code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.slice(0, 5))}
                  maxLength={5}
                  data-testid="input-clinic-zip"
                />
                <Button className="bg-primary hover:bg-primary/90" data-testid="button-find-clinics">
                  Find Clinics
                </Button>
              </div>

              <div className="space-y-3">
                {clinics.map(clinic => (
                  <div
                    key={clinic.id}
                    className="border border-border/50 rounded-lg p-4 hover:bg-card/50 transition"
                    data-testid={`clinic-card-${clinic.id}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-foreground">{clinic.name}</h3>
                        <p className="text-xs text-gray-400">{clinic.type}</p>
                      </div>
                      <Badge variant="outline" className="bg-cyan-900/30 text-cyan-300">
                        {clinic.distance} mi
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{clinic.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{clinic.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground text-xs">{clinic.hours}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {clinic.services.map(service => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>

                    {clinic.acceptsWalkIns && (
                      <p className="text-xs text-green-400 mb-3">✓ Accepts Walk-Ins</p>
                    )}

                    <Button
                      onClick={() => {
                        setSelectedClinic(clinic);
                        setStep('report');
                      }}
                      className="w-full bg-red-600 hover:bg-red-700"
                      data-testid={`button-report-incident-${clinic.id}`}
                    >
                      Report Incident & Use This Clinic
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Incidents */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Recent Incident Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.map(report => (
                  <div key={report.id} className="border border-border/50 rounded-lg p-4" data-testid={`incident-card-${report.id}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-foreground">{report.employee}</p>
                        <p className="text-sm text-muted-foreground">{report.type} - {report.location}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          report.severity === 'severe'
                            ? 'bg-red-900/30 text-red-300'
                            : report.severity === 'moderate'
                            ? 'bg-yellow-900/30 text-yellow-300'
                            : 'bg-green-900/30 text-green-300'
                        }
                      >
                        {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      {report.date.toLocaleDateString()} {report.date.toLocaleTimeString()}
                    </div>
                    {report.drugTestScheduled && (
                      <div className="flex items-center gap-1 text-xs text-green-400 mb-2">
                        <CheckCircle2 className="w-3 h-3" />
                        Drug test scheduled at {report.nearestClinic}
                      </div>
                    )}
                    <Button variant="outline" size="sm" data-testid={`button-view-incident-${report.id}`}>
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {step === 'report' && (
        <Card className="border-red-700/50 bg-red-900/5 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Report Workplace Incident
            </CardTitle>
            <CardDescription>
              Using {selectedClinic?.name} for immediate drug testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Employee Name *</label>
              <Input
                placeholder="John Doe"
                value={incidentData.employeeName}
                onChange={(e) => setIncidentData({ ...incidentData, employeeName: e.target.value })}
                data-testid="input-employee-name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Incident Date & Time *</label>
              <Input
                type="datetime-local"
                value={incidentData.timestamp}
                onChange={(e) => setIncidentData({ ...incidentData, timestamp: e.target.value })}
                data-testid="input-incident-time"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Incident Location *</label>
              <Input
                placeholder="e.g., Floor 2, Assembly Area"
                value={incidentData.incidentLocation}
                onChange={(e) => setIncidentData({ ...incidentData, incidentLocation: e.target.value })}
                data-testid="input-incident-location"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Injury Type *</label>
                <select
                  value={incidentData.injuryType}
                  onChange={(e) => setIncidentData({ ...incidentData, injuryType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-foreground"
                  data-testid="select-injury-type"
                >
                  <option value="">Select...</option>
                  <option value="cut">Cut/Laceration</option>
                  <option value="burn">Burn</option>
                  <option value="fracture">Fracture</option>
                  <option value="sprain">Sprain/Strain</option>
                  <option value="illness">Illness</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Body Part *</label>
                <Input
                  placeholder="e.g., Right hand"
                  value={incidentData.bodyPart}
                  onChange={(e) => setIncidentData({ ...incidentData, bodyPart: e.target.value })}
                  data-testid="input-body-part"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Severity *</label>
              <select
                value={incidentData.severity}
                onChange={(e) => setIncidentData({ ...incidentData, severity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-foreground"
                data-testid="select-severity"
              >
                <option value="minor">Minor (First aid only)</option>
                <option value="moderate">Moderate (Medical treatment)</option>
                <option value="severe">Severe (Hospitalization required)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Description *</label>
              <textarea
                placeholder="Describe what happened..."
                value={incidentData.description}
                onChange={(e) => setIncidentData({ ...incidentData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-foreground h-24"
                data-testid="textarea-incident-description"
              />
            </div>

            <div className="bg-purple-900/10 border border-purple-700/50 rounded-lg p-4">
              <h4 className="text-sm font-bold text-purple-300 mb-3">📸 Evidence Collection (Optional but Recommended)</h4>
              <div className="space-y-3">
                <div>
                  <Button
                    onClick={handleCameraCapture}
                    variant="outline"
                    className="w-full mb-2 text-purple-300 border-purple-700"
                    data-testid="button-camera-open"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Open Camera - Capture Scene Photos
                  </Button>
                  <video
                    ref={videoElementRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg bg-black mb-2"
                    style={{ display: cameraStreamRef.current ? 'block' : 'none' }}
                  />
                  {cameraStreamRef.current && (
                    <Button
                      onClick={handlePhotoCapture}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      data-testid="button-capture-photo"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Capture Photo Now
                    </Button>
                  )}
                  {incidentData.photoEvidence && (
                    <p className="text-xs text-green-400 mt-1">✓ Photo attached to report</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Or Upload Photo/Video File:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setIncidentData({ ...incidentData, photoEvidence: e.target.files?.[0] || null })}
                      className="hidden"
                      data-testid="input-photo-upload"
                    />
                    <Button
                      onClick={() => photoInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      data-testid="button-upload-photo"
                    >
                      📷 Upload Photo
                    </Button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={(e) => setIncidentData({ ...incidentData, videoEvidence: e.target.files?.[0] || null })}
                      className="hidden"
                      data-testid="input-video-upload"
                    />
                    <Button
                      onClick={() => videoInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      data-testid="button-upload-video"
                    >
                      🎥 Upload Video
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/10 border border-blue-700/50 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                <strong>🔒 Drug Test:</strong> A drug test will be automatically scheduled at {selectedClinic?.name} to comply with workman's comp requirements.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setStep('search')}
                variant="outline"
                className="flex-1"
                data-testid="button-back-incident"
              >
                Back
              </Button>
              <Button
                onClick={handleReportIncident}
                disabled={!incidentData.employeeName || !incidentData.injuryType || !incidentData.description}
                className="flex-1 bg-red-600 hover:bg-red-700"
                data-testid="button-submit-incident"
              >
                Report Incident
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'drugtest' && (
        <Card className="border-primary/50 bg-primary/5 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Confirm Drug Test Appointment
            </CardTitle>
            <CardDescription>
              Last step - confirm and send SMS/email to employee
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4 space-y-3">
              <h4 className="font-bold text-foreground">Testing Facility:</h4>
              <div>
                <p className="text-sm text-gray-400">Name:</p>
                <p className="text-foreground font-bold">{selectedClinic?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Address:</p>
                <p className="text-foreground">{selectedClinic?.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Phone:</p>
                <p className="text-foreground">{selectedClinic?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Hours:</p>
                <p className="text-foreground text-sm">{selectedClinic?.hours}</p>
              </div>
            </div>

            <div className="bg-yellow-900/10 border border-yellow-700/50 rounded-lg p-4">
              <p className="text-sm text-yellow-300">
                <strong>⚠️ Important:</strong> Employee will receive immediate notification via SMS and email with facility details, GPS verification requirements, and chain of custody information.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setStep('report')}
                variant="outline"
                className="flex-1"
                data-testid="button-back-drugtest"
              >
                Back
              </Button>
              <Button
                onClick={handleScheduleDrugTest}
                className="flex-1 bg-primary hover:bg-primary/90"
                data-testid="button-schedule-drug-test"
              >
                Confirm & Send to Employee
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </Shell>
  );
}
