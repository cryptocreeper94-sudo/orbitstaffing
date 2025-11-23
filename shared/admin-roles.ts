/**
 * Admin Role & Permission System
 * Defines what each admin role can access and modify
 */

export type AdminRole = 'master_admin' | 'franchise_admin' | 'customer_admin' | 'staff_admin' | 'finance_admin' | 'operations_admin';

export interface AdminPermissions {
  // System Control Panel Access
  canAccessSystemPanel: boolean;
  canViewSystemHealth: boolean;
  canViewAPIs: boolean;
  
  // Admin Management
  canCreateAdmins: boolean;
  canDeleteAdmins: boolean;
  canEditAdminRoles: boolean;
  
  // Franchise Management
  canCreateFranchises: boolean;
  canEditFranchises: boolean;
  canDeleteFranchises: boolean;
  canViewFranchises: boolean;
  
  // Customer Management
  canCreateCustomers: boolean;
  canEditCustomers: boolean;
  canDeleteCustomers: boolean;
  canViewCustomers: boolean;
  
  // Worker Management
  canCreateWorkers: boolean;
  canEditWorkers: boolean;
  canDeleteWorkers: boolean;
  canViewWorkers: boolean;
  
  // Client Management
  canCreateClients: boolean;
  canEditClients: boolean;
  canDeleteClients: boolean;
  canViewClients: boolean;
  
  // Financial
  canViewFinance: boolean;
  canEditPayments: boolean;
  canViewBilling: boolean;
  canEditBilling: boolean;
  
  // Collections & Compliance
  canManageCollections: boolean;
  canManageDNR: boolean;
  canViewAuditLogs: boolean;
  
  // Assignments & Operations
  canManageAssignments: boolean;
  canManageScheduling: boolean;
  canViewDashboard: boolean;
}

export const ADMIN_ROLE_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  // Master Admin - Full Access
  master_admin: {
    canAccessSystemPanel: true,
    canViewSystemHealth: true,
    canViewAPIs: true,
    canCreateAdmins: true,
    canDeleteAdmins: true,
    canEditAdminRoles: true,
    canCreateFranchises: true,
    canEditFranchises: true,
    canDeleteFranchises: true,
    canViewFranchises: true,
    canCreateCustomers: true,
    canEditCustomers: true,
    canDeleteCustomers: true,
    canViewCustomers: true,
    canCreateWorkers: true,
    canEditWorkers: true,
    canDeleteWorkers: true,
    canViewWorkers: true,
    canCreateClients: true,
    canEditClients: true,
    canDeleteClients: true,
    canViewClients: true,
    canViewFinance: true,
    canEditPayments: true,
    canViewBilling: true,
    canEditBilling: true,
    canManageCollections: true,
    canManageDNR: true,
    canViewAuditLogs: true,
    canManageAssignments: true,
    canManageScheduling: true,
    canViewDashboard: true,
  },

  // Franchise Admin - Full access to their franchise
  franchise_admin: {
    canAccessSystemPanel: false,
    canViewSystemHealth: false,
    canViewAPIs: false,
    canCreateAdmins: true,
    canDeleteAdmins: false,
    canEditAdminRoles: false,
    canCreateFranchises: false,
    canEditFranchises: false,
    canDeleteFranchises: false,
    canViewFranchises: true,
    canCreateCustomers: true,
    canEditCustomers: true,
    canDeleteCustomers: false,
    canViewCustomers: true,
    canCreateWorkers: true,
    canEditWorkers: true,
    canDeleteWorkers: true,
    canViewWorkers: true,
    canCreateClients: true,
    canEditClients: true,
    canDeleteClients: true,
    canViewClients: true,
    canViewFinance: true,
    canEditPayments: true,
    canViewBilling: true,
    canEditBilling: true,
    canManageCollections: true,
    canManageDNR: true,
    canViewAuditLogs: true,
    canManageAssignments: true,
    canManageScheduling: true,
    canViewDashboard: true,
  },

  // Customer Admin - Full access to their company
  customer_admin: {
    canAccessSystemPanel: false,
    canViewSystemHealth: false,
    canViewAPIs: false,
    canCreateAdmins: true,
    canDeleteAdmins: false,
    canEditAdminRoles: false,
    canCreateFranchises: false,
    canEditFranchises: false,
    canDeleteFranchises: false,
    canViewFranchises: false,
    canCreateCustomers: false,
    canEditCustomers: false,
    canDeleteCustomers: false,
    canViewCustomers: false,
    canCreateWorkers: true,
    canEditWorkers: true,
    canDeleteWorkers: true,
    canViewWorkers: true,
    canCreateClients: true,
    canEditClients: true,
    canDeleteClients: true,
    canViewClients: true,
    canViewFinance: true,
    canEditPayments: true,
    canViewBilling: true,
    canEditBilling: false,
    canManageCollections: true,
    canManageDNR: true,
    canViewAuditLogs: true,
    canManageAssignments: true,
    canManageScheduling: true,
    canViewDashboard: true,
  },

  // Staff Admin - Limited staff management
  staff_admin: {
    canAccessSystemPanel: false,
    canViewSystemHealth: false,
    canViewAPIs: false,
    canCreateAdmins: false,
    canDeleteAdmins: false,
    canEditAdminRoles: false,
    canCreateFranchises: false,
    canEditFranchises: false,
    canDeleteFranchises: false,
    canViewFranchises: false,
    canCreateCustomers: false,
    canEditCustomers: false,
    canDeleteCustomers: false,
    canViewCustomers: false,
    canCreateWorkers: true,
    canEditWorkers: true,
    canDeleteWorkers: false,
    canViewWorkers: true,
    canCreateClients: true,
    canEditClients: true,
    canDeleteClients: false,
    canViewClients: true,
    canViewFinance: false,
    canEditPayments: false,
    canViewBilling: false,
    canEditBilling: false,
    canManageCollections: false,
    canManageDNR: false,
    canViewAuditLogs: false,
    canManageAssignments: true,
    canManageScheduling: true,
    canViewDashboard: true,
  },

  // Finance Admin - Financial operations only
  finance_admin: {
    canAccessSystemPanel: false,
    canViewSystemHealth: false,
    canViewAPIs: false,
    canCreateAdmins: false,
    canDeleteAdmins: false,
    canEditAdminRoles: false,
    canCreateFranchises: false,
    canEditFranchises: false,
    canDeleteFranchises: false,
    canViewFranchises: false,
    canCreateCustomers: false,
    canEditCustomers: false,
    canDeleteCustomers: false,
    canViewCustomers: false,
    canCreateWorkers: false,
    canEditWorkers: false,
    canDeleteWorkers: false,
    canViewWorkers: true,
    canCreateClients: false,
    canEditClients: false,
    canDeleteClients: false,
    canViewClients: true,
    canViewFinance: true,
    canEditPayments: true,
    canViewBilling: true,
    canEditBilling: true,
    canManageCollections: true,
    canManageDNR: false,
    canViewAuditLogs: true,
    canManageAssignments: false,
    canManageScheduling: false,
    canViewDashboard: true,
  },

  // Operations Admin - Scheduling & assignments
  operations_admin: {
    canAccessSystemPanel: false,
    canViewSystemHealth: false,
    canViewAPIs: false,
    canCreateAdmins: false,
    canDeleteAdmins: false,
    canEditAdminRoles: false,
    canCreateFranchises: false,
    canEditFranchises: false,
    canDeleteFranchises: false,
    canViewFranchises: false,
    canCreateCustomers: false,
    canEditCustomers: false,
    canDeleteCustomers: false,
    canViewCustomers: false,
    canCreateWorkers: false,
    canEditWorkers: false,
    canDeleteWorkers: false,
    canViewWorkers: true,
    canCreateClients: false,
    canEditClients: false,
    canDeleteClients: false,
    canViewClients: true,
    canViewFinance: false,
    canEditPayments: false,
    canViewBilling: false,
    canEditBilling: false,
    canManageCollections: false,
    canManageDNR: false,
    canViewAuditLogs: false,
    canManageAssignments: true,
    canManageScheduling: true,
    canViewDashboard: true,
  },
};

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermissions;
  parentOrgId?: string; // null for master, franchise_id for franchise admins, company_id for customer admins
  createdAt: Date;
  isActive: boolean;
}
