/**
 * Admin Management
 * For Master Admin - Create and manage other admins with role-based permissions
 */
import React, { useState } from 'react';
import { Users, Plus, Trash2, Shield, Mail, Lock, ToggleRight, ToggleLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'franchise_admin' | 'customer_admin' | 'staff_admin' | 'finance_admin' | 'operations_admin';
  isActive: boolean;
  createdAt: string;
}

const ADMIN_ROLES = [
  {
    value: 'franchise_admin',
    label: 'Franchise Admin',
    description: 'Full access to franchise data, workers, clients, and financials',
  },
  {
    value: 'customer_admin',
    label: 'Customer Admin',
    description: 'Access to their company data, workers, clients, and billing',
  },
  {
    value: 'staff_admin',
    label: 'Staff Admin',
    description: 'Worker and client management, assignments and scheduling',
  },
  {
    value: 'finance_admin',
    label: 'Finance Admin',
    description: 'Financial operations, billing, collections, and payments',
  },
  {
    value: 'operations_admin',
    label: 'Operations Admin',
    description: 'Scheduling, assignments, and operational dashboard only',
  },
];

export function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: 'admin-001',
      name: 'John Manager',
      email: 'john@superior-staffing.com',
      role: 'franchise_admin',
      isActive: true,
      createdAt: '2025-01-15',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'franchise_admin' as const,
  });

  const handleAddAdmin = () => {
    if (formData.name && formData.email) {
      const newAdmin: Admin = {
        id: `admin-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setAdmins([...admins, newAdmin]);
      setFormData({ name: '', email: '', role: 'franchise_admin' });
      setShowForm(false);
    }
  };

  const toggleAdminStatus = (id: string) => {
    setAdmins(admins.map(admin =>
      admin.id === id ? { ...admin, isActive: !admin.isActive } : admin
    ));
  };

  const deleteAdmin = (id: string) => {
    setAdmins(admins.filter(admin => admin.id !== id));
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      franchise_admin: 'bg-purple-900/20 border-purple-700 text-purple-300',
      customer_admin: 'bg-blue-900/20 border-blue-700 text-blue-300',
      staff_admin: 'bg-green-900/20 border-green-700 text-green-300',
      finance_admin: 'bg-yellow-900/20 border-yellow-700 text-yellow-300',
      operations_admin: 'bg-cyan-900/20 border-cyan-700 text-cyan-300',
    };
    return colors[role] || 'bg-slate-900/20 border-slate-700 text-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Admin Management
          </h2>
          <p className="text-gray-400 text-sm mt-1">Create and manage delegated admin roles</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-cyan-600 hover:bg-cyan-700 flex items-center gap-2"
          data-testid="button-add-admin"
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </Button>
      </div>

      {/* Add Admin Form */}
      {showForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4">Create New Admin</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Admin name"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                data-testid="input-admin-name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@example.com"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                data-testid="input-admin-email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Admin Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                data-testid="select-admin-role"
              >
                {ADMIN_ROLES.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-2">
                {ADMIN_ROLES.find(r => r.value === formData.role)?.description}
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                className="bg-gray-600 hover:bg-gray-700"
                onClick={() => setShowForm(false)}
                data-testid="button-cancel-admin"
              >
                Cancel
              </Button>
              <Button
                className="bg-cyan-600 hover:bg-cyan-700"
                onClick={handleAddAdmin}
                data-testid="button-create-admin"
              >
                Create Admin
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Roles Reference */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          Available Admin Roles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ADMIN_ROLES.map(role => (
            <div key={role.value} className={`border rounded-lg p-4 ${getRoleColor(role.value)}`}>
              <p className="font-bold">{role.label}</p>
              <p className="text-xs mt-2 opacity-80">{role.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Admin List */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg">Active Admins ({admins.length})</h3>
        {admins.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No admins created yet</p>
        ) : (
          admins.map(admin => (
            <div
              key={admin.id}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center justify-between"
              data-testid={`admin-item-${admin.id}`}
            >
              <div className="flex-1">
                <p className="font-bold text-white">{admin.name}</p>
                <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                  <Mail className="w-3 h-3" />
                  {admin.email}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded border ${getRoleColor(admin.role)}`}>
                    {ADMIN_ROLES.find(r => r.value === admin.role)?.label}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${admin.isActive ? 'bg-green-900/20 text-green-300' : 'bg-red-900/20 text-red-300'}`}>
                    {admin.isActive ? '✓ Active' : '✗ Inactive'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => toggleAdminStatus(admin.id)}
                  className={`${admin.isActive ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                  data-testid={`button-toggle-admin-${admin.id}`}
                >
                  {admin.isActive ? (
                    <ToggleRight className="w-4 h-4" />
                  ) : (
                    <ToggleLeft className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={() => deleteAdmin(admin.id)}
                  className="bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-600/50"
                  data-testid={`button-delete-admin-${admin.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Permissions Matrix Info */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <p className="text-xs text-gray-400">
          💡 <strong>Master Admin</strong> has full system access. All other admin roles have specific permissions restricted to protect system integrity and data isolation.
        </p>
      </div>
    </div>
  );
}
