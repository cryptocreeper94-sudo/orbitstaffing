/**
 * System Architecture Overview
 * Shows the three-tier admin structure and how they connect
 */
import React from 'react';
import { ArrowRight, Shield, Users, BarChart3 } from 'lucide-react';

export function SystemArchitectureInfo() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">ORBIT System Architecture</h2>

      {/* Three-Tier Structure */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1 */}
        <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-purple-400" />
            <h3 className="font-bold text-lg">Tier 1: Master Admin</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">YOU</p>
          <ul className="text-xs text-gray-300 space-y-2">
            <li>✓ System Control Panel</li>
            <li>✓ System Health Monitoring</li>
            <li>✓ Create & manage admins</li>
            <li>✓ View all analytics</li>
            <li>✓ Configure rules & settings</li>
            <li>✓ Manage franchises & customers</li>
          </ul>
          <div className="mt-4 p-3 bg-purple-900/50 rounded text-xs">
            <p className="font-bold text-purple-300">Access:</p>
            <p>PIN Login → System Control Panel</p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <ArrowRight className="w-6 h-6 mx-auto mb-2" />
            <p className="text-xs">Assign</p>
            <p className="text-xs">Roles</p>
          </div>
        </div>

        {/* Tier 2 */}
        <div className="bg-cyan-900/30 border border-cyan-600 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-6 h-6 text-cyan-400" />
            <h3 className="font-bold text-lg">Tier 2: Assigned Admins</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">Your team members</p>
          <ul className="text-xs text-gray-300 space-y-2">
            <li>✓ Franchise Admin (full access to franchise)</li>
            <li>✓ Customer Admin (full access to customer)</li>
            <li>✓ Staff Admin (hiring & scheduling)</li>
            <li>✓ Finance Admin (billing & payments)</li>
            <li>✓ Operations Admin (assignments)</li>
          </ul>
          <div className="mt-4 p-3 bg-cyan-900/50 rounded text-xs">
            <p className="font-bold text-cyan-300">Access:</p>
            <p>PIN Login → Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Arrow Down */}
      <div className="flex justify-center text-gray-500">
        <div className="text-center">
          <ArrowRight className="w-6 h-6 mx-auto rotate-90 mb-2" />
          <p className="text-xs">Delegate to</p>
        </div>
      </div>

      {/* Tier 3 */}
      <div className="bg-green-900/30 border border-green-600 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-6 h-6 text-green-400" />
          <h3 className="font-bold text-lg">Tier 3: End Users (Franchisees/Customers)</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">Business owners who subscribe to ORBIT</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-bold text-green-300 text-sm mb-2">What They Get:</p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>✓ Main App (front-facing dashboard)</li>
              <li>✓ Worker management system</li>
              <li>✓ Scheduling & assignments</li>
              <li>✓ Payroll & invoicing</li>
              <li>✓ Client management</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-green-300 text-sm mb-2">Configurable By:</p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>✓ Industry type (skilled trades, hospitality, general labor)</li>
              <li>✓ Company size & needs</li>
              <li>✓ Feature set & capabilities</li>
              <li>✓ Their own admin roles</li>
              <li>✓ Custom workflows & rules</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-green-900/50 rounded text-xs space-y-2">
          <p className="font-bold text-green-300">Access & Communication:</p>
          <ul className="space-y-1">
            <li>✓ Login to Main App (their instance)</li>
            <li>✓ Direct messaging with ORBIT</li>
            <li>✓ Feature request submission</li>
            <li>✓ Issue reporting & support</li>
          </ul>
        </div>
      </div>

      {/* Data Isolation */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4">Data Isolation & Security</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>
            <strong>Master Admin (Tier 1):</strong> Can see all system data, all franchises, all customers
          </li>
          <li>
            <strong>Assigned Admins (Tier 2):</strong> Only see data for their assigned franchise/customer. Complete isolation from other franchises/customers.
          </li>
          <li>
            <strong>End Users (Tier 3):</strong> Only see their own company data. Complete isolation from other businesses. No visibility into system administration.
          </li>
        </ul>
      </div>
    </div>
  );
}
