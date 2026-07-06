"use client";

import * as React from "react";
import { BookMarked, Wallet, AlertCircle, Layers, CalendarClock, Receipt, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useDataStore } from "@/store/data-store";
import { getGroupsByCustomer } from "@/data";
import { StatusBadge } from "@/components/shared/status-badge";
import { SectionCard } from "@/components/shared/section-card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate, formatMonthLabel, FREQUENCY_LABELS } from "@/lib/format";

export default function PortalHomePage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const customers = useDataStore((s) => s.customers);
  const chitGroups = useDataStore((s) => s.chitGroups);
  const branches = useDataStore((s) => s.branches);
  const payments = useDataStore((s) => s.payments);

  const customer = customers.find((c) => c.id === currentUser?.customerId);
  if (!customer) return null;

  const branch = branches.find((b) => b.id === customer.branchId);
  const memberships = getGroupsByCustomer(customer.id);
  const myGroups = memberships
    .map((m) => ({ membership: m, group: chitGroups.find((g) => g.id === m.chitGroupId) }))
    .filter((x) => x.group);
  const activeChits = myGroups.filter((x) => x.group!.status === "active").length;

  const myPayments = payments
    .filter((p) => p.customerId === customer.id)
    .sort((a, b) => (b.month + (b.paymentDate ?? "")).localeCompare(a.month + (a.paymentDate ?? "")));

  const totalPaid = myPayments.reduce((s, p) => s + p.paidAmount, 0);
  const outstanding = myPayments
    .filter((p) => p.status === "pending" || p.status === "partial" || p.status === "overdue")
    .reduce((s, p) => s + Math.max(p.dueAmount - p.paidAmount, 0), 0);
  const nextDue = myPayments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .sort((a, b) => a.month.localeCompare(b.month))[0];

  return (
    <div className="space-y-5">
      {/* Passbook hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-maroon-darker via-maroon to-maroon-dark p-6 text-white shadow-md">
        <div className="absolute -top-16 -right-10 h-52 w-52 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-gold">
            <BookMarked className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Digital Passbook</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold">Namaste, {customer.name.split(" ")[0]} 🙏</h1>
          <p className="mt-1 text-sm text-white/70">Here&apos;s your chit savings summary and payment status.</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/50">Passbook No.</p>
              <p className="font-semibold">{customer.passbookNumber}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/50">Customer ID</p>
              <p className="font-semibold">{customer.customerCode}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/50">Branch</p>
              <p className="font-semibold">{branch?.location ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard icon={Wallet} label="Total Paid" value={formatCurrency(totalPaid)} tone="success" />
        <SummaryCard icon={AlertCircle} label="Outstanding" value={formatCurrency(outstanding)} tone={outstanding > 0 ? "danger" : "muted"} />
        <SummaryCard icon={Layers} label="Active Chits" value={String(activeChits)} tone="maroon" />
        <SummaryCard
          icon={CalendarClock}
          label="Next Due"
          value={nextDue ? formatMonthLabel(nextDue.month) : "None"}
          tone={nextDue ? "warning" : "muted"}
        />
      </div>

      {/* Chit memberships */}
      <SectionCard title="My Chit Plans" description="The chit groups you are enrolled in">
        {myGroups.length === 0 ? (
          <EmptyState icon={Layers} title="No chit plans yet" description="You are not enrolled in any chit group." />
        ) : (
          <div className="space-y-3">
            {myGroups.map(({ membership, group }) => {
              const thisMonthPay = myPayments.find((p) => p.chitGroupId === group!.id);
              return (
                <div key={membership.id} className="rounded-xl border border-border bg-secondary/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{group!.groupName}</p>
                      <p className="text-xs text-muted-foreground">
                        Agreement {membership.agreementNo} · {group!.groupCode} · {FREQUENCY_LABELS[group!.collectionFrequency]}
                      </p>
                    </div>
                    <StatusBadge status={group!.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <Field label="Chit Value" value={formatCurrency(group!.chitValue)} />
                    <Field label="Installment" value={formatCurrency(group!.monthlyInstallment)} />
                    <Field label="Prize" value={membership.hasWon ? `Won · month ${membership.wonMonth}` : "Not yet"} />
                    <Field
                      label="Latest Payment"
                      value={thisMonthPay ? <StatusBadge status={thisMonthPay.status} /> : <span className="text-muted-foreground">—</span>}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Payment history */}
      <SectionCard title="Payment History" description="Every collection recorded against your passbook">
        {myPayments.length === 0 ? (
          <EmptyState icon={Receipt} title="No payments yet" description="Your payment history will appear here." />
        ) : (
          <div className="divide-y divide-border">
            {myPayments.map((p) => {
              const group = chitGroups.find((g) => g.id === p.chitGroupId);
              const paid = p.status === "paid";
              return (
                <div key={p.id} className="flex items-center gap-3 py-3">
                  <span
                    className={
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full " +
                      (paid ? "bg-success/15 text-success" : "bg-warning/15 text-warning")
                    }
                  >
                    {paid ? <CheckCircle2 className="h-4.5 w-4.5" /> : <CalendarClock className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {group?.groupName ?? "—"} · {formatMonthLabel(p.month)}
                      {p.paymentCategory === "deposit" && <span className="ml-1 text-xs text-gold">(Deposit)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.paymentDate ? `Paid ${formatDate(p.paymentDate, "short")}` : "Not paid yet"}
                      {p.receiptNumber ? ` · Receipt ${p.receiptNumber}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(p.paidAmount)}</p>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <p className="pb-2 text-center text-xs text-muted-foreground">
        Shree Vaari Chit Finance · For queries contact your branch: {branch?.phone ?? "—"}
      </p>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "success" | "danger" | "warning" | "maroon" | "muted";
}) {
  const toneClass = {
    success: "text-success",
    danger: "text-destructive",
    warning: "text-warning",
    maroon: "text-maroon",
    muted: "text-muted-foreground",
  }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <Icon className={"h-5 w-5 " + toneClass} />
      <p className="mt-2 text-lg font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-0.5 font-medium text-foreground">{value}</div>
    </div>
  );
}
