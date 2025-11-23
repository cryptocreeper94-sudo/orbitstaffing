/**
 * Developer Landing Page
 * Sandbox entry point - join as Admin or Owner with PIN 4444
 */
import React, { useState } from 'react';
import { Code, Shield, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';

export default function DeveloperLanding() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pinInput, setPinInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'owner' | null>(null);
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: async (sandboxRole: 'admin' | 'owner') => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: '4444',
          sandboxRole: sandboxRole,
        }),
      });
      if (!res.ok) throw new Error('Login failed');
      return res.json();
    },
    onSuccess: (user, sandboxRole) => {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('userRole', user.role);
      
      // Navigate to appropriate dashboard
      if (sandboxRole === 'admin') {
        setLocation('/admin');
      } else {
        setLocation('/dashboard');
      }
    },
    onError: () => {
      setError('Failed to join sandbox. Please try again.');
      setPinInput('');
      setSelectedRole(null);
    },
  });

  const handleJoinSandbox = (role: 'admin' | 'owner') => {
    setSelectedRole(role);
    setError('');
    loginMutation.mutate(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPinInput('');
    setSelectedRole(null);
    setError('');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
  };

  // Authenticated state - show user dashboard
  if (isAuthenticated && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <Code className="w-8 h-8 text-purple-400" />
                ORBIT Sandbox
              </h1>
              <p className="text-gray-400">
                Logged in as {currentUser.firstName} ({currentUser.role})
              </p>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
              data-testid="button-sandbox-logout"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentUser.role === 'admin' && (
              <div
                onClick={() => setLocation('/admin')}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 cursor-pointer hover:border-cyan-500 transition-all group"
              >
                <Shield className="w-8 h-8 text-cyan-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
                <p className="text-gray-400 text-sm mb-4">
                  View all companies, workers, and system metrics
                </p>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                  Go to Admin →
                </Button>
              </div>
            )}

            {currentUser.role === 'owner' && (
              <div
                onClick={() => setLocation('/dashboard')}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 cursor-pointer hover:border-green-500 transition-all group"
              >
                <Users className="w-8 h-8 text-green-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Owner Dashboard</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Manage jobs, assignments, and payroll for Superior Staffing
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Go to Dashboard →
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated - show sandbox join options
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Code className="w-10 h-10 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">ORBIT Staffing OS</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Complete Staffing Platform Demo - PIN: 4444
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-center gap-3 mb-8">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Sandbox Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Admin Sandbox */}
          <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700 hover:border-cyan-500 transition-all">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 text-center">
              Admin Sandbox
            </h2>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Sidonie's view - Monitor all companies, workers, and system metrics in real-time
            </p>

            <div className="space-y-3 mb-6 bg-slate-700/30 p-4 rounded">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-cyan-400">✓</span>
                Real-time dashboard & analytics
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-cyan-400">✓</span>
                GPS verification & audit trails
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-cyan-400">✓</span>
                System-wide monitoring
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-cyan-400">✓</span>
                Compliance & reporting
              </div>
            </div>

            <Button
              onClick={() => handleJoinSandbox('admin')}
              disabled={loginMutation.isPending}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 font-bold text-lg"
              data-testid="button-join-admin-sandbox"
            >
              {loginMutation.isPending && selectedRole === 'admin'
                ? 'Joining...'
                : 'Join as Admin (PIN: 4444)'}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Email: sidonie@orbitstaffing.net
            </p>
          </div>

          {/* Owner Sandbox */}
          <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700 hover:border-green-500 transition-all">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 text-center">
              Owner Sandbox
            </h2>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Your view - Create jobs, assign workers, process payroll instantly
            </p>

            <div className="space-y-3 mb-6 bg-slate-700/30 p-4 rounded">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-green-400">✓</span>
                Create & manage jobs
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-green-400">✓</span>
                Assign workers instantly
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-green-400">✓</span>
                Automatic payroll processing
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-green-400">✓</span>
                Real-time earnings tracking
              </div>
            </div>

            <Button
              onClick={() => handleJoinSandbox('owner')}
              disabled={loginMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-bold text-lg"
              data-testid="button-join-owner-sandbox"
            >
              {loginMutation.isPending && selectedRole === 'owner'
                ? 'Joining...'
                : 'Join as Owner (PIN: 4444)'}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Email: owner@superiostaffing.com
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 text-center">
          <p className="text-gray-400 text-sm mb-2">
            Complete demo environment ready for production testing
          </p>
          <p className="text-xs text-gray-500">
            Both PIN: <span className="text-yellow-400 font-mono">4444</span> • Complete sandbox access
          </p>
        </div>
      </div>
    </div>
  );
}
