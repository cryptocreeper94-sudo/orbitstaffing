import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Download, Calendar, CheckCircle2, AlertTriangle, Shield, Filter, Users, DollarSign, Award, ShieldCheck, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ReportType = 'i9_audit' | 'tax_summary' | 'certification_tracker' | 'worker_status' | 'payroll_summary' | 'insurance_compliance';
type ReportFormat = 'pdf' | 'csv' | 'excel';

interface ComplianceReport {
  id: string;
  reportType: ReportType;
  reportName: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  format: ReportFormat;
  filePath?: string;
  recordCount?: number;
  findings?: number;
  complianceStatus?: 'compliant' | 'warning' | 'critical';
  generatedAt?: string;
  createdAt: string;
  errorMessage?: string;
}

interface ReportTypeInfo {
  id: ReportType;
  name: string;
  description: string;
  icon: string;
  fields: string[];
}

const reportTypeIcons: Record<string, React.ElementType> = {
  Shield: Shield,
  FileText: FileText,
  Award: Award,
  Users: Users,
  DollarSign: DollarSign,
  ShieldCheck: ShieldCheck,
};

export function ComplianceReports() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<ReportType>('i9_audit');
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('pdf');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: reportTypesData } = useQuery({
    queryKey: ['/api/admin/compliance/reports'],
    queryFn: async () => {
      const res = await fetch('/api/admin/compliance/reports');
      if (!res.ok) throw new Error('Failed to fetch report types');
      return res.json();
    }
  });

  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['/api/admin/compliance/reports/history'],
    queryFn: async () => {
      const res = await fetch('/api/admin/compliance/reports/history?limit=20');
      if (!res.ok) throw new Error('Failed to fetch report history');
      return res.json();
    },
    refetchInterval: 5000,
  });

  const generateMutation = useMutation({
    mutationFn: async (params: { reportType: ReportType; format: ReportFormat; dateRange?: { startDate: string; endDate: string } }) => {
      const res = await fetch('/api/admin/compliance/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Failed to generate report');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/compliance/reports/history'] });
    },
  });

  const reportTypes: ReportTypeInfo[] = reportTypesData?.reportTypes || [
    { id: 'i9_audit', name: 'I-9 Audit Report', description: 'All workers with I-9 verification status and expiration dates', icon: 'Shield', fields: [] },
    { id: 'tax_summary', name: 'Tax Summary Report', description: 'W-2/1099 summary by reporting period', icon: 'FileText', fields: [] },
    { id: 'certification_tracker', name: 'Certification Tracker', description: 'Worker certifications with upcoming expirations', icon: 'Award', fields: [] },
    { id: 'worker_status', name: 'Worker Status Report', description: 'Active/inactive workers with complete details', icon: 'Users', fields: [] },
    { id: 'payroll_summary', name: 'Payroll Summary Report', description: 'Payroll totals by period, client, and worker', icon: 'DollarSign', fields: [] },
    { id: 'insurance_compliance', name: 'Insurance Compliance Report', description: "Workers' comp and liability insurance status", icon: 'ShieldCheck', fields: [] },
  ];

  const reports: ComplianceReport[] = historyData?.reports || [];

  const generateReport = () => {
    let dateRange;
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'current':
        dateRange = {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0],
        };
        break;
      case 'last':
        dateRange = {
          startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0],
          endDate: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0],
        };
        break;
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);
        const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 0);
        dateRange = {
          startDate: quarterStart.toISOString().split('T')[0],
          endDate: quarterEnd.toISOString().split('T')[0],
        };
        break;
      case 'year':
        dateRange = {
          startDate: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0],
        };
        break;
      case 'custom':
        if (startDate && endDate) {
          dateRange = { startDate, endDate };
        }
        break;
    }

    generateMutation.mutate({
      reportType: selectedType,
      format: selectedFormat,
      dateRange,
    });
  };

  const downloadReport = async (report: ComplianceReport) => {
    if (report.status !== 'completed') return;
    
    try {
      const res = await fetch(`/api/admin/compliance/reports/${report.id}/download`);
      if (!res.ok) throw new Error('Download failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.reportType}_${new Date(report.createdAt).toISOString().split('T')[0]}.${report.format === 'pdf' ? 'html' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const getStatusBadge = (report: ComplianceReport) => {
    if (report.status === 'generating' || report.status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
          <Loader2 className="w-3 h-3 animate-spin" />
          Generating...
        </span>
      );
    }
    
    if (report.status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-400">
          <AlertTriangle className="w-3 h-3" />
          Failed
        </span>
      );
    }

    const complianceStatus = report.complianceStatus || 'compliant';
    const findings = report.findings || 0;

    if (complianceStatus === 'compliant') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-green-500/20 text-green-400">
          <CheckCircle2 className="w-3 h-3" />
          Compliant
        </span>
      );
    } else if (complianceStatus === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
          <AlertTriangle className="w-3 h-3" />
          {findings} Warning{findings > 1 ? 's' : ''}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-400">
          <AlertTriangle className="w-3 h-3" />
          {findings} Critical
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Automated Compliance Reports</h2>
        <p className="text-gray-400 text-sm">Generate and download compliance reports automatically</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => {
          const IconComponent = reportTypeIcons[report.icon] || FileText;
          const isSelected = selectedType === report.id;
          return (
            <button
              key={report.id}
              onClick={() => setSelectedType(report.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
              data-testid={`button-report-${report.id}`}
            >
              <IconComponent className={`w-6 h-6 mb-2 ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`} />
              <h3 className="font-bold text-sm mb-1">{report.name}</h3>
              <p className="text-xs text-gray-400">{report.description}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold mb-1">Generate New Report</h3>
            <p className="text-sm text-gray-400">
              {reportTypes.find(r => r.id === selectedType)?.description}
            </p>
          </div>
          <Button
            onClick={generateReport}
            className="bg-cyan-600 hover:bg-cyan-700"
            disabled={generateMutation.isPending}
            data-testid="button-generate-report"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reporting Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              data-testid="select-report-period"
            >
              <option value="current">Current Month</option>
              <option value="last">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Year to Date</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as ReportFormat)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              data-testid="select-report-format"
            >
              <option value="pdf">PDF (HTML)</option>
              <option value="csv">CSV</option>
              <option value="excel">Excel (CSV)</option>
            </select>
          </div>

          {selectedPeriod === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  data-testid="input-start-date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  data-testid="input-end-date"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Generated Reports</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => refetchHistory()}
              className="p-2 hover:bg-slate-700 rounded transition" 
              data-testid="button-refresh-reports"
            >
              <RefreshCw className={`w-4 h-4 text-gray-400 ${historyLoading ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 hover:bg-slate-700 rounded transition" data-testid="button-filter-reports">
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {reports.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No reports generated yet</p>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition"
                data-testid={`report-${report.id}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileText className={`w-5 h-5 ${
                    report.status === 'completed' && report.complianceStatus === 'compliant' ? 'text-green-400' :
                    report.status === 'completed' && report.complianceStatus === 'warning' ? 'text-yellow-400' :
                    report.status === 'failed' || report.complianceStatus === 'critical' ? 'text-red-400' :
                    'text-blue-400'
                  }`} />
                  <div className="flex-1">
                    <p className="font-bold text-sm">{report.reportName}</p>
                    <p className="text-xs text-gray-400">
                      Generated {new Date(report.createdAt).toLocaleDateString()} • {report.recordCount || 0} records • {report.format?.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right mr-4">
                    {getStatusBadge(report)}
                  </div>

                  <Button
                    onClick={() => downloadReport(report)}
                    disabled={report.status !== 'completed'}
                    className="bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid={`button-download-${report.id}`}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <h4 className="font-bold text-sm">Compliant Reports</h4>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {reports.filter(r => r.status === 'completed' && r.complianceStatus === 'compliant').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">No issues found</p>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h4 className="font-bold text-sm">Warnings</h4>
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            {reports.filter(r => r.status === 'completed' && r.complianceStatus === 'warning').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Requires attention</p>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h4 className="font-bold text-sm">Critical Issues</h4>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {reports.filter(r => r.status === 'completed' && r.complianceStatus === 'critical').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Immediate action needed</p>
        </div>
      </div>
    </div>
  );
}
