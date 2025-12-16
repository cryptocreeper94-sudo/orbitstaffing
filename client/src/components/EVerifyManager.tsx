import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, CheckCircle2, AlertTriangle, Clock, RefreshCw, Send, X, FileText, User, Calendar, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BentoTile } from '@/components/ui/bento-grid';
import { SectionHeader } from '@/components/ui/section-header';

interface EVerifyCase {
  id: string;
  tenantId: string;
  workerId: string;
  caseNumber: string | null;
  caseStatus: string;
  eligibilityStatement: string | null;
  photoMatchResult: string | null;
  documentType: string | null;
  i9Id: string | null;
  tncReasonCode: string | null;
  tncDetails: string | null;
  referralDeadline: string | null;
  resolutionNotes: string | null;
  submittedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

interface EVerifyStatus {
  configured: boolean;
  mockMode: boolean;
  message: string;
}

interface Worker {
  id: string;
  fullName: string;
  email?: string;
}

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  initial: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Clock className="w-4 h-4" />, label: 'Initial Review' },
  authorized: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Employment Authorized' },
  referred: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <AlertTriangle className="w-4 h-4" />, label: 'Referred - TNC' },
  final_nonconfirmation: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <X className="w-4 h-4" />, label: 'Final Nonconfirmation' },
  closed: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Closed' },
};

export function EVerifyManager() {
  const queryClient = useQueryClient();
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState<EVerifyCase | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { data: status } = useQuery<EVerifyStatus>({
    queryKey: ['/api/admin/everify/status'],
    queryFn: async () => {
      const res = await fetch('/api/admin/everify/status');
      if (!res.ok) throw new Error('Failed to fetch status');
      return res.json();
    },
  });

  const { data: cases = [], isLoading } = useQuery<EVerifyCase[]>({
    queryKey: ['/api/admin/everify/cases'],
    queryFn: async () => {
      const res = await fetch('/api/admin/everify/cases');
      if (!res.ok) throw new Error('Failed to fetch cases');
      return res.json();
    },
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ['/api/workers'],
    queryFn: async () => {
      const res = await fetch('/api/workers');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { workerId: string; documentType: string }) => {
      const res = await fetch('/api/admin/everify/cases/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to submit case');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/everify/cases'] });
      setShowSubmitDialog(false);
      setSelectedWorker('');
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ caseId, notes }: { caseId: string; notes: string }) => {
      const res = await fetch(`/api/admin/everify/cases/${caseId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionNotes: notes }),
      });
      if (!res.ok) throw new Error('Failed to resolve case');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/everify/cases'] });
      setShowResolveDialog(false);
      setSelectedCase(null);
      setResolutionNotes('');
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async (caseId: string) => {
      const res = await fetch(`/api/admin/everify/cases/${caseId}/refresh`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to refresh case');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/everify/cases'] });
    },
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.fullName || 'Unknown Worker';
  };

  const getCaseStats = () => {
    const stats = {
      total: cases.length,
      authorized: cases.filter(c => c.caseStatus === 'authorized').length,
      pending: cases.filter(c => ['initial', 'referred'].includes(c.caseStatus)).length,
      failed: cases.filter(c => c.caseStatus === 'final_nonconfirmation').length,
    };
    return stats;
  };

  const stats = getCaseStats();

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Compliance"
        title="E-Verify Employment Verification"
        subtitle="Verify employment eligibility for all new hires through USCIS E-Verify system"
      />

      {status?.mockMode && (
        <BentoTile className="p-4 border-yellow-500/30 bg-yellow-500/10">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-300">Mock Mode Active</p>
              <p className="text-sm text-yellow-400/80">{status.message}</p>
            </div>
          </div>
        </BentoTile>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Total Cases</CardDescription>
            <CardTitle className="text-2xl text-white">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-slate-800/50 border-green-700/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-400">Authorized</CardDescription>
            <CardTitle className="text-2xl text-green-400">{stats.authorized}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-slate-800/50 border-yellow-700/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-yellow-400">Pending Review</CardDescription>
            <CardTitle className="text-2xl text-yellow-400">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-slate-800/50 border-red-700/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-red-400">Non-Confirmed</CardDescription>
            <CardTitle className="text-2xl text-red-400">{stats.failed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">E-Verify Cases</h3>
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700" data-testid="btn-submit-everify">
              <Send className="w-4 h-4 mr-2" />
              Submit Verification
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Submit E-Verify Case</DialogTitle>
              <DialogDescription className="text-gray-400">
                Submit a new employment eligibility verification for a worker.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Select Worker</Label>
                <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-worker">
                    <SelectValue placeholder="Choose a worker..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id} className="text-white">
                        {worker.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Document Type</Label>
                <Select defaultValue="passport">
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="passport" className="text-white">U.S. Passport</SelectItem>
                    <SelectItem value="passport_card" className="text-white">U.S. Passport Card</SelectItem>
                    <SelectItem value="perm_resident" className="text-white">Permanent Resident Card</SelectItem>
                    <SelectItem value="eac" className="text-white">Employment Authorization Card</SelectItem>
                    <SelectItem value="drivers_license" className="text-white">Driver's License + SSN Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-400">
                    E-Verify will verify the employee's identity and employment eligibility using information from Form I-9. Results typically return within 3-5 seconds.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubmitDialog(false)} className="border-slate-600 text-gray-300">
                Cancel
              </Button>
              <Button
                onClick={() => submitMutation.mutate({ workerId: selectedWorker, documentType: 'passport' })}
                disabled={!selectedWorker || submitMutation.isPending}
                className="bg-cyan-600 hover:bg-cyan-700"
                data-testid="btn-confirm-submit"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit to E-Verify'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : cases.length === 0 ? (
        <BentoTile className="p-12 text-center">
          <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No E-Verify Cases</h3>
          <p className="text-gray-500 mb-4">Submit your first employment verification to get started.</p>
          <Button onClick={() => setShowSubmitDialog(true)} className="bg-cyan-600 hover:bg-cyan-700">
            <Send className="w-4 h-4 mr-2" />
            Submit First Verification
          </Button>
        </BentoTile>
      ) : (
        <div className="space-y-3">
          {cases.map((caseItem) => {
            const statusConfig = STATUS_CONFIG[caseItem.caseStatus] || STATUS_CONFIG.initial;
            
            return (
              <BentoTile key={caseItem.id} className="p-4" data-testid={`everify-case-${caseItem.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${statusConfig.color}`}>
                      {statusConfig.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-white">{getWorkerName(caseItem.workerId)}</h4>
                        <Badge className={`${statusConfig.color} border`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Case #:</span>
                          <span className="text-gray-300 ml-2">{caseItem.caseNumber || 'Pending'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Document:</span>
                          <span className="text-gray-300 ml-2">{caseItem.documentType || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Submitted:</span>
                          <span className="text-gray-300 ml-2">{formatDate(caseItem.submittedAt)}</span>
                        </div>
                        {caseItem.eligibilityStatement && (
                          <div>
                            <span className="text-gray-500">Result:</span>
                            <span className="text-green-400 ml-2">{caseItem.eligibilityStatement}</span>
                          </div>
                        )}
                      </div>
                      {caseItem.caseStatus === 'referred' && caseItem.tncDetails && (
                        <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <p className="text-sm text-yellow-400">
                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                            TNC: {caseItem.tncDetails}
                          </p>
                          {caseItem.referralDeadline && (
                            <p className="text-xs text-yellow-500 mt-1">
                              Deadline: {formatDate(caseItem.referralDeadline)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refreshMutation.mutate(caseItem.id)}
                      disabled={refreshMutation.isPending}
                      className="border-slate-600"
                      data-testid={`btn-refresh-${caseItem.id}`}
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                    {caseItem.caseStatus !== 'closed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCase(caseItem);
                          setShowResolveDialog(true);
                        }}
                        className="border-slate-600"
                        data-testid={`btn-resolve-${caseItem.id}`}
                      >
                        Close Case
                      </Button>
                    )}
                  </div>
                </div>
              </BentoTile>
            );
          })}
        </div>
      )}

      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Close E-Verify Case</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add resolution notes and close this E-Verify case.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedCase && (
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <p className="text-sm text-gray-400">Case: <span className="text-white">{selectedCase.caseNumber}</span></p>
                <p className="text-sm text-gray-400">Status: <span className="text-white">{STATUS_CONFIG[selectedCase.caseStatus]?.label}</span></p>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-gray-300">Resolution Notes</Label>
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter notes about how this case was resolved..."
                className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                data-testid="input-resolution-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)} className="border-slate-600 text-gray-300">
              Cancel
            </Button>
            <Button
              onClick={() => selectedCase && resolveMutation.mutate({ caseId: selectedCase.id, notes: resolutionNotes })}
              disabled={resolveMutation.isPending}
              className="bg-cyan-600 hover:bg-cyan-700"
              data-testid="btn-confirm-resolve"
            >
              {resolveMutation.isPending ? 'Closing...' : 'Close Case'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EVerifyManager;
