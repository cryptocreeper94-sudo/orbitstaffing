import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  LogOut, 
  TestTube, 
  Layout, 
  Users, 
  DollarSign,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Clock,
  CheckCircle,
  Building2,
  Star,
  Briefcase,
  Award,
  AlertTriangle
} from 'lucide-react';
import { ClientPortal } from './ClientPortal';
import { WorkerRatingSystem } from './WorkerRatingSystem';
import { ShiftMarketplace } from './ShiftMarketplace';
import { CredentialTracker } from './CredentialTracker';
import { WorkerPerformanceDashboard } from './WorkerPerformanceDashboard';
import { AdvancedAnalyticsDashboard } from './AdvancedAnalyticsDashboard';
import { BulkOperations } from './BulkOperations';
import { AdvancedSearch } from './AdvancedSearch';
import { ComplianceReports } from './ComplianceReports';
import { InvoiceCustomization } from './InvoiceCustomization';
import { WorkforceForecastingAI } from './WorkforceForecastingAI';
import { MultiCurrencySupport } from './MultiCurrencySupport';
import { DocumentOCR } from './DocumentOCR';

interface BetaTesterDashboardProps {
  testerName: string;
  onLogout: () => void;
}

type FeatureSection = 
  | 'overview' 
  | 'client-portal' 
  | 'ratings' 
  | 'shift-marketplace' 
  | 'credentials' 
  | 'worker-performance'
  | 'analytics'
  | 'bulk-ops'
  | 'search'
  | 'compliance'
  | 'invoices'
  | 'forecasting'
  | 'currency'
  | 'ocr';

export function BetaTesterDashboard({ testerName, onLogout }: BetaTesterDashboardProps) {
  const [activeSection, setActiveSection] = useState<FeatureSection>('overview');

  const features = [
    { id: 'client-portal', name: 'Client Portal', icon: Building2, description: 'Self-service for clients' },
    { id: 'ratings', name: 'Worker Ratings', icon: Star, description: 'Post-shift reviews' },
    { id: 'shift-marketplace', name: 'Shift Marketplace', icon: Briefcase, description: 'Worker self-scheduling' },
    { id: 'credentials', name: 'Credential Tracker', icon: Shield, description: 'License management' },
    { id: 'worker-performance', name: 'Performance Dashboard', icon: Award, description: 'Worker KPIs' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'Advanced reporting' },
    { id: 'bulk-ops', name: 'Bulk Operations', icon: Users, description: 'Mass actions' },
    { id: 'search', name: 'Advanced Search', icon: FileText, description: 'Smart filtering' },
    { id: 'compliance', name: 'Compliance Reports', icon: CheckCircle, description: 'Regulatory docs' },
    { id: 'invoices', name: 'Invoice Customization', icon: DollarSign, description: 'Billing templates' },
    { id: 'forecasting', name: 'AI Forecasting', icon: Calendar, description: 'Workforce prediction' },
    { id: 'currency', name: 'Multi-Currency', icon: DollarSign, description: 'Global support' },
    { id: 'ocr', name: 'Document OCR', icon: FileText, description: 'Auto-extraction' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sandbox Banner */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-2 px-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <TestTube className="w-5 h-5" />
          <span className="font-bold">SANDBOX MODE</span>
          <span className="text-yellow-200">•</span>
          <span>Testing environment - No production impact</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-slate-800/80 border-b border-slate-700 py-4 px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-900/50 p-2 rounded-lg">
              <TestTube className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Beta Tester Dashboard</h1>
              <p className="text-sm text-gray-400">Welcome, {testerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg px-3 py-1">
              <span className="text-yellow-400 text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Sandbox Access
              </span>
            </div>
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="text-gray-300 border-gray-600"
              data-testid="button-beta-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 border border-cyan-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to ORBIT Beta Testing!</h2>
              <p className="text-gray-300 mb-4">
                You have full sandbox access to test all platform features. Explore the system, 
                check workflows, and help us ensure everything works perfectly before launch.
              </p>
              <div className="flex gap-4">
                <div className="bg-slate-800/50 rounded-lg px-4 py-2">
                  <p className="text-cyan-400 font-bold text-xl">{features.length}</p>
                  <p className="text-gray-400 text-sm">Features to Test</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg px-4 py-2">
                  <p className="text-green-400 font-bold text-xl">Full</p>
                  <p className="text-gray-400 text-sm">Sandbox Access</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg px-4 py-2">
                  <p className="text-yellow-400 font-bold text-xl">Safe</p>
                  <p className="text-gray-400 text-sm">No Production Impact</p>
                </div>
              </div>
            </div>

            {/* Feature Grid */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Layout className="w-5 h-5 text-cyan-400" />
                Available Features to Test
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <button
                      key={feature.id}
                      onClick={() => setActiveSection(feature.id as FeatureSection)}
                      className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-left hover:border-cyan-500 transition-all group"
                      data-testid={`button-test-${feature.id}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-cyan-900/30 p-2 rounded group-hover:bg-cyan-900/50 transition-colors">
                          <Icon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h4 className="font-bold text-white">{feature.name}</h4>
                      </div>
                      <p className="text-sm text-gray-400">{feature.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Testing Guidelines */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Beta Testing Guidelines
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Explore All Features</p>
                      <p className="text-sm text-gray-400">Click through every menu and option</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Test User Workflows</p>
                      <p className="text-sm text-gray-400">Complete common tasks end-to-end</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Check Data Display</p>
                      <p className="text-sm text-gray-400">Verify all info shows correctly</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Test on Mobile</p>
                      <p className="text-sm text-gray-400">Check responsive layouts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Note Any Issues</p>
                      <p className="text-sm text-gray-400">Report bugs or suggestions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Test Edge Cases</p>
                      <p className="text-sm text-gray-400">Try unusual inputs or actions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Sections with Back Button */}
        {activeSection !== 'overview' && (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setActiveSection('overview')}
              className="text-gray-300 border-gray-600"
              data-testid="button-back-to-overview"
            >
              ← Back to Overview
            </Button>
            
            {activeSection === 'client-portal' && <ClientPortal />}
            {activeSection === 'ratings' && <WorkerRatingSystem />}
            {activeSection === 'shift-marketplace' && <ShiftMarketplace />}
            {activeSection === 'credentials' && <CredentialTracker />}
            {activeSection === 'worker-performance' && <WorkerPerformanceDashboard />}
            {activeSection === 'analytics' && <AdvancedAnalyticsDashboard />}
            {activeSection === 'bulk-ops' && <BulkOperations />}
            {activeSection === 'search' && <AdvancedSearch />}
            {activeSection === 'compliance' && <ComplianceReports />}
            {activeSection === 'invoices' && <InvoiceCustomization />}
            {activeSection === 'forecasting' && <WorkforceForecastingAI />}
            {activeSection === 'currency' && <MultiCurrencySupport />}
            {activeSection === 'ocr' && <DocumentOCR />}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-4 px-6 mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            ORBIT Staffing OS • Beta Testing Environment • Powered by Darkwave Studios LLC
          </p>
        </div>
      </footer>
    </div>
  );
}
