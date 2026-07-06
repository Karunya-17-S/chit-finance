"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Landmark, BookUser } from "lucide-react";
import { toast } from "sonner";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";
import { useAuthStore, landingPathForRole } from "@/store/auth-store";
import { firebaseAuth } from "@/lib/firebase-client";
import type { User } from "@/types";

type LoginMode = "staff" | "customer";

export default function LoginPage() {
  const router = useRouter();
  const loginWithUser = useAuthStore((s) => s.loginWithUser);
  const loginAsCustomer = useAuthStore((s) => s.loginAsCustomer);
  const loginByPassbookOrPhone = useAuthStore((s) => s.loginByPassbookOrPhone);
  const [mode, setMode] = React.useState<LoginMode>("staff");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passbook, setPassbook] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      // 1. Verify the password against Firebase Auth.
      await signInWithEmailAndPassword(firebaseAuth, email, password);

      // 2. Resolve the matching app user (role/branch) from Postgres.
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Login failed.");
        return;
      }

      const user = data.user as User;
      loginWithUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      router.push(landingPathForRole(user.role));
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        toast.error("Incorrect email or password.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleCustomerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passbook) {
      toast.error("Enter your passbook number or registered mobile number.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const user = loginByPassbookOrPhone(passbook);
      setLoading(false);
      if (!user) {
        toast.error("No customer found for that passbook / mobile number.");
        return;
      }
      toast.success(`Welcome, ${user.name}!`);
      router.push("/portal");
    }, 400);
  }

  function handleCustomerDemo() {
    // Sample customer with an active chit and payment history.
    const user = loginAsCustomer("cust-001");
    if (!user) return;
    toast.success(`Signed in as ${user.name} (customer)`);
    router.push("/portal");
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
          <div className="mb-6 hidden lg:block">
            <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "staff" ? "Enter your credentials to access the admin console." : "Sign in to view your passbook and payment status."}
            </p>
          </div>

          {/* Staff / Customer toggle */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
            {(["staff", "customer"] as LoginMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={
                  "rounded-lg px-3 py-2 text-sm font-medium transition " +
                  (mode === m ? "bg-card text-maroon shadow-sm" : "text-muted-foreground hover:text-foreground")
                }
              >
                {m === "staff" ? "Staff / Admin" : "Customer"}
              </button>
            ))}
          </div>

          {mode === "staff" ? (
            <>
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
            </>
          ) : (
            <>
              <form onSubmit={handleCustomerSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="passbook">Passbook Number or Mobile</Label>
                  <Input
                    id="passbook"
                    placeholder="SVCF-PB-001 or 90441 10011"
                    value={passbook}
                    onChange={(e) => setPassbook(e.target.value)}
                    autoComplete="off"
                  />
                  <p className="text-xs text-muted-foreground">Find your passbook number on the front of your chit passbook.</p>
                </div>
                <Button type="submit" className="w-full bg-maroon hover:bg-maroon-dark" disabled={loading}>
                  {loading ? "Signing in..." : "View My Passbook"}
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or try a demo customer</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <button
                type="button"
                onClick={handleCustomerDemo}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-center transition hover:border-gold hover:bg-secondary"
              >
                <BookUser className="h-5 w-5 text-maroon" />
                <span className="text-sm font-medium text-foreground">Demo Customer (Ramesh Chandran)</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}