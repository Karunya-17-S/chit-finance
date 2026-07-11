"use client";

import * as React from "react";
import { Plus, Building2, Archive, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Toolbar, SearchInput } from "@/components/shared/toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BranchCard } from "@/components/branches/branch-card";
import { BranchFormDialog, type BranchFormValues } from "@/components/branches/branch-form-dialog";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { useAuthStore } from "@/store/auth-store";
import { can } from "@/lib/rbac";
import type { Branch } from "@/types";

const RECOVERY_WINDOW_DAYS = 10;

function daysRemaining(deletedAt: string): number {
  const deletedTime = new Date(deletedAt).getTime();
  const expiresAt = deletedTime + RECOVERY_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const msLeft = expiresAt - Date.now();
  return Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
}

export default function BranchesPage() {
  const [branches, setBranches] = React.useState<Branch[]>([]);
  const [deletedBranches, setDeletedBranches] = React.useState<Branch[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const currentUser = useAuthStore((s) => s.currentUser);
  const canManage = currentUser ? can(currentUser.role, "manageBranches") : false;

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingBranch, setEditingBranch] = React.useState<Branch | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<Branch | undefined>(undefined);
  const [showArchive, setShowArchive] = React.useState(false);

  const fetchBranches = React.useCallback(async () => {
    try {
      setLoading(true);
      const [activeRes, deletedRes] = await Promise.all([
        fetch("/api/branches"),
        fetch("/api/branches?deleted=true"),
      ]);
      if (!activeRes.ok || !deletedRes.ok) throw new Error("Failed to fetch");
      const activeData = await activeRes.json();
      const deletedData = await deletedRes.json();
      setBranches(activeData.branches);
      setDeletedBranches(deletedData.branches);
    } catch (error) {
      console.error("Failed to load branches:", error);
      toast.error("Failed to load branches from database.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

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

  async function handleToggleStatus(branch: Branch) {
    const nextStatus = branch.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch("/api/branches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: branch.id, status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(`${branch.name} marked as ${nextStatus}.`);
      await fetchBranches();
    } catch (error) {
      console.error("Failed to update branch status:", error);
      toast.error("Failed to update branch status.");
    }
  }

  function handleDeleteClick(branch: Branch) {
    setDeleteTarget(branch);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/branches?id=${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success(`"${deleteTarget.name}" moved to Deleted Branches. Recoverable for ${RECOVERY_WINDOW_DAYS} days.`);
      setDeleteTarget(undefined);
      await fetchBranches();
    } catch (error) {
      console.error("Failed to delete branch:", error);
      toast.error("Failed to delete branch.");
    }
  }

  async function handleRestore(branch: Branch) {
    try {
      const res = await fetch("/api/branches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: branch.id, restore: true }),
      });
      if (!res.ok) throw new Error("Failed to restore");
      toast.success(`"${branch.name}" restored.`);
      await fetchBranches();
    } catch (error) {
      console.error("Failed to restore branch:", error);
      toast.error("Failed to restore branch.");
    }
  }

  async function handleSubmit(values: BranchFormValues) {
    try {
      setIsSubmitting(true);
      if (editingBranch) {
        const res = await fetch("/api/branches", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingBranch.id, ...values }),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast.success("Branch updated successfully.");
      } else {
        const res = await fetch("/api/branches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error("Failed to create");
        toast.success("Branch created successfully.");
      }
      setDialogOpen(false);
      await fetchBranches();
    } catch (error) {
      console.error("Failed to save branch:", error);
      toast.error(editingBranch ? "Failed to update branch." : "Failed to create branch.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-maroon" />
        <span className="ml-2 text-muted-foreground">Loading branches...</span>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Branches"
        description="Manage all Shree Vaari Chit Finance branch locations."
        actions={
          <div className="flex gap-2">
            {canManage && deletedBranches.length > 0 && (
              <Button variant="outline" onClick={() => setShowArchive((v) => !v)}>
                <Archive className="h-4 w-4" />
                {showArchive ? "Back to Branches" : `Deleted Branches (${deletedBranches.length})`}
              </Button>
            )}
            {canManage && !showArchive && (
              <Button onClick={handleAdd} className="bg-maroon hover:bg-maroon-dark">
                <Plus className="h-4 w-4" /> Add Branch
              </Button>
            )}
          </div>
        }
      />

      {showArchive ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Deleted branches are kept for {RECOVERY_WINDOW_DAYS} days before being permanently removed. Restore any of these to bring them back.
          </p>
          {deletedBranches.length === 0 ? (
            <EmptyState icon={Archive} title="No deleted branches" description="Anything you delete will show up here for 10 days." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {deletedBranches.map((branch) => (
                <div key={branch.id} className="flex flex-col rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
                  <p className="font-bold text-foreground">{branch.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {branch.location} · {branch.code}
                  </p>
                  <p className="mt-2 text-xs font-medium text-destructive">
                    {daysRemaining(branch.deletedAt!)} day{daysRemaining(branch.deletedAt!) === 1 ? "" : "s"} left before permanent deletion
                  </p>
                  <Button variant="outline" className="mt-4 w-full" onClick={() => handleRestore(branch)}>
                    <RotateCcw className="h-4 w-4" /> Restore Branch
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
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
                  onDelete={() => handleDeleteClick(branch)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <BranchFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        branch={editingBranch}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {deleteTarget && (
        <ConfirmDeleteDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(undefined)}
          confirmText={deleteTarget.name}
          title="Delete Branch"
          description={`This will remove "${deleteTarget.name}" from active branches. It stays recoverable in Deleted Branches for ${RECOVERY_WINDOW_DAYS} days, then is permanently deleted.`}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}