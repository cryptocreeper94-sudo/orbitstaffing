import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, MapPin, Monitor, CheckCircle2 } from 'lucide-react';

interface LoginLog {
  id: number;
  adminName: string;
  adminRole: string;
  loginTime: string;
  ipAddress: string;
  userAgent: string;
  sessionDuration?: number;
  logoutTime?: string;
}

export function AdminLoginHistory() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestLogin, setLatestLogin] = useState<LoginLog | null>(null);

  useEffect(() => {
    fetchLoginHistory();
    fetchLatestSidonieLogin();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLoginHistory();
      fetchLatestSidonieLogin();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchLoginHistory = async () => {
    try {
      const res = await fetch('/api/admin/login-history');
      const data = await res.json();
      setLogs(data.logs || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching login history:', error);
      setLoading(false);
    }
  };

  const fetchLatestSidonieLogin = async () => {
    try {
      const res = await fetch('/api/admin/latest-login/Sidonie');
      const data = await res.json();
      setLatestLogin(data.latestLogin);
    } catch (error) {
      console.error('Error fetching latest login:', error);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6" data-testid="admin-login-history">
      {/* Sidonie's Latest Login Status */}
      <Card className="bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-300 flex items-center gap-2">
            <User className="w-5 h-5" />
            Sidonie's Login Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestLogin ? (
            <div className="space-y-3" data-testid="sidonie-latest-login">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-green-300 font-semibold" data-testid="latest-login-time">
                    Last Login: {formatTime(latestLogin.loginTime)}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(latestLogin.loginTime).toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 space-y-2 text-sm">
                <p className="text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  IP: <span data-testid="latest-login-ip">{latestLogin.ipAddress || 'Unknown'}</span>
                </p>
                <p className="text-slate-300 flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Device: {latestLogin.userAgent?.includes('Mobile') ? 'Mobile' : 'Desktop'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400" data-testid="no-login-history">No login history found</p>
          )}
        </CardContent>
      </Card>

      {/* Full Login History */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Admin Logins (Last 50)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-400" data-testid="loading-login-history">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-slate-400" data-testid="no-login-logs">No login history yet</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto" data-testid="login-history-list">
              {logs.map((log) => (
                <div
                  key={log.id}
                  data-testid={`login-log-${log.id}`}
                  className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 hover:border-cyan-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-cyan-400" />
                        <span className="font-semibold text-cyan-300" data-testid={`admin-name-${log.id}`}>
                          {log.adminName}
                        </span>
                        <span className="text-xs text-slate-500">({log.adminRole})</span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(log.loginTime).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {log.ipAddress || 'Unknown IP'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-green-400">{formatTime(log.loginTime)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
