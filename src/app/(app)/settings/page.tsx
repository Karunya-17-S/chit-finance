"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Building2, Upload, Check, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDataStore } from "@/store/data-store";
import { users as seedUsers } from "@/data/users";
import { ROLE_LABELS, PERMISSION_LABELS, ALL_ROLES, getPermissionMatrix } from "@/lib/rbac";

export default function SettingsPage() {
  const branches = useDataStore((s) => s.branches);
  const [users] = React.useState(seedUsers);

  const [company, setCompany] = React.useState({
    name: "Shree Vaari Chit Finance",
    registrationNo: "TN-CHIT-2015-00482",
    gstNumber: "33ABCDE1234F1Z5",
    phone: "+91 44 4212 3456",
    email: "info@shreevaarichits.in",
    address: "24, Usman Road, T. Nagar, Chennai, Tamil Nadu 600017",
  });

  const [receiptSettings, setReceiptSettings] = React.useState({
    prefix: "RCT",
    startingNumber: 1001,
    footerNote: "Thank you for your payment. This is a system-generated receipt from Shree Vaari Chit Finance.",
  });

  const [notifications, setNotifications] = React.useState({
    smsReminders: true,
    whatsappReminders: true,
    emailReceipts: false,
    overdueAlerts: true,
  });

  const permissionMatrix = getPermissionMatrix();
  const permissionKeys = Object.keys(PERMISSION_LABELS).filter((k) => k !== "readOnly") as Array<keyof typeof PERMISSION_LABELS>;

  return (
    <div>
      <PageHeader title="Settings" description="Manage company profile, branches, users, permissions and preferences." />

      <Tabs defaultValue="company">
        <TabsList className="flex-wrap">
          <TabsTrigger value="company">Company Profile</TabsTrigger>
          <TabsTrigger value="branches">Branch Settings</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="permissions">Role Permissions</TabsTrigger>
          <TabsTrigger value="receipts">Receipt Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <SectionCard title="Company Profile" description="Basic organization details used across receipts and reports.">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="col-span-2 space-y-1.5">
                    <Label>Company Name</Label>
                    <Input value={company.name} onChange={(e) => setCompany((c) => ({ ...c, name: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Registration No.</Label>
                    <Input value={company.registrationNo} onChange={(e) => setCompany((c) => ({ ...c, registrationNo: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>GST Number</Label>
                    <Input value={company.gstNumber} onChange={(e) => setCompany((c) => ({ ...c, gstNumber: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input value={company.phone} onChange={(e) => setCompany((c) => ({ ...c, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input value={company.email} onChange={(e) => setCompany((c) => ({ ...c, email: e.target.value }))} />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Registered Address</Label>
                    <Textarea rows={2} value={company.address} onChange={(e) => setCompany((c) => ({ ...c, address: e.target.value }))} />
                  </div>
                </div>
                <Button className="mt-4 bg-maroon hover:bg-maroon-dark" onClick={() => toast.success("Company profile saved.")}>
                  Save Changes
                </Button>
              </div>

              <div>
                <Label className="mb-1.5 block">Company Logo</Label>
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-8 text-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">PNG or SVG, up to 2MB</p>
                  <Button variant="outline" size="sm" disabled className="mt-1">
                    Upload Logo
                  </Button>
                </div>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="branches">
          <SectionCard title="Branch Settings" description="Quick overview — manage full branch details from the Branches module.">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium text-foreground">{b.name}</TableCell>
                      <TableCell className="text-muted-foreground">{b.code}</TableCell>
                      <TableCell className="text-muted-foreground">{b.managerName}</TableCell>
                      <TableCell>
                        <StatusBadge status={b.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/branches/${b.id}`}>
                            <Building2 className="h-3.5 w-3.5" /> Open
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="users">
          <SectionCard title="User Management" description="System login accounts and their assigned roles.">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const branch = branches.find((b) => b.id === u.branchId);
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium text-foreground">{u.name}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="text-muted-foreground">{ROLE_LABELS[u.role]}</TableCell>
                        <TableCell className="text-muted-foreground">{branch?.location ?? "All Branches"}</TableCell>
                        <TableCell>
                          <StatusBadge status={u.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="permissions">
          <SectionCard title="Role Permissions" description="Read-only matrix of what each role can do across the system.">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    {ALL_ROLES.map((role) => (
                      <TableHead key={role} className="text-center">
                        {ROLE_LABELS[role]}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissionKeys.map((key) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium text-foreground">{PERMISSION_LABELS[key]}</TableCell>
                      {ALL_ROLES.map((role) => (
                        <TableCell key={role} className="text-center">
                          {permissionMatrix[role][key] ? (
                            <Check className="mx-auto h-4 w-4 text-success" />
                          ) : (
                            <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="receipts">
          <SectionCard title="Receipt Settings" description="Configure receipt numbering and footer message.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Receipt Prefix</Label>
                <Input value={receiptSettings.prefix} onChange={(e) => setReceiptSettings((r) => ({ ...r, prefix: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Starting Number</Label>
                <Input
                  type="number"
                  value={receiptSettings.startingNumber}
                  onChange={(e) => setReceiptSettings((r) => ({ ...r, startingNumber: Number(e.target.value) }))}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Footer Note</Label>
                <Textarea
                  rows={3}
                  value={receiptSettings.footerNote}
                  onChange={(e) => setReceiptSettings((r) => ({ ...r, footerNote: e.target.value }))}
                />
              </div>
            </div>
            <Button className="mt-4 bg-maroon hover:bg-maroon-dark" onClick={() => toast.success("Receipt settings saved.")}>
              Save Changes
            </Button>
          </SectionCard>
        </TabsContent>

        <TabsContent value="notifications">
          <SectionCard title="Notification Settings" description="Control automated reminders sent to customers.">
            <div className="space-y-4">
              {[
                { key: "smsReminders" as const, label: "SMS Payment Reminders", hint: "Send SMS reminders before due dates" },
                { key: "whatsappReminders" as const, label: "WhatsApp Reminders", hint: "Send WhatsApp messages using templates" },
                { key: "emailReceipts" as const, label: "Email Receipts", hint: "Email a copy of the receipt after payment" },
                { key: "overdueAlerts" as const, label: "Overdue Alerts", hint: "Notify branch admins of overdue accounts daily" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.hint}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={(v) => setNotifications((n) => ({ ...n, [item.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
