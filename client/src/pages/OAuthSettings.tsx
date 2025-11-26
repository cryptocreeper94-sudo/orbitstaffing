import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Plus,
  ArrowLeft,
  Loader2,
  Shield,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConnectionStatus {
  provider: string;
  name: string;
  connected: boolean;
  lastSync?: string;
  status?: string;
  connectedAt?: string;
}

export default function OAuthSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [connections, setConnections] = useState<ConnectionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  useEffect(() => {
    loadConnectionStatus();
    checkForOAuthCallback();
  }, []);

  const checkForOAuthCallback = () => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');
    const provider = params.get('provider');

    if (success && provider) {
      toast({
        title: 'Connection Successful',
        description: `Successfully connected to ${provider}`,
      });
      window.history.replaceState({}, '', '/oauth/settings');
      loadConnectionStatus();
    } else if (error) {
      toast({
        title: 'Connection Failed',
        description: decodeURIComponent(error),
        variant: 'destructive',
      });
      window.history.replaceState({}, '', '/oauth/settings');
    }
  };

  const loadConnectionStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/oauth/status?tenantId=demo-tenant');
      if (response.ok) {
        const data = await response.json();
        setConnections(data);
      }
    } catch (error) {
      console.error('Failed to load connection status:', error);
      toast({
        title: 'Error',
        description: 'Failed to load connection status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: string) => {
    try {
      const response = await fetch(`/api/oauth/connect/${provider}?tenantId=demo-tenant`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate OAuth flow');
      }

      const { authUrl } = await response.json();

      const isMobile = window.innerWidth < 768;

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
            loadConnectionStatus();
          }
        }, 500);
      }
    } catch (error: any) {
      toast({
        title: 'Connection Error',
        description: error.message || 'Failed to connect to provider',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = async (provider: string) => {
    setRefreshing(provider);
    try {
      const response = await fetch(`/api/oauth/refresh/${provider}?tenantId=demo-tenant`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh connection');
      }

      toast({
        title: 'Success',
        description: `Refreshed connection to ${provider}`,
      });

      await loadConnectionStatus();
    } catch (error: any) {
      toast({
        title: 'Refresh Failed',
        description: error.message || 'Failed to refresh connection',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(null);
    }
  };

  const handleDisconnect = async (provider: string, providerName: string) => {
    if (!confirm(`Are you sure you want to disconnect from ${providerName}?`)) {
      return;
    }

    setDisconnecting(provider);
    try {
      const response = await fetch(`/api/oauth/disconnect/${provider}?tenantId=demo-tenant`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect provider');
      }

      toast({
        title: 'Disconnected',
        description: `Successfully disconnected from ${providerName}`,
      });

      await loadConnectionStatus();
    } catch (error: any) {
      toast({
        title: 'Disconnect Failed',
        description: error.message || 'Failed to disconnect provider',
        variant: 'destructive',
      });
    } finally {
      setDisconnecting(null);
    }
  };

  const connectedSystems = connections.filter((c) => c.connected);
  const availableSystems = connections.filter((c) => !c.connected);

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never synced';
    
    const syncDate = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - syncDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button
            onClick={() => setLocation('/dashboard')}
            variant="ghost"
            className="text-slate-300 hover:text-white mb-4"
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Connected Systems
              </h1>
              <p className="text-slate-300">
                Manage your OAuth integrations with external business systems
              </p>
            </div>
            <Button
              onClick={() => setLocation('/oauth/wizard')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              data-testid="button-add-system"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add System
            </Button>
          </div>
        </div>

        {connectedSystems.length === 0 && (
          <Alert className="mb-6 bg-blue-950/50 border-blue-800">
            <Shield className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-slate-200">
              You haven't connected any systems yet. Click "Add System" to get started.
            </AlertDescription>
          </Alert>
        )}

        {connectedSystems.length > 0 && (
          <Card className="mb-8 bg-slate-900/90 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">Connected Systems</CardTitle>
              <CardDescription className="text-slate-300">
                {connectedSystems.length} system{connectedSystems.length > 1 ? 's' : ''} connected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectedSystems.map((connection) => (
                  <div
                    key={connection.provider}
                    className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
                    data-testid={`connected-provider-${connection.provider}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-white">
                              {connection.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className="border-green-600 text-green-400"
                            >
                              Connected
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-400">
                            Last sync: {formatLastSync(connection.lastSync)}
                          </div>
                          {connection.connectedAt && (
                            <div className="text-xs text-slate-500 mt-1">
                              Connected {new Date(connection.connectedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => handleRefresh(connection.provider)}
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 hover:bg-slate-800"
                          disabled={refreshing === connection.provider}
                          data-testid={`button-refresh-${connection.provider}`}
                        >
                          {refreshing === connection.provider ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Refresh
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleDisconnect(connection.provider, connection.name)}
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-400 hover:bg-red-950"
                          disabled={disconnecting === connection.provider}
                          data-testid={`button-disconnect-${connection.provider}`}
                        >
                          {disconnecting === connection.provider ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Disconnect
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {availableSystems.length > 0 && (
          <Card className="bg-slate-900/90 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">Available Systems</CardTitle>
              <CardDescription className="text-slate-300">
                Connect to these systems to import your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableSystems.map((connection) => (
                  <div
                    key={connection.provider}
                    className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
                    data-testid={`available-provider-${connection.provider}`}
                  >
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {connection.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="border-slate-600 text-slate-400"
                      >
                        Not Connected
                      </Badge>
                    </div>
                    
                    <Button
                      onClick={() => handleConnect(connection.provider)}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                      size="sm"
                      data-testid={`button-connect-${connection.provider}`}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
