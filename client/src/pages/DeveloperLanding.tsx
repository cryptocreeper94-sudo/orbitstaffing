/**
 * Developer Landing Page
 * Public sandbox entry point - join as Owner or Employee with PIN 7777
 */
import React, { useState } from 'react';
import { Code, Shield, Users, LogOut, Lock, Briefcase } from 'lucide-react';
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
  const [showOwnerCodeInput, setShowOwnerCodeInput] = useState(false);
  const [showEmployeeCodeInput, setShowEmployeeCodeInput] = useState(false);
  const [ownerAccessCode, setOwnerAccessCode] = useState('');
  const [employeeAccessCode, setEmployeeAccessCode] = useState('');
  const [accessCodeError, setAccessCodeError] = useState('');

  const loginMutation = useMutation({
    mutationFn: async (sandboxRole: 'owner' | 'employee') => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: '7777',
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

  const handleJoinSandbox = (role: 'owner' | 'employee') => {
    setSelectedRole(role);
    setError('');
    loginMutation.mutate(role);
  };

  const handleOwnerLogin = (code: string) => {
    setAccessCodeError('');
    if (!code.trim()) {
      setAccessCodeError('Access code required');
      return;
    }
    // For now, accept any non-empty code - would validate against backend in production
    localStorage.setItem('userAccessCode', code);
    localStorage.setItem('userRole', 'owner');
    localStorage.setItem('currentUser', JSON.stringify({ role: 'owner', accessCode: code }));
    setLocation('/dashboard');
  };

  const handleEmployeeLogin = (code: string) => {
    setAccessCodeError('');
    if (!code.trim()) {
      setAccessCodeError('Access code required');
      return;
    }
    // For now, accept any non-empty code - would validate against backend in production
    localStorage.setItem('userAccessCode', code);
    localStorage.setItem('userRole', 'worker');
    localStorage.setItem('currentUser', JSON.stringify({ role: 'worker', accessCode: code }));
    setLocation('/employee-app');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 relative">
        {/* Admin Button for logged in view */}
        <div className="absolute top-6 right-6">
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
            data-testid="button-sandbox-logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Code className="w-10 h-10 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">ORBIT Staffing OS</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Complete Staffing Platform Demo
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
          {/* Owner Sandbox */}
          <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700 hover:border-green-500 transition-all flex flex-col h-full">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 text-center">
              Owner Sandbox
            </h2>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Full control - manage jobs, workers, payroll, and invoices
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
                Process instant payroll
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-green-400">✓</span>
                Track earnings and bonuses
              </div>
            </div>

            <Button
              onClick={() => handleJoinSandbox('owner')}
              disabled={loginMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 text-base mb-3 font-bold glow-green"
              data-testid="button-join-owner-sandbox"
            >
              {loginMutation.isPending && selectedRole === 'owner'
                ? 'Joining...'
                : 'Join as Owner'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Full control sandbox
            </p>
          </div>

          {/* Employee Sandbox */}
          <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700 hover:border-purple-500 transition-all flex flex-col h-full">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 text-center">
              Employee Sandbox
            </h2>
            <p className="text-gray-400 text-sm mb-6 text-center">
              View jobs, clock in, track earnings and bonuses
            </p>

            <div className="space-y-3 mb-6 bg-slate-700/30 p-4 rounded flex-grow">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-purple-400">✓</span>
                View assigned jobs
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-purple-400">✓</span>
                GPS clock-in/out
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-purple-400">✓</span>
                Real-time earnings
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-purple-400">✓</span>
                Track bonuses and payments
              </div>
            </div>

            <Button
              onClick={() => handleJoinSandbox('employee')}
              disabled={loginMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 text-base mb-3 font-bold glow-purple"
              data-testid="button-join-employee-sandbox"
            >
              {loginMutation.isPending && selectedRole === 'employee'
                ? 'Joining...'
                : 'Join as Employee'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Worker experience sandbox
            </p>
          </div>
        </div>

        {/* Real User Logins Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Production Access</h3>
            <p className="text-gray-400 text-sm">
              Sign in with your registered account or access code
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Real Owner Login */}
            <div className={`glow-card bg-slate-800 rounded-lg p-6 border transition-all ${showOwnerCodeInput ? 'border-green-500/50 glow-button-green' : 'border-slate-600 hover:border-green-500/30'} relative backdrop-blur-sm`}>
              <div className="flex items-center justify-center mb-3">
                <Briefcase className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 text-center">
                Owner Login
              </h3>
              <p className="text-gray-400 text-xs mb-4 text-center">
                Access your staffing business dashboard
              </p>
              
              {!showOwnerCodeInput ? (
                <Button
                  onClick={() => setShowOwnerCodeInput(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 glow-green"
                  data-testid="button-owner-login-enable"
                >
                  Access Code
                </Button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter access code"
                    value={ownerAccessCode}
                    onChange={(e) => {
                      setOwnerAccessCode(e.target.value);
                      setAccessCodeError('');
                    }}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-green-400"
                    data-testid="input-owner-access-code"
                  />
                  {accessCodeError && <p className="text-xs text-red-400">{accessCodeError}</p>}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleOwnerLogin(ownerAccessCode)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-2 glow-green"
                      data-testid="button-owner-access-submit"
                    >
                      Submit
                    </Button>
                    <Button
                      onClick={() => {
                        setShowOwnerCodeInput(false);
                        setOwnerAccessCode('');
                        setAccessCodeError('');
                      }}
                      variant="outline"
                      className="flex-1 text-sm border-gray-500 text-gray-300 hover:bg-slate-700"
                      data-testid="button-owner-access-cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Real Employee Login */}
            <div className={`glow-card bg-slate-800 rounded-lg p-6 border transition-all ${showEmployeeCodeInput ? 'border-purple-500/50 glow-button-purple' : 'border-slate-600 hover:border-purple-500/30'} relative backdrop-blur-sm`}>
              <div className="flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 text-center">
                Employee Login
              </h3>
              <p className="text-gray-400 text-xs mb-4 text-center">
                View assignments and track earnings
              </p>
              
              {!showEmployeeCodeInput ? (
                <Button
                  onClick={() => setShowEmployeeCodeInput(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 glow-purple"
                  data-testid="button-employee-login-enable"
                >
                  Access Code
                </Button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter access code"
                    value={employeeAccessCode}
                    onChange={(e) => {
                      setEmployeeAccessCode(e.target.value);
                      setAccessCodeError('');
                    }}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-purple-400"
                    data-testid="input-employee-access-code"
                  />
                  {accessCodeError && <p className="text-xs text-red-400">{accessCodeError}</p>}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEmployeeLogin(employeeAccessCode)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm py-2 glow-purple"
                      data-testid="button-employee-access-submit"
                    >
                      Submit
                    </Button>
                    <Button
                      onClick={() => {
                        setShowEmployeeCodeInput(false);
                        setEmployeeAccessCode('');
                        setAccessCodeError('');
                      }}
                      variant="outline"
                      className="flex-1 text-sm border-gray-500 text-gray-300 hover:bg-slate-700"
                      data-testid="button-employee-access-cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Real Admin Login */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-600 opacity-60 cursor-not-allowed relative">
              <div className="flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-500 mb-2 text-center">
                Admin Portal
              </h3>
              <p className="text-gray-500 text-xs mb-4 text-center">
                System administration and oversight
              </p>
              <Button
                onClick={() => setLocation('/admin')}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold glow-cyan"
                data-testid="button-admin-login-section"
              >
                Admin Access
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 text-center">
          <p className="text-gray-400 text-sm mb-2">
            Complete demo environment ready for production testing
          </p>
          <p className="text-xs text-gray-500">
            Request a free demo to get your access code
          </p>
        </div>
      </div>
    </div>
  );
}
