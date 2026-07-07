"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Users, Target, LogIn, LogOut, History } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Toolbar, SearchInput } from "@/components/shared/toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { EmployeeFormDialog, type EmployeeFormValues } from "@/components/employees/employee-form-dialog";
import { AssignCustomersDialog } from "@/components/employees/assign-customers-dialog";
import { useDataStore } from "@/store/data-store";
import { useDataScope } from "@/hooks/use-data-scope";
import { useAuthStore } from "@/store/auth-store";
import { can, ROLE_LABELS } from "@/lib/rbac";
import { formatCurrencyCompact, formatDate, formatTime } from "@/lib/format";
import type { Employee, AttendanceRecord } from "@/types";

export default function EmployeesPage() {
  const employees = useDataStore((s) => s.employees);
  const branches = useDataStore((s) => s.branches);
  const customers = useDataStore((s) => s.customers);
  const attendanceHistory = useDataStore((s) => s.attendanceHistory || []);
  const addEmployee = useDataStore((s) => s.addEmployee);
  const updateEmployee = useDataStore((s) => s.updateEmployee);
  const updateCustomer = useDataStore((s) => s.updateCustomer);
  const addAttendanceRecord = useDataStore((s) => s.addAttendanceRecord);

  const currentUser = useAuthStore((s) => s.currentUser);
  const { branchId } = useDataScope();
  const canManage = currentUser ? can(currentUser.role, "manageEmployees") : false;

  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [branchFilter, setBranchFilter] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | undefined>(undefined);
  const [activeEmployee, setActiveEmployee] = React.useState<Employee | undefined>(undefined);

  const scopedEmployees = branchId ? employees.filter((e) => e.branchId === branchId) : employees;

  const filtered = scopedEmployees.filter((e) => {
    const matchesSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeCode.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || e.role === roleFilter;
    const matchesBranch = branchFilter === "all" || e.branchId === branchFilter;
    return matchesSearch && matchesRole && matchesBranch;
  });

  function handleAdd() {
    setActiveEmployee(undefined);
    setDialogOpen(true);
  }

  function handleEdit(emp: Employee) {
    setActiveEmployee(emp);
    setDialogOpen(true);
  }

  function handleAssign(emp: Employee) {
    setActiveEmployee(emp);
    setAssignOpen(true);
  }

  function handleSubmit(values: EmployeeFormValues) {
    if (activeEmployee) {
      updateEmployee(activeEmployee.id, values);
      toast.success("Employee updated successfully.");
    } else {
      addEmployee({
        id: `emp-${String(employees.length + 1).padStart(3, "0")}`,
        employeeCode: `SVCF-E${String(employees.length + 1).padStart(3, "0")}`,
        assignedCustomerIds: [],
        collectionAchieved: 0,
        loginTime: null,
        logoutTime: null,
        isLoggedIn: false,
        ...values,
      });
      toast.success("Employee created successfully.");
    }
    setDialogOpen(false);
  }

  function handleAssignSubmit(customerIds: string[]) {
    if (!activeEmployee) return;
    const previousIds = new Set(activeEmployee.assignedCustomerIds);
    const nextIds = new Set(customerIds);

    customers.forEach((c) => {
      if (previousIds.has(c.id) && !nextIds.has(c.id)) {
        updateCustomer(c.id, { assignedEmployeeId: null });
      }
      if (nextIds.has(c.id)) {
        updateCustomer(c.id, { assignedEmployeeId: activeEmployee.id });
      }
    });
    updateEmployee(activeEmployee.id, { assignedCustomerIds: customerIds });
    toast.success(`${customerIds.length} customers assigned to ${activeEmployee.name}.`);
    setAssignOpen(false);
  }

  function handleRecordLogin(emp: Employee) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Update employee
    updateEmployee(emp.id, {
      loginTime: timestamp,
      isLoggedIn: true,
      logoutTime: null,
    });
    
    // Record in attendance history
    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: emp.id,
      branchId: emp.branchId,
      type: "login",
      timestamp,
      date: now.toISOString().split('T')[0],
    };
    addAttendanceRecord(record);
    
    toast.success(`${emp.name} logged in at ${formatTime(timestamp)}`);
  }

  function handleRecordLogout(emp: Employee) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Update employee
    updateEmployee(emp.id, {
      logoutTime: timestamp,
      isLoggedIn: false,
    });
    
    // Record in attendance history
    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: emp.id,
      branchId: emp.branchId,
      type: "logout",
      timestamp,
      date: now.toISOString().split('T')[0],
    };
    addAttendanceRecord(record);
    
    toast.success(`${emp.name} logged out at ${formatTime(timestamp)}`);
  }

  function handleViewHistory(emp: Employee) {
    setSelectedEmployee(emp);
    setHistoryDialogOpen(true);
  }

  function getEmployeeAttendance(employeeId: string): AttendanceRecord[] {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return attendanceHistory
      .filter(record => 
        record.employeeId === employeeId &&
        new Date(record.timestamp) >= twentyFourHoursAgo
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  const branchCustomersForActive = activeEmployee ? customers.filter((c) => c.branchId === activeEmployee.branchId) : [];

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage staff across branches, roles and collection targets."
        actions={
          canManage && (
            <Button onClick={handleAdd} className="bg-maroon hover:bg-maroon-dark">
              <Plus className="h-4 w-4" /> Add Employee
            </Button>
          )
        }
      />

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or employee ID..." />
        <div className="flex gap-2">
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
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="branch_admin">Branch Admin</SelectItem>
              <SelectItem value="collection_employee">Collection Employee</SelectItem>
              <SelectItem value="accountant">Accountant</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Toolbar>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No employees found" description="Try adjusting your search or filters." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Login Time</TableHead>
                <TableHead>Logout Time</TableHead>
                <TableHead>Collection Target</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((emp) => {
                const branch = branches.find((b) => b.id === emp.branchId);
                const progress = emp.collectionTarget > 0 ? Math.min(100, Math.round((emp.collectionAchieved / emp.collectionTarget) * 100)) : null;
                const isLoggedIn = emp.isLoggedIn || false;
                const history = getEmployeeAttendance(emp.id);
                
                return (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.employeeCode} · {emp.phone}</p>
                      {isLoggedIn && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                          Online
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{branch?.location ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{ROLE_LABELS[emp.role] ?? emp.role}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(emp.joiningDate, "short")}</TableCell>
                    <TableCell>
                      <StatusBadge status={emp.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {emp.loginTime ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <LogIn className="h-3 w-3" />
                          {formatTime(emp.loginTime)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {emp.logoutTime ? (
                        <span className="flex items-center gap-1 text-red-600">
                          <LogOut className="h-3 w-3" />
                          {formatTime(emp.logoutTime)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="w-44">
                      {progress !== null ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formatCurrencyCompact(emp.collectionAchieved)}</span>
                            <span>{formatCurrencyCompact(emp.collectionTarget)}</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(emp)}>Edit Employee</DropdownMenuItem>
                            {emp.role === "collection_employee" && (
                              <DropdownMenuItem onClick={() => handleAssign(emp)}>
                                <Target className="h-4 w-4" /> Assign Customers
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleRecordLogin(emp)}>
                              <LogIn className="h-4 w-4" /> Record Login
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRecordLogout(emp)}>
                              <LogOut className="h-4 w-4" /> Record Logout
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewHistory(emp)}>
                              <History className="h-4 w-4" /> View History ({history.length})
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                updateEmployee(emp.id, { status: emp.status === "active" ? "inactive" : "active" });
                                toast.success(`${emp.name} marked as ${emp.status === "active" ? "inactive" : "active"}.`);
                              }}
                              variant={emp.status === "active" ? "destructive" : "default"}
                            >
                              {emp.status === "active" ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <EmployeeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={activeEmployee}
        branches={branches}
        lockBranchId={branchId ?? undefined}
        onSubmit={handleSubmit}
      />
      <AssignCustomersDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        employee={activeEmployee}
        branchCustomers={branchCustomersForActive}
        onSubmit={handleAssignSubmit}
      />

      {/* Attendance History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attendance History - {selectedEmployee?.name}</DialogTitle>
            <DialogDescription>
              Last 24 hours of login/logout activity
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {selectedEmployee && getEmployeeAttendance(selectedEmployee.id).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No attendance records in the last 24 hours</p>
            ) : (
              <div className="space-y-2">
                {selectedEmployee && getEmployeeAttendance(selectedEmployee.id).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {record.type === "login" ? (
                        <LogIn className="h-4 w-4 text-green-600" />
                      ) : (
                        <LogOut className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">
                        {record.type === "login" ? "Logged In" : "Logged Out"}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(record.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}