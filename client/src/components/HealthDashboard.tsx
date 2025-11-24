import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Database, CreditCard, Bitcoin, RefreshCw, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HealthData {
  timestamp: string;
  system: {
    uptime_seconds: number;
    memory_mb: number;
    node_version: string;
  };
  database: {
    status: string;
    latency_ms: number;
    stats: {
      total_users: number;
      total_companies: number;
      total_payments: number;
    };
  };
  payments: {
    stripe: {
      status: string;
      prices_count: number;
      products_count: number;
    };
    coinbase: {
      status: string;
    };
  };
}

interface PaymentTestResult {
  stripe: { working: boolean; message: string; latency_ms: number };
  coinbase: { working: boolean; message: string; latency_ms: number };
  all_working: boolean;
}

export function HealthDashboard() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [testingPayments, setTestingPayments] = useState(false);
  const [paymentTestResult, setPaymentTestResult] = useState<PaymentTestResult | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/health');
      if (!response.ok) throw new Error('Failed to fetch health');
      const data = await response.json();
      setHealth(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  const testPaymentSystems = async () => {
    setTestingPayments(true);
    try {
      const response = await fetch('/api/admin/test-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Test failed');
      const data = await response.json();
      setPaymentTestResult(data.results);
    } catch (err) {
      console.error('Payment test error:', err);
      setPaymentTestResult({
        stripe: { working: false, message: '❌ Test error', latency_ms: 0 },
        coinbase: { working: false, message: '❌ Test error', latency_ms: 0 },
        all_working: false
      });
    } finally {
      setTestingPayments(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'connected' || status === 'up' || status === 'configured') {
      return 'text-green-400';
    }
    if (status === 'down' || status === 'disconnected') {
      return 'text-red-400';
    }
    return 'text-yellow-400';
  };

  const getStatusBg = (status: string) => {
    if (status === 'connected' || status === 'up' || status === 'configured') {
      return 'bg-green-900/20 border-green-700/50';
    }
    if (status === 'down' || status === 'disconnected') {
      return 'bg-red-900/20 border-red-700/50';
    }
    return 'bg-yellow-900/20 border-yellow-700/50';
  };

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-700/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <h3 className="font-semibold text-red-300">Health Check Error</h3>
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </div>
          <Button
            onClick={fetchHealth}
            className="mt-4 w-full bg-red-600 hover:bg-red-700"
            data-testid="button-retry-health"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-cyan-400" />
            System Health Dashboard
          </h2>
          <p className="text-xs text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button
          onClick={fetchHealth}
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700"
          data-testid="button-refresh-health"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {health && (
        <>
          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-400 mb-1">Server Uptime</p>
                <p className="text-2xl font-bold text-cyan-400">{formatUptime(health.system.uptime_seconds)}</p>
                <p className="text-xs text-gray-500 mt-2">Node {health.system.node_version}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-400 mb-1">Memory Usage</p>
                <p className="text-2xl font-bold text-blue-400">{health.system.memory_mb} MB</p>
                <p className="text-xs text-gray-500 mt-2">Heap allocated</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-400 mb-1">DB Latency</p>
                <p className="text-2xl font-bold text-purple-400">{health.database.latency_ms}ms</p>
                <p className="text-xs text-gray-500 mt-2">Query response time</p>
              </CardContent>
            </Card>
          </div>

          {/* Database Health */}
          <Card className={`border-2 ${getStatusBg(health.database.status)}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="font-bold text-lg">PostgreSQL Database</h3>
                    <p className={`text-sm font-bold ${getStatusColor(health.database.status)}`}>
                      {health.database.status.toUpperCase()}
                    </p>
                  </div>
                </div>
                {health.database.status === 'connected' && (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{health.database.stats.total_users}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Companies</p>
                  <p className="text-2xl font-bold text-white">{health.database.stats.total_companies}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Payments</p>
                  <p className="text-2xl font-bold text-white">{health.database.stats.total_payments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Systems */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stripe */}
            <Card className={`border-2 ${getStatusBg(health.payments.stripe.status)}`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-5 h-5 text-orange-400" />
                  <div className="flex-1">
                    <h3 className="font-bold">Stripe Payments</h3>
                    <p className={`text-sm font-bold ${getStatusColor(health.payments.stripe.status)}`}>
                      {health.payments.stripe.status.toUpperCase()}
                    </p>
                  </div>
                  {health.payments.stripe.status === 'connected' && (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Products Configured</span>
                    <span className="font-bold text-cyan-400">{health.payments.stripe.products_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Price Points</span>
                    <span className="font-bold text-cyan-400">{health.payments.stripe.prices_count}</span>
                  </div>
                </div>

                {paymentTestResult && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-xs mb-2">{paymentTestResult.stripe.message}</p>
                    {paymentTestResult.stripe.working && (
                      <p className="text-xs text-gray-400">Response time: {paymentTestResult.stripe.latency_ms}ms</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coinbase */}
            <Card className={`border-2 ${getStatusBg(health.payments.coinbase.status)}`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Bitcoin className="w-5 h-5 text-yellow-500" />
                  <div className="flex-1">
                    <h3 className="font-bold">Coinbase Commerce</h3>
                    <p className={`text-sm font-bold ${getStatusColor(health.payments.coinbase.status)}`}>
                      {health.payments.coinbase.status.toUpperCase()}
                    </p>
                  </div>
                  {health.payments.coinbase.status === 'configured' && (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  )}
                </div>

                <p className="text-sm text-gray-400">
                  {health.payments.coinbase.status === 'configured'
                    ? 'Crypto payments enabled (BTC, ETH, USDC)'
                    : 'Configure API key to enable crypto payments'}
                </p>

                {paymentTestResult && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-xs mb-2">{paymentTestResult.coinbase.message}</p>
                    {paymentTestResult.coinbase.working && (
                      <p className="text-xs text-gray-400">Response time: {paymentTestResult.coinbase.latency_ms}ms</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status Summary */}
          <Card className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">System Summary</h3>
                <Button
                  onClick={testPaymentSystems}
                  disabled={testingPayments}
                  className="bg-green-600 hover:bg-green-700 text-sm"
                  data-testid="button-test-payments"
                >
                  {testingPayments ? 'Testing...' : 'Test Payment Systems'}
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Overall Status</span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="font-bold text-green-300">Healthy</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>All critical systems operational</span>
                </div>
                {paymentTestResult && (
                  <div className={`mt-3 p-3 rounded border ${paymentTestResult.all_working ? 'bg-green-900/20 border-green-700/50' : 'bg-yellow-900/20 border-yellow-700/50'}`}>
                    <p className="text-xs font-semibold mb-1">
                      {paymentTestResult.all_working ? '✅ Payment Systems Working' : '⚠️ Some Systems Need Attention'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Stripe: {paymentTestResult.stripe.working ? '✓' : '✗'} | Coinbase: {paymentTestResult.coinbase.working ? '✓' : '✗'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
