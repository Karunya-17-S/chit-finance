import type { FollowUp } from "@/types";

export const followUps: FollowUp[] = [
  { id: "fu-001", customerId: "cust-003", employeeId: "emp-002", branchId: "br-001", note: "Visited shop, customer said will pay by weekend.", status: "promise_to_pay", lastContactedDate: "2026-06-28", nextFollowUpDate: "2026-07-04", promiseToPayDate: "2026-07-05", createdAt: "2026-06-28" },
  { id: "fu-002", customerId: "cust-004", employeeId: "emp-002", branchId: "br-001", note: "Called twice, phone switched off both times.", status: "risk", lastContactedDate: "2026-06-25", nextFollowUpDate: "2026-07-03", promiseToPayDate: null, createdAt: "2026-06-25" },
  { id: "fu-003", customerId: "cust-005", employeeId: "emp-002", branchId: "br-001", note: "New installment cycle started, introductory call done.", status: "new", lastContactedDate: "2026-07-01", nextFollowUpDate: "2026-07-06", promiseToPayDate: null, createdAt: "2026-07-01" },
  { id: "fu-004", customerId: "cust-006", employeeId: "emp-002", branchId: "br-001", note: "Paid installment in full during branch visit.", status: "paid", lastContactedDate: "2026-06-30", nextFollowUpDate: null, promiseToPayDate: null, createdAt: "2026-06-30" },
  { id: "fu-005", customerId: "cust-007", employeeId: "emp-003", branchId: "br-001", note: "Requested one more week due to hospital expenses.", status: "follow_up", lastContactedDate: "2026-06-27", nextFollowUpDate: "2026-07-05", promiseToPayDate: "2026-07-08", createdAt: "2026-06-27" },
  { id: "fu-006", customerId: "cust-008", employeeId: "emp-003", branchId: "br-001", note: "Dues pending for over 30 days, escalation raised.", status: "overdue", lastContactedDate: "2026-06-20", nextFollowUpDate: "2026-07-03", promiseToPayDate: null, createdAt: "2026-06-20" },
  { id: "fu-007", customerId: "cust-011", employeeId: "emp-003", branchId: "br-001", note: "Customer inactive, shop reported closed on last visit.", status: "risk", lastContactedDate: "2026-06-15", nextFollowUpDate: "2026-07-07", promiseToPayDate: null, createdAt: "2026-06-15" },
  { id: "fu-008", customerId: "cust-012", employeeId: "emp-003", branchId: "br-001", note: "Confirmed will clear balance via UPI tomorrow.", status: "promise_to_pay", lastContactedDate: "2026-07-01", nextFollowUpDate: "2026-07-03", promiseToPayDate: "2026-07-03", createdAt: "2026-07-01" },
  { id: "fu-009", customerId: "cust-014", employeeId: "emp-006", branchId: "br-002", note: "First reminder call for this month's installment.", status: "new", lastContactedDate: "2026-07-01", nextFollowUpDate: "2026-07-05", promiseToPayDate: null, createdAt: "2026-07-01" },
  { id: "fu-010", customerId: "cust-016", employeeId: "emp-006", branchId: "br-002", note: "Partial payment received, balance promised next week.", status: "follow_up", lastContactedDate: "2026-06-29", nextFollowUpDate: "2026-07-06", promiseToPayDate: "2026-07-09", createdAt: "2026-06-29" },
  { id: "fu-011", customerId: "cust-018", employeeId: "emp-006", branchId: "br-002", note: "Paid full installment via bank transfer.", status: "paid", lastContactedDate: "2026-06-26", nextFollowUpDate: null, promiseToPayDate: null, createdAt: "2026-06-26" },
  { id: "fu-012", customerId: "cust-020", employeeId: "emp-006", branchId: "br-002", note: "Two months pending, sent formal notice letter.", status: "overdue", lastContactedDate: "2026-06-18", nextFollowUpDate: "2026-07-04", promiseToPayDate: null, createdAt: "2026-06-18" },
  { id: "fu-013", customerId: "cust-021", employeeId: "emp-006", branchId: "br-002", note: "Not responding to calls or messages for 3 weeks.", status: "risk", lastContactedDate: "2026-06-10", nextFollowUpDate: "2026-07-08", promiseToPayDate: null, createdAt: "2026-06-10" },
  { id: "fu-014", customerId: "cust-022", employeeId: "emp-008", branchId: "br-003", note: "Reminded about upcoming new group enrollment payment.", status: "new", lastContactedDate: "2026-06-30", nextFollowUpDate: "2026-07-05", promiseToPayDate: null, createdAt: "2026-06-30" },
  { id: "fu-015", customerId: "cust-024", employeeId: "emp-008", branchId: "br-003", note: "Promised to settle pending amount after Ramzan bonus.", status: "promise_to_pay", lastContactedDate: "2026-06-27", nextFollowUpDate: "2026-07-10", promiseToPayDate: "2026-07-12", createdAt: "2026-06-27" },
  { id: "fu-016", customerId: "cust-025", employeeId: "emp-008", branchId: "br-003", note: "Cleared all pending dues in person at branch.", status: "paid", lastContactedDate: "2026-06-24", nextFollowUpDate: null, promiseToPayDate: null, createdAt: "2026-06-24" },
];

export function getFollowUpsByCustomer(customerId: string): FollowUp[] {
  return followUps.filter((f) => f.customerId === customerId);
}

export function getFollowUpsByEmployee(employeeId: string): FollowUp[] {
  return followUps.filter((f) => f.employeeId === employeeId);
}

export function getFollowUpsByBranch(branchId: string): FollowUp[] {
  return followUps.filter((f) => f.branchId === branchId);
}
