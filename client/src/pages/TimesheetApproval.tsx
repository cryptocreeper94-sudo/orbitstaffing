import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, Clock, MapPin, AlertTriangle, Cloud, Thermometer, Wind, Droplets, AlertOctagon, FileText, ClipboardCheck, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'wouter';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { CarouselRail } from '@/components/ui/carousel-rail';
import { PageHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, StatCard } from '@/components/ui/orbit-card';

interface WeatherSnapshot {
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  alerts: string[];
  capturedAt: string;
}

interface Timesheet {
  id: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  assignmentId: string;
  clockInTime: string;
  clockInLatitude: string;
  clockInLongitude: string;
  clockInVerified: boolean;
  clockInWeather?: WeatherSnapshot;
  clockOutTime: string;
  clockOutLatitude: string;
  clockOutLongitude: string;
  clockOutVerified: boolean;
  clockOutWeather?: WeatherSnapshot;
  totalHoursWorked: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export default function TimesheetApproval() {
  const [requiresReviewTimesheets, setRequiresReviewTimesheets] = useState<Timesheet[]>([]);
  const [approvedTimesheets, setApprovedTimesheets] = useState<Timesheet[]>([]);
  const [rejectedTimesheets, setRejectedTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'review' | 'approved' | 'rejected'>('review');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedTimesheetId, setSelectedTimesheetId] = useState<string | null>(null);

  useEffect(() => {
    loadTimesheets();
  }, [selectedTab]);

  const loadTimesheets = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/timesheets/requires-review';
      
      if (selectedTab === 'approved') {
        endpoint = '/api/timesheets/status/approved';
      } else if (selectedTab === 'rejected') {
        endpoint = '/api/timesheets/status/rejected';
      }
      
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        
        if (selectedTab === 'review') {
          setRequiresReviewTimesheets(data);
        } else if (selectedTab === 'approved') {
          setApprovedTimesheets(data);
        } else if (selectedTab === 'rejected') {
          setRejectedTimesheets(data);
        }
      } else {
        toast.error('Failed to load timesheets');
      }
    } catch (error) {
      console.error('Load timesheets error:', error);
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (timesheetId: string) => {
    try {
      const res = await fetch(`/api/timesheets/${timesheetId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'admin' }),
      });

      if (res.ok) {
        toast.success('Timesheet approved');
        loadTimesheets();
      } else {
        toast.error('Failed to approve timesheet');
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Network error');
    }
  };

  const handleReject = async (timesheetId: string) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const res = await fetch(`/api/timesheets/${timesheetId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (res.ok) {
        toast.success('Timesheet rejected');
        setSelectedTimesheetId(null);
        setRejectReason('');
        loadTimesheets();
      } else {
        toast.error('Failed to reject timesheet');
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Network error');
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const WeatherDisplay = ({ weather, label }: { weather?: WeatherSnapshot; label: string }) => {
    if (!weather) return null;
    
    return (
      <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg p-3 border border-cyan-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Cloud className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-medium text-cyan-300">{label} Weather</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-orange-400" />
            <span className="text-white">{weather.temp}°F</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="w-3 h-3 text-blue-400" />
            <span className="text-white">{weather.windSpeed} mph {weather.windDirection}</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-400" />
            <span className="text-white">{weather.humidity}%</span>
          </div>
          <div className="text-white">{weather.condition}</div>
        </div>
        {weather.alerts && weather.alerts.length > 0 && (
          <div className="mt-2 flex gap-1 flex-wrap">
            {weather.alerts.map((alert, idx) => (
              <Badge key={idx} variant="destructive" className="text-xs">
                <AlertOctagon className="w-2 h-2 mr-1" />
                {alert}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  const TimesheetCard = ({ timesheet }: { timesheet: Timesheet }) => {
    const bothGPSVerified = timesheet.clockInVerified && timesheet.clockOutVerified;
    const hours = parseFloat(timesheet.totalHoursWorked || '0');
    const hasWeatherData = timesheet.clockInWeather || timesheet.clockOutWeather;

    return (
      <OrbitCard className="h-full">
        <OrbitCardHeader
          icon={<FileText className="w-5 h-5 text-cyan-400" />}
          action={
            <div className="flex gap-2 items-center flex-wrap justify-end">
              <Badge variant={bothGPSVerified ? 'default' : 'destructive'}>
                <MapPin className="w-3 h-3 mr-1" />
                {bothGPSVerified ? 'GPS Verified' : 'GPS Failed'}
              </Badge>
              {hasWeatherData && (
                <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                  <Cloud className="w-3 h-3 mr-1" />
                  Weather Logged
                </Badge>
              )}
              {timesheet.status === 'requires_review' && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Requires Review
                </Badge>
              )}
              {timesheet.status === 'approved' && (
                <Badge variant="default" className="bg-emerald-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Approved
                </Badge>
              )}
              {timesheet.status === 'rejected' && (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Rejected
                </Badge>
              )}
            </div>
          }
        >
          <OrbitCardTitle>{timesheet.workerName}</OrbitCardTitle>
          <p className="text-sm text-slate-400">{timesheet.workerPhone}</p>
        </OrbitCardHeader>
        
        <OrbitCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-slate-400">Clock In</p>
              <p className="text-sm text-white">{formatDateTime(timesheet.clockInTime)}</p>
              <p className="text-xs text-slate-500 mb-2">
                {timesheet.clockInVerified ? '✓ Verified' : '✗ Not Verified'}
              </p>
              <WeatherDisplay weather={timesheet.clockInWeather} label="Clock-In" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Clock Out</p>
              <p className="text-sm text-white">{formatDateTime(timesheet.clockOutTime)}</p>
              <p className="text-xs text-slate-500 mb-2">
                {timesheet.clockOutVerified ? '✓ Verified' : '✗ Not Verified'}
              </p>
              <WeatherDisplay weather={timesheet.clockOutWeather} label="Clock-Out" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span className="text-lg font-bold text-white">{hours.toFixed(2)} hours</span>
            {hours > 16 && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Exceeds 16 hours
              </Badge>
            )}
          </div>

          {timesheet.notes && (
            <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
              <p className="text-sm font-medium text-yellow-400">Notes:</p>
              <p className="text-sm text-yellow-200">{timesheet.notes}</p>
            </div>
          )}

          {timesheet.status === 'requires_review' && (
            <div className="flex gap-2">
              {selectedTimesheetId === timesheet.id ? (
                <div className="w-full space-y-2">
                  <Textarea
                    placeholder="Enter rejection reason..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                    data-testid={`textarea-reject-reason-${timesheet.id}`}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(timesheet.id)}
                      data-testid={`button-confirm-reject-${timesheet.id}`}
                    >
                      Confirm Reject
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedTimesheetId(null);
                        setRejectReason('');
                      }}
                      data-testid={`button-cancel-reject-${timesheet.id}`}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button
                    onClick={() => handleApprove(timesheet.id)}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                    data-testid={`button-approve-${timesheet.id}`}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setSelectedTimesheetId(timesheet.id)}
                    className="flex-1"
                    data-testid={`button-reject-${timesheet.id}`}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          )}
        </OrbitCardContent>
      </OrbitCard>
    );
  };

  const getCurrentTimesheets = () => {
    if (selectedTab === 'review') return requiresReviewTimesheets;
    if (selectedTab === 'approved') return approvedTimesheets;
    return rejectedTimesheets;
  };

  const timesheets = getCurrentTimesheets();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Timesheet Approval"
          subtitle="Review and approve worker timesheets"
          actions={
            <Link href="/admin">
              <Button variant="outline" data-testid="button-back-to-admin">
                Back to Admin
              </Button>
            </Link>
          }
        />

        <BentoGrid cols={3} gap="md" className="mb-6">
          <BentoTile className="p-4">
            <StatCard
              label="Pending Review"
              value={requiresReviewTimesheets.length}
              icon={<AlertTriangle className="w-6 h-6" />}
              className="border-0 bg-transparent p-0"
            />
          </BentoTile>
          <BentoTile className="p-4">
            <StatCard
              label="Approved"
              value={approvedTimesheets.length}
              icon={<ClipboardCheck className="w-6 h-6" />}
              className="border-0 bg-transparent p-0"
            />
          </BentoTile>
          <BentoTile className="p-4">
            <StatCard
              label="Rejected"
              value={rejectedTimesheets.length}
              icon={<Ban className="w-6 h-6" />}
              className="border-0 bg-transparent p-0"
            />
          </BentoTile>
        </BentoGrid>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={selectedTab === 'review' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('review')}
            className={selectedTab === 'review' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
            data-testid="button-tab-review"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Requires Review ({requiresReviewTimesheets.length})
          </Button>
          <Button
            variant={selectedTab === 'approved' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('approved')}
            className={selectedTab === 'approved' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
            data-testid="button-tab-approved"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Approved
          </Button>
          <Button
            variant={selectedTab === 'rejected' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('rejected')}
            className={selectedTab === 'rejected' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
            data-testid="button-tab-rejected"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rejected
          </Button>
        </div>

        {loading && (
          <OrbitCard className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-white mt-4">Loading timesheets...</p>
          </OrbitCard>
        )}

        {!loading && (
          <>
            {timesheets.length === 0 ? (
              <OrbitCard className="py-12 text-center">
                {selectedTab === 'review' ? (
                  <>
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <p className="text-lg text-slate-300">No timesheets require review</p>
                  </>
                ) : (
                  <p className="text-lg text-slate-400">
                    No {selectedTab} timesheets
                  </p>
                )}
              </OrbitCard>
            ) : (
              <>
                <div className="block md:hidden">
                  <CarouselRail 
                    title={`${selectedTab === 'review' ? 'Pending' : selectedTab === 'approved' ? 'Approved' : 'Rejected'} Timesheets`}
                    subtitle={`${timesheets.length} timesheet${timesheets.length !== 1 ? 's' : ''}`}
                    itemWidth="lg"
                    gap="md"
                  >
                    {timesheets.map((timesheet) => (
                      <div key={timesheet.id} className="min-w-[320px]">
                        <TimesheetCard timesheet={timesheet} />
                      </div>
                    ))}
                  </CarouselRail>
                </div>

                <div className="hidden md:block space-y-4">
                  {timesheets.map((timesheet) => (
                    <TimesheetCard key={timesheet.id} timesheet={timesheet} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
