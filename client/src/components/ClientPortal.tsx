import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  FileText, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Star,
  MapPin,
  Phone,
  Mail,
  Eye,
  Edit,
  BarChart3
} from 'lucide-react';

// Mock data for demonstration
const mockJobOrders = [
  {
    id: 'JO-001',
    title: 'Warehouse Workers',
    location: 'Nashville, TN',
    workersNeeded: 5,
    workersFilled: 3,
    startDate: '2025-01-02',
    endDate: '2025-01-31',
    payRate: 18.50,
    status: 'active',
    skills: ['Forklift', 'Inventory Management']
  },
  {
    id: 'JO-002',
    title: 'Event Staff',
    location: 'Louisville, KY',
    workersNeeded: 10,
    workersFilled: 10,
    startDate: '2025-01-05',
    endDate: '2025-01-05',
    payRate: 22.00,
    status: 'filled',
    skills: ['Customer Service', 'Event Setup']
  },
  {
    id: 'JO-003',
    title: 'Construction Laborers',
    location: 'Knoxville, TN',
    workersNeeded: 8,
    workersFilled: 0,
    startDate: '2025-01-10',
    endDate: '2025-03-15',
    payRate: 25.00,
    status: 'pending',
    skills: ['Construction', 'Safety Training']
  }
];

const mockTimesheets = [
  {
    id: 'TS-001',
    workerName: 'John Smith',
    jobOrder: 'JO-001',
    weekEnding: '2025-11-24',
    hoursWorked: 40,
    overtimeHours: 5,
    totalAmount: 832.50,
    status: 'pending_approval',
    submittedDate: '2025-11-25'
  },
  {
    id: 'TS-002',
    workerName: 'Maria Garcia',
    jobOrder: 'JO-001',
    weekEnding: '2025-11-24',
    hoursWorked: 38,
    overtimeHours: 0,
    totalAmount: 703.00,
    status: 'approved',
    submittedDate: '2025-11-25',
    approvedDate: '2025-11-26'
  },
  {
    id: 'TS-003',
    workerName: 'David Johnson',
    jobOrder: 'JO-002',
    weekEnding: '2025-11-24',
    hoursWorked: 10,
    overtimeHours: 0,
    totalAmount: 220.00,
    status: 'approved',
    submittedDate: '2025-11-25',
    approvedDate: '2025-11-26'
  }
];

const mockAssignedWorkers = [
  {
    id: 'W-001',
    name: 'John Smith',
    jobOrder: 'JO-001',
    position: 'Warehouse Worker',
    rating: 4.8,
    hoursWorked: 120,
    attendance: 98,
    status: 'active',
    skills: ['Forklift Certified', 'Inventory', 'Safety']
  },
  {
    id: 'W-002',
    name: 'Maria Garcia',
    jobOrder: 'JO-001',
    position: 'Warehouse Worker',
    rating: 4.9,
    hoursWorked: 115,
    attendance: 100,
    status: 'active',
    skills: ['Forklift Certified', 'Shipping', 'Quality Control']
  },
  {
    id: 'W-003',
    name: 'David Johnson',
    jobOrder: 'JO-002',
    position: 'Event Staff',
    rating: 4.7,
    hoursWorked: 10,
    attendance: 100,
    status: 'completed',
    skills: ['Customer Service', 'Setup/Teardown']
  }
];

const mockReports = [
  { id: 1, name: 'Labor Cost Analysis - November 2025', type: 'Financial', date: '2025-11-26', size: '245 KB' },
  { id: 2, name: 'Worker Performance Summary - Q4 2025', type: 'Performance', date: '2025-11-20', size: '189 KB' },
  { id: 3, name: 'Timesheet Reconciliation - Week 47', type: 'Payroll', date: '2025-11-18', size: '312 KB' },
  { id: 4, name: 'Safety Incident Report - November 2025', type: 'Compliance', date: '2025-11-15', size: '156 KB' }
];

export function ClientPortal() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'timesheets' | 'workers' | 'reports' | 'new-job'>('dashboard');
  const [selectedTimesheet, setSelectedTimesheet] = useState<string | null>(null);

  const stats = {
    activeJobs: mockJobOrders.filter(j => j.status === 'active').length,
    totalWorkers: mockAssignedWorkers.filter(w => w.status === 'active').length,
    pendingTimesheets: mockTimesheets.filter(t => t.status === 'pending_approval').length,
    monthlySpend: 45230.50
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-cyan-400" />
            Client Portal
          </h2>
          <p className="text-gray-400">Self-service job management, timesheet approval & workforce analytics</p>
        </div>
        <Button 
          onClick={() => setActiveTab('new-job')}
          className="bg-cyan-600 hover:bg-cyan-700"
          data-testid="button-create-job-order"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Job Order
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700 pb-4">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'dashboard'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="tab-client-dashboard"
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'jobs'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="tab-job-orders"
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Job Orders ({mockJobOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('timesheets')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'timesheets'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="tab-timesheets"
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Timesheets
          {stats.pendingTimesheets > 0 && (
            <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
              {stats.pendingTimesheets}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('workers')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'workers'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="tab-assigned-workers"
        >
          <Users className="w-4 h-4 inline mr-2" />
          Assigned Workers ({mockAssignedWorkers.filter(w => w.status === 'active').length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'reports'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="tab-reports"
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Reports
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-cyan-400" />
                <span className="text-2xl font-bold text-white">{stats.activeJobs}</span>
              </div>
              <p className="text-gray-400 text-sm">Active Job Orders</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white">{stats.totalWorkers}</span>
              </div>
              <p className="text-gray-400 text-sm">Active Workers</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{stats.pendingTimesheets}</span>
              </div>
              <p className="text-gray-400 text-sm">Pending Approvals</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">${stats.monthlySpend.toLocaleString()}</span>
              </div>
              <p className="text-gray-400 text-sm">Monthly Spend</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-white">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-slate-700/50 rounded">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <p className="text-white font-medium">JO-002 fully staffed</p>
                  <p className="text-xs text-gray-400">10 workers assigned for Event Staff - Louisville</p>
                </div>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-slate-700/50 rounded">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <div className="flex-1">
                  <p className="text-white font-medium">1 timesheet requires approval</p>
                  <p className="text-xs text-gray-400">John Smith - 45 hours (40 reg + 5 OT)</p>
                </div>
                <span className="text-xs text-gray-500">5 hours ago</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-slate-700/50 rounded">
                <Plus className="w-5 h-5 text-cyan-400" />
                <div className="flex-1">
                  <p className="text-white font-medium">New job order created</p>
                  <p className="text-xs text-gray-400">JO-003 - Construction Laborers (8 positions)</p>
                </div>
                <span className="text-xs text-gray-500">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Orders Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search job orders..."
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                data-testid="input-search-jobs"
              />
            </div>
            <Button variant="outline" data-testid="button-filter-jobs">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Job Orders List */}
          <div className="space-y-4">
            {mockJobOrders.map((job) => (
              <div key={job.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{job.title}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded text-xs font-bold ${
                      job.status === 'active' ? 'bg-green-600 text-white' :
                      job.status === 'filled' ? 'bg-cyan-600 text-white' :
                      'bg-yellow-600 text-white'
                    }`}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Workers</p>
                    <p className="text-white font-bold">{job.workersFilled} / {job.workersNeeded}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Pay Rate</p>
                    <p className="text-white font-bold">${job.payRate}/hr</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Start Date</p>
                    <p className="text-white font-bold">{job.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">End Date</p>
                    <p className="text-white font-bold">{job.endDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Job ID</p>
                    <p className="text-white font-bold">{job.id}</p>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-cyan-900/30 text-cyan-300 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid={`button-view-job-${job.id}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-edit-job-${job.id}`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timesheets Tab */}
      {activeTab === 'timesheets' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Timesheet ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Worker</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Job Order</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Week Ending</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Hours</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {mockTimesheets.map((ts) => (
                  <tr key={ts.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-white font-mono">{ts.id}</td>
                    <td className="px-4 py-3 text-white">{ts.workerName}</td>
                    <td className="px-4 py-3 text-white font-mono">{ts.jobOrder}</td>
                    <td className="px-4 py-3 text-white">{ts.weekEnding}</td>
                    <td className="px-4 py-3 text-white">
                      {ts.hoursWorked}h
                      {ts.overtimeHours > 0 && (
                        <span className="ml-1 text-yellow-400">+{ts.overtimeHours}h OT</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white font-bold">${ts.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {ts.status === 'pending_approval' ? (
                        <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">PENDING</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">APPROVED</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {ts.status === 'pending_approval' ? (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            data-testid={`button-approve-${ts.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-reject-${ts.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" data-testid={`button-view-${ts.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assigned Workers Tab */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockAssignedWorkers.map((worker) => (
              <div key={worker.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{worker.name}</h3>
                    <p className="text-sm text-gray-400">{worker.position}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">{worker.jobOrder}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-900/30 px-2 py-1 rounded">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 font-bold">{worker.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Hours Worked</p>
                    <p className="text-white font-bold">{worker.hoursWorked}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Attendance</p>
                    <p className="text-white font-bold">{worker.attendance}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <span className={`px-2 py-1 text-xs rounded font-bold ${
                      worker.status === 'active' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {worker.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap mb-4">
                  {worker.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-cyan-900/30 text-cyan-300 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid={`button-contact-${worker.id}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-view-worker-${worker.id}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-white">Available Reports</h3>
            <div className="space-y-3">
              {mockReports.map((report) => (
                <div key={report.id} className="flex justify-between items-center p-4 bg-slate-700/50 rounded hover:bg-slate-700">
                  <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-cyan-400" />
                    <div>
                      <p className="text-white font-bold">{report.name}</p>
                      <p className="text-xs text-gray-400">{report.type} • {report.date} • {report.size}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" data-testid={`button-download-report-${report.id}`}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Job Order Form */}
      {activeTab === 'new-job' && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-2xl font-bold mb-6 text-white">Create New Job Order</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Job Title *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  placeholder="e.g., Warehouse Workers"
                  data-testid="input-job-title"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Location *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  placeholder="e.g., Nashville, TN"
                  data-testid="input-job-location"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Workers Needed *</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  placeholder="e.g., 5"
                  data-testid="input-workers-needed"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Pay Rate ($/hour) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  placeholder="e.g., 18.50"
                  data-testid="input-pay-rate"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Start Date *</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  data-testid="input-start-date"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">End Date *</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  data-testid="input-end-date"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Required Skills (comma-separated)</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                placeholder="e.g., Forklift, Inventory Management, Safety Training"
                data-testid="input-required-skills"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Job Description</label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                placeholder="Provide detailed job description..."
                data-testid="textarea-job-description"
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" data-testid="button-submit-job">
                <Plus className="w-4 h-4 mr-2" />
                Create Job Order
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setActiveTab('jobs')}
                data-testid="button-cancel-job"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
