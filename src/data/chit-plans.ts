import type { ChitPlan, ChitPlanRow } from "@/types";

// Official Shree Vari Chits calculation charts, transcribed from the company's
// printed plan sheets. `installment` = சிட்டு கட்ட வேண்டிய தொகை (amount to pay),
// `payout` = கிடைக்கும் தொகை (amount received if the chit is taken that period).
function rows(installments: number[], payouts: number[]): ChitPlanRow[] {
  return installments.map((installment, i) => ({ period: i + 1, installment, payout: payouts[i] }));
}

const total = (installments: number[]) => installments.reduce((s, n) => s + n, 0);

// ---- 10-month monthly plans -------------------------------------------------
const p1L10 = [6900, 7500, 7800, 8100, 8500, 8800, 9100, 9400, 9700, 10000];
const p1L10pay = [65000, 71000, 74000, 77000, 81000, 84000, 87000, 90000, 93000, 96000];

const p2L10 = [13800, 15000, 15600, 16200, 17000, 17600, 18200, 18800, 19400, 20000];
const p2L10pay = [130000, 142000, 148000, 154000, 162000, 168000, 174000, 180000, 186000, 192000];

const p3L10 = [20700, 22500, 23400, 24300, 25500, 26400, 27300, 28200, 29100, 30000];
const p3L10pay = [195000, 213000, 222000, 231000, 243000, 252000, 261000, 270000, 279000, 288000];

const p5L10 = [34500, 37500, 39000, 40500, 42500, 44000, 45500, 47000, 48000, 50000];
const p5L10pay = [325000, 355000, 370000, 385000, 405000, 420000, 435000, 450000, 465000, 480000];

const p10L10 = [69000, 75000, 78000, 81000, 85000, 88000, 91000, 94000, 97000, 100000];
const p10L10pay = [650000, 710000, 740000, 771000, 810000, 840000, 870000, 900000, 930000, 960000];

// ---- 20-month monthly plans -------------------------------------------------
const p1L20 = [3450, 3550, 3600, 3700, 3750, 3850, 3875, 3925, 4000, 4150, 4200, 4300, 4400, 4500, 4600, 4700, 4750, 4850, 4950, 5000];
const p1L20pay = [65000, 67500, 68000, 70000, 71000, 73000, 73500, 74500, 76000, 79000, 80000, 82000, 84000, 86000, 88000, 90000, 91000, 93000, 95000, 96000];

const p2L20 = [6900, 7100, 7200, 7400, 7500, 7700, 7750, 7850, 8000, 8300, 8400, 8600, 8800, 9000, 9200, 9400, 9500, 9700, 9900, 10000];
const p2L20pay = [130000, 134000, 136000, 140000, 142000, 146000, 147000, 149000, 152000, 158000, 160000, 164000, 168000, 172000, 176000, 180000, 182000, 186000, 190000, 192000];

const p3L20 = [10350, 10650, 10800, 11100, 11250, 11550, 11625, 11775, 12000, 12450, 12600, 12900, 13200, 13500, 13800, 14100, 14250, 14550, 14850, 15000];
const p3L20pay = [195000, 201000, 204000, 210000, 213000, 219000, 220500, 223500, 228000, 237000, 240000, 246000, 252000, 258000, 264000, 270000, 273000, 279000, 285000, 288000];

const p5L20 = [17250, 17750, 18000, 18500, 18750, 19250, 19375, 19625, 20000, 20750, 21000, 21500, 22000, 22500, 23000, 23500, 23750, 24250, 24750, 25000];
const p5L20pay = [325000, 335000, 340000, 350000, 355000, 365000, 367500, 372500, 380000, 395000, 400000, 410000, 420000, 430000, 440000, 450000, 455000, 465000, 475000, 480000];

const p10L20 = [34500, 35500, 36000, 37000, 37500, 38500, 38750, 39250, 40000, 41500, 42000, 43000, 44000, 45000, 46000, 47000, 47500, 48500, 49500, 50000];
const p10L20pay = [650000, 670000, 680000, 700000, 710000, 730000, 735000, 745000, 760000, 790000, 800000, 820000, 840000, 860000, 880000, 900000, 910000, 930000, 950000, 960000];

const p20L20 = [73500, 75000, 76500, 78000, 79000, 80500, 82000, 83500, 85000, 86500, 88000, 90000, 91500, 93000, 94500, 96500, 98000, 100000, 102000, 104000];
const p20L20pay = [1390000, 1417500, 1445000, 1472500, 1500000, 1530000, 1560000, 1590000, 1620000, 1650000, 1682500, 1715000, 1747500, 1780000, 1812500, 1847500, 1882500, 1920000, 1960000, 2000000];

const p25L20 = [85250, 86750, 88250, 89750, 91750, 93750, 95750, 97750, 100000, 102250, 104500, 106750, 109500, 112250, 115000, 118000, 121000, 124000, 127000, 130000];
const p25L20pay = [1605000, 1635000, 1665000, 1695000, 1735000, 1775000, 1815000, 1855000, 1900000, 1945000, 1990000, 2035000, 2090000, 2145000, 2200000, 2260000, 2320000, 2380000, 2440000, 2500000];

// ---- 29-month 5 Lakh plan (fixed ₹13,000 instalment) ------------------------
const p5L29 = [...Array(28).fill(13000), 6522];
const p5L29pay = [
  280020, 284640, 289300, 294005, 298765, 303590, 308495, 313500, 318625, 323895, 329335, 334975, 340845, 346980, 353415,
  360190, 367345, 374925, 382975, 391545, 400685, 410450, 420895, 432080, 444065, 456915, 470695, 485075, 500000,
];

// ---- 29-month 10 Lakh plan (fixed ₹26,000 instalment) -----------------------
const p10L29 = [...Array(28).fill(26000), 13044];
const p10L29pay = [
  560040, 569280, 578600, 588010, 597530, 607180, 616990, 627000, 637250, 647790, 658670, 669950, 681690, 693960, 706830,
  720380, 734690, 749850, 765950, 783090, 801370, 820900, 841790, 864160, 888130, 913830, 941390, 970150, 1000000,
];

// ---- 16-week weekly plans (fixed instalment, 20 members) --------------------
const p50k16w = Array(16).fill(2500);
const p50k16wPay = [31500, 31750, 32000, 32650, 33500, 34450, 35250, 36250, 37400, 38700, 40150, 41700, 43550, 45600, 47550, 48000];

const p1L16w = Array(16).fill(5000);
const p1L16wPay = [63000, 63500, 64000, 65300, 67000, 68900, 70500, 72500, 74800, 77400, 80300, 83400, 87100, 91200, 95100, 96000];

// ---- 50-week weekly plan (₹50,000 · 50 members · ₹750/week) ------------------
const p50kWeekly = Array(50).fill(750);
const p50kWeeklyPay = Array.from({ length: 50 }, (_, i) => (i === 49 ? 47500 : 35000 + i * 250));

// ---- 12-installment ₹50,000 plan (decreasing instalment, fixed payout) ------
const p50k12 = [5000, 4750, 4500, 4250, 4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250];
const p50k12pay = Array(12).fill(50000);

export const chitPlans: ChitPlan[] = [
  // 10-month family
  { id: "plan-1l-10m", chitValue: 100000, frequency: "monthly", periods: 10, durationLabel: "10 Months", members: null, featured: true, totalPayable: total(p1L10), schedule: rows(p1L10, p1L10pay) },
  { id: "plan-2l-10m", chitValue: 200000, frequency: "monthly", periods: 10, durationLabel: "10 Months", members: null, totalPayable: total(p2L10), schedule: rows(p2L10, p2L10pay) },
  { id: "plan-3l-10m", chitValue: 300000, frequency: "monthly", periods: 10, durationLabel: "10 Months", members: null, totalPayable: total(p3L10), schedule: rows(p3L10, p3L10pay) },
  { id: "plan-5l-10m", chitValue: 500000, frequency: "monthly", periods: 10, durationLabel: "10 Months", members: null, totalPayable: total(p5L10), schedule: rows(p5L10, p5L10pay) },
  { id: "plan-10l-10m", chitValue: 1000000, frequency: "monthly", periods: 10, durationLabel: "10 Months", members: null, totalPayable: total(p10L10), schedule: rows(p10L10, p10L10pay) },

  // 20-month family
  { id: "plan-1l-20m", chitValue: 100000, frequency: "monthly", periods: 20, durationLabel: "20 Months", members: null, featured: true, totalPayable: total(p1L20), schedule: rows(p1L20, p1L20pay) },
  { id: "plan-2l-20m", chitValue: 200000, frequency: "monthly", periods: 20, durationLabel: "20 Months", members: null, totalPayable: total(p2L20), schedule: rows(p2L20, p2L20pay) },
  { id: "plan-3l-20m", chitValue: 300000, frequency: "monthly", periods: 20, durationLabel: "20 Months", members: null, totalPayable: total(p3L20), schedule: rows(p3L20, p3L20pay) },
  { id: "plan-5l-20m", chitValue: 500000, frequency: "monthly", periods: 20, durationLabel: "20 Months", members: null, totalPayable: total(p5L20), schedule: rows(p5L20, p5L20pay) },
  { id: "plan-10l-20m", chitValue: 1000000, frequency: "monthly", periods: 20, durationLabel: "20 Months", members: null, totalPayable: total(p10L20), schedule: rows(p10L20, p10L20pay) },
  { id: "plan-20l-20m", chitValue: 2000000, frequency: "monthly", periods: 20, durationLabel: "20 Months", members: null, totalPayable: total(p20L20), schedule: rows(p20L20, p20L20pay) },
  { id: "plan-25l-20m", chitValue: 2500000, frequency: "monthly", periods: 20, durationLabel: "20 Months", members: null, totalPayable: total(p25L20), schedule: rows(p25L20, p25L20pay) },

  // 29-month plans
  { id: "plan-5l-29m", chitValue: 500000, frequency: "monthly", periods: 29, durationLabel: "29 Months", members: null, totalPayable: total(p5L29), schedule: rows(p5L29, p5L29pay) },
  { id: "plan-10l-29m", chitValue: 1000000, frequency: "monthly", periods: 29, durationLabel: "29 Months", members: null, totalPayable: total(p10L29), schedule: rows(p10L29, p10L29pay) },

  // Weekly / short plans
  { id: "plan-50k-50w", chitValue: 50000, frequency: "weekly", periods: 50, durationLabel: "50 Weeks", members: 50, featured: true, totalPayable: total(p50kWeekly), dailyApprox: 120, schedule: rows(p50kWeekly, p50kWeeklyPay) },
  { id: "plan-50k-16w", chitValue: 50000, frequency: "weekly", periods: 16, durationLabel: "16 Weeks", members: 20, totalPayable: total(p50k16w), schedule: rows(p50k16w, p50k16wPay) },
  { id: "plan-1l-16w", chitValue: 100000, frequency: "weekly", periods: 16, durationLabel: "16 Weeks", members: 20, totalPayable: total(p1L16w), schedule: rows(p1L16w, p1L16wPay) },
  { id: "plan-50k-12", chitValue: 50000, frequency: "weekly", periods: 12, durationLabel: "12 Weeks", members: 12, totalPayable: total(p50k12), dailyApprox: 150, weeklyApprox: 910, schedule: rows(p50k12, p50k12pay) },
];

export function getChitPlanById(id: string): ChitPlan | undefined {
  return chitPlans.find((p) => p.id === id);
}
