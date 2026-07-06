import type { LocationPing } from "@/types";

// Mock GPS pings reported by the employee mobile app (installed as a PWA on
// their phones) during today's collection rounds — 2026-07-02.
export const locationPings: LocationPing[] = [
  // Divya Ramesh (emp-002) — T. Nagar route, Chennai
  { id: "loc-001", employeeId: "emp-002", branchId: "br-001", lat: 13.0418, lng: 80.2341, address: "Branch Office, Usman Road, T. Nagar", timestamp: "2026-07-02T09:05:00", status: "checked_in" },
  { id: "loc-002", employeeId: "emp-002", branchId: "br-001", lat: 13.0432, lng: 80.2367, address: "Bazaar Street, T. Nagar (Ramesh Chandran)", timestamp: "2026-07-02T09:48:00", status: "collecting" },
  { id: "loc-003", employeeId: "emp-002", branchId: "br-001", lat: 13.0464, lng: 80.2398, address: "Habibullah Road (Kavya Srinivasan)", timestamp: "2026-07-02T10:35:00", status: "collecting" },
  { id: "loc-004", employeeId: "emp-002", branchId: "br-001", lat: 13.0489, lng: 80.2431, address: "Sir Thyagaraya Road (Prakash Raj)", timestamp: "2026-07-02T11:20:00", status: "collecting" },
  { id: "loc-005", employeeId: "emp-002", branchId: "br-001", lat: 13.0512, lng: 80.2459, address: "GN Chetty Road — en route", timestamp: "2026-07-02T12:02:00", status: "moving" },

  // Arun Kumar (emp-003) — Pondy Bazaar route, Chennai
  { id: "loc-006", employeeId: "emp-003", branchId: "br-001", lat: 13.0418, lng: 80.2341, address: "Branch Office, Usman Road, T. Nagar", timestamp: "2026-07-02T09:12:00", status: "checked_in" },
  { id: "loc-007", employeeId: "emp-003", branchId: "br-001", lat: 13.0399, lng: 80.2305, address: "Pondy Bazaar (Suresh Kumar)", timestamp: "2026-07-02T10:05:00", status: "collecting" },
  { id: "loc-008", employeeId: "emp-003", branchId: "br-001", lat: 13.0371, lng: 80.2278, address: "North Usman Road (Meena Rajendran)", timestamp: "2026-07-02T10:52:00", status: "collecting" },
  { id: "loc-009", employeeId: "emp-003", branchId: "br-001", lat: 13.0344, lng: 80.2252, address: "Tea break — Mambalam High Road", timestamp: "2026-07-02T11:40:00", status: "idle" },

  // Suresh Babu (emp-006) — R.S. Puram route, Coimbatore
  { id: "loc-010", employeeId: "emp-006", branchId: "br-002", lat: 11.0055, lng: 76.9494, address: "Branch Office, D.B. Road, R.S. Puram", timestamp: "2026-07-02T09:00:00", status: "checked_in" },
  { id: "loc-011", employeeId: "emp-006", branchId: "br-002", lat: 11.0081, lng: 76.9531, address: "Cross Cut Road (Uma Maheswari)", timestamp: "2026-07-02T09:55:00", status: "collecting" },
  { id: "loc-012", employeeId: "emp-006", branchId: "br-002", lat: 11.0122, lng: 76.9578, address: "Sathy Road (Senthil Kumar)", timestamp: "2026-07-02T10:48:00", status: "collecting" },
  { id: "loc-013", employeeId: "emp-006", branchId: "br-002", lat: 11.0164, lng: 76.9612, address: "Race Course Road (Pushpa Latha)", timestamp: "2026-07-02T11:36:00", status: "collecting" },
  { id: "loc-014", employeeId: "emp-006", branchId: "br-002", lat: 11.0197, lng: 76.9655, address: "Trichy Road — en route", timestamp: "2026-07-02T12:10:00", status: "moving" },

  // Meenakshi Sundaram (emp-008) — K.K. Nagar route, Madurai
  { id: "loc-015", employeeId: "emp-008", branchId: "br-003", lat: 9.9252, lng: 78.1198, address: "Branch Office, K.K. Nagar Main Road", timestamp: "2026-07-02T09:20:00", status: "checked_in" },
  { id: "loc-016", employeeId: "emp-008", branchId: "br-003", lat: 9.9287, lng: 78.1234, address: "K.K. Nagar (Selvi Chidambaram)", timestamp: "2026-07-02T10:15:00", status: "collecting" },
  { id: "loc-017", employeeId: "emp-008", branchId: "br-003", lat: 9.9321, lng: 78.1276, address: "Anna Nagar (Murugan Palani)", timestamp: "2026-07-02T11:05:00", status: "collecting" },
];

export function getPingsByEmployee(employeeId: string): LocationPing[] {
  return locationPings
    .filter((p) => p.employeeId === employeeId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function getLatestPings(branchId?: string): LocationPing[] {
  const latest = new Map<string, LocationPing>();
  for (const ping of locationPings) {
    if (branchId && ping.branchId !== branchId) continue;
    const existing = latest.get(ping.employeeId);
    if (!existing || ping.timestamp > existing.timestamp) latest.set(ping.employeeId, ping);
  }
  return Array.from(latest.values());
}
