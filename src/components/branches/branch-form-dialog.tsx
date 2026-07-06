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
import type { Branch, Status } from "@/types";

export interface BranchFormValues {
  name: string;
  code: string;
  location: string;
  address: string;
  managerName: string;
  phone: string;
  email: string;
  openingDate: string;
  status: Status;
}

const EMPTY: BranchFormValues = {
  name: "",
  code: "",
  location: "",
  address: "",
  managerName: "",
  phone: "",
  email: "",
  openingDate: "",
  status: "active",
};

interface BranchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: Branch;
  onSubmit: (values: BranchFormValues) => void;
}

export function BranchFormDialog({ open, onOpenChange, branch, onSubmit }: BranchFormDialogProps) {
  const [values, setValues] = React.useState<BranchFormValues>(EMPTY);
  const [wasOpen, setWasOpen] = React.useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues(
        branch
          ? {
              name: branch.name,
              code: branch.code,
              location: branch.location,
              address: branch.address,
              managerName: branch.managerName,
              phone: branch.phone,
              email: branch.email,
              openingDate: branch.openingDate,
              status: branch.status,
            }
          : EMPTY
      );
    }
  }

  function set<K extends keyof BranchFormValues>(key: K, value: BranchFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{branch ? "Edit Branch" : "Add Branch"}</DialogTitle>
          <DialogDescription>
            {branch ? "Update this branch's details." : "Create a new branch under Shree Vaari Chit Finance."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="name">Branch Name</Label>
              <Input id="name" required value={values.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code">Branch Code</Label>
              <Input id="code" required value={values.code} onChange={(e) => set("code", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" required value={values.location} onChange={(e) => set("location", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input id="address" required value={values.address} onChange={(e) => set("address", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="managerName">Manager Name</Label>
              <Input id="managerName" required value={values.managerName} onChange={(e) => set("managerName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" required value={values.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={values.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="openingDate">Opening Date</Label>
              <Input id="openingDate" type="date" required value={values.openingDate} onChange={(e) => set("openingDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={values.status} onValueChange={(v) => set("status", v as Status)}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-maroon hover:bg-maroon-dark">
              {branch ? "Save Changes" : "Create Branch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
