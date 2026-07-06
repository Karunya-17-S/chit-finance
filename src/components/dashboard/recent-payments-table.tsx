import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/format";
import { getCustomerById, getChitGroupById } from "@/data";
import type { Payment } from "@/types";
import { Receipt } from "lucide-react";

export function RecentPaymentsTable({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return <EmptyState icon={Receipt} title="No recent payments" description="Collected payments will show up here." />;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Chit Group</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((p) => {
            const customer = getCustomerById(p.customerId);
            const group = getChitGroupById(p.chitGroupId);
            return (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-foreground">{customer?.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{group?.groupName ?? "—"}</TableCell>
                <TableCell className="font-semibold text-foreground">{formatCurrency(p.paidAmount)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(p.paymentDate, "short")}</TableCell>
                <TableCell className="text-muted-foreground capitalize">{p.paymentMode?.replace("_", " ") ?? "—"}</TableCell>
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
