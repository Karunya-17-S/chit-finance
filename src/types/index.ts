// Core domain types for Shree Vaari Chit Finance Admin.
// Shaped to map cleanly onto future Supabase/PostgreSQL tables (snake_case columns -> camelCase here).

export type UserRole =
  | "main_admin"
  | "branch_admin"
  | "collection_employee"
  | "accountant"
  | "viewer";

export type Status = "active" | "inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  branchId: string | null; // null for main admin
  avatarUrl?: string;
  status: Status;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  address: string;
  managerName: string;
  phone: string;
  email: string;
  openingDate: string; // ISO date
  status: Status;
  totalCustomers: number;
  activeChitGroups: number;
  monthlyCollection: number;
  pendingAmount: number;
}

export type EmployeeRole =
  | "branch_admin"
  | "collection_employee"
  | "accountant"
  | "viewer";

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  branchId: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  joiningDate: string;
  salary: number;
  status: Status;
  assignedCustomerIds: string[];
  collectionTarget: number;
  collectionAchieved: number;
  avatarUrl?: string;
}

export interface Customer {
  id: string;
  customerCode: string;
  name: string;
  branchId: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  aadhaarNumber: string;
  panNumber: string;
  occupation: string;
  monthlyIncome: number;
  nomineeName: string;
  nomineePhone: string;
  joinedDate: string;
  status: Status;
  assignedEmployeeId: string | null;
  avatarUrl?: string;
}

export type ChitGroupStatus = "active" | "completed" | "pending";
export type CollectionFrequency = "daily" | "weekly" | "monthly";

export interface ChitGroup {
  id: string;
  groupName: string;
  groupCode: string;
  branchId: string;
  chitValue: number;
  // Installment amount per collection period (day/week/month depending on frequency).
  monthlyInstallment: number;
  collectionFrequency: CollectionFrequency;
  durationMonths: number;
  // Planned capacity — extendable: adding members beyond this bumps the capacity up.
  totalMembers: number;
  currentMembers: number;
  startDate: string;
  endDate: string;
  auctionDate: string; // next/upcoming auction date
  status: ChitGroupStatus;
  commissionPercentage: number;
  foremanCommission: number;
  collectionEmployeeId: string | null;
}

export interface ChitMember {
  id: string;
  chitGroupId: string;
  customerId: string;
  agreementNo: string;
  joinedDate: string;
  hasWon: boolean;
  wonMonth?: number;
  wonAmount?: number;
  status: Status;
}

export type PaymentMode = "cash" | "upi" | "bank_transfer" | "cheque";
export type PaymentStatus = "paid" | "partial" | "pending" | "overdue";
// installment = regular due collection (supports partial); deposit = advance/extra amount deposited
export type PaymentCategory = "installment" | "deposit";

export interface Payment {
  id: string;
  paymentCode: string;
  customerId: string;
  branchId: string;
  chitGroupId: string;
  month: string; // e.g. "2026-06"
  dueAmount: number;
  paidAmount: number;
  paymentDate: string | null;
  paymentMode: PaymentMode | null;
  paymentCategory: PaymentCategory;
  receiptNumber: string | null;
  billNumber: string | null;
  collectedBy: string | null; // employeeId
  status: PaymentStatus;
  remarks?: string;
}

export type AuctionStatus = "scheduled" | "completed";

export interface Auction {
  id: string;
  chitGroupId: string;
  month: number;
  auctionDate: string;
  winnerCustomerId: string | null;
  bidAmount: number;
  discountAmount: number;
  dividendPerMember: number;
  status: AuctionStatus;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  paymentId: string;
  customerId: string;
  amount: number;
  date: string;
  mode: PaymentMode;
  issuedBy: string; // employeeId
}

export type TemplateType =
  | "payment_reminder"
  | "due_reminder"
  | "overdue_warning"
  | "receipt_message"
  | "auction_notification"
  | "new_group_invite"
  | "festival_greeting"
  | "branch_announcement";

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  content: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export type FollowUpStatus =
  | "new"
  | "follow_up"
  | "promise_to_pay"
  | "paid"
  | "overdue"
  | "risk";

export interface FollowUp {
  id: string;
  customerId: string;
  employeeId: string;
  branchId: string;
  note: string;
  status: FollowUpStatus;
  lastContactedDate: string | null;
  nextFollowUpDate: string | null;
  promiseToPayDate: string | null;
  createdAt: string;
}

export type ReportType =
  | "branch_collection"
  | "employee_collection"
  | "customer_outstanding"
  | "chit_group_performance"
  | "monthly_collection"
  | "pending_payments"
  | "overdue"
  | "completed_groups"
  | "profit_commission";

export interface ReportDefinition {
  id: string;
  title: string;
  type: ReportType;
  description: string;
}

// GPS ping reported by the employee mobile app while on collection rounds.
export type LocationStatus = "checked_in" | "moving" | "collecting" | "idle";

export interface LocationPing {
  id: string;
  employeeId: string;
  branchId: string;
  lat: number;
  lng: number;
  address: string;
  timestamp: string; // ISO datetime
  status: LocationStatus;
}

export interface ReportFilters {
  from?: string;
  to?: string;
  branchId?: string;
  employeeId?: string;
  chitGroupId?: string;
}
