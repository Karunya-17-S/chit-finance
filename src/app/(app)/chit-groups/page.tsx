"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Layers, Eye, Image as ImageIcon, Trash2, Edit } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Toolbar, SearchInput } from "@/components/shared/toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDataStore } from "@/store/data-store";
import { useDataScope } from "@/hooks/use-data-scope";
import { useAuthStore } from "@/store/auth-store";
import { can } from "@/lib/rbac";
import { formatCurrency } from "@/lib/format";
import { ChitGroupFormDialog, type ChitGroupFormValues } from "@/components/chit-groups/chit-group-form-dialog";
import type { ChitGroup } from "@/types";

export default function ChitGroupsPage() {
  const chitGroups = useDataStore((s) => s.chitGroups);
  const branches = useDataStore((s) => s.branches);
  const addChitGroup = useDataStore((s) => s.addChitGroup);
  const updateChitGroup = useDataStore((s) => s.updateChitGroup);
  // Use the store's setState directly for delete since deleteChitGroup might not exist
  const setStore = useDataStore.setState;

  const currentUser = useAuthStore((s) => s.currentUser);
  const { branchId } = useDataScope();
  const canManage = currentUser ? can(currentUser.role, "manageChitGroups") : false;

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [selectedGroupName, setSelectedGroupName] = React.useState<string>("");
  const [activeGroup, setActiveGroup] = React.useState<ChitGroup | undefined>(undefined);
  const [groupToDelete, setGroupToDelete] = React.useState<ChitGroup | undefined>(undefined);

  const scopedGroups = branchId ? chitGroups.filter((g) => g.branchId === branchId) : chitGroups;

  const filtered = scopedGroups.filter((g) => {
    const matchesSearch =
      !search || 
      g.groupName.toLowerCase().includes(search.toLowerCase()) || 
      g.groupCode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function handleAdd() {
    setActiveGroup(undefined);
    setDialogOpen(true);
  }

  function handleEdit(group: ChitGroup) {
    setActiveGroup(group);
    setDialogOpen(true);
  }

  function handleViewImage(imageUrl: string, groupName: string) {
    setSelectedImage(imageUrl);
    setSelectedGroupName(groupName);
    setImageDialogOpen(true);
  }

  function handleDeleteClick(group: ChitGroup) {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  }

  function handleDeleteConfirm() {
    if (!groupToDelete) return;

    try {
      // Directly update the store by filtering out the deleted group
      setStore((state) => ({
        ...state,
        chitGroups: state.chitGroups.filter((g) => g.id !== groupToDelete.id)
      }));
      
      toast.success(`"${groupToDelete.groupName}" chit group deleted successfully.`);
      setDeleteDialogOpen(false);
      setGroupToDelete(undefined);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete chit group. Please try again.");
    }
  }

  function handleSubmit(values: ChitGroupFormValues) {
    if (activeGroup) {
      // Update existing group
      updateChitGroup(activeGroup.id, {
        ...values,
        monthlyInstallment: Math.round(values.chitValue / values.durationMonths),
        foremanCommission: 0,
        collectionFrequency: "monthly",
      });
      toast.success("Chit group updated successfully.");
    } else {
      // Create new group with unique ID
      const maxId = chitGroups.reduce((max, g) => {
        const num = parseInt(g.id.replace('grp-', ''));
        return num > max ? num : max;
      }, 0);
      
      const newId = `grp-${String(maxId + 1).padStart(3, "0")}`;
      
      const endDate = new Date(values.startDate);
      endDate.setMonth(endDate.getMonth() + values.durationMonths);
      
      addChitGroup({
        id: newId,
        groupCode: `SVCF-G${String(maxId + 1).padStart(3, "0")}`,
        endDate: endDate.toISOString().slice(0, 10),
        monthlyInstallment: Math.round(values.chitValue / values.durationMonths),
        foremanCommission: 0,
        collectionFrequency: "monthly",
        ...values,
      });
      toast.success("Chit group created successfully.");
    }
    setDialogOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Chit Groups"
        description="Manage chit fund groups and membership."
        actions={
          canManage && (
            <Button onClick={handleAdd} className="bg-maroon hover:bg-maroon-dark">
              <Plus className="h-4 w-4" /> Create Chit Group
            </Button>
          )
        }
      />

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by group name or code..." />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed (Archive)</SelectItem>
          </SelectContent>
        </Select>
      </Toolbar>

      {filtered.length === 0 ? (
        <EmptyState icon={Layers} title="No chit groups found" description="Try adjusting your search or filters." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chit Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Chit Value</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Plan Picture</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((g) => {
                const branch = branches.find((b) => b.id === g.branchId);
                return (
                  <TableRow key={g.id}>
                    <TableCell>
                      <Link href={`/chit-groups/${g.id}`} className="font-medium text-foreground hover:text-maroon hover:underline">
                        {g.groupName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {g.groupCode} · {g.durationMonths} months
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{branch?.location ?? "—"}</TableCell>
                    <TableCell>
                      <p className="text-muted-foreground">{formatCurrency(g.chitValue)}</p>
                      <p className="text-xs text-muted-foreground">
                        {g.monthlyInstallment ? formatCurrency(g.monthlyInstallment) : '—'} per month
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-muted-foreground font-medium">{g.currentMembers}</p>
                      <p className="text-xs text-muted-foreground">members</p>
                    </TableCell>
                    <TableCell>
                      {g.planImage ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                          onClick={() => handleViewImage(g.planImage!, g.groupName)}
                        >
                          <Eye className="h-4 w-4" />
                          View Picture
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <ImageIcon className="h-3.5 w-3.5" />
                          No image
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={g.status} />
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(g)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center gap-1"
                            onClick={() => handleDeleteClick(g)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ChitGroupFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={activeGroup}
        branches={branches}
        lockBranchId={branchId ?? undefined}
        onSubmit={handleSubmit}
      />

      {/* Image Preview Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedGroupName} - Plan Picture</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {selectedImage ? (
              <div className="relative w-full max-h-[70vh] overflow-hidden rounded-lg">
                <Image
                  src={selectedImage}
                  alt={selectedGroupName}
                  width={800}
                  height={600}
                  className="object-contain w-full h-auto"
                  unoptimized={selectedImage.startsWith('data:')}
                />
              </div>
            ) : (
              <p className="text-muted-foreground">No image available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chit Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{groupToDelete?.groupName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
