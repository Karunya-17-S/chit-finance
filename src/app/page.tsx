"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, landingPathForRole } from "@/store/auth-store";
import { Logo } from "@/components/brand/logo";

export default function Home() {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const currentUser = useAuthStore((s) => s.currentUser);

  React.useEffect(() => {
    if (!hasHydrated) return;
    router.replace(currentUser ? landingPathForRole(currentUser.role) : "/login");
  }, [hasHydrated, currentUser, router]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-cream">
      <Logo size="lg" variant="light" />
      <p className="text-sm text-muted-foreground">Loading your workspace...</p>
    </div>
  );
}
