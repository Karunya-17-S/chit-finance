"use client";

import * as React from "react";
import { Plus, Building2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Toolbar, SearchInput } from "@/components/shared/toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BranchCard } from "@/components/branches/branch-card";
import { BranchFormDialog, type BranchFormValues } from "@/components/branches/branch-form-dialog";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";
import { can } from "@/lib/rbac";
import type { Branch } from "@/types";

export default function BranchesPage() {
  const branches = useDataStore((s) => s.branches);
  const addBranch = useDataStore((s) => s.addBranch);
  const updateBranch = useDataStore((s) => s.updateBranch);
  const currentUser = useAuthStore((s) => s.currentUser);
  const canManage = currentUser ? can(currentUser.role, "manageBranches") : false;

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingBranch, setEditingBranch] = React.useState<Branch | undefined>(undefined);

  const filtered = branches.filter((b) => {
    const matchesSearch =
      !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function handleAdd() {
    setEditingBranch(undefined);
    setDialogOpen(true);
  }

  function handleEdit(branch: Branch) {
    setEditingBranch(branch);
    setDialogOpen(true);
  }

  function handleToggleStatus(branch: Branch) {
    const nextStatus = branch.status === "active" ? "inactive" : "active";
    updateBranch(branch.id, { status: nextStatus });
    toast.success(`${branch.name} marked as ${nextStatus}.`);
  }

  function handleSubmit(values: BranchFormValues) {
    if (editingBranch) {
      updateBranch(editingBranch.id, values);
      toast.success("Branch updated successfully.");
    } else {
      addBranch({
        id: `br-${String(branches.length + 1).padStart(3, "0")}`,
        totalCustomers: 0,
        activeChitGroups: 0,
        monthlyCollection: 0,
        pendingAmount: 0,
        ...values,
      });
      toast.success("Branch created successfully.");
    }
    setDialogOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Branches"
        description="Manage all Shree Vaari Chit Finance branch locations."
        actions={
          canManage && (
            <Button onClick={handleAdd} className="bg-maroon hover:bg-maroon-dark">
              <Plus className="h-4 w-4" /> Add Branch
            </Button>
          )
        }
      />

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, code or location..." />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </Toolbar>

      {filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No branches found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              canManage={canManage}
              onEdit={() => handleEdit(branch)}
              onToggleStatus={() => handleToggleStatus(branch)}
            />
          ))}
        </div>
      )}

      <BranchFormDialog open={dialogOpen} onOpenChange={setDialogOpen} branch={editingBranch} onSubmit={handleSubmit} />
    </div>
  );
}
