import type { Attendance, AttendanceStatus } from "@/types";
import { employees } from "@/data/employees";

// Attendance is anchored to the app's "today" of 2026-07-02, seeded backwards
// over the preceding working days (Sundays are weekly offs).
export const ATTENDANCE_TODAY = "2026-07-02";
const START = "2026-06-18";

// Deterministic exceptions keyed by `${employeeId}:${date}`.
const EXCEPTIONS: Record<string, { status: AttendanceStatus; remarks?: string }> = {
  "emp-002:2026-06-23": { status: "absent", remarks: "Unplanned absence" },
  "emp-003:2026-06-19": { status: "leave", remarks: "Personal leave" },
  "emp-004:2026-06-25": { status: "leave", remarks: "Sick leave" },
  "emp-004:2026-06-26": { status: "leave", remarks: "Sick leave" },
  "emp-006:2026-06-30": { status: "half_day", remarks: "Left early - family function" },
  "emp-008:2026-07-01": { status: "half_day", remarks: "Half day - bank work" },
  "emp-007:2026-06-24": { status: "absent", remarks: "Unplanned absence" },
};

// First check-in times reported on 2026-07-02 by the field app (mirrors the
// live-map location pings for those employees).
const TODAY_CHECKINS: Record<string, string> = {
  "emp-002": "09:05",
  "emp-003": "09:12",
  "emp-006": "09:00",
  "emp-008": "09:20",
};

function dateRange(start: string, end: string): string[] {
  const out: string[] = [];
  const d = new Date(start);
  const last = new Date(end);
  while (d <= last) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function buildAttendance(): Attendance[] {
  const records: Attendance[] = [];
  const dates = dateRange(START, ATTENDANCE_TODAY);
  let seq = 0;

  for (const [ei, emp] of employees.entries()) {
    for (const [di, date] of dates.entries()) {
      seq += 1;
      const isSunday = new Date(date).getDay() === 0;
      const key = `${emp.id}:${date}`;
      const exception = EXCEPTIONS[key];

      let status: AttendanceStatus;
      let remarks: string | undefined;
      if (isSunday) {
        status = "week_off";
      } else if (exception) {
        status = exception.status;
        remarks = exception.remarks;
      } else {
        status = "present";
      }

      let checkIn: string | null = null;
      let checkOut: string | null = null;
      if (status === "present") {
        checkIn = date === ATTENDANCE_TODAY && TODAY_CHECKINS[emp.id] ? TODAY_CHECKINS[emp.id] : `09:${pad((ei * 3 + di) % 25)}`;
        checkOut = date === ATTENDANCE_TODAY ? null : `18:${pad((ei * 2 + di) % 30)}`; // still on the clock today
      } else if (status === "half_day") {
        checkIn = `09:${pad((ei * 3 + di) % 20)}`;
        checkOut = "13:30";
      }

      records.push({
        id: `att-${String(seq).padStart(4, "0")}`,
        employeeId: emp.id,
        branchId: emp.branchId,
        date,
        status,
        checkIn,
        checkOut,
        remarks,
      });
    }
  }
  return records;
}

export const attendance: Attendance[] = buildAttendance();

export function getAttendanceByEmployee(employeeId: string): Attendance[] {
  return attendance.filter((a) => a.employeeId === employeeId);
}

export function getAttendanceByDate(date: string): Attendance[] {
  return attendance.filter((a) => a.date === date);
}
