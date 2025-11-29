import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Book, Phone } from 'lucide-react';

interface RunbookItem {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  icon: string;
  steps: string[];
  escalation?: string;
  contactInfo?: string;
}

const CONTINGENCY_RUNBOOKS: RunbookItem[] = [
  {
    id: 'stripe-down',
    title: 'Stripe Payment Failures',
    severity: 'critical',
    icon: '💳',
    steps: [
      '1. Check stripe.com status page for outages',
      '2. Verify API keys in admin secrets are correct',
      '3. Switch users to Coinbase Commerce as fallback',
      '4. Notify affected users via in-app banner',
      '5. Contact Stripe support if outage confirmed',
      '6. Log incident timestamp for audit trail',
      '7. Restore Stripe when operational'
    ],
    escalation: 'If Stripe down >1 hour, activate crypto-only payment mode',
    contactInfo: 'Stripe Support: support.stripe.com'
  },
  {
    id: 'coinbase-down',
    title: 'Coinbase Commerce Failures',
    severity: 'high',
    icon: '🪙',
    steps: [
      '1. Check coinbase.com status for outages',
      '2. Verify Coinbase API key configuration',
      '3. Route users to Stripe credit card payments',
      '4. Disable crypto payment option temporarily',
      '5. Send notification to users',
      '6. Monitor Coinbase status dashboard',
      '7. Re-enable when service restored'
    ],
    escalation: 'Fallback to Stripe only - crypto payments non-essential',
    contactInfo: 'Coinbase Support: help.coinbase.com'
  },
  {
    id: 'db-connection',
    title: 'Database Connection Loss',
    severity: 'critical',
    icon: '🗄️',
    steps: [
      '1. Check database connection string in DATABASE_URL secret',
      '2. Verify Neon database is running (neon.tech dashboard)',
      '3. Check firewall/IP allowlist settings',
      '4. Restart application workflow: "Start application" → Restart',
      '5. Monitor /api/health endpoint for recovery',
      '6. Check server logs for specific error messages',
      '7. If Neon issue, contact support with database ID'
    ],
    escalation: 'If DB down >5min: Enable read-only mode, notify all users',
    contactInfo: 'Neon Support: neon.tech/support'
  },
  {
    id: 'gps-failure',
    title: 'GPS Verification Issues',
    severity: 'medium',
    icon: '📍',
    steps: [
      '1. Check location permissions in mobile app settings',
      '2. Verify geofence radius is 200-300 feet (correct distance)',
      '3. Check worker device GPS is enabled and has signal',
      '4. Ensure job site coordinates are accurate in system',
      '5. Allow manual check-in with supervisor override if needed',
      '6. Log GPS failure with timestamp for worker record',
      '7. Review and adjust geofence if too strict'
    ],
    escalation: 'Allow manual verification if GPS fails 2+ times for same worker',
    contactInfo: 'GPS Service: Verify expo-location library is working'
  },
  {
    id: 'email-delivery',
    title: 'Email Delivery Failures',
    severity: 'high',
    icon: '📧',
    steps: [
      '1. Check SMTP service status (provider dashboard)',
      '2. Verify email credentials in environment secrets',
      '3. Check spam/junk folder if user reports missing emails',
      '4. Test with admin email first to diagnose',
      '5. If SMTP down, activate fallback console logging',
      '6. Queue failed emails for retry (retry logic automatic)',
      '7. Notify users of email delays if outage >30min'
    ],
    escalation: 'Use alternative email provider or queue for manual sending',
    contactInfo: 'SMTP Provider: Check your email service dashboard'
  },
  {
    id: 'assignment-sync',
    title: 'Assignment Not Syncing to Mobile',
    severity: 'high',
    icon: '🔄',
    steps: [
      '1. Check worker internet connection on device',
      '2. Force-close and restart mobile app',
      '3. Verify worker JWT token is valid (check auth status)',
      '4. Check /api/assignments endpoint responding (test via curl)',
      '5. Clear mobile app cache: Settings → Clear App Data',
      '6. Verify assignment exists in database (Admin → view assignments)',
      '7. Re-login worker to refresh token if still failing'
    ],
    escalation: 'Re-create assignment if data corrupted, notify worker',
    contactInfo: 'Tech Support: Mobile sync issues'
  },
  {
    id: 'auth-failure',
    title: 'Worker Cannot Login',
    severity: 'high',
    icon: '🔐',
    steps: [
      '1. Verify email/PIN is correct (check company records)',
      '2. Check if account is suspended/deactivated',
      '3. Reset password/PIN from admin panel',
      '4. Verify worker email is confirmed',
      '5. Clear browser cache and cookies, try again',
      '6. Check /api/health for database connectivity',
      '7. If still failing, check auth token expiration'
    ],
    escalation: 'Create temporary password, email to worker with instructions',
    contactInfo: 'Reset authentication in Admin Dashboard'
  },
  {
    id: 'api-timeout',
    title: 'API Requests Timing Out',
    severity: 'high',
    icon: '⏱️',
    steps: [
      '1. Check server uptime: /api/health endpoint',
      '2. Monitor database latency (check admin health dashboard)',
      '3. Check memory usage: Admin → System Health',
      '4. If memory >80%, restart workflow',
      '5. Disable heavy analytics if causing slowness',
      '6. Reduce query scope (paginate results)',
      '7. If persists, scale database or upgrade server'
    ],
    escalation: 'Restart workflow if latency >2 seconds consistently',
    contactInfo: 'Server Resources: Check system metrics'
  },
  {
    id: 'data-backup',
    title: 'Backup & Disaster Recovery',
    severity: 'critical',
    icon: '💾',
    steps: [
      '1. Enable automated backups in Neon dashboard',
      '2. Schedule daily backups at 2:00 AM UTC',
      '3. Test backup restoration monthly',
      '4. Keep transaction logs for 7+ days',
      '5. Document backup schedule and retention policy',
      '6. In case of data loss: Contact Neon support for point-in-time recovery',
      '7. Restore to a point BEFORE the incident'
    ],
    escalation: 'Data loss: Declare recovery objective, restore from backup',
    contactInfo: 'Neon Backups: neon.tech/docs/manage/backups'
  },
  {
    id: 'payment-stuck',
    title: 'Payment Stuck in Processing',
    severity: 'medium',
    icon: '⏳',
    steps: [
      '1. Check transaction status in Stripe/Coinbase dashboard',
      '2. Verify webhook is receiving updates (check logs)',
      '3. If webhook failed, manually mark as succeeded',
      '4. Check for duplicate processing (idempotency)',
      '5. Issue refund if needed from payment provider',
      '6. Sync payment status back to ORBIT database',
      '7. Notify customer of resolution'
    ],
    escalation: 'If >$5000 stuck: Escalate to payment provider immediately',
    contactInfo: 'Payment Support: Stripe + Coinbase dashboards'
  },
  {
    id: 'worker-no-show',
    title: 'Worker No-Show / GPS Mismatch',
    severity: 'medium',
    icon: '❌',
    steps: [
      '1. Contact worker immediately (call/SMS)',
      '2. If non-responsive, mark as "No-Show" in system',
      '3. Log incident with timestamp and communication attempt',
      '4. Notify client of staffing issue',
      '5. Reassign to backup worker if available',
      '6. Document reason for no-show (sick, quit, GPS issue, etc)',
      '7. Update worker DNR list if pattern emerges'
    ],
    escalation: '3+ no-shows: Move to DNR (Do Not Rehire) list',
    contactInfo: 'Manage from Admin → Do Not Rehire section'
  },
  {
    id: 'payroll-error',
    title: 'Payroll Calculation Error',
    severity: 'high',
    icon: '💰',
    steps: [
      '1. Check timesheet entries for accuracy',
      '2. Verify wage rates are correct in worker profile',
      '3. Check for duplicate time entries',
      '4. Verify overtime rules applied correctly',
      '5. Recalculate payroll manually to verify',
      '6. If error found, void payroll and regenerate',
      '7. Re-run tax calculations if needed'
    ],
    escalation: 'Payroll must be audited before disbursement',
    contactInfo: 'Finance Admin: Review payroll module'
  },
  {
    id: 'security-breach',
    title: 'Security Incident / Unauthorized Access',
    severity: 'critical',
    icon: '🚨',
    steps: [
      '1. IMMEDIATELY revoke compromised API keys',
      '2. Force all users to re-authenticate (session reset)',
      '3. Enable audit logging for all admin actions',
      '4. Check for unauthorized data access (logs)',
      '5. Change all admin credentials',
      '6. Review recent access logs for anomalies',
      '7. Document incident timeline and notify users'
    ],
    escalation: 'Security breach: Notify all affected parties + legal team',
    contactInfo: 'Security Team: security@orbitstaffing.io'
  }
];

export function ContingencyManual() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-900/20 border-red-700/50 text-red-300';
      case 'high':
        return 'bg-orange-900/20 border-orange-700/50 text-orange-300';
      case 'medium':
        return 'bg-yellow-900/20 border-yellow-700/50 text-yellow-300';
      case 'low':
        return 'bg-blue-900/20 border-blue-700/50 text-blue-300';
      default:
        return 'bg-slate-900/20 border-slate-700/50 text-slate-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const filteredRunbooks = filterSeverity === 'all' 
    ? CONTINGENCY_RUNBOOKS 
    : CONTINGENCY_RUNBOOKS.filter(rb => rb.severity === filterSeverity);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Book className="w-6 h-6 text-cyan-400" />
        <div>
          <h2 className="text-2xl font-bold">Contingency Plan Manual</h2>
          <p className="text-sm text-gray-400">Quick-access runbooks for common failures & incidents</p>
        </div>
      </div>

      {/* Severity Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map(severity => (
          <button
            key={severity}
            onClick={() => setFilterSeverity(severity)}
            className={`px-4 py-2 rounded font-medium text-sm transition-all ${
              filterSeverity === severity
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
            }`}
            data-testid={`button-filter-${severity}`}
          >
            {severity === 'all' ? 'All Plans' : severity.charAt(0).toUpperCase() + severity.slice(1)}
          </button>
        ))}
      </div>

      {/* Runbooks */}
      <div className="space-y-3">
        {filteredRunbooks.map((runbook) => (
          <Card key={runbook.id} className={`border-2 cursor-pointer transition-all ${getSeverityColor(runbook.severity)}`}>
            <div
              onClick={() => setExpandedId(expandedId === runbook.id ? null : runbook.id)}
              className="p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-3xl">{runbook.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{runbook.title}</h3>
                      <span className="text-lg">{getSeverityIcon(runbook.severity)}</span>
                      <span className="text-xs font-bold px-2 py-1 bg-slate-700/50 rounded">
                        {runbook.severity.toUpperCase()}
                      </span>
                    </div>
                    {expandedId !== runbook.id && (
                      <p className="text-sm text-gray-400 mt-1">Click to expand runbook...</p>
                    )}
                  </div>
                </div>
                <div className="text-cyan-400">
                  {expandedId === runbook.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === runbook.id && (
                <div className="mt-4 space-y-4 pt-4 border-t border-slate-700/50">
                  {/* Steps */}
                  <div>
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Steps to Resolve
                    </h4>
                    <div className="space-y-1 ml-6">
                      {runbook.steps.map((step, idx) => (
                        <p key={idx} className="text-sm text-gray-300 font-mono">
                          {step}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Escalation */}
                  {runbook.escalation && (
                    <div>
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Escalation Path
                      </h4>
                      <div className="ml-6 p-3 bg-slate-700/30 rounded border border-slate-600/50">
                        <p className="text-sm text-gray-200">{runbook.escalation}</p>
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  {runbook.contactInfo && (
                    <div>
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Support Contact
                      </h4>
                      <div className="ml-6 p-3 bg-slate-700/30 rounded border border-slate-600/50">
                        <p className="text-sm text-gray-200">{runbook.contactInfo}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button
                      className="bg-cyan-600 hover:bg-cyan-700 text-sm"
                      data-testid={`button-runbook-${runbook.id}`}
                    >
                      Mark as Executed
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Footer with Emergency Contact */}
      <Card className="bg-gradient-to-r from-red-900/20 to-transparent border-red-700/50">
        <CardContent className="pt-6">
          <h4 className="font-bold text-red-300 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Emergency Escalation
          </h4>
          <p className="text-sm text-gray-300 mb-3">
            For any incident not covered by these runbooks or requiring immediate attention:
          </p>
          <div className="space-y-1 text-sm">
            <p><span className="font-bold text-red-300">Critical Issues:</span> Contact: support@orbitstaffing.io</p>
            <p><span className="font-bold text-red-300">Security Breach:</span> Notify security@orbitstaffing.io immediately</p>
            <p><span className="font-bold text-red-300">Data Loss:</span> Activate disaster recovery protocol</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
