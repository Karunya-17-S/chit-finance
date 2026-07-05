"use client";

import * as React from "react";
import { CalendarRange, Coins, Users, TrendingUp, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { chitPlans } from "@/data";
import { formatCurrency, formatValueLabel, FREQUENCY_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ChitPlan } from "@/types";

const GROUPS: { key: string; label: string; match: (p: ChitPlan) => boolean }[] = [
  { key: "all", label: "All Plans", match: () => true },
  { key: "monthly", label: "Monthly", match: (p) => p.frequency === "monthly" },
  { key: "weekly", label: "Weekly / Daily", match: (p) => p.frequency === "weekly" || p.frequency === "daily" },
];

export default function PlansPage() {
  const [active, setActive] = React.useState<ChitPlan | null>(null);

  return (
    <div>
      <PageHeader
        title="Chit Plans"
        description="Official Shree Vari chit schemes with month-by-month payable and payout amounts."
      />

      <Tabs defaultValue="all">
        <TabsList>
          {GROUPS.map((g) => (
            <TabsTrigger key={g.key} value={g.key}>
              {g.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {GROUPS.map((g) => (
          <TabsContent key={g.key} value={g.key}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {chitPlans.filter(g.match).map((plan) => (
                <PlanCard key={plan.id} plan={plan} onView={() => setActive(plan)} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <ScheduleDialog plan={active} onClose={() => setActive(null)} />
    </div>
  );
}

function PlanCard({ plan, onView }: { plan: ChitPlan; onView: () => void }) {
  const first = plan.schedule[0];
  const last = plan.schedule[plan.schedule.length - 1];
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
      <div className="relative bg-gradient-to-br from-maroon-darker via-maroon to-maroon-dark p-5 text-white">
        {plan.featured && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gold/90 px-2 py-0.5 text-[10px] font-bold text-maroon-darker">
            <Star className="h-3 w-3" /> Popular
          </span>
        )}
        <p className="text-xs font-medium uppercase tracking-wide text-gold-light/90">Chit Value</p>
        <p className="mt-0.5 text-2xl font-bold">{formatValueLabel(plan.chitValue)}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/80">
          <span className="flex items-center gap-1">
            <CalendarRange className="h-3.5 w-3.5" /> {plan.durationLabel}
          </span>
          <span className="flex items-center gap-1">
            <Coins className="h-3.5 w-3.5" /> {FREQUENCY_LABELS[plan.frequency]}
          </span>
          {plan.members != null && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {plan.members} members
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Starting installment</dt>
            <dd className="font-semibold text-foreground">{formatCurrency(first.installment)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Final installment</dt>
            <dd className="font-semibold text-foreground">{formatCurrency(last.installment)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Total payable</dt>
            <dd className="font-semibold text-foreground">{formatCurrency(plan.totalPayable)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Max payout</dt>
            <dd className="font-semibold text-success">{formatCurrency(Math.max(...plan.schedule.map((r) => r.payout)))}</dd>
          </div>
        </dl>

        {(plan.dailyApprox || plan.weeklyApprox) && (
          <p className="mt-3 rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
            Approx.
            {plan.dailyApprox ? ` ₹${plan.dailyApprox}/day` : ""}
            {plan.dailyApprox && plan.weeklyApprox ? " ·" : ""}
            {plan.weeklyApprox ? ` ₹${plan.weeklyApprox}/week` : ""}
          </p>
        )}

        <Button variant="outline" className="mt-4 w-full" onClick={onView}>
          <TrendingUp className="h-4 w-4" /> View Calculation Chart
        </Button>
      </div>
    </div>
  );
}

function ScheduleDialog({ plan, onClose }: { plan: ChitPlan | null; onClose: () => void }) {
  const periodLabel = plan?.frequency === "weekly" || plan?.frequency === "daily" ? "Week" : "Month";
  return (
    <Dialog open={!!plan} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-lg">
        {plan && (
          <>
            <DialogHeader>
              <DialogTitle>
                {formatValueLabel(plan.chitValue)} — {plan.durationLabel}
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-2.5 text-sm">
              <span className="text-muted-foreground">
                {FREQUENCY_LABELS[plan.frequency]} · {plan.periods} installments
              </span>
              <span className="font-semibold text-foreground">
                Total {formatCurrency(plan.totalPayable)}
              </span>
            </div>
            <div className="mt-3 max-h-[55vh] overflow-y-auto rounded-xl border border-border">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead className="w-16">{periodLabel}</TableHead>
                    <TableHead>Installment</TableHead>
                    <TableHead className="text-right">Payout</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.schedule.map((row, i) => (
                    <TableRow key={row.period} className={cn(i % 2 === 1 && "bg-secondary/30")}>
                      <TableCell className="font-medium text-foreground">{row.period}</TableCell>
                      <TableCell className="text-foreground">{formatCurrency(row.installment)}</TableCell>
                      <TableCell className="text-right font-medium text-success">{formatCurrency(row.payout)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Approximate calculation chart. Installment = amount payable that {periodLabel.toLowerCase()}; payout = amount received if the
              chit is taken that {periodLabel.toLowerCase()}. Terms &amp; conditions apply.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
