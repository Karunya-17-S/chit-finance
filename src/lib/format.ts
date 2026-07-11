const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrCompact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCurrency(amount: number): string {
  return inr.format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  return inrCompact.format(amount);
}

// Indian value label: "1 Lakh", "2.5 Lakh", "1 Crore".
export function formatValueLabel(amount: number): string {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `${Number.isInteger(cr) ? cr : cr.toFixed(2)} Crore`;
  }
  if (amount >= 100000) {
    const l = amount / 100000;
    return `${Number.isInteger(l) ? l : l.toFixed(2)} Lakh`;
  }
  return inr.format(amount);
}

export function formatDate(date: string | Date | null, style: "short" | "medium" | "long" = "medium"): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  const opts: Intl.DateTimeFormatOptions =
    style === "short"
      ? { day: "2-digit", month: "short" }
      : style === "long"
        ? { day: "2-digit", month: "long", year: "numeric", weekday: "long" }
        : { day: "2-digit", month: "short", year: "numeric" };
  return new Intl.DateTimeFormat("en-IN", opts).format(d);
}

// Formats a timestamp as a time-of-day string, e.g. "09:41 AM".
export function formatTime(date: string | Date | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(d);
}

// Today's date as "YYYY-MM-DD", based on the real system clock — use this
// instead of any hardcoded demo date anywhere in the app.
export function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatMonthLabel(month: string): string {
  // month is "YYYY-MM"
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, (m ?? 1) - 1, 1);
  return new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(d);
}

export function daysBetween(from: string | Date, to: string | Date = new Date()): number {
  const a = typeof from === "string" ? new Date(from) : from;
  const b = typeof to === "string" ? new Date(to) : to;
  const ms = b.setHours(0, 0, 0, 0) - a.setHours(0, 0, 0, 0);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export const FREQUENCY_LABELS: Record<"daily" | "weekly" | "monthly", string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export function frequencySuffix(frequency: "daily" | "weekly" | "monthly"): string {
  return frequency === "daily" ? "/day" : frequency === "weekly" ? "/week" : "/month";
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}