"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Contact,
  Phone,
  MapPin,
  Briefcase,
  Wallet,
  UserPlus,
  CalendarDays,
  IdCard,
  BookMarked,
  FileText,
  Upload,
  Layers,
  Receipt,
  Hourglass,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { SectionCard } from "@/components/shared/section-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/store/data-store";
import { getGroupsByCustomer } from "@/data";
import { formatCurrency, formatDate, initials } from "@/lib/format";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const customers = useDataStore((s) => s.customers);
  const branches = useDataStore((s) => s.branches);
  const employees = useDataStore((s) => s.employees);
  const chitGroups = useDataStore((s) => s.chitGroups);
  const payments = useDataStore((s) => s.payments);

  const customer = customers.find((c) => c.id === params.id);

  if (!customer) {
    return (
      <EmptyState
        icon={Contact}
        title="Customer not found"
        description="This customer may have been removed."
        action={
          <Button variant="outline" onClick={() => router.push("/customers")}>
            Back to Customers
          </Button>
        }
      />
    );
  }

  const branch = branches.find((b) => b.id === customer.branchId);
  const employee = employees.find((e) => e.id === customer.assignedEmployeeId);
  const memberships = getGroupsByCustomer(customer.id);
  const customerPayments = payments
    .filter((p) => p.customerId === customer.id)
    .sort((a, b) => b.month.localeCompare(a.month));
  const pendingDues = customerPayments.filter((p) => p.status === "pending" || p.status === "overdue");

  return (
    <div>
      <Link href="/customers" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </Link>

      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-maroon text-lg font-bold text-white">
            {initials(customer.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{customer.name}</h2>
              <StatusBadge status={customer.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {customer.customerCode} · {branch?.location ?? "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserPlus className="h-4 w-4 text-gold" />
          Assigned to <span className="font-medium text-foreground">{employee?.name ?? "Unassigned"}</span>
        </div>
      </div>

      <SectionCard title="KYC & Contact Information" className="mb-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem icon={BookMarked} label="Passbook Number" value={customer.passbookNumber} />
          <InfoItem icon={Phone} label="Phone" value={customer.phone} />
          <InfoItem icon={Phone} label="Alternate Phone" value={customer.alternatePhone ?? "—"} />
          <InfoItem icon={MapPin} label="Address" value={customer.address} />
          <InfoItem icon={IdCard} label="Aadhaar Number" value={customer.aadhaarNumber} />
          <InfoItem icon={IdCard} label="PAN Number" value={customer.panNumber} />
          <InfoItem icon={Briefcase} label="Occupation" value={customer.occupation} />
          <InfoItem icon={Wallet} label="Monthly Income" value={formatCurrency(customer.monthlyIncome)} />
          <InfoItem icon={CalendarDays} label="Joined Date" value={formatDate(customer.joinedDate)} />
          <InfoItem icon={UserPlus} label="Nominee" value={`${customer.nomineeName} · ${customer.nomineePhone}`} />
        </div>
      </SectionCard>

      <Tabs defaultValue="chits">
        <TabsList>
          <TabsTrigger value="chits">Chit History ({memberships.length})</TabsTrigger>
          <TabsTrigger value="payments">Payment History ({customerPayments.length})</TabsTrigger>
          <TabsTrigger value="dues">Pending Dues ({pendingDues.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="chits">
          <SectionCard title="Chit Group Membership">
            {memberships.length === 0 ? (
              <EmptyState icon={Layers} title="No chit group memberships" description="This customer has not joined any chit groups yet." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Group</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Prize Won</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberships.map((m) => {
                      const group = chitGroups.find((g) => g.id === m.chitGroupId);
                      return (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium text-foreground">
                            <Link href={`/chit-groups/${m.chitGroupId}`} className="hover:text-maroon hover:underline">
                              {group?.groupName ?? "—"}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(m.joinedDate, "short")}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {m.hasWon ? `Month ${m.wonMonth}` : "Not yet won"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{m.hasWon && m.wonAmount ? formatCurrency(m.wonAmount) : "—"}</TableCell>
                          <TableCell>
                            <StatusBadge status={m.status} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="payments">
          <SectionCard title="Payment History">
            {customerPayments.length === 0 ? (
              <EmptyState icon={Receipt} title="No payments yet" description="Collected payments for this customer will appear here." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Chit Group</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerPayments.map((p) => {
                      const group = chitGroups.find((g) => g.id === p.chitGroupId);
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="text-muted-foreground">{p.month}</TableCell>
                          <TableCell className="text-muted-foreground">{group?.groupName ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{formatCurrency(p.dueAmount)}</TableCell>
                          <TableCell className="font-medium text-foreground">{formatCurrency(p.paidAmount)}</TableCell>
                          <TableCell className="capitalize text-muted-foreground">{p.paymentMode?.replace("_", " ") ?? "—"}</TableCell>
                          <TableCell>
                            <StatusBadge status={p.status} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="dues">
          <SectionCard title="Pending Dues">
            {pendingDues.length === 0 ? (
              <EmptyState icon={Hourglass} title="No pending dues" description="This customer is fully up to date on payments." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Chit Group</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingDues.map((p) => {
                      const group = chitGroups.find((g) => g.id === p.chitGroupId);
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="text-muted-foreground">{p.month}</TableCell>
                          <TableCell className="text-muted-foreground">{group?.groupName ?? "—"}</TableCell>
                          <TableCell className="font-semibold text-destructive">{formatCurrency(p.dueAmount - p.paidAmount)}</TableCell>
                          <TableCell>
                            <StatusBadge status={p.status} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="documents">
          <SectionCard title="KYC Documents" description="Document uploads are not yet connected to storage in this preview.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {["Aadhaar Card", "PAN Card", "Photograph"].map((doc) => (
                <div key={doc} className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-6 text-center">
                  <FileText className="h-7 w-7 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">{doc}</p>
                  <p className="text-xs text-muted-foreground">Not uploaded</p>
                  <Button variant="outline" size="sm" disabled className="mt-1">
                    <Upload className="h-3.5 w-3.5" /> Upload
                  </Button>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
