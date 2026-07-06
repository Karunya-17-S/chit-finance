"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Radar, MessageSquarePlus, Hourglass, AlertTriangle, CalendarClock, Smartphone } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Toolbar, SearchInput } from "@/components/shared/toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FollowUpFormDialog, type FollowUpFormValues } from "@/components/tracking/followup-form-dialog";
import { LiveMap } from "@/components/tracking/live-map";
import { useDataStore } from "@/store/data-store";
import { useDataScope } from "@/hooks/use-data-scope";
import { useAuthStore } from "@/store/auth-store";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Customer, FollowUp } from "@/types";

const TODAY = "2026-07-02";

export default function TrackingPage() {
  const followUps = useDataStore((s) => s.followUps);
  const customers = useDataStore((s) => s.customers);
  const branches = useDataStore((s) => s.branches);
  const payments = useDataStore((s) => s.payments);
  const addFollowUp = useDataStore((s) => s.addFollowUp);
  const updateFollowUp = useDataStore((s) => s.updateFollowUp);

  const currentUser = useAuthStore((s) => s.currentUser);
  const { branchId, employeeId } = useDataScope();
  const isAdmin = currentUser?.role === "main_admin" || currentUser?.role === "branch_admin";

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [activeCustomer, setActiveCustomer] = React.useState<Customer | undefined>(undefined);
  const [activeFollowUp, setActiveFollowUp] = React.useState<FollowUp | undefined>(undefined);

  let scopedFollowUps = branchId ? followUps.filter((f) => f.branchId === branchId) : followUps;
  let scopedPayments = branchId ? payments.filter((p) => p.branchId === branchId) : payments;

  if (currentUser?.role === "collection_employee") {
    scopedFollowUps = scopedFollowUps.filter((f) => f.employeeId === employeeId);
    scopedPayments = scopedPayments.filter((p) => {
      const cust = customers.find((c) => c.id === p.customerId);
      return cust?.assignedEmployeeId === employeeId;
    });
  }

  const filteredFollowUps = scopedFollowUps.filter((f) => {
    const customer = customers.find((c) => c.id === f.customerId);
    const matchesSearch = !search || customer?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const todayFollowUps = scopedFollowUps.filter((f) => f.nextFollowUpDate === TODAY);
  const pendingDues = scopedPayments.filter((p) => p.status === "pending" || p.status === "partial");
  const overdueCustomers = scopedPayments.filter((p) => p.status === "overdue");

  function openNoteDialog(customer: Customer) {
    setActiveCustomer(customer);
    setActiveFollowUp(followUps.find((f) => f.customerId === customer.id));
    setDialogOpen(true);
  }

  function handleSubmit(values: FollowUpFormValues) {
    if (!activeCustomer || !currentUser) return;
    if (activeFollowUp) {
      updateFollowUp(activeFollowUp.id, {
        note: values.note,
        status: values.status,
        nextFollowUpDate: values.nextFollowUpDate || null,
        promiseToPayDate: values.promiseToPayDate || null,
        lastContactedDate: TODAY,
      });
    } else {
      addFollowUp({
        id: `fu-${String(followUps.length + 1).padStart(3, "0")}`,
        customerId: activeCustomer.id,
        employeeId: activeCustomer.assignedEmployeeId ?? employeeId ?? "",
        branchId: activeCustomer.branchId,
        note: values.note,
        status: values.status,
        lastContactedDate: TODAY,
        nextFollowUpDate: values.nextFollowUpDate || null,
        promiseToPayDate: values.promiseToPayDate || null,
        createdAt: TODAY,
      });
    }
    toast.success(`Follow-up updated for ${activeCustomer.name}.`);
    setDialogOpen(false);
  }

  return (
    <div>
      <PageHeader title="Tracking" description="Follow-ups, pending dues, overdue customers and field staff movement." />

      {currentUser?.role === "collection_employee" && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4">
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-maroon" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">Install this app on your phone</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Android (Chrome): menu ⋮ → <span className="font-medium text-foreground">Add to Home Screen</span> · iPhone (Safari): Share →{" "}
              <span className="font-medium text-foreground">Add to Home Screen</span>. Once installed, your live location is shared with your
              branch admin during collection rounds so routes and follow-ups stay in sync.
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue={isAdmin ? "map" : "today"}>
        <TabsList className="flex-wrap">
          {isAdmin && <TabsTrigger value="map">Live Map</TabsTrigger>}
          <TabsTrigger value="today">Today&apos;s Follow-ups ({todayFollowUps.length})</TabsTrigger>
          <TabsTrigger value="dues">Pending Dues ({pendingDues.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Customers ({overdueCustomers.length})</TabsTrigger>
          <TabsTrigger value="all">All Follow-ups ({scopedFollowUps.length})</TabsTrigger>
        </TabsList>

        {isAdmin && (
          <TabsContent value="map">
            <LiveMap branchId={branchId ?? undefined} />
          </TabsContent>
        )}

        <TabsContent value="today">
          {todayFollowUps.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No follow-ups scheduled today" description="You're all caught up for today." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Promise to Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayFollowUps.map((f) => {
                    const customer = customers.find((c) => c.id === f.customerId);
                    return (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium text-foreground">
                          <Link href={`/customers/${f.customerId}`} className="hover:text-maroon hover:underline">
                            {customer?.name ?? "—"}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">{f.note}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(f.promiseToPayDate, "short")}</TableCell>
                        <TableCell>
                          <StatusBadge status={f.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => customer && openNoteDialog(customer)}>
                            <MessageSquarePlus className="h-3.5 w-3.5" /> Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="dues">
          {pendingDues.length === 0 ? (
            <EmptyState icon={Hourglass} title="No pending dues" description="All installments are up to date." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDues.map((p) => {
                    const customer = customers.find((c) => c.id === p.customerId);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-foreground">
                          <Link href={`/customers/${p.customerId}`} className="hover:text-maroon hover:underline">
                            {customer?.name ?? "—"}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{p.month}</TableCell>
                        <TableCell className="font-semibold text-warning">{formatCurrency(p.dueAmount - p.paidAmount)}</TableCell>
                        <TableCell>
                          <StatusBadge status={p.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => customer && openNoteDialog(customer)}>
                            <MessageSquarePlus className="h-3.5 w-3.5" /> Add Note
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue">
          {overdueCustomers.length === 0 ? (
            <EmptyState icon={AlertTriangle} title="No overdue customers" description="Great work keeping collections on track." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Overdue Amount</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueCustomers.map((p) => {
                    const customer = customers.find((c) => c.id === p.customerId);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-foreground">
                          <Link href={`/customers/${p.customerId}`} className="hover:text-maroon hover:underline">
                            {customer?.name ?? "—"}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{p.month}</TableCell>
                        <TableCell className="font-semibold text-destructive">{formatCurrency(p.dueAmount - p.paidAmount)}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">{p.remarks ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => customer && openNoteDialog(customer)}>
                            <MessageSquarePlus className="h-3.5 w-3.5" /> Add Note
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          <Toolbar className="mb-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by customer..." />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
                <SelectItem value="promise_to_pay">Promise to Pay</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="risk">Risk</SelectItem>
              </SelectContent>
            </Select>
          </Toolbar>
          {filteredFollowUps.length === 0 ? (
            <EmptyState icon={Radar} title="No follow-up records found" description="Try adjusting your search or filters." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Last Contacted</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead>Promise to Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFollowUps.map((f) => {
                    const customer = customers.find((c) => c.id === f.customerId);
                    const branch = branches.find((b) => b.id === f.branchId);
                    return (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium text-foreground">
                          <Link href={`/customers/${f.customerId}`} className="hover:text-maroon hover:underline">
                            {customer?.name ?? "—"}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{branch?.location ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(f.lastContactedDate, "short")}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(f.nextFollowUpDate, "short")}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(f.promiseToPayDate, "short")}</TableCell>
                        <TableCell>
                          <StatusBadge status={f.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => customer && openNoteDialog(customer)}>
                            <MessageSquarePlus className="h-3.5 w-3.5" /> Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <FollowUpFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        followUp={activeFollowUp}
        customerName={activeCustomer?.name}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
