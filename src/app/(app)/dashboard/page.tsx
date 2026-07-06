"use client";

import { useAuthStore } from "@/store/auth-store";
import { useDataStore } from "@/store/data-store";
import { useDataScope } from "@/hooks/use-data-scope";
import {
  computeDashboardStats,
  computeGroupStatusBreakdown,
  computeBranchWiseCollection,
  computePaymentStatusBreakdown,
  computeRecentPayments,
  computeUpcomingDues,
  collectionTrend,
} from "@/data";
import { HeroCard } from "@/components/dashboard/hero-card";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { CollectionTrendChart } from "@/components/dashboard/collection-trend-chart";
import { GroupStatusChart } from "@/components/dashboard/group-status-chart";
import { BranchCollectionChart } from "@/components/dashboard/branch-collection-chart";
import { PaymentStatusChart } from "@/components/dashboard/payment-status-chart";
import { RecentPaymentsTable } from "@/components/dashboard/recent-payments-table";
import { UpcomingDuesTable } from "@/components/dashboard/upcoming-dues-table";
import { SectionCard } from "@/components/shared/section-card";

export default function DashboardPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { branchId } = useDataScope();
  const isMainAdmin = currentUser?.role === "main_admin";

  const branches = useDataStore((s) => s.branches);
  const customers = useDataStore((s) => s.customers);
  const chitGroups = useDataStore((s) => s.chitGroups);
  const payments = useDataStore((s) => s.payments);

  const stats = computeDashboardStats(branches, customers, chitGroups, payments, { branchId });
  const groupStatus = computeGroupStatusBreakdown(chitGroups, { branchId });
  const branchCollection = computeBranchWiseCollection(branches);
  const paymentStatus = computePaymentStatusBreakdown(payments, { branchId });
  const recentPayments = computeRecentPayments(payments, { branchId }, 6);
  const upcomingDues = computeUpcomingDues(payments, { branchId }, 6);

  return (
    <div>
      <HeroCard name={currentUser?.name ?? "there"} />

      <StatsGrid stats={stats} showBranches={isMainAdmin} />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-3">
        <SectionCard title="Collection Trend" description="Last 6 months, collected vs target" className="lg:col-span-2">
          <CollectionTrendChart data={collectionTrend} />
        </SectionCard>
        <SectionCard title="Group Status" description="Active, completed and pending">
          <GroupStatusChart data={groupStatus} />
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {isMainAdmin && (
          <SectionCard title="Branch-wise Collection" description="Monthly collection by branch">
            <BranchCollectionChart data={branchCollection} />
          </SectionCard>
        )}
        <SectionCard title="Payment Status" description="Amount by installment status" className={isMainAdmin ? "" : "lg:col-span-2"}>
          <PaymentStatusChart data={paymentStatus} />
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard title="Recent Payments" description="Latest installments collected">
          <RecentPaymentsTable payments={recentPayments} />
        </SectionCard>
        <SectionCard title="Upcoming Due Customers" description="Pending and overdue installments">
          <UpcomingDuesTable payments={upcomingDues} />
        </SectionCard>
      </div>
    </div>
  );
}
