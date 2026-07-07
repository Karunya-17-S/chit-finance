import { useDataStore } from "@/store/data-store";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  branchId: string;
  type: "login" | "logout";
  timestamp: string;
  date: string;
}

class AttendanceService {
  // Record login for an employee
  recordLogin(employeeId: string): void {
    const now = new Date();
    const timestamp = now.toISOString();
    const date = now.toISOString().split('T')[0];
    
    // Get the store
    const store = useDataStore.getState();
    
    // Update employee's current login status
    store.updateEmployee(employeeId, {
      loginTime: timestamp,
      isLoggedIn: true,
      logoutTime: null,
      lastActivityAt: timestamp,
    });
    
    // Add to attendance history
    const attendanceRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId,
      branchId: store.employees.find(e => e.id === employeeId)?.branchId || '',
      type: "login",
      timestamp,
      date,
    };
    
    // Store in history (you'll need to add this to your data store)
    // We'll create an attendanceHistory array in the store
    if (store.attendanceHistory) {
      store.setAttendanceHistory([attendanceRecord, ...store.attendanceHistory]);
    }
  }
  
  // Record logout for an employee
  recordLogout(employeeId: string): void {
    const now = new Date();
    const timestamp = now.toISOString();
    const date = now.toISOString().split('T')[0];
    
    const store = useDataStore.getState();
    
    // Update employee's current logout status
    store.updateEmployee(employeeId, {
      logoutTime: timestamp,
      isLoggedIn: false,
      lastActivityAt: timestamp,
    });
    
    // Add to attendance history
    const attendanceRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId,
      branchId: store.employees.find(e => e.id === employeeId)?.branchId || '',
      type: "logout",
      timestamp,
      date,
    };
    
    if (store.attendanceHistory) {
      store.setAttendanceHistory([attendanceRecord, ...store.attendanceHistory]);
    }
  }
  
  // Get attendance history for an employee (last 24 hours)
  getEmployeeAttendance(employeeId: string): AttendanceRecord[] {
    const store = useDataStore.getState();
    const history = store.attendanceHistory || [];
    
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return history
      .filter(record => 
        record.employeeId === employeeId &&
        new Date(record.timestamp) >= twentyFourHoursAgo
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  // Get attendance history for a specific date
  getAttendanceByDate(date: string): AttendanceRecord[] {
    const store = useDataStore.getState();
    const history = store.attendanceHistory || [];
    
    return history
      .filter(record => record.date === date)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  // Get all attendance for last 24 hours
  getRecentAttendance(): AttendanceRecord[] {
    const store = useDataStore.getState();
    const history = store.attendanceHistory || [];
    
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return history
      .filter(record => new Date(record.timestamp) >= twentyFourHoursAgo)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  // Clean up old records (older than 24 hours) - call this periodically
  cleanupOldRecords(): void {
    const store = useDataStore.getState();
    const history = store.attendanceHistory || [];
    
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const filteredHistory = history.filter(
      record => new Date(record.timestamp) >= twentyFourHoursAgo
    );
    
    store.setAttendanceHistory(filteredHistory);
  }
}

export const attendanceService = new AttendanceService();