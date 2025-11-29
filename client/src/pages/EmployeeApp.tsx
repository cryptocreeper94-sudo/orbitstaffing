import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Home,
  Briefcase,
  Calendar,
  FileCheck,
  DollarSign,
  LogOut,
  Send,
  MessageSquare,
  Reply,
  Zap,
  TrendingUp,
  Star,
  Camera,
  Video,
  Upload,
  AlertTriangle,
  X,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";

export default function EmployeeApp() {
  const [activeTab, setActiveTab] = useState("home");
  const [clockedIn, setClockedIn] = useState(false);
  const [gpsVerified, setGpsVerified] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [messages, setMessages] = useState<Array<{id: string; from: string; text: string; time: string}>>([
    { id: "1", from: "Manager", text: "You're scheduled for 8am tomorrow at Metro Construction", time: "2 hours ago" }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [incidentType, setIncidentType] = useState<string>("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [incidentPhotos, setIncidentPhotos] = useState<string[]>([]);
  const [incidentVideos, setIncidentVideos] = useState<string[]>([]);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [submittedIncidents, setSubmittedIncidents] = useState<Array<{
    id: string;
    type: string;
    description: string;
    photos: string[];
    videos: string[];
    timestamp: string;
    status: string;
  }>>([]);
  
  const [onBreak, setOnBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState<string | null>(null);
  const [breaks, setBreaks] = useState<Array<{start: string; end: string | null; type: string}>>([]);
  const [showCertification, setShowCertification] = useState(false);
  const [certificationAgreed, setCertificationAgreed] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [totalHoursToday, setTotalHoursToday] = useState("0h 0m");

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGpsVerified(true);
        toast.success("Location verified! Within job site geofence ✓");
      });
    } else {
      toast.error("Location services not available");
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleClockIn = () => {
    if (!gpsVerified) {
      toast.error("Please verify your location first");
      return;
    }
    const time = getCurrentTime();
    setClockedIn(true);
    setClockInTime(time);
    setBreaks([]);
    toast.success(`Clocked in at ${time}`);
  };

  const handleClockOut = () => {
    if (onBreak) {
      toast.error("Please end your break before clocking out");
      return;
    }
    setShowCertification(true);
  };

  const handleConfirmClockOut = () => {
    if (!certificationAgreed) {
      toast.error("Please certify your hours before clocking out");
      return;
    }
    setClockedIn(false);
    setClockInTime(null);
    setTotalHoursToday("8h 0m");
    setCertificationAgreed(false);
    setShowCertification(false);
    toast.success("Hours certified and clocked out successfully!");
  };

  const handleStartBreak = (breakType: string) => {
    const time = getCurrentTime();
    setOnBreak(true);
    setBreakStartTime(time);
    setBreaks([...breaks, { start: time, end: null, type: breakType }]);
    toast.success(`${breakType} break started at ${time}`);
  };

  const handleEndBreak = () => {
    const time = getCurrentTime();
    setOnBreak(false);
    setBreaks(breaks.map((b, i) => 
      i === breaks.length - 1 ? { ...b, end: time } : b
    ));
    setBreakStartTime(null);
    toast.success(`Break ended at ${time}`);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: Date.now().toString(),
        from: "You",
        text: newMessage,
        time: "now"
      }]);
      setNewMessage("");
      toast.success("Message sent to manager");
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setIncidentPhotos(prev => [...prev, event.target!.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const handleVideoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('video/')) {
          if (file.size > 50 * 1024 * 1024) {
            toast.error("Video must be under 50MB");
            return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setIncidentVideos(prev => [...prev, event.target!.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removePhoto = (index: number) => {
    setIncidentPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setIncidentVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitIncident = () => {
    if (!incidentType) {
      toast.error("Please select an incident type");
      return;
    }
    if (!incidentDescription.trim()) {
      toast.error("Please describe the incident");
      return;
    }

    const newIncident = {
      id: Date.now().toString(),
      type: incidentType,
      description: incidentDescription,
      photos: incidentPhotos,
      videos: incidentVideos,
      timestamp: new Date().toISOString(),
      status: "submitted"
    };

    setSubmittedIncidents(prev => [newIncident, ...prev]);
    setIncidentType("");
    setIncidentDescription("");
    setIncidentPhotos([]);
    setIncidentVideos([]);
    setShowIncidentForm(false);
    toast.success("Incident report submitted successfully! Management has been notified.");
  };

  const incidentTypes = [
    { value: "safety", label: "Safety Hazard", icon: "⚠️" },
    { value: "equipment", label: "Equipment Issue", icon: "🔧" },
    { value: "injury", label: "Injury", icon: "🏥" },
    { value: "property", label: "Property Damage", icon: "🏗️" },
    { value: "other", label: "Other", icon: "📋" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border/50 backdrop-blur-sm p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold font-heading">Alex Martinez</h1>
            <p className="text-xs text-muted-foreground">Electrician | Nashville, TN</p>
          </div>
          <Badge className="bg-green-500/20 text-green-600">Active</Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4">
        <Tabs defaultValue="home" className="mt-6" onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border/50 w-full flex-wrap h-auto gap-1">
            <TabsTrigger value="home" className="flex-1">Home</TabsTrigger>
            <TabsTrigger value="jobs" className="flex-1">Jobs</TabsTrigger>
            <TabsTrigger value="report" className="flex-1 text-red-500 data-[state=active]:text-red-500">Report</TabsTrigger>
            <TabsTrigger value="bonuses" className="flex-1">Bonuses</TabsTrigger>
            <TabsTrigger value="messages" className="flex-1">Messages</TabsTrigger>
            <TabsTrigger value="pay" className="flex-1">Pay</TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6 mt-6">
            {/* Clock In/Out */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  {clockedIn ? "You're Working" : "Ready to Work?"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {clockedIn ? (
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-green-600">Clocked In</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Metro Construction Site</p>
                      <p className="text-xs text-muted-foreground mt-1">Started: 8:32 AM</p>
                      <p className="text-xs text-muted-foreground">Elapsed: 2 hours 15 minutes</p>
                    </div>
                    <Button onClick={handleClockOut} className="w-full bg-red-500/20 text-red-600 hover:bg-red-500/30 border border-red-500/30">
                      <LogOut className="w-4 h-4 mr-2" /> Clock Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!gpsVerified ? (
                      <div className="space-y-3">
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <p className="text-sm text-blue-600 mb-3">
                            📍 We need your location to verify you're at the job site (required for compliance and payroll accuracy)
                          </p>
                          <Button onClick={handleGetLocation} className="w-full bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 border border-blue-500/30">
                            <MapPin className="w-4 h-4 mr-2" /> Verify My Location
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="font-bold text-green-600">Location Verified</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            📍 {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
                          </p>
                          <p className="text-xs text-green-600 mt-1">✓ Within job site geofence (200-300ft radius)</p>
                        </div>
                        <Button onClick={handleClockIn} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                          <Clock className="w-4 h-4 mr-2" /> Clock In Now
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Today's Status */}
            {clockedIn && (
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">Today's Work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                    <span className="text-sm">Job Site</span>
                    <span className="font-bold">Metro Construction</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                    <span className="text-sm">Clocked In</span>
                    <span className="font-bold text-green-500">{clockInTime}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                    <span className="text-sm">Hourly Rate</span>
                    <span className="font-bold">$45/hr</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {clockedIn && (
              <Card className={`border-border/50 ${onBreak ? 'bg-amber-500/10 border-amber-500/30' : 'bg-card/50'}`}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Break Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {onBreak ? (
                    <div className="space-y-3">
                      <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                          <span className="font-bold text-amber-500">On Break</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Started at {breakStartTime}</p>
                      </div>
                      <Button 
                        onClick={handleEndBreak} 
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        data-testid="button-end-break"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        End Break
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handleStartBreak("Lunch")}
                        className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                        data-testid="button-lunch-break"
                      >
                        🍽️ Lunch Break
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleStartBreak("Rest")}
                        className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
                        data-testid="button-rest-break"
                      >
                        ☕ Rest Break
                      </Button>
                    </div>
                  )}
                  
                  {breaks.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/50">
                      <p className="text-sm font-medium mb-2 text-muted-foreground">Today's Breaks:</p>
                      <div className="space-y-1">
                        {breaks.map((b, idx) => (
                          <div key={idx} className="flex justify-between text-sm p-2 bg-background/50 rounded">
                            <span>{b.type}</span>
                            <span className="text-muted-foreground">
                              {b.start} - {b.end || 'ongoing'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {showCertification && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md bg-card border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <FileCheck className="w-6 h-6" />
                      Certify Your Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-background/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Clock In:</span>
                        <span className="font-bold">{clockInTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Clock Out:</span>
                        <span className="font-bold">{getCurrentTime()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Breaks Taken:</span>
                        <span className="font-bold">{breaks.length}</span>
                      </div>
                      <div className="flex justify-between border-t border-border/50 pt-2 mt-2">
                        <span className="text-muted-foreground">Total Hours:</span>
                        <span className="font-bold text-green-500">8h 0m</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg border border-primary/30">
                      <input
                        type="checkbox"
                        id="certify"
                        checked={certificationAgreed}
                        onChange={(e) => setCertificationAgreed(e.target.checked)}
                        className="mt-1 w-5 h-5 accent-primary"
                        data-testid="checkbox-certify"
                      />
                      <label htmlFor="certify" className="text-sm">
                        I certify that the hours shown above are accurate and represent the actual time I worked today. I understand this is my digital signature.
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCertification(false)}
                        className="flex-1"
                        data-testid="button-cancel-certification"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleConfirmClockOut}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={!certificationAgreed}
                        data-testid="button-confirm-clockout"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Certify & Clock Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Need Something?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start border-border/50">
                  <AlertCircle className="w-4 h-4 mr-2" /> Report an Issue
                </Button>
                <Button variant="outline" className="w-full justify-start border-border/50">
                  <MessageSquare className="w-4 h-4 mr-2" /> Message Your Manager
                </Button>
                <Button variant="outline" className="w-full justify-start border-border/50">
                  <Reply className="w-4 h-4 mr-2" /> Request Time Off
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4 mt-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Tomorrow's Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-bold text-lg">Licensed Electrician</p>
                  <p className="text-sm text-muted-foreground">Metro Construction - Downtown Nashville</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>📅 Date:</span>
                    <span>Friday, Nov 23</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⏰ Time:</span>
                    <span>8:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>💰 Rate:</span>
                    <span>$45/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📍 Location:</span>
                    <span>35.0896° N</span>
                  </div>
                </div>
                <Button className="w-full bg-primary text-primary-foreground">Accept & Review Details</Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Your Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 hover:bg-background/50 rounded">
                    <span>This Week: 4 jobs assigned</span>
                    <Badge>32 hours</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-background/50 rounded">
                    <span>This Month: 18 jobs assigned</span>
                    <Badge>144 hours</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Incident Report Tab */}
          <TabsContent value="report" className="space-y-4 mt-6">
            {!showIncidentForm ? (
              <>
                <Card className="bg-red-500/10 border-red-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="w-5 h-5" />
                      Report an Incident
                    </CardTitle>
                    <CardDescription>
                      Safety issue, injury, equipment problem, or property damage? Report it here with photos/videos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => setShowIncidentForm(true)} 
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                      data-testid="button-new-incident"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Create New Report
                    </Button>
                  </CardContent>
                </Card>

                {submittedIncidents.length > 0 && (
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="text-base">Your Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {submittedIncidents.map((incident) => (
                        <div 
                          key={incident.id} 
                          className="p-3 bg-background/50 rounded-lg border border-border/50"
                          data-testid={`incident-${incident.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span>{incidentTypes.find(t => t.value === incident.type)?.icon}</span>
                                <span className="font-medium capitalize">{incident.type}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {incident.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                {incident.photos.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3" />
                                    {incident.photos.length} photo{incident.photos.length > 1 ? 's' : ''}
                                  </span>
                                )}
                                {incident.videos.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Video className="w-3 h-3" />
                                    {incident.videos.length} video{incident.videos.length > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge className="bg-green-500/20 text-green-600 capitalize">
                              {incident.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(incident.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {submittedIncidents.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p className="font-medium">No incidents reported</p>
                    <p className="text-sm">If you see something, say something!</p>
                  </div>
                )}
              </>
            ) : (
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      New Incident Report
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setShowIncidentForm(false);
                        setIncidentType("");
                        setIncidentDescription("");
                        setIncidentPhotos([]);
                        setIncidentVideos([]);
                      }}
                      data-testid="button-cancel-incident"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Incident Type *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {incidentTypes.map((type) => (
                        <Button
                          key={type.value}
                          variant={incidentType === type.value ? "default" : "outline"}
                          className={`justify-start ${incidentType === type.value ? 'bg-red-500 hover:bg-red-600' : ''}`}
                          onClick={() => setIncidentType(type.value)}
                          data-testid={`incident-type-${type.value}`}
                        >
                          <span className="mr-2">{type.icon}</span>
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Description *</label>
                    <textarea
                      value={incidentDescription}
                      onChange={(e) => setIncidentDescription(e.target.value)}
                      placeholder="Describe what happened, where, and when..."
                      className="w-full min-h-[100px] p-3 bg-background border border-border/50 rounded-lg text-sm resize-none focus:outline-none focus:border-primary/50"
                      data-testid="input-incident-description"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Photos & Videos (optional)</label>
                    <div className="flex gap-2 mb-3">
                      <label className="flex-1">
                        <div className="flex items-center justify-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg cursor-pointer hover:bg-blue-500/20 transition-all">
                          <Camera className="w-5 h-5 text-blue-500" />
                          <span className="text-sm text-blue-500 font-medium">Take Photo</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handlePhotoCapture}
                          className="hidden"
                          data-testid="input-photo-capture"
                        />
                      </label>
                      <label className="flex-1">
                        <div className="flex items-center justify-center gap-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg cursor-pointer hover:bg-purple-500/20 transition-all">
                          <Video className="w-5 h-5 text-purple-500" />
                          <span className="text-sm text-purple-500 font-medium">Record Video</span>
                        </div>
                        <input
                          type="file"
                          accept="video/*"
                          capture="environment"
                          onChange={handleVideoCapture}
                          className="hidden"
                          data-testid="input-video-capture"
                        />
                      </label>
                    </div>
                    <label className="block">
                      <div className="flex items-center justify-center gap-2 p-3 bg-background border border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-all">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Upload from gallery</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files) {
                            Array.from(files).forEach(file => {
                              if (file.type.startsWith('image/')) {
                                handlePhotoCapture({ target: { files: [file] } } as any);
                              } else if (file.type.startsWith('video/')) {
                                handleVideoCapture({ target: { files: [file] } } as any);
                              }
                            });
                          }
                        }}
                        className="hidden"
                        data-testid="input-upload-media"
                      />
                    </label>
                  </div>

                  {(incidentPhotos.length > 0 || incidentVideos.length > 0) && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Attached Media</label>
                      <div className="grid grid-cols-3 gap-2">
                        {incidentPhotos.map((photo, index) => (
                          <div key={`photo-${index}`} className="relative">
                            <img 
                              src={photo} 
                              alt={`Photo ${index + 1}`} 
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removePhoto(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                              data-testid={`remove-photo-${index}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {incidentVideos.map((video, index) => (
                          <div key={`video-${index}`} className="relative">
                            <div className="w-full h-20 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              <Video className="w-6 h-6 text-purple-500" />
                            </div>
                            <button
                              onClick={() => removeVideo(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                              data-testid={`remove-video-${index}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleSubmitIncident}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                    data-testid="button-submit-incident"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Incident Report
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Bonuses Tab */}
          <TabsContent value="bonuses" className="space-y-4 mt-6">
            {/* Weekly Bonus */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Weekly Performance Bonus
                </CardTitle>
                <CardDescription>Current week on extended assignment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">This Week Bonus</div>
                    <div className="text-4xl font-bold text-amber-500">$35.00</div>
                    <p className="text-xs text-muted-foreground mt-2">Earned for perfect attendance this week</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Perfect Days</span>
                    <Badge className="bg-green-500/20 text-green-600">5 / 5 ✓</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Streak Status</span>
                    <Badge className="bg-blue-500/20 text-blue-600">On Track</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Assignment Duration</span>
                    <Badge variant="outline">Week 3 of 12</Badge>
                  </div>
                </div>

                <Button className="w-full bg-amber-500/20 text-amber-600 hover:bg-amber-500/30 border border-amber-500/30">
                  <TrendingUp className="w-4 h-4 mr-2" /> View Bonus History
                </Button>
              </CardContent>
            </Card>

            {/* Loyalty Score */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-500" />
                  Loyalty Score (12-Month)
                </CardTitle>
                <CardDescription>Your overall reliability & availability rating</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <div className="text-center mb-4">
                    <div className="text-5xl font-bold text-purple-500">96%</div>
                    <p className="text-sm text-muted-foreground mt-1">Loyalty Score</p>
                  </div>
                  
                  <div className="w-full bg-background rounded-full h-2 mb-4 overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{width: "96%"}}></div>
                  </div>

                  <div className="bg-background/50 rounded-lg p-3 text-center">
                    <div className="text-sm font-bold text-purple-600 mb-1">TIER 2 - GROWTH</div>
                    <p className="text-xs text-muted-foreground">5 days paid time off</p>
                    <p className="text-xs text-muted-foreground">+$1,200-2,000 annual bonus</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Availability Score</span>
                    <span className="font-bold">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reliability Score</span>
                    <span className="font-bold">98%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Calculated as: (Availability × 60%) + (Reliability × 40%)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-background/50 rounded p-3 text-center">
                    <div className="font-bold text-green-600">90 days</div>
                    <div className="text-muted-foreground">Perfect attendance streak</div>
                  </div>
                  <div className="bg-background/50 rounded p-3 text-center">
                    <div className="font-bold text-blue-600">1 tardy</div>
                    <div className="text-muted-foreground">Minor impact on score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tier Progression */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Tier Progression</CardTitle>
                <CardDescription>Your path to higher bonuses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {[
                    {tier: "Tier 1", score: "90-94%", bonus: "2 days off", current: false},
                    {tier: "Tier 2", score: "95-97%", bonus: "5 days off / $1,200+", current: true},
                    {tier: "Tier 3", score: "98-99%", bonus: "1 week off / $2,400+", current: false},
                    {tier: "Tier 4", score: "100%", bonus: "1 week + recognition / $2,400+", current: false},
                  ].map((item, i) => (
                    <div key={i} className={`p-3 rounded-lg border transition-all ${
                      item.current 
                        ? "bg-purple-500/10 border-purple-500/30" 
                        : "bg-background/50 border-border/50 opacity-60"
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-sm">{item.tier}</div>
                          <div className="text-xs text-muted-foreground">{item.score}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-purple-500">{item.bonus}</div>
                          {item.current && <Badge className="mt-1 bg-green-500/20 text-green-600">Current</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground bg-background/50 rounded p-3">
                  <p className="mb-2"><strong>How to improve:</strong></p>
                  <ul className="space-y-1">
                    <li>✓ Accept more shift offers (boost Availability)</li>
                    <li>✓ Never no-show (boost Reliability)</li>
                    <li>✓ Always arrive on-time (maintain score)</li>
                    <li>✓ Complete full shifts (maximize Reliability)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4 mt-6">
            <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === "You" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.from === "You" 
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-card border border-border/50 rounded-bl-none"
                  }`}>
                    {msg.text}
                    <div className="text-xs opacity-70 mt-1">{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 p-4">
              <div className="max-w-2xl mx-auto flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message your manager..."
                  className="flex-1 bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button size="icon" onClick={handleSendMessage} className="bg-primary text-primary-foreground">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Pay Tab */}
          <TabsContent value="pay" className="space-y-4 mt-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  This Week's Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
                  <div className="text-sm text-muted-foreground mb-1">Gross Pay</div>
                  <div className="text-3xl font-bold text-primary">$1,440.00</div>
                  <div className="text-xs text-muted-foreground mt-1">32 hours @ $45/hr</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Federal Tax</span>
                    <span>-$144.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">State Tax (TN)</span>
                    <span>-$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">FICA</span>
                    <span>-$110.16</span>
                  </div>
                  <div className="border-t border-border/50 pt-2 mt-2 flex justify-between font-bold">
                    <span>Net Pay</span>
                    <span className="text-green-600">$1,185.84</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Direct Deposit</CardTitle>
                <CardDescription>Deposits every Friday</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-background/50 rounded-lg border border-border/50 text-sm">
                  <p className="text-muted-foreground">••••  2847</p>
                  <p className="text-xs text-muted-foreground mt-1">Next deposit: Nov 24, 2025</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
