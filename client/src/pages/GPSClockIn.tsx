import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MapPin, Clock, ArrowLeft, Navigation, History, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'wouter';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { PageHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, StatCard } from '@/components/ui/orbit-card';

interface JobSite {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  geofenceRadius: number;
}

interface ClockInRecord {
  id: string;
  workerId: string;
  workerName: string;
  jobSiteId: string;
  jobSiteName: string;
  clockInTime: string;
  clockOutTime?: string;
  gpsAccuracy: number;
  verified: boolean;
  status: 'clocked_in' | 'clocked_out';
}

export default function GPSClockIn() {
  const [view, setView] = useState<'checkin' | 'active' | 'history'>('checkin');
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeClockIn, setActiveClockIn] = useState<ClockInRecord | null>(null);
  const [history, setHistory] = useState<ClockInRecord[]>([]);
  const [jobSites, setJobSites] = useState<JobSite[]>([]);
  const [workerId, setWorkerId] = useState('');

  useEffect(() => {
    loadJobSites();
    loadActiveClockIn();
  }, []);

  const loadJobSites = async () => {
    try {
      const res = await fetch('/api/job-sites');
      if (res.ok) {
        const data = await res.json();
        setJobSites(data);
      }
    } catch (err) {
      console.error('Load job sites error:', err);
      setJobSites([
        {
          id: 'site-1',
          name: 'Downtown Construction Project',
          address: '123 Main St, Nashville, TN',
          latitude: 36.1627,
          longitude: -86.7816,
          geofenceRadius: 300,
        },
        {
          id: 'site-2',
          name: 'Highway Maintenance Zone',
          address: '456 I-40 E, Nashville, TN',
          latitude: 36.1745,
          longitude: -86.7168,
          geofenceRadius: 300,
        },
      ]);
    }
  };

  const loadActiveClockIn = async () => {
    try {
      const res = await fetch('/api/clock-in/active');
      if (res.ok) {
        const data = await res.json();
        setActiveClockIn(data);
      }
    } catch (err) {
      console.error('Load active clock-in error:', err);
    }
  };

  const getLocation = async () => {
    setError('');
    setLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      setLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
      setAccuracy(position.coords.accuracy);
    } catch (err) {
      setError('Could not get location. Ensure location services are enabled.');
      console.error('Geolocation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 20902231;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const verifyGeofence = (site: JobSite): boolean => {
    if (!location) return false;
    const distance = calculateDistance(location.lat, location.lon, site.latitude, site.longitude);
    return distance <= site.geofenceRadius;
  };

  const handleClockIn = async (site: JobSite) => {
    if (!location) {
      setError('Please get your location first');
      return;
    }

    if (!workerId) {
      setError('Please enter your worker ID');
      return;
    }

    const isVerified = verifyGeofence(site);
    if (!isVerified) {
      const distance = calculateDistance(location.lat, location.lon, site.latitude, site.longitude);
      setError(`You are ${Math.round(distance)} feet away. Must be within ${site.geofenceRadius} feet.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId,
          jobSiteId: site.id,
          latitude: location.lat,
          longitude: location.lon,
          accuracy: accuracy,
          verified: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveClockIn(data);
        toast.success(`Clocked in at ${site.name}`);
        setView('active');
      } else {
        setError('Failed to clock in');
      }
    } catch (err) {
      console.error('Clock in error:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeClockIn) {
      setError('No active clock-in');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/clock-in/${activeClockIn.id}/out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        setActiveClockIn(null);
        setHistory([data, ...history]);
        toast.success('Clocked out successfully');
        setView('history');
      } else {
        setError('Failed to clock out');
      }
    } catch (err) {
      console.error('Clock out error:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="GPS Clock-In System"
          subtitle="Location-verified time tracking with geofencing"
          breadcrumb={
            <Link href="/">
              <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20 -ml-2" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          }
          actions={
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-cyan-500" />
            </div>
          }
        />

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 bg-slate-800/50 p-1 rounded-lg w-full border border-slate-700/50">
          <Button
            onClick={() => setView('checkin')}
            variant={view === 'checkin' ? 'default' : 'ghost'}
            className="rounded text-xs sm:text-sm flex-1 sm:flex-none"
            data-testid="tab-checkin"
          >
            <Navigation className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Check In</span>
            <span className="sm:hidden">In</span>
          </Button>
          <Button
            onClick={() => setView('active')}
            variant={view === 'active' ? 'default' : 'ghost'}
            className="rounded text-xs sm:text-sm flex-1 sm:flex-none"
            data-testid="tab-active"
          >
            <Clock className="w-4 h-4 mr-1" />
            Active
          </Button>
          <Button
            onClick={() => setView('history')}
            variant={view === 'history' ? 'default' : 'ghost'}
            className="rounded text-xs sm:text-sm flex-1 sm:flex-none"
            data-testid="tab-history"
          >
            <History className="w-4 h-4 mr-1" />
            History
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <OrbitCard variant="default" className="mb-6 border-red-700/50 bg-red-900/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </OrbitCard>
        )}

        {/* Check-In View */}
        {view === 'checkin' && (
          <div className="space-y-6">
            {/* Location Stats Grid */}
            <BentoGrid cols={2} gap="md">
              <BentoTile>
                <div className="p-4">
                  <StatCard
                    label="Latitude"
                    value={location?.lat.toFixed(4) || 'N/A'}
                    icon={<MapPin className="w-5 h-5" />}
                    className="border-0 p-0 bg-transparent"
                  />
                </div>
              </BentoTile>
              <BentoTile>
                <div className="p-4">
                  <StatCard
                    label="Longitude"
                    value={location?.lon.toFixed(4) || 'N/A'}
                    icon={<MapPin className="w-5 h-5" />}
                    className="border-0 p-0 bg-transparent"
                  />
                </div>
              </BentoTile>
              <BentoTile>
                <div className="p-4">
                  <StatCard
                    label="Accuracy (±feet)"
                    value={accuracy ? Math.round(accuracy * 3.28084) : 'Unknown'}
                    icon={<Navigation className="w-5 h-5" />}
                    className="border-0 p-0 bg-transparent"
                  />
                </div>
              </BentoTile>
              <BentoTile>
                <div className="p-4 flex flex-col justify-center h-full">
                  <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wide mb-2">Status</p>
                  <Badge className={location ? 'bg-green-900 text-green-200 w-fit' : 'bg-gray-900 text-gray-200 w-fit'}>
                    {location ? '✓ Located' : '✗ Not Located'}
                  </Badge>
                </div>
              </BentoTile>
            </BentoGrid>

            {/* Get Location Button */}
            <Button
              onClick={getLocation}
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 py-6 text-lg"
              data-testid="button-get-location"
            >
              <MapPin className="w-5 h-5 mr-2" />
              {loading ? 'Getting Location...' : 'Get My Location'}
            </Button>

            {/* Worker ID Card */}
            <OrbitCard>
              <OrbitCardContent>
                <label className="block text-sm font-medium text-gray-300 mb-2">Worker ID / Email</label>
                <input
                  type="text"
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  placeholder="Enter your ID"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  data-testid="input-worker-id-clockin"
                />
              </OrbitCardContent>
            </OrbitCard>

            {/* Available Job Sites */}
            <OrbitCard>
              <OrbitCardHeader>
                <OrbitCardTitle>Available Job Sites</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent className="space-y-3">
                {jobSites.map(site => {
                  const distance = location ? calculateDistance(location.lat, location.lon, site.latitude, site.longitude) : null;
                  const isInGeofence = distance ? distance <= site.geofenceRadius : false;

                  return (
                    <div
                      key={site.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        isInGeofence
                          ? 'border-green-600 bg-green-900/20'
                          : 'border-slate-700 bg-slate-700/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-white">{site.name}</p>
                          <p className="text-xs text-gray-400">{site.address}</p>
                        </div>
                        {isInGeofence ? (
                          <Badge className="bg-green-900 text-green-200">✓ In Range</Badge>
                        ) : (
                          <Badge className="bg-red-900 text-red-200">✗ Out of Range</Badge>
                        )}
                      </div>

                      {distance !== null && (
                        <p className="text-xs text-gray-400 mb-3">
                          Distance: {Math.round(distance)} ft | Geofence: {site.geofenceRadius} ft
                        </p>
                      )}

                      <Button
                        onClick={() => handleClockIn(site)}
                        disabled={loading || !location || !isInGeofence}
                        className={`w-full ${
                          isInGeofence
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-600 opacity-50 cursor-not-allowed'
                        }`}
                        data-testid={`button-clock-in-${site.id}`}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Clock In Here
                      </Button>
                    </div>
                  );
                })}
              </OrbitCardContent>
            </OrbitCard>
          </div>
        )}

        {/* Active Clock-In View */}
        {view === 'active' && (
          <OrbitCard variant="stat" className="border-2 border-green-600">
            <OrbitCardHeader icon={<CheckCircle2 className="w-6 h-6 text-green-400" />}>
              <OrbitCardTitle className="text-green-400">Active Clock-In</OrbitCardTitle>
            </OrbitCardHeader>
            <OrbitCardContent>
              {activeClockIn ? (
                <div className="space-y-4">
                  <BentoGrid cols={2} gap="sm">
                    <BentoTile>
                      <div className="p-4">
                        <p className="text-xs text-gray-400 mb-1">Worker</p>
                        <p className="text-lg font-semibold text-white">{activeClockIn.workerName}</p>
                      </div>
                    </BentoTile>
                    <BentoTile>
                      <div className="p-4">
                        <p className="text-xs text-gray-400 mb-1">Job Site</p>
                        <p className="text-lg font-semibold text-white">{activeClockIn.jobSiteName}</p>
                      </div>
                    </BentoTile>
                    <BentoTile>
                      <div className="p-4">
                        <p className="text-xs text-gray-400 mb-1">Clock-In Time</p>
                        <p className="text-lg font-semibold text-cyan-400">
                          {new Date(activeClockIn.clockInTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </BentoTile>
                    <BentoTile>
                      <div className="p-4">
                        <p className="text-xs text-gray-400 mb-1">Elapsed Time</p>
                        <p className="text-xl font-bold text-yellow-400">
                          {Math.floor((new Date().getTime() - new Date(activeClockIn.clockInTime).getTime()) / 3600000)}h
                          {Math.floor(((new Date().getTime() - new Date(activeClockIn.clockInTime).getTime()) % 3600000) / 60000)}m
                        </p>
                      </div>
                    </BentoTile>
                  </BentoGrid>

                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <span className="text-sm text-gray-400">Verification Status</span>
                    <Badge className={activeClockIn.verified ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}>
                      {activeClockIn.verified ? '✓ GPS Verified' : '✗ Not Verified'}
                    </Badge>
                  </div>

                  <Button
                    onClick={handleClockOut}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-lg"
                    data-testid="button-clock-out"
                  >
                    🛑 Clock Out
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-gray-400">No active clock-in. Please check in from a job site.</p>
                </div>
              )}
            </OrbitCardContent>
          </OrbitCard>
        )}

        {/* History View */}
        {view === 'history' && (
          <OrbitCard>
            <OrbitCardHeader icon={<History className="w-5 h-5 text-cyan-400" />}>
              <OrbitCardTitle>Clock-In History</OrbitCardTitle>
            </OrbitCardHeader>
            <OrbitCardContent>
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-gray-400">No clock-in history yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map(record => (
                    <div key={record.id} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600 hover:border-cyan-500/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-white">{record.jobSiteName}</p>
                          <p className="text-xs text-gray-400">{record.workerName}</p>
                        </div>
                        <Badge className="bg-green-900 text-green-200">✓ Verified</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                        <div>
                          <span className="text-slate-500">In:</span> {new Date(record.clockInTime).toLocaleTimeString()}
                        </div>
                        <div>
                          <span className="text-slate-500">Out:</span> {record.clockOutTime ? new Date(record.clockOutTime).toLocaleTimeString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </OrbitCardContent>
          </OrbitCard>
        )}
      </div>
    </div>
  );
}
