"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrencyCompact } from "@/lib/format";

const COLORS: Record<string, string> = {
  Paid: "var(--success)",
  Partial: "var(--warning)",
  Pending: "var(--gold)",
  Overdue: "var(--destructive)",
};

export function PaymentStatusChart({ data }: { data: { status: string; count: number; amount: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v) => formatCurrencyCompact(Number(v))}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis type="category" dataKey="status" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={64} />
        <Tooltip
          formatter={(value, _name, item) => [
            `${formatCurrencyCompact(Number(value))} · ${(item.payload as { count: number }).count} installments`,
            (item.payload as { status: string }).status,
          ]}
          cursor={{ fill: "var(--secondary)" }}
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Bar dataKey="amount" radius={[0, 8, 8, 0]} maxBarSize={28}>
          {data.map((d) => (
            <Cell key={d.status} fill={COLORS[d.status]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
