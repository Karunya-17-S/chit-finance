import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Customer, User } from "@/types";
import { users } from "@/data/users";
import { customers } from "@/data/customers";

// Build a synthetic login User for a customer, linked back to their record.
function userFromCustomer(customer: Customer): User {
  return {
    id: `cu-${customer.id}`,
    name: customer.name,
    email: customer.phone,
    phone: customer.phone,
    role: "customer",
    branchId: customer.branchId,
    customerId: customer.id,
    status: customer.status,
  };
}

interface AuthState {
  currentUser: User | null;
  hasHydrated: boolean;
  login: (userId: string) => User | null;
  loginWithEmail: (email: string) => User | null;
  loginAsCustomer: (customerId: string) => User | null;
  // Customer self-service login by passbook number or phone.
  loginByPassbookOrPhone: (identifier: string) => User | null;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      hasHydrated: false,
      login: (userId: string) => {
        const user = users.find((u) => u.id === userId) ?? null;
        set({ currentUser: user });
        return user;
      },
      loginWithEmail: (email: string) => {
        const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
        set({ currentUser: user });
        return user;
      },
      loginAsCustomer: (customerId: string) => {
        const customer = customers.find((c) => c.id === customerId);
        const user = customer ? userFromCustomer(customer) : null;
        set({ currentUser: user });
        return user;
      },
      loginByPassbookOrPhone: (identifier: string) => {
        const q = identifier.trim().toLowerCase();
        const digits = q.replace(/\D/g, "");
        const customer = customers.find((c) => {
          if (c.passbookNumber.toLowerCase() === q) return true;
          if (digits.length >= 6 && c.phone.replace(/\D/g, "").endsWith(digits)) return true;
          return false;
        });
        const user = customer ? userFromCustomer(customer) : null;
        set({ currentUser: user });
        return user;
      },
      logout: () => set({ currentUser: null }),
      setHasHydrated: (v: boolean) => set({ hasHydrated: v }),
    }),
    {
      name: "svcf-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function landingPathForRole(role: User["role"]): string {
  switch (role) {
    case "customer":
      return "/portal";
    case "collection_employee":
      return "/tracking";
    case "accountant":
      return "/payments";
    default:
      return "/dashboard";
  }
}
