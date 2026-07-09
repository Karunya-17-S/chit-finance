import { useDataStore } from "@/store/data-store";

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    branchId: string;
    type: "login" | "logout";
    timestamp: string;
    date: string;
}

/**
 * Employee login/logout attendance tracking. Writes go to the real database
 * via /api/attendance, so history survives page refreshes and deploys.
 *
 * The employee's own isLoggedIn/loginTime fields are still updated locally in
 * the Zustand store for an instant UI response — persisting those to the
 * database too will need a PUT handler added to /api/employees later.
 */
class AttendanceService {
    async recordLogin(employeeId: string): Promise<void> {
        const store = useDataStore.getState();
        const employee = store.employees.find((e) => e.id === employeeId);
        const branchId = employee?.branchId ?? "";
        const timestamp = new Date().toISOString();

        // Instant local UI update.
        store.updateEmployee(employeeId, {
            loginTime: timestamp,
            isLoggedIn: true,
            logoutTime: null,
            lastActivityAt: timestamp,
        });

        // Persist the attendance event to the database.
        try {
            await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId, branchId, type: "login", timestamp }),
            });
        } catch (error) {
            console.error("Failed to persist login attendance record:", error);
        }
    }

    async recordLogout(employeeId: string): Promise<void> {
        const store = useDataStore.getState();
        const employee = store.employees.find((e) => e.id === employeeId);
        const branchId = employee?.branchId ?? "";
        const timestamp = new Date().toISOString();

        store.updateEmployee(employeeId, {
            logoutTime: timestamp,
            isLoggedIn: false,
            lastActivityAt: timestamp,
        });

        try {
            await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId, branchId, type: "logout", timestamp }),
            });
        } catch (error) {
            console.error("Failed to persist logout attendance record:", error);
        }
    }

    // Fetch attendance history for one employee from the database.
    async getEmployeeAttendance(employeeId: string): Promise<AttendanceRecord[]> {
        try {
            const res = await fetch(`/api/attendance?employeeId=${encodeURIComponent(employeeId)}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (error) {
            console.error("Failed to fetch employee attendance:", error);
            return [];
        }
    }

    // Fetch recent attendance across all employees (server already caps at the last 100 records).
    async getRecentAttendance(): Promise<AttendanceRecord[]> {
        try {
            const res = await fetch("/api/attendance");
            if (!res.ok) return [];
            return await res.json();
        } catch (error) {
            console.error("Failed to fetch recent attendance:", error);
            return [];
        }
    }

    // Fetch attendance for a specific date, filtered client-side from recent records.
    async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
        const recent = await this.getRecentAttendance();
        return recent.filter((record) => record.date.startsWith(date));
    }
}

export const attendanceService = new AttendanceService();