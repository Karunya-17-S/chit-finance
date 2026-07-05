import type { Expense } from "@/types";

// Company operating expenses across branches (current period around 2026-07).
export const expenses: Expense[] = [
  // Chennai (br-001)
  { id: "exp-001", expenseCode: "EXP-0001", branchId: "br-001", category: "rent", title: "Branch office rent — July", amount: 45000, date: "2026-07-01", paidTo: "Lakshmi Property Holdings", paymentMode: "bank_transfer", recordedBy: "emp-001", billNumber: "RENT-0701", remarks: "T. Nagar office monthly rent." },
  { id: "exp-002", expenseCode: "EXP-0002", branchId: "br-001", category: "salary", title: "Staff salaries — June", amount: 186000, date: "2026-07-01", paidTo: "Chennai branch staff", paymentMode: "bank_transfer", recordedBy: "emp-001", remarks: "5 employees." },
  { id: "exp-003", expenseCode: "EXP-0003", branchId: "br-001", category: "utilities", title: "Electricity & internet", amount: 8400, date: "2026-06-28", paidTo: "TNEB / ACT Fibernet", paymentMode: "upi", recordedBy: "emp-002" },
  { id: "exp-004", expenseCode: "EXP-0004", branchId: "br-001", category: "marketing", title: "Pamphlet printing & distribution", amount: 12500, date: "2026-06-20", paidTo: "Sri Balaji Printers", paymentMode: "cash", recordedBy: "emp-001", billNumber: "SBP-2291" },
  { id: "exp-005", expenseCode: "EXP-0005", branchId: "br-001", category: "travel", title: "Field collection fuel reimbursement", amount: 6800, date: "2026-06-30", paidTo: "Divya Ramesh, Arun Kumar", paymentMode: "upi", recordedBy: "emp-001" },
  { id: "exp-006", expenseCode: "EXP-0006", branchId: "br-001", category: "office_supplies", title: "Receipt books & stationery", amount: 3200, date: "2026-06-15", paidTo: "Anand Stationers", paymentMode: "cash", recordedBy: "emp-002" },

  // Coimbatore (br-002)
  { id: "exp-007", expenseCode: "EXP-0007", branchId: "br-002", category: "rent", title: "Branch office rent — July", amount: 38000, date: "2026-07-01", paidTo: "R.S. Puram Estates", paymentMode: "bank_transfer", recordedBy: "emp-005", billNumber: "RENT-0702" },
  { id: "exp-008", expenseCode: "EXP-0008", branchId: "br-002", category: "salary", title: "Staff salaries — June", amount: 142000, date: "2026-07-01", paidTo: "Coimbatore branch staff", paymentMode: "bank_transfer", recordedBy: "emp-005" },
  { id: "exp-009", expenseCode: "EXP-0009", branchId: "br-002", category: "commission", title: "Foreman commission payout", amount: 21500, date: "2026-06-25", paidTo: "Suresh Babu", paymentMode: "bank_transfer", recordedBy: "emp-005", remarks: "Platinum 5 Lakh group auction." },
  { id: "exp-010", expenseCode: "EXP-0010", branchId: "br-002", category: "utilities", title: "Electricity & water", amount: 6100, date: "2026-06-27", paidTo: "TNEB", paymentMode: "upi", recordedBy: "emp-006" },
  { id: "exp-011", expenseCode: "EXP-0011", branchId: "br-002", category: "maintenance", title: "Office AC servicing", amount: 4500, date: "2026-06-18", paidTo: "CoolCare Services", paymentMode: "cash", recordedBy: "emp-006", billNumber: "CC-889" },

  // Madurai (br-003)
  { id: "exp-012", expenseCode: "EXP-0012", branchId: "br-003", category: "rent", title: "Branch office rent — July", amount: 28000, date: "2026-07-01", paidTo: "K.K. Nagar Realtors", paymentMode: "bank_transfer", recordedBy: "emp-007", billNumber: "RENT-0703" },
  { id: "exp-013", expenseCode: "EXP-0013", branchId: "br-003", category: "salary", title: "Staff salaries — June", amount: 74000, date: "2026-07-01", paidTo: "Madurai branch staff", paymentMode: "bank_transfer", recordedBy: "emp-007" },
  { id: "exp-014", expenseCode: "EXP-0014", branchId: "br-003", category: "legal_compliance", title: "Chit registrar filing fees", amount: 9500, date: "2026-06-22", paidTo: "Registrar of Chits, Madurai", paymentMode: "bank_transfer", recordedBy: "emp-007", remarks: "New Members 3 Lakh group registration." },
  { id: "exp-015", expenseCode: "EXP-0015", branchId: "br-003", category: "marketing", title: "Local FM radio spot", amount: 7500, date: "2026-06-12", paidTo: "Radio Mirchi Madurai", paymentMode: "bank_transfer", recordedBy: "emp-007" },
  { id: "exp-016", expenseCode: "EXP-0016", branchId: "br-003", category: "miscellaneous", title: "Opening-day refreshments", amount: 3400, date: "2026-06-10", paidTo: "Sri Murugan Catering", paymentMode: "cash", recordedBy: "emp-008" },
];

export function getExpensesByBranch(branchId: string): Expense[] {
  return expenses.filter((e) => e.branchId === branchId);
}
