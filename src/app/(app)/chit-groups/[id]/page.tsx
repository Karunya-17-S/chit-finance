"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Layers, Users, Gavel, Receipt, Coins, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";
import { can } from "@/lib/rbac";
import { getMembersByGroup, getAuctionsByGroup } from "@/data";
import { formatCurrency, formatCurrencyCompact, formatDate, FREQUENCY_LABELS, frequencySuffix } from "@/lib/format";
import type { ChitMember } from "@/types";

export default function ChitGroupDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const chitGroups = useDataStore((s) => s.chitGroups);
  const branches = useDataStore((s) => s.branches);
  const employees = useDataStore((s) => s.employees);
  const customers = useDataStore((s) => s.customers);
  const payments = useDataStore((s) => s.payments);
  const updateChitGroup = useDataStore((s) => s.updateChitGroup);
  const currentUser = useAuthStore((s) => s.currentUser);
  const canManage = currentUser ? can(currentUser.role, "manageChitGroups") : false;

  const group = chitGroups.find((g) => g.id === params.id);
  const [members, setMembers] = React.useState<ChitMember[]>(() => (group ? getMembersByGroup(group.id) : []));
  const [selectedNewMember, setSelectedNewMember] = React.useState("");

  if (!group) {
    return (
      <EmptyState
        icon={Layers}
        title="Chit group not found"
        description="This chit group may have been removed."
        action={
          <Button variant="outline" onClick={() => router.push("/chit-groups")}>
            Back to Chit Groups
          </Button>
        }
      />
    );
  }

  const branch = branches.find((b) => b.id === group.branchId);
  const collector = employees.find((e) => e.id === group.collectionEmployeeId);
  const auctions = getAuctionsByGroup(group.id);
  const groupPayments = payments.filter((p) => p.chitGroupId === group.id).sort((a, b) => b.month.localeCompare(a.month));
  const nextAuction = auctions.find((a) => a.status === "scheduled");

  const branchCustomers = customers.filter((c) => c.branchId === group.branchId);
  const memberCustomerIds = new Set(members.map((m) => m.customerId));
  const availableCustomers = branchCustomers.filter((c) => !memberCustomerIds.has(c.id));

  // Due schedule generated per collection frequency; long daily/weekly schedules
  // are capped for display.
  const SCHEDULE_DISPLAY_CAP = 60;
  const totalPeriods =
    group.collectionFrequency === "daily"
      ? group.durationMonths * 30
      : group.collectionFrequency === "weekly"
        ? Math.round((group.durationMonths * 52) / 12)
        : group.durationMonths;
  const periodLabel = group.collectionFrequency === "daily" ? "Day" : group.collectionFrequency === "weekly" ? "Week" : "Month";
  const schedule = Array.from({ length: Math.min(totalPeriods, SCHEDULE_DISPLAY_CAP) }, (_, i) => {
    const dueDate = new Date(group.startDate);
    if (group.collectionFrequency === "daily") dueDate.setDate(dueDate.getDate() + i);
    else if (group.collectionFrequency === "weekly") dueDate.setDate(dueDate.getDate() + i * 7);
    else dueDate.setMonth(dueDate.getMonth() + i);
    const isPast = dueDate < new Date("2026-07-02");
    return { period: i + 1, dueDate: dueDate.toISOString().slice(0, 10), amount: group.monthlyInstallment, status: isPast ? "completed" : "pending" };
  });

  function handleAddMember() {
    if (!selectedNewMember || !group) return;
    const newMember: ChitMember = {
      id: `cm-local-${Date.now()}`,
      chitGroupId: group.id,
      customerId: selectedNewMember,
      agreementNo: String(134 + members.length),
      joinedDate: "2026-07-02",
      hasWon: false,
      status: "active",
    };
    setMembers((prev) => [...prev, newMember]);
    setSelectedNewMember("");

    // Member capacity is flexible — joining beyond the planned count extends it.
    const newCount = group.currentMembers + 1;
    if (newCount > group.totalMembers) {
      updateChitGroup(group.id, { currentMembers: newCount, totalMembers: newCount });
      toast.success(`Member added — group capacity extended to ${newCount}.`);
    } else {
      updateChitGroup(group.id, { currentMembers: newCount });
      toast.success("Member added to chit group.");
    }
  }

  return (
    <div>
      <Link href="/chit-groups" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Chit Groups
      </Link>

      <PageHeader
        title={group.groupName}
        description={`${group.groupCode} · ${branch?.location ?? "—"} · Collector: ${collector?.name ?? "Unassigned"}`}
        actions={<StatusBadge status={group.status} />}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Chit Value" value={formatCurrencyCompact(group.chitValue)} icon={Coins} />
        <StatCard
          label={`${FREQUENCY_LABELS[group.collectionFrequency]} Installment`}
          value={`${formatCurrency(group.monthlyInstallment)}${frequencySuffix(group.collectionFrequency)}`}
          icon={Receipt}
        />
        <StatCard label="Members" value={`${group.currentMembers}/${group.totalMembers}`} icon={Users} hint="Capacity extendable" />
        <StatCard label="Foreman Commission" value={formatCurrencyCompact(group.foremanCommission)} icon={Gavel} />
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          <TabsTrigger value="schedule">Due Schedule</TabsTrigger>
          <TabsTrigger value="auctions">Auctions ({auctions.length})</TabsTrigger>
          <TabsTrigger value="ledger">Group Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <SectionCard
            title="Member List & Prize Winners"
            actions={
              canManage &&
              availableCustomers.length > 0 && (
                <div className="flex items-center gap-2">
                  <Select value={selectedNewMember} onValueChange={setSelectedNewMember}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCustomers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="bg-maroon hover:bg-maroon-dark" disabled={!selectedNewMember} onClick={handleAddMember}>
                    <UserPlus className="h-4 w-4" /> Add
                  </Button>
                </div>
              )
            }
          >
            {members.length === 0 ? (
              <EmptyState icon={Users} title="No members yet" description="Add customers to this chit group to get started." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Prize Status</TableHead>
                      <TableHead>Amount Won</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m) => {
                      const customer = customers.find((c) => c.id === m.customerId);
                      return (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium text-foreground">
                            <Link href={`/customers/${m.customerId}`} className="hover:text-maroon hover:underline">
                              {customer?.name ?? "—"}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(m.joinedDate, "short")}</TableCell>
                          <TableCell className="text-muted-foreground">{m.hasWon ? `Won · Month ${m.wonMonth}` : "Not yet won"}</TableCell>
                          <TableCell className="text-muted-foreground">{m.wonAmount ? formatCurrency(m.wonAmount) : "—"}</TableCell>
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

        <TabsContent value="schedule">
          <SectionCard
            title={`${FREQUENCY_LABELS[group.collectionFrequency]} Due Schedule`}
            description={
              totalPeriods > SCHEDULE_DISPLAY_CAP
                ? `Showing first ${SCHEDULE_DISPLAY_CAP} of ${totalPeriods} collection periods.`
                : `${totalPeriods} collection periods in total.`
            }
          >
            <div className="max-h-[420px] overflow-y-auto overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{periodLabel}</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Installment Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map((s) => (
                    <TableRow key={s.period}>
                      <TableCell className="font-medium text-foreground">
                        {periodLabel} {s.period}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(s.dueDate, "short")}</TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(s.amount)}</TableCell>
                      <TableCell>
                        <StatusBadge status={s.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="auctions">
          <div className="space-y-4">
            <SectionCard title="Auction History">
              {auctions.length === 0 ? (
                <EmptyState icon={Gavel} title="No auctions yet" description="Auctions will appear here once the group starts." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Auction Date</TableHead>
                        <TableHead>Winner</TableHead>
                        <TableHead>Bid Amount</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Dividend / Member</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auctions.map((a) => {
                        const winner = customers.find((c) => c.id === a.winnerCustomerId);
                        return (
                          <TableRow key={a.id}>
                            <TableCell className="text-muted-foreground">Month {a.month}</TableCell>
                            <TableCell className="text-muted-foreground">{formatDate(a.auctionDate, "short")}</TableCell>
                            <TableCell className="font-medium text-foreground">{winner?.name ?? "—"}</TableCell>
                            <TableCell className="text-muted-foreground">{a.bidAmount ? formatCurrency(a.bidAmount) : "—"}</TableCell>
                            <TableCell className="text-muted-foreground">{a.discountAmount ? formatCurrency(a.discountAmount) : "—"}</TableCell>
                            <TableCell className="text-muted-foreground">{a.dividendPerMember ? formatCurrency(a.dividendPerMember) : "—"}</TableCell>
                            <TableCell>
                              <StatusBadge status={a.status} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </SectionCard>

            {nextAuction && (
              <SectionCard title="Dividend Calculation (Next Auction)" description="Estimated placeholder — finalized once bids are received.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-secondary p-4">
                    <p className="text-xs text-muted-foreground">Chit Value</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(group.chitValue)}</p>
                  </div>
                  <div className="rounded-xl bg-secondary p-4">
                    <p className="text-xs text-muted-foreground">Foreman Commission ({group.commissionPercentage}%)</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(group.foremanCommission)}</p>
                  </div>
                  <div className="rounded-xl bg-secondary p-4">
                    <p className="text-xs text-muted-foreground">Estimated Dividend Pool</p>
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(Math.round((group.chitValue - group.foremanCommission) * 0.1))}
                    </p>
                  </div>
                </div>
              </SectionCard>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ledger">
          <SectionCard title="Group Ledger" description="All installment transactions recorded for this chit group.">
            {groupPayments.length === 0 ? (
              <EmptyState icon={Receipt} title="No transactions yet" />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupPayments.map((p) => {
                      const customer = customers.find((c) => c.id === p.customerId);
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium text-foreground">{customer?.name ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{p.month}</TableCell>
                          <TableCell className="text-muted-foreground">{formatCurrency(p.dueAmount)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatCurrency(p.paidAmount)}</TableCell>
                          <TableCell className="text-muted-foreground">{p.receiptNumber ?? "—"}</TableCell>
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
      </Tabs>
    </div>
  );
}
