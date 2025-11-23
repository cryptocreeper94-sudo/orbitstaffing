/**
 * Developer Landing Page
 * Entry point for all authenticated users with system health check
 * Navigate to Admin Panel or Main App from here
 */
import React, { useState, useEffect } from 'react';
import { Code, Shield, LogOut, Zap, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { SystemHealthCheck } from '@/components/SystemHealthCheck';
import { AlertCircle } from 'lucide-react';

export default function DeveloperLanding() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already authenticated
    const devAuth = localStorage.getItem('developerAuthenticated') === 'true';
    if (devAuth) {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    const correctPin = process.env.VITE_ADMIN_PIN || '0000';
    if (pin === correctPin) {
      setIsAuthenticated(true);
      localStorage.setItem('developerAuthenticated', 'true');
      setPin('');
    } else {
      setError('Invalid PIN.');
      setPin('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPin('');
    setError('');
    localStorage.removeItem('developerAuthenticated');
  };

  const navigateTo = (path: string) => {
    setLocation(path);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 max-w-md w-full border border-slate-700">
          <div className="flex items-center justify-center mb-6">
            <Code className="w-8 h-8 text-purple-400 mr-3" />
            <h1 className="text-2xl font-bold text-white">ORBIT System</h1>
          </div>

          <p className="text-gray-400 text-sm mb-6 text-center">
            Enter your 4-digit PIN to access the system
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                placeholder="••••"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:border-purple-400"
                autoFocus
                data-testid="input-system-pin"
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
              data-testid="button-system-login"
            >
              Login
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            ORBIT Staffing OS - System Control Panel
          </p>
        </div>
      </div>
    );
  }

  // Authenticated Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <Code className="w-8 h-8 text-purple-400" />
              System Control Panel
            </h1>
            <p className="text-gray-400">Developer access - system health & navigation</p>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
            data-testid="button-system-logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* System Health Check - Top Priority */}
        <div className="mb-12">
          <SystemHealthCheck />
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Admin Panel Card */}
          <div
            onClick={() => navigateTo('/admin')}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 cursor-pointer hover:border-cyan-500 transition-all group"
            data-testid="card-navigate-admin"
          >
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Admin Panel</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Manage franchises, customers, billing, and system configuration
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>✓ Create & manage franchises</li>
                  <li>✓ Manage monthly customers</li>
                  <li>✓ View system analytics</li>
                  <li>✓ Delegate admin responsibilities</li>
                </ul>
              </div>
            </div>
            <Button className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700" data-testid="button-go-admin">
              Open Admin Panel →
            </Button>
          </div>

          {/* Main App Card */}
          <div
            onClick={() => navigateTo('/dashboard')}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 cursor-pointer hover:border-green-500 transition-all group"
            data-testid="card-navigate-app"
          >
            <div className="flex items-start gap-4">
              <BarChart3 className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Main Application</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Access workers, assignments, scheduling, and operational dashboard
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>✓ Worker & client management</li>
                  <li>✓ Job assignments & scheduling</li>
                  <li>✓ Real-time dashboard</li>
                  <li>✓ Payroll & invoicing</li>
                </ul>
              </div>
            </div>
            <Button className="w-full mt-6 bg-green-600 hover:bg-green-700" data-testid="button-go-app">
              Open Main App →
            </Button>
          </div>
        </div>

        {/* Developer Tools */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* APIs & Documentation */}
          <div
            onClick={() => navigateTo('/developer')}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 cursor-pointer hover:border-purple-500 transition-all"
            data-testid="card-dev-apis"
          >
            <Code className="w-6 h-6 text-purple-400 mb-3" />
            <h3 className="font-bold text-lg mb-2">APIs & Documentation</h3>
            <p className="text-sm text-gray-400">REST APIs, WebSocket endpoints, code examples</p>
          </div>

          {/* System Configuration */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 cursor-pointer hover:border-yellow-500 transition-all group"
            data-testid="card-dev-config"
          >
            <Settings className="w-6 h-6 text-yellow-400 mb-3 group-hover:rotate-12 transition-transform" />
            <h3 className="font-bold text-lg mb-2">Configuration</h3>
            <p className="text-sm text-gray-400">Database, environment, settings management</p>
          </div>

          {/* Error Monitoring */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 cursor-pointer hover:border-red-500 transition-all"
            data-testid="card-dev-monitoring"
          >
            <Zap className="w-6 h-6 text-red-400 mb-3" />
            <h3 className="font-bold text-lg mb-2">Monitoring & Logs</h3>
            <p className="text-sm text-gray-400">Error logs, performance metrics, debugging</p>
          </div>
        </div>
      </div>
    </div>
  );
}
