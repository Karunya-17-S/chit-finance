import { create } from "zustand";
import type { Branch, Employee, Customer, ChitGroup, Payment, Template, FollowUp, Expense, Attendance } from "@/types";
import { branches as seedBranches } from "@/data/branches";
import { employees as seedEmployees } from "@/data/employees";
import { customers as seedCustomers } from "@/data/customers";
import { chitGroups as seedChitGroups } from "@/data/chit-groups";
import { payments as seedPayments } from "@/data/payments";
import { templates as seedTemplates } from "@/data/templates";
import { followUps as seedFollowUps } from "@/data/followups";
import { expenses as seedExpenses } from "@/data/expenses";
import { attendance as seedAttendance } from "@/data/attendance";

// Mutable in-session mock "database". Seeded from src/data/*, mutated via the
// actions below. Swap this store's internals for Supabase queries/mutations
// later without touching the components that call these actions/selectors.
interface DataState {
  branches: Branch[];
  employees: Employee[];
  customers: Customer[];
  chitGroups: ChitGroup[];
  payments: Payment[];
  templates: Template[];
  followUps: FollowUp[];
  expenses: Expense[];
  attendance: Attendance[];

  addBranch: (b: Branch) => void;
  updateBranch: (id: string, patch: Partial<Branch>) => void;

  addEmployee: (e: Employee) => void;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;

  addCustomer: (c: Customer) => void;
  addCustomers: (cs: Customer[]) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;

  addChitGroup: (g: ChitGroup) => void;
  updateChitGroup: (id: string, patch: Partial<ChitGroup>) => void;

  addPayment: (p: Payment) => void;
  updatePayment: (id: string, patch: Partial<Payment>) => void;

  addTemplate: (t: Template) => void;
  updateTemplate: (id: string, patch: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;

  addFollowUp: (f: FollowUp) => void;
  updateFollowUp: (id: string, patch: Partial<FollowUp>) => void;

  addExpense: (e: Expense) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Insert or update an attendance record for an employee on a given date.
  upsertAttendance: (a: Attendance) => void;
}

export const useDataStore = create<DataState>((set) => ({
  branches: seedBranches,
  employees: seedEmployees,
  customers: seedCustomers,
  chitGroups: seedChitGroups,
  payments: seedPayments,
  templates: seedTemplates,
  followUps: seedFollowUps,
  expenses: seedExpenses,
  attendance: seedAttendance,

  addBranch: (b) => set((s) => ({ branches: [b, ...s.branches] })),
  updateBranch: (id, patch) =>
    set((s) => ({ branches: s.branches.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

  addEmployee: (e) => set((s) => ({ employees: [e, ...s.employees] })),
  updateEmployee: (id, patch) =>
    set((s) => ({ employees: s.employees.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

  addCustomer: (c) => set((s) => ({ customers: [c, ...s.customers] })),
  addCustomers: (cs) => set((s) => ({ customers: [...cs, ...s.customers] })),
  updateCustomer: (id, patch) =>
    set((s) => ({ customers: s.customers.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

  addChitGroup: (g) => set((s) => ({ chitGroups: [g, ...s.chitGroups] })),
  updateChitGroup: (id, patch) =>
    set((s) => ({ chitGroups: s.chitGroups.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

  addPayment: (p) => set((s) => ({ payments: [p, ...s.payments] })),
  updatePayment: (id, patch) =>
    set((s) => ({ payments: s.payments.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

  addTemplate: (t) => set((s) => ({ templates: [t, ...s.templates] })),
  updateTemplate: (id, patch) =>
    set((s) => ({ templates: s.templates.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  deleteTemplate: (id) => set((s) => ({ templates: s.templates.filter((x) => x.id !== id) })),

  addFollowUp: (f) => set((s) => ({ followUps: [f, ...s.followUps] })),
  updateFollowUp: (id, patch) =>
    set((s) => ({ followUps: s.followUps.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

  addExpense: (e) => set((s) => ({ expenses: [e, ...s.expenses] })),
  updateExpense: (id, patch) =>
    set((s) => ({ expenses: s.expenses.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  deleteExpense: (id) => set((s) => ({ expenses: s.expenses.filter((x) => x.id !== id) })),

  upsertAttendance: (a) =>
    set((s) => {
      const existing = s.attendance.find((x) => x.employeeId === a.employeeId && x.date === a.date);
      return existing
        ? { attendance: s.attendance.map((x) => (x.id === existing.id ? { ...existing, ...a, id: existing.id } : x)) }
        : { attendance: [a, ...s.attendance] };
    }),
}));
