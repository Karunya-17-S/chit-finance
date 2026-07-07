"use client";

import * as React from "react";
import { toast } from "sonner";
import { Calendar, Clock, User, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDataStore } from "@/store/data-store";
import { useDataScope } from "@/hooks/use-data-scope";
import { useAuthStore } from "@/store/auth-store";
import { can } from "@/lib/rbac";
import { formatDate, formatTime } from "@/lib/format";
import type { Employee, AttendanceRecord } from "@/types";

export default function AttendancePage() {
  const [attendance, setAttendance] = React.useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState<string | null>(null);
  const [selectedDate, setSelectedDate] = React.useState(
    new Date().toISOString().split('T')[0]
  );

  const employees = useDataStore((s) => s.employees) || [];
  const branches = useDataStore((s) => s.branches) || [];
  const currentUser = useAuthStore((s) => s.currentUser);
  const { branchId } = useDataScope();
  const canManage = currentUser ? can(currentUser.role, "manageEmployees") : false;

  // Fetch attendance data
  const fetchAttendance = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/attendance?date=${selectedDate}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setAttendance(data || []);
    } catch (error) {
      console.error('Failed to load attendance:', error);
      toast.error('Failed to load attendance data');
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Initial load and refresh on date change
  React.useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Get employees for this branch
  const branchEmployees = branchId
    ? employees.filter((e) => e.branchId === branchId)
    : employees;

  // Get today's attendance for a specific employee
  const getTodayAttendance = (employeeId: string) => {
    if (!attendance || attendance.length === 0) return null;
    // Filter for this employee and date
    const records = attendance
      .filter(a => a.employeeId === employeeId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return records.length > 0 ? records[0] : null;
  };

  // Check if employee is currently logged in (last record is 'login')
  const isEmployeeLoggedIn = (employeeId: string) => {
    if (!attendance || attendance.length === 0) return false;
    const records = attendance
      .filter(a => a.employeeId === employeeId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (records.length === 0) return false;
    return records[0].type === 'login';
  };

  // Handle login/logout
  const handleRecordAttendance = async (employee: Employee, type: 'login' | 'logout') => {
    if (isSubmitting) return;
    
    // Check if trying to login while already logged in
    if (type === 'login' && isEmployeeLoggedIn(employee.id)) {
      toast.error(`${employee.name} is already logged in! Please logout first.`);
      return;
    }

    // Check if trying to logout without logging in first
    if (type === 'logout' && !isEmployeeLoggedIn(employee.id)) {
      toast.error(`${employee.name} hasn't logged in today!`);
      return;
    }

    try {
      setIsSubmitting(employee.id);
      const now = new Date();
      
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee.id,
          branchId: employee.branchId,
          type,
          timestamp: now.toISOString(),
          date: now.toISOString().split('T')[0],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'ALREADY_LOGGED_IN') {
          toast.error(data.error || 'Employee is already logged in!');
          return;
        }
        throw new Error(data.error || 'Failed to record attendance');
      }

      toast.success(`${employee.name} ${type === 'login' ? 'logged in' : 'logged out'} successfully!`);
      await fetchAttendance(); // Refresh the list
    } catch (error) {
      console.error('Failed to record attendance:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to record attendance');
    } finally {
      setIsSubmitting(null);
    }
  };

  // Calculate stats
  const totalEmployees = branchEmployees.length;
  const presentToday = attendance
    ? attendance.filter((a) => a.type === 'login').length
    : 0;
  const loggedInNow = branchEmployees.filter((e) => isEmployeeLoggedIn(e.id)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-maroon" />
        <span className="ml-2 text-muted-foreground">Loading attendance...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Track employee attendance across branches"
        actions={
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <Button
              variant="outline"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            >
              Today
            </Button>
            <Button
              variant="outline"
              onClick={fetchAttendance}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logged In Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{loggedInNow}</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Login Time</TableHead>
              <TableHead>Logout Time</TableHead>
              {canManage && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {branchEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No employees found in this branch
                </TableCell>
              </TableRow>
            ) : (
              branchEmployees.map((employee) => {
                const todayRecord = getTodayAttendance(employee.id);
                const isLoggedIn = isEmployeeLoggedIn(employee.id);
                const branch = branches.find((b) => b.id === employee.branchId);
                const isSubmittingThis = isSubmitting === employee.id;

                return (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">{employee.employeeCode}</p>
                    </TableCell>
                    <TableCell>{branch?.location || "—"}</TableCell>
                    <TableCell>
                      {isLoggedIn ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5 inline-block animate-pulse" />
                          Logged In
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                          Offline
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {todayRecord?.type === 'login' && todayRecord.timestamp 
                        ? formatTime(todayRecord.timestamp) 
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {todayRecord?.type === 'logout' && todayRecord.timestamp 
                        ? formatTime(todayRecord.timestamp) 
                        : "—"}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        {!isLoggedIn ? (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleRecordAttendance(employee, 'login')}
                            disabled={isSubmittingThis}
                          >
                            {isSubmittingThis ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Log In'
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRecordAttendance(employee, 'logout')}
                            disabled={isSubmittingThis}
                          >
                            {isSubmittingThis ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Log Out'
                            )}
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}