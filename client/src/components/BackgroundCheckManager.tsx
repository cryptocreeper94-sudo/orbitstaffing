import React, { useState, useEffect } from 'react';
import { Shield, Search, AlertCircle, CheckCircle2, Clock, XCircle, ExternalLink, User, FileText, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrbitCard } from '@/components/ui/orbit-card';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/section-header';

interface BackgroundCheck {
  id: string;
  tenantId: string;
  workerId: string;
  checkrCandidateId?: string;
  checkrReportId?: string;
  package: string;
  checkType: string;
  status: string;
  adjudication?: string;
  resultStatus?: string;
  reportUrl?: string;
  requestedAt: string;
  completedAt?: string;
  createdAt: string;
  workerName?: string;
}

interface CheckrPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  screenings: string[];
  turnaroundDays: string;
}

interface Worker {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
}

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', icon: <Clock className="w-3.5 h-3.5" />, label: 'Pending' },
  clear: { color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Clear' },
  consider: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/50', icon: <AlertCircle className="w-3.5 h-3.5" />, label: 'Consider' },
  suspended: { color: 'bg-red-500/20 text-red-400 border-red-500/50', icon: <XCircle className="w-3.5 h-3.5" />, label: 'Suspended' },
  dispute: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/50', icon: <AlertCircle className="w-3.5 h-3.5" />, label: 'Dispute' },
};

const PACKAGE_CONFIG: Record<string, { color: string; label: string }> = {
  basic: { color: 'bg-slate-600', label: 'Basic' },
  standard: { color: 'bg-blue-600', label: 'Standard' },
  pro: { color: 'bg-purple-600', label: 'Professional' },
};

export function BackgroundCheckManager() {
  const [checks, setChecks] = useState<BackgroundCheck[]>([]);
  const [packages, setPackages] = useState<CheckrPackage[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInitiateForm, setShowInitiateForm] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<string>('basic');
  const [workerSearch, setWorkerSearch] = useState('');
  const [initiating, setInitiating] = useState(false);
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);
  const [checkrConfigured, setCheckrConfigured] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [checksRes, packagesRes, workersRes, statusRes] = await Promise.all([
        fetch('/api/admin/background-checks'),
        fetch('/api/admin/background-checks/packages'),
        fetch('/api/workers?limit=100'),
        fetch('/api/system/integration-status'),
      ]);

      if (checksRes.ok) {
        const checksData = await checksRes.json();
        setChecks(checksData);
      }

      if (packagesRes.ok) {
        const packagesData = await packagesRes.json();
        setPackages(packagesData);
      }

      if (workersRes.ok) {
        const workersData = await workersRes.json();
        setWorkers(workersData);
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setCheckrConfigured(statusData.status?.checkr?.configured || false);
      }
    } catch (err) {
      console.error('[BackgroundCheckManager] Error:', err);
      setError('Failed to load background check data');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateCheck = async () => {
    if (!selectedWorker || !selectedPackage) {
      setError('Please select a worker and package');
      return;
    }

    try {
      setInitiating(true);
      setError(null);

      const res = await fetch('/api/admin/background-checks/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: selectedWorker,
          package: selectedPackage,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to initiate background check');
      }

      const newCheck = await res.json();
      setChecks([newCheck, ...checks]);
      setShowInitiateForm(false);
      setSelectedWorker('');
      setSelectedPackage('basic');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInitiating(false);
    }
  };

  const filteredWorkers = workers.filter((w) =>
    (w.fullName || '').toLowerCase().includes(workerSearch.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getPackageBadge = (pkg: string) => {
    const config = PACKAGE_CONFIG[pkg] || PACKAGE_CONFIG.basic;
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <OrbitCard className="p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
          <span className="ml-2 text-gray-400">Loading background checks...</span>
        </div>
      </OrbitCard>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Background Checks"
        subtitle="Checkr Integration"
        icon={<Shield className="w-5 h-5 text-cyan-400" />}
      />

      {!checkrConfigured && (
        <OrbitCard className="p-4 border-yellow-500/50 bg-yellow-500/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-300">Checkr API Not Configured</h4>
              <p className="text-sm text-yellow-200/70 mt-1">
                Add CHECKR_API_KEY to your environment to enable live background checks.
                Currently using sandbox mode with mock data.
              </p>
            </div>
          </div>
        </OrbitCard>
      )}

      {error && (
        <OrbitCard className="p-4 border-red-500/50 bg-red-500/10">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        </OrbitCard>
      )}

      <div className="flex items-center justify-between gap-4">
        <Button
          onClick={() => setShowInitiateForm(!showInitiateForm)}
          className="bg-cyan-600 hover:bg-cyan-700"
          data-testid="button-initiate-check"
        >
          <Shield className="w-4 h-4 mr-2" />
          Initiate Background Check
        </Button>

        <Button
          variant="outline"
          onClick={fetchData}
          className="border-slate-600"
          data-testid="button-refresh-checks"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {showInitiateForm && (
        <OrbitCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Initiate New Background Check</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Worker
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={workerSearch}
                  onChange={(e) => setWorkerSearch(e.target.value)}
                  placeholder="Search workers..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  data-testid="input-worker-search"
                />
              </div>
              <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                {filteredWorkers.slice(0, 10).map((worker) => (
                  <button
                    key={worker.id}
                    onClick={() => {
                      setSelectedWorker(worker.id);
                      setWorkerSearch(worker.fullName || '');
                    }}
                    className={`w-full p-2 rounded-lg text-left transition-colors ${
                      selectedWorker === worker.id
                        ? 'bg-cyan-600/30 border border-cyan-500'
                        : 'bg-slate-700/50 hover:bg-slate-700'
                    }`}
                    data-testid={`button-select-worker-${worker.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{worker.fullName || 'Unnamed Worker'}</span>
                    </div>
                    {worker.email && (
                      <p className="text-xs text-gray-500 ml-6">{worker.email}</p>
                    )}
                  </button>
                ))}
                {filteredWorkers.length === 0 && (
                  <p className="text-gray-500 text-sm p-2">No workers found</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Package
              </label>
              <div className="space-y-2">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`w-full p-4 rounded-lg text-left transition-colors border ${
                      selectedPackage === pkg.id
                        ? 'bg-cyan-600/20 border-cyan-500'
                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                    }`}
                    data-testid={`button-select-package-${pkg.id}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">{pkg.name}</span>
                      <span className="text-cyan-400 font-bold">${pkg.price}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{pkg.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {pkg.screenings.slice(0, 3).map((s, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-slate-600">
                          {s}
                        </Badge>
                      ))}
                      {pkg.screenings.length > 3 && (
                        <Badge variant="outline" className="text-xs border-slate-600">
                          +{pkg.screenings.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Turnaround: {pkg.turnaroundDays}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={() => setShowInitiateForm(false)}
              className="border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInitiateCheck}
              disabled={!selectedWorker || !selectedPackage || initiating}
              className="bg-cyan-600 hover:bg-cyan-700"
              data-testid="button-submit-check"
            >
              {initiating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Initiating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Start Background Check
                </>
              )}
            </Button>
          </div>
        </OrbitCard>
      )}

      <OrbitCard className="divide-y divide-slate-700">
        {checks.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No background checks found</p>
            <p className="text-sm text-gray-500 mt-1">
              Click "Initiate Background Check" to get started
            </p>
          </div>
        ) : (
          checks.map((check) => (
            <div key={check.id} className="p-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedCheck(expandedCheck === check.id ? null : check.id)}
                data-testid={`row-check-${check.id}`}
              >
                <div className="flex items-center gap-4">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-white">
                      {check.workerName || `Worker ${check.workerId.slice(0, 8)}...`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(check.requestedAt || check.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getPackageBadge(check.package)}
                  {getStatusBadge(check.status)}
                  {expandedCheck === check.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </div>

              {expandedCheck === check.id && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">Check Type:</span>
                      <span className="text-white capitalize">{check.checkType}</span>
                    </div>
                    {check.checkrCandidateId && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">Candidate ID:</span>
                        <code className="text-xs text-cyan-400 bg-slate-800 px-2 py-0.5 rounded">
                          {check.checkrCandidateId}
                        </code>
                      </div>
                    )}
                    {check.checkrReportId && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">Report ID:</span>
                        <code className="text-xs text-cyan-400 bg-slate-800 px-2 py-0.5 rounded">
                          {check.checkrReportId}
                        </code>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {check.adjudication && (
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">Adjudication:</span>
                        <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                          {check.adjudication.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    )}
                    {check.completedAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-gray-400">Completed:</span>
                        <span className="text-white">{formatDate(check.completedAt)}</span>
                      </div>
                    )}
                    {check.reportUrl && (
                      <div className="mt-3">
                        <a
                          href={check.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm"
                          data-testid={`link-report-${check.id}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Full Report
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Status Timeline</h5>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        check.status !== 'pending' ? 'bg-green-500/20 text-green-400' : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 h-0.5 bg-slate-700">
                        <div className={`h-full transition-all ${
                          check.status === 'clear' || check.status === 'consider' 
                            ? 'bg-green-500 w-full' 
                            : check.status === 'pending' 
                              ? 'bg-yellow-500 w-1/3' 
                              : 'bg-orange-500 w-2/3'
                        }`} />
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        check.status === 'clear' ? 'bg-green-500/20 text-green-400' 
                          : check.status === 'consider' ? 'bg-orange-500/20 text-orange-400'
                          : check.status === 'suspended' ? 'bg-red-500/20 text-red-400'
                          : 'bg-slate-700 text-gray-500'
                      }`}>
                        {check.status === 'clear' ? <CheckCircle2 className="w-4 h-4" /> 
                          : check.status === 'suspended' ? <XCircle className="w-4 h-4" />
                          : <Clock className="w-4 h-4" />}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Initiated</span>
                      <span>
                        {check.status === 'pending' ? 'Processing...' : 
                          check.status === 'clear' ? 'Cleared' :
                          check.status === 'consider' ? 'Review Required' :
                          check.status === 'suspended' ? 'Suspended' : 'Complete'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </OrbitCard>
    </div>
  );
}

export default BackgroundCheckManager;
