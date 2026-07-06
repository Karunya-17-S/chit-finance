"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { AppShell } from "@/components/layout/app-shell";
import { Logo } from "@/components/brand/logo";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const currentUser = useAuthStore((s) => s.currentUser);

  React.useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) {
      router.replace("/login");
    } else if (currentUser.role === "customer") {
      // Customers use the self-service portal, not the admin console.
      router.replace("/portal");
    }
  }, [hasHydrated, currentUser, router]);

  if (!hasHydrated || !currentUser || currentUser.role === "customer") {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-cream">
        <Logo size="lg" variant="light" />
        <p className="text-sm text-muted-foreground">Loading your workspace...</p>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
