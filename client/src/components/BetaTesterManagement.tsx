import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  TestTube, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  AlertTriangle,
  FileText,
  Activity
} from 'lucide-react';

interface BetaTester {
  id: number;
  name: string;
  email: string | null;
  status: string;
  accessLevel: string;
  notes: string | null;
  createdBy: string;
  lastLoginAt: string | null;
  loginCount: number;
  createdAt: string;
}

interface AccessLog {
  id: number;
  testerId: number;
  testerName: string;
  action: string;
  feature: string | null;
  details: string | null;
  ipAddress: string | null;
  timestamp: string;
}

export function BetaTesterManagement() {
  const [testers, setTesters] = useState<BetaTester[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'testers' | 'logs'>('testers');
  const [showAddForm, setShowAddForm] = useState(false);
  const [generatedPin, setGeneratedPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [newTester, setNewTester] = useState({
    name: '',
    email: '',
    pin: '',
    notes: '',
    accessLevel: 'full_sandbox'
  });

  useEffect(() => {
    fetchTesters();
    fetchLogs();
  }, []);

  const fetchTesters = async () => {
    try {
      const res = await fetch('/api/beta-testers');
      const data = await res.json();
      setTesters(data.testers || []);
    } catch (error) {
      console.error('Failed to fetch beta testers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/beta-testers/logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch access logs:', error);
    }
  };

  const generatePin = async () => {
    try {
      const res = await fetch('/api/beta-testers/generate-pin');
      const data = await res.json();
      setGeneratedPin(data.pin);
      setNewTester({ ...newTester, pin: data.pin });
    } catch (error) {
      console.error('Failed to generate PIN:', error);
    }
  };

  const handleCreateTester = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTester.name || !newTester.pin) {
      alert('Name and PIN are required');
      return;
    }

    try {
      const res = await fetch('/api/beta-testers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTester),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Beta tester created! PIN: ${newTester.pin}\n\nShare this PIN with ${newTester.name} to grant sandbox access.`);
        setNewTester({ name: '', email: '', pin: '', notes: '', accessLevel: 'full_sandbox' });
        setGeneratedPin('');
        setShowAddForm(false);
        fetchTesters();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create beta tester');
      }
    } catch (error) {
      alert('Failed to create beta tester');
    }
  };

  const handleDeleteTester = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" as a beta tester?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/beta-testers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTesters();
        fetchLogs();
      }
    } catch (error) {
      alert('Failed to delete beta tester');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/beta-testers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchTesters();
      }
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('PIN copied to clipboard!');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <TestTube className="w-8 h-8 text-yellow-400" />
            Beta Tester Management
          </h2>
          <p className="text-gray-400">Manage beta testers with 3-digit PIN access for sandbox testing</p>
        </div>
        <Button 
          onClick={() => { setShowAddForm(true); generatePin(); }}
          className="bg-cyan-600 hover:bg-cyan-700"
          data-testid="button-add-beta-tester"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Beta Tester
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700 pb-4">
        <button
          onClick={() => setActiveTab('testers')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'testers'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="tab-beta-testers"
        >
          <Users className="w-4 h-4 inline mr-2" />
          Beta Testers ({testers.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'logs'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="tab-access-logs"
        >
          <Activity className="w-4 h-4 inline mr-2" />
          Access Logs ({logs.length})
        </button>
      </div>

      {/* Add Beta Tester Form */}
      {showAddForm && (
        <div className="bg-slate-800 border border-cyan-700/50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            Add New Beta Tester
          </h3>
          <form onSubmit={handleCreateTester} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={newTester.name}
                  onChange={(e) => setNewTester({ ...newTester, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  placeholder="Beta tester's name"
                  data-testid="input-tester-name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Email (optional)</label>
                <input
                  type="email"
                  value={newTester.email}
                  onChange={(e) => setNewTester({ ...newTester, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  placeholder="email@example.com"
                  data-testid="input-tester-email"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">3-Digit PIN *</label>
                <div className="flex gap-2">
                  <input
                    type={showPin ? "text" : "password"}
                    value={newTester.pin}
                    onChange={(e) => setNewTester({ ...newTester, pin: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                    maxLength={3}
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center text-xl tracking-widest"
                    placeholder="•••"
                    data-testid="input-tester-pin"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowPin(!showPin)}
                    data-testid="button-toggle-pin"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generatePin}
                    data-testid="button-generate-pin"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                {generatedPin && (
                  <p className="text-xs text-cyan-400 mt-1">Generated PIN: {generatedPin}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Access Level</label>
                <select
                  value={newTester.accessLevel}
                  onChange={(e) => setNewTester({ ...newTester, accessLevel: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  data-testid="select-access-level"
                >
                  <option value="full_sandbox">Full Sandbox Access</option>
                  <option value="limited">Limited Access</option>
                  <option value="view_only">View Only</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Notes (optional)</label>
              <textarea
                value={newTester.notes}
                onChange={(e) => setNewTester({ ...newTester, notes: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                rows={2}
                placeholder="Any notes about this beta tester..."
                data-testid="textarea-tester-notes"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" data-testid="button-create-tester">
                <Plus className="w-4 h-4 mr-2" />
                Create Beta Tester
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setShowAddForm(false); setGeneratedPin(''); }}
                data-testid="button-cancel-add"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Beta Testers List */}
      {activeTab === 'testers' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading beta testers...</div>
          ) : testers.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
              <TestTube className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No beta testers yet</p>
              <Button 
                onClick={() => { setShowAddForm(true); generatePin(); }}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Beta Tester
              </Button>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Access Level</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Last Login</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Logins</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {testers.map((tester) => (
                    <tr key={tester.id} className="hover:bg-slate-700/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TestTube className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-medium">{tester.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{tester.email || '-'}</td>
                      <td className="px-4 py-3">
                        {tester.status === 'active' ? (
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded font-bold flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : tester.status === 'suspended' ? (
                          <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded font-bold flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            Suspended
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-600 text-white text-xs rounded font-bold flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" />
                            Revoked
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-cyan-400 font-medium">{tester.accessLevel.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {tester.lastLoginAt ? formatDate(tester.lastLoginAt) : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-white font-bold">{tester.loginCount}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {tester.status === 'active' ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusChange(tester.id, 'suspended')}
                              className="text-yellow-400 border-yellow-600"
                              data-testid={`button-suspend-${tester.id}`}
                            >
                              Suspend
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusChange(tester.id, 'active')}
                              className="text-green-400 border-green-600"
                              data-testid={`button-activate-${tester.id}`}
                            >
                              Activate
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteTester(tester.id, tester.name)}
                            className="text-red-400 border-red-600"
                            data-testid={`button-delete-${tester.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Access Logs */}
      {activeTab === 'logs' && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No access logs yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Tester</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Feature</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-white font-medium">{log.testerName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded font-bold ${
                        log.action === 'login' ? 'bg-green-600 text-white' :
                        log.action === 'logout' ? 'bg-gray-600 text-white' :
                        'bg-cyan-600 text-white'
                      }`}>
                        {log.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{log.feature || '-'}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-sm">{log.ipAddress || '-'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{formatDate(log.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-bold mb-1">Beta Tester Access</p>
            <p className="text-gray-300 text-sm">
              Beta testers use 3-digit PINs for sandbox access. They can explore all features and test workflows
              without affecting production data. Share their PIN securely after creation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
