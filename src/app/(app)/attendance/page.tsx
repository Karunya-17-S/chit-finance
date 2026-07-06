"use client";

import * as React from "react";
import { toast } from "sonner";
import { CalendarCheck, UserCheck, UserX, Coffee, CalendarClock, Pencil } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MarkAttendanceDialog, type AttendanceFormValues } from "@/components/attendance/mark-attendance-dialog";
import { useDataStore } from "@/store/data-store";
import { useDataScope } from "@/hooks/use-data-scope";
import { useAuthStore } from "@/store/auth-store";
import { can } from "@/lib/rbac";
import { ROLE_LABELS } from "@/lib/rbac";
import { ATTENDANCE_TODAY } from "@/data";
import { initials } from "@/lib/format";
import type { Attendance, Employee } from "@/types";

export default function AttendancePage() {
  const employees = useDataStore((s) => s.employees);
  const branches = useDataStore((s) => s.branches);
  const attendance = useDataStore((s) => s.attendance);
  const upsertAttendance = useDataStore((s) => s.upsertAttendance);

  const currentUser = useAuthStore((s) => s.currentUser);
  const { branchId } = useDataScope();
  const canManage = currentUser ? can(currentUser.role, "manageEmployees") : false;

  const [date, setDate] = React.useState(ATTENDANCE_TODAY);
  const [branchFilter, setBranchFilter] = React.useState("all");
  const [dialogEmployee, setDialogEmployee] = React.useState<Employee | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = React.useState(false);

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

  // Monthly summary across all seeded attendance (per scoped employee).
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

  function handleSubmit(values: AttendanceFormValues) {
    if (!dialogEmployee) return;
    const isWorking = values.status === "present" || values.status === "half_day";
    const existing = recordFor(dialogEmployee.id, date);
    upsertAttendance({
      id: existing?.id ?? `att-local-${Date.now()}`,
      employeeId: dialogEmployee.id,
      branchId: dialogEmployee.branchId,
      date,
      status: values.status,
      checkIn: isWorking ? values.checkIn : null,
      checkOut: isWorking ? values.checkOut : null,
      remarks: values.remarks || undefined,
    });
    toast.success(`Attendance saved for ${dialogEmployee.name}.`);
    setDialogOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Daily staff attendance and monthly summary across branches."
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
        </TabsList>

        <TabsContent value="roster">
          {roster.length === 0 ? (
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
      </Tabs>

      <MarkAttendanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={dialogEmployee}
        date={date}
        existing={dialogEmployee ? recordFor(dialogEmployee.id, date) : undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
