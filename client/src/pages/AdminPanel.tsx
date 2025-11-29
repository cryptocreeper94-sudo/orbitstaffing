import React, { useState, useEffect } from 'react';
import { Lock, LogOut, CheckCircle2, AlertCircle, Shield, Building2, Users, Trash2, AlertTriangle, Eye, Code, Activity, MessageCircle, Camera, ChevronLeft, Search, User, Mail, Phone, FileText, ExternalLink, Cloud, ChevronDown, ChevronUp, BarChart3, Settings, Briefcase, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { HallmarkWatermark, HallmarkBadge } from '@/components/HallmarkWatermark';
import { DigitalEmployeeCard } from '@/components/DigitalEmployeeCard';
import PersonalCardGenerator from '@/components/PersonalCardGenerator';
import { AdminManagement } from './AdminManagement';
import { HealthDashboard } from '@/components/HealthDashboard';
import { ContingencyManual } from '@/components/ContingencyManual';
import { OnboardingTracker } from '@/components/OnboardingTracker';
import EnhancedAdminMessaging from '@/components/EnhancedAdminMessaging';
import WeatherNewsWidget from '@/components/WeatherNewsWidget';
import HourCounter from '@/components/HourCounter';
import UniversalEmployeeRegistry from '@/components/UniversalEmployeeRegistry';
import { AdminWorkerAvailabilityManager } from './AdminWorkerAvailabilityManager';
import { SidonieWelcomeModal } from '@/components/SidonieWelcomeModal';
import { PinChangeModal } from '@/components/PinChangeModal';
import { getValidSession, setSessionWithExpiry, clearSession } from '@/lib/sessionUtils';
import { AssetTracker } from '@/components/AssetTracker';
import { CompanyHallmarkManager } from '@/components/CompanyHallmarkManager';
import { FloatingHelpButton } from '@/components/HelpCenter';
import { AdvancedAnalyticsDashboard } from '@/components/AdvancedAnalyticsDashboard';
import { BulkOperations } from '@/components/BulkOperations';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { ComplianceReports } from '@/components/ComplianceReports';
import { InvoiceCustomization } from '@/components/InvoiceCustomization';
import { WorkforceForecastingAI } from '@/components/WorkforceForecastingAI';
import { MultiCurrencySupport } from '@/components/MultiCurrencySupport';
import { DocumentOCR } from '@/components/DocumentOCR';
import { ClientPortal } from '@/components/ClientPortal';
import { WorkerRatingSystem } from '@/components/WorkerRatingSystem';
import { ShiftMarketplace } from '@/components/ShiftMarketplace';
import { CredentialTracker } from '@/components/CredentialTracker';
import { WorkerPerformanceDashboard } from '@/components/WorkerPerformanceDashboard';
import { BetaTesterDashboard } from '@/components/BetaTesterDashboard';
import { BetaTesterManagement } from '@/components/BetaTesterManagement';
import { ReceiptScanner } from '@/components/ReceiptScanner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const ADMIN_SESSION_KEY = 'admin';
const BETA_SESSION_KEY = 'beta_tester';

type AdminRole = 'master_admin' | 'franchise_admin' | 'customer_admin' | null;

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBetaTester, setIsBetaTester] = useState(false);
  const [betaTesterName, setBetaTesterName] = useState('');
  const [role, setRole] = useState<AdminRole>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [adminName, setAdminName] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const [showDeveloperPin, setShowDeveloperPin] = useState(false);
  const [developerPin, setDeveloperPin] = useState('');
  const [developerError, setDeveloperError] = useState('');
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showPinChangeModal, setShowPinChangeModal] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    // Check for beta tester session first
    const betaSession = getValidSession(BETA_SESSION_KEY);
    if (betaSession?.authenticated && betaSession.isBetaTester) {
      setIsBetaTester(true);
      setBetaTesterName(betaSession.name || 'Beta Tester');
      return;
    }
    
    // Check for valid admin persistent session (30 days)
    const session = getValidSession(ADMIN_SESSION_KEY);
    if (session?.authenticated && session.role) {
      setIsAuthenticated(true);
      setRole(session.role as AdminRole);
      setAdminName(session.name || 'Admin');
      
      // Show automation update for Sidonie if she hasn't seen it yet
      const hasSeenAutomationUpdate = localStorage.getItem('sidonieV1AutomationUpdate') === 'seen';
      if (session.name === 'Sidonie' && !hasSeenAutomationUpdate) {
        setShowWelcomeMessage(true);
      }
      
      return;
    }
    
    // Fallback to old localStorage flags for migration
    const adminAuth = localStorage.getItem('adminAuthenticated');
    const savedRole = localStorage.getItem('adminRole') as AdminRole;
    const savedName = localStorage.getItem('adminName');
    const hasFirstLogin = localStorage.getItem('sidonieFirstLogin') === 'true';
    const hasSeenAutomationUpdate = localStorage.getItem('sidonieV1AutomationUpdate') === 'seen';
    
    if (adminAuth === 'true' && savedRole) {
      setIsAuthenticated(true);
      setRole(savedRole);
      setAdminName(savedName || 'Admin');
      
      // Show welcome message on first login OR if she hasn't seen automation update
      if (savedName === 'Sidonie') {
        if (hasFirstLogin || !hasSeenAutomationUpdate) {
          setShowWelcomeMessage(true);
          localStorage.removeItem('sidonieFirstLogin');
        }
      }
    }
  }, []);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Detect PIN length to route appropriately
    // 3 digits = Beta Tester
    // 4 digits = Master Admin (Sidonie)
    
    if (pin.length === 3) {
      // Beta Tester login
      try {
        const res = await fetch('/api/auth/verify-beta-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin }),
        });

        if (res.ok) {
          const data = await res.json();
          // Set beta tester session (shorter TTL - 7 days)
          setSessionWithExpiry(BETA_SESSION_KEY, { 
            authenticated: true, 
            isBetaTester: true,
            name: data.testerName,
            testerId: data.testerId,
            accessLevel: data.accessLevel
          }, 7); // 7 days for beta testers
          
          setIsBetaTester(true);
          setBetaTesterName(data.testerName);
          setPin('');
        } else {
          setError('Invalid beta tester PIN.');
          setPin('');
        }
      } catch (err) {
        setError('Failed to verify PIN. Please try again.');
        setPin('');
      }
      return;
    }

    if (pin.length < 4) {
      setError('PIN must be 3 digits (beta tester) or 4 digits (admin)');
      return;
    }

    // Admin login (4+ digits)
    try {
      const res = await fetch('/api/auth/verify-admin-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Check if this is a developer login - redirect to developer panel
        if (data.role === 'developer' || data.redirectTo === '/developer') {
          // Set developer session
          setSessionWithExpiry('developer', { 
            authenticated: true, 
            role: 'developer',
            name: 'Developer'
          });
          localStorage.setItem('developerAuthenticated', 'true');
          
          // Redirect to developer panel
          setLocation('/developer');
          return;
        }
        
        // Set 30-day persistent session for admin
        setSessionWithExpiry(ADMIN_SESSION_KEY, { 
          authenticated: true, 
          role: 'master_admin',
          name: data.name || 'Sidonie'
        });
        // Migrate old flags
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminRole', 'master_admin');
        localStorage.setItem('adminName', data.name || 'Sidonie');
        setIsAuthenticated(true);
        setRole('master_admin');
        setAdminName(data.name || 'Sidonie');
        
        // Always show welcome message on successful login
        setShowWelcomeMessage(true);
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

  const handleLogout = async () => {
    // Call server to destroy session
    try {
      await fetch('/api/auth/admin-logout', { method: 'POST' });
    } catch (err) {
      console.error('Server logout failed:', err);
    }
    
    // Clear both old and new session formats
    clearSession(ADMIN_SESSION_KEY);
    clearSession(BETA_SESSION_KEY);
    setIsBetaTester(false);
    setBetaTesterName('');
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminName');
    setIsAuthenticated(false);
    setRole(null);
    setPin('');
    setError('');
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

  // Show Beta Tester Dashboard if logged in as beta tester
  if (isBetaTester) {
    return <BetaTesterDashboard testerName={betaTesterName} onLogout={handleLogout} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute top-6 left-6">
          <button
            onClick={() => setLocation('/')}
            className="text-gray-400 hover:text-white transition-colors p-1"
            data-testid="button-back-arrow"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 max-w-md w-full border border-slate-700">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-cyan-400 mr-3" />
            <h1 className="text-2xl font-bold text-white">ORBIT Access</h1>
          </div>

          <p className="text-gray-400 text-sm mb-6 text-center">
            Enter your access PIN to continue
          </p>

          {!showDeveloperPin ? (
            <>
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Access Code
                  </label>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    placeholder="•••"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:border-cyan-400"
                    autoFocus
                    data-testid="input-admin-pin"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    3 digits = Beta Tester • 4 digits = Admin
                  </p>
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
                  Access ORBIT
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
                Enter your assigned PIN
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
                    className="text-gray-400 hover:text-white transition-colors p-1"
                    data-testid="button-back-arrow"
                    title="Back"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-sm font-bold text-purple-400">Developer Panel</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Please enter 7 digit access code
                  </label>
                  <input
                    type="password"
                    value={developerPin}
                    onChange={(e) => setDeveloperPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    placeholder="•••••••"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-3 sm:p-6">
      {/* Sidonie Welcome Modal */}
      <SidonieWelcomeModal 
        isOpen={showWelcomeMessage} 
        onClose={() => {
          setShowWelcomeMessage(false);
          // Mark automation update as seen
          localStorage.setItem('sidonieV1AutomationUpdate', 'seen');
          
          // Check if Sidonie needs to change her PIN (first time login)
          const hasChangedPin = localStorage.getItem('sidonieChangedPin') === 'true';
          const hasSkippedPinChange = localStorage.getItem('sidonieSkippedPinChange') === 'true';
          
          if (adminName === 'Sidonie' && !hasChangedPin && !hasSkippedPinChange) {
            // Show PIN change modal after welcome modal closes
            setTimeout(() => {
              setShowPinChangeModal(true);
            }, 300);
          }
        }} 
      />
      
      {/* PIN Change Modal (for first-time login) */}
      <PinChangeModal
        isOpen={showPinChangeModal}
        onClose={() => setShowPinChangeModal(false)}
        onSkip={() => setShowPinChangeModal(false)}
        adminName={adminName}
      />
      
      <div className="max-w-6xl mx-auto">
        {/* Header - Mobile Responsive */}
        <div className="mb-8 sm:mb-12">
          <div className="mb-4">
            <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">Admin Dashboard</h1>
            <p className="text-xs sm:text-base text-gray-400 flex items-center gap-2">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              {adminName}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:flex gap-1 sm:gap-2 flex-wrap">
            <Button
              onClick={() => setLocation('/incident-reporting')}
              className="bg-red-600 hover:bg-red-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-h-[40px] px-2 sm:px-4"
              data-testid="button-admin-incident-report"
            >
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Incident Reports</span>
              <span className="sm:hidden">Incidents</span>
            </Button>
            <Button
              onClick={() => setLocation('/workers-comp-admin')}
              className="bg-orange-600 hover:bg-orange-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-h-[40px] px-2 sm:px-4"
              data-testid="button-admin-workers-comp"
            >
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Workers Comp</span>
              <span className="sm:hidden">WC</span>
            </Button>
            <Button
              onClick={() => setLocation('/')}
              className="bg-purple-600 hover:bg-purple-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-h-[40px] px-2 sm:px-4"
              data-testid="button-admin-to-dev"
            >
              <Code className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Developer</span>
              <span className="sm:hidden">Dev</span>
            </Button>
            <Button
              onClick={() => setLocation('/dashboard')}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-h-[40px] px-2 sm:px-4"
              data-testid="button-admin-to-app"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Main App</span>
              <span className="sm:hidden">App</span>
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-h-[40px] px-2 sm:px-4 col-span-2 sm:col-span-1"
              data-testid="button-admin-logout"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              Logout
            </Button>
          </div>
        </div>

        {/* Role-Based Admin Views */}
        {role === 'master_admin' && <MasterAdminDashboard adminName={adminName} />}
        {role === 'franchise_admin' && <FranchiseAdminDashboard />}
        {role === 'customer_admin' && <CustomerAdminDashboard />}
      </div>
    </div>
  );
}

// ==========================================
// MASTER ADMIN DASHBOARD (System Owner)
// ==========================================
function MasterAdminDashboard({ adminName }: { adminName: string }) {
  const [openCategory, setOpenCategory] = useState<string>('overview');
  const [activeFeature, setActiveFeature] = useState<string>('checklist');
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
        <button
          onClick={() => setActiveSection('availability')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'availability'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-availability"
        >
          <Eye className="w-4 h-4 inline mr-2" />
          Worker Availability
        </button>
        <button
          onClick={() => setActiveSection('professional')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'professional'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-professional"
        >
          <Lock className="w-4 h-4 inline mr-2" />
          Professional Division (V2)
        </button>
        <button
          onClick={() => setActiveSection('analytics')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'analytics'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-analytics"
        >
          Advanced Analytics
        </button>
        <button
          onClick={() => setActiveSection('bulk-ops')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'bulk-ops'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-bulk-ops"
        >
          Bulk Operations
        </button>
        <button
          onClick={() => setActiveSection('search')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'search'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-search"
        >
          Advanced Search
        </button>
        <button
          onClick={() => setActiveSection('compliance')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'compliance'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-compliance"
        >
          Compliance Reports
        </button>
        <button
          onClick={() => setActiveSection('invoices')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'invoices'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-invoices"
        >
          Invoice Templates
        </button>
        <button
          onClick={() => setActiveSection('forecasting')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'forecasting'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-forecasting"
        >
          AI Forecasting
        </button>
        <button
          onClick={() => setActiveSection('currency')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'currency'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-currency"
        >
          Multi-Currency
        </button>
        <button
          onClick={() => setActiveSection('ocr')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'ocr'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-ocr"
        >
          Document OCR
        </button>
        <button
          onClick={() => setActiveSection('client-portal')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'client-portal'
              ? 'border-green-500 text-green-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-client-portal"
        >
          Client Portal
        </button>
        <button
          onClick={() => setActiveSection('ratings')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'ratings'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-ratings"
        >
          Worker Ratings
        </button>
        <button
          onClick={() => setActiveSection('shift-marketplace')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'shift-marketplace'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-marketplace"
        >
          Shift Marketplace
        </button>
        <button
          onClick={() => setActiveSection('credentials')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'credentials'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-credentials"
        >
          Credential Tracker
        </button>
        <button
          onClick={() => setActiveSection('worker-performance')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'worker-performance'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-worker-performance"
        >
          Worker Performance
        </button>
        <button
          onClick={() => setActiveSection('beta-testers')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'beta-testers'
              ? 'border-yellow-500 text-yellow-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-beta-testers"
        >
          🧪 Beta Testers
        </button>
        <button
          onClick={() => setActiveSection('user-data-access')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'user-data-access'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-user-data-access"
        >
          <Search className="w-4 h-4 inline mr-2" />
          User Data Access
        </button>
        <button
          onClick={() => setActiveSection('receipts')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeSection === 'receipts'
              ? 'border-green-500 text-green-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          data-testid="button-tab-receipts"
        >
          🧾 Receipt Scanner
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

      {activeSection === 'availability' && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <AdminWorkerAvailabilityManager />
        </div>
      )}

      {activeSection === 'professional' && (
        <div className="bg-slate-800 border border-purple-600/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-purple-300">Professional Staffing Division</h2>
              <p className="text-sm text-purple-300">Coming in Version 2 (Q3 2026)</p>
            </div>
          </div>
          <p className="text-gray-300 mb-6">
            Preview the Professional Staffing Division interface and features planned for Q3 2026. This includes nursing placements, executive recruiting, specialized contracting, and high-margin professional services.
          </p>
          <Button onClick={() => window.location.href = '/professional-staffing'} className="bg-purple-600 hover:bg-purple-700">
            View Professional Division Preview
          </Button>
        </div>
      )}

      {activeSection === 'analytics' && <AdvancedAnalyticsDashboard />}

      {activeSection === 'bulk-ops' && <BulkOperations />}

      {activeSection === 'search' && <AdvancedSearch />}

      {activeSection === 'compliance' && <ComplianceReports />}

      {activeSection === 'invoices' && <InvoiceCustomization />}

      {activeSection === 'forecasting' && <WorkforceForecastingAI />}

      {activeSection === 'currency' && <MultiCurrencySupport />}

      {activeSection === 'ocr' && <DocumentOCR />}

      {activeSection === 'client-portal' && <ClientPortal />}

      {activeSection === 'ratings' && <WorkerRatingSystem />}

      {activeSection === 'shift-marketplace' && <ShiftMarketplace />}

      {activeSection === 'credentials' && <CredentialTracker />}

      {activeSection === 'worker-performance' && <WorkerPerformanceDashboard />}

      {activeSection === 'beta-testers' && <BetaTesterManagement />}

      {activeSection === 'user-data-access' && <UserDataAccessSection />}

      {activeSection === 'receipts' && <ReceiptScanner />}

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
// USER DATA ACCESS SECTION
// ==========================================
function UserDataAccessSection() {
  const [, setLocation] = useLocation();
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(true);
  const [ownerSearchOpen, setOwnerSearchOpen] = useState(false);
  const [quickLinksOpen, setQuickLinksOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [weatherDate, setWeatherDate] = useState(new Date().toISOString().split('T')[0]);
  const [weatherLocation, setWeatherLocation] = useState('37201');

  const mockEmployees = [
    { id: 'EMP-2024-0847', name: 'Jason Mitchell', email: 'jason.mitchell@email.com', phone: '(615) 555-0123', position: 'Forklift Operator', status: 'Active' },
    { id: 'EMP-2024-0512', name: 'Sarah Johnson', email: 'sarah.johnson@email.com', phone: '(615) 555-0456', position: 'Warehouse Associate', status: 'Active' },
    { id: 'EMP-2024-0293', name: 'Michael Chen', email: 'michael.chen@email.com', phone: '(615) 555-0789', position: 'Assembly Tech', status: 'On Leave' },
    { id: 'EMP-2024-0184', name: 'Emily Rodriguez', email: 'emily.rodriguez@email.com', phone: '(615) 555-0321', position: 'Quality Control', status: 'Active' },
  ];

  const mockOwners = [
    { id: 'OWN-001', name: 'TechCorp Distribution', contact: 'Jennifer Adams', email: 'contact@techcorp.com', phone: '(615) 555-7890', employees: 45 },
    { id: 'OWN-002', name: 'Nashville Logistics', contact: 'Robert Martinez', email: 'info@nashlogistics.com', phone: '(615) 555-2345', employees: 28 },
    { id: 'OWN-003', name: 'Metro Warehouse Co', contact: 'Amanda Foster', email: 'ops@metrowarehouse.com', phone: '(615) 555-6789', employees: 62 },
  ];

  const filteredEmployees = mockEmployees.filter(emp =>
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.email.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.id.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const filteredOwners = mockOwners.filter(owner =>
    owner.name.toLowerCase().includes(ownerSearch.toLowerCase()) ||
    owner.contact.toLowerCase().includes(ownerSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Search className="w-5 h-5 text-emerald-400" />
          Employee & Owner Data Access
        </h2>
        <p className="text-gray-300 text-sm">
          Search and access complete profile data for any employee or company owner. Generate reports and view detailed information.
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <button
          onClick={() => setEmployeeSearchOpen(!employeeSearchOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
          data-testid="button-toggle-employee-search"
        >
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-lg">Employee Search</span>
          </div>
          {employeeSearchOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        
        {employeeSearchOpen && (
          <div className="px-6 pb-6 border-t border-slate-700">
            <div className="mt-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  placeholder="Search by name, email, or employee ID..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  data-testid="input-employee-search"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredEmployees.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No employees found matching your search</p>
              ) : (
                filteredEmployees.map(emp => (
                  <div
                    key={emp.id}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-cyan-500/50 transition-all"
                    data-testid={`employee-card-${emp.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{emp.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${emp.status === 'Active' ? 'bg-green-600/20 text-green-400' : 'bg-amber-600/20 text-amber-400'}`}>
                            {emp.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{emp.position}</p>
                        <p className="text-xs text-gray-500">ID: {emp.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-600/50"
                          onClick={() => setLocation('/employee-hub')}
                          data-testid={`button-view-employee-${emp.id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Hub
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Mail className="w-3 h-3" />
                        <span>{emp.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Phone className="w-3 h-3" />
                        <span>{emp.phone}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs bg-slate-600/50 hover:bg-slate-600 border-slate-500"
                        data-testid={`button-generate-report-${emp.id}`}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Generate Report
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs bg-slate-600/50 hover:bg-slate-600 border-slate-500"
                        data-testid={`button-view-timecards-${emp.id}`}
                      >
                        View Timecards
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs bg-slate-600/50 hover:bg-slate-600 border-slate-500"
                        data-testid={`button-view-pay-history-${emp.id}`}
                      >
                        Pay History
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <button
          onClick={() => setOwnerSearchOpen(!ownerSearchOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
          data-testid="button-toggle-owner-search"
        >
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-lg">Company / Owner Search</span>
          </div>
          {ownerSearchOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        
        {ownerSearchOpen && (
          <div className="px-6 pb-6 border-t border-slate-700">
            <div className="mt-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={ownerSearch}
                  onChange={(e) => setOwnerSearch(e.target.value)}
                  placeholder="Search by company name or contact name..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  data-testid="input-owner-search"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredOwners.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No companies found matching your search</p>
              ) : (
                filteredOwners.map(owner => (
                  <div
                    key={owner.id}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-purple-500/50 transition-all"
                    data-testid={`owner-card-${owner.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="font-bold text-white text-lg">{owner.name}</span>
                        <p className="text-sm text-gray-400">Contact: {owner.contact}</p>
                        <p className="text-xs text-gray-500">{owner.employees} employees assigned</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-600/50"
                          onClick={() => setLocation('/owner-hub')}
                          data-testid={`button-view-owner-${owner.id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Hub
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Mail className="w-3 h-3" />
                        <span>{owner.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Phone className="w-3 h-3" />
                        <span>{owner.phone}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs bg-slate-600/50 hover:bg-slate-600 border-slate-500"
                        data-testid={`button-company-report-${owner.id}`}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Company Report
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs bg-slate-600/50 hover:bg-slate-600 border-slate-500"
                        data-testid={`button-employee-roster-${owner.id}`}
                      >
                        Employee Roster
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs bg-slate-600/50 hover:bg-slate-600 border-slate-500"
                        data-testid={`button-billing-history-${owner.id}`}
                      >
                        Billing History
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <button
          onClick={() => setQuickLinksOpen(!quickLinksOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
          data-testid="button-toggle-quick-links"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-lg">Quick Links & Weather Verification</span>
          </div>
          {quickLinksOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        
        {quickLinksOpen && (
          <div className="px-6 pb-6 border-t border-slate-700">
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                className="bg-cyan-600 hover:bg-cyan-700 h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setLocation('/employee-hub')}
                data-testid="button-quick-employee-hub"
              >
                <User className="w-6 h-6" />
                <span>Employee Hub</span>
                <span className="text-xs opacity-75">View any worker's portal</span>
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700 h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setLocation('/owner-hub')}
                data-testid="button-quick-owner-hub"
              >
                <Building2 className="w-6 h-6" />
                <span>Owner Hub</span>
                <span className="text-xs opacity-75">View any company's portal</span>
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700 h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setLocation('/gps-clockin')}
                data-testid="button-quick-gps-verification"
              >
                <Cloud className="w-6 h-6" />
                <span>GPS Check-In</span>
                <span className="text-xs opacity-75">Verify worker locations</span>
              </Button>
            </div>

            <div className="mt-6 bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-sky-400" />
                Weather Verification Tool
              </h4>
              <p className="text-sm text-gray-400 mb-4">
                Check historical weather data for any date/location to verify timecard accuracy.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Date</label>
                  <input
                    type="date"
                    value={weatherDate}
                    onChange={(e) => setWeatherDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                    data-testid="input-weather-date"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={weatherLocation}
                    onChange={(e) => setWeatherLocation(e.target.value.slice(0, 5))}
                    placeholder="37201"
                    maxLength={5}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                    data-testid="input-weather-zip"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    className="w-full bg-sky-600 hover:bg-sky-700"
                    data-testid="button-check-weather"
                  >
                    Check Weather
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
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
      {/* Sidonia Admin Business Card */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4">Admin Profile Card (ORBIT-0002)</h3>
        <PersonalCardGenerator userId="orbit-0002" userName="Sidonia Summers" cardType="admin" />
      </div>

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
