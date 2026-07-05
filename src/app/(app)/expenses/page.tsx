"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Wallet, TrendingDown, CalendarDays, Building2, MoreVertical, Receipt, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Toolbar, SearchInput } from "@/components/shared/toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ExpenseFormDialog, type ExpenseFormValues } from "@/components/expenses/expense-form-dialog";
import { useDataStore } from "@/store/data-store";
import { useDataScope } from "@/hooks/use-data-scope";
import { useAuthStore } from "@/store/auth-store";
import { can } from "@/lib/rbac";
import { formatCurrency, formatDate } from "@/lib/format";
import { EXPENSE_CATEGORY_LABELS, EXPENSE_CATEGORY_STYLES } from "@/lib/expense-meta";
import { cn } from "@/lib/utils";
import type { Expense, ExpenseCategory } from "@/types";

const CURRENT_MONTH = "2026-07";

export default function ExpensesPage() {
  const expenses = useDataStore((s) => s.expenses);
  const branches = useDataStore((s) => s.branches);
  const employees = useDataStore((s) => s.employees);
  const addExpense = useDataStore((s) => s.addExpense);
  const updateExpense = useDataStore((s) => s.updateExpense);
  const deleteExpense = useDataStore((s) => s.deleteExpense);

  const currentUser = useAuthStore((s) => s.currentUser);
  const { branchId, employeeId } = useDataScope();
  const canManage = currentUser ? can(currentUser.role, "manageExpenses") : false;

  const [search, setSearch] = React.useState("");
  const [branchFilter, setBranchFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [activeExpense, setActiveExpense] = React.useState<Expense | undefined>(undefined);

  const scoped = branchId ? expenses.filter((e) => e.branchId === branchId) : expenses;

  const filtered = scoped.filter((e) => {
    const matchesSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.paidTo.toLowerCase().includes(search.toLowerCase()) ||
      e.expenseCode.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = branchFilter === "all" || e.branchId === branchFilter;
    const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
    return matchesSearch && matchesBranch && matchesCategory;
  });

  const totalAll = scoped.reduce((s, e) => s + e.amount, 0);
  const monthTotal = scoped.filter((e) => e.date.startsWith(CURRENT_MONTH)).reduce((s, e) => s + e.amount, 0);
  const salaryTotal = scoped.filter((e) => e.category === "salary").reduce((s, e) => s + e.amount, 0);

  // Category breakdown for the summary panel.
  const byCategory = React.useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    for (const e of scoped) map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [scoped]);
  const maxCategory = byCategory[0]?.[1] ?? 0;

  function handleSubmit(values: ExpenseFormValues) {
    if (activeExpense) {
      updateExpense(activeExpense.id, { ...values, billNumber: values.billNumber || undefined, remarks: values.remarks || undefined });
      toast.success("Expense updated.");
    } else {
      const seq = expenses.length + 1;
      const recordedBy = employeeId ?? employees.find((e) => e.branchId === values.branchId)?.id ?? "emp-001";
      addExpense({
        id: `exp-${Date.now()}`,
        expenseCode: `EXP-${String(seq).padStart(4, "0")}`,
        ...values,
        billNumber: values.billNumber || undefined,
        remarks: values.remarks || undefined,
        recordedBy,
      });
      toast.success("Expense recorded.");
    }
    setDialogOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Company Expenses"
        description="Track branch operating costs — rent, salaries, commissions and more."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4" /> Export
            </Button>
            {canManage && (
              <Button
                onClick={() => {
                  setActiveExpense(undefined);
                  setDialogOpen(true);
                }}
                className="bg-maroon hover:bg-maroon-dark"
              >
                <Plus className="h-4 w-4" /> Record Expense
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Expenses" value={formatCurrency(totalAll)} icon={Wallet} hint={`${scoped.length} entries`} />
        <StatCard label="This Month" value={formatCurrency(monthTotal)} icon={CalendarDays} />
        <StatCard label="Salaries" value={formatCurrency(salaryTotal)} icon={TrendingDown} />
        <StatCard label="Branches" value={String(new Set(scoped.map((e) => e.branchId)).size)} icon={Building2} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="xl:col-span-3">
          <Toolbar>
            <SearchInput value={search} onChange={setSearch} placeholder="Search title, payee, code..." />
            <div className="flex gap-2">
              {!branchId && (
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="w-40">
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>
                      {EXPENSE_CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Toolbar>

          {filtered.length === 0 ? (
            <EmptyState icon={Receipt} title="No expenses found" description="Record your first expense or adjust the filters." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    {canManage && <TableHead className="w-10" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((e) => {
                    const branch = branches.find((b) => b.id === e.branchId);
                    return (
                      <TableRow key={e.id}>
                        <TableCell>
                          <p className="font-medium text-foreground">{e.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {e.expenseCode} · {e.paidTo}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className={cn("inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium", EXPENSE_CATEGORY_STYLES[e.category])}>
                            {EXPENSE_CATEGORY_LABELS[e.category]}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{branch?.location ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(e.date, "short")}</TableCell>
                        <TableCell className="text-right font-semibold text-foreground">{formatCurrency(e.amount)}</TableCell>
                        {canManage && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setActiveExpense(e);
                                    setDialogOpen(true);
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    deleteExpense(e.id);
                                    toast.success("Expense deleted.");
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <SectionCard title="By Category" description="Spend breakdown" className="h-fit">
          {byCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data.</p>
          ) : (
            <div className="space-y-3">
              {byCategory.map(([cat, amount]) => (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{EXPENSE_CATEGORY_LABELS[cat]}</span>
                    <span className="text-muted-foreground">{formatCurrency(amount)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-maroon" style={{ width: `${maxCategory ? (amount / maxCategory) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        branches={branches}
        defaultBranchId={branchId ?? branches[0]?.id ?? "br-001"}
        lockBranch={!!branchId}
        expense={activeExpense}
      />
    </div>
  );
}
