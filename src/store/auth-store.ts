import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { users } from "@/data/users";

interface AuthState {
  currentUser: User | null;
  hasHydrated: boolean;
  login: (userId: string) => User | null;
  loginWithEmail: (email: string) => User | null;
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
    case "collection_employee":
      return "/tracking";
    case "accountant":
      return "/payments";
    default:
      return "/dashboard";
  }
}
