import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatMonthLabel } from "@/lib/format";
import { getCustomerById, getChitGroupById, getBranchById } from "@/data";
import type { Payment } from "@/types";
import { CalendarClock } from "lucide-react";

export function UpcomingDuesTable({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return <EmptyState icon={CalendarClock} title="No upcoming dues" description="Pending and overdue installments will show up here." />;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Chit Group</TableHead>
            <TableHead>Month</TableHead>
            <TableHead>Due Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((p) => {
            const customer = getCustomerById(p.customerId);
            const group = getChitGroupById(p.chitGroupId);
            const branch = getBranchById(p.branchId);
            return (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-foreground">{customer?.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{branch?.location ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{group?.groupName ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{formatMonthLabel(p.month)}</TableCell>
                <TableCell className="font-semibold text-foreground">{formatCurrency(p.dueAmount - p.paidAmount)}</TableCell>
                <TableCell>
                  <StatusBadge status={p.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
