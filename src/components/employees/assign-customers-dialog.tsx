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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";
import type { Customer, Employee } from "@/types";

interface AssignCustomersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee;
  branchCustomers: Customer[];
  onSubmit: (customerIds: string[]) => void;
}

export function AssignCustomersDialog({ open, onOpenChange, employee, branchCustomers, onSubmit }: AssignCustomersDialogProps) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [wasOpen, setWasOpen] = React.useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && employee) {
      setSelected(new Set(employee.assignedCustomerIds));
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Customers</DialogTitle>
          <DialogDescription>
            Choose which branch customers {employee?.name} is responsible for collecting from.
          </DialogDescription>
        </DialogHeader>

        {branchCustomers.length === 0 ? (
          <EmptyState icon={Users} title="No customers in this branch" />
        ) : (
          <ScrollArea className="h-72 rounded-lg border border-border">
            <div className="divide-y divide-border">
              {branchCustomers.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-secondary">
                  <Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggle(c.id)} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.customerCode} · {c.phone}</p>
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="bg-maroon hover:bg-maroon-dark" onClick={() => onSubmit(Array.from(selected))}>
            Save Assignment ({selected.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
