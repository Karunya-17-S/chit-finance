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
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Template, TemplateType } from "@/types";

export interface TemplateFormValues {
  name: string;
  type: TemplateType;
  content: string;
}

const TYPE_OPTIONS: { value: TemplateType; label: string }[] = [
  { value: "payment_reminder", label: "Payment Reminder" },
  { value: "due_reminder", label: "Due Reminder" },
  { value: "overdue_warning", label: "Overdue Warning" },
  { value: "receipt_message", label: "Receipt Message" },
  { value: "auction_notification", label: "Auction Notification" },
  { value: "new_group_invite", label: "New Group Invite" },
  { value: "festival_greeting", label: "Festival Greeting" },
  { value: "branch_announcement", label: "Branch Announcement" },
];

const VARIABLES = ["customer_name", "group_name", "due_amount", "due_date", "branch_name", "receipt_no"];

const EMPTY: TemplateFormValues = { name: "", type: "payment_reminder", content: "" };

interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: Template;
  onSubmit: (values: TemplateFormValues) => void;
}

export function TemplateFormDialog({ open, onOpenChange, template, onSubmit }: TemplateFormDialogProps) {
  const [values, setValues] = React.useState<TemplateFormValues>(EMPTY);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [wasOpen, setWasOpen] = React.useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues(template ? { name: template.name, type: template.type, content: template.content } : EMPTY);
    }
  }

  function set<K extends keyof TemplateFormValues>(key: K, value: TemplateFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function insertVariable(variable: string) {
    const token = `{{${variable}}}`;
    const el = textareaRef.current;
    if (!el) {
      set("content", values.content + token);
      return;
    }
    const start = el.selectionStart ?? values.content.length;
    const end = el.selectionEnd ?? values.content.length;
    const next = values.content.slice(0, start) + token + values.content.slice(end);
    set("content", next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Template" : "Create Template"}</DialogTitle>
          <DialogDescription>Compose a reusable WhatsApp / SMS message template.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Template Name</Label>
            <Input id="name" required value={values.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={values.type} onValueChange={(v) => set("type", v as TemplateType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content">Message Content</Label>
            <Textarea
              id="content"
              ref={textareaRef}
              required
              rows={5}
              value={values.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Dear {{customer_name}}, your installment of {{due_amount}} is due..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Insert Variable</Label>
            <div className="flex flex-wrap gap-1.5">
              {VARIABLES.map((v) => (
                <Badge
                  key={v}
                  variant="outline"
                  className="cursor-pointer rounded-full border-gold/40 bg-gold/10 text-maroon hover:bg-gold/20"
                  onClick={() => insertVariable(v)}
                >
                  {`{{${v}}}`}
                </Badge>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-maroon hover:bg-maroon-dark">
              {template ? "Save Changes" : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
