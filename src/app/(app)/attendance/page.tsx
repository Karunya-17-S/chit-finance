"use client";

import * as React from "react";
import { toast } from "sonner";
import { CalendarCheck, UserCheck, UserX, Coffee, CalendarClock, Pencil, Loader2, LogIn, LogOut } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MarkAttendanceDialog, type AttendanceFormValues } from "@/components/attendance/mark-attendance-dialog";
import { useDataStore } from "@/store/data-store";
import { useDataScope } from "@/hooks/use-data-scope";
import { useAuthStore } from "@/store/auth-store";
import { can, ROLE_LABELS } from "@/lib/rbac";
import { ATTENDANCE_TODAY } from "@/data";
import { initials, formatTime } from "@/lib/format";
import { attendanceService, type AttendanceRecord } from "@/lib/service/attendance-service";
import type { Attendance, Employee } from "@/types";

export default function AttendancePage() {
  const employees = useDataStore((s) => s.employees);
  const branches = useDataStore((s) => s.branches);

  const currentUser = useAuthStore((s) => s.currentUser);
  const { branchId } = useDataScope();
  const canManage = currentUser ? can(currentUser.role, "manageEmployees") : false;

  const [date, setDate] = React.useState(ATTENDANCE_TODAY);
  const [branchFilter, setBranchFilter] = React.useState("all");
  const [dialogEmployee, setDialogEmployee] = React.useState<Employee | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Real daily status attendance (present/absent/half-day/leave), from the database.
  const [attendance, setAttendance] = React.useState<Attendance[]>([]);
  const [attendanceLoading, setAttendanceLoading] = React.useState(true);
  const [savingStatus, setSavingStatus] = React.useState(false);

  const fetchAttendance = React.useCallback(async () => {
    setAttendanceLoading(true);
    try {
      const res = await fetch("/api/attendance-status");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      // Normalize to plain YYYY-MM-DD so string comparisons against the date picker work.
      const normalized: Attendance[] = data.map((r: any) => ({ ...r, date: String(r.date).split("T")[0] }));
      setAttendance(normalized);
    } catch (error) {
      console.error("Failed to load attendance:", error);
      toast.error("Failed to load attendance data.");
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Real login/logout attendance log, fetched from the database.
  const [loginLog, setLoginLog] = React.useState<AttendanceRecord[]>([]);
  const [loginLogLoading, setLoginLogLoading] = React.useState(true);
  const [submittingEmployeeId, setSubmittingEmployeeId] = React.useState<string | null>(null);

  const fetchLoginLog = React.useCallback(async () => {
    setLoginLogLoading(true);
    const records = await attendanceService.getRecentAttendance();
    setLoginLog(records);
    setLoginLogLoading(false);
  }, []);

  React.useEffect(() => {
    fetchLoginLog();
  }, [fetchLoginLog]);

  const scopedEmployees = employees.filter((e) => {
    if (branchId && e.branchId !== branchId) return false;
    if (!branchId && branchFilter !== "all" && e.branchId !== branchFilter) return false;
    return true;
  });

  function recordFor(employeeId: string, d: string): Attendance | undefined {
    return attendance.find((a) => a.employeeId === employeeId && a.date === d);
  }

  // Roster for the selected date.
  const roster = scopedEmployees.map((e) => ({ employee: e, record: recordFor(e.id, date) }));
  const counts = {
    present: roster.filter((r) => r.record?.status === "present").length,
    absent: roster.filter((r) => r.record?.status === "absent").length,
    halfDay: roster.filter((r) => r.record?.status === "half_day").length,
    leave: roster.filter((r) => r.record?.status === "leave").length,
  };
  const workingCount = roster.filter((r) => r.record && r.record.status !== "week_off").length;
  const attendancePct = workingCount ? Math.round(((counts.present + counts.halfDay * 0.5) / workingCount) * 100) : 0;

  // Monthly summary across all fetched attendance (per scoped employee).
  const monthly = scopedEmployees.map((e) => {
    const recs = attendance.filter((a) => a.employeeId === e.id);
    const working = recs.filter((r) => r.status !== "week_off").length;
    const present = recs.filter((r) => r.status === "present").length;
    const half = recs.filter((r) => r.status === "half_day").length;
    const absent = recs.filter((r) => r.status === "absent").length;
    const leave = recs.filter((r) => r.status === "leave").length;
    const pct = working ? Math.round(((present + half * 0.5) / working) * 100) : 0;
    return { employee: e, working, present, half, absent, leave, pct };
  });

  function openDialog(employee: Employee) {
    setDialogEmployee(employee);
    setDialogOpen(true);
  }

  async function handleSubmit(values: AttendanceFormValues) {
    if (!dialogEmployee) return;
    const isWorking = values.status === "present" || values.status === "half_day";

    setSavingStatus(true);
    try {
      const res = await fetch("/api/attendance-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: dialogEmployee.id,
          branchId: dialogEmployee.branchId,
          date,
          status: values.status,
          checkIn: isWorking ? values.checkIn : null,
          checkOut: isWorking ? values.checkOut : null,
          remarks: values.remarks || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");

      toast.success(`Attendance saved for ${dialogEmployee.name}.`);
      setDialogOpen(false);
      await fetchAttendance();
    } catch (error) {
      console.error("Failed to save attendance:", error);
      toast.error("Failed to save attendance.");
    } finally {
      setSavingStatus(false);
    }
  }

  // ---- Login/logout tab helpers ----

  function isEmployeeLoggedIn(employeeId: string): boolean {
    const records = loginLog
      .filter((a) => a.employeeId === employeeId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return records.length > 0 && records[0].type === "login";
  }

  function latestRecordFor(employeeId: string): AttendanceRecord | null {
    const records = loginLog
      .filter((a) => a.employeeId === employeeId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return records[0] ?? null;
  }

  async function handleRecordAttendance(employee: Employee, type: "login" | "logout") {
    if (submittingEmployeeId) return;

    if (type === "login" && isEmployeeLoggedIn(employee.id)) {
      toast.error(`${employee.name} is already logged in.`);
      return;
    }
    if (type === "logout" && !isEmployeeLoggedIn(employee.id)) {
      toast.error(`${employee.name} hasn't logged in yet.`);
      return;
    }

    setSubmittingEmployeeId(employee.id);
    try {
      if (type === "login") {
        await attendanceService.recordLogin(employee.id);
      } else {
        await attendanceService.recordLogout(employee.id);
      }
      toast.success(`${employee.name} ${type === "login" ? "logged in" : "logged out"} successfully.`);
      await fetchLoginLog();
    } catch (error) {
      console.error("Failed to record attendance:", error);
      toast.error("Failed to record attendance.");
    } finally {
      setSubmittingEmployeeId(null);
    }
  }

  const loggedInNow = scopedEmployees.filter((e) => isEmployeeLoggedIn(e.id)).length;

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Daily staff attendance, monthly summary, and live login/logout tracking."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {!branchId && (
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input type="date" value={date} max={ATTENDANCE_TODAY} onChange={(e) => setDate(e.target.value)} className="w-44" />
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Present" value={String(counts.present)} icon={UserCheck} hint={`${attendancePct}% attendance`} />
        <StatCard label="Absent" value={String(counts.absent)} icon={UserX} />
        <StatCard label="Half Day" value={String(counts.halfDay)} icon={Coffee} />
        <StatCard label="On Leave" value={String(counts.leave)} icon={CalendarClock} />
      </div>

      <Tabs defaultValue="roster">
        <TabsList>
          <TabsTrigger value="roster">Daily Roster</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Summary</TabsTrigger>
          <TabsTrigger value="login-tracking">Login/Logout Tracking {loggedInNow > 0 && `(${loggedInNow} online)`}</TabsTrigger>
        </TabsList>

        <TabsContent value="roster">
          {attendanceLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-maroon" />
              <span className="ml-2 text-muted-foreground">Loading attendance...</span>
            </div>
          ) : roster.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="No staff to show" description="No employees match this branch." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Status</TableHead>
                    {canManage && <TableHead className="text-right">Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.map(({ employee, record }) => {
                    const branch = branches.find((b) => b.id === employee.branchId);
                    return (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-maroon text-xs font-semibold text-white">
                              {initials(employee.name)}
                            </span>
                            <div>
                              <p className="font-medium text-foreground">{employee.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {employee.employeeCode} · {ROLE_LABELS[employee.role]}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{branch?.location ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{record?.checkIn ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{record?.checkOut ?? "—"}</TableCell>
                        <TableCell>
                          {record ? <StatusBadge status={record.status} /> : <span className="text-xs text-muted-foreground">Not marked</span>}
                        </TableCell>
                        {canManage && (
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => openDialog(employee)}>
                              <Pencil className="h-3.5 w-3.5" /> {record ? "Edit" : "Mark"}
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="monthly">
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Working Days</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Half Day</TableHead>
                  <TableHead>Leave</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Attendance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthly.map((m) => (
                  <TableRow key={m.employee.id}>
                    <TableCell className="font-medium text-foreground">{m.employee.name}</TableCell>
                    <TableCell className="text-muted-foreground">{m.working}</TableCell>
                    <TableCell className="text-success">{m.present}</TableCell>
                    <TableCell className="text-warning">{m.half}</TableCell>
                    <TableCell className="text-violet-600">{m.leave}</TableCell>
                    <TableCell className="text-destructive">{m.absent}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={m.pct >= 90 ? "h-full bg-success" : m.pct >= 75 ? "h-full bg-warning" : "h-full bg-destructive"}
                            style={{ width: `${m.pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground">{m.pct}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="login-tracking">
          {loginLogLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-maroon" />
              <span className="ml-2 text-muted-foreground">Loading login activity...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={fetchLoginLog}>
                  Refresh
                </Button>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Last Logout</TableHead>
                      {canManage && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scopedEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No employees found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      scopedEmployees.map((employee) => {
                        const branch = branches.find((b) => b.id === employee.branchId);
                        const loggedIn = isEmployeeLoggedIn(employee.id);
                        const latest = latestRecordFor(employee.id);
                        const isSubmittingThis = submittingEmployeeId === employee.id;

                        return (
                          <TableRow key={employee.id}>
                            <TableCell>
                              <p className="font-medium text-foreground">{employee.name}</p>
                              <p className="text-xs text-muted-foreground">{employee.employeeCode}</p>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{branch?.location ?? "—"}</TableCell>
                            <TableCell>
                              {loggedIn ? (
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
                            <TableCell className="text-muted-foreground">
                              {latest?.type === "login" ? formatTime(latest.timestamp) : "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {latest?.type === "logout" ? formatTime(latest.timestamp) : "—"}
                            </TableCell>
                            {canManage && (
                              <TableCell className="text-right">
                                {!loggedIn ? (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleRecordAttendance(employee, "login")}
                                    disabled={isSubmittingThis}
                                  >
                                    {isSubmittingThis ? <Loader2 className="h-4 w-4 animate-spin" /> : <><LogIn className="h-3.5 w-3.5" /> Log In</>}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRecordAttendance(employee, "logout")}
                                    disabled={isSubmittingThis}
                                  >
                                    {isSubmittingThis ? <Loader2 className="h-4 w-4 animate-spin" /> : <><LogOut className="h-3.5 w-3.5" /> Log Out</>}
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
          )}
        </TabsContent>
      </Tabs>

      <MarkAttendanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={dialogEmployee}
        date={date}
        existing={dialogEmployee ? recordFor(dialogEmployee.id, date) : undefined}
        onSubmit={handleSubmit}
        isSubmitting={savingStatus}
      />
    </div>
  );
}