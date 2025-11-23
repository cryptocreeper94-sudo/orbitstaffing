/**
 * System Architecture Overview
 * Shows the three-tier admin structure and how they connect
 */
import React from 'react';
import { ArrowRight, Shield, Users, BarChart3 } from 'lucide-react';

export function SystemArchitectureInfo() {
  return (
    <div className="space-y-6">
      <div className="bg-cyan-900/20 border border-cyan-600 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-2">ORBIT White-Label Platform</h2>
        <p className="text-gray-300 text-sm">
          One unified ORBIT platform with three access tiers. All users get the same core technology with different views, permissions, and white-label branding.
        </p>
      </div>

      {/* Three-Tier Structure */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1 */}
        <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-purple-400" />
            <h3 className="font-bold text-lg">Tier 1: YOU</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">Master Admin</p>
          <ul className="text-xs text-gray-300 space-y-2">
            <li>✓ System Control Panel</li>
            <li>✓ Manage all franchises</li>
            <li>✓ Manage all customers</li>
            <li>✓ Create admin roles</li>
            <li>✓ System health & config</li>
            <li>✓ View all analytics</li>
          </ul>
          <div className="mt-4 p-3 bg-purple-900/50 rounded text-xs">
            <p className="font-bold text-purple-300">Access:</p>
            <p>PIN → System Control Panel</p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <ArrowRight className="w-6 h-6 mx-auto mb-2" />
            <p className="text-xs font-bold">Delegate</p>
            <p className="text-xs">Roles</p>
          </div>
        </div>

        {/* Tier 2 */}
        <div className="bg-cyan-900/30 border border-cyan-600 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-6 h-6 text-cyan-400" />
            <h3 className="font-bold text-lg">Tier 2: Your Team</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">Assigned Admins</p>
          <ul className="text-xs text-gray-300 space-y-2">
            <li>✓ Franchise Admin</li>
            <li>✓ Customer Admin</li>
            <li>✓ Staff Admin</li>
            <li>✓ Finance Admin</li>
            <li>✓ Operations Admin</li>
          </ul>
          <div className="mt-4 p-3 bg-cyan-900/50 rounded text-xs">
            <p className="font-bold text-cyan-300">Access:</p>
            <p>PIN → Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Arrow Down */}
      <div className="flex justify-center text-gray-500">
        <div className="text-center">
          <ArrowRight className="w-6 h-6 mx-auto rotate-90 mb-2" />
          <p className="text-xs font-bold">Sell to</p>
        </div>
      </div>

      {/* Tier 3 - THE KEY */}
      <div className="bg-green-900/30 border border-green-600 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-6 h-6 text-green-400" />
          <h3 className="font-bold text-lg">Tier 3: Franchisees/Customers</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          <strong>ORBIT Main App with White-Label Branding</strong>
        </p>
        
        {/* Branding Examples */}
        <div className="bg-slate-800 rounded-lg p-4 mb-4 border-l-4 border-green-500">
          <p className="font-bold text-green-300 text-sm mb-2">White-Label Examples:</p>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• "Superior Staffing powered by ORBIT"</li>
            <li>• Their logo, colors, domain</li>
            <li>• But the same ORBIT technology & features</li>
            <li>• Configured for their industry & needs</li>
          </ul>
        </div>

        {/* What They Get */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-bold text-green-300 text-sm mb-2">ORBIT Features:</p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>✓ Worker management</li>
              <li>✓ Client management</li>
              <li>✓ Real-time scheduling</li>
              <li>✓ GPS clock-in/out</li>
              <li>✓ Payroll & invoicing</li>
              <li>✓ Collections system</li>
              <li>✓ Mobile apps</li>
              <li>✓ Compliance tools</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-green-300 text-sm mb-2">Their Admin Setup:</p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>✓ Assign team members to roles</li>
              <li>✓ Control WHO gets WHAT access</li>
              <li>✓ Owner, Manager, Finance, etc.</li>
              <li>✓ (We define the available roles)</li>
              <li>✓ Based on their industry</li>
              <li>✓ Based on their billing tier</li>
              <li>✓ Based on their business needs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* The Key Message */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4 text-cyan-300">Why This Works</h3>
        <ul className="space-y-3 text-sm text-gray-300">
          <li>
            <strong>✓ One Product:</strong> You're not selling multiple products - ORBIT is ORBIT. All three tiers use the same codebase, same features, same quality.
          </li>
          <li>
            <strong>✓ One Brand:</strong> Franchisees are white-label resellers of ORBIT. They brand it, we run it. "Superior Staffing powered by ORBIT" - ORBIT quality, their brand.
          </li>
          <li>
            <strong>✓ Configurable, Not Different:</strong> The same ORBIT app adapts to their needs via settings, not by being a different product.
          </li>
          <li>
            <strong>✓ Complete Data Isolation:</strong> All three tiers exist on the same infrastructure with rock-solid multi-tenant isolation at database level.
          </li>
        </ul>
      </div>
    </div>
  );
}
