import type { ChitMember } from "@/types";

export const chitMembers: ChitMember[] = [
  // grp-001 Diamond 1 Lakh Chit (br-001) — 10 months elapsed of 20
  { id: "cm-001", chitGroupId: "grp-001", customerId: "cust-001", agreementNo: "101", joinedDate: "2025-09-01", hasWon: true, wonMonth: 2, wonAmount: 92000, status: "active" },
  { id: "cm-002", chitGroupId: "grp-001", customerId: "cust-002", agreementNo: "102", joinedDate: "2025-09-01", hasWon: true, wonMonth: 6, wonAmount: 88000, status: "active" },
  { id: "cm-003", chitGroupId: "grp-001", customerId: "cust-003", agreementNo: "103", joinedDate: "2025-09-01", hasWon: false, status: "active" },
  { id: "cm-004", chitGroupId: "grp-001", customerId: "cust-004", agreementNo: "104", joinedDate: "2025-09-01", hasWon: false, status: "active" },
  { id: "cm-005", chitGroupId: "grp-001", customerId: "cust-005", agreementNo: "105", joinedDate: "2025-09-01", hasWon: false, status: "active" },
  { id: "cm-006", chitGroupId: "grp-001", customerId: "cust-006", agreementNo: "106", joinedDate: "2025-09-01", hasWon: false, status: "active" },
  { id: "cm-007", chitGroupId: "grp-001", customerId: "cust-007", agreementNo: "107", joinedDate: "2025-09-01", hasWon: false, status: "active" },
  { id: "cm-008", chitGroupId: "grp-001", customerId: "cust-008", agreementNo: "108", joinedDate: "2025-09-01", hasWon: false, status: "active" },

  // grp-002 Gold 2 Lakh Chit (br-001) — 14 months elapsed of 25
  { id: "cm-009", chitGroupId: "grp-002", customerId: "cust-005", agreementNo: "109", joinedDate: "2025-05-01", hasWon: true, wonMonth: 1, wonAmount: 184000, status: "active" },
  { id: "cm-010", chitGroupId: "grp-002", customerId: "cust-006", agreementNo: "110", joinedDate: "2025-05-01", hasWon: true, wonMonth: 5, wonAmount: 176000, status: "active" },
  { id: "cm-011", chitGroupId: "grp-002", customerId: "cust-007", agreementNo: "111", joinedDate: "2025-05-01", hasWon: true, wonMonth: 9, wonAmount: 179000, status: "active" },
  { id: "cm-012", chitGroupId: "grp-002", customerId: "cust-008", agreementNo: "112", joinedDate: "2025-05-01", hasWon: false, status: "active" },
  { id: "cm-013", chitGroupId: "grp-002", customerId: "cust-009", agreementNo: "113", joinedDate: "2025-05-01", hasWon: false, status: "active" },
  { id: "cm-014", chitGroupId: "grp-002", customerId: "cust-010", agreementNo: "114", joinedDate: "2025-05-01", hasWon: false, status: "active" },
  { id: "cm-015", chitGroupId: "grp-002", customerId: "cust-011", agreementNo: "115", joinedDate: "2025-05-01", hasWon: false, status: "inactive" },
  { id: "cm-016", chitGroupId: "grp-002", customerId: "cust-012", agreementNo: "116", joinedDate: "2025-05-01", hasWon: false, status: "active" },

  // grp-003 Platinum 5 Lakh Chit (br-002) — 26 months elapsed of 40
  { id: "cm-017", chitGroupId: "grp-003", customerId: "cust-013", agreementNo: "117", joinedDate: "2024-05-01", hasWon: true, wonMonth: 3, wonAmount: 462000, status: "active" },
  { id: "cm-018", chitGroupId: "grp-003", customerId: "cust-014", agreementNo: "118", joinedDate: "2024-05-01", hasWon: true, wonMonth: 11, wonAmount: 448000, status: "active" },
  { id: "cm-019", chitGroupId: "grp-003", customerId: "cust-015", agreementNo: "119", joinedDate: "2024-05-01", hasWon: true, wonMonth: 19, wonAmount: 439000, status: "active" },
  { id: "cm-020", chitGroupId: "grp-003", customerId: "cust-016", agreementNo: "120", joinedDate: "2024-05-01", hasWon: false, status: "active" },
  { id: "cm-021", chitGroupId: "grp-003", customerId: "cust-017", agreementNo: "121", joinedDate: "2024-05-01", hasWon: false, status: "active" },
  { id: "cm-022", chitGroupId: "grp-003", customerId: "cust-018", agreementNo: "122", joinedDate: "2024-05-01", hasWon: false, status: "active" },
  { id: "cm-023", chitGroupId: "grp-003", customerId: "cust-019", agreementNo: "123", joinedDate: "2024-05-01", hasWon: false, status: "active" },
  { id: "cm-024", chitGroupId: "grp-003", customerId: "cust-020", agreementNo: "124", joinedDate: "2024-05-01", hasWon: false, status: "active" },
  { id: "cm-025", chitGroupId: "grp-003", customerId: "cust-021", agreementNo: "125", joinedDate: "2024-05-01", hasWon: false, status: "active" },

  // grp-004 Silver 50,000 Chit (br-002) — completed, all resolved
  { id: "cm-026", chitGroupId: "grp-004", customerId: "cust-013", agreementNo: "126", joinedDate: "2022-01-01", hasWon: true, wonMonth: 4, wonAmount: 46500, status: "inactive" },
  { id: "cm-027", chitGroupId: "grp-004", customerId: "cust-015", agreementNo: "127", joinedDate: "2022-01-01", hasWon: true, wonMonth: 9, wonAmount: 45000, status: "inactive" },
  { id: "cm-028", chitGroupId: "grp-004", customerId: "cust-017", agreementNo: "128", joinedDate: "2022-01-01", hasWon: true, wonMonth: 14, wonAmount: 43800, status: "inactive" },
  { id: "cm-029", chitGroupId: "grp-004", customerId: "cust-019", agreementNo: "129", joinedDate: "2022-01-01", hasWon: true, wonMonth: 20, wonAmount: 47500, status: "inactive" },

  // grp-005 New Members 3 Lakh Chit (br-003) — pending, not yet started
  { id: "cm-030", chitGroupId: "grp-005", customerId: "cust-022", agreementNo: "130", joinedDate: "2026-06-15", hasWon: false, status: "active" },
  { id: "cm-031", chitGroupId: "grp-005", customerId: "cust-023", agreementNo: "131", joinedDate: "2026-06-18", hasWon: false, status: "active" },
  { id: "cm-032", chitGroupId: "grp-005", customerId: "cust-024", agreementNo: "132", joinedDate: "2026-06-20", hasWon: false, status: "active" },
  { id: "cm-033", chitGroupId: "grp-005", customerId: "cust-025", agreementNo: "133", joinedDate: "2026-06-22", hasWon: false, status: "active" },
];

export function getMembersByGroup(chitGroupId: string): ChitMember[] {
  return chitMembers.filter((m) => m.chitGroupId === chitGroupId);
}

export function getGroupsByCustomer(customerId: string): ChitMember[] {
  return chitMembers.filter((m) => m.customerId === customerId);
}
