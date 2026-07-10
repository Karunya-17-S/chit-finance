"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import type { Attendance, AttendanceStatus, Employee } from "@/types";

export interface AttendanceFormValues {
  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
  remarks: string;
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: "present", label: "Present" },
  { value: "half_day", label: "Half Day" },
  { value: "leave", label: "Leave" },
  { value: "absent", label: "Absent" },
  { value: "week_off", label: "Week Off" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee;
  date: string;
  existing?: Attendance;
  onSubmit: (values: AttendanceFormValues) => void;
  isSubmitting?: boolean;
}

export function MarkAttendanceDialog({ open, onOpenChange, employee, date, existing, onSubmit, isSubmitting }: Props) {
  const [values, setValues] = React.useState<AttendanceFormValues>({ status: "present", checkIn: "09:00", checkOut: "18:00", remarks: "" });
  const [wasOpen, setWasOpen] = React.useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues({
        status: existing?.status ?? "present",
        checkIn: existing?.checkIn ?? "09:00",
        checkOut: existing?.checkOut ?? "18:00",
        remarks: existing?.remarks ?? "",
      });
    }
  }

  function set<K extends keyof AttendanceFormValues>(key: K, val: AttendanceFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  const showTimes = values.status === "present" || values.status === "half_day";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogDescription>
            {employee?.name} · {formatDate(date, "medium")}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(values);
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={values.status} onValueChange={(v) => set("status", v as AttendanceStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {showTimes && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="checkIn">Check In</Label>
                <Input id="checkIn" type="time" value={values.checkIn} onChange={(e) => set("checkIn", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="checkOut">Check Out</Label>
                <Input id="checkOut" type="time" value={values.checkOut} onChange={(e) => set("checkOut", e.target.value)} />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="remarks">Remarks (optional)</Label>
            <Textarea id="remarks" rows={2} value={values.remarks} onChange={(e) => set("remarks", e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-maroon hover:bg-maroon-dark" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}