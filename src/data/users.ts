import type { User } from "@/types";

export const users: User[] = [
  {
    id: "user-001",
    name: "System Admin",
    email: "admin@shreevaarichits.in",
    phone: "+91 90000 00001",
    role: "main_admin",
    branchId: null,
    status: "active",
  },
  {
    id: "user-002",
    name: "Karthik Subramaniam",
    email: "karthik.s@shreevaarichits.in",
    phone: "+91 98400 12345",
    role: "branch_admin",
    branchId: "br-001",
    status: "active",
  },
  {
    id: "user-003",
    name: "Divya Ramesh",
    email: "divya.ramesh@shreevaarichits.in",
    phone: "+91 90031 22456",
    role: "collection_employee",
    branchId: "br-001",
    status: "active",
  },
  {
    id: "user-004",
    name: "Priya Venkatesan",
    email: "priya.v@shreevaarichits.in",
    phone: "+91 90032 87901",
    role: "accountant",
    branchId: "br-001",
    status: "active",
  },
  {
    id: "user-005",
    name: "Guest Viewer",
    email: "viewer@shreevaarichits.in",
    phone: "+91 90000 00005",
    role: "viewer",
    branchId: null,
    status: "active",
  },
];

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getUserByRole(role: User["role"]): User | undefined {
  return users.find((u) => u.role === role);
}
