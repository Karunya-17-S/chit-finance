"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Landmark, ShieldCheck, UserCog, Wallet, Users2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";
import { useAuthStore, landingPathForRole } from "@/store/auth-store";
import { getUserByRole } from "@/data/users";
import type { UserRole } from "@/types";

const DEMO_LOGINS: { role: UserRole; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { role: "main_admin", label: "Main Admin", icon: ShieldCheck },
  { role: "branch_admin", label: "Branch Admin", icon: UserCog },
  { role: "collection_employee", label: "Collection Employee", icon: Users2 },
  { role: "accountant", label: "Accountant", icon: Wallet },
];

export default function LoginPage() {
  const router = useRouter();
  const loginWithEmail = useAuthStore((s) => s.loginWithEmail);
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email/mobile and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const user = loginWithEmail(email);
      setLoading(false);
      if (!user) {
        toast.error("No account found. Try one of the demo logins below.");
        return;
      }
      toast.success(`Welcome back, ${user.name}!`);
      router.push(landingPathForRole(user.role));
    }, 400);
  }

  function handleDemoLogin(role: UserRole) {
    const user = getUserByRole(role);
    if (!user) return;
    login(user.id);
    toast.success(`Signed in as ${user.name} (${role.replace("_", " ")})`);
    router.push(landingPathForRole(user.role));
  }

  return (
    <div className="flex min-h-screen w-full bg-cream">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-maroon-darker via-maroon to-maroon-dark p-12 text-white lg:flex">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/3 translate-y-1/3 rounded-full bg-gold/10 blur-3xl" />
        <Logo size="lg" variant="dark" />
        <div className="relative z-10 space-y-4">
          <Landmark className="h-10 w-10 text-gold" strokeWidth={1.5} />
          <h1 className="text-3xl font-bold leading-tight">
            Multi-branch Chit Finance,
            <br />
            managed from one console.
          </h1>
          <p className="max-w-md text-sm text-white/70">
            Track branches, chit groups, collections and dues in real time. Built for
            Main Admins, Branch Managers, Collection staff and Accountants alike.
          </p>
        </div>
        <p className="relative z-10 text-xs text-white/50">
          &copy; 2026 Shree Vaari Chit Finance. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-4 text-center lg:hidden">
            <Logo size="lg" variant="light" withText={false} />
            <div>
              <h1 className="text-xl font-bold text-maroon">Shree Vaari Chit Finance</h1>
              <p className="text-xs text-muted-foreground">Admin Console</p>
            </div>
          </div>
          <div className="mb-8 hidden lg:block">
            <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your credentials to access the admin console.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email or Mobile Number</Label>
              <Input
                id="email"
                placeholder="admin@shreevaarichits.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-maroon hover:bg-maroon-dark" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or continue with a demo account</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {DEMO_LOGINS.map(({ role, label, icon: Icon }) => (
              <button
                key={role}
                type="button"
                onClick={() => handleDemoLogin(role)}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-3 text-center transition hover:border-gold hover:bg-secondary"
              >
                <Icon className="h-5 w-5 text-maroon" />
                <span className="text-xs font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
