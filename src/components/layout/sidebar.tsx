"use client";

import { cn } from "@/lib/utils";
import { SidebarContent } from "@/components/layout/sidebar-content";
import { useUIStore } from "@/store/ui-store";

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 border-r border-sidebar-border transition-[width] duration-200 lg:block",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <SidebarContent collapsed={collapsed} onToggleCollapse={toggleSidebar} />
    </aside>
  );
}
