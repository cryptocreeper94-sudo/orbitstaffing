/**
 * Main App - End User Facing Application
 * This is what franchisees and monthly customers see
 * - Fully configurable based on their industry/needs
 - Built-in admin delegation system
 - Direct communication channel with ORBIT
 */
import React, { useState } from 'react';
import { BarChart3, Settings, Users, MessageSquare, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MainAppInfo() {
  const [activeTab, setActiveTab] = useState<'overview' | 'admin-config' | 'features'>('overview');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-green-500 text-green-400'
              : 'border-transparent text-gray-400'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('admin-config')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'admin-config'
              ? 'border-green-500 text-green-400'
              : 'border-transparent text-gray-400'
          }`}
        >
          Admin Configuration
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`px-4 py-2 font-bold border-b-2 transition-all ${
            activeTab === 'features'
              ? 'border-green-500 text-green-400'
              : 'border-transparent text-gray-400'
          }`}
        >
          Configurable Features
        </button>
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-green-400" />
              End User Dashboard (Franchisee/Customer)
            </h2>
            <p className="text-gray-300 mb-4">
              This is the front-facing application your customers see. It's fully configurable based on their industry, company size, and specific needs.
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✓ Dashboard with operational metrics</li>
              <li>✓ Worker management and assignment system</li>
              <li>✓ Client/job management</li>
              <li>✓ Scheduling and real-time updates</li>
              <li>✓ Payroll and billing integration</li>
              <li>✓ Configurable admin roles</li>
              <li>✓ Direct messaging with ORBIT support</li>
            </ul>
          </div>
        </div>
      )}

      {/* Admin Configuration */}
      {activeTab === 'admin-config' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              End User Admin Delegation
            </h3>
            <p className="text-gray-400 mb-4">
              Each business owner can configure their own admin structure within their account:
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• <strong>Owner Admin</strong> - Full control of their company (default role)</li>
              <li>• <strong>Operations Manager</strong> - Scheduling, assignments, dispatch</li>
              <li>• <strong>Finance Manager</strong> - Billing, invoicing, payroll</li>
              <li>• <strong>HR Manager</strong> - Worker management, compliance, DNR</li>
              <li>• <strong>Custom Roles</strong> - Define their own admin roles as needed</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4">Configuration Options</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Settings className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-gray-300">Industry-Specific Settings</p>
                  <p className="text-xs text-gray-500">Different rule sets based on staffing vertical (skilled trades, hospitality, general labor)</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-gray-300">Permission Control</p>
                  <p className="text-xs text-gray-500">Owner defines which features each admin can access</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-gray-300">Communication Hub</p>
                  <p className="text-xs text-gray-500">Built-in messaging system to contact ORBIT support and send feature requests</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Features */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4">Configurable Features by Industry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded p-4">
                <p className="font-bold text-cyan-300 mb-2">Skilled Trades</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>✓ Prevailing wage tracking</li>
                  <li>✓ Certification tracking</li>
                  <li>✓ Tool & equipment checkout</li>
                  <li>✓ Compliance reporting</li>
                </ul>
              </div>
              <div className="bg-slate-800 rounded p-4">
                <p className="font-bold text-green-300 mb-2">Hospitality</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>✓ Shift-based scheduling</li>
                  <li>✓ Event management</li>
                  <li>✓ Uniform tracking</li>
                  <li>✓ Tip/gratuity management</li>
                </ul>
              </div>
              <div className="bg-slate-800 rounded p-4">
                <p className="font-bold text-yellow-300 mb-2">General Labor</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>✓ Quick assignments</li>
                  <li>✓ Daily rate tracking</li>
                  <li>✓ Skill-based matching</li>
                  <li>✓ Bulk hiring tools</li>
                </ul>
              </div>
              <div className="bg-slate-800 rounded p-4">
                <p className="font-bold text-purple-300 mb-2">Custom</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>✓ Feature requests</li>
                  <li>✓ Custom workflows</li>
                  <li>✓ Integration options</li>
                  <li>✓ White-label support</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4">Direct Communication With ORBIT</h3>
            <p className="text-sm text-gray-400 mb-4">
              End users can submit feature requests, report issues, and communicate directly with our team through the built-in messaging system.
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Feature request system with voting & prioritization</li>
              <li>• Real-time issue reporting and tracking</li>
              <li>• Direct support messaging channel</li>
              <li>• Feedback loop for product improvement</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
