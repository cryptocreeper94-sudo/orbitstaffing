/**
 * Secure Sandbox - Hidden PIN 4444 Access
 * Access all three sandboxes: Owner, Admin, Employee
 * Only accessible via /sandbox-secure (not publicly visible)
 * Both users can access all views - Sidonie read-only, You full control
 */
import React, { useState } from 'react';
import { Code, Shield, Users, LogOut, Lock, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';

export default function SecureSandbox() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'owner' | 'employee' | null>(null);
  const [error, setError] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: async (sandboxRole: 'admin' | 'owner' | 'employee') => {
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
      localStorage.setItem('isReadOnly', user.isReadOnly || false);
      localStorage.setItem('sandboxSecure', 'true');

      // If user requires password change, show password modal
      if (user.requiresPasswordChange || user.needsPasswordReset) {
        setShowPasswordChange(true);
      } else {
        // Navigate to appropriate dashboard
        if (sandboxRole === 'admin') {
          setLocation('/admin');
        } else if (sandboxRole === 'employee') {
          setLocation('/employee-app');
        } else {
          setLocation('/dashboard');
        }
      }
    },
    onError: () => {
      setError('Failed to join sandbox. Please try again.');
      setSelectedRole(null);
    },
  });

  const handleJoinSandbox = (role: 'admin' | 'owner' | 'employee') => {
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
    localStorage.removeItem('isReadOnly');
    localStorage.removeItem('sandboxSecure');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    // Save password (in production, would send to server)
    localStorage.setItem(`${currentUser.id}_password`, newPassword);
    setShowPasswordChange(false);
    
    // Navigate to dashboard
    if (currentUser.role === 'admin') {
      setLocation('/admin');
    } else if (currentUser.role === 'worker') {
      setLocation('/employee-app');
    } else {
      setLocation('/dashboard');
    }
  };

  // Password change modal
  if (isAuthenticated && currentUser && showPasswordChange) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 max-w-md w-full border border-slate-700">
          <h1 className="text-2xl font-bold text-white mb-2">{currentUser.greeting || `Welcome, ${currentUser.firstName}!`}</h1>
          <p className="text-gray-400 text-sm mb-6">
            Please set a new password to secure your account
          </p>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 font-bold"
            >
              Set Password & Continue
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated state
  if (isAuthenticated && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <Lock className="w-8 h-8 text-purple-400" />
                ORBIT Sandbox Portal
              </h1>
              <p className="text-gray-400">
                Access as {currentUser.firstName} ({currentUser.role})
                {currentUser.isReadOnly && <span className="text-yellow-400 ml-2">[READ-ONLY]</span>}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Admin Dashboard */}
            <div
              onClick={() => handleLogout() || setIsAuthenticated(false)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 cursor-pointer hover:border-cyan-500 transition-all group"
            >
              <Shield className="w-8 h-8 text-cyan-400 mb-4" />
              <h2 className="text-xl font-bold mb-2">Back to Sandbox</h2>
              <p className="text-gray-400 text-sm mb-4">
                Return to sandbox selection
              </p>
              <Button className="w-full bg-slate-600 hover:bg-slate-700">
                Go Back
              </Button>
            </div>

            {/* Admin View */}
            {currentUser.role === 'admin' && (
              <div
                onClick={() => setLocation('/admin')}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 cursor-pointer hover:border-cyan-500 transition-all group"
              >
                <Shield className="w-8 h-8 text-cyan-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">Admin Dashboard</h2>
                <p className="text-gray-400 text-sm mb-4">
                  System overview - Complete visibility
                </p>
                <ul className="text-xs text-gray-500 space-y-1 mb-4">
                  <li>✓ All companies & workers</li>
                  <li>✓ Real-time operations</li>
                  <li>✓ Complete audit trails</li>
                  {currentUser.isReadOnly && <li>✓ Read-only mode</li>}
                </ul>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                  Open Admin →
                </Button>
              </div>
            )}

            {/* Owner View */}
            {currentUser.role === 'owner' && (
              <div
                onClick={() => setLocation('/dashboard')}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 cursor-pointer hover:border-green-500 transition-all group"
              >
                <Briefcase className="w-8 h-8 text-green-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">Owner Dashboard</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Full operational control
                </p>
                <ul className="text-xs text-gray-500 space-y-1 mb-4">
                  <li>✓ Create & manage jobs</li>
                  <li>✓ Assign workers</li>
                  <li>✓ Process payroll</li>
                  <li>✓ Generate invoices</li>
                </ul>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Open Owner →
                </Button>
              </div>
            )}

            {/* Worker/Employee View */}
            {currentUser.role === 'worker' && (
              <div
                onClick={() => setLocation('/employee-app')}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 cursor-pointer hover:border-purple-500 transition-all group"
              >
                <Users className="w-8 h-8 text-purple-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">Employee App</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Worker experience view
                </p>
                <ul className="text-xs text-gray-500 space-y-1 mb-4">
                  <li>✓ View assignments</li>
                  <li>✓ GPS clock-in/out</li>
                  <li>✓ Track earnings</li>
                  <li>✓ View bonuses</li>
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Open Worker App →
                </Button>
              </div>
            )}
          </div>

          <div className="mt-8 bg-slate-800/30 border border-slate-700 rounded-lg p-6">
            <p className="text-gray-400 text-sm">
              <Lock className="w-4 h-4 inline mr-2 text-purple-400" />
              You are in PIN 4444 sandbox mode. You can switch between Admin, Owner, and Employee views.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated - Show three sandbox options
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <Button
          onClick={() => setLocation('/')}
          variant="outline"
          className="text-purple-400 border-purple-400 hover:bg-purple-400/10"
          data-testid="button-back-home"
        >
          ← Back
        </Button>
      </div>
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Lock className="w-10 h-10 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">Secure Sandbox</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Complete testing environment
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Test all three views: Admin, Owner, Employee
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-center gap-3 mb-8">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Three Sandbox Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Admin Sandbox */}
          <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700 hover:border-cyan-500 transition-all flex flex-col h-full">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 text-center">
              Admin Sandbox
            </h2>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Complete system overview & control
            </p>

            <div className="space-y-3 mb-6 bg-slate-700/30 p-4 rounded flex-grow">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-cyan-400">✓</span>
                View all companies & workers
              </div>
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
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 font-bold text-lg mb-3"
              data-testid="button-admin-sandbox"
            >
              {loginMutation.isPending && selectedRole === 'admin'
                ? 'Joining...'
                : 'Join Admin'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              System monitoring & oversight
            </p>
          </div>

          {/* Owner Sandbox */}
          <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700 hover:border-green-500 transition-all flex flex-col h-full">
            <div className="flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 text-center">
              Owner Sandbox
            </h2>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Full operational control
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
                Invoice generation
              </div>
            </div>

            <Button
              onClick={() => handleJoinSandbox('owner')}
              disabled={loginMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-bold text-lg mb-3"
              data-testid="button-owner-sandbox"
            >
              {loginMutation.isPending && selectedRole === 'owner'
                ? 'Joining...'
                : 'Join Owner'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Full business operations
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
              Worker app experience
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
                Track bonuses
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-purple-400">✓</span>
                Payment history
              </div>
            </div>

            <Button
              onClick={() => handleJoinSandbox('employee')}
              disabled={loginMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-bold text-lg mb-3"
              data-testid="button-employee-sandbox"
            >
              {loginMutation.isPending && selectedRole === 'employee'
                ? 'Joining...'
                : 'Join Employee'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Worker view experience
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 text-center">
          <Lock className="w-5 h-5 inline text-purple-400 mr-2" />
          <p className="text-gray-400 text-sm">
            Restricted access sandbox. Authorized access only.
          </p>
        </div>
      </div>
    </div>
  );
}
