"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Contact, MoreVertical } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Toolbar, SearchInput } from "@/components/shared/toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CustomerFormDialog, type CustomerFormValues } from "@/components/customers/customer-form-dialog";
import { useDataStore } from "@/store/data-store";
import { useDataScope } from "@/hooks/use-data-scope";
import { useAuthStore } from "@/store/auth-store";
import { can, isReadOnly } from "@/lib/rbac";
import { formatDate } from "@/lib/format";
import type { Customer } from "@/types";

export default function CustomersPage() {
  const customers = useDataStore((s) => s.customers);
  const branches = useDataStore((s) => s.branches);
  const employees = useDataStore((s) => s.employees);
  const addCustomer = useDataStore((s) => s.addCustomer);
  const updateCustomer = useDataStore((s) => s.updateCustomer);

  const currentUser = useAuthStore((s) => s.currentUser);
  const { branchId, employeeId } = useDataScope();
  const canManage = currentUser ? can(currentUser.role, "manageCustomers") : false;
  const readOnly = currentUser ? isReadOnly(currentUser.role) : false;

  const [search, setSearch] = React.useState("");
  const [branchFilter, setBranchFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [activeCustomer, setActiveCustomer] = React.useState<Customer | undefined>(undefined);

  let scopedCustomers = branchId ? customers.filter((c) => c.branchId === branchId) : customers;
  if (currentUser?.role === "collection_employee") {
    scopedCustomers = scopedCustomers.filter((c) => c.assignedEmployeeId === employeeId);
  }

  const filtered = scopedCustomers.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesBranch = branchFilter === "all" || c.branchId === branchFilter;
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  function handleAdd() {
    setActiveCustomer(undefined);
    setDialogOpen(true);
  }

  function handleEdit(customer: Customer) {
    setActiveCustomer(customer);
    setDialogOpen(true);
  }

  function handleSubmit(values: CustomerFormValues) {
    if (activeCustomer) {
      updateCustomer(activeCustomer.id, { ...values, alternatePhone: values.alternatePhone || undefined });
      toast.success("Customer updated successfully.");
    } else {
      addCustomer({
        id: `cust-${String(customers.length + 1).padStart(3, "0")}`,
        customerCode: `SVCF-C${String(customers.length + 1).padStart(3, "0")}`,
        assignedEmployeeId: null,
        ...values,
        alternatePhone: values.alternatePhone || undefined,
      });
      toast.success("Customer added successfully.");
    }
    setDialogOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        description="All chit fund customers across branches."
        actions={
          canManage && (
            <Button onClick={handleAdd} className="bg-maroon hover:bg-maroon-dark">
              <Plus className="h-4 w-4" /> Add Customer
            </Button>
          )
        }
      />

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, ID or phone..." />
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Toolbar>

      {filtered.length === 0 ? (
        <EmptyState icon={Contact} title="No customers found" description="Try adjusting your search or filters." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead>Assigned Employee</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                {!readOnly && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const branch = branches.find((b) => b.id === c.branchId);
                const emp = employees.find((e) => e.id === c.assignedEmployeeId);
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/customers/${c.id}`} className="font-medium text-foreground hover:text-maroon hover:underline">
                        {c.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{c.customerCode} · {c.phone}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{branch?.location ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{c.occupation}</TableCell>
                    <TableCell className="text-muted-foreground">{emp?.name ?? "Unassigned"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(c.joinedDate, "short")}</TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    {!readOnly && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/customers/${c.id}`}>View Profile</Link>
                            </DropdownMenuItem>
                            {canManage && <DropdownMenuItem onClick={() => handleEdit(c)}>Edit Customer</DropdownMenuItem>}
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

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={activeCustomer}
        branches={branches}
        lockBranchId={branchId ?? undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
