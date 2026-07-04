import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-success/15 text-success border-success/30" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground border-border" },
  completed: { label: "Completed", className: "bg-gold/20 text-maroon border-gold/40" },
  pending: { label: "Pending", className: "bg-warning/15 text-warning border-warning/30" },
  paid: { label: "Paid", className: "bg-success/15 text-success border-success/30" },
  partial: { label: "Partial", className: "bg-warning/15 text-warning border-warning/30" },
  overdue: { label: "Overdue", className: "bg-destructive/15 text-destructive border-destructive/30" },
  new: { label: "New", className: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  follow_up: { label: "Follow-up", className: "bg-warning/15 text-warning border-warning/30" },
  promise_to_pay: { label: "Promise to Pay", className: "bg-violet-500/10 text-violet-600 border-violet-500/30" },
  risk: { label: "Risk", className: "bg-destructive/15 text-destructive border-destructive/30" },
  scheduled: { label: "Scheduled", className: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  checked_in: { label: "Checked In", className: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  moving: { label: "Moving", className: "bg-warning/15 text-warning border-warning/30" },
  collecting: { label: "Collecting", className: "bg-success/15 text-success border-success/30" },
  idle: { label: "Idle", className: "bg-muted text-muted-foreground border-border" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = STATUS_MAP[status] ?? { label: status, className: "bg-muted text-muted-foreground border-border" };
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium capitalize", config.className, className)}>
      {config.label}
    </Badge>
  );
}
