import React, { useState, useEffect } from 'react';
import { Lock, LogOut, CheckCircle2, AlertCircle, Shield, Building2, Users, Trash2, AlertTriangle, Eye, Code, Activity, MessageCircle, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { HallmarkWatermark, HallmarkBadge } from '@/components/HallmarkWatermark';
import { DigitalEmployeeCard } from '@/components/DigitalEmployeeCard';
import { AdminManagement } from './AdminManagement';
import { HealthDashboard } from '@/components/HealthDashboard';
import { ContingencyManual } from '@/components/ContingencyManual';
import { OnboardingTracker } from '@/components/OnboardingTracker';
import EnhancedAdminMessaging from '@/components/EnhancedAdminMessaging';
import WeatherNewsWidget from '@/components/WeatherNewsWidget';
import HourCounter from '@/components/HourCounter';
import UniversalEmployeeRegistry from '@/components/UniversalEmployeeRegistry';

type AdminRole = 'master_admin' | 'franchise_admin' | 'customer_admin' | null;

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<AdminRole>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [adminName, setAdminName] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const [showDeveloperPin, setShowDeveloperPin] = useState(false);
  const [developerPin, setDeveloperPin] = useState('');
  const [developerError, setDeveloperError] = useState('');
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuthenticated');
    const savedRole = localStorage.getItem('adminRole') as AdminRole;
    const savedName = localStorage.getItem('adminName');
    const hasWelcomeMessage = localStorage.getItem('showWelcomeMessage') === 'true';
    
    if (adminAuth === 'true' && savedRole) {
      setIsAuthenticated(true);
      setRole(savedRole);
      setAdminName(savedName || 'Admin');
      
      if (hasWelcomeMessage && savedName === 'Sidonie') {
        setShowWelcomeMessage(true);
        localStorage.removeItem('showWelcomeMessage');
      }
    }
  }, []);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-admin-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        setRole('master_admin');
        setAdminName('System Owner');
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminRole', 'master_admin');
        localStorage.setItem('adminName', 'System Owner');
        setPin('');
      } else {
        setError('Invalid PIN.');
        setPin('');
      }
    } catch (err) {
      setError('Failed to verify PIN. Please try again.');
      setPin('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setPin('');
    setError('');
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminName');
    // Redirect to home
    setLocation('/');
  };

  const handleDeveloperPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeveloperError('');

    if (developerPin.length < 4) {
      setDeveloperError('PIN must be at least 4 digits');
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-admin-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: developerPin }),
      });

      if (res.ok) {
        // Redirect to developer page
        setLocation('/developer');
      } else {
        setDeveloperError('Invalid PIN.');
        setDeveloperPin('');
      }
    } catch (err) {
      setDeveloperError('Failed to verify PIN. Please try again.');
      setDeveloperPin('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 max-w-md w-full border border-slate-700">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-cyan-400 mr-3" />
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          </div>

          <p className="text-gray-400 text-sm mb-6 text-center">
            Admins assigned by the system owner can access this panel
          </p>

          {!showDeveloperPin ? (
            <>
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    PIN
                  </label>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    placeholder="••••"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:border-cyan-400"
                    autoFocus
                    data-testid="input-admin-pin"
                  />
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 font-bold text-lg"
                  data-testid="button-admin-login"
                >
                  Login to Admin
                </Button>
              </form>

              {/* Developer Access Button */}
              <button
                onClick={() => setShowDeveloperPin(true)}
                className="w-full mt-4 px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600 rounded-lg text-purple-300 font-bold text-sm transition-all"
                data-testid="button-developer-access"
              >
                🔧 Developer Access
              </button>

              <p className="text-xs text-gray-500 text-center mt-6">
                Enter your admin PIN
              </p>
            </>
          ) : (
            <>
              <form onSubmit={handleDeveloperPinSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeveloperPin(false);
                      setDeveloperPin('');
                      setDeveloperError('');
                    }}
                    className="text-gray-400 hover:text-gray-300"
                    data-testid="button-back-to-admin"
                  >
                    ← Back
                  </button>
                  <h2 className="text-sm font-bold text-purple-400">Developer Panel</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Developer PIN
                  </label>
                  <input
                    type="password"
                    value={developerPin}
                    onChange={(e) => setDeveloperPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    placeholder="••••"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:border-purple-400"
                    autoFocus
                    data-testid="input-developer-pin"
                  />
                </div>

                {developerError && (
                  <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <p className="text-sm text-red-200">{developerError}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-bold text-lg"
                  data-testid="button-developer-login"
                >
                  Access Developer Panel
                </Button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-6">
                For technical team and integrations
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Welcome Modal for Sidonie */}
      {showWelcomeMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl max-w-lg w-full border border-cyan-500/30 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">🎯</div>
              <h2 className="text-2xl font-bold text-cyan-400">Hey Sid! 👋</h2>
            </div>
            
            <p className="text-gray-200 mb-6 text-lg leading-relaxed">
              I know you are an expert on all this, so give me your honest opinion. 
            </p>
            
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-6">
              <p className="text-cyan-300 font-semibold text-lg">
                Let's partner up and make this happen! 🚀
              </p>
            </div>
            
            <p className="text-gray-400 text-sm mb-8">
              You now have full access to the admin dashboard. Review everything, test it out, and let me know what you think. All features are ready for testing.
            </p>
            
            <Button
              onClick={() => setShowWelcomeMessage(false)}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 text-lg"
              data-testid="button-sidonie-welcome-close"
            >
              Got it, let's go! 💪
            </Button>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {adminName}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setLocation('/incident-reporting')}
              className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
              data-testid="button-admin-incident-report"
            >
              <AlertTriangle className="w-4 h-4" />
              Incident Reports
            </Button>
            <Button
              onClick={() => setLocation('/workers-comp-admin')}
              className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
              data-testid="button-admin-workers-comp"
            >
              <Shield className="w-4 h-4" />
              Workers Comp
            </Button>
            <Button
              onClick={() => setLocation('/')}
              className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
              data-testid="button-admin-to-dev"
            >
              <Code className="w-4 h-4" />
              Developer
            </Button>
            <Button
              onClick={() => setLocation('/dashboard')}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              data-testid="button-admin-to-app"
            >
              <Eye className="w-4 h-4" />
              Main App
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
              data-testid="button-admin-logout"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Role-Based Admin Views */}
        {role === 'master_admin' && <MasterAdminDashboard />}
        {role === 'franchise_admin' && <FranchiseAdminDashboard />}
        {role === 'customer_admin' && <CustomerAdminDashboard />}
      </div>
    </div>
  );
}

// ==========================================
// MASTER ADMIN DASHBOARD (System Owner)
// ==========================================
function MasterAdminDashboard() {
  const [activeSection, setActiveSection] = useState<'checklist' | 'admin-mgmt' | 'dnr' | 'health' | 'contingency' | 'messaging'>('checklist');
  const [checklist, setChecklist] = useState([
    {
      id: 'v1-complete',
      category: '🚀 Version 1 - Core Features',
      icon: '✅',
      tasks: [
        { id: 'web-platform', title: 'Web platform fully built & deployed', completed: true },
        { id: 'mobile-app', title: 'Mobile app (iOS/Android) ready for submission', completed: true },
        { id: 'bonus-system', title: 'Dual-tier bonus system implemented', completed: true },
        { id: 'gps-verification', title: 'GPS verification system working', completed: true },
        { id: 'database', title: 'PostgreSQL database configured with Neon', completed: true },
        { id: 'worker-onboarding', title: 'Worker onboarding compliance system with file uploads', completed: true },
        { id: 'admin-dashboard', title: 'Admin dashboard with worker tracking & management', completed: true },
        { id: 'ui-polish', title: 'UI/UX polish (animations, glow effects, responsive design)', completed: true },
      ]
    },
    {
      id: 'pre-launch',
      category: '⚡ Pre-Launch (Sidonie Testing)',
      icon: '📋',
      tasks: [
        { id: 'testing', title: 'End-to-end testing on real devices (Sidonie review)', completed: false },
        { id: 'compliance-check', title: 'State compliance (TN/KY) verification', completed: true },
        { id: 'sandbox-demo', title: 'Sandbox demo system ready for testing', completed: true },
        { id: 'payment-integration', title: 'Stripe payment integration connected', completed: false },
        { id: 'coinbase-integration', title: 'Coinbase Commerce integration connected', completed: false },
        { id: 'google-play', title: 'Submit app to Google Play Store', completed: false },
        { id: 'app-store', title: 'Submit app to Apple App Store', completed: false },
      ]
    },
    {
      id: 'first-franchise',
      category: '🎯 First Franchise Launch',
      icon: '🏆',
      tasks: [
        { id: 'franchise-launch', title: 'Launch production environment for first franchise', completed: false },
        { id: 'data-migration', title: 'Migrate customer/worker data into platform', completed: false },
        { id: 'team-training', title: 'Train franchisee team on platform', completed: false },
        { id: 'go-live', title: 'Go-live with first paying customer', completed: false },
        { id: 'franchise-deal', title: 'Finalize franchise agreement & licensing terms', completed: false },
      ]
    },
    {
      id: 'v2-planning',
      category: '🚀 Version 2 Planning',
      icon: '🗺️',
      tasks: [
        { id: 'v2-roadmap', title: 'V2 roadmap document (features & timeline)', completed: true },
        { id: 'feature-prioritization', title: 'Prioritize top 10 V2 features with customers', completed: false },
        { id: 'customer-feedback', title: 'Gather feedback from early customers & franchisees', completed: false },
        { id: 'feature-tracking', title: 'Set up feature request system for franchisees', completed: false },
      ]
    }
  ]);

  const toggleTask = (categoryId: string, taskId: string) => {
    setChecklist(prev => prev.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            tasks: cat.tasks.map(task =>
              task.id === taskId ? { ...task, completed: !task.completed } : task
            )
          }
        : cat
    ));
  };

  const getStats = () => {
    const total = checklist.reduce((sum, cat) => sum + cat.tasks.length, 0);
    const completed = checklist.reduce((sum, cat) => sum + cat.tasks.filter(t => t.completed).length, 0);
    return { total, completed, percentage: Math.round((completed / total) * 100) };
  };

  const stats = getStats();

  return (
    <div className="space-y-8">
      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-4">
        <button
          onClick={() => setActiveSection('checklist')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'checklist'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-checklist"
        >
          Launch Checklist
        </button>
        <button
          onClick={() => setActiveSection('admin-mgmt')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'admin-mgmt'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-admin-mgmt"
        >
          <Users className="w-4 h-4 inline mr-2" />
          Admin Management
        </button>
        <button
          onClick={() => setActiveSection('dnr')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'dnr'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-dnr"
        >
          Do Not Rehire
        </button>
        <button
          onClick={() => setActiveSection('health')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'health'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-health"
        >
          <Activity className="w-4 h-4 inline mr-2" />
          System Health
        </button>
        <button
          onClick={() => setActiveSection('contingency')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'contingency'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-contingency"
        >
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          Contingency
        </button>
        <button
          onClick={() => setActiveSection('onboarding')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'onboarding'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-onboarding"
        >
          <Users className="w-4 h-4 inline mr-2" />
          Onboarding
        </button>
        <button
          onClick={() => setActiveSection('messaging')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'messaging'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-messaging"
        >
          <MessageCircle className="w-4 h-4 inline mr-2" />
          Secure Messaging
        </button>
      </div>

      {activeSection === 'admin-mgmt' && <AdminManagement />}

      {activeSection === 'dnr' && <DNRSection />}

      {activeSection === 'health' && <HealthDashboard />}

      {activeSection === 'contingency' && <ContingencyManual />}

      {activeSection === 'onboarding' && <OnboardingTracker />}

      {activeSection === 'messaging' && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <EnhancedAdminMessaging
            currentUserId="admin-test-001"
            currentUserName={adminName}
            currentUserRole="admin"
          />
        </div>
      )}

      {activeSection === 'checklist' && (
      <div className="space-y-8">
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="text-4xl font-bold text-cyan-400 mb-2">0</div>
          <p className="text-gray-400 text-sm">Active Franchises</p>
          <p className="text-xs text-gray-500 mt-2">Ready for first partners</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="text-4xl font-bold text-green-400 mb-2">0</div>
          <p className="text-gray-400 text-sm">Monthly Customers</p>
          <p className="text-xs text-gray-500 mt-2">Subscription subscribers</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="text-4xl font-bold text-yellow-400 mb-2">$0</div>
          <p className="text-gray-400 text-sm">Monthly Revenue</p>
          <p className="text-xs text-gray-500 mt-2">All sources combined</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="text-4xl font-bold text-purple-400 mb-2">{stats.percentage}%</div>
          <p className="text-gray-400 text-sm">Launch Progress</p>
          <p className="text-xs text-gray-500 mt-2">{stats.completed}/{stats.total} tasks</p>
        </div>
      </div>

      {/* Master Admin Info */}
      <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Master Admin Capabilities
        </h2>
        <p className="text-gray-300 mb-4">
          As the system owner, you have full access to:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            Create and manage franchises
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            Manage monthly customers
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            View all system analytics
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            Configure system settings
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            Manage licenses & billing
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            Access all audit logs
          </li>
        </ul>
      </div>

      {/* Admin Checklist */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Admin Checklist</h2>
          <div className="text-right">
            <div className="text-3xl font-bold text-cyan-400">{stats.percentage}%</div>
            <p className="text-xs text-gray-400">{stats.completed}/{stats.total} complete</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 h-full transition-all"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>

        {/* Checklist Items */}
        {checklist.map(category => {
          const categoryCompleted = category.tasks.filter(t => t.completed).length;
          const categoryTotal = category.tasks.length;
          const categoryPercentage = Math.round((categoryCompleted / categoryTotal) * 100);

          return (
            <div key={category.id} className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  {category.category}
                </h3>
                <span className="text-xs text-gray-400">
                  {categoryCompleted}/{categoryTotal}
                </span>
              </div>

              <div className="w-full bg-slate-700 rounded-full h-2 mb-6 overflow-hidden">
                <div
                  className="bg-cyan-500 h-full transition-all"
                  style={{ width: `${categoryPercentage}%` }}
                />
              </div>

              <div className="space-y-2">
                {category.tasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(category.id, task.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                      task.completed
                        ? 'bg-green-900/30 border border-green-700/50'
                        : 'bg-slate-700/50 border border-slate-600 hover:border-cyan-500/50'
                    }`}
                    data-testid={`task-${task.id}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      task.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-500'
                    }`}>
                      {task.completed && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className={`flex-1 text-left text-sm font-medium ${
                      task.completed ? 'text-green-200 line-through' : 'text-gray-200'
                    }`}>
                      {task.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="bg-cyan-600 hover:bg-cyan-700" data-testid="button-create-franchise" onClick={() => alert('Create franchise feature coming soon')}>
            <Building2 className="w-4 h-4 mr-2" />
            Create Franchise
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700" data-testid="button-manage-customers" onClick={() => alert('Manage customers feature coming soon')}>
            <Users className="w-4 h-4 mr-2" />
            Manage Customers
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700" data-testid="button-view-analytics" onClick={() => alert('View analytics feature coming soon')}>
            📊 View Analytics
          </Button>
        </div>
      </div>
    </div>
      )}
    </div>
  );
}

// ==========================================
// FRANCHISE ADMIN DASHBOARD
// ==========================================
function FranchiseAdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Franchise Admin Dashboard
        </h2>
        <p className="text-gray-300 mb-4">
          You have access to your franchise data only. Your workers, clients, assignments, and billing are isolated from other franchises.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-400">0</div>
            <p className="text-sm text-gray-400">Workers</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-400">0</div>
            <p className="text-sm text-gray-400">Clients</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-400">0</div>
            <p className="text-sm text-gray-400">Active Assignments</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-400">$0</div>
            <p className="text-sm text-gray-400">Monthly Revenue</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button className="bg-purple-600 hover:bg-purple-700 py-6" data-testid="button-manage-workers" onClick={() => alert('Manage workers feature coming soon')}>
          <Users className="w-4 h-4 mr-2" />
          Manage Workers
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700 py-6" data-testid="button-manage-clients" onClick={() => alert('Manage clients feature coming soon')}>
          <Building2 className="w-4 h-4 mr-2" />
          Manage Clients
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700 py-6" data-testid="button-franchise-settings" onClick={() => alert('Franchise settings feature coming soon')}>
          ⚙️ Franchise Settings
        </Button>
      </div>

      {/* DNR Management */}
      <DNRManagement />
    </div>
  );
}

// ==========================================
// CUSTOMER ADMIN DASHBOARD (Monthly Subscription)
// ==========================================
function CustomerAdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Customer Admin Dashboard
        </h2>
        <p className="text-gray-300 mb-4">
          You have access to your company data only. Your workers, clients, and assignments are isolated from other customers.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-400">0</div>
            <p className="text-sm text-gray-400">Workers</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-400">0</div>
            <p className="text-sm text-gray-400">Clients</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-400">0</div>
            <p className="text-sm text-gray-400">Active Assignments</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-400">$0</div>
            <p className="text-sm text-gray-400">Monthly Bill</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button className="bg-blue-600 hover:bg-blue-700 py-6" data-testid="button-customer-workers" onClick={() => alert('Manage workers feature coming soon')}>
          <Users className="w-4 h-4 mr-2" />
          Manage Workers
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 py-6" data-testid="button-customer-clients" onClick={() => alert('Manage clients feature coming soon')}>
          <Building2 className="w-4 h-4 mr-2" />
          Manage Clients
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 py-6" data-testid="button-customer-billing" onClick={() => alert('Billing feature coming soon')}>
          💳 Billing & Subscription
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// DNR (DO NOT RETURN) MANAGEMENT
// ==========================================
function DNRManagement() {
  const [dnrList, setDnrList] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newDNR, setNewDNR] = useState({
    reasonCategory: 'no_show',
    description: '',
  });

  const dnrReasons = [
    { value: 'no_show', label: 'No Show / No Call' },
    { value: 'policy_violation', label: 'Policy Violation' },
    { value: 'poor_performance', label: 'Poor Performance' },
    { value: 'misconduct', label: 'Misconduct' },
    { value: 'theft', label: 'Theft' },
    { value: 'attendance', label: 'Attendance Issues' },
    { value: 'other', label: 'Other' },
  ];

  // Mock data for demo
  useEffect(() => {
    setDnrList([
      {
        id: '1',
        workerId: 'w123',
        reasonCategory: 'no_show',
        description: 'Missed 3 consecutive shifts without notice',
        markedAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: '2',
        workerId: 'w456',
        reasonCategory: 'policy_violation',
        description: 'Arrived intoxicated to job site',
        markedAt: new Date().toISOString(),
        isActive: true,
      },
    ]);
  }, []);

  return (
    <div className="bg-red-900/10 border border-red-700/50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          DNR (Do Not Return) List
        </h2>
        <Button
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => setShowForm(!showForm)}
          data-testid="button-add-dnr"
        >
          + Add to DNR
        </Button>
      </div>

      {showForm && (
        <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-red-700">
          <h3 className="text-lg font-bold mb-4">Mark Worker as DNR</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason for DNR
              </label>
              <select
                value={newDNR.reasonCategory}
                onChange={(e) => setNewDNR({ ...newDNR, reasonCategory: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-400"
                data-testid="select-dnr-reason"
              >
                {dnrReasons.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Details
              </label>
              <textarea
                value={newDNR.description}
                onChange={(e) => setNewDNR({ ...newDNR, description: e.target.value })}
                placeholder="Describe the incident or reason for DNR..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-400 resize-none h-24"
                data-testid="textarea-dnr-description"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                className="bg-gray-600 hover:bg-gray-700"
                onClick={() => setShowForm(false)}
                data-testid="button-cancel-dnr"
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                data-testid="button-submit-dnr"
              >
                Mark as DNR
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {dnrList.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No workers on DNR list</p>
        ) : (
          dnrList.map((dnr) => (
            <div
              key={dnr.id}
              className="bg-slate-800/50 rounded-lg p-4 border border-red-700/30 flex items-center justify-between"
              data-testid={`dnr-item-${dnr.id}`}
            >
              <div>
                <p className="font-bold text-red-300">Worker ID: {dnr.workerId}</p>
                <p className="text-sm text-gray-400 capitalize">{dnr.reasonCategory.replace(/_/g, ' ')}</p>
                {dnr.description && (
                  <p className="text-sm text-gray-300 mt-1">{dnr.description}</p>
                )}
              </div>
              <Button
                className="bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-600/50"
                onClick={() => setDnrList(dnrList.filter((d) => d.id !== dnr.id))}
                data-testid={`button-remove-dnr-${dnr.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-gray-500 mt-6 p-3 bg-slate-800 rounded">
        ⚠️ DNR List is used to prevent accidental rehiring of workers who have been fired or terminated. 
        Always check this list before offering new assignments.
      </p>
    </div>
  );
}

// ==========================================
// MASTER ADMIN - DNR SECTION TAB
// ==========================================
function DNRSection() {
  const [dnrList, setDnrList] = useState([
    {
      id: 'dnr-001',
      workerId: 'WRK-2024-00142',
      reasonCategory: 'theft',
      description: 'Stealing company property from job site',
    },
    {
      id: 'dnr-002',
      workerId: 'WRK-2024-00089',
      reasonCategory: 'violence',
      description: 'Altercation with supervisor',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newDNR, setNewDNR] = useState({
    workerId: '',
    reasonCategory: 'misconduct',
    description: '',
  });

  const reasons = [
    { value: 'theft', label: 'Theft' },
    { value: 'violence', label: 'Violence' },
    { value: 'misconduct', label: 'Misconduct' },
    { value: 'quality_issues', label: 'Quality Issues' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'safety_violation', label: 'Safety Violation' },
    { value: 'other', label: 'Other' },
  ];

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-bold mb-4">Add to DNR List</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Worker ID
            </label>
            <input
              type="text"
              value={newDNR.workerId}
              onChange={(e) => setNewDNR({ ...newDNR, workerId: e.target.value })}
              placeholder="WRK-2024-XXXXX"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-400"
              data-testid="input-dnr-worker-id"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 mt-4">
              Reason Category
            </label>
            <select
              value={newDNR.reasonCategory}
              onChange={(e) => setNewDNR({ ...newDNR, reasonCategory: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-400"
              data-testid="select-dnr-reason"
            >
              {reasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 mt-4">
              Details
            </label>
            <textarea
              value={newDNR.description}
              onChange={(e) => setNewDNR({ ...newDNR, description: e.target.value })}
              placeholder="Describe the incident or reason for DNR..."
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-400 resize-none h-24"
              data-testid="textarea-dnr-description"
            />
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button
              className="bg-gray-600 hover:bg-gray-700"
              onClick={() => setShowForm(false)}
              data-testid="button-cancel-dnr"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-submit-dnr"
            >
              Mark as DNR
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Do Not Rehire List</h2>
          <p className="text-gray-400 text-sm">Workers who should not be rehired</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-700"
          data-testid="button-add-dnr"
        >
          + Add to DNR
        </Button>
      </div>

      <div className="space-y-3">
        {dnrList.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No workers on DNR list</p>
        ) : (
          dnrList.map((dnr) => (
            <div
              key={dnr.id}
              className="bg-slate-800/50 rounded-lg p-4 border border-red-700/30 flex items-center justify-between"
              data-testid={`dnr-item-${dnr.id}`}
            >
              <div>
                <p className="font-bold text-red-300">Worker ID: {dnr.workerId}</p>
                <p className="text-sm text-gray-400 capitalize">{dnr.reasonCategory.replace(/_/g, ' ')}</p>
                {dnr.description && (
                  <p className="text-sm text-gray-300 mt-1">{dnr.description}</p>
                )}
              </div>
              <Button
                className="bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-600/50"
                onClick={() => setDnrList(dnrList.filter((d) => d.id !== dnr.id))}
                data-testid={`button-remove-dnr-${dnr.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
