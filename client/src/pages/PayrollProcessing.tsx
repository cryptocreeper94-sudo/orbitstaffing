import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, DollarSign, FileText, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface Timesheet {
  id: string;
  workerId: string;
  workerName: string;
  hours: number;
  hourlyRate: number;
  jobSite: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'paid';
}

interface Deduction {
  type: 'equipment' | 'tax' | 'other';
  description: string;
  amount: number;
}

interface Paycheck {
  id: string;
  workerId: string;
  workerName: string;
  payPeriod: string;
  grossPay: number;
  deductions: Deduction[];
  netPay: number;
  hallmarkId: string;
  status: 'pending' | 'processed' | 'failed';
  createdAt: string;
  paystubUrl?: string;
}

export default function PayrollProcessing() {
  const [view, setView] = useState<'timesheets' | 'payroll' | 'paystubs'>('timesheets');
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [paychecks, setPaychecks] = useState<Paycheck[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);

  useEffect(() => {
    loadTimesheets();
    loadPaychecks();
  }, []);

  const loadTimesheets = async () => {
    try {
      const res = await fetch('/api/timesheets/pending-approval');
      if (res.ok) {
        const data = await res.json();
        setTimesheets(data);
      }
    } catch (err) {
      console.error('Load timesheets error:', err);
      // Mock data
      setTimesheets([
        {
          id: 'ts-1',
          workerId: 'worker-001',
          workerName: 'John Smith',
          hours: 40,
          hourlyRate: 18.50,
          jobSite: 'Downtown Construction',
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          status: 'pending',
        },
      ]);
    }
  };

  const loadPaychecks = async () => {
    try {
      const res = await fetch('/api/payroll/paychecks');
      if (res.ok) {
        const data = await res.json();
        setPaychecks(data);
      }
    } catch (err) {
      console.error('Load paychecks error:', err);
    }
  };

  const approveTimesheet = async (timesheet: Timesheet) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/timesheets/${timesheet.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        toast.success(`Timesheet approved for ${timesheet.workerName}`);
        setTimesheets(timesheets.filter(t => t.id !== timesheet.id));
      } else {
        toast.error('Failed to approve timesheet');
      }
    } catch (err) {
      console.error('Approve error:', err);
      toast.error('Error approving timesheet');
    } finally {
      setLoading(false);
    }
  };

  const processPayroll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payroll/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Processed ${data.count} paychecks`);
        loadPaychecks();
        setTimesheets([]);
      } else {
        toast.error('Failed to process payroll');
      }
    } catch (err) {
      console.error('Process error:', err);
      toast.error('Error processing payroll');
    } finally {
      setLoading(false);
    }
  };

  const generatePaystub = async (paycheck: Paycheck) => {
    try {
      const res = await fetch(`/api/payroll/${paycheck.id}/paystub`, {
        method: 'GET',
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `paystub-${paycheck.workerId}-${paycheck.payPeriod}.pdf`;
        a.click();
        toast.success('Paystub downloaded');
      } else {
        toast.error('Failed to generate paystub');
      }
    } catch (err) {
      console.error('Paystub error:', err);
      toast.error('Error generating paystub');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-green-500" />
            <h1 className="text-4xl font-bold text-white">Payroll Processing</h1>
          </div>
          <p className="text-gray-400">Manage timesheets, deductions, and generate paystubs with hallmark verification</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-lg w-fit flex-wrap">
          <Button
            onClick={() => setView('timesheets')}
            variant={view === 'timesheets' ? 'default' : 'ghost'}
            className="rounded text-xs sm:text-sm"
            data-testid="tab-timesheets"
          >
            📋 Timesheets
          </Button>
          <Button
            onClick={() => setView('payroll')}
            variant={view === 'payroll' ? 'default' : 'ghost'}
            className="rounded text-xs sm:text-sm"
            data-testid="tab-payroll"
          >
            💳 Generate Payroll
          </Button>
          <Button
            onClick={() => setView('paystubs')}
            variant={view === 'paystubs' ? 'default' : 'ghost'}
            className="rounded text-xs sm:text-sm"
            data-testid="tab-paystubs"
          >
            📄 Paystubs
          </Button>
        </div>

        {/* Timesheets View */}
        {view === 'timesheets' && (
          <div className="space-y-6">
            {timesheets.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-300">No timesheets pending approval</p>
                </CardContent>
              </Card>
            ) : (
              timesheets.map(timesheet => {
                const grossPay = timesheet.hours * timesheet.hourlyRate;
                return (
                  <Card key={timesheet.id} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Worker</p>
                          <p className="font-semibold text-white">{timesheet.workerName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Hours</p>
                          <p className="text-2xl font-bold text-cyan-400">{timesheet.hours}h</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Rate</p>
                          <p className="text-lg font-semibold text-white">${timesheet.hourlyRate.toFixed(2)}/hr</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Gross Pay</p>
                          <p className="text-2xl font-bold text-green-400">${grossPay.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-700/30 rounded mb-4 text-xs text-gray-400">
                        <p className="mb-1"><strong>Job Site:</strong> {timesheet.jobSite}</p>
                        <p><strong>Period:</strong> {new Date(timesheet.startDate).toLocaleDateString()} - {new Date(timesheet.endDate).toLocaleDateString()}</p>
                      </div>

                      <Button
                        onClick={() => approveTimesheet(timesheet)}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700"
                        data-testid={`button-approve-${timesheet.id}`}
                      >
                        ✓ Approve Timesheet
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Payroll Generation View */}
        {view === 'payroll' && (
          <Card className="bg-slate-800/50 border-slate-700 border-2 border-green-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <DollarSign className="w-5 h-5" />
                Generate Payroll
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 rounded bg-green-900/20 border border-green-700 space-y-3">
                <h3 className="font-semibold text-white">Payroll Processing Details</h3>
                <p className="text-sm text-gray-300">
                  Processing payroll will:
                </p>
                <ul className="text-sm text-gray-300 space-y-2 ml-4">
                  <li>✓ Calculate gross pay from approved timesheets</li>
                  <li>✓ Apply all deductions (equipment, taxes, garnishments)</li>
                  <li>✓ Generate paystubs with hallmark verification QR codes</li>
                  <li>✓ Create digital hallmark records for audit trail</li>
                  <li>✓ Mark timesheets as paid</li>
                </ul>
              </div>

              {timesheets.length > 0 && (
                <div className="p-4 bg-slate-700/30 rounded">
                  <p className="text-sm text-gray-300">
                    <strong>{timesheets.length} timesheet(s)</strong> ready to process
                  </p>
                </div>
              )}

              <Button
                onClick={processPayroll}
                disabled={loading || timesheets.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg font-semibold"
                data-testid="button-process-payroll"
              >
                💰 Process Payroll Now
              </Button>

              <p className="text-xs text-gray-500">
                All paystubs will include a hallmark security code for verification at /verify/[code]
              </p>
            </CardContent>
          </Card>
        )}

        {/* Paystubs View */}
        {view === 'paystubs' && (
          <div className="space-y-6">
            {paychecks.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-300">No paychecks generated yet</p>
                </CardContent>
              </Card>
            ) : (
              paychecks.map(paycheck => (
                <Card key={paycheck.id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Worker</p>
                        <p className="font-semibold text-white">{paycheck.workerName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Pay Period</p>
                        <p className="text-sm text-gray-300">{paycheck.payPeriod}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Status</p>
                        <Badge className={
                          paycheck.status === 'processed'
                            ? 'bg-green-900 text-green-200'
                            : paycheck.status === 'failed'
                            ? 'bg-red-900 text-red-200'
                            : 'bg-yellow-900 text-yellow-200'
                        }>
                          {paycheck.status === 'processed' ? '✓ Processed' : paycheck.status === 'failed' ? '✗ Failed' : '⏳ Pending'}
                        </Badge>
                      </div>
                    </div>

                    {/* Pay Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                      <div className="p-3 bg-slate-700/30 rounded">
                        <p className="text-xs text-gray-400">Gross Pay</p>
                        <p className="text-xl font-bold text-cyan-400">${paycheck.grossPay.toFixed(2)}</p>
                      </div>
                      <div className="p-3 bg-slate-700/30 rounded">
                        <p className="text-xs text-gray-400">Deductions</p>
                        <p className="text-lg font-bold text-red-400">
                          -${paycheck.deductions.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="p-3 bg-green-900/30 rounded md:col-span-1 col-span-2">
                        <p className="text-xs text-gray-400">Net Pay</p>
                        <p className="text-2xl font-bold text-green-400">${paycheck.netPay.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Deductions List */}
                    {paycheck.deductions.length > 0 && (
                      <div className="mb-6 p-3 bg-slate-700/30 rounded">
                        <p className="text-xs font-semibold text-gray-300 mb-2">Deductions:</p>
                        <ul className="text-xs text-gray-400 space-y-1">
                          {paycheck.deductions.map((ded, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>{ded.description}</span>
                              <span className="text-red-400">-${ded.amount.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Hallmark Info */}
                    <div className="p-4 bg-slate-700/30 rounded mb-6 space-y-2 border border-slate-600">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-cyan-400" />
                        <p className="text-xs text-gray-300">
                          <strong>Hallmark ID:</strong> <code className="text-cyan-400 font-mono">{paycheck.hallmarkId}</code>
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">
                        Verify at: <code className="text-cyan-400 font-mono">/verify/{paycheck.hallmarkId}</code>
                      </p>
                    </div>

                    <Button
                      onClick={() => generatePaystub(paycheck)}
                      disabled={loading}
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                      data-testid={`button-download-${paycheck.id}`}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download Paystub PDF
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
