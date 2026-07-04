"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, MessageSquareText, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Toolbar, SearchInput } from "@/components/shared/toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TemplateFormDialog, type TemplateFormValues } from "@/components/templates/template-form-dialog";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";
import { can } from "@/lib/rbac";
import { formatDate } from "@/lib/format";
import type { Template, TemplateType } from "@/types";

const TYPE_LABELS: Record<TemplateType, string> = {
  payment_reminder: "Payment Reminder",
  due_reminder: "Due Reminder",
  overdue_warning: "Overdue Warning",
  receipt_message: "Receipt Message",
  auction_notification: "Auction Notification",
  new_group_invite: "New Group Invite",
  festival_greeting: "Festival Greeting",
  branch_announcement: "Branch Announcement",
};

export default function TemplatesPage() {
  const templates = useDataStore((s) => s.templates);
  const addTemplate = useDataStore((s) => s.addTemplate);
  const updateTemplate = useDataStore((s) => s.updateTemplate);
  const deleteTemplate = useDataStore((s) => s.deleteTemplate);
  const currentUser = useAuthStore((s) => s.currentUser);
  const canManage = currentUser ? can(currentUser.role, "manageTemplates") : false;

  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [activeTemplate, setActiveTemplate] = React.useState<Template | undefined>(undefined);

  const filtered = templates.filter((t) => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  function handleAdd() {
    setActiveTemplate(undefined);
    setDialogOpen(true);
  }

  function handleEdit(t: Template) {
    setActiveTemplate(t);
    setDialogOpen(true);
  }

  function handleDelete(t: Template) {
    deleteTemplate(t.id);
    toast.success(`"${t.name}" template deleted.`);
  }

  function extractVariables(content: string): string[] {
    const matches = content.match(/{{\s*([\w]+)\s*}}/g) ?? [];
    return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, "").trim())));
  }

  function handleSubmit(values: TemplateFormValues) {
    const variables = extractVariables(values.content);
    const today = "2026-07-02";
    if (activeTemplate) {
      updateTemplate(activeTemplate.id, { ...values, variables, updatedAt: today });
      toast.success("Template updated successfully.");
    } else {
      addTemplate({
        id: `tpl-${String(templates.length + 1).padStart(3, "0")}`,
        variables,
        createdAt: today,
        updatedAt: today,
        ...values,
      });
      toast.success("Template created successfully.");
    }
    setDialogOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Templates"
        description="Reusable WhatsApp / SMS message templates for customer communication."
        actions={
          canManage && (
            <Button onClick={handleAdd} className="bg-maroon hover:bg-maroon-dark">
              <Plus className="h-4 w-4" /> Create Template
            </Button>
          )
        }
      />

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search templates..." />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Toolbar>

      {filtered.length === 0 ? (
        <EmptyState icon={MessageSquareText} title="No templates found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => (
            <div key={t.id} className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-foreground">{t.name}</p>
                  <Badge variant="outline" className="mt-1 rounded-full border-gold/40 bg-gold/10 text-xs text-maroon">
                    {TYPE_LABELS[t.type]}
                  </Badge>
                </div>
              </div>
              <p className="mb-3 line-clamp-4 flex-1 rounded-lg bg-secondary p-3 text-xs text-muted-foreground">{t.content}</p>
              <div className="mb-3 flex flex-wrap gap-1">
                {t.variables.map((v) => (
                  <span key={v} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <p className="text-[11px] text-muted-foreground">Updated {formatDate(t.updatedAt, "short")}</p>
                {canManage && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(t)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(t)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <TemplateFormDialog open={dialogOpen} onOpenChange={setDialogOpen} template={activeTemplate} onSubmit={handleSubmit} />
    </div>
  );
}
