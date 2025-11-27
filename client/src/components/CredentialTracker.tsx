import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  Download,
  Upload,
  Eye,
  RefreshCw,
  Bell,
  Award,
  FileText,
  Search,
  Filter
} from 'lucide-react';

interface Credential {
  id: string;
  workerId: string;
  workerName: string;
  type: string;
  credentialNumber: string;
  issueDate: string;
  expirationDate: string;
  status: 'valid' | 'expiring_soon' | 'expired' | 'pending_renewal';
  daysUntilExpiration: number;
  documentUrl: string | null;
  verificationStatus: 'verified' | 'pending' | 'failed';
  renewalRequired: boolean;
  lastVerified: string;
}

const mockCredentials: Credential[] = [
  {
    id: 'CRED-001',
    workerId: 'W-001',
    workerName: 'John Smith',
    type: 'Forklift Certification',
    credentialNumber: 'FK-2023-45678',
    issueDate: '2023-01-15',
    expirationDate: '2025-01-15',
    status: 'expiring_soon',
    daysUntilExpiration: 49,
    documentUrl: '/docs/forklift-cert-001.pdf',
    verificationStatus: 'verified',
    renewalRequired: true,
    lastVerified: '2024-11-01'
  },
  {
    id: 'CRED-002',
    workerId: 'W-002',
    workerName: 'Maria Garcia',
    type: 'Safety Training',
    credentialNumber: 'OSHA-10-789456',
    issueDate: '2024-06-20',
    expirationDate: '2027-06-20',
    status: 'valid',
    daysUntilExpiration: 940,
    documentUrl: '/docs/safety-002.pdf',
    verificationStatus: 'verified',
    renewalRequired: false,
    lastVerified: '2024-11-20'
  },
  {
    id: 'CRED-003',
    workerId: 'W-003',
    workerName: 'David Johnson',
    type: 'Food Handler Permit',
    credentialNumber: 'FH-TN-123456',
    issueDate: '2022-03-10',
    expirationDate: '2024-03-10',
    status: 'expired',
    daysUntilExpiration: -261,
    documentUrl: '/docs/food-handler-003.pdf',
    verificationStatus: 'failed',
    renewalRequired: true,
    lastVerified: '2024-03-01'
  },
  {
    id: 'CRED-004',
    workerId: 'W-001',
    workerName: 'John Smith',
    type: 'OSHA 30-Hour',
    credentialNumber: 'OSHA-30-234567',
    issueDate: '2024-09-15',
    expirationDate: '2029-09-15',
    status: 'valid',
    daysUntilExpiration: 1755,
    documentUrl: null,
    verificationStatus: 'pending',
    renewalRequired: false,
    lastVerified: '2024-09-20'
  },
  {
    id: 'CRED-005',
    workerId: 'W-002',
    workerName: 'Maria Garcia',
    type: 'First Aid/CPR',
    credentialNumber: 'CPR-2024-98765',
    issueDate: '2024-02-01',
    expirationDate: '2026-02-01',
    status: 'valid',
    daysUntilExpiration: 432,
    documentUrl: '/docs/cpr-005.pdf',
    verificationStatus: 'verified',
    renewalRequired: false,
    lastVerified: '2024-11-15'
  },
  {
    id: 'CRED-006',
    workerId: 'W-004',
    workerName: 'Sarah Williams',
    type: 'Commercial Driver License',
    credentialNumber: 'CDL-A-456789',
    issueDate: '2021-07-20',
    expirationDate: '2025-07-20',
    status: 'expiring_soon',
    daysUntilExpiration: 235,
    documentUrl: '/docs/cdl-006.pdf',
    verificationStatus: 'verified',
    renewalRequired: true,
    lastVerified: '2024-10-01'
  }
];

export function CredentialTracker() {
  const [activeTab, setActiveTab] = useState<'overview' | 'all-credentials' | 'alerts' | 'upload'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const stats = {
    total: mockCredentials.length,
    valid: mockCredentials.filter(c => c.status === 'valid').length,
    expiringSoon: mockCredentials.filter(c => c.status === 'expiring_soon').length,
    expired: mockCredentials.filter(c => c.status === 'expired').length,
    pendingVerification: mockCredentials.filter(c => c.verificationStatus === 'pending').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-600 text-white';
      case 'expiring_soon': return 'bg-yellow-600 text-white';
      case 'expired': return 'bg-red-600 text-white';
      case 'pending_renewal': return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getVerificationColor = (verification: string) => {
    switch (verification) {
      case 'verified': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-cyan-400" />
          Credential Tracking & Expiration Management
        </h2>
        <p className="text-gray-400">Automated alerts • License tracking • Compliance monitoring</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700 pb-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="tab-credential-overview"
        >
          <Shield className="w-4 h-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('all-credentials')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'all-credentials'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="tab-all-credentials"
        >
          <FileText className="w-4 h-4 inline mr-2" />
          All Credentials ({stats.total})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'alerts'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="tab-alerts"
        >
          <Bell className="w-4 h-4 inline mr-2" />
          Alerts
          {(stats.expiringSoon + stats.expired) > 0 && (
            <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
              {stats.expiringSoon + stats.expired}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'upload'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="tab-upload-credential"
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Upload Credential
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-8 h-8 text-cyan-400" />
                <span className="text-2xl font-bold text-white">{stats.total}</span>
              </div>
              <p className="text-gray-400 text-sm">Total Credentials</p>
            </div>
            <div className="bg-slate-800 border border-green-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white">{stats.valid}</span>
              </div>
              <p className="text-gray-400 text-sm">Valid</p>
            </div>
            <div className="bg-slate-800 border border-yellow-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{stats.expiringSoon}</span>
              </div>
              <p className="text-gray-400 text-sm">Expiring Soon</p>
            </div>
            <div className="bg-slate-800 border border-red-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-8 h-8 text-red-400" />
                <span className="text-2xl font-bold text-white">{stats.expired}</span>
              </div>
              <p className="text-gray-400 text-sm">Expired</p>
            </div>
            <div className="bg-slate-800 border border-orange-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-8 h-8 text-orange-400" />
                <span className="text-2xl font-bold text-white">{stats.pendingVerification}</span>
              </div>
              <p className="text-gray-400 text-sm">Pending Verification</p>
            </div>
          </div>

          {/* Upcoming Expirations */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              Upcoming Expirations (Next 90 Days)
            </h3>
            <div className="space-y-3">
              {mockCredentials
                .filter(c => c.daysUntilExpiration > 0 && c.daysUntilExpiration <= 90)
                .sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration)
                .map((cred) => (
                  <div key={cred.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded hover:bg-slate-700">
                    <div className="flex-1">
                      <p className="text-white font-bold">{cred.workerName}</p>
                      <p className="text-sm text-gray-400">{cred.type} • {cred.credentialNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">{cred.daysUntilExpiration} days</p>
                      <p className="text-xs text-gray-400">Expires {cred.expirationDate}</p>
                    </div>
                    <Button size="sm" variant="outline" className="ml-4" data-testid={`button-renew-${cred.id}`}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Renew
                    </Button>
                  </div>
                ))}
            </div>
          </div>

          {/* Expired Credentials */}
          {stats.expired > 0 && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-400" />
                Expired Credentials - Immediate Action Required
              </h3>
              <div className="space-y-3">
                {mockCredentials
                  .filter(c => c.status === 'expired')
                  .map((cred) => (
                    <div key={cred.id} className="flex items-center justify-between p-4 bg-red-900/30 rounded">
                      <div className="flex-1">
                        <p className="text-white font-bold">{cred.workerName}</p>
                        <p className="text-sm text-gray-400">{cred.type} • {cred.credentialNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 font-bold">EXPIRED</p>
                        <p className="text-xs text-gray-400">{Math.abs(cred.daysUntilExpiration)} days ago</p>
                      </div>
                      <Button size="sm" className="ml-4 bg-red-600 hover:bg-red-700" data-testid={`button-urgent-renew-${cred.id}`}>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Renew Now
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* All Credentials Tab */}
      {activeTab === 'all-credentials' && (
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by worker name, credential type, or number..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-credentials"
              />
            </div>
            <select
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded text-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              data-testid="select-filter-status"
            >
              <option value="all">All Status</option>
              <option value="valid">Valid</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Credentials Table */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Worker</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Credential Type</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Credential #</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Expiration</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Verification</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {mockCredentials
                  .filter(c => filterStatus === 'all' || c.status === filterStatus)
                  .map((cred) => (
                    <tr key={cred.id} className="hover:bg-slate-700/50">
                      <td className="px-4 py-3 text-white">{cred.workerName}</td>
                      <td className="px-4 py-3 text-white">{cred.type}</td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-sm">{cred.credentialNumber}</td>
                      <td className="px-4 py-3">
                        <p className="text-white">{cred.expirationDate}</p>
                        {cred.status === 'expiring_soon' && (
                          <p className="text-xs text-yellow-400">In {cred.daysUntilExpiration} days</p>
                        )}
                        {cred.status === 'expired' && (
                          <p className="text-xs text-red-400">{Math.abs(cred.daysUntilExpiration)} days ago</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded font-bold ${getStatusColor(cred.status)}`}>
                          {cred.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${getVerificationColor(cred.verificationStatus)}`}>
                          {cred.verificationStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {cred.documentUrl && (
                            <Button size="sm" variant="outline" data-testid={`button-view-doc-${cred.id}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {cred.renewalRequired && (
                            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700" data-testid={`button-renew-cred-${cred.id}`}>
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-white">Automated Alert Rules</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded">
                <div className="flex items-center gap-4">
                  <Bell className="w-6 h-6 text-cyan-400" />
                  <div>
                    <p className="text-white font-bold">90-Day Expiration Warning</p>
                    <p className="text-sm text-gray-400">Alert admin when credential expires in 90 days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400 font-bold">ACTIVE</span>
                  <Button size="sm" variant="outline" data-testid="button-edit-alert-90">
                    Edit
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded">
                <div className="flex items-center gap-4">
                  <Bell className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-white font-bold">30-Day Urgent Warning</p>
                    <p className="text-sm text-gray-400">Email worker and admin 30 days before expiration</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400 font-bold">ACTIVE</span>
                  <Button size="sm" variant="outline" data-testid="button-edit-alert-30">
                    Edit
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded">
                <div className="flex items-center gap-4">
                  <Bell className="w-6 h-6 text-red-400" />
                  <div>
                    <p className="text-white font-bold">Expiration Day Alert</p>
                    <p className="text-sm text-gray-400">Immediate notification on expiration date</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400 font-bold">ACTIVE</span>
                  <Button size="sm" variant="outline" data-testid="button-edit-alert-expire">
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-2xl font-bold mb-6 text-white">Upload New Credential</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Worker *</label>
                <select
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  data-testid="select-worker-upload"
                >
                  <option value="">Select worker...</option>
                  <option value="W-001">John Smith</option>
                  <option value="W-002">Maria Garcia</option>
                  <option value="W-003">David Johnson</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Credential Type *</label>
                <select
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  data-testid="select-credential-type"
                >
                  <option value="">Select type...</option>
                  <option value="forklift">Forklift Certification</option>
                  <option value="safety">Safety Training (OSHA)</option>
                  <option value="food">Food Handler Permit</option>
                  <option value="cpr">First Aid/CPR</option>
                  <option value="cdl">Commercial Driver License</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Credential Number *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  placeholder="e.g., FK-2024-12345"
                  data-testid="input-credential-number"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Issue Date *</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  data-testid="input-issue-date"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Expiration Date *</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  data-testid="input-expiration-date"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Upload Document *</label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-cyan-500 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">Drag and drop or click to upload</p>
                <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                <input type="file" className="hidden" data-testid="input-upload-file" />
              </div>
            </div>
            <div className="flex gap-4">
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" data-testid="button-upload-credential">
                <Upload className="w-4 h-4 mr-2" />
                Upload Credential
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setActiveTab('overview')}
                data-testid="button-cancel-upload"
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
