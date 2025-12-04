import { useState, useEffect } from 'react';
import { Shield, CheckCircle2, XCircle, AlertTriangle, Clock, User, MapPin, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface FlaggedTimesheet {
  id: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  workerProfilePhoto?: string;
  clockInTime: string;
  clockInPhotoUrl?: string;
  clockInFaceMatchScore?: string;
  clockInFaceStatus?: string;
  clockOutPhotoUrl?: string;
  clockOutFaceMatchScore?: string;
  clockOutFaceStatus?: string;
  status: string;
}

export function FaceVerificationReview() {
  const [flaggedTimesheets, setFlaggedTimesheets] = useState<FlaggedTimesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState<string | null>(null);

  const fetchFlaggedTimesheets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/timesheets/face-flagged?tenantId=orbit-demo');
      if (!response.ok) throw new Error('Failed to fetch flagged timesheets');
      
      const data = await response.json();
      setFlaggedTimesheets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedTimesheets();
  }, []);

  const handleReview = async (timesheetId: string, approved: boolean) => {
    setReviewing(timesheetId);
    
    try {
      const response = await fetch(`/api/timesheets/${timesheetId}/face-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved,
          reason: reviewNote,
          reviewedBy: 'admin',
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit review');
      
      setFlaggedTimesheets(prev => prev.filter(ts => ts.id !== timesheetId));
      setExpandedId(null);
      setReviewNote('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setReviewing(null);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getConfidenceColor = (score: string | undefined) => {
    const confidence = parseFloat(score || '0');
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <Card className="bg-slate-900/90 border-slate-700" data-testid="face-review-loading">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading flagged verifications...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="face-verification-review">
      <Card className="bg-slate-900/90 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-yellow-400" />
                Face Verification Review
              </CardTitle>
              <CardDescription className="text-slate-400">
                Review clock-in photos with uncertain face matches
              </CardDescription>
            </div>
            <Button
              onClick={fetchFlaggedTimesheets}
              variant="outline"
              size="sm"
              className="border-slate-600"
              data-testid="refresh-button"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm mb-4">
              {error}
            </div>
          )}
          
          {flaggedTimesheets.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-slate-400">No flagged verifications to review</p>
              <p className="text-slate-500 text-sm mt-1">All clock-ins are verified</p>
            </div>
          ) : (
            <div className="space-y-3">
              {flaggedTimesheets.map((timesheet) => (
                <Card 
                  key={timesheet.id} 
                  className="bg-slate-800/50 border-yellow-500/50"
                  data-testid={`flagged-timesheet-${timesheet.id}`}
                >
                  <CardContent className="p-4">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedId(expandedId === timesheet.id ? null : timesheet.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {timesheet.workerProfilePhoto ? (
                            <img 
                              src={timesheet.workerProfilePhoto} 
                              alt="Profile" 
                              className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                              <User className="h-6 w-6 text-slate-500" />
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-white">{timesheet.workerName}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(timesheet.clockInTime)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                          {timesheet.clockInFaceMatchScore ? `${parseFloat(timesheet.clockInFaceMatchScore).toFixed(0)}% Match` : 'Flagged'}
                        </Badge>
                        {expandedId === timesheet.id ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                    
                    {expandedId === timesheet.id && (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-xs text-slate-500 mb-2">Profile Photo</p>
                            {timesheet.workerProfilePhoto ? (
                              <img 
                                src={timesheet.workerProfilePhoto} 
                                alt="Profile" 
                                className="w-32 h-32 mx-auto rounded-lg object-cover border-2 border-slate-600"
                              />
                            ) : (
                              <div className="w-32 h-32 mx-auto rounded-lg bg-slate-700 flex items-center justify-center">
                                <User className="h-12 w-12 text-slate-500" />
                              </div>
                            )}
                          </div>
                          
                          <div className="text-center">
                            <p className="text-xs text-slate-500 mb-2">Clock-In Selfie</p>
                            {timesheet.clockInPhotoUrl ? (
                              <img 
                                src={timesheet.clockInPhotoUrl} 
                                alt="Clock-in" 
                                className="w-32 h-32 mx-auto rounded-lg object-cover border-2 border-yellow-500/50"
                              />
                            ) : (
                              <div className="w-32 h-32 mx-auto rounded-lg bg-slate-700 flex items-center justify-center">
                                <User className="h-12 w-12 text-slate-500" />
                              </div>
                            )}
                            {timesheet.clockInFaceMatchScore && (
                              <p className={`mt-2 font-bold ${getConfidenceColor(timesheet.clockInFaceMatchScore)}`}>
                                {parseFloat(timesheet.clockInFaceMatchScore).toFixed(1)}% Confidence
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Add a note about your decision (optional)..."
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                            className="bg-slate-900 border-slate-600 text-white"
                            data-testid="review-note-input"
                          />
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleReview(timesheet.id, true)}
                              disabled={reviewing === timesheet.id}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              data-testid="approve-button"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Approve - Same Person
                            </Button>
                            <Button
                              onClick={() => handleReview(timesheet.id, false)}
                              disabled={reviewing === timesheet.id}
                              className="flex-1 bg-red-600 hover:bg-red-700"
                              data-testid="reject-button"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject - Different Person
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-slate-900/90 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Face Verification Thresholds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">90%+ Confidence</span>
              <Badge className="bg-green-500/20 text-green-400">Auto-Verified</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">70-89% Confidence</span>
              <Badge className="bg-yellow-500/20 text-yellow-400">Flagged for Review</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Below 70% Confidence</span>
              <Badge className="bg-red-500/20 text-red-400">Auto-Rejected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function WorkersMissingPhotos() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await fetch('/api/workers/missing-photos?tenantId=orbit-demo');
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        setWorkers(data.workers);
        setCount(data.count);
      } catch (err) {
        console.error('Failed to fetch workers missing photos:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkers();
  }, []);

  if (loading) {
    return (
      <Card className="bg-slate-900/90 border-slate-700">
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (count === 0) {
    return null;
  }

  return (
    <Card className="bg-slate-900/90 border-orange-500/50" data-testid="workers-missing-photos">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          Workers Missing Profile Photos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-400 text-sm mb-3">
          {count} approved worker{count !== 1 ? 's' : ''} need to upload a profile photo for face verification
        </p>
        <div className="space-y-2">
          {workers.slice(0, 5).map((worker) => (
            <div key={worker.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <span className="text-white text-sm">{worker.fullName}</span>
              </div>
              <span className="text-slate-500 text-xs">{worker.phone}</span>
            </div>
          ))}
          {count > 5 && (
            <p className="text-slate-500 text-xs text-center">
              And {count - 5} more...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
