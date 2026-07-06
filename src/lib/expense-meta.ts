import type { ExpenseCategory } from "@/types";

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  salary: "Salary",
  rent: "Rent",
  utilities: "Utilities",
  commission: "Commission",
  marketing: "Marketing",
  travel: "Travel",
  office_supplies: "Office Supplies",
  maintenance: "Maintenance",
  legal_compliance: "Legal & Compliance",
  miscellaneous: "Miscellaneous",
};

// Tailwind classes for category chips.
export const EXPENSE_CATEGORY_STYLES: Record<ExpenseCategory, string> = {
  salary: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  rent: "bg-maroon/10 text-maroon border-maroon/30",
  utilities: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  commission: "bg-gold/20 text-maroon-dark border-gold/40",
  marketing: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  travel: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
  office_supplies: "bg-slate-500/10 text-slate-600 border-slate-500/30",
  maintenance: "bg-teal-500/10 text-teal-600 border-teal-500/30",
  legal_compliance: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  miscellaneous: "bg-muted text-muted-foreground border-border",
};
