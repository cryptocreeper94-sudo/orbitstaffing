import { useState } from 'react';
import { FileText, Download, Calendar, CheckCircle2, AlertTriangle, Shield, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ReportType = 'i9_audit' | 'state_filing' | 'payroll_summary' | 'worker_comp' | 'safety_incidents';

interface ComplianceReport {
  id: string;
  type: ReportType;
  name: string;
  period: string;
  generatedAt: Date;
  status: 'compliant' | 'warning' | 'critical';
  findings: number;
}

export function ComplianceReports() {
  const [selectedType, setSelectedType] = useState<ReportType>('i9_audit');
  const [reports, setReports] = useState<ComplianceReport[]>([
    {
      id: 'rep-001',
      type: 'i9_audit',
      name: 'I-9 Compliance Audit - November 2024',
      period: 'Nov 2024',
      generatedAt: new Date('2024-11-25'),
      status: 'compliant',
      findings: 0,
    },
    {
      id: 'rep-002',
      type: 'state_filing',
      name: 'Tennessee State Filing Summary',
      period: 'Q3 2024',
      generatedAt: new Date('2024-11-20'),
      status: 'warning',
      findings: 2,
    },
    {
      id: 'rep-003',
      type: 'payroll_summary',
      name: 'Payroll Compliance Summary',
      period: 'Oct 2024',
      generatedAt: new Date('2024-11-01'),
      status: 'compliant',
      findings: 0,
    },
  ]);

  const reportTypes = [
    {
      type: 'i9_audit' as ReportType,
      name: 'I-9 Audit Reports',
      description: 'Employment eligibility verification compliance',
      icon: Shield,
      color: 'cyan',
    },
    {
      type: 'state_filing' as ReportType,
      name: 'State Filing Reports',
      description: 'Multi-state tax and compliance filings',
      icon: FileText,
      color: 'purple',
    },
    {
      type: 'payroll_summary' as ReportType,
      name: 'Payroll Summaries',
      description: 'Payroll tax and withholding reports',
      icon: Calendar,
      color: 'green',
    },
    {
      type: 'worker_comp' as ReportType,
      name: "Workers' Comp Reports",
      description: 'Insurance and claim compliance',
      icon: CheckCircle2,
      color: 'orange',
    },
    {
      type: 'safety_incidents' as ReportType,
      name: 'Safety Incident Reports',
      description: 'OSHA compliance and incident tracking',
      icon: AlertTriangle,
      color: 'red',
    },
  ];

  const generateReport = () => {
    const newReport: ComplianceReport = {
      id: `rep-${Date.now()}`,
      type: selectedType,
      name: `${reportTypes.find(r => r.type === selectedType)?.name} - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      period: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      generatedAt: new Date(),
      status: Math.random() > 0.7 ? 'warning' : 'compliant',
      findings: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0,
    };

    setReports([newReport, ...reports]);
  };

  const downloadReport = (report: ComplianceReport) => {
    // Simulate PDF download
    alert(`Downloading ${report.name}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Automated Compliance Reports</h2>
        <p className="text-gray-400 text-sm">Generate and download compliance reports automatically</p>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <button
              key={report.type}
              onClick={() => setSelectedType(report.type)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedType === report.type
                  ? `border-${report.color}-500 bg-${report.color}-500/10`
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
              data-testid={`button-report-${report.type}`}
            >
              <Icon className={`w-6 h-6 mb-2 text-${report.color}-400`} />
              <h3 className="font-bold text-sm mb-1">{report.name}</h3>
              <p className="text-xs text-gray-400">{report.description}</p>
            </button>
          );
        })}
      </div>

      {/* Generate Report Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold mb-1">Generate New Report</h3>
            <p className="text-sm text-gray-400">
              {reportTypes.find(r => r.type === selectedType)?.description}
            </p>
          </div>
          <Button
            onClick={generateReport}
            className="bg-cyan-600 hover:bg-cyan-700"
            data-testid="button-generate-report"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Period Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reporting Period
            </label>
            <select
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
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              data-testid="select-report-format"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Include Details
            </label>
            <select
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              data-testid="select-report-details"
            >
              <option value="summary">Summary Only</option>
              <option value="detailed">Detailed</option>
              <option value="full">Full Breakdown</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report History */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Generated Reports</h3>
          <div className="flex gap-2">
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
                    report.status === 'compliant' ? 'text-green-400' :
                    report.status === 'warning' ? 'text-yellow-400' :
                    'text-red-400'
                  }`} />
                  <div className="flex-1">
                    <p className="font-bold text-sm">{report.name}</p>
                    <p className="text-xs text-gray-400">
                      Generated {report.generatedAt.toLocaleDateString()} • {report.period}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right mr-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                      report.status === 'compliant' ? 'bg-green-500/20 text-green-400' :
                      report.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {report.status === 'compliant' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Compliant
                        </>
                      ) : report.status === 'warning' ? (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          {report.findings} Warning{report.findings > 1 ? 's' : ''}
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          {report.findings} Critical
                        </>
                      )}
                    </span>
                  </div>

                  <Button
                    onClick={() => downloadReport(report)}
                    className="bg-slate-600 hover:bg-slate-500"
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

      {/* Compliance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <h4 className="font-bold text-sm">Compliant Reports</h4>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {reports.filter(r => r.status === 'compliant').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">No issues found</p>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h4 className="font-bold text-sm">Warnings</h4>
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            {reports.filter(r => r.status === 'warning').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Requires attention</p>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h4 className="font-bold text-sm">Critical Issues</h4>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {reports.filter(r => r.status === 'critical').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Immediate action needed</p>
        </div>
      </div>
    </div>
  );
}
