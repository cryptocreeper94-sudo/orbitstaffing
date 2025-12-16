import React, { useState, useEffect } from 'react';
import { RefreshCw, Link2, Unlink, CheckCircle2, XCircle, Clock, AlertCircle, ExternalLink, FileText, Users, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AccountingConnection {
  id: string;
  tenantId: string;
  provider: string;
  companyName: string | null;
  isActive: boolean;
  connectionStatus: string;
  lastSyncAt: string | null;
  lastError: string | null;
  createdAt: string;
}

interface SyncLog {
  id: string;
  connectionId: string;
  syncType: string;
  direction: string;
  recordCount: number;
  successCount: number;
  failedCount: number;
  status: string;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
}

interface ProviderInfo {
  configured: boolean;
  name: string;
}

const PROVIDER_LOGOS = {
  quickbooks: '/icons/pro/3d_invoice_billing_icon_clean.png',
  xero: '/icons/pro/3d_chart_reports_icon_clean.png',
};

const PROVIDER_COLORS = {
  quickbooks: 'bg-green-500/10 border-green-500/30 text-green-400',
  xero: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
};

export function AccountingIntegrations() {
  const [connections, setConnections] = useState<AccountingConnection[]>([]);
  const [providers, setProviders] = useState<Record<string, ProviderInfo>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [tenantId, setTenantId] = useState<string>('demo-tenant');

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (selectedConnection) {
      fetchSyncLogs(selectedConnection);
    }
  }, [selectedConnection]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/accounting/connections', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
        setProviders(data.providers || {});
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncLogs = async (connectionId: string) => {
    try {
      setLogsLoading(true);
      const response = await fetch(`/api/admin/accounting/sync-logs/${connectionId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSyncLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch sync logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const connectProvider = async (provider: string) => {
    try {
      const response = await fetch(`/api/admin/accounting/connect/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tenantId }),
      });
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to start OAuth flow:', error);
      alert('Failed to connect. Please try again.');
    }
  };

  const disconnectProvider = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this accounting integration?')) return;
    
    try {
      const response = await fetch(`/api/admin/accounting/disconnect/${connectionId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        fetchConnections();
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const triggerSync = async (connectionId: string, syncType: string) => {
    try {
      setSyncing(`${connectionId}-${syncType}`);
      const response = await fetch(`/api/admin/accounting/sync/${connectionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ syncType }),
      });
      const data = await response.json();
      if (data.success) {
        fetchConnections();
        if (selectedConnection === connectionId) {
          fetchSyncLogs(connectionId);
        }
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setSyncing(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400">Success</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-500/10 border-red-500/30 text-red-400">Failed</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-400">In Progress</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-500/10 border-gray-500/30 text-gray-400">Pending</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white" data-testid="text-accounting-title">Accounting Integrations</h2>
          <p className="text-gray-400 mt-1">Connect QuickBooks or Xero to sync invoices, payroll, and worker data</p>
        </div>
        <Button onClick={fetchConnections} variant="outline" size="sm" data-testid="button-refresh-connections">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(providers).map(([providerId, provider]) => {
          const connection = connections.find(c => c.provider === providerId && c.isActive);
          const isConnected = !!connection;

          return (
            <Card key={providerId} className="bg-gray-900/50 border-gray-800" data-testid={`card-provider-${providerId}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gray-800 flex items-center justify-center">
                    <img
                      src={PROVIDER_LOGOS[providerId as keyof typeof PROVIDER_LOGOS]}
                      alt={provider.name}
                      className="h-8 w-8"
                    />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      {provider.name}
                      {isConnected && getStatusIcon(connection.connectionStatus)}
                    </CardTitle>
                    <CardDescription>
                      {isConnected ? (
                        <span className="text-green-400">Connected: {connection.companyName || 'Unknown Company'}</span>
                      ) : provider.configured ? (
                        <span className="text-gray-400">Ready to connect</span>
                      ) : (
                        <span className="text-yellow-400">API credentials not configured</span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {isConnected ? (
                  <>
                    <div className="text-sm text-gray-400">
                      Last synced: {formatDate(connection.lastSyncAt)}
                    </div>
                    {connection.lastError && (
                      <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded">
                        {connection.lastError}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerSync(connection.id, 'invoice')}
                        disabled={syncing === `${connection.id}-invoice`}
                        data-testid={`button-sync-invoices-${providerId}`}
                      >
                        {syncing === `${connection.id}-invoice` ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <FileText className="h-3 w-3 mr-1" />
                        )}
                        Sync Invoices
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerSync(connection.id, 'payroll')}
                        disabled={syncing === `${connection.id}-payroll`}
                        data-testid={`button-sync-payroll-${providerId}`}
                      >
                        {syncing === `${connection.id}-payroll` ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <DollarSign className="h-3 w-3 mr-1" />
                        )}
                        Sync Payroll
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerSync(connection.id, 'worker')}
                        disabled={syncing === `${connection.id}-worker`}
                        data-testid={`button-sync-workers-${providerId}`}
                      >
                        {syncing === `${connection.id}-worker` ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Users className="h-3 w-3 mr-1" />
                        )}
                        Sync Workers
                      </Button>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-800">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedConnection(selectedConnection === connection.id ? null : connection.id)}
                        data-testid={`button-view-logs-${providerId}`}
                      >
                        View Logs
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => disconnectProvider(connection.id)}
                        data-testid={`button-disconnect-${providerId}`}
                      >
                        <Unlink className="h-3 w-3 mr-1" />
                        Disconnect
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => connectProvider(providerId)}
                    disabled={!provider.configured}
                    data-testid={`button-connect-${providerId}`}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    {provider.configured ? `Connect ${provider.name}` : 'Configure API Keys First'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedConnection && (
        <Card className="bg-gray-900/50 border-gray-800" data-testid="card-sync-logs">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center justify-between">
              <span>Sync History</span>
              <Button variant="ghost" size="sm" onClick={() => fetchSyncLogs(selectedConnection)}>
                <RefreshCw className={`h-4 w-4 ${logsLoading ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              </div>
            ) : syncLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No sync history available
              </div>
            ) : (
              <div className="space-y-3">
                {syncLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                    data-testid={`row-sync-log-${log.id}`}
                  >
                    <div className="flex items-center gap-3">
                      {getSyncStatusBadge(log.status)}
                      <div>
                        <div className="text-sm font-medium text-white capitalize">
                          {log.syncType} ({log.direction})
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(log.startedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white">
                        {log.successCount}/{log.recordCount} records
                      </div>
                      {log.failedCount > 0 && (
                        <div className="text-xs text-red-400">
                          {log.failedCount} failed
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Configuration Required</CardTitle>
          <CardDescription>
            To enable accounting integrations, set the following environment variables:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-white flex items-center gap-2">
                QuickBooks Online
                {providers.quickbooks?.configured && <CheckCircle2 className="h-4 w-4 text-green-400" />}
              </h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li className="flex items-center gap-2">
                  <code className="bg-gray-800 px-1 rounded">QUICKBOOKS_CLIENT_ID</code>
                  {providers.quickbooks?.configured && <CheckCircle2 className="h-3 w-3 text-green-400" />}
                </li>
                <li className="flex items-center gap-2">
                  <code className="bg-gray-800 px-1 rounded">QUICKBOOKS_CLIENT_SECRET</code>
                  {providers.quickbooks?.configured && <CheckCircle2 className="h-3 w-3 text-green-400" />}
                </li>
              </ul>
              <a
                href="https://developer.intuit.com/app/developer/qbo/docs/get-started"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 text-sm hover:underline flex items-center gap-1"
              >
                Get QuickBooks API Keys <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white flex items-center gap-2">
                Xero
                {providers.xero?.configured && <CheckCircle2 className="h-4 w-4 text-green-400" />}
              </h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li className="flex items-center gap-2">
                  <code className="bg-gray-800 px-1 rounded">XERO_CLIENT_ID</code>
                  {providers.xero?.configured && <CheckCircle2 className="h-3 w-3 text-green-400" />}
                </li>
                <li className="flex items-center gap-2">
                  <code className="bg-gray-800 px-1 rounded">XERO_CLIENT_SECRET</code>
                  {providers.xero?.configured && <CheckCircle2 className="h-3 w-3 text-green-400" />}
                </li>
              </ul>
              <a
                href="https://developer.xero.com/documentation/getting-started-guide/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 text-sm hover:underline flex items-center gap-1"
              >
                Get Xero API Keys <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AccountingIntegrations;
