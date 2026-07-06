// Central mock data-service layer.
// Pure aggregation helpers below take arrays as arguments so they work whether
// the array comes from the static seed or a live Zustand store (and later, Supabase).

import { branches, getBranchById } from "@/data/branches";
import { employees, getEmployeeById, getEmployeesByBranch } from "@/data/employees";
import { customers, getCustomerById, getCustomersByBranch, getCustomersByEmployee } from "@/data/customers";
import { chitGroups, getChitGroupById, getChitGroupsByBranch } from "@/data/chit-groups";
import { chitMembers, getMembersByGroup, getGroupsByCustomer } from "@/data/chit-members";
import { payments, getPaymentsByBranch, getPaymentsByChitGroup, getPaymentsByCustomer, getPaymentsByEmployee, currentMonth } from "@/data/payments";
import { auctions, getAuctionsByGroup } from "@/data/auctions";
import { templates, getTemplateById } from "@/data/templates";
import { followUps, getFollowUpsByBranch, getFollowUpsByCustomer, getFollowUpsByEmployee } from "@/data/followups";
import { users, getUserById, getUserByRole } from "@/data/users";
import { reportDefinitions } from "@/data/reports";
import { collectionTrend } from "@/data/trends";
import { locationPings, getPingsByEmployee, getLatestPings } from "@/data/locations";
import { chitPlans, getChitPlanById } from "@/data/chit-plans";
import { expenses, getExpensesByBranch } from "@/data/expenses";
import { attendance, getAttendanceByEmployee, getAttendanceByDate, ATTENDANCE_TODAY } from "@/data/attendance";
import type { Branch, ChitGroup, Customer, Payment } from "@/types";

export {
  branches,
  getBranchById,
  employees,
  getEmployeeById,
  getEmployeesByBranch,
  customers,
  getCustomerById,
  getCustomersByBranch,
  getCustomersByEmployee,
  chitGroups,
  getChitGroupById,
  getChitGroupsByBranch,
  chitMembers,
  getMembersByGroup,
  getGroupsByCustomer,
  payments,
  getPaymentsByBranch,
  getPaymentsByChitGroup,
  getPaymentsByCustomer,
  getPaymentsByEmployee,
  auctions,
  getAuctionsByGroup,
  templates,
  getTemplateById,
  followUps,
  getFollowUpsByBranch,
  getFollowUpsByCustomer,
  getFollowUpsByEmployee,
  users,
  getUserById,
  getUserByRole,
  reportDefinitions,
  collectionTrend,
  currentMonth,
  locationPings,
  getPingsByEmployee,
  getLatestPings,
  chitPlans,
  getChitPlanById,
  expenses,
  getExpensesByBranch,
  attendance,
  getAttendanceByEmployee,
  getAttendanceByDate,
  ATTENDANCE_TODAY,
};

export interface DataScope {
  branchId?: string | null;
}

export interface DashboardStats {
  activeGroups: number;
  totalCustomers: number;
  pendingPayments: number;
  thisMonthCollection: number;
  totalBranches: number;
  todayCollection: number;
  overdueAmount: number;
  completedGroups: number;
}

const TODAY = "2026-07-02";

function scopedByBranch<T extends { branchId: string }>(items: T[], scope?: DataScope): T[] {
  if (!scope?.branchId) return items;
  return items.filter((i) => i.branchId === scope.branchId);
}

export function computeDashboardStats(
  allBranches: Branch[],
  allCustomers: Customer[],
  allChitGroups: ChitGroup[],
  allPayments: Payment[],
  scope?: DataScope
): DashboardStats {
  const scopedGroups = scopedByBranch(allChitGroups, scope);
  const scopedCustomers = scopedByBranch(allCustomers, scope);
  const scopedPayments = scopedByBranch(allPayments, scope);
  const scopedBranches = scope?.branchId ? allBranches.filter((b) => b.id === scope.branchId) : allBranches;

  const thisMonthCollection = scopedPayments
    .filter((p) => p.month === currentMonth)
    .reduce((sum, p) => sum + p.paidAmount, 0);

  const todayCollection = scopedPayments
    .filter((p) => p.paymentDate === TODAY)
    .reduce((sum, p) => sum + p.paidAmount, 0);

  const overdueAmount = scopedPayments
    .filter((p) => p.status === "overdue")
    .reduce((sum, p) => sum + (p.dueAmount - p.paidAmount), 0);

  const pendingPayments = scopedPayments.filter((p) => p.status === "pending" || p.status === "partial").length;

  return {
    activeGroups: scopedGroups.filter((g) => g.status === "active").length,
    totalCustomers: scopedCustomers.filter((c) => c.status === "active").length,
    pendingPayments,
    thisMonthCollection,
    totalBranches: scopedBranches.length,
    todayCollection,
    overdueAmount,
    completedGroups: scopedGroups.filter((g) => g.status === "completed").length,
  };
}

export function computeGroupStatusBreakdown(allChitGroups: ChitGroup[], scope?: DataScope) {
  const scopedGroups = scopedByBranch(allChitGroups, scope);
  return [
    { status: "Active", count: scopedGroups.filter((g) => g.status === "active").length },
    { status: "Completed", count: scopedGroups.filter((g) => g.status === "completed").length },
    { status: "Pending", count: scopedGroups.filter((g) => g.status === "pending").length },
  ];
}

export function computeBranchWiseCollection(allBranches: Branch[]) {
  return allBranches.map((b) => ({ branch: b.location, collection: b.monthlyCollection }));
}

export function computePaymentStatusBreakdown(allPayments: Payment[], scope?: DataScope) {
  const scopedPayments = scopedByBranch(allPayments, scope);
  const statuses: Array<{ status: string; count: number; amount: number }> = [
    { status: "Paid", count: 0, amount: 0 },
    { status: "Partial", count: 0, amount: 0 },
    { status: "Pending", count: 0, amount: 0 },
    { status: "Overdue", count: 0, amount: 0 },
  ];
  const idxByStatus: Record<string, number> = { paid: 0, partial: 1, pending: 2, overdue: 3 };
  for (const p of scopedPayments) {
    const idx = idxByStatus[p.status];
    statuses[idx].count += 1;
    statuses[idx].amount += p.paidAmount || p.dueAmount;
  }
  return statuses;
}

export function computeRecentPayments(allPayments: Payment[], scope?: DataScope, limit = 8) {
  return scopedByBranch(allPayments, scope)
    .filter((p) => p.paymentDate)
    .sort((a, b) => (b.paymentDate ?? "").localeCompare(a.paymentDate ?? ""))
    .slice(0, limit);
}

export function computeUpcomingDues(allPayments: Payment[], scope?: DataScope, limit = 8) {
  return scopedByBranch(allPayments, scope)
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .sort((a, b) => `${a.month}-05`.localeCompare(`${b.month}-05`))
    .slice(0, limit);
}
