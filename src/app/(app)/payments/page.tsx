"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Wallet, Download, Receipt as ReceiptIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Toolbar, SearchInput } from "@/components/shared/toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentFormDialog, type PaymentFormValues } from "@/components/payments/payment-form-dialog";
import { ReceiptDialog } from "@/components/payments/receipt-dialog";
import { useDataStore } from "@/store/data-store";
import { useDataScope } from "@/hooks/use-data-scope";
import { useAuthStore } from "@/store/auth-store";
import { can } from "@/lib/rbac";
import { formatCurrency } from "@/lib/format";
import { currentMonth } from "@/data";
import type { Payment } from "@/types";
import { Hourglass, AlertTriangle, CalendarCheck } from "lucide-react";

const TODAY = "2026-07-02";

export default function PaymentsPage() {
  const payments = useDataStore((s) => s.payments);
  const customers = useDataStore((s) => s.customers);
  const branches = useDataStore((s) => s.branches);
  const chitGroups = useDataStore((s) => s.chitGroups);
  const employees = useDataStore((s) => s.employees);
  const addPayment = useDataStore((s) => s.addPayment);

  const currentUser = useAuthStore((s) => s.currentUser);
  const { branchId, employeeId } = useDataScope();
  const canRecord = currentUser ? can(currentUser.role, "recordPayments") : false;

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [branchFilter, setBranchFilter] = React.useState("all");
  const [employeeFilter, setEmployeeFilter] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [receiptPayment, setReceiptPayment] = React.useState<Payment | undefined>(undefined);

  let scopedPayments = branchId ? payments.filter((p) => p.branchId === branchId) : payments;
  if (currentUser?.role === "collection_employee") {
    scopedPayments = scopedPayments.filter((p) => {
      const customer = customers.find((c) => c.id === p.customerId);
      return customer?.assignedEmployeeId === employeeId;
    });
  }

  const filtered = scopedPayments.filter((p) => {
    const customer = customers.find((c) => c.id === p.customerId);
    const matchesSearch =
      !search ||
      customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      p.paymentCode.toLowerCase().includes(search.toLowerCase()) ||
      p.receiptNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesBranch = branchFilter === "all" || p.branchId === branchFilter;
    const matchesEmployee = employeeFilter === "all" || p.collectedBy === employeeFilter;
    return matchesSearch && matchesStatus && matchesBranch && matchesEmployee;
  });

  // TODAY (2026-07-02, Thursday) — week runs Monday 2026-06-29 to Sunday 2026-07-05.
  const WEEK_START = "2026-06-29";
  const WEEK_END = "2026-07-05";
  const todayPayments = scopedPayments.filter((p) => p.paymentDate === TODAY);
  const todayTotal = todayPayments.reduce((s, p) => s + p.paidAmount, 0);
  const weekTotal = scopedPayments
    .filter((p) => p.paymentDate && p.paymentDate >= WEEK_START && p.paymentDate <= WEEK_END)
    .reduce((s, p) => s + p.paidAmount, 0);
  const monthTotal = scopedPayments.filter((p) => p.month === currentMonth).reduce((s, p) => s + p.paidAmount, 0);
  const pendingCount = scopedPayments.filter((p) => p.status === "pending").length;
  const overdueTotal = scopedPayments.filter((p) => p.status === "overdue").reduce((s, p) => s + (p.dueAmount - p.paidAmount), 0);
  const depositTotal = scopedPayments.filter((p) => p.paymentCategory === "deposit").reduce((s, p) => s + p.paidAmount, 0);

  function handleSubmit(values: PaymentFormValues) {
    const group = chitGroups.find((g) => g.id === values.chitGroupId);
    if (!group) return;
    const isDeposit = values.paymentCategory === "deposit";
    const status: Payment["status"] = isDeposit
      ? "paid"
      : values.paidAmount >= values.dueAmount
        ? "paid"
        : values.paidAmount > 0
          ? "partial"
          : "pending";
    const seq = payments.length + 1;
    addPayment({
      id: `pay-${String(seq).padStart(4, "0")}`,
      paymentCode: `PMT-${String(seq).padStart(4, "0")}`,
      customerId: values.customerId,
      branchId: group.branchId,
      chitGroupId: values.chitGroupId,
      month: values.month,
      dueAmount: isDeposit ? 0 : values.dueAmount,
      paidAmount: values.paidAmount,
      paymentDate: values.paidAmount > 0 ? TODAY : null,
      paymentMode: values.paidAmount > 0 ? values.paymentMode : null,
      paymentCategory: values.paymentCategory,
      receiptNumber: values.paidAmount > 0 ? `RCT-${values.month.replace("-", "")}-${String(seq).padStart(4, "0")}` : null,
      billNumber: values.paidAmount > 0 ? String(300 + seq) : null,
      collectedBy: values.paidAmount > 0 ? group.collectionEmployeeId : null,
      status,
      remarks: values.remarks || undefined,
    });
    toast.success(isDeposit ? "Deposit recorded successfully." : "Payment recorded successfully.");
    setDialogOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Track installment collections, dues and overdue accounts."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4" /> Export
            </Button>
            {canRecord && (
              <Button onClick={() => setDialogOpen(true)} className="bg-maroon hover:bg-maroon-dark">
                <Plus className="h-4 w-4" /> Record Payment
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Today Collection" value={formatCurrency(todayTotal)} icon={CalendarCheck} hint={`${todayPayments.length} transactions`} />
        <StatCard label="This Week Collection" value={formatCurrency(weekTotal)} icon={CalendarCheck} />
        <StatCard label="This Month Collection" value={formatCurrency(monthTotal)} icon={Wallet} />
        <StatCard label="Deposits Collected" value={formatCurrency(depositTotal)} icon={Wallet} />
        <StatCard label="Pending Installments" value={String(pendingCount)} icon={Hourglass} />
        <StatCard label="Overdue Amount" value={formatCurrency(overdueTotal)} icon={AlertTriangle} />
      </div>

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by customer, payment ID or receipt no..." />
        <div className="flex flex-wrap gap-2">
          {!branchId && (
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees
                .filter((e) => e.role === "collection_employee")
                .map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Toolbar>

      {filtered.length === 0 ? (
        <EmptyState icon={Wallet} title="No payments found" description="Try adjusting your search or filters." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Chit Group</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const customer = customers.find((c) => c.id === p.customerId);
                const group = chitGroups.find((g) => g.id === p.chitGroupId);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{p.paymentCode}</p>
                      {p.paymentCategory === "deposit" && (
                        <span className="mt-0.5 inline-block rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-maroon">
                          Deposit
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{customer?.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{group?.groupName ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{p.month}</TableCell>
                    <TableCell className="text-muted-foreground">{formatCurrency(p.dueAmount)}</TableCell>
                    <TableCell className="font-medium text-foreground">{formatCurrency(p.paidAmount)}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{p.paymentMode?.replace("_", " ") ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {p.receiptNumber ? (
                        <Button variant="ghost" size="sm" onClick={() => setReceiptPayment(p)}>
                          <ReceiptIcon className="h-3.5 w-3.5" /> View
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <PaymentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customers={branchId ? customers.filter((c) => c.branchId === branchId) : customers}
        chitGroups={chitGroups}
        onSubmit={handleSubmit}
      />

      <ReceiptDialog
        open={!!receiptPayment}
        onOpenChange={(v) => !v && setReceiptPayment(undefined)}
        payment={receiptPayment}
        customer={customers.find((c) => c.id === receiptPayment?.customerId)}
        branch={branches.find((b) => b.id === receiptPayment?.branchId)}
        chitGroup={chitGroups.find((g) => g.id === receiptPayment?.chitGroupId)}
        collectedByName={employees.find((e) => e.id === receiptPayment?.collectedBy)?.name}
      />
    </div>
  );
}
