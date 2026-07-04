export interface MonthlyTrendPoint {
  month: string;
  collected: number;
  target: number;
}

// Last 6 months company-wide collection trend (Feb 2026 - Jul 2026, current month in progress).
export const collectionTrend: MonthlyTrendPoint[] = [
  { month: "Feb 2026", collected: 2650000, target: 2800000 },
  { month: "Mar 2026", collected: 2790000, target: 2850000 },
  { month: "Apr 2026", collected: 2920000, target: 2900000 },
  { month: "May 2026", collected: 3010000, target: 3000000 },
  { month: "Jun 2026", collected: 3125000, target: 3100000 },
  { month: "Jul 2026", collected: 486000, target: 3200000 },
];
