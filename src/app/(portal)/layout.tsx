"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthStore, landingPathForRole } from "@/store/auth-store";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/format";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  React.useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) {
      router.replace("/login");
    } else if (currentUser.role !== "customer") {
      // Staff accounts belong in the admin console, not the customer portal.
      router.replace(landingPathForRole(currentUser.role));
    }
  }, [hasHydrated, currentUser, router]);

  if (!hasHydrated || !currentUser || currentUser.role !== "customer") {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-cream">
        <Logo size="lg" variant="light" />
        <p className="text-sm text-muted-foreground">Loading your passbook...</p>
      </div>
    );
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Logo size="sm" variant="light" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon text-xs font-semibold text-white">
                {initials(currentUser.name)}
              </span>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight text-foreground">{currentUser.name}</p>
                <p className="text-[11px] leading-tight text-muted-foreground">Customer</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
