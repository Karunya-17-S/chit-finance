"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileDown, FileSpreadsheet, Printer } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDataStore } from "@/store/data-store";
import { useDataScope } from "@/hooks/use-data-scope";
import { reportDefinitions, currentMonth, collectionTrend } from "@/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ReportType } from "@/types";

export default function ReportsPage() {
  const branches = useDataStore((s) => s.branches);
  const employees = useDataStore((s) => s.employees);
  const customers = useDataStore((s) => s.customers);
  const chitGroups = useDataStore((s) => s.chitGroups);
  const payments = useDataStore((s) => s.payments);
  const { branchId } = useDataScope();

  const [activeType, setActiveType] = React.useState<ReportType>("branch_collection");
  const [branchFilter, setBranchFilter] = React.useState("all");
  const [fromDate, setFromDate] = React.useState("2026-06-01");
  const [toDate, setToDate] = React.useState("2026-07-02");

  const activeReport = reportDefinitions.find((r) => r.type === activeType)!;
  const effectiveBranchId = branchId ?? (branchFilter !== "all" ? branchFilter : undefined);

  function exportPlaceholder(kind: "PDF" | "Excel") {
    toast.info(`Exporting as ${kind} is not wired up in this preview — hook this button up to your export service.`);
  }

  const scopedBranches = effectiveBranchId ? branches.filter((b) => b.id === effectiveBranchId) : branches;
  const scopedEmployees = effectiveBranchId ? employees.filter((e) => e.branchId === effectiveBranchId) : employees;
  const scopedCustomers = effectiveBranchId ? customers.filter((c) => c.branchId === effectiveBranchId) : customers;
  const scopedGroups = effectiveBranchId ? chitGroups.filter((g) => g.branchId === effectiveBranchId) : chitGroups;
  const scopedPayments = effectiveBranchId ? payments.filter((p) => p.branchId === effectiveBranchId) : payments;

  return (
    <div>
      <PageHeader title="Reports" description="Generate operational and financial reports across the company." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="space-y-2 lg:col-span-1">
          {reportDefinitions.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveType(r.type)}
              className={cn(
                "w-full rounded-xl border px-3.5 py-3 text-left text-sm transition",
                activeType === r.type
                  ? "border-gold bg-maroon/5 font-semibold text-maroon"
                  : "border-border bg-card text-foreground hover:border-gold/50"
              )}
            >
              {r.title}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <SectionCard
            title={activeReport.title}
            description={activeReport.description}
            actions={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => exportPlaceholder("PDF")}>
                  <FileDown className="h-3.5 w-3.5" /> PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportPlaceholder("Excel")}>
                  <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
              </div>
            }
          >
            <div className="mb-4 flex flex-wrap items-end gap-3 border-b border-border pb-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">From</Label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-40" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">To</Label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-40" />
              </div>
              {!branchId && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Branch</Label>
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="All Branches" />
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
                </div>
              )}
            </div>

            {activeType === "branch_collection" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    <TableHead>Customers</TableHead>
                    <TableHead>Active Groups</TableHead>
                    <TableHead>Monthly Collection</TableHead>
                    <TableHead>Pending Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scopedBranches.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium text-foreground">{b.name}</TableCell>
                      <TableCell className="text-muted-foreground">{b.totalCustomers}</TableCell>
                      <TableCell className="text-muted-foreground">{b.activeChitGroups}</TableCell>
                      <TableCell className="font-medium text-foreground">{formatCurrency(b.monthlyCollection)}</TableCell>
                      <TableCell className="font-medium text-destructive">{formatCurrency(b.pendingAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeType === "employee_collection" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Achieved</TableHead>
                    <TableHead>Attainment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scopedEmployees
                    .filter((e) => e.role === "collection_employee")
                    .map((e) => {
                      const branch = branches.find((b) => b.id === e.branchId);
                      const attainment = e.collectionTarget > 0 ? Math.round((e.collectionAchieved / e.collectionTarget) * 100) : 0;
                      return (
                        <TableRow key={e.id}>
                          <TableCell className="font-medium text-foreground">{e.name}</TableCell>
                          <TableCell className="text-muted-foreground">{branch?.location ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{formatCurrency(e.collectionTarget)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatCurrency(e.collectionAchieved)}</TableCell>
                          <TableCell className={cn("font-semibold", attainment >= 90 ? "text-success" : attainment >= 70 ? "text-warning" : "text-destructive")}>
                            {attainment}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}

            {activeType === "customer_outstanding" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Outstanding Amount</TableHead>
                    <TableHead>Installments Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scopedCustomers
                    .map((c) => {
                      const due = scopedPayments.filter((p) => p.customerId === c.id && (p.status === "pending" || p.status === "overdue"));
                      const outstanding = due.reduce((sum, p) => sum + (p.dueAmount - p.paidAmount), 0);
                      return { customer: c, outstanding, count: due.length };
                    })
                    .filter((r) => r.outstanding > 0)
                    .sort((a, b) => b.outstanding - a.outstanding)
                    .map((r) => {
                      const branch = branches.find((b) => b.id === r.customer.branchId);
                      return (
                        <TableRow key={r.customer.id}>
                          <TableCell className="font-medium text-foreground">{r.customer.name}</TableCell>
                          <TableCell className="text-muted-foreground">{branch?.location ?? "—"}</TableCell>
                          <TableCell className="font-semibold text-destructive">{formatCurrency(r.outstanding)}</TableCell>
                          <TableCell className="text-muted-foreground">{r.count}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}

            {activeType === "chit_group_performance" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Fill Rate</TableHead>
                    <TableHead>Chit Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scopedGroups.map((g) => {
                    const branch = branches.find((b) => b.id === g.branchId);
                    return (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium text-foreground">{g.groupName}</TableCell>
                        <TableCell className="text-muted-foreground">{branch?.location ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {g.currentMembers}/{g.totalMembers} ({Math.round((g.currentMembers / g.totalMembers) * 100)}%)
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatCurrency(g.chitValue)}</TableCell>
                        <TableCell>
                          <StatusBadge status={g.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {activeType === "monthly_collection" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Collected</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Achievement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collectionTrend.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell className="font-medium text-foreground">{row.month}</TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(row.collected)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(row.target)}</TableCell>
                      <TableCell className="font-semibold text-foreground">{Math.round((row.collected / row.target) * 100)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeType === "pending_payments" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Due Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scopedPayments
                    .filter((p) => p.status === "pending" || p.status === "partial")
                    .map((p) => {
                      const customer = customers.find((c) => c.id === p.customerId);
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium text-foreground">{customer?.name ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{p.month}</TableCell>
                          <TableCell className="font-semibold text-warning">{formatCurrency(p.dueAmount - p.paidAmount)}</TableCell>
                          <TableCell>
                            <StatusBadge status={p.status} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}

            {activeType === "overdue" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Overdue Amount</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scopedPayments
                    .filter((p) => p.status === "overdue")
                    .map((p) => {
                      const customer = customers.find((c) => c.id === p.customerId);
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium text-foreground">{customer?.name ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{p.month}</TableCell>
                          <TableCell className="font-semibold text-destructive">{formatCurrency(p.dueAmount - p.paidAmount)}</TableCell>
                          <TableCell className="max-w-xs truncate text-muted-foreground">{p.remarks ?? "—"}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}

            {activeType === "completed_groups" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Chit Value</TableHead>
                    <TableHead>Completed On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scopedGroups
                    .filter((g) => g.status === "completed")
                    .map((g) => {
                      const branch = branches.find((b) => b.id === g.branchId);
                      return (
                        <TableRow key={g.id}>
                          <TableCell className="font-medium text-foreground">{g.groupName}</TableCell>
                          <TableCell className="text-muted-foreground">{branch?.location ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{formatCurrency(g.chitValue)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(g.endDate)}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}

            {activeType === "profit_commission" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Chit Value</TableHead>
                    <TableHead>Commission %</TableHead>
                    <TableHead>Commission Earned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scopedGroups.map((g) => {
                    const branch = branches.find((b) => b.id === g.branchId);
                    return (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium text-foreground">{g.groupName}</TableCell>
                        <TableCell className="text-muted-foreground">{branch?.location ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{formatCurrency(g.chitValue)}</TableCell>
                        <TableCell className="text-muted-foreground">{g.commissionPercentage}%</TableCell>
                        <TableCell className="font-semibold text-success">{formatCurrency(g.foremanCommission)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            <p className="mt-4 text-[11px] text-muted-foreground">
              Showing data for {currentMonth} · Generated {formatDate("2026-07-02", "long")}
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
