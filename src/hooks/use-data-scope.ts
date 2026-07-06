"use client";

import { useAuthStore } from "@/store/auth-store";
import { useDataStore } from "@/store/data-store";

/**
 * Returns the branch/employee scope the current user is restricted to.
 * `branchId` is undefined (unrestricted) for the Main Admin, otherwise it's the
 * user's own branch. `employeeId` resolves the logged-in User account to its
 * matching Employee record (User and Employee are separate ID namespaces —
 * login accounts vs. staff records — linked here by email) so collection
 * employees only see customers/payments assigned to them.
 */
export function useDataScope() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const employees = useDataStore((s) => s.employees);
  const branchId = currentUser && currentUser.role !== "main_admin" ? currentUser.branchId ?? undefined : undefined;
  const employeeId = currentUser
    ? employees.find((e) => e.email.toLowerCase() === currentUser.email.toLowerCase())?.id
    : undefined;
  return { currentUser, branchId, employeeId };
}
