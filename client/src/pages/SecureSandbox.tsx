/**
 * Secure Sandbox - Hidden PIN 4444 Access
 * Only accessible via /sandbox-secure (not publicly visible)
 * Personalized for User and Sidonie
 * Read-only for Sidonie, Full control for User
 */
import React, { useState } from 'react';
import { Code, Shield, Users, LogOut, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';

export default function SecureSandbox() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
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
      localStorage.setItem('sandboxSecure', 'true');

      // Navigate to appropriate dashboard
      if (sandboxRole === 'admin') {
        setLocation('/admin');
      } else {
        setLocation('/dashboard');
      }
    },
    onError: () => {
      setError('Failed to join sandbox. Please try again.');
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
    setSelectedRole(null);
    setError('');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('sandboxSecure');
  };

  // Authenticated state
  if (isAuthenticated && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <Lock className="w-8 h-8 text-purple-400" />
                ORBIT Secure Sandbox
              </h1>
              <p className="text-gray-400">
                Private access for {currentUser.firstName} ({currentUser.role})
              </p>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
              data-testid="button-secure-logout"
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
                  System overview - Read-only monitoring access
                </p>
                <ul className="text-xs text-gray-500 space-y-1 mb-4">
                  <li>✓ View all companies and workers</li>
                  <li>✓ Monitor all operations in real-time</li>
                  <li>✓ Access complete audit trails</li>
                  <li>✓ No modifications allowed (read-only)</li>
                </ul>
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
                  Full operational control - Superior Staffing sandbox
                </p>
                <ul className="text-xs text-gray-500 space-y-1 mb-4">
                  <li>✓ Create and manage jobs</li>
                  <li>✓ Assign workers to assignments</li>
                  <li>✓ Process payroll</li>
                  <li>✓ Generate invoices</li>
                </ul>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Go to Dashboard →
                </Button>
              </div>
            )}
          </div>

          <div className="mt-8 bg-slate-800/30 border border-slate-700 rounded-lg p-6">
            <p className="text-gray-400 text-sm">
              <Lock className="w-4 h-4 inline mr-2 text-purple-400" />
              Secure sandbox - Private access only. PIN 4444 is restricted to authorized users.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated - Show secure login
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Lock className="w-10 h-10 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">Secure Sandbox</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Private testing environment - PIN 4444
          </p>
          <p className="text-gray-500 text-xs mt-2">
            This is a restricted access area
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-center gap-3 mb-8">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Login Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Sidonie's Admin Access */}
          <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700 hover:border-cyan-500 transition-all flex flex-col h-full">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 text-center">
              Admin Access
            </h2>
            <p className="text-gray-400 text-sm mb-6 text-center">
              System monitoring & oversight - Read-only access
            </p>

            <div className="space-y-3 mb-6 bg-slate-700/30 p-4 rounded flex-grow">
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
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-cyan-400">✓</span>
                Read-only (no modifications)
              </div>
            </div>

            <Button
              onClick={() => handleJoinSandbox('admin')}
              disabled={loginMutation.isPending}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 font-bold text-lg mb-3"
              data-testid="button-secure-admin"
            >
              {loginMutation.isPending && selectedRole === 'admin'
                ? 'Joining...'
                : 'Join as Admin'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Email: sidonie@orbitstaffing.net
            </p>
          </div>

          {/* Your Owner Access */}
          <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700 hover:border-green-500 transition-all flex flex-col h-full">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 text-center">
              Owner Access
            </h2>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Full operational control - Superior Staffing
            </p>

            <div className="space-y-3 mb-6 bg-slate-700/30 p-4 rounded flex-grow">
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
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-green-400">✓</span>
                Full dashboard control
              </div>
            </div>

            <Button
              onClick={() => handleJoinSandbox('owner')}
              disabled={loginMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-bold text-lg mb-3"
              data-testid="button-secure-owner"
            >
              {loginMutation.isPending && selectedRole === 'owner'
                ? 'Joining...'
                : 'Join as Owner'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Email: owner@superiostaffing.com
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 text-center">
          <Lock className="w-5 h-5 inline text-purple-400 mr-2" />
          <p className="text-gray-400 text-sm">
            This is a restricted access sandbox environment for authorized testing only.
          </p>
        </div>
      </div>
    </div>
  );
}
