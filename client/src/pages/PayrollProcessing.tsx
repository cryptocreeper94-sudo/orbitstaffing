import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DollarSign, Download, Eye, FileText, ArrowLeft, Calendar, Users, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'wouter';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import Paystub from '@/components/Paystub';
import { downloadPaystubPDF } from '@/lib/paystubPDF';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { PageHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, StatCard } from '@/components/ui/orbit-card';

interface WorkerPayrollData {
  workerId: string;
  workerName: string;
  hourlyWage: string | number;
  regularHours: string | number;
  overtimeHours: string | number;
  grossPay: number;
  estimatedDeductions: number;
  estimatedNetPay: number;
  status: string;
}

interface ProcessedPayroll {
  payrollId: string;
  workerId: string;
  workerName: string;
  grossPay: number;
  netPay: number;
  hallmarkAssetNumber: string;
}

interface PaystubData {
  id: string;
  employeeId: string;
  workerName: string;
  workerEmail?: string;
  payPeriodStart: Date | string;
  payPeriodEnd: Date | string;
  payDate: Date | string;
  regularHours: string | number;
  overtimeHours: string | number;
  totalHours: string | number;
  hourlyRate: string | number;
  regularPay: string | number;
  overtimePay: string | number;
  grossPay: string | number;
  federalIncomeTax: string | number;
  socialSecurityTax: string | number;
  medicareTax: string | number;
  additionalMedicareTax?: string | number;
  stateTax: string | number;
  localTax?: string | number;
  totalMandatoryDeductions: string | number;
  totalGarnishments?: string | number;
  garnishmentsBreakdown?: any[];
  netPay: string | number;
  hallmarkAssetNumber?: string;
  workState?: string;
  workCity?: string;
  status?: string;
}

interface PayrollPreviewData {
  workerId: string;
  workerName: string;
  regularHours: number;
  overtimeHours: number;
  hourlyRate: number;
  grossPay: number;
  federalTax: number;
  stateTax: number;
  ssTax: number;
  medicareTax: number;
  localTax: number;
  benefitsDeductions: number;
  garnishments: number;
  netPay: number;
  ytdGross?: number;
  ytdNet?: number;
}

export default function PayrollProcessing() {
  const [workers, setWorkers] = useState<WorkerPayrollData[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  
  const [previewPaystub, setPreviewPaystub] = useState<PaystubData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const [showPayrollPreview, setShowPayrollPreview] = useState(false);
  const [payrollPreviewData, setPayrollPreviewData] = useState<PayrollPreviewData[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmationChecked, setConfirmationChecked] = useState(false);

  useEffect(() => {
    loadWorkersReadyForPayroll();
  }, [currentWeekStart]);

  const loadWorkersReadyForPayroll = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/payroll/ready?startDate=${currentWeekStart.toISOString()}&endDate=${currentWeekEnd.toISOString()}`
      );
      
      if (res.ok) {
        const data = await res.json();
        setWorkers(data);
      } else {
        toast.error('Failed to load workers ready for payroll');
      }
    } catch (err) {
      console.error('Load workers error:', err);
      toast.error('Error loading workers');
    } finally {
      setLoading(false);
    }
  };

  const previewPayroll = async (workerIds: string[]) => {
    if (workerIds.length === 0) {
      toast.error('Please select workers to preview');
      return;
    }

    setPreviewLoading(true);
    setConfirmationChecked(false);
    
    try {
      const res = await fetch('/api/payroll/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerIds,
          payPeriodStart: currentWeekStart.toISOString(),
          payPeriodEnd: currentWeekEnd.toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPayrollPreviewData(data.previews || []);
        setShowPayrollPreview(true);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to generate preview');
        
        const previews: PayrollPreviewData[] = workerIds.map(id => {
          const worker = workers.find(w => w.workerId === id);
          if (!worker) return null;
          
          const hourlyRate = Number(worker.hourlyWage) || 15;
          const regularHours = Number(worker.regularHours) || 40;
          const overtimeHours = Number(worker.overtimeHours) || 0;
          const grossPay = worker.grossPay || (regularHours * hourlyRate + overtimeHours * hourlyRate * 1.5);
          const estimatedDeductions = worker.estimatedDeductions || grossPay * 0.25;
          
          return {
            workerId: worker.workerId,
            workerName: worker.workerName,
            regularHours,
            overtimeHours,
            hourlyRate,
            grossPay,
            federalTax: grossPay * 0.12,
            stateTax: grossPay * 0.04,
            ssTax: grossPay * 0.062,
            medicareTax: grossPay * 0.0145,
            localTax: 0,
            benefitsDeductions: 0,
            garnishments: 0,
            netPay: grossPay - estimatedDeductions,
          };
        }).filter(Boolean) as PayrollPreviewData[];
        
        if (previews.length > 0) {
          setPayrollPreviewData(previews);
          setShowPayrollPreview(true);
        }
      }
    } catch (err) {
      console.error('Preview error:', err);
      toast.error('Error generating preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const processPayroll = async (workerIds: string[]) => {
    if (workerIds.length === 0) {
      toast.error('Please select workers to process');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payroll/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerIds,
          payPeriodStart: currentWeekStart.toISOString(),
          payPeriodEnd: currentWeekEnd.toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`✓ Processed ${data.processed} worker(s) successfully`);
        
        if (data.failed > 0) {
          toast.error(`${data.failed} worker(s) failed to process`);
          data.errors?.forEach((error: any) => {
            toast.error(`${error.workerId}: ${error.error}`);
          });
        }
        
        setShowPayrollPreview(false);
        setConfirmationChecked(false);
        await loadWorkersReadyForPayroll();
        setSelectedWorkers(new Set());
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to process payroll');
      }
    } catch (err) {
      console.error('Process error:', err);
      toast.error('Error processing payroll');
    } finally {
      setLoading(false);
    }
  };

  const previewWorkerPaystub = async (workerId: string) => {
    try {
      const res = await fetch('/api/payroll/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerIds: [workerId],
          payPeriodStart: currentWeekStart.toISOString(),
          payPeriodEnd: currentWeekEnd.toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.payrolls && data.payrolls.length > 0) {
          const payrollId = data.payrolls[0].payrollId;
          
          const paystubRes = await fetch(`/api/payroll/paystub/${payrollId}`);
          if (paystubRes.ok) {
            const paystubData = await paystubRes.json();
            setPreviewPaystub(paystubData);
            setShowPreview(true);
          } else {
            toast.error('Failed to load paystub details');
          }
        }
      } else {
        toast.error('Failed to generate preview');
      }
    } catch (err) {
      console.error('Preview error:', err);
      toast.error('Error generating preview');
    }
  };

  const downloadPaystub = async (payrollId: string) => {
    try {
      const res = await fetch(`/api/payroll/paystub/${payrollId}`);
      if (res.ok) {
        const paystubData = await res.json();
        downloadPaystubPDF(paystubData);
        toast.success('✓ Paystub downloaded');
      } else {
        toast.error('Failed to download paystub');
      }
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Error downloading paystub');
    }
  };

  const downloadAllPaystubs = async () => {
    const workerIds = Array.from(selectedWorkers);
    if (workerIds.length === 0) {
      toast.error('Please select workers to download paystubs');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payroll/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerIds,
          payPeriodStart: currentWeekStart.toISOString(),
          payPeriodEnd: currentWeekEnd.toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        for (const payroll of data.payrolls) {
          await downloadPaystub(payroll.payrollId);
        }
        
        toast.success(`✓ Downloaded ${data.payrolls.length} paystub(s)`);
      } else {
        toast.error('Failed to download paystubs');
      }
    } catch (err) {
      console.error('Download all error:', err);
      toast.error('Error downloading paystubs');
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkerSelection = (workerId: string) => {
    const newSelection = new Set(selectedWorkers);
    if (newSelection.has(workerId)) {
      newSelection.delete(workerId);
    } else {
      newSelection.add(workerId);
    }
    setSelectedWorkers(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedWorkers.size === filteredWorkers.length) {
      setSelectedWorkers(new Set());
    } else {
      setSelectedWorkers(new Set(filteredWorkers.map(w => w.workerId)));
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num || 0);
  };

  const formatNumber = (value: string | number, decimals: number = 2) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return (num || 0).toFixed(decimals);
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.workerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || worker.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalGrossPay = filteredWorkers.reduce((sum, w) => sum + (w.grossPay || 0), 0);
  const totalNetPay = filteredWorkers.reduce((sum, w) => sum + (w.estimatedNetPay || 0), 0);
  const totalHours = filteredWorkers.reduce((sum, w) => {
    return sum + (parseFloat(w.regularHours?.toString() || '0') + parseFloat(w.overtimeHours?.toString() || '0'));
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Payroll Processing"
          subtitle="Process payroll, generate paystubs with hallmark verification"
          breadcrumb={
            <Link href="/">
              <Button 
                variant="ghost" 
                className="text-cyan-500 hover:text-cyan-400 hover:bg-cyan-900/20 -ml-2" 
                data-testid="button-back-home"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          }
          actions={
            <div className="flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          }
        />

        <BentoGrid cols={4} gap="md" className="mb-6">
          <BentoTile>
            <StatCard
              label="Workers Ready"
              value={filteredWorkers.length}
              icon={<Users className="w-6 h-6" />}
            />
          </BentoTile>
          <BentoTile>
            <StatCard
              label="Total Hours"
              value={`${formatNumber(totalHours)}h`}
              icon={<Clock className="w-6 h-6" />}
            />
          </BentoTile>
          <BentoTile>
            <StatCard
              label="Total Gross"
              value={formatCurrency(totalGrossPay)}
              icon={<DollarSign className="w-6 h-6" />}
            />
          </BentoTile>
          <BentoTile>
            <StatCard
              label="Total Net"
              value={formatCurrency(totalNetPay)}
              icon={<CheckCircle className="w-6 h-6" />}
            />
          </BentoTile>
        </BentoGrid>

        <OrbitCard className="mb-6">
          <OrbitCardHeader icon={<Calendar className="w-5 h-5 text-green-500" />}>
            <OrbitCardTitle>Payroll Period</OrbitCardTitle>
          </OrbitCardHeader>
          <OrbitCardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Period Type</label>
                <Select defaultValue="weekly" disabled>
                  <SelectTrigger data-testid="select-period-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Week</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
                    data-testid="button-prev-week"
                  >
                    ←
                  </Button>
                  <div className="flex-1 bg-slate-700 rounded px-3 py-2 text-sm text-white" data-testid="text-date-range">
                    {format(currentWeekStart, 'MM/dd/yyyy')} - {format(currentWeekEnd, 'MM/dd/yyyy')}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                    data-testid="button-next-week"
                  >
                    →
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={() => previewPayroll(filteredWorkers.map(w => w.workerId))}
                disabled={loading || previewLoading || filteredWorkers.length === 0}
                className="bg-green-600 hover:bg-green-700 h-10"
                data-testid="button-run-payroll-all"
              >
                {previewLoading ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Calculating...</>
                ) : (
                  <>💰 Preview Payroll for {filteredWorkers.length} worker(s)</>
                )}
              </Button>
            </div>
          </OrbitCardContent>
        </OrbitCard>

        <OrbitCard className="mb-6">
          <OrbitCardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search by worker name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  data-testid="input-search-workers"
                />
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </OrbitCardContent>
        </OrbitCard>

        {filteredWorkers.length > 0 && (
          <OrbitCard className="mb-6">
            <OrbitCardContent>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedWorkers.size === filteredWorkers.length && filteredWorkers.length > 0}
                    onCheckedChange={toggleSelectAll}
                    data-testid="checkbox-select-all"
                  />
                  <span className="text-sm text-gray-300">Select All</span>
                </div>
                
                <Separator orientation="vertical" className="h-6 bg-slate-600" />
                
                <span className="text-sm text-gray-400" data-testid="text-selected-count">
                  {selectedWorkers.size} selected
                </span>
                
                <div className="flex-1" />
                
                <Button
                  onClick={() => previewPayroll(Array.from(selectedWorkers))}
                  disabled={loading || previewLoading || selectedWorkers.size === 0}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-process-selected"
                >
                  {previewLoading ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Calculating...</>
                  ) : (
                    <><Eye className="w-4 h-4 mr-2" /> Preview Selected ({selectedWorkers.size})</>
                  )}
                </Button>
                
                <Button
                  onClick={downloadAllPaystubs}
                  disabled={loading || selectedWorkers.size === 0}
                  variant="outline"
                  className="border-cyan-600 text-cyan-400 hover:bg-cyan-900/20"
                  data-testid="button-download-all"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All Paystubs
                </Button>
              </div>
            </OrbitCardContent>
          </OrbitCard>
        )}

        {loading && filteredWorkers.length === 0 ? (
          <OrbitCard>
            <OrbitCardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-300">Loading workers...</p>
            </OrbitCardContent>
          </OrbitCard>
        ) : filteredWorkers.length === 0 ? (
          <OrbitCard>
            <OrbitCardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-300">No workers ready for payroll in this period</p>
            </OrbitCardContent>
          </OrbitCard>
        ) : (
          <div className="space-y-4">
            <div className="hidden lg:block">
              <OrbitCard className="overflow-hidden p-0">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="p-3 text-left">
                        <Checkbox
                          checked={selectedWorkers.size === filteredWorkers.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th className="p-3 text-left text-xs text-gray-400 font-semibold">Worker Name</th>
                      <th className="p-3 text-right text-xs text-gray-400 font-semibold">Total Hours</th>
                      <th className="p-3 text-right text-xs text-gray-400 font-semibold">Gross Pay</th>
                      <th className="p-3 text-right text-xs text-gray-400 font-semibold">Deductions</th>
                      <th className="p-3 text-right text-xs text-gray-400 font-semibold">Net Pay</th>
                      <th className="p-3 text-center text-xs text-gray-400 font-semibold">Status</th>
                      <th className="p-3 text-center text-xs text-gray-400 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkers.map((worker, idx) => {
                      const totalHours = parseFloat(worker.regularHours?.toString() || '0') + 
                                        parseFloat(worker.overtimeHours?.toString() || '0');
                      
                      return (
                        <tr 
                          key={worker.workerId} 
                          className="border-t border-slate-700 hover:bg-slate-700/30"
                          data-testid={`row-worker-${idx}`}
                        >
                          <td className="p-3">
                            <Checkbox
                              checked={selectedWorkers.has(worker.workerId)}
                              onCheckedChange={() => toggleWorkerSelection(worker.workerId)}
                              data-testid={`checkbox-worker-${idx}`}
                            />
                          </td>
                          <td className="p-3 text-white font-medium" data-testid={`text-worker-name-${idx}`}>
                            {worker.workerName}
                          </td>
                          <td className="p-3 text-right text-cyan-400" data-testid={`text-total-hours-${idx}`}>
                            {formatNumber(totalHours)}h
                          </td>
                          <td className="p-3 text-right text-white font-semibold" data-testid={`text-gross-pay-${idx}`}>
                            {formatCurrency(worker.grossPay)}
                          </td>
                          <td className="p-3 text-right text-red-400" data-testid={`text-deductions-${idx}`}>
                            {formatCurrency(worker.estimatedDeductions)}
                          </td>
                          <td className="p-3 text-right text-green-400 font-bold" data-testid={`text-net-pay-${idx}`}>
                            {formatCurrency(worker.estimatedNetPay)}
                          </td>
                          <td className="p-3 text-center">
                            <Badge 
                              className="bg-green-900 text-green-200"
                              data-testid={`badge-status-${idx}`}
                            >
                              {worker.status === 'ready' ? '✓ Ready' : worker.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => previewWorkerPaystub(worker.workerId)}
                                className="border-cyan-600 text-cyan-400 hover:bg-cyan-900/20"
                                data-testid={`button-preview-${idx}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => processPayroll([worker.workerId])}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700"
                                data-testid={`button-process-${idx}`}
                              >
                                <DollarSign className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </OrbitCard>
            </div>

            <BentoGrid cols={2} gap="md" className="lg:hidden">
              {filteredWorkers.map((worker, idx) => {
                const totalHours = parseFloat(worker.regularHours?.toString() || '0') + 
                                  parseFloat(worker.overtimeHours?.toString() || '0');
                
                return (
                  <BentoTile key={worker.workerId}>
                    <OrbitCard hover={false} className="h-full border-0 bg-transparent" data-testid={`card-worker-${idx}`}>
                      <OrbitCardContent>
                        <div className="flex items-start gap-3 mb-4">
                          <Checkbox
                            checked={selectedWorkers.has(worker.workerId)}
                            onCheckedChange={() => toggleWorkerSelection(worker.workerId)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">{worker.workerName}</h3>
                            <Badge className="bg-green-900 text-green-200 text-xs">
                              {worker.status === 'ready' ? '✓ Ready' : worker.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <p className="text-xs text-gray-400">Total Hours</p>
                            <p className="text-lg font-semibold text-cyan-400">{formatNumber(totalHours)}h</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Gross Pay</p>
                            <p className="text-lg font-semibold text-white">{formatCurrency(worker.grossPay)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Deductions</p>
                            <p className="text-lg font-semibold text-red-400">{formatCurrency(worker.estimatedDeductions)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Net Pay</p>
                            <p className="text-lg font-semibold text-green-400">{formatCurrency(worker.estimatedNetPay)}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => previewWorkerPaystub(worker.workerId)}
                            className="border-cyan-600 text-cyan-400"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => previewPayroll([worker.workerId])}
                            disabled={loading || previewLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Process
                          </Button>
                        </div>
                      </OrbitCardContent>
                    </OrbitCard>
                  </BentoTile>
                );
              })}
            </BentoGrid>
          </div>
        )}
      </div>

      <Dialog open={showPayrollPreview} onOpenChange={setShowPayrollPreview}>
        <DialogContent className="max-w-5xl max-h-[90vh] bg-slate-900 border-slate-700" data-testid="dialog-payroll-preview">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Payroll Preview - Confirm Before Processing
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Review the calculated amounts carefully before processing. Once processed, changes require a correction entry.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[50vh]">
            <div className="space-y-4">
              <OrbitCard variant="stat">
                <h3 className="text-lg font-semibold text-white mb-3">Payroll Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{payrollPreviewData.length}</p>
                    <p className="text-xs text-gray-400">Workers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {formatCurrency(payrollPreviewData.reduce((sum, p) => sum + p.grossPay, 0))}
                    </p>
                    <p className="text-xs text-gray-400">Total Gross</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">
                      {formatCurrency(payrollPreviewData.reduce((sum, p) => 
                        sum + p.federalTax + p.stateTax + p.ssTax + p.medicareTax + p.localTax + p.benefitsDeductions + p.garnishments, 0))}
                    </p>
                    <p className="text-xs text-gray-400">Total Deductions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cyan-400">
                      {formatCurrency(payrollPreviewData.reduce((sum, p) => sum + p.netPay, 0))}
                    </p>
                    <p className="text-xs text-gray-400">Total Net Pay</p>
                  </div>
                </div>
              </OrbitCard>

              <div className="space-y-2">
                {payrollPreviewData.map((preview) => (
                  <OrbitCard key={preview.workerId} variant="glass">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">{preview.workerName}</h4>
                      <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                        Net: {formatCurrency(preview.netPay)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Hours</p>
                        <p className="text-white">{preview.regularHours} + {preview.overtimeHours} OT</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Gross</p>
                        <p className="text-green-400">{formatCurrency(preview.grossPay)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Federal</p>
                        <p className="text-red-400">-{formatCurrency(preview.federalTax)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">FICA</p>
                        <p className="text-red-400">-{formatCurrency(preview.ssTax + preview.medicareTax)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">State/Local</p>
                        <p className="text-red-400">-{formatCurrency(preview.stateTax + preview.localTax)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Other</p>
                        <p className="text-red-400">-{formatCurrency(preview.benefitsDeductions + preview.garnishments)}</p>
                      </div>
                    </div>

                    {preview.ytdGross && (
                      <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-gray-500">
                        YTD: Gross {formatCurrency(preview.ytdGross)} | Net {formatCurrency(preview.ytdNet || 0)}
                      </div>
                    )}
                  </OrbitCard>
                ))}
              </div>
            </div>
          </ScrollArea>
          
          <div className="space-y-4 pt-4 border-t border-slate-700">
            <div className="flex items-center gap-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
              <Checkbox
                id="confirm-payroll"
                checked={confirmationChecked}
                onCheckedChange={(checked) => setConfirmationChecked(checked === true)}
                data-testid="checkbox-confirm-payroll"
              />
              <label htmlFor="confirm-payroll" className="text-sm text-yellow-200 cursor-pointer">
                I have reviewed all calculations and confirm they are correct. I understand that processing payroll will create official pay records and cannot be undone without a correction entry.
              </label>
            </div>
            
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPayrollPreview(false);
                  setConfirmationChecked(false);
                }}
                className="border-slate-600"
                data-testid="button-cancel-payroll"
              >
                Cancel
              </Button>
              <Button
                onClick={() => processPayroll(payrollPreviewData.map(p => p.workerId))}
                disabled={!confirmationChecked || loading}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-confirm-process"
              >
                {loading ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <><CheckCircle className="w-4 h-4 mr-2" /> Confirm & Process Payroll</>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white" data-testid="dialog-paystub-preview">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black">
              <FileText className="w-5 h-5" />
              Paystub Preview
            </DialogTitle>
          </DialogHeader>
          
          {previewPaystub && (
            <div>
              <Paystub paystub={previewPaystub} />
              
              <div className="mt-6 flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                  data-testid="button-close-preview"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    downloadPaystubPDF(previewPaystub);
                    toast.success('✓ Paystub downloaded');
                  }}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-download-preview"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
