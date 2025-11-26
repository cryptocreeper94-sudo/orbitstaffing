/**
 * Developer Panel
 * Full technical access to system APIs, configurations, and developer tools
 * Everything non-business-sensitive for developers and tech partners
 */
import React, { useState, useEffect, useRef } from 'react';
import { Code, Lock, LogOut, AlertCircle, CheckCircle2, Key, Database, Zap, Shield, Eye, Copy, BarChart3, MessageCircle, ExternalLink, AlertTriangle, Camera, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { HallmarkWatermark, HallmarkBadge } from '@/components/HallmarkWatermark';
import { DigitalEmployeeCard } from '@/components/DigitalEmployeeCard';
import PersonalCardGenerator from '@/components/PersonalCardGenerator';
import EnhancedAdminMessaging from '@/components/EnhancedAdminMessaging';
import WeatherNewsWidget from '@/components/WeatherNewsWidget';
import { BugReportWidget } from '@/components/BugReportWidget';
import HourCounter from '@/components/HourCounter';
import UniversalEmployeeRegistry from '@/components/UniversalEmployeeRegistry';
import { AdminWorkerAvailabilityManager } from './AdminWorkerAvailabilityManager';
import { getValidSession, setSessionWithExpiry, clearSession, isMobileDevice, shouldBypassMobileLogin } from '@/lib/sessionUtils';
import { AssetTracker } from '@/components/AssetTracker';
import { shouldBypassDeveloperLogin, enableBypassOnThisDevice, disableBypassOnThisDevice, isBypassDeviceEnabled } from '@/lib/deviceFingerprint';

const DEVELOPER_SESSION_KEY = 'developer';

// OAuth Provider Configuration with Setup Links
const OAUTH_PROVIDERS = [
  {
    type: 'quickbooks',
    name: 'QuickBooks',
    setupLink: 'https://developer.intuit.com/app/developer/qbo/docs/get-started',
    fields: ['QUICKBOOKS_CLIENT_ID', 'QUICKBOOKS_CLIENT_SECRET'],
  },
  {
    type: 'adp',
    name: 'ADP',
    setupLink: 'https://developers.adp.com/getting-started',
    fields: ['ADP_CLIENT_ID', 'ADP_CLIENT_SECRET'],
  },
  {
    type: 'paychex',
    name: 'Paychex',
    setupLink: 'https://developer.paychex.com/',
    fields: ['PAYCHEX_CLIENT_ID', 'PAYCHEX_CLIENT_SECRET'],
  },
  {
    type: 'gusto',
    name: 'Gusto',
    setupLink: 'https://dev.gusto.com/docs/api/',
    fields: ['GUSTO_CLIENT_ID', 'GUSTO_CLIENT_SECRET'],
  },
  {
    type: 'rippling',
    name: 'Rippling',
    setupLink: 'https://developer.rippling.com/',
    fields: ['RIPPLING_CLIENT_ID', 'RIPPLING_CLIENT_SECRET'],
  },
  {
    type: 'workday',
    name: 'Workday',
    setupLink: 'https://community.workday.com/dev',
    fields: ['WORKDAY_CLIENT_ID', 'WORKDAY_CLIENT_SECRET'],
  },
  {
    type: 'paylocity',
    name: 'Paylocity',
    setupLink: 'https://www.paylocity.com/api/',
    fields: ['PAYLOCITY_CLIENT_ID', 'PAYLOCITY_CLIENT_SECRET'],
  },
  {
    type: 'onpay',
    name: 'OnPay',
    setupLink: 'https://api.onpay.com/',
    fields: ['ONPAY_CLIENT_ID', 'ONPAY_CLIENT_SECRET'],
  },
  {
    type: 'bullhorn',
    name: 'Bullhorn',
    setupLink: 'https://bullhorn.github.io/rest-api-docs/',
    fields: ['BULLHORN_CLIENT_ID', 'BULLHORN_CLIENT_SECRET'],
  },
  {
    type: 'wurknow',
    name: 'WurkNow',
    setupLink: 'https://www.wurknow.com/api',
    fields: ['WURKNOW_CLIENT_ID', 'WURKNOW_CLIENT_SECRET'],
  },
  {
    type: 'ukgpro',
    name: 'UKG Pro',
    setupLink: 'https://developer.ukg.com/',
    fields: ['UKGPRO_CLIENT_ID', 'UKGPRO_CLIENT_SECRET'],
  },
  {
    type: 'bamboohr',
    name: 'BambooHR',
    setupLink: 'https://documentation.bamboohr.com/docs',
    fields: ['BAMBOOHR_CLIENT_ID', 'BAMBOOHR_CLIENT_SECRET'],
  },
  {
    type: 'google',
    name: 'Google Workspace',
    setupLink: 'https://console.cloud.google.com/apis/credentials',
    fields: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  },
  {
    type: 'microsoft',
    name: 'Microsoft 365',
    setupLink: 'https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade',
    fields: ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET'],
  },
];

// Secrets Manager Component
function SecretsManager() {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [configuredProviders, setConfiguredProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerConnections, setCustomerConnections] = useState<any>({});
  const [showCustomerView, setShowCustomerView] = useState(false);

  // Fetch which providers are already configured
  useEffect(() => {
    loadConfiguredProviders();
    loadCustomerConnections();
  }, []);

  async function loadConfiguredProviders() {
    try {
      const res = await fetch('/api/developer/secrets/status', {
        headers: {
          'x-admin-pin': process.env.ADMIN_PIN || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setConfiguredProviders(data.configured || []);
      }
    } catch (err) {
      console.error('Failed to load secrets status:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomerConnections() {
    try {
      const res = await fetch('/api/developer/customer-oauth-summary', {
        headers: {
          'x-admin-pin': process.env.ADMIN_PIN || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomerConnections(data || {});
      }
    } catch (err) {
      console.error('Failed to load customer connections:', err);
    }
  }

  const currentProvider = OAUTH_PROVIDERS.find(p => p.type === selectedProvider);
  const isConfigured = configuredProviders.includes(selectedProvider);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <Key className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Secrets Manager</h2>
        </div>
        <p className="text-gray-300">
          Securely store OAuth credentials for external integrations. These are saved as encrypted secrets and will be used automatically when customers connect their accounts.
        </p>
      </div>

      {/* Provider Selection */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          Select OAuth Provider
        </h3>

        <select
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-400"
          data-testid="select-oauth-provider"
        >
          <option value="">-- Select a provider --</option>
          {OAUTH_PROVIDERS.map(provider => (
            <option key={provider.type} value={provider.type}>
              {provider.name} {configuredProviders.includes(provider.type) ? '✓ Configured' : ''}
            </option>
          ))}
        </select>

        {/* Provider Status Grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {OAUTH_PROVIDERS.map(provider => (
            <div
              key={provider.type}
              className={`p-3 rounded-lg border ${
                configuredProviders.includes(provider.type)
                  ? 'bg-green-900/20 border-green-700/50'
                  : 'bg-slate-700/50 border-slate-600'
              }`}
            >
              <div className="text-sm font-bold text-gray-300">{provider.name}</div>
              <div className={`text-xs mt-1 ${
                configuredProviders.includes(provider.type) ? 'text-green-400' : 'text-gray-500'
              }`}>
                {configuredProviders.includes(provider.type) ? '✓ Configured' : 'Not configured'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credentials Form */}
      {currentProvider && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              {currentProvider.name} Credentials
            </h3>
            {isConfigured && (
              <div className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">
                ✓ CONFIGURED
              </div>
            )}
          </div>

          {/* Setup Link */}
          <a
            href={currentProvider.setupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            data-testid="link-oauth-setup"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-medium">
              Click here to set up {currentProvider.name} OAuth credentials
            </span>
          </a>

          <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
            <p className="text-sm text-purple-200">
              <strong>Setup Instructions:</strong>
              <br />1. Click the link above to open {currentProvider.name}'s developer portal
              <br />2. Create a new OAuth application called "ORBIT Staffing OS"
              <br />3. Set the redirect URI to: <code className="bg-black/30 px-2 py-1 rounded">https://yourdomain.com/api/oauth/{currentProvider.type}/callback</code>
              <br />4. Copy the Client ID and Client Secret below
            </p>
          </div>

          {/* Action Instructions */}
          <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-lg p-4">
            <h4 className="font-bold text-cyan-300 mb-2">📋 What You Need:</h4>
            <ol className="text-sm text-cyan-100 space-y-1 list-decimal list-inside">
              <li>Go to the developer portal (link above)</li>
              <li>Create an OAuth app called "ORBIT Staffing OS"</li>
              <li>Copy the Client ID and Client Secret</li>
              <li>Come back and add them as secrets in Replit</li>
            </ol>
          </div>

          {/* Manual Instructions */}
          <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
            <h4 className="font-bold text-purple-300 mb-2">🔐 Add Secrets Manually:</h4>
            <p className="text-sm text-purple-100 mb-3">
              Open Replit's Secrets pane (Tools → Secrets) and add these two secrets:
            </p>
            <div className="bg-black/30 rounded p-3 font-mono text-xs text-green-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>{currentProvider.fields[0]}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentProvider.fields[0]);
                    alert('Copied to clipboard!');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 ml-2"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>{currentProvider.fields[1]}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentProvider.fields[1]);
                    alert('Copied to clipboard!');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 ml-2"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Click the copy icon to copy the secret name, then paste your credentials from {currentProvider.name}
            </p>
          </div>

          {/* Refresh Status Button */}
          <Button
            onClick={() => loadConfiguredProviders()}
            className="w-full bg-cyan-600 hover:bg-cyan-700 py-3 font-bold text-lg"
            data-testid="button-refresh-status"
          >
            🔄 Refresh Status
          </Button>

          {isConfigured && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <p className="text-sm text-green-200">
                {currentProvider.name} credentials are configured! OAuth connections will work automatically.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-white mb-2">Security Notes</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Credentials are stored as encrypted secrets in Replit</li>
              <li>• They are never exposed in the frontend or logs</li>
              <li>• Each customer's OAuth connection is separate and tenant-isolated</li>
              <li>• You only need to set these up once per provider</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Customer OAuth Connections Statistics */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            Customer OAuth Statistics
          </h3>
          <Button
            onClick={() => setShowCustomerView(!showCustomerView)}
            variant="outline"
            className="text-sm"
            data-testid="button-toggle-customer-view"
          >
            {showCustomerView ? 'Hide' : 'Show'}
          </Button>
        </div>

        {showCustomerView && (
          <div className="space-y-3">
            {Object.keys(customerConnections.providerCounts || {}).length === 0 ? (
              <p className="text-gray-400 text-sm">No customer OAuth connections yet. Statistics will appear here when customers connect their external systems.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(customerConnections.providerCounts || {}).map(([provider, stats]: [string, any]) => (
                    <div
                      key={provider}
                      className="p-4 rounded-lg border bg-slate-700/50 border-slate-600"
                    >
                      <div className="font-bold text-white text-sm mb-2">
                        {provider.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-300 space-y-1">
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span className="font-bold text-cyan-400">{stats.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Connected:</span>
                          <span className="font-bold text-green-400">{stats.connected}</span>
                        </div>
                        {stats.error > 0 && (
                          <div className="flex justify-between">
                            <span>Errors:</span>
                            <span className="font-bold text-red-400">{stats.error}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-lg p-3">
                  <p className="text-sm text-cyan-100">
                    <strong>Total Connections:</strong> {customerConnections.totalConnections || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    ✓ Aggregate statistics only. No personal or tenant data is exposed.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DeveloperPanel() {
  const [, setLocation] = useLocation();
  const [showBypassOption, setShowBypassOption] = useState(false);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [bypassEnabled, setBypassEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return isBypassDeviceEnabled();
    }
    return false;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      // Check if this device has complete bypass enabled
      if (shouldBypassDeveloperLogin()) {
        return true;
      }
      
      // Check for valid persistent session (30 days)
      const session = getValidSession(DEVELOPER_SESSION_KEY);
      if (session?.authenticated) {
        return true;
      }
      // Fallback to old localStorage flag for migration
      return localStorage.getItem('developerAuthenticated') === 'true';
    }
    return false;
  });
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'apis' | 'examples' | 'messaging' | 'asset-tracker' | 'secrets'>('overview');
  const [copied, setCopied] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'ai', text: string}>>([
    { role: 'ai', text: 'Hey! I\'m your AI assistant. What can I help you with?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId] = useState(() => `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Set 30-day persistent session
      setSessionWithExpiry(DEVELOPER_SESSION_KEY, { authenticated: true });
      localStorage.setItem('developerAuthenticated', 'true'); // Migrate old flag
    }
  }, [isAuthenticated]);

  // Auto-bypass login on mobile if session exists
  useEffect(() => {
    if (shouldBypassMobileLogin(DEVELOPER_SESSION_KEY) && !isAuthenticated) {
      setIsAuthenticated(true);
    }
  }, [isAuthenticated]);

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
        // Set 30-day persistent session
        setSessionWithExpiry(DEVELOPER_SESSION_KEY, { authenticated: true });
        localStorage.setItem('developerAuthenticated', 'true'); // Migrate old flag
        setIsAuthenticated(true);
        setPin('');
        // Show bypass option after successful login
        setShowBypassOption(true);
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
    // Clear both old and new session formats
    clearSession(DEVELOPER_SESSION_KEY);
    localStorage.removeItem('developerAuthenticated');
    setIsAuthenticated(false);
    setLocation('/');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const navigateTo = (path: string) => {
    setLocation(path);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setChatLoading(true);
    
    try {
      const res = await fetch('/api/developer/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: userMessage,
          role: 'user',
          sessionId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'ai', text: data.aiMessage }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I had trouble processing your message. Try again.' }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute top-6 left-6">
          <Button
            onClick={() => setLocation('/')}
            variant="outline"
            className="text-cyan-400 border-cyan-400 hover:bg-cyan-400/10"
            data-testid="button-back-home"
          >
            ← Back
          </Button>
        </div>
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 max-w-md w-full border border-slate-700">
          <div className="flex items-center justify-center mb-6">
            <Code className="w-8 h-8 text-purple-400 mr-3" />
            <h1 className="text-2xl font-bold text-white">Developer Access</h1>
          </div>

          <p className="text-gray-400 text-sm mb-6 text-center">
            Enter your access code to access technical APIs and developer tools
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Please enter 7 digit access code</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                placeholder="•••••••"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:border-purple-400"
                autoFocus
                data-testid="input-developer-pin"
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
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-bold text-lg"
              data-testid="button-developer-login"
            >
              Access Developer Panel
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            For technical team members and API integrations
          </p>

          {/* Bypass Option Modal */}
          {showBypassOption && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl max-w-md w-full border border-purple-500/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-bold text-purple-300">Device Bypass Setup</h2>
                </div>
                
                <p className="text-gray-300 mb-6">
                  Enable complete bypass on this device? You'll go straight to the Developer tab without logging in again.
                </p>
                
                <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-3 mb-6">
                  <p className="text-sm text-purple-200">
                    ✓ You can always disable this in settings
                    <br />✓ Only works on this specific device/browser
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      enableBypassOnThisDevice();
                      setShowBypassOption(false);
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    data-testid="button-enable-bypass"
                  >
                    Enable Bypass
                  </Button>
                  <Button
                    onClick={() => setShowBypassOption(false)}
                    variant="outline"
                    className="flex-1"
                    data-testid="button-skip-bypass"
                  >
                    Skip
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 relative">
      {/* AI Chat Widget */}
      {showChat && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] md:w-96 h-[400px] md:h-[500px] bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500 rounded-xl shadow-2xl flex flex-col z-50 glow-cyan">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-bold">AI Assistant</h3>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="text-cyan-100 hover:text-white text-xl"
              data-testid="button-close-chat"
            >
              ✕
            </button>
          </div>
          
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none'
                    : 'bg-slate-700 text-gray-100 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-gray-100 rounded-lg rounded-bl-none px-3 py-2 text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="border-t border-slate-700 p-3 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-cyan-400"
                data-testid="input-chat-message"
              />
              <button
                onClick={handleSendMessage}
                disabled={chatLoading}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 px-3 py-2 rounded text-white font-bold text-sm transition-opacity"
                data-testid="button-send-message"
              >
                {chatLoading ? '...' : 'Send'}
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">Chat with AI for field support</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setLocation('/')}
              className="text-gray-400 hover:text-white transition-colors p-1"
              data-testid="button-back-arrow"
              title="Back"
            >
              <ArrowRight className="w-5 h-5 transform rotate-180" />
            </button>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-2">
                <Code className="w-8 h-8 text-purple-400" />
                Developer Panel
              </h1>
              <p className="text-gray-400">Technical APIs, integrations, and configuration</p>
            </div>
          </div>

          {/* Navigation Buttons - Beautiful Grid with Hover Effects */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {/* Incidents Button */}
            <button
              onClick={() => navigateTo('/incident-reporting')}
              className="relative h-24 md:h-28 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-red-400 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-dev-incident-report"
            >
              <AlertTriangle className="w-6 h-6 md:w-7 md:h-7 text-red-400 group-hover:text-red-300 transition-colors" />
              <span className="text-xs md:text-sm font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Incidents</span>
            </button>

            {/* Workers Comp Button */}
            <button
              onClick={() => navigateTo('/workers-comp-admin')}
              className="relative h-24 md:h-28 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-orange-400 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-dev-workers-comp"
            >
              <Shield className="w-6 h-6 md:w-7 md:h-7 text-orange-400 group-hover:text-orange-300 transition-colors" />
              <span className="text-xs md:text-sm font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Workers Comp</span>
            </button>

            {/* Admin Button */}
            <button
              onClick={() => navigateTo('/admin')}
              className="relative h-24 md:h-28 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-cyan-400 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-dev-to-admin"
            >
              <Shield className="w-6 h-6 md:w-7 md:h-7 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <span className="text-xs md:text-sm font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Admin</span>
            </button>

            {/* App Button */}
            <button
              onClick={() => navigateTo('/dashboard')}
              className="relative h-24 md:h-28 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-green-400 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-dev-to-app"
            >
              <BarChart3 className="w-6 h-6 md:w-7 md:h-7 text-green-400 group-hover:text-green-300 transition-colors" />
              <span className="text-xs md:text-sm font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">App</span>
            </button>

            {/* Bug Report Button */}
            <button
              onClick={() => setShowBugReport(true)}
              className="relative h-24 md:h-28 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-amber-400 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-report-bug"
            >
              <AlertCircle className="w-6 h-6 md:w-7 md:h-7 text-amber-400 group-hover:text-amber-300 transition-colors" />
              <span className="text-xs md:text-sm font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Report Bug</span>
            </button>

            {/* Device Settings Button */}
            <button
              onClick={() => setShowDeviceSettings(!showDeviceSettings)}
              className="relative h-24 md:h-28 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-purple-400 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-device-settings"
            >
              <Key className="w-6 h-6 md:w-7 md:h-7 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <span className="text-xs md:text-sm font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Settings</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="relative h-24 md:h-28 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-red-400 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-developer-logout"
            >
              <LogOut className="w-6 h-6 md:w-7 md:h-7 text-red-400 group-hover:text-red-300 transition-colors" />
              <span className="text-xs md:text-sm font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Logout</span>
            </button>
          </div>
        </div>

        {/* Device Settings Modal */}
        {showDeviceSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl max-w-md w-full border border-slate-600 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-slate-400" />
                  Device Settings
                </h2>
                <button
                  onClick={() => setShowDeviceSettings(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                  data-testid="button-close-settings"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">Complete Bypass</h3>
                      <p className="text-sm text-gray-400">Go straight to Developer tab (no login)</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                      bypassEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {bypassEnabled ? 'ACTIVE' : 'OFF'}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mb-3">
                    ✓ This device only
                    <br />✓ Can be disabled anytime
                  </p>

                  {bypassEnabled ? (
                    <Button
                      onClick={() => {
                        disableBypassOnThisDevice();
                        setBypassEnabled(false);
                      }}
                      className="w-full bg-red-600 hover:bg-red-700"
                      data-testid="button-disable-bypass"
                    >
                      Disable Bypass
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        enableBypassOnThisDevice();
                        setBypassEnabled(true);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                      data-testid="button-enable-bypass-settings"
                    >
                      Enable Bypass
                    </Button>
                  )}
                </div>

                <Button
                  onClick={() => setShowDeviceSettings(false)}
                  variant="outline"
                  className="w-full"
                  data-testid="button-close-device-settings"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700 flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-bold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            data-testid="button-tab-dev-overview"
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('apis')}
            className={`px-4 py-3 font-bold border-b-2 transition-all ${
              activeTab === 'apis'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            data-testid="button-tab-dev-apis"
          >
            API Endpoints
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={`px-4 py-3 font-bold border-b-2 transition-all ${
              activeTab === 'examples'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            data-testid="button-tab-dev-examples"
          >
            Examples & Assets
          </button>
          <button
            onClick={() => setActiveTab('messaging')}
            className={`px-4 py-3 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'messaging'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            data-testid="button-tab-dev-messaging"
          >
            <MessageCircle className="w-4 h-4" />
            Secure Messaging
          </button>
          <button
            onClick={() => setActiveTab('secrets')}
            className={`px-4 py-3 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'secrets'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            data-testid="button-tab-dev-secrets"
          >
            <Key className="w-4 h-4" />
            Secrets Manager
          </button>
          <div className="ml-auto flex items-center">
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded transition-all text-sm flex items-center gap-2"
              data-testid="button-tab-ask-ai"
            >
              <MessageCircle className="w-4 h-4" />
              Ask AI
            </button>
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <WeatherNewsWidget userRole="dev" zipCode="37201" />
              </div>
              <div className="lg:col-span-2">
                <HourCounter userRole="dev" />
              </div>
            </div>

            {/* Universal Employee Registry */}
            <div className="mt-8">
              <UniversalEmployeeRegistry userRole="dev" />
            </div>
          </div>
        )}

        {/* OVERVIEW TAB - OLD CONTENT */}
        {activeTab === 'overview' && (
          <div className="space-y-6 hidden">
            {/* Quick Links Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Replit IDE Link */}
              <a 
                href="https://replit.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-purple-600 to-purple-800 border border-purple-500 rounded-lg p-6 hover:border-purple-400 transition-all flex items-start gap-4"
                data-testid="link-replit-ide"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Replit IDE
                  </h3>
                  <p className="text-purple-100 text-sm">Open the development environment</p>
                </div>
                <ExternalLink className="w-5 h-5 text-purple-200 flex-shrink-0 mt-1" />
              </a>

              {/* AI Agent Link */}
              <a 
                href="javascript:void(0)" 
                onClick={() => {
                  alert('AI Agent: Right-click on any page → "Ask AI" to open the chat interface. Or press the purple "Ask AI" button on the screen.');
                }}
                className="bg-gradient-to-br from-cyan-600 to-cyan-800 border border-cyan-500 rounded-lg p-6 hover:border-cyan-400 transition-all flex items-start gap-4 cursor-pointer"
                data-testid="link-ai-agent"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    AI Assistant
                  </h3>
                  <p className="text-cyan-100 text-sm">Chat for field support & debugging</p>
                </div>
                <ExternalLink className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-1" />
              </a>

              {/* App Link */}
              <a 
                href="/" 
                className="bg-gradient-to-br from-green-600 to-green-800 border border-green-500 rounded-lg p-6 hover:border-green-400 transition-all flex items-start gap-4"
                data-testid="link-main-app"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Main App
                  </h3>
                  <p className="text-green-100 text-sm">View the staffing platform</p>
                </div>
                <ExternalLink className="w-5 h-5 text-green-200 flex-shrink-0 mt-1" />
              </a>
            </div>

            {/* Developer Access Info */}
            <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Developer Access
              </h2>
              <p className="text-gray-300 mb-4">
                This panel provides full access to technical APIs, integrations, and configuration. All endpoints are documented with examples and authentication details.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Full REST API documentation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  WebSocket endpoints for real-time
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Database schema reference
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Authentication & rate limiting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Code examples (Node, Python, cURL)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Webhook configurations
                </li>
              </ul>
            </div>

            {/* Core Systems */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Workers API */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Workers System
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ CRUD operations for workers</li>
                  <li>✓ Skills & availability management</li>
                  <li>✓ Background check tracking</li>
                  <li>✓ I-9 verification status</li>
                  <li>✓ Digital Hallmark generation</li>
                  <li>✓ Avatar/photo uploads</li>
                </ul>
              </div>

              {/* Collections & Payments */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-green-400" />
                  Collections & Payments
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ Payment method management</li>
                  <li>✓ Dunning sequence automation</li>
                  <li>✓ Collection status tracking</li>
                  <li>✓ Service suspension/restoration</li>
                  <li>✓ Overdue amount calculations</li>
                  <li>✓ Payment arrangement tracking</li>
                </ul>
              </div>

              {/* Database Access */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  Database
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ PostgreSQL via Neon</li>
                  <li>✓ Drizzle ORM integration</li>
                  <li>✓ Real-time backups enabled</li>
                  <li>✓ Full transaction support</li>
                  <li>✓ Schema versioning</li>
                  <li>✓ Query optimization tools</li>
                </ul>
              </div>

              {/* Security & Auth */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-400" />
                  Security
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ Session-based auth</li>
                  <li>✓ Role-based access control</li>
                  <li>✓ PIN-based admin login</li>
                  <li>✓ Data isolation per tenant</li>
                  <li>✓ Encryption for sensitive data</li>
                  <li>✓ Audit trail logging</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* APIs TAB */}
        {activeTab === 'apis' && (
          <div className="space-y-6">
            {/* Payment Methods APIs */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Payment Methods API</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-green-400">POST</div>
                  <div className="text-gray-300">/api/companies/:companyId/payment-methods</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-blue-400">GET</div>
                  <div className="text-gray-300">/api/companies/:companyId/payment-methods</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-orange-400">PATCH</div>
                  <div className="text-gray-300">/api/payment-methods/:methodId/set-primary</div>
                </div>
              </div>
            </div>

            {/* Collections APIs */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Collections & Dunning API</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-green-400">POST</div>
                  <div className="text-gray-300">/api/companies/:companyId/collections</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-blue-400">GET</div>
                  <div className="text-gray-300">/api/companies/:companyId/collections</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-blue-400">GET</div>
                  <div className="text-gray-300">/api/companies/:companyId/overdue-amount</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-orange-400">PATCH</div>
                  <div className="text-gray-300">/api/collections/:collectionId</div>
                </div>
              </div>
            </div>

            {/* Service Suspension APIs */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Service Management API</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-red-400">POST</div>
                  <div className="text-gray-300">/api/companies/:companyId/suspend-services</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-green-400">POST</div>
                  <div className="text-gray-300">/api/companies/:companyId/unsuspend-services</div>
                </div>
              </div>
            </div>

            {/* Example Request */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Example Request</h3>
              <div className="bg-slate-900 rounded p-4 font-mono text-xs text-gray-300 overflow-x-auto mb-4">
{`curl -X POST http://localhost:5000/api/companies/comp-123/collections \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 5000,
    "dueDate": "2025-12-01",
    "status": "overdue",
    "severity": "warning"
  }'`}
              </div>
              <Button
                onClick={() => copyToClipboard('curl example', 'api-example')}
                className="bg-purple-600 hover:bg-purple-700 text-xs"
              >
                {copied === 'api-example' ? '✓ Copied' : 'Copy Example'}
              </Button>
            </div>
          </div>
        )}

        {/* EXAMPLES TAB */}
        {activeTab === 'examples' && (
          <div className="space-y-8">
            {/* Digital Employee Card Example */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                Digital Employee Card with Hallmark
              </h3>
              <div className="flex justify-center mb-6">
                <DigitalEmployeeCard
                  workerId="WRK-2024-45892"
                  employeeNumber="EMP-0892"
                  fullName="John Michael Rodriguez"
                  company="Superior Staffing"
                  status="active"
                  role="Electrician & HVAC"
                  skills={['Electrician', 'HVAC', 'General Labor']}
                  joinDate="Mar 15, 2024"
                  phone="+1 (615) 555-0892"
                  email="john@superior-staffing.com"
                  verificationCode="ORBIT-XK9M2Q7W8P"
                  avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=john"
                />
              </div>
              <p className="text-sm text-gray-400 text-center">Click to flip the card and see back side with verification code</p>
            </div>

            {/* Hallmark Examples */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Hallmark Watermark Sizes & Usage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Small */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <div className="flex justify-center mb-4">
                    <HallmarkWatermark size="small" opacity={50} />
                  </div>
                  <p className="font-bold text-cyan-300 text-center mb-2">Small</p>
                  <p className="text-xs text-gray-400 text-center">Emails, badges, inline notifications</p>
                </div>

                {/* Medium */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <div className="flex justify-center mb-4">
                    <HallmarkWatermark size="medium" opacity={50} />
                  </div>
                  <p className="font-bold text-cyan-300 text-center mb-2">Medium</p>
                  <p className="text-xs text-gray-400 text-center">Credentials, certificates, cards</p>
                </div>

                {/* Large */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <div className="flex justify-center mb-4">
                    <HallmarkWatermark size="large" opacity={50} />
                  </div>
                  <p className="font-bold text-cyan-300 text-center mb-2">Large</p>
                  <p className="text-xs text-gray-400 text-center">Document watermarks, backgrounds</p>
                </div>
              </div>
            </div>

            {/* Developer Business Card */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 col-span-full">
              <h3 className="font-bold text-lg mb-4">Developer Profile Card (ORBIT-0001)</h3>
              <PersonalCardGenerator userId="orbit-0001" userName="Jason Andrews" cardType="dev" />
            </div>

            {/* Assets Available */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Available Assets & Deliverables</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">Digital Employee Card</p>
                    <p className="text-xs text-gray-500">Worker ID with photo, employee number, skills, status</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">Hallmark Watermark</p>
                    <p className="text-xs text-gray-500">3 sizes: small, medium, large with adjustable opacity</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">QR Code Integration</p>
                    <p className="text-xs text-gray-500">Every credential links to live verification database</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">Invoice Watermarking</p>
                    <p className="text-xs text-gray-500">Automatic Hallmark stamping on all official documents</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">Email Headers</p>
                    <p className="text-xs text-gray-500">Hallmark badge in system communications</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">White-Label Assets</p>
                    <p className="text-xs text-gray-500">Customizable for franchise partners</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGING TAB */}
        {activeTab === 'messaging' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <EnhancedAdminMessaging
              currentUserId="dev-master-001"
              currentUserName="Dev Master"
              currentUserRole="dev"
            />
          </div>
        )}

        {/* SECRETS MANAGER TAB */}
        {activeTab === 'secrets' && <SecretsManager />}
      </div>

      {/* Bug Report Widget */}
      <BugReportWidget 
        isOpen={showBugReport}
        onClose={() => setShowBugReport(false)}
        userEmail="developer@orbitstaffing.net"
        userName="Developer"
      />
    </div>
  );
}
