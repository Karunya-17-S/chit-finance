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
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Branch, Customer, Status } from "@/types";

export interface CustomerFormValues {
  name: string;
  passbookNumber: string;
  branchId: string;
  phone: string;
  alternatePhone: string;
  address: string;
  aadhaarNumber: string;
  panNumber: string;
  occupation: string;
  monthlyIncome: number;
  nomineeName: string;
  nomineePhone: string;
  joinedDate: string;
  status: Status;
}

const EMPTY = (defaultBranchId: string): CustomerFormValues => ({
  name: "",
  passbookNumber: "",
  branchId: defaultBranchId,
  phone: "",
  alternatePhone: "",
  address: "",
  aadhaarNumber: "",
  panNumber: "",
  occupation: "",
  monthlyIncome: 0,
  nomineeName: "",
  nomineePhone: "",
  joinedDate: "",
  status: "active",
});

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
  branches: Branch[];
  lockBranchId?: string;
  onSubmit: (values: CustomerFormValues) => void;
}

export function CustomerFormDialog({ open, onOpenChange, customer, branches, lockBranchId, onSubmit }: CustomerFormDialogProps) {
  const [values, setValues] = React.useState<CustomerFormValues>(EMPTY(lockBranchId ?? branches[0]?.id ?? ""));
  const [wasOpen, setWasOpen] = React.useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues(
        customer
          ? {
              name: customer.name,
              passbookNumber: customer.passbookNumber,
              branchId: customer.branchId,
              phone: customer.phone,
              alternatePhone: customer.alternatePhone ?? "",
              address: customer.address,
              aadhaarNumber: customer.aadhaarNumber,
              panNumber: customer.panNumber,
              occupation: customer.occupation,
              monthlyIncome: customer.monthlyIncome,
              nomineeName: customer.nomineeName,
              nomineePhone: customer.nomineePhone,
              joinedDate: customer.joinedDate,
              status: customer.status,
            }
          : EMPTY(lockBranchId ?? branches[0]?.id ?? "")
      );
    }
  }

  function set<K extends keyof CustomerFormValues>(key: K, value: CustomerFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "Add Customer"}</DialogTitle>
          <DialogDescription>
            {customer ? "Update this customer's KYC and contact details." : "Onboard a new chit fund customer."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-3">
          <form id="customer-form" onSubmit={handleSubmit} className="space-y-4 px-0.5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="name">Customer Name</Label>
                <Input id="name" required value={values.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="passbookNumber">Passbook Number</Label>
                <Input
                  id="passbookNumber"
                  placeholder="Auto-generated if left blank"
                  value={values.passbookNumber}
                  onChange={(e) => set("passbookNumber", e.target.value)}
                />
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
                <Label htmlFor="occupation">Occupation</Label>
                <Input id="occupation" required value={values.occupation} onChange={(e) => set("occupation", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" required value={values.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="alternatePhone">Alternate Phone</Label>
                <Input id="alternatePhone" value={values.alternatePhone} onChange={(e) => set("alternatePhone", e.target.value)} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" required value={values.address} onChange={(e) => set("address", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                <Input id="aadhaarNumber" required value={values.aadhaarNumber} onChange={(e) => set("aadhaarNumber", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input id="panNumber" required value={values.panNumber} onChange={(e) => set("panNumber", e.target.value.toUpperCase())} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  min={0}
                  required
                  value={values.monthlyIncome}
                  onChange={(e) => set("monthlyIncome", Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="joinedDate">Joined Date</Label>
                <Input id="joinedDate" type="date" required value={values.joinedDate} onChange={(e) => set("joinedDate", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nomineeName">Nominee Name</Label>
                <Input id="nomineeName" required value={values.nomineeName} onChange={(e) => set("nomineeName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nomineePhone">Nominee Phone</Label>
                <Input id="nomineePhone" required value={values.nomineePhone} onChange={(e) => set("nomineePhone", e.target.value)} />
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
          </form>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form" className="bg-maroon hover:bg-maroon-dark">
            {customer ? "Save Changes" : "Create Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
