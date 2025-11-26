import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Download, Eye, FileText, ArrowLeft, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'wouter';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import Paystub from '@/components/Paystub';
import { downloadPaystubPDF } from '@/lib/paystubPDF';

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

export default function PayrollProcessing() {
  const [workers, setWorkers] = useState<WorkerPayrollData[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Payroll period state
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  
  // Paystub preview
  const [previewPaystub, setPreviewPaystub] = useState<PaystubData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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
        
        // Reload workers
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
      // First, process the payroll for this worker if not already processed
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
          
          // Fetch the full paystub data
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
      // Process all selected workers
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
        
        // Download each paystub
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

  // Filter workers
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.workerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || worker.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto mb-4">
        <Link href="/">
          <Button 
            variant="ghost" 
            className="text-green-500 hover:text-green-400 hover:bg-green-900/20" 
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-green-500" />
            <h1 className="text-4xl font-bold text-white">Payroll Processing</h1>
          </div>
          <p className="text-gray-400">Process payroll, generate paystubs with hallmark verification</p>
        </div>

        {/* Payroll Period Selector */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5 text-green-500" />
              Payroll Period
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                onClick={() => processPayroll(filteredWorkers.map(w => w.workerId))}
                disabled={loading || filteredWorkers.length === 0}
                className="bg-green-600 hover:bg-green-700 h-10"
                data-testid="button-run-payroll-all"
              >
                💰 Run Payroll for {filteredWorkers.length} worker(s)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>

        {/* Batch Actions */}
        {filteredWorkers.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardContent className="pt-6">
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
                  onClick={() => processPayroll(Array.from(selectedWorkers))}
                  disabled={loading || selectedWorkers.size === 0}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-process-selected"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Process Selected ({selectedWorkers.size})
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
            </CardContent>
          </Card>
        )}

        {/* Workers Table */}
        {loading && filteredWorkers.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-300">Loading workers...</p>
            </CardContent>
          </Card>
        ) : filteredWorkers.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-300">No workers ready for payroll in this period</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
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
              </Card>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {filteredWorkers.map((worker, idx) => {
                const totalHours = parseFloat(worker.regularHours?.toString() || '0') + 
                                  parseFloat(worker.overtimeHours?.toString() || '0');
                
                return (
                  <Card key={worker.workerId} className="bg-slate-800/50 border-slate-700" data-testid={`card-worker-${idx}`}>
                    <CardContent className="p-4">
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
                          onClick={() => processPayroll([worker.workerId])}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Process
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Paystub Preview Dialog */}
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
