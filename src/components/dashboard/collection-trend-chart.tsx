"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrencyCompact } from "@/lib/format";
import type { MonthlyTrendPoint } from "@/data/trends";

export function CollectionTrendChart({ data }: { data: MonthlyTrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="collectedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--maroon)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--maroon)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={(v) => formatCurrencyCompact(Number(v))}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={64}
        />
        <Tooltip
          formatter={(value) => formatCurrencyCompact(Number(value))}
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Area type="monotone" dataKey="target" stroke="var(--gold)" fill="url(#targetGradient)" strokeWidth={2} name="Target" />
        <Area type="monotone" dataKey="collected" stroke="var(--maroon)" fill="url(#collectedGradient)" strokeWidth={2.5} name="Collected" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
