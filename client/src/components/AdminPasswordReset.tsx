/**
 * Admin Password Reset (Sidonie's Ability)
 * Only accessible to Sidonie and Dev
 */
import React, { useState } from 'react';
import { Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminPasswordResetProps {
  canReset: boolean;
}

export default function AdminPasswordReset({ canReset }: AdminPasswordResetProps) {
  const [showForm, setShowForm] = useState(false);
  const [targetAdmin, setTargetAdmin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const adminList = [
    { id: 'sidonie-admin-001', name: 'Sidonie' },
    { id: 'admin-001', name: 'Admin 1' },
    { id: 'admin-002', name: 'Admin 2' },
  ];

  const handleResetPassword = async () => {
    if (!targetAdmin || !newPassword || !confirmPassword) {
      setMessage('Please fill all fields');
      setMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      return;
    }

    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetByUserId: 'sidonie-admin-001', // Current user
          targetUserId: targetAdmin,
          newPasswordHash: newPassword, // In production, hash this properly
        }),
      });

      if (res.ok) {
        setMessage(`✓ Password reset successfully for admin`);
        setMessageType('success');
        setTargetAdmin('');
        setNewPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          setShowForm(false);
          setMessage('');
        }, 2000);
      } else {
        setMessage('Failed to reset password');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage('Error resetting password');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (!canReset) return null;

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
        data-testid="button-reset-admin-password"
      >
        <Lock className="w-4 h-4" />
        Reset Admin Password
      </Button>
    );
  }

  return (
    <Card className="bg-slate-800 border-purple-700">
      <CardHeader className="bg-purple-900/30">
        <CardTitle className="flex items-center gap-2 text-purple-300">
          <AlertTriangle className="w-5 h-5" />
          Reset Admin Password
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Admin:</label>
          <select
            value={targetAdmin}
            onChange={(e) => setTargetAdmin(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            data-testid="select-target-admin"
          >
            <option value="">Choose admin...</option>
            {adminList.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            data-testid="input-new-password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            data-testid="input-confirm-password"
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg flex items-start gap-2 ${
              messageType === 'success'
                ? 'bg-green-900/30 text-green-300 border border-green-600/50'
                : 'bg-red-900/30 text-red-300 border border-red-600/50'
            }`}
          >
            {messageType === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleResetPassword}
            disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
            data-testid="button-confirm-reset"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
          <Button
            onClick={() => {
              setShowForm(false);
              setMessage('');
              setTargetAdmin('');
              setNewPassword('');
              setConfirmPassword('');
            }}
            variant="outline"
            className="flex-1"
            data-testid="button-cancel-reset"
          >
            Cancel
          </Button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          This action is logged. Admin will need to change password on first login.
        </p>
      </CardContent>
    </Card>
  );
}
