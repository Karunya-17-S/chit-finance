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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ChitGroup, Customer, PaymentCategory, PaymentMode } from "@/types";
import { getGroupsByCustomer } from "@/data";

export interface PaymentFormValues {
  customerId: string;
  chitGroupId: string;
  month: string;
  dueAmount: number;
  paidAmount: number;
  paymentMode: PaymentMode;
  paymentCategory: PaymentCategory;
  remarks: string;
}

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  chitGroups: ChitGroup[];
  lockCustomerId?: string;
  onSubmit: (values: PaymentFormValues) => void;
}

const emptyValues = (customerId = ""): PaymentFormValues => ({
  customerId,
  chitGroupId: "",
  month: "2026-07",
  dueAmount: 0,
  paidAmount: 0,
  paymentMode: "cash",
  paymentCategory: "installment",
  remarks: "",
});

export function PaymentFormDialog({ open, onOpenChange, customers, chitGroups, lockCustomerId, onSubmit }: PaymentFormDialogProps) {
  const [values, setValues] = React.useState<PaymentFormValues>(emptyValues(lockCustomerId));
  const [wasOpen, setWasOpen] = React.useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setValues(emptyValues(lockCustomerId));
  }

  function set<K extends keyof PaymentFormValues>(key: K, value: PaymentFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const memberships = values.customerId ? getGroupsByCustomer(values.customerId) : [];
  const availableGroups = chitGroups.filter((g) => memberships.some((m) => m.chitGroupId === g.id));

  function handleGroupChange(groupId: string) {
    const group = chitGroups.find((g) => g.id === groupId);
    setValues((v) => ({ ...v, chitGroupId: groupId, dueAmount: group?.monthlyInstallment ?? 0 }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>Log an installment collection, full or partial.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!lockCustomerId && (
              <div className="col-span-2 space-y-1.5">
                <Label>Customer</Label>
                <Select value={values.customerId} onValueChange={(v) => set("customerId", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="col-span-2 space-y-1.5">
              <Label>Chit Group</Label>
              <Select value={values.chitGroupId} onValueChange={handleGroupChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select chit group" />
                </SelectTrigger>
                <SelectContent>
                  {availableGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.groupName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Collection Type</Label>
              <Select
                value={values.paymentCategory}
                onValueChange={(v) => {
                  const category = v as PaymentCategory;
                  setValues((prev) => ({ ...prev, paymentCategory: category, dueAmount: category === "deposit" ? 0 : prev.dueAmount }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="installment">Installment (full / partial)</SelectItem>
                  <SelectItem value="deposit">Deposit (advance amount)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="month">Month</Label>
              <Input id="month" type="month" required value={values.month} onChange={(e) => set("month", e.target.value)} />
            </div>
            {values.paymentCategory === "installment" && (
              <div className="space-y-1.5">
                <Label htmlFor="dueAmount">Due Amount (₹)</Label>
                <Input id="dueAmount" type="number" min={0} required value={values.dueAmount} onChange={(e) => set("dueAmount", Number(e.target.value))} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="paidAmount">{values.paymentCategory === "deposit" ? "Deposit Amount (₹)" : "Paid Amount (₹)"}</Label>
              <Input id="paidAmount" type="number" min={0} required value={values.paidAmount} onChange={(e) => set("paidAmount", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Mode</Label>
              <Select value={values.paymentMode} onValueChange={(v) => set("paymentMode", v as PaymentMode)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea id="remarks" value={values.remarks} onChange={(e) => set("remarks", e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-maroon hover:bg-maroon-dark" disabled={!values.customerId || !values.chitGroupId}>
              Save Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
