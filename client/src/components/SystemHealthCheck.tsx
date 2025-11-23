/**
 * System Health Check Widget
 * Shows real-time system status with error reporting
 */
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Activity, Server, Database, Zap } from 'lucide-react';

interface HealthStatus {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

interface SystemHealth {
  api: HealthStatus;
  database: HealthStatus;
  services: HealthStatus;
  overall: 'healthy' | 'warning' | 'error';
  errors: string[];
}

export function SystemHealthCheck() {
  const [health, setHealth] = useState<SystemHealth>({
    api: { status: 'healthy', message: 'API responding normally', timestamp: new Date().toLocaleTimeString() },
    database: { status: 'healthy', message: 'Database connected', timestamp: new Date().toLocaleTimeString() },
    services: { status: 'healthy', message: 'All services operational', timestamp: new Date().toLocaleTimeString() },
    overall: 'healthy',
    errors: []
  });

  useEffect(() => {
    // Simulate health check
    const checkHealth = async () => {
      try {
        // In production, this would call your actual health endpoint
        const timestamp = new Date().toLocaleTimeString();
        setHealth({
          api: { status: 'healthy', message: 'API responding normally', timestamp },
          database: { status: 'healthy', message: 'Database connected', timestamp },
          services: { status: 'healthy', message: 'All services operational', timestamp },
          overall: 'healthy',
          errors: []
        });
      } catch (error) {
        setHealth(prev => ({
          ...prev,
          overall: 'error',
          errors: ['Connection failed - unable to reach system']
        }));
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-900/20 border-green-700';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-700';
      case 'error':
        return 'bg-red-900/20 border-red-700';
      default:
        return 'bg-slate-800/50 border-slate-700';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-300';
      case 'warning':
        return 'text-yellow-300';
      case 'error':
        return 'text-red-300';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className={`border rounded-lg p-6 ${getStatusColor(health.overall)}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health
          </h2>
          <div className="flex items-center gap-2">
            {getStatusIcon(health.overall)}
            <span className={`text-sm font-bold ${getStatusTextColor(health.overall)}`}>
              {health.overall === 'healthy' && 'All Systems Operational'}
              {health.overall === 'warning' && 'Minor Issues Detected'}
              {health.overall === 'error' && 'Critical Issues'}
            </span>
          </div>
        </div>

        {/* Individual Services */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* API Status */}
          <div className="bg-slate-800/50 border border-slate-700 rounded p-4">
            <div className="flex items-start gap-3 mb-2">
              {getStatusIcon(health.api.status)}
              <div className="flex-1">
                <p className="font-bold text-gray-300">API</p>
                <p className="text-xs text-gray-400 mt-1">{health.api.message}</p>
                <p className="text-xs text-gray-500 mt-1">{health.api.timestamp}</p>
              </div>
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-slate-800/50 border border-slate-700 rounded p-4">
            <div className="flex items-start gap-3 mb-2">
              {getStatusIcon(health.database.status)}
              <div className="flex-1">
                <p className="font-bold text-gray-300">Database</p>
                <p className="text-xs text-gray-400 mt-1">{health.database.message}</p>
                <p className="text-xs text-gray-500 mt-1">{health.database.timestamp}</p>
              </div>
            </div>
          </div>

          {/* Services Status */}
          <div className="bg-slate-800/50 border border-slate-700 rounded p-4">
            <div className="flex items-start gap-3 mb-2">
              {getStatusIcon(health.services.status)}
              <div className="flex-1">
                <p className="font-bold text-gray-300">Services</p>
                <p className="text-xs text-gray-400 mt-1">{health.services.message}</p>
                <p className="text-xs text-gray-500 mt-1">{health.services.timestamp}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Log */}
      {health.errors.length > 0 && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <h3 className="font-bold text-red-300 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Error Report
          </h3>
          <ul className="space-y-2">
            {health.errors.map((error, i) => (
              <li key={i} className="text-sm text-red-200">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
