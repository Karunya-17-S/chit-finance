import type { UserRole } from "@/types";
import {
  LayoutDashboard,
  Building2,
  Users,
  Radar,
  Contact,
  Layers,
  MessageSquareText,
  Wallet,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

const ALL_ROLES: UserRole[] = ["main_admin", "branch_admin", "collection_employee", "accountant", "viewer"];

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ALL_ROLES },
  { href: "/branches", label: "Branches", icon: Building2, roles: ["main_admin"] },
  { href: "/employees", label: "Employees", icon: Users, roles: ["main_admin", "branch_admin"] },
  { href: "/tracking", label: "Tracking", icon: Radar, roles: ["main_admin", "branch_admin", "collection_employee"] },
  { href: "/customers", label: "Customers", icon: Contact, roles: ["main_admin", "branch_admin", "collection_employee", "accountant", "viewer"] },
  { href: "/chit-groups", label: "Chit Groups", icon: Layers, roles: ["main_admin", "branch_admin", "accountant", "viewer"] },
  { href: "/templates", label: "Templates", icon: MessageSquareText, roles: ["main_admin", "branch_admin"] },
  { href: "/payments", label: "Payments", icon: Wallet, roles: ["main_admin", "branch_admin", "collection_employee", "accountant", "viewer"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["main_admin", "branch_admin", "accountant", "viewer"] },
];

export const SETTINGS_NAV_ITEM: NavItem = {
  href: "/settings",
  label: "Settings",
  icon: Settings,
  roles: ["main_admin"],
};

export function navItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
