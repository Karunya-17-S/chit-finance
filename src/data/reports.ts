import type { ReportDefinition } from "@/types";

export const reportDefinitions: ReportDefinition[] = [
  { id: "rpt-001", title: "Branch-wise Collection Report", type: "branch_collection", description: "Collection totals and pending amounts grouped by branch." },
  { id: "rpt-002", title: "Employee-wise Collection Report", type: "employee_collection", description: "Collection achieved vs target for each collection employee." },
  { id: "rpt-003", title: "Customer Outstanding Report", type: "customer_outstanding", description: "Customers with pending or overdue balances across chit groups." },
  { id: "rpt-004", title: "Chit Group Performance Report", type: "chit_group_performance", description: "Membership fill rate, collection efficiency and auction status per group." },
  { id: "rpt-005", title: "Monthly Collection Report", type: "monthly_collection", description: "Month-by-month collection trend across the company." },
  { id: "rpt-006", title: "Pending Payments Report", type: "pending_payments", description: "All installments awaiting collection this cycle." },
  { id: "rpt-007", title: "Overdue Report", type: "overdue", description: "Installments past due date requiring follow-up or escalation." },
  { id: "rpt-008", title: "Completed Groups Report", type: "completed_groups", description: "Archive of chit groups that have concluded their full duration." },
  { id: "rpt-009", title: "Profit / Commission Report", type: "profit_commission", description: "Foreman commission earned across active and completed chit groups." },
];
