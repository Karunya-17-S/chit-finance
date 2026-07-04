"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Branch, ChitGroup, ChitGroupStatus, CollectionFrequency, Employee } from "@/types";

export interface ChitGroupFormValues {
  groupName: string;
  branchId: string;
  chitValue: number;
  collectionFrequency: CollectionFrequency;
  durationMonths: number;
  totalMembers: number;
  startDate: string;
  auctionDate: string;
  status: ChitGroupStatus;
  commissionPercentage: number;
  collectionEmployeeId: string;
}

const EMPTY = (defaultBranchId: string): ChitGroupFormValues => ({
  groupName: "",
  branchId: defaultBranchId,
  chitValue: 100000,
  collectionFrequency: "monthly",
  durationMonths: 20,
  totalMembers: 20,
  startDate: "",
  auctionDate: "",
  status: "pending",
  commissionPercentage: 5,
  collectionEmployeeId: "",
});

interface ChitGroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: ChitGroup;
  branches: Branch[];
  employees: Employee[];
  lockBranchId?: string;
  onSubmit: (values: ChitGroupFormValues) => void;
}

export function ChitGroupFormDialog({ open, onOpenChange, group, branches, employees, lockBranchId, onSubmit }: ChitGroupFormDialogProps) {
  const [values, setValues] = React.useState<ChitGroupFormValues>(EMPTY(lockBranchId ?? branches[0]?.id ?? ""));
  const [wasOpen, setWasOpen] = React.useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues(
        group
          ? {
              groupName: group.groupName,
              branchId: group.branchId,
              chitValue: group.chitValue,
              collectionFrequency: group.collectionFrequency,
              durationMonths: group.durationMonths,
              totalMembers: group.totalMembers,
              startDate: group.startDate,
              auctionDate: group.auctionDate,
              status: group.status,
              commissionPercentage: group.commissionPercentage,
              collectionEmployeeId: group.collectionEmployeeId ?? "",
            }
          : EMPTY(lockBranchId ?? branches[0]?.id ?? "")
      );
    }
  }

  function set<K extends keyof ChitGroupFormValues>(key: K, value: ChitGroupFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const branchEmployees = employees.filter((e) => e.branchId === values.branchId && e.role === "collection_employee");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{group ? "Edit Chit Group" : "Create Chit Group"}</DialogTitle>
          <DialogDescription>
            {group ? "Update this chit group's terms." : "Set up a new chit group for a branch."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="groupName">Group Name</Label>
              <Input id="groupName" required value={values.groupName} onChange={(e) => set("groupName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="branch">Branch</Label>
              <Select value={values.branchId} onValueChange={(v) => set("branchId", v)} disabled={!!lockBranchId}>
                <SelectTrigger id="branch" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="chitValue">Chit Value (₹)</Label>
              <Input id="chitValue" type="number" min={1} required value={values.chitValue} onChange={(e) => set("chitValue", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="collectionFrequency">Collection Frequency</Label>
              <Select value={values.collectionFrequency} onValueChange={(v) => set("collectionFrequency", v as CollectionFrequency)}>
                <SelectTrigger id="collectionFrequency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="durationMonths">Duration (months)</Label>
              <Input
                id="durationMonths"
                type="number"
                min={1}
                required
                value={values.durationMonths}
                onChange={(e) => set("durationMonths", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="totalMembers">Total Members</Label>
              <Input
                id="totalMembers"
                type="number"
                min={1}
                required
                value={values.totalMembers}
                onChange={(e) => set("totalMembers", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" required value={values.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="auctionDate">Next Auction Date</Label>
              <Input id="auctionDate" type="date" required value={values.auctionDate} onChange={(e) => set("auctionDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commissionPercentage">Commission (%)</Label>
              <Input
                id="commissionPercentage"
                type="number"
                min={0}
                max={100}
                required
                value={values.commissionPercentage}
                onChange={(e) => set("commissionPercentage", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={values.status} onValueChange={(v) => set("status", v as ChitGroupStatus)}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="collectionEmployeeId">Collection Employee</Label>
              <Select value={values.collectionEmployeeId} onValueChange={(v) => set("collectionEmployeeId", v)}>
                <SelectTrigger id="collectionEmployeeId" className="w-full">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {branchEmployees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-maroon hover:bg-maroon-dark">
              {group ? "Save Changes" : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
