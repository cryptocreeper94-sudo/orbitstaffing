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
import { BlockchainDashboard } from '@/components/BlockchainDashboard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { CarouselRail, CarouselRailItem } from '@/components/ui/carousel-rail';
import { SectionHeader, PageHeader } from '@/components/ui/section-header';
import { OrbitCard, StatCard, ActionCard } from '@/components/ui/orbit-card';

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

  useEffect(() => {
    const betaSession = getValidSession(BETA_SESSION_KEY);
    if (betaSession?.authenticated && betaSession.isBetaTester) {
      setIsBetaTester(true);
      setBetaTesterName(betaSession.name || 'Beta Tester');
      return;
    }
    
    const session = getValidSession(ADMIN_SESSION_KEY);
    if (session?.authenticated && session.role) {
      setIsAuthenticated(true);
      setRole(session.role as AdminRole);
      setAdminName(session.name || 'Admin');
      
      const hasSeenAutomationUpdate = localStorage.getItem('sidonieV1AutomationUpdate') === 'seen';
      if (session.name === 'Sidonie' && !hasSeenAutomationUpdate) {
        setShowWelcomeMessage(true);
      }
      
      return;
    }
    
    const adminAuth = localStorage.getItem('adminAuthenticated');
    const savedRole = localStorage.getItem('adminRole') as AdminRole;
    const savedName = localStorage.getItem('adminName');
    const hasFirstLogin = localStorage.getItem('sidonieFirstLogin') === 'true';
    const hasSeenAutomationUpdate = localStorage.getItem('sidonieV1AutomationUpdate') === 'seen';
    
    if (adminAuth === 'true' && savedRole) {
      setIsAuthenticated(true);
      setRole(savedRole);
      setAdminName(savedName || 'Admin');
      
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

    if (pin.length === 3) {
      try {
        const res = await fetch('/api/auth/verify-beta-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin }),
        });

        if (res.ok) {
          const data = await res.json();
          setSessionWithExpiry(BETA_SESSION_KEY, { 
            authenticated: true, 
            isBetaTester: true,
            name: data.testerName,
            testerId: data.testerId,
            accessLevel: data.accessLevel
          }, 7);
          
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

    try {
      const res = await fetch('/api/auth/verify-admin-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        const data = await res.json();
        
        if (data.role === 'developer' || data.redirectTo === '/developer') {
          setSessionWithExpiry('developer', { 
            authenticated: true, 
            role: 'developer',
            name: 'Developer'
          });
          localStorage.setItem('developerAuthenticated', 'true');
          setLocation('/developer');
          return;
        }
        
        setSessionWithExpiry(ADMIN_SESSION_KEY, { 
          authenticated: true, 
          role: 'master_admin',
          name: data.name || 'Sidonie'
        });
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminRole', 'master_admin');
        localStorage.setItem('adminName', data.name || 'Sidonie');
        setIsAuthenticated(true);
        setRole('master_admin');
        setAdminName(data.name || 'Sidonie');
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
    try {
      await fetch('/api/auth/admin-logout', { method: 'POST' });
    } catch (err) {
      console.error('Server logout failed:', err);
    }
    
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
        <OrbitCard variant="default" className="max-w-md w-full p-8">
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

              <button
                onClick={() => setShowDeveloperPin(true)}
                className="w-full mt-4 px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600 rounded-lg text-purple-300 font-bold text-sm transition-all"
                data-testid="button-developer-access"
              >
                Developer Access
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
        </OrbitCard>
      </div>
    );
  }

  const quickActions = [
    { title: 'Incidents', icon: <AlertTriangle className="w-4 h-4" />, onClick: () => setLocation('/incident-reporting'), className: 'bg-red-600 hover:bg-red-700' },
    { title: 'Workers Comp', icon: <Shield className="w-4 h-4" />, onClick: () => setLocation('/workers-comp-admin'), className: 'bg-orange-600 hover:bg-orange-700' },
    { title: 'Developer', icon: <Code className="w-4 h-4" />, onClick: () => setLocation('/'), className: 'bg-purple-600 hover:bg-purple-700' },
    { title: 'Main App', icon: <Eye className="w-4 h-4" />, onClick: () => setLocation('/dashboard'), className: 'bg-green-600 hover:bg-green-700' },
    { title: 'Logout', icon: <LogOut className="w-4 h-4" />, onClick: handleLogout, className: 'bg-slate-600 hover:bg-slate-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-6">
      <SidonieWelcomeModal 
        isOpen={showWelcomeMessage} 
        onClose={() => {
          setShowWelcomeMessage(false);
          localStorage.setItem('sidonieV1AutomationUpdate', 'seen');
          
          const hasChangedPin = localStorage.getItem('sidonieChangedPin') === 'true';
          const hasSkippedPinChange = localStorage.getItem('sidonieSkippedPinChange') === 'true';
          
          if (adminName === 'Sidonie' && !hasChangedPin && !hasSkippedPinChange) {
            setTimeout(() => {
              setShowPinChangeModal(true);
            }, 300);
          }
        }} 
      />
      
      <PinChangeModal
        isOpen={showPinChangeModal}
        onClose={() => setShowPinChangeModal(false)}
        onSkip={() => setShowPinChangeModal(false)}
        adminName={adminName}
      />
      
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Admin Dashboard"
          subtitle={adminName}
          breadcrumb={
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-sm">Master Control Panel</span>
            </div>
          }
          actions={
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              data-testid="button-admin-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          }
        />

        <div className="md:hidden mb-6">
          <CarouselRail gap="sm" showArrows={false}>
            {quickActions.map((action, idx) => (
              <CarouselRailItem key={idx}>
                <Button
                  onClick={action.onClick}
                  className={`${action.className} flex items-center gap-2 text-sm min-w-[120px] whitespace-nowrap`}
                  data-testid={`button-quick-${action.title.toLowerCase().replace(' ', '-')}`}
                >
                  {action.icon}
                  {action.title}
                </Button>
              </CarouselRailItem>
            ))}
          </CarouselRail>
        </div>

        <div className="hidden md:flex gap-2 mb-8 flex-wrap">
          {quickActions.slice(0, -1).map((action, idx) => (
            <Button
              key={idx}
              onClick={action.onClick}
              className={`${action.className} flex items-center gap-2 text-sm`}
              data-testid={`button-quick-${action.title.toLowerCase().replace(' ', '-')}`}
            >
              {action.icon}
              {action.title}
            </Button>
          ))}
        </div>

        {role === 'master_admin' && <MasterAdminDashboard adminName={adminName} />}
        {role === 'franchise_admin' && <FranchiseAdminDashboard />}
        {role === 'customer_admin' && <CustomerAdminDashboard />}
      </div>
    </div>
  );
}

function MasterAdminDashboard({ adminName }: { adminName: string }) {
  const [openCategory, setOpenCategory] = useState<string>('overview');
  const [activeFeature, setActiveFeature] = useState<string>('checklist');
  const [checklist, setChecklist] = useState([
    {
      id: 'v1-complete',
      category: 'Version 1 - Core Features',
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
      category: 'Pre-Launch (Sidonie Testing)',
      icon: '📋',
      tasks: [
        { id: 'testing', title: 'End-to-end testing on real devices (Sidonie review)', completed: false },
        { id: 'compliance-check', title: 'State compliance (TN/KY) verification', completed: true },
        { id: 'sandbox-demo', title: 'Sandbox demo system ready for testing', completed: true },
        { id: 'payment-integration', title: 'Stripe payment integration connected', completed: false },
        { id: 'coinbase-integration', title: 'Coinbase Commerce integration connected', completed: false },
        { id: 'plaid-integration', title: 'Plaid integration for direct deposit ACH (dev portal setup)', completed: false },
        { id: 'google-play', title: 'Submit app to Google Play Store', completed: false },
        { id: 'app-store', title: 'Submit app to Apple App Store', completed: false },
      ]
    },
    {
      id: 'first-franchise',
      category: 'First Franchise Launch',
      icon: '🎯',
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
      category: 'Version 2 Planning',
      icon: '🚀',
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

  const menuCategories = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'cyan',
      items: [
        { id: 'checklist', label: 'Launch Checklist', icon: <CheckCircle2 className="w-4 h-4" /> },
      ]
    },
    {
      id: 'people',
      title: 'People Management',
      icon: <Users className="w-5 h-5" />,
      color: 'blue',
      items: [
        { id: 'admin-mgmt', label: 'Admin Management', icon: <Users className="w-4 h-4" /> },
        { id: 'dnr', label: 'Do Not Rehire', icon: <AlertTriangle className="w-4 h-4" /> },
        { id: 'user-data-access', label: 'User Data Access', icon: <Search className="w-4 h-4" /> },
        { id: 'beta-testers', label: 'Beta Testers', icon: <Eye className="w-4 h-4" /> },
        { id: 'onboarding', label: 'Onboarding', icon: <Users className="w-4 h-4" /> },
        { id: 'availability', label: 'Worker Availability', icon: <Eye className="w-4 h-4" /> },
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'green',
      items: [
        { id: 'analytics', label: 'Advanced Analytics', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'compliance', label: 'Compliance Reports', icon: <Shield className="w-4 h-4" /> },
        { id: 'worker-performance', label: 'Worker Performance', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'ratings', label: 'Worker Ratings', icon: <CheckCircle2 className="w-4 h-4" /> },
        { id: 'forecasting', label: 'AI Forecasting', icon: <BarChart3 className="w-4 h-4" /> },
      ]
    },
    {
      id: 'operations',
      title: 'Operations',
      icon: <Settings className="w-5 h-5" />,
      color: 'amber',
      items: [
        { id: 'shift-marketplace', label: 'Shift Marketplace', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'credentials', label: 'Credential Tracker', icon: <Shield className="w-4 h-4" /> },
        { id: 'bulk-ops', label: 'Bulk Operations', icon: <Settings className="w-4 h-4" /> },
        { id: 'search', label: 'Advanced Search', icon: <Search className="w-4 h-4" /> },
        { id: 'invoices', label: 'Invoice Templates', icon: <FileText className="w-4 h-4" /> },
      ]
    },
    {
      id: 'tools',
      title: 'Tools',
      icon: <Settings className="w-5 h-5" />,
      color: 'purple',
      items: [
        { id: 'blockchain', label: 'Blockchain & Version', icon: <Shield className="w-4 h-4" /> },
        { id: 'messaging', label: 'Secure Messaging', icon: <MessageCircle className="w-4 h-4" /> },
        { id: 'ocr', label: 'Document OCR', icon: <FileText className="w-4 h-4" /> },
        { id: 'receipts', label: 'Receipt Scanner', icon: <Receipt className="w-4 h-4" /> },
        { id: 'health', label: 'System Health', icon: <Activity className="w-4 h-4" /> },
        { id: 'contingency', label: 'Contingency Plans', icon: <AlertTriangle className="w-4 h-4" /> },
      ]
    },
    {
      id: 'business',
      title: 'Business',
      icon: <Briefcase className="w-5 h-5" />,
      color: 'emerald',
      items: [
        { id: 'client-portal', label: 'Client Portal', icon: <Building2 className="w-4 h-4" /> },
        { id: 'currency', label: 'Multi-Currency', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'professional', label: 'Professional Division (V2)', icon: <Lock className="w-4 h-4" /> },
      ]
    },
  ];

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'admin-mgmt': return <AdminManagement />;
      case 'dnr': return <DNRSection />;
      case 'health': return <HealthDashboard />;
      case 'contingency': return <ContingencyManual />;
      case 'onboarding': return <OnboardingTracker />;
      case 'messaging': return (
        <BentoTile className="p-6">
          <EnhancedAdminMessaging currentUserId="admin-test-001" currentUserName={adminName} currentUserRole="admin" />
        </BentoTile>
      );
      case 'availability': return (
        <BentoTile className="p-6">
          <AdminWorkerAvailabilityManager />
        </BentoTile>
      );
      case 'professional': return (
        <BentoTile className="p-6 border-purple-600/50">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-purple-300">Professional Staffing Division</h2>
              <p className="text-sm text-purple-300">Coming in Version 2 (Q3 2026)</p>
            </div>
          </div>
          <p className="text-gray-300 mb-6">
            Preview the Professional Staffing Division interface and features planned for Q3 2026.
          </p>
          <Button onClick={() => window.location.href = '/professional-staffing'} className="bg-purple-600 hover:bg-purple-700">
            View Professional Division Preview
          </Button>
        </BentoTile>
      );
      case 'analytics': return <AdvancedAnalyticsDashboard />;
      case 'bulk-ops': return <BulkOperations />;
      case 'search': return <AdvancedSearch />;
      case 'compliance': return <ComplianceReports />;
      case 'invoices': return <InvoiceCustomization />;
      case 'forecasting': return <WorkforceForecastingAI />;
      case 'currency': return <MultiCurrencySupport />;
      case 'ocr': return <DocumentOCR />;
      case 'client-portal': return <ClientPortal />;
      case 'ratings': return <WorkerRatingSystem />;
      case 'shift-marketplace': return <ShiftMarketplace />;
      case 'credentials': return <CredentialTracker />;
      case 'worker-performance': return <WorkerPerformanceDashboard />;
      case 'beta-testers': return <BetaTesterManagement />;
      case 'user-data-access': return <UserDataAccessSection />;
      case 'receipts': return <ReceiptScanner />;
      case 'blockchain': return <BlockchainDashboard />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <BentoTile className="overflow-hidden p-0">
        <Accordion type="single" collapsible value={openCategory} onValueChange={setOpenCategory} className="w-full">
          {menuCategories.map((category) => (
            <AccordionItem key={category.id} value={category.id} className="border-b border-slate-700/50 last:border-b-0">
              <AccordionTrigger 
                className="px-4 py-3 hover:bg-slate-700/50 transition-colors [&[data-state=open]]:bg-slate-700/30"
                data-testid={`accordion-${category.id}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-${category.color}-400`}>{category.icon}</span>
                  <span className="font-bold text-white">{category.title}</span>
                  <span className="text-xs text-gray-500 ml-2">({category.items.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-slate-900/50 px-2 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {category.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveFeature(item.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                        activeFeature === item.id
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white'
                      }`}
                      data-testid={`btn-${item.id}`}
                    >
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </BentoTile>

      {activeFeature !== 'checklist' && renderFeatureContent()}

      {activeFeature === 'checklist' && (
        <div className="space-y-8">
          <BentoGrid cols={4} gap="md">
            <StatCard
              label="Active Franchises"
              value="0"
              icon={<Building2 className="w-6 h-6" />}
            />
            <StatCard
              label="Monthly Customers"
              value="0"
              icon={<Users className="w-6 h-6" />}
            />
            <StatCard
              label="Monthly Revenue"
              value="$0"
              icon={<BarChart3 className="w-6 h-6" />}
            />
            <StatCard
              label="Launch Progress"
              value={`${stats.percentage}%`}
              icon={<CheckCircle2 className="w-6 h-6" />}
              trend={{ value: stats.completed, positive: true }}
            />
          </BentoGrid>

          <BentoTile className="p-6 border-cyan-700/50">
            <SectionHeader
              eyebrow="Master Admin"
              title="System Capabilities"
              subtitle="As the system owner, you have full access to all features"
              size="sm"
            />
            <BentoGrid cols={2} gap="sm" className="mt-4">
              {[
                'Create and manage franchises',
                'Manage monthly customers',
                'View all system analytics',
                'Configure system settings',
                'Manage licenses & billing',
                'Access all audit logs',
              ].map((capability, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  {capability}
                </div>
              ))}
            </BentoGrid>
          </BentoTile>

          <div className="space-y-6">
            <SectionHeader
              title="Admin Checklist"
              subtitle={`${stats.completed}/${stats.total} tasks completed`}
              action={
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">{stats.percentage}%</div>
                </div>
              }
            />

            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>

            {checklist.map(category => {
              const categoryCompleted = category.tasks.filter(t => t.completed).length;
              const categoryTotal = category.tasks.length;
              const categoryPercentage = Math.round((categoryCompleted / categoryTotal) * 100);

              return (
                <BentoTile key={category.id} className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <span className="text-xl">{category.icon}</span>
                      {category.category}
                    </h3>
                    <span className="text-xs text-gray-400 bg-slate-700 px-2 py-1 rounded-full">
                      {categoryCompleted}/{categoryTotal}
                    </span>
                  </div>

                  <div className="w-full bg-slate-700 rounded-full h-1.5 mb-4 overflow-hidden">
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
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                          task.completed
                            ? 'bg-emerald-900/20 border border-emerald-700/30'
                            : 'bg-slate-700/30 border border-slate-600/50 hover:border-cyan-500/50'
                        }`}
                        data-testid={`task-${task.id}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-gray-500'
                        }`}>
                          {task.completed && (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className={`flex-1 text-left text-sm font-medium transition-all ${
                          task.completed ? 'text-emerald-200 line-through opacity-70' : 'text-gray-200'
                        }`}>
                          {task.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </BentoTile>
              );
            })}
          </div>

          <SectionHeader title="Quick Actions" size="sm" />
          <div className="md:hidden">
            <CarouselRail gap="md" showArrows={false}>
              <CarouselRailItem>
                <ActionCard
                  title="Create Franchise"
                  description="Add new partner"
                  icon={<Building2 className="w-5 h-5" />}
                  onClick={() => alert('Create franchise feature coming soon')}
                  className="min-w-[200px]"
                />
              </CarouselRailItem>
              <CarouselRailItem>
                <ActionCard
                  title="Manage Customers"
                  description="View subscribers"
                  icon={<Users className="w-5 h-5" />}
                  onClick={() => alert('Manage customers feature coming soon')}
                  className="min-w-[200px]"
                />
              </CarouselRailItem>
              <CarouselRailItem>
                <ActionCard
                  title="View Analytics"
                  description="System metrics"
                  icon={<BarChart3 className="w-5 h-5" />}
                  onClick={() => alert('View analytics feature coming soon')}
                  className="min-w-[200px]"
                />
              </CarouselRailItem>
            </CarouselRail>
          </div>
          <BentoGrid cols={3} gap="md" className="hidden md:grid">
            <ActionCard
              title="Create Franchise"
              description="Add new partner"
              icon={<Building2 className="w-5 h-5" />}
              onClick={() => alert('Create franchise feature coming soon')}
            />
            <ActionCard
              title="Manage Customers"
              description="View subscribers"
              icon={<Users className="w-5 h-5" />}
              onClick={() => alert('Manage customers feature coming soon')}
            />
            <ActionCard
              title="View Analytics"
              description="System metrics"
              icon={<BarChart3 className="w-5 h-5" />}
              onClick={() => alert('View analytics feature coming soon')}
            />
          </BentoGrid>
        </div>
      )}
    </div>
  );
}

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
      <BentoTile className="p-6 border-emerald-700/30">
        <SectionHeader
          eyebrow="Data Access"
          title="Employee & Owner Search"
          subtitle="Search and access complete profile data for any employee or company owner"
          size="sm"
          className="mb-0"
        />
      </BentoTile>

      <BentoTile className="overflow-hidden p-0">
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
          <div className="px-6 pb-6 border-t border-slate-700/50">
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
                  <OrbitCard
                    key={emp.id}
                    variant="default"
                    className="p-4"
                    data-testid={`employee-card-${emp.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{emp.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${emp.status === 'Active' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-amber-600/20 text-amber-400'}`}>
                            {emp.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{emp.position}</p>
                        <p className="text-xs text-gray-500">ID: {emp.id}</p>
                      </div>
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
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" className="text-xs bg-slate-600/50 hover:bg-slate-600 border-slate-500" data-testid={`button-generate-report-${emp.id}`}>
                        <FileText className="w-3 h-3 mr-1" />
                        Generate Report
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs bg-slate-600/50 hover:bg-slate-600 border-slate-500" data-testid={`button-view-timecards-${emp.id}`}>
                        View Timecards
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs bg-slate-600/50 hover:bg-slate-600 border-slate-500" data-testid={`button-view-pay-history-${emp.id}`}>
                        Pay History
                      </Button>
                    </div>
                  </OrbitCard>
                ))
              )}
            </div>
          </div>
        )}
      </BentoTile>

      <BentoTile className="overflow-hidden p-0">
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
          <div className="px-6 pb-6 border-t border-slate-700/50">
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
                  <OrbitCard
                    key={owner.id}
                    variant="default"
                    className="p-4"
                    data-testid={`owner-card-${owner.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="font-bold text-white text-lg">{owner.name}</span>
                        <p className="text-sm text-gray-400">Contact: {owner.contact}</p>
                        <p className="text-xs text-gray-500">{owner.employees} employees assigned</p>
                      </div>
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
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" className="text-xs bg-slate-600/50 hover:bg-slate-600 border-slate-500" data-testid={`button-company-report-${owner.id}`}>
                        <FileText className="w-3 h-3 mr-1" />
                        Company Report
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs bg-slate-600/50 hover:bg-slate-600 border-slate-500" data-testid={`button-employee-roster-${owner.id}`}>
                        Employee Roster
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs bg-slate-600/50 hover:bg-slate-600 border-slate-500" data-testid={`button-billing-history-${owner.id}`}>
                        Billing History
                      </Button>
                    </div>
                  </OrbitCard>
                ))
              )}
            </div>
          </div>
        )}
      </BentoTile>

      <BentoTile className="overflow-hidden p-0">
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
          <div className="px-6 pb-6 border-t border-slate-700/50">
            <div className="mt-4">
              <BentoGrid cols={3} gap="md">
                <ActionCard
                  title="Employee Hub"
                  description="View any worker's portal"
                  icon={<User className="w-5 h-5" />}
                  onClick={() => setLocation('/employee-hub')}
                />
                <ActionCard
                  title="Owner Hub"
                  description="View any company's portal"
                  icon={<Building2 className="w-5 h-5" />}
                  onClick={() => setLocation('/owner-hub')}
                />
                <ActionCard
                  title="GPS Check-In"
                  description="Verify worker locations"
                  icon={<Cloud className="w-5 h-5" />}
                  onClick={() => setLocation('/gps-clockin')}
                />
              </BentoGrid>
            </div>

            <OrbitCard variant="glass" className="mt-6 p-4">
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
                  <Button className="w-full bg-sky-600 hover:bg-sky-700" data-testid="button-check-weather">
                    Check Weather
                  </Button>
                </div>
              </div>
            </OrbitCard>
          </div>
        )}
      </BentoTile>
    </div>
  );
}

function FranchiseAdminDashboard() {
  return (
    <div className="space-y-8">
      <BentoTile className="p-6 border-purple-700/50">
        <SectionHeader
          eyebrow="Franchise"
          title="Franchise Admin Dashboard"
          subtitle="You have access to your franchise data only. Your workers, clients, assignments, and billing are isolated from other franchises."
          size="md"
          className="mb-6"
        />
        <BentoGrid cols={4} gap="md">
          <StatCard label="Workers" value="0" icon={<Users className="w-5 h-5" />} />
          <StatCard label="Clients" value="0" icon={<Building2 className="w-5 h-5" />} />
          <StatCard label="Active Assignments" value="0" icon={<Briefcase className="w-5 h-5" />} />
          <StatCard label="Monthly Revenue" value="$0" icon={<BarChart3 className="w-5 h-5" />} />
        </BentoGrid>
      </BentoTile>

      <BentoGrid cols={3} gap="md">
        <ActionCard
          title="Manage Workers"
          icon={<Users className="w-5 h-5" />}
          onClick={() => alert('Manage workers feature coming soon')}
        />
        <ActionCard
          title="Manage Clients"
          icon={<Building2 className="w-5 h-5" />}
          onClick={() => alert('Manage clients feature coming soon')}
        />
        <ActionCard
          title="Franchise Settings"
          icon={<Settings className="w-5 h-5" />}
          onClick={() => alert('Franchise settings feature coming soon')}
        />
      </BentoGrid>

      <DNRManagement />
    </div>
  );
}

function CustomerAdminDashboard() {
  return (
    <div className="space-y-8">
      <BentoTile className="p-6 border-blue-700/50">
        <SectionHeader
          eyebrow="Customer"
          title="Customer Admin Dashboard"
          subtitle="You have access to your company data only. Your workers, clients, and assignments are isolated from other customers."
          size="md"
          className="mb-6"
        />
        <BentoGrid cols={4} gap="md">
          <StatCard label="Workers" value="0" icon={<Users className="w-5 h-5" />} />
          <StatCard label="Clients" value="0" icon={<Building2 className="w-5 h-5" />} />
          <StatCard label="Active Assignments" value="0" icon={<Briefcase className="w-5 h-5" />} />
          <StatCard label="Monthly Bill" value="$0" icon={<BarChart3 className="w-5 h-5" />} />
        </BentoGrid>
      </BentoTile>

      <BentoGrid cols={3} gap="md">
        <ActionCard
          title="Manage Workers"
          icon={<Users className="w-5 h-5" />}
          onClick={() => alert('Manage workers feature coming soon')}
        />
        <ActionCard
          title="Manage Clients"
          icon={<Building2 className="w-5 h-5" />}
          onClick={() => alert('Manage clients feature coming soon')}
        />
        <ActionCard
          title="Billing & Subscription"
          icon={<Receipt className="w-5 h-5" />}
          onClick={() => alert('Billing feature coming soon')}
        />
      </BentoGrid>
    </div>
  );
}

function DNRSection() {
  return <DNRManagement />;
}

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

  useEffect(() => {
    setDnrList([
      {
        id: '1',
        workerId: 'w123',
        workerName: 'John Smith',
        reasonCategory: 'no_show',
        description: 'Missed 3 consecutive shifts without notice',
        markedAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: '2',
        workerId: 'w456',
        workerName: 'Jane Doe',
        reasonCategory: 'policy_violation',
        description: 'Arrived intoxicated to job site',
        markedAt: new Date().toISOString(),
        isActive: true,
      },
    ]);
  }, []);

  return (
    <BentoTile className="p-6 border-red-700/30">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader
          title="DNR (Do Not Return) List"
          size="sm"
          className="mb-0"
        />
        <Button
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => setShowForm(!showForm)}
          data-testid="button-add-dnr"
        >
          + Add to DNR
        </Button>
      </div>

      {showForm && (
        <OrbitCard variant="default" className="mb-6 border-red-700/50 p-4">
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
                variant="outline"
                className="border-slate-600"
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
        </OrbitCard>
      )}

      <div className="space-y-3">
        {dnrList.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No workers on DNR list</p>
        ) : (
          dnrList.map((dnr) => (
            <OrbitCard
              key={dnr.id}
              variant="default"
              className="p-4 border-red-700/30"
              data-testid={`dnr-item-${dnr.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{dnr.workerName || `Worker ${dnr.workerId}`}</p>
                    <p className="text-sm text-gray-400">
                      {dnrReasons.find(r => r.value === dnr.reasonCategory)?.label || dnr.reasonCategory}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-600/50 text-red-400 hover:bg-red-600/20"
                  data-testid={`button-remove-dnr-${dnr.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {dnr.description && (
                <p className="mt-3 text-sm text-gray-400 bg-slate-700/30 p-2 rounded">
                  {dnr.description}
                </p>
              )}
            </OrbitCard>
          ))
        )}
      </div>
    </BentoTile>
  );
}
