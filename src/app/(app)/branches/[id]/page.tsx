"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, Mail, MapPin, Phone, User, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/store/data-store";
import { formatCurrency, formatCurrencyCompact, formatDate } from "@/lib/format";
import { Users, Layers, Wallet, AlertCircle } from "lucide-react";
import { computeRecentPayments } from "@/data";

export default function BranchDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const branches = useDataStore((s) => s.branches);
  const employees = useDataStore((s) => s.employees);
  const customers = useDataStore((s) => s.customers);
  const chitGroups = useDataStore((s) => s.chitGroups);
  const payments = useDataStore((s) => s.payments);

  const branch = branches.find((b) => b.id === params.id);

  if (!branch) {
    return (
      <EmptyState
        icon={Building2}
        title="Branch not found"
        description="This branch may have been removed."
        action={
          <Button variant="outline" onClick={() => router.push("/branches")}>
            Back to Branches
          </Button>
        }
      />
    );
  }

  const branchEmployees = employees.filter((e) => e.branchId === branch.id);
  const branchCustomers = customers.filter((c) => c.branchId === branch.id);
  const branchGroups = chitGroups.filter((g) => g.branchId === branch.id);
  const recentPayments = computeRecentPayments(payments, { branchId: branch.id }, 8);

  return (
    <div>
      <Link href="/branches" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Branches
      </Link>

      <PageHeader
        title={branch.name}
        description={`${branch.code} · ${branch.location}`}
        actions={<StatusBadge status={branch.status} />}
      />

      <SectionCard title="Branch Information" className="mb-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem icon={MapPin} label="Address" value={branch.address} />
          <InfoItem icon={User} label="Manager" value={branch.managerName} />
          <InfoItem icon={Phone} label="Phone" value={branch.phone} />
          <InfoItem icon={Mail} label="Email" value={branch.email} />
          <InfoItem icon={CalendarDays} label="Opening Date" value={formatDate(branch.openingDate)} />
        </div>
      </SectionCard>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Customers" value={String(branch.totalCustomers)} icon={Users} />
        <StatCard label="Active Chit Groups" value={String(branch.activeChitGroups)} icon={Layers} />
        <StatCard label="Monthly Collection" value={formatCurrencyCompact(branch.monthlyCollection)} icon={Wallet} />
        <StatCard label="Pending Amount" value={formatCurrencyCompact(branch.pendingAmount)} icon={AlertCircle} />
      </div>

      <Tabs defaultValue="employees">
        <TabsList>
          <TabsTrigger value="employees">Employees ({branchEmployees.length})</TabsTrigger>
          <TabsTrigger value="customers">Customers ({branchCustomers.length})</TabsTrigger>
          <TabsTrigger value="groups">Chit Groups ({branchGroups.length})</TabsTrigger>
          <TabsTrigger value="payments">Recent Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <SectionCard title="Branch Employees">
            {branchEmployees.length === 0 ? (
              <EmptyState icon={Users} title="No employees" description="Add employees to this branch from the Employees module." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Target vs Achieved</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branchEmployees.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium text-foreground">{e.name}</TableCell>
                        <TableCell className="capitalize text-muted-foreground">{e.role.replace("_", " ")}</TableCell>
                        <TableCell className="text-muted-foreground">{e.phone}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {e.collectionTarget > 0 ? `${formatCurrencyCompact(e.collectionAchieved)} / ${formatCurrencyCompact(e.collectionTarget)}` : "—"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={e.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="customers">
          <SectionCard title="Branch Customers">
            {branchCustomers.length === 0 ? (
              <EmptyState icon={Users} title="No customers" description="Add customers to this branch from the Customers module." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Occupation</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branchCustomers.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-foreground">
                          <Link href={`/customers/${c.id}`} className="hover:text-maroon hover:underline">
                            {c.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                        <TableCell className="text-muted-foreground">{c.occupation}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(c.joinedDate, "short")}</TableCell>
                        <TableCell>
                          <StatusBadge status={c.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="groups">
          <SectionCard title="Branch Chit Groups">
            {branchGroups.length === 0 ? (
              <EmptyState icon={Layers} title="No chit groups" description="Create a chit group for this branch from the Chit Groups module." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Group Name</TableHead>
                      <TableHead>Chit Value</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branchGroups.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium text-foreground">
                          <Link href={`/chit-groups/${g.id}`} className="hover:text-maroon hover:underline">
                            {g.groupName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatCurrency(g.chitValue)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {g.currentMembers}/{g.totalMembers}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{g.durationMonths} months</TableCell>
                        <TableCell>
                          <StatusBadge status={g.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="payments">
          <SectionCard title="Recent Payments">
            {recentPayments.length === 0 ? (
              <EmptyState icon={Wallet} title="No payments yet" description="Collected payments for this branch will appear here." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPayments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-foreground">{p.paymentCode}</TableCell>
                        <TableCell className="text-muted-foreground">{formatCurrency(p.paidAmount)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(p.paymentDate, "short")}</TableCell>
                        <TableCell className="capitalize text-muted-foreground">{p.paymentMode?.replace("_", " ") ?? "—"}</TableCell>
                        <TableCell>
                          <StatusBadge status={p.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
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
