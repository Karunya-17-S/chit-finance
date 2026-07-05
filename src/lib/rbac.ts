import type { UserRole } from "@/types";

export const ROLE_LABELS: Record<UserRole, string> = {
  main_admin: "Main Admin",
  branch_admin: "Branch Admin",
  collection_employee: "Collection Employee",
  accountant: "Accountant",
  viewer: "Viewer",
};

interface Permissions {
  manageBranches: boolean;
  manageEmployees: boolean;
  manageCustomers: boolean;
  manageChitGroups: boolean;
  recordPayments: boolean;
  manageTemplates: boolean;
  viewReports: boolean;
  manageExpenses: boolean;
  manageSettings: boolean;
  readOnly: boolean;
}

const PERMISSIONS: Record<UserRole, Permissions> = {
  main_admin: {
    manageBranches: true,
    manageEmployees: true,
    manageCustomers: true,
    manageChitGroups: true,
    recordPayments: true,
    manageTemplates: true,
    viewReports: true,
    manageExpenses: true,
    manageSettings: true,
    readOnly: false,
  },
  branch_admin: {
    manageBranches: false,
    manageEmployees: true,
    manageCustomers: true,
    manageChitGroups: true,
    recordPayments: true,
    manageTemplates: true,
    viewReports: true,
    manageExpenses: true,
    manageSettings: false,
    readOnly: false,
  },
  collection_employee: {
    manageBranches: false,
    manageEmployees: false,
    manageCustomers: false,
    manageChitGroups: false,
    recordPayments: true,
    manageTemplates: false,
    viewReports: false,
    manageExpenses: false,
    manageSettings: false,
    readOnly: false,
  },
  accountant: {
    manageBranches: false,
    manageEmployees: false,
    manageCustomers: false,
    manageChitGroups: false,
    recordPayments: true,
    manageTemplates: false,
    viewReports: true,
    manageExpenses: true,
    manageSettings: false,
    readOnly: false,
  },
  viewer: {
    manageBranches: false,
    manageEmployees: false,
    manageCustomers: false,
    manageChitGroups: false,
    recordPayments: false,
    manageTemplates: false,
    viewReports: true,
    manageExpenses: false,
    manageSettings: false,
    readOnly: true,
  },
};

export function can(role: UserRole, permission: keyof Permissions): boolean {
  return PERMISSIONS[role][permission];
}

export const PERMISSION_LABELS: Record<keyof Permissions, string> = {
  manageBranches: "Manage Branches",
  manageEmployees: "Manage Employees",
  manageCustomers: "Manage Customers",
  manageChitGroups: "Manage Chit Groups",
  recordPayments: "Record Payments",
  manageTemplates: "Manage Templates",
  viewReports: "View Reports",
  manageExpenses: "Manage Expenses",
  manageSettings: "Manage Settings",
  readOnly: "Read Only",
};

export const ALL_ROLES: UserRole[] = ["main_admin", "branch_admin", "collection_employee", "accountant", "viewer"];

export function getPermissionMatrix() {
  return PERMISSIONS;
}

export function isReadOnly(role: UserRole): boolean {
  return PERMISSIONS[role].readOnly;
}
