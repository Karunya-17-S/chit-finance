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
import type { FollowUp, FollowUpStatus } from "@/types";

export interface FollowUpFormValues {
  note: string;
  status: FollowUpStatus;
  nextFollowUpDate: string;
  promiseToPayDate: string;
}

interface FollowUpFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followUp?: FollowUp;
  customerName?: string;
  onSubmit: (values: FollowUpFormValues) => void;
}

const STATUS_OPTIONS: { value: FollowUpStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "follow_up", label: "Follow-up" },
  { value: "promise_to_pay", label: "Promise to Pay" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "risk", label: "Risk" },
];

export function FollowUpFormDialog({ open, onOpenChange, followUp, customerName, onSubmit }: FollowUpFormDialogProps) {
  const [values, setValues] = React.useState<FollowUpFormValues>({
    note: "",
    status: "follow_up",
    nextFollowUpDate: "",
    promiseToPayDate: "",
  });

  const [wasOpen, setWasOpen] = React.useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues({
        note: followUp?.note ?? "",
        status: followUp?.status ?? "follow_up",
        nextFollowUpDate: followUp?.nextFollowUpDate ?? "",
        promiseToPayDate: followUp?.promiseToPayDate ?? "",
      });
    }
  }

  function set<K extends keyof FollowUpFormValues>(key: K, value: FollowUpFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Follow-up Note</DialogTitle>
          <DialogDescription>{customerName ? `Update tracking status for ${customerName}.` : "Update tracking status."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="note">Remarks</Label>
            <Textarea id="note" required rows={3} value={values.note} onChange={(e) => set("note", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Status</Label>
              <Select value={values.status} onValueChange={(v) => set("status", v as FollowUpStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nextFollowUpDate">Next Follow-up</Label>
              <Input id="nextFollowUpDate" type="date" value={values.nextFollowUpDate} onChange={(e) => set("nextFollowUpDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="promiseToPayDate">Promise to Pay Date</Label>
              <Input id="promiseToPayDate" type="date" value={values.promiseToPayDate} onChange={(e) => set("promiseToPayDate", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-maroon hover:bg-maroon-dark">
              Save Note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
