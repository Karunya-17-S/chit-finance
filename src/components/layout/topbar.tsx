"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, ChevronDown, LogOut, Settings as SettingsIcon, CalendarDays } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarContent } from "@/components/layout/sidebar-content";
import { useAuthStore } from "@/store/auth-store";
import { ROLE_LABELS } from "@/lib/rbac";
import { initials, formatDate } from "@/lib/format";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  branches: "Branches",
  employees: "Employees",
  tracking: "Tracking",
  customers: "Customers",
  "chit-groups": "Chit Groups",
  templates: "Templates",
  payments: "Payments",
  reports: "Reports",
  settings: "Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const segment = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  const title = PAGE_TITLES[segment] ?? "Dashboard";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur-sm lg:px-6">
      {/* Mobile menu trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 border-r-0 bg-sidebar p-0 [&>button]:hidden">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <h1 className="text-lg font-bold text-foreground lg:text-xl">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground sm:flex">
          <CalendarDays className="h-3.5 w-3.5 text-gold" />
          {formatDate("2026-07-02", "long")}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle dark mode"
        >
          <Sun className="h-[18px] w-[18px] scale-100 dark:scale-0" />
          <Moon className="absolute h-[18px] w-[18px] scale-0 dark:scale-100" />
        </Button>

        {currentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border border-border bg-secondary py-1 pl-1 pr-2 transition hover:border-gold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon text-xs font-semibold text-white">
                  {initials(currentUser.name)}
                </span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-xs font-semibold text-foreground">{currentUser.name}</span>
                  <span className="block text-[10px] text-muted-foreground">{ROLE_LABELS[currentUser.role]}</span>
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="text-sm font-semibold">{currentUser.name}</p>
                <p className="text-xs font-normal text-muted-foreground">{currentUser.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {currentUser.role === "main_admin" && (
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <SettingsIcon className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleLogout} variant="destructive">
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
