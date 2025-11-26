import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Shield,
  Database,
  Users,
  FileText,
  Cloud,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  category: 'accounting' | 'hr' | 'productivity';
  icon: string;
  permissions: string[];
  connected?: boolean;
  status?: 'success' | 'error' | 'pending';
  errorMessage?: string;
}

const PROVIDERS: Provider[] = [
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    category: 'accounting',
    icon: '📊',
    permissions: [
      'Read employee/worker records',
      'Import customer data',
      'Sync invoice information',
      'Access basic company info',
    ],
  },
  {
    id: 'adp',
    name: 'ADP Workforce Now',
    category: 'accounting',
    icon: '💼',
    permissions: [
      'Read employee/worker records',
      'Import payroll data (view only)',
      'Sync time & attendance',
      'Access basic company info',
    ],
  },
  {
    id: 'paychex',
    name: 'Paychex Flex',
    category: 'accounting',
    icon: '💰',
    permissions: [
      'Read employee/worker records',
      'Import payroll data (view only)',
      'Sync time & attendance',
      'Access basic company info',
    ],
  },
  {
    id: 'gusto',
    name: 'Gusto',
    category: 'accounting',
    icon: '🎯',
    permissions: [
      'Read employee/worker records',
      'Import payroll data (view only)',
      'Sync time & attendance',
      'Access basic company info',
    ],
  },
  {
    id: 'rippling',
    name: 'Rippling',
    category: 'accounting',
    icon: '🌊',
    permissions: [
      'Read employee/worker records',
      'Import payroll data (view only)',
      'Sync time & attendance',
      'Access basic company info',
    ],
  },
  {
    id: 'onpay',
    name: 'OnPay',
    category: 'accounting',
    icon: '📈',
    permissions: [
      'Read employee/worker records',
      'Import payroll data (view only)',
      'Sync time & attendance',
      'Access basic company info',
    ],
  },
  {
    id: 'bamboohr',
    name: 'BambooHR',
    category: 'hr',
    icon: '🎋',
    permissions: [
      'Read employee/worker records',
      'Import HR data',
      'Sync employee directory',
      'Access basic company info',
    ],
  },
  {
    id: 'bullhorn',
    name: 'Bullhorn ATS',
    category: 'hr',
    icon: '📋',
    permissions: [
      'Read candidate records',
      'Import placement data',
      'Sync staffing information',
      'Access basic company info',
    ],
  },
  {
    id: 'wurknow',
    name: 'WurkNow',
    category: 'hr',
    icon: '🌿',
    permissions: [
      'Read worker records',
      'Import assignment data',
      'Sync compliance information',
      'Access basic company info',
    ],
  },
  {
    id: 'ukgpro',
    name: 'UKG Pro',
    category: 'hr',
    icon: '👥',
    permissions: [
      'Read employee/worker records',
      'Import payroll data (view only)',
      'Sync time & attendance',
      'Access basic company info',
    ],
  },
  {
    id: 'workday',
    name: 'Workday',
    category: 'hr',
    icon: '🏢',
    permissions: [
      'Read employee/worker records',
      'Import compensation data',
      'Sync organizational structure',
      'Access basic company info',
    ],
  },
  {
    id: 'google',
    name: 'Google Workspace',
    category: 'productivity',
    icon: '🔷',
    permissions: [
      'Read user directory',
      'Import organizational structure',
      'Sync employee emails',
      'Access basic company info',
    ],
  },
  {
    id: 'microsoft',
    name: 'Microsoft 365',
    category: 'productivity',
    icon: '🔶',
    permissions: [
      'Read user directory',
      'Import organizational structure',
      'Sync employee data',
      'Access basic company info',
    ],
  },
  {
    id: 'paylocity',
    name: 'Paylocity',
    category: 'accounting',
    icon: '💵',
    permissions: [
      'Read employee/worker records',
      'Import payroll data (view only)',
      'Sync time & attendance',
      'Access basic company info',
    ],
  },
  {
    id: 'namely',
    name: 'Namely',
    category: 'hr',
    icon: '📊',
    permissions: [
      'Read employee/worker records',
      'Import HR data',
      'Sync employee directory',
      'Access basic company info',
    ],
  },
  {
    id: 'zenefits',
    name: 'Zenefits',
    category: 'hr',
    icon: '✨',
    permissions: [
      'Read employee/worker records',
      'Import benefits data',
      'Sync HR information',
      'Access basic company info',
    ],
  },
];

export default function OAuthConnectionWizard() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<Provider[]>([]);
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMobile = window.innerWidth < 768;
  const progress = (step / 4) * 100;

  const toggleProvider = (providerId: string) => {
    setSelectedProviders((prev) =>
      prev.includes(providerId)
        ? prev.filter((id) => id !== providerId)
        : [...prev, providerId]
    );
  };

  const connectToProvider = async (providerId: string) => {
    setConnecting(true);
    setError(null);

    try {
      const response = await fetch(`/api/oauth/connect/${providerId}?tenantId=demo-tenant`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate OAuth flow');
      }

      const { authUrl } = await response.json();

      if (isMobile) {
        window.location.href = authUrl;
      } else {
        const width = 600;
        const height = 700;
        const left = window.innerWidth / 2 - width / 2;
        const top = window.innerHeight / 2 - height / 2;

        const popup = window.open(
          authUrl,
          'oauth-popup',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        const checkPopup = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkPopup);
            checkConnectionStatus(providerId);
          }
        }, 500);
      }
    } catch (err: any) {
      console.error('OAuth connection error:', err);
      setError(err.message || 'Failed to connect to provider');
      
      const updatedProviders = [...connectedProviders];
      const providerData = PROVIDERS.find((p) => p.id === providerId);
      if (providerData) {
        updatedProviders.push({
          ...providerData,
          status: 'error',
          errorMessage: err.message,
        });
        setConnectedProviders(updatedProviders);
      }
    } finally {
      setConnecting(false);
    }
  };

  const checkConnectionStatus = async (providerId: string) => {
    try {
      const response = await fetch('/api/oauth/status?tenantId=demo-tenant');
      const statuses = await response.json();
      
      const providerStatus = statuses.find((s: any) => s.provider === providerId);
      const providerData = PROVIDERS.find((p) => p.id === providerId);

      if (providerData) {
        const updatedProviders = [...connectedProviders];
        updatedProviders.push({
          ...providerData,
          status: providerStatus?.connected ? 'success' : 'error',
          connected: providerStatus?.connected,
          errorMessage: !providerStatus?.connected ? 'Connection failed or was cancelled' : undefined,
        });
        setConnectedProviders(updatedProviders);
      }
    } catch (err) {
      console.error('Failed to check connection status:', err);
    }
  };

  const moveToNextProvider = () => {
    if (currentProviderIndex < selectedProviders.length - 1) {
      setCurrentProviderIndex(currentProviderIndex + 1);
      setError(null);
    } else {
      setStep(4);
    }
  };

  const skipCurrentProvider = () => {
    const providerId = selectedProviders[currentProviderIndex];
    const providerData = PROVIDERS.find((p) => p.id === providerId);
    
    if (providerData) {
      setConnectedProviders([
        ...connectedProviders,
        { ...providerData, status: 'pending' },
      ]);
    }
    
    moveToNextProvider();
  };

  const accountingProviders = PROVIDERS.filter((p) => p.category === 'accounting');
  const hrProviders = PROVIDERS.filter((p) => p.category === 'hr');
  const productivityProviders = PROVIDERS.filter((p) => p.category === 'productivity');

  const currentProvider = selectedProviders[currentProviderIndex]
    ? PROVIDERS.find((p) => p.id === selectedProviders[currentProviderIndex])
    : null;

  const successfulConnections = connectedProviders.filter((p) => p.status === 'success');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Connect Your Business Systems
          </h1>
          <p className="text-slate-300">
            Step {step} of 4
          </p>
          <Progress value={progress} className="mt-4 h-2" />
        </div>

        {step === 1 && (
          <Card className="bg-slate-900/90 border-slate-700" data-testid="wizard-welcome-screen">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">
                🚀 Connect Your Business Systems
              </CardTitle>
              <CardDescription className="text-slate-300 text-lg">
                ORBIT integrates with your existing software to save you time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start space-x-3 text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                  <span>Auto-import employee/worker data</span>
                </div>
                <div className="flex items-start space-x-3 text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                  <span>Sync payroll information</span>
                </div>
                <div className="flex items-start space-x-3 text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                  <span>Connect accounting systems</span>
                </div>
                <div className="flex items-start space-x-3 text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                  <span>Import customer/client data</span>
                </div>
              </div>

              <Alert className="bg-blue-950/50 border-blue-800">
                <Shield className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-slate-200">
                  All connections are secure and encrypted. Your data stays private.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  size="lg"
                  data-testid="button-get-started"
                >
                  Let's Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setLocation('/dashboard')}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                  size="lg"
                  data-testid="button-skip-for-now"
                >
                  Skip for Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-slate-900/90 border-slate-700" data-testid="wizard-selection-screen">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Which systems do you use?</CardTitle>
              <CardDescription className="text-slate-300">
                Select all that apply. You can add more later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Database className="mr-2 h-5 w-5 text-cyan-400" />
                    📊 ACCOUNTING & PAYROLL
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {accountingProviders.map((provider) => (
                      <div
                        key={provider.id}
                        onClick={() => toggleProvider(provider.id)}
                        className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedProviders.includes(provider.id)
                            ? 'border-cyan-500 bg-cyan-950/30'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                        }`}
                        data-testid={`checkbox-provider-${provider.id}`}
                      >
                        <Checkbox
                          checked={selectedProviders.includes(provider.id)}
                          onCheckedChange={() => toggleProvider(provider.id)}
                        />
                        <span className="text-2xl">{provider.icon}</span>
                        <span className="text-slate-200 font-medium">{provider.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Users className="mr-2 h-5 w-5 text-purple-400" />
                    👥 HR & STAFFING
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {hrProviders.map((provider) => (
                      <div
                        key={provider.id}
                        onClick={() => toggleProvider(provider.id)}
                        className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedProviders.includes(provider.id)
                            ? 'border-purple-500 bg-purple-950/30'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                        }`}
                        data-testid={`checkbox-provider-${provider.id}`}
                      >
                        <Checkbox
                          checked={selectedProviders.includes(provider.id)}
                          onCheckedChange={() => toggleProvider(provider.id)}
                        />
                        <span className="text-2xl">{provider.icon}</span>
                        <span className="text-slate-200 font-medium">{provider.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Cloud className="mr-2 h-5 w-5 text-blue-400" />
                    ☁️ PRODUCTIVITY
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {productivityProviders.map((provider) => (
                      <div
                        key={provider.id}
                        onClick={() => toggleProvider(provider.id)}
                        className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedProviders.includes(provider.id)
                            ? 'border-blue-500 bg-blue-950/30'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                        }`}
                        data-testid={`checkbox-provider-${provider.id}`}
                      >
                        <Checkbox
                          checked={selectedProviders.includes(provider.id)}
                          onCheckedChange={() => toggleProvider(provider.id)}
                        />
                        <span className="text-2xl">{provider.icon}</span>
                        <span className="text-slate-200 font-medium">{provider.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  data-testid="button-back"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (selectedProviders.length > 0) {
                      setStep(3);
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  disabled={selectedProviders.length === 0}
                  data-testid="button-continue"
                >
                  Continue ({selectedProviders.length} selected)
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && currentProvider && (
          <Card className="bg-slate-900/90 border-slate-700" data-testid="wizard-connection-screen">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">
                  Provider {currentProviderIndex + 1} of {selectedProviders.length}
                </span>
                <span className="text-sm text-slate-400">
                  {connectedProviders.filter((p) => p.status === 'success').length} connected
                </span>
              </div>
              <CardTitle className="text-2xl text-white flex items-center">
                <span className="text-3xl mr-3">{currentProvider.icon}</span>
                Connect to {currentProvider.name}
              </CardTitle>
              <CardDescription className="text-slate-300">
                ORBIT needs permission to access your {currentProvider.name} data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3">
                  Permissions Required:
                </h4>
                <div className="space-y-2">
                  {currentProvider.permissions.map((permission, index) => (
                    <div key={index} className="flex items-start space-x-3 text-slate-200">
                      <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                      <span>{permission}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Alert className="bg-blue-950/50 border-blue-800">
                <Shield className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-slate-200">
                  Your data stays private and secure. We only read the information needed for ORBIT.
                </AlertDescription>
              </Alert>

              {error && (
                <Alert className="bg-red-950/50 border-red-800" data-testid="alert-error">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={skipCurrentProvider}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  disabled={connecting}
                  data-testid="button-skip"
                >
                  Skip This One
                </Button>
                <Button
                  onClick={() => connectToProvider(currentProvider.id)}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  disabled={connecting}
                  data-testid={`button-connect-${currentProvider.id}`}
                >
                  {connecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Connect {currentProvider.name}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="bg-slate-900/90 border-slate-700" data-testid="wizard-completion-screen">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">✅ All Set!</CardTitle>
              <CardDescription className="text-slate-300 text-lg">
                You've connected {successfulConnections.length}{' '}
                {successfulConnections.length === 1 ? 'system' : 'systems'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {successfulConnections.length > 0 && (
                <div className="space-y-3">
                  {successfulConnections.map((provider) => (
                    <div
                      key={provider.id}
                      className="flex items-center space-x-3 p-4 bg-green-950/30 border border-green-800 rounded-lg"
                      data-testid={`success-provider-${provider.id}`}
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                      <span className="text-2xl">{provider.icon}</span>
                      <div className="flex-1">
                        <div className="text-slate-200 font-medium">{provider.name}</div>
                        <div className="text-sm text-slate-400">Data syncing...</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {successfulConnections.length > 0 && (
                <Alert className="bg-blue-950/50 border-blue-800">
                  <Database className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-slate-200">
                    ORBIT is now importing your data. This may take a few minutes.
                  </AlertDescription>
                </Alert>
              )}

              {successfulConnections.length === 0 && (
                <Alert className="bg-yellow-950/50 border-yellow-800">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-slate-200">
                    No systems were connected. You can connect them later from Settings.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={() => setLocation('/dashboard')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  size="lg"
                  data-testid="button-go-to-dashboard"
                >
                  Go to Dashboard
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setLocation('/oauth/settings')}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                  data-testid="button-manage-connections"
                >
                  Manage Connections
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
