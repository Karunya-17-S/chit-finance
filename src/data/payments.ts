import type { Payment, PaymentMode } from "@/types";
import { chitMembers } from "@/data/chit-members";
import { getChitGroupById } from "@/data/chit-groups";

const PAYMENT_MODES: PaymentMode[] = ["cash", "upi", "bank_transfer", "cheque"];

// Months for which ledger entries are generated: previous month (already due, past-date)
// and current month (due date not yet reached as of "today").
const PREV_MONTH = "2026-06";
const CURR_MONTH = "2026-07";
const PAST_DUE_MONTHS = new Set([PREV_MONTH]);

const remarksFor = (status: Payment["status"]): string | undefined => {
  switch (status) {
    case "overdue":
      return "Customer unreachable on first visit, revisit scheduled.";
    case "partial":
      return "Partial amount collected, balance promised next visit.";
    case "pending":
      return "Installment due, reminder sent.";
    default:
      return undefined;
  }
};

function buildPayments(): Payment[] {
  const activeGroupIds = new Set(["grp-001", "grp-002", "grp-003"]);
  const activeMemberships = chitMembers.filter((m) => activeGroupIds.has(m.chitGroupId));
  const months = [PREV_MONTH, CURR_MONTH];

  const payments: Payment[] = [];
  let seq = 0;
  let receiptSeq = 0;

  for (const month of months) {
    activeMemberships.forEach((membership, i) => {
      const group = getChitGroupById(membership.chitGroupId);
      if (!group) return;
      seq += 1;
      const pattern = (seq + i) % 5;
      const dueAmount = group.monthlyInstallment;

      let paidAmount = 0;
      if (pattern === 0 || pattern === 1) {
        paidAmount = dueAmount;
      } else if (pattern === 2) {
        paidAmount = Math.round((dueAmount * 0.5) / 100) * 100;
      }

      const isPastDue = PAST_DUE_MONTHS.has(month);
      let status: Payment["status"];
      if (paidAmount >= dueAmount) status = "paid";
      else if (paidAmount > 0) status = "partial";
      else status = isPastDue ? "overdue" : "pending";

      // Current-month paid installments are early payers (before the 5th due date);
      // previous-month paid installments are spread across the month.
      const day = month === CURR_MONTH ? 1 + (seq % 4) : 3 + (seq % 24);
      const paymentDate = paidAmount > 0 ? `${month}-${String(day).padStart(2, "0")}` : null;
      const mode = paidAmount > 0 ? PAYMENT_MODES[seq % PAYMENT_MODES.length] : null;
      let receiptNumber: string | null = null;
      let billNumber: string | null = null;
      if (paidAmount > 0) {
        receiptSeq += 1;
        receiptNumber = `RCT-${month.replace("-", "")}-${String(receiptSeq).padStart(4, "0")}`;
        billNumber = String(300 + receiptSeq);
      }

      payments.push({
        id: `pay-${String(seq).padStart(4, "0")}`,
        paymentCode: `PMT-${String(seq).padStart(4, "0")}`,
        customerId: membership.customerId,
        branchId: group.branchId,
        chitGroupId: group.id,
        month,
        dueAmount,
        paidAmount,
        paymentDate,
        paymentMode: mode,
        paymentCategory: "installment",
        receiptNumber,
        billNumber,
        collectedBy: paidAmount > 0 ? group.collectionEmployeeId : null,
        status,
        remarks: remarksFor(status),
      });
    });
  }

  // Advance deposit collections — customers depositing extra ahead of schedule.
  const deposits: Array<{ customerId: string; chitGroupId: string; branchId: string; amount: number; date: string; collectedBy: string }> = [
    { customerId: "cust-002", chitGroupId: "grp-001", branchId: "br-001", amount: 10000, date: "2026-06-24", collectedBy: "emp-002" },
    { customerId: "cust-009", chitGroupId: "grp-002", branchId: "br-001", amount: 6000, date: "2026-07-01", collectedBy: "emp-003" },
    { customerId: "cust-015", chitGroupId: "grp-003", branchId: "br-002", amount: 25000, date: "2026-07-02", collectedBy: "emp-006" },
  ];
  for (const d of deposits) {
    seq += 1;
    receiptSeq += 1;
    payments.push({
      id: `pay-${String(seq).padStart(4, "0")}`,
      paymentCode: `PMT-${String(seq).padStart(4, "0")}`,
      customerId: d.customerId,
      branchId: d.branchId,
      chitGroupId: d.chitGroupId,
      month: d.date.slice(0, 7),
      dueAmount: 0,
      paidAmount: d.amount,
      paymentDate: d.date,
      paymentMode: "upi",
      paymentCategory: "deposit",
      receiptNumber: `RCT-${d.date.slice(0, 7).replace("-", "")}-${String(receiptSeq).padStart(4, "0")}`,
      billNumber: String(300 + receiptSeq),
      collectedBy: d.collectedBy,
      status: "paid",
      remarks: "Advance deposit collected.",
    });
  }

  return payments;
}

export const payments: Payment[] = buildPayments();

export function getPaymentsByCustomer(customerId: string): Payment[] {
  return payments.filter((p) => p.customerId === customerId);
}

export function getPaymentsByBranch(branchId: string): Payment[] {
  return payments.filter((p) => p.branchId === branchId);
}

export function getPaymentsByChitGroup(chitGroupId: string): Payment[] {
  return payments.filter((p) => p.chitGroupId === chitGroupId);
}

export function getPaymentsByEmployee(employeeId: string): Payment[] {
  return payments.filter((p) => p.collectedBy === employeeId);
}

export const currentMonth = CURR_MONTH;
export const previousMonth = PREV_MONTH;
