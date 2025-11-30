/**
 * Secure Sandbox - Hidden PIN 4444 Access
 * Access all three sandboxes: Owner, Admin, Employee
 * Developer Playground for testing integrations
 * Only accessible via /sandbox-secure (not publicly visible)
 * Both users can access all views - Sidonie read-only, You full control
 */
import React, { useState } from 'react';
import { Code, Shield, Users, LogOut, Lock, Briefcase, ChevronLeft, 
  Zap, Database, Cloud, TestTube, Sparkles, PlayCircle, Settings, 
  Globe, Wallet, CreditCard, MapPin, Bell, FileText } from 'lucide-react';
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
            {/* Back to Sandbox Selection */}
            <div
              onClick={() => { handleLogout(); setIsAuthenticated(false); }}
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
        <button
          onClick={() => setLocation('/')}
          className="text-gray-400 hover:text-white transition-colors p-1"
          data-testid="button-back-arrow"
          title="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
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

        {/* Developer Playground Section */}
        <div className="mt-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Developer Playground</h2>
            <span className="px-2 py-0.5 text-xs bg-cyan-600/30 text-cyan-300 rounded-full">Demo Mode</span>
          </div>
          
          <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 gap-2 min-[480px]:gap-3 md:gap-4">
            {/* API Testing */}
            <div 
              onClick={() => setLocation('/developer-panel')}
              className="bg-slate-800/70 border border-slate-700 rounded-lg p-3 sm:p-4 hover:border-cyan-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-cyan-600/20 mb-2 sm:mb-3">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm mb-0.5 sm:mb-1">API Explorer</h3>
              <p className="text-[10px] sm:text-xs text-gray-500">Test endpoints</p>
            </div>

            {/* Database Viewer */}
            <div 
              onClick={() => setLocation('/developer-panel')}
              className="bg-slate-800/70 border border-slate-700 rounded-lg p-3 sm:p-4 hover:border-green-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-600/20 mb-2 sm:mb-3">
                <Database className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm mb-0.5 sm:mb-1">Database</h3>
              <p className="text-[10px] sm:text-xs text-gray-500">Schema & data</p>
            </div>

            {/* Weather Demo */}
            <div 
              onClick={() => setLocation('/')}
              className="bg-slate-800/70 border border-slate-700 rounded-lg p-3 sm:p-4 hover:border-blue-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-600/20 mb-2 sm:mb-3">
                <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm mb-0.5 sm:mb-1">Weather</h3>
              <p className="text-[10px] sm:text-xs text-gray-500">HD radar</p>
            </div>

            {/* GPS Clock Demo */}
            <div 
              onClick={() => setLocation('/gps-clock-in')}
              className="bg-slate-800/70 border border-slate-700 rounded-lg p-3 sm:p-4 hover:border-purple-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-600/20 mb-2 sm:mb-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm mb-0.5 sm:mb-1">GPS Clock</h3>
              <p className="text-[10px] sm:text-xs text-gray-500">Geofence test</p>
            </div>

            {/* Payment Testing */}
            <div 
              onClick={() => setLocation('/pay-card')}
              className="bg-slate-800/70 border border-slate-700 rounded-lg p-3 sm:p-4 hover:border-yellow-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-600/20 mb-2 sm:mb-3">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm mb-0.5 sm:mb-1">Pay Card</h3>
              <p className="text-[10px] sm:text-xs text-gray-500">Payments</p>
            </div>

            {/* Crypto Wallet */}
            <div 
              onClick={() => setLocation('/crypto-wallet')}
              className="bg-slate-800/70 border border-slate-700 rounded-lg p-3 sm:p-4 hover:border-orange-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-600/20 mb-2 sm:mb-3">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm mb-0.5 sm:mb-1">Crypto</h3>
              <p className="text-[10px] sm:text-xs text-gray-500">Solana</p>
            </div>

            {/* Notifications */}
            <div 
              onClick={() => setLocation('/notifications')}
              className="bg-slate-800/70 border border-slate-700 rounded-lg p-3 sm:p-4 hover:border-pink-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-pink-600/20 mb-2 sm:mb-3">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm mb-0.5 sm:mb-1">Alerts</h3>
              <p className="text-[10px] sm:text-xs text-gray-500">Notifications</p>
            </div>

            {/* Document Hallmark */}
            <div 
              onClick={() => setLocation('/digital-hallmark')}
              className="bg-slate-800/70 border border-slate-700 rounded-lg p-3 sm:p-4 hover:border-indigo-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-600/20 mb-2 sm:mb-3">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
              </div>
              <h3 className="font-bold text-white text-xs sm:text-sm mb-0.5 sm:mb-1">Hallmarks</h3>
              <p className="text-[10px] sm:text-xs text-gray-500">100B capacity</p>
            </div>
          </div>
        </div>

        {/* Founding Assets Registry */}
        <div className="mt-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">👑</span>
            <h2 className="text-xl font-bold text-white">Founding Asset Registry</h2>
            <span className="px-2 py-0.5 text-xs bg-yellow-600/30 text-yellow-300 rounded-full">Reserved</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ORBIT Platform */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-yellow-500/30 rounded-lg p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">🪐</span>
                <div>
                  <p className="font-mono text-yellow-400 text-sm">#000000001-00</p>
                  <p className="text-[10px] text-gray-500">Genesis Platform</p>
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mb-1">ORBIT Staffing OS</h3>
              <p className="text-xs text-gray-400">The origin of all hallmarks</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] bg-yellow-600/20 text-yellow-300 rounded">FE Edition</span>
                <span className="px-2 py-0.5 text-[10px] bg-cyan-600/20 text-cyan-300 rounded">Solana Verified</span>
              </div>
            </div>

            {/* Jason - Founder */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-yellow-500/30 rounded-lg p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">👨‍💻</span>
                <div>
                  <p className="font-mono text-yellow-400 text-sm">#000000002-00</p>
                  <p className="text-[10px] text-gray-500">Founding Developer</p>
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mb-1">Jason</h3>
              <p className="text-xs text-gray-400">DarkWave Studios founder</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] bg-yellow-600/20 text-yellow-300 rounded">FE Edition</span>
                <span className="px-2 py-0.5 text-[10px] bg-purple-600/20 text-purple-300 rounded">vanity: /jason</span>
              </div>
            </div>

            {/* Sidonie - Team */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-yellow-500/30 rounded-lg p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">👩‍💼</span>
                <div>
                  <p className="font-mono text-yellow-400 text-sm">#000000003-00</p>
                  <p className="text-[10px] text-gray-500">Founding Team</p>
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mb-1">Sidonie</h3>
              <p className="text-xs text-gray-400">Core team member</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] bg-yellow-600/20 text-yellow-300 rounded">FE Edition</span>
                <span className="px-2 py-0.5 text-[10px] bg-purple-600/20 text-purple-300 rounded">vanity: /sidonie</span>
              </div>
            </div>
          </div>

          {/* Capacity Info */}
          <div className="mt-4 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white font-semibold">100 Billion Hallmark Capacity</p>
                <p className="text-xs text-gray-500">Format: #XXXXXXXXX-YY (9 digits + 2 sub-sequence)</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs bg-yellow-600/20 text-yellow-300 rounded border border-yellow-500/30">1-99: Founders</span>
                <span className="px-2 py-1 text-xs bg-purple-600/20 text-purple-300 rounded border border-purple-500/30">100-999: Special</span>
                <span className="px-2 py-1 text-xs bg-cyan-600/20 text-cyan-300 rounded border border-cyan-500/30">1000-1999: Genesis</span>
                <span className="px-2 py-1 text-xs bg-green-600/20 text-green-300 rounded border border-green-500/30">3000+: General</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <PlayCircle className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-white">Quick Demo Actions</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setLocation('/workflow-demo')}
              variant="outline"
              className="border-slate-600 hover:border-cyan-500 text-gray-300"
              data-testid="button-workflow-demo"
            >
              <Sparkles className="w-4 h-4 mr-2 text-cyan-400" />
              Workflow Demo
            </Button>
            <Button
              onClick={() => setLocation('/job-board')}
              variant="outline"
              className="border-slate-600 hover:border-green-500 text-gray-300"
              data-testid="button-job-board-demo"
            >
              <Globe className="w-4 h-4 mr-2 text-green-400" />
              Job Board
            </Button>
            <Button
              onClick={() => setLocation('/pricing')}
              variant="outline"
              className="border-slate-600 hover:border-purple-500 text-gray-300"
              data-testid="button-pricing-demo"
            >
              <Settings className="w-4 h-4 mr-2 text-purple-400" />
              Pricing Config
            </Button>
            <Button
              onClick={() => setLocation('/integrations')}
              variant="outline"
              className="border-slate-600 hover:border-yellow-500 text-gray-300"
              data-testid="button-integrations-demo"
            >
              <TestTube className="w-4 h-4 mr-2 text-yellow-400" />
              Integrations
            </Button>
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
