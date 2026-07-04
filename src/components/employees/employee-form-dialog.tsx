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
import type { Branch, Employee, EmployeeRole, Status } from "@/types";

export interface EmployeeFormValues {
  name: string;
  branchId: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  joiningDate: string;
  salary: number;
  status: Status;
  collectionTarget: number;
}

const EMPTY = (defaultBranchId: string): EmployeeFormValues => ({
  name: "",
  branchId: defaultBranchId,
  role: "collection_employee",
  phone: "",
  email: "",
  joiningDate: "",
  salary: 0,
  status: "active",
  collectionTarget: 0,
});

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee;
  branches: Branch[];
  lockBranchId?: string;
  onSubmit: (values: EmployeeFormValues) => void;
}

const ROLE_OPTIONS: { value: EmployeeRole; label: string }[] = [
  { value: "branch_admin", label: "Branch Admin" },
  { value: "collection_employee", label: "Collection Employee" },
  { value: "accountant", label: "Accountant" },
  { value: "viewer", label: "Viewer" },
];

export function EmployeeFormDialog({ open, onOpenChange, employee, branches, lockBranchId, onSubmit }: EmployeeFormDialogProps) {
  const [values, setValues] = React.useState<EmployeeFormValues>(EMPTY(lockBranchId ?? branches[0]?.id ?? ""));
  const [wasOpen, setWasOpen] = React.useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues(
        employee
          ? {
              name: employee.name,
              branchId: employee.branchId,
              role: employee.role,
              phone: employee.phone,
              email: employee.email,
              joiningDate: employee.joiningDate,
              salary: employee.salary,
              status: employee.status,
              collectionTarget: employee.collectionTarget,
            }
          : EMPTY(lockBranchId ?? branches[0]?.id ?? "")
      );
    }
  }

  function set<K extends keyof EmployeeFormValues>(key: K, value: EmployeeFormValues[K]) {
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
          <DialogTitle>{employee ? "Edit Employee" : "Add Employee"}</DialogTitle>
          <DialogDescription>
            {employee ? "Update this employee's details." : "Create a new employee and assign them to a branch."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="name">Employee Name</Label>
              <Input id="name" required value={values.name} onChange={(e) => set("name", e.target.value)} />
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
              <Label htmlFor="role">Role</Label>
              <Select value={values.role} onValueChange={(v) => set("role", v as EmployeeRole)}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" required value={values.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={values.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="joiningDate">Joining Date</Label>
              <Input id="joiningDate" type="date" required value={values.joiningDate} onChange={(e) => set("joiningDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salary">Salary (₹/month)</Label>
              <Input id="salary" type="number" min={0} required value={values.salary} onChange={(e) => set("salary", Number(e.target.value))} />
            </div>
            {values.role === "collection_employee" && (
              <div className="space-y-1.5">
                <Label htmlFor="collectionTarget">Collection Target (₹/month)</Label>
                <Input
                  id="collectionTarget"
                  type="number"
                  min={0}
                  value={values.collectionTarget}
                  onChange={(e) => set("collectionTarget", Number(e.target.value))}
                />
              </div>
            )}
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
              {employee ? "Save Changes" : "Create Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
