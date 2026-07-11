"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Branch, Expense, ExpenseCategory, PaymentMode } from "@/types";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/expense-meta";
import { todayDateString } from "@/lib/format";

export interface ExpenseFormValues {
  branchId: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  date: string;
  paidTo: string;
  paymentMode: PaymentMode;
  billNumber: string;
  remarks: string;
}

const empty = (branchId: string): ExpenseFormValues => ({
  branchId,
  category: "rent",
  title: "",
  amount: 0,
  date: todayDateString(),
  paidTo: "",
  paymentMode: "bank_transfer",
  billNumber: "",
  remarks: "",
});

const MODES: PaymentMode[] = ["cash", "upi", "bank_transfer", "cheque"];
const MODE_LABELS: Record<PaymentMode, string> = {
  cash: "Cash",
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  cheque: "Cheque",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ExpenseFormValues) => void;
  branches: Branch[];
  defaultBranchId: string;
  lockBranch?: boolean;
  expense?: Expense;
}

export function ExpenseFormDialog({ open, onOpenChange, onSubmit, branches, defaultBranchId, lockBranch, expense }: Props) {
  const [values, setValues] = React.useState<ExpenseFormValues>(empty(defaultBranchId));
  const [wasOpen, setWasOpen] = React.useState(open);

  // Reset the form to the target record when the dialog opens (render-phase
  // derived-state pattern used across the app's form dialogs).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues(
        expense
          ? {
            branchId: expense.branchId,
            category: expense.category,
            title: expense.title,
            amount: expense.amount,
            date: expense.date,
            paidTo: expense.paidTo,
            paymentMode: expense.paymentMode,
            billNumber: expense.billNumber ?? "",
            remarks: expense.remarks ?? "",
          }
          : empty(defaultBranchId)
      );
    }
  }

  function set<K extends keyof ExpenseFormValues>(key: K, val: ExpenseFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Record Expense"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(values);
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="title">Expense Title</Label>
              <Input id="title" required value={values.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Branch office rent — July" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={values.category} onValueChange={(v) => set("category", v as ExpenseCategory)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>
                      {EXPENSE_CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input id="amount" type="number" min={0} required value={values.amount} onChange={(e) => set("amount", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Branch</Label>
              <Select value={values.branchId} onValueChange={(v) => set("branchId", v)} disabled={lockBranch}>
                <SelectTrigger className="w-full">
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
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" required value={values.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="paidTo">Paid To</Label>
              <Input id="paidTo" required value={values.paidTo} onChange={(e) => set("paidTo", e.target.value)} placeholder="Vendor / payee" />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Mode</Label>
              <Select value={values.paymentMode} onValueChange={(v) => set("paymentMode", v as PaymentMode)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {MODE_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="billNumber">Bill / Reference No. (optional)</Label>
              <Input id="billNumber" value={values.billNumber} onChange={(e) => set("billNumber", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="remarks">Remarks (optional)</Label>
              <Textarea id="remarks" value={values.remarks} onChange={(e) => set("remarks", e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter className="mt-5">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-maroon hover:bg-maroon-dark">
              {expense ? "Save Changes" : "Record Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}