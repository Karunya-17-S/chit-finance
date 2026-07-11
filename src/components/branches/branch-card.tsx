"use client";

import Link from "next/link";
import { Building2, MapPin, MoreVertical, Users, Layers, Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrencyCompact } from "@/lib/format";
import type { Branch } from "@/types";

interface BranchCardProps {
  branch: Branch;
  canManage: boolean;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

export function BranchCard({ branch, canManage, onEdit, onToggleStatus, onDelete }: BranchCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-maroon/10">
            <Building2 className="h-5 w-5 text-maroon" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-foreground">{branch.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {branch.location} &middot; {branch.code}
            </p>
          </div>
        </div>
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>Edit Branch</DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleStatus} variant={branch.status === "active" ? "destructive" : "default"}>
                {branch.status === "active" ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} variant="destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mt-3">
        <StatusBadge status={branch.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
        <div>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Users className="h-3 w-3" /> Customers
          </p>
          <p className="text-sm font-bold text-foreground">{branch.totalCustomers}</p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Layers className="h-3 w-3" /> Active Groups
          </p>
          <p className="text-sm font-bold text-foreground">{branch.activeChitGroups}</p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Wallet className="h-3 w-3" /> Monthly Collection
          </p>
          <p className="text-sm font-bold text-foreground">{formatCurrencyCompact(branch.monthlyCollection)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <AlertCircle className="h-3 w-3" /> Pending
          </p>
          <p className="text-sm font-bold text-destructive">{formatCurrencyCompact(branch.pendingAmount)}</p>
        </div>
      </div>

      <Button asChild variant="outline" className="mt-4 w-full">
        <Link href={`/branches/${branch.id}`}>View Branch Dashboard</Link>
      </Button>
    </div>
  );
}
