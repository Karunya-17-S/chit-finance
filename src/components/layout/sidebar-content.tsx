"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NAV_ITEMS, SETTINGS_NAV_ITEM, navItemsForRole } from "@/components/layout/nav-items";
import { useAuthStore } from "@/store/auth-store";
import { ROLE_LABELS } from "@/lib/rbac";
import { initials } from "@/lib/format";
import { useRouter } from "next/navigation";

interface SidebarContentProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

export function SidebarContent({ collapsed = false, onToggleCollapse, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const items = currentUser ? navItemsForRole(currentUser.role) : NAV_ITEMS;
  const showSettings = currentUser ? SETTINGS_NAV_ITEM.roles.includes(currentUser.role) : false;

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo / brand header */}
      <div className={cn("flex items-center gap-2 border-b border-sidebar-border px-4 py-5", collapsed && "justify-center px-2")}>
        {collapsed ? (
          <Logo size="md" variant="dark" withText={false} />
        ) : (
          <Logo size="md" variant="dark" />
        )}
        {!collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto rounded-lg p-1.5 text-sidebar-foreground/60 transition hover:bg-sidebar-accent hover:text-white"
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="mx-auto mt-3 rounded-lg p-1.5 text-sidebar-foreground/60 transition hover:bg-sidebar-accent hover:text-white"
          aria-label="Expand sidebar"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      )}

      {/* Nav */}
      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const active = isActive(item.href);
          const link = (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0 py-2.5",
                active
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full bg-gold" style={{ width: 3 }} />
              )}
              <item.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-gold" : "")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }
          return link;
        })}

        {showSettings && (
          <>
            <div className="my-3 h-px bg-sidebar-border" />
            {(() => {
              const active = isActive(SETTINGS_NAV_ITEM.href);
              const link = (
                <Link
                  href={SETTINGS_NAV_ITEM.href}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    collapsed && "justify-center px-0 py-2.5",
                    active
                      ? "bg-sidebar-accent text-white"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full bg-gold" style={{ width: 3 }} />
                  )}
                  <SETTINGS_NAV_ITEM.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-gold" : "")} />
                  {!collapsed && <span className="truncate">{SETTINGS_NAV_ITEM.label}</span>}
                </Link>
              );
              return collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{SETTINGS_NAV_ITEM.label}</TooltipContent>
                </Tooltip>
              ) : (
                link
              );
            })()}
          </>
        )}
      </nav>

      {/* User profile footer */}
      {currentUser && (
        <div className={cn("border-t border-sidebar-border p-3", collapsed && "px-2")}>
          <div className={cn("flex items-center gap-2.5 rounded-xl bg-sidebar-accent/50 p-2.5", collapsed && "flex-col")}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-semibold text-maroon-darker">
              {initials(currentUser.name)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{currentUser.name}</p>
                <p className="truncate text-xs text-sidebar-foreground/60">{ROLE_LABELS[currentUser.role]}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="shrink-0 rounded-lg p-1.5 text-sidebar-foreground/60 transition hover:bg-sidebar-accent hover:text-white"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
