"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Layers } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Toolbar, SearchInput } from "@/components/shared/toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDataStore } from "@/store/data-store";
import { useDataScope } from "@/hooks/use-data-scope";
import { useAuthStore } from "@/store/auth-store";
import { can } from "@/lib/rbac";
import { formatCurrency, formatDate, FREQUENCY_LABELS, frequencySuffix } from "@/lib/format";
import { ChitGroupFormDialog, type ChitGroupFormValues } from "@/components/chit-groups/chit-group-form-dialog";
import type { ChitGroup } from "@/types";

export default function ChitGroupsPage() {
  const chitGroups = useDataStore((s) => s.chitGroups);
  const branches = useDataStore((s) => s.branches);
  const employees = useDataStore((s) => s.employees);
  const addChitGroup = useDataStore((s) => s.addChitGroup);
  const updateChitGroup = useDataStore((s) => s.updateChitGroup);

  const currentUser = useAuthStore((s) => s.currentUser);
  const { branchId } = useDataScope();
  const canManage = currentUser ? can(currentUser.role, "manageChitGroups") : false;

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [activeGroup, setActiveGroup] = React.useState<ChitGroup | undefined>(undefined);

  const scopedGroups = branchId ? chitGroups.filter((g) => g.branchId === branchId) : chitGroups;

  const filtered = scopedGroups.filter((g) => {
    const matchesSearch =
      !search || g.groupName.toLowerCase().includes(search.toLowerCase()) || g.groupCode.toLowerCase().includes(search.toLowerCase());
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

  function handleSubmit(values: ChitGroupFormValues) {
    // Installment per collection period: months for monthly, ~4.33 weeks or ~30 days per month otherwise.
    const periods =
      values.collectionFrequency === "daily"
        ? values.durationMonths * 30
        : values.collectionFrequency === "weekly"
          ? Math.round((values.durationMonths * 52) / 12)
          : values.durationMonths;
    const rawInstallment = values.chitValue / periods;
    const monthlyInstallment = rawInstallment >= 1000 ? Math.round(rawInstallment / 100) * 100 : Math.round(rawInstallment / 10) * 10;
    const foremanCommission = Math.round((values.chitValue * values.commissionPercentage) / 100);

    if (activeGroup) {
      updateChitGroup(activeGroup.id, {
        ...values,
        monthlyInstallment,
        foremanCommission,
        chitPlanId: values.chitPlanId || undefined,
        collectionEmployeeId: values.collectionEmployeeId || null,
      });
      toast.success("Chit group updated successfully.");
    } else {
      const endDate = new Date(values.startDate);
      endDate.setMonth(endDate.getMonth() + values.durationMonths);
      addChitGroup({
        id: `grp-${String(chitGroups.length + 1).padStart(3, "0")}`,
        groupCode: `SVCF-G${String(chitGroups.length + 1).padStart(3, "0")}`,
        currentMembers: 0,
        endDate: endDate.toISOString().slice(0, 10),
        monthlyInstallment,
        foremanCommission,
        ...values,
        chitPlanId: values.chitPlanId || undefined,
        collectionEmployeeId: values.collectionEmployeeId || null,
      });
      toast.success("Chit group created successfully.");
    }
    setDialogOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Chit Groups"
        description="Manage chit fund groups, membership and auction schedules."
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
                <TableHead>Group</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Chit Value</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Next Auction</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((g) => {
                const branch = branches.find((b) => b.id === g.branchId);
                const fillPercent = Math.round((g.currentMembers / g.totalMembers) * 100);
                return (
                  <TableRow key={g.id}>
                    <TableCell>
                      <Link href={`/chit-groups/${g.id}`} className="font-medium text-foreground hover:text-maroon hover:underline">
                        {g.groupName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {g.groupCode} · {g.durationMonths} months · {FREQUENCY_LABELS[g.collectionFrequency]} collection
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{branch?.location ?? "—"}</TableCell>
                    <TableCell>
                      <p className="text-muted-foreground">{formatCurrency(g.chitValue)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(g.monthlyInstallment)}
                        {frequencySuffix(g.collectionFrequency)}
                      </p>
                    </TableCell>
                    <TableCell className="w-36">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {g.currentMembers}/{g.totalMembers}
                        </p>
                        <Progress value={fillPercent} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(g.auctionDate, "short")}</TableCell>
                    <TableCell>
                      <StatusBadge status={g.status} />
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(g)}>
                          Edit
                        </Button>
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
        employees={employees}
        lockBranchId={branchId ?? undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
