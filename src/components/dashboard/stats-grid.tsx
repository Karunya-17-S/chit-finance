import {
  Layers,
  Users,
  Hourglass,
  Wallet,
  Building2,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrencyCompact } from "@/lib/format";
import type { DashboardStats } from "@/data";

export function StatsGrid({ stats, showBranches = true }: { stats: DashboardStats; showBranches?: boolean }) {
  const cards = [
    { label: "Active Groups", value: String(stats.activeGroups), icon: Layers },
    { label: "Total Customers", value: String(stats.totalCustomers), icon: Users },
    { label: "Pending Payments", value: String(stats.pendingPayments), icon: Hourglass },
    { label: "This Month Collection", value: formatCurrencyCompact(stats.thisMonthCollection), icon: Wallet },
    ...(showBranches ? [{ label: "Total Branches", value: String(stats.totalBranches), icon: Building2 }] : []),
    { label: "Today Collection", value: formatCurrencyCompact(stats.todayCollection), icon: CalendarCheck },
    { label: "Overdue Amount", value: formatCurrencyCompact(stats.overdueAmount), icon: AlertTriangle },
    { label: "Completed Groups", value: String(stats.completedGroups), icon: CheckCircle2 },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      {cards.map((c) => (
        <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} />
      ))}
    </div>
  );
}
