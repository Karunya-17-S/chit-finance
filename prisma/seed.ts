/**
 * Seeds the database from the mock data layer in src/data, preserving the
 * mock IDs (br-001, emp-002, …) so seeded rows cross-reference correctly.
 * Run with: npm run db:seed (wipes and re-inserts everything).
 */
import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { branches } from "../src/data/branches";
import { users } from "../src/data/users";
import { employees } from "../src/data/employees";
import { customers } from "../src/data/customers";
import { chitGroups } from "../src/data/chit-groups";
import { chitMembers } from "../src/data/chit-members";
import { payments } from "../src/data/payments";
import { auctions } from "../src/data/auctions";
import { templates } from "../src/data/templates";
import { followUps } from "../src/data/followups";
import { locationPings } from "../src/data/locations";
import { expenses } from "../src/data/expenses";
import { chitPlans } from "../src/data/chit-plans";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const date = (s: string) => new Date(s);
const dateOrNull = (s: string | null | undefined) => (s ? new Date(s) : null);

async function main() {
  // Delete in FK-dependency order.
  await prisma.chitPlan.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.locationPing.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.chitMember.deleteMany();
  await prisma.chitGroup.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.template.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.branch.deleteMany();

  await prisma.branch.createMany({
    data: branches.map((b) => ({
      id: b.id,
      name: b.name,
      code: b.code,
      location: b.location,
      address: b.address,
      managerName: b.managerName,
      phone: b.phone,
      email: b.email,
      openingDate: date(b.openingDate),
      status: b.status,
      // totalCustomers / activeChitGroups / monthlyCollection / pendingAmount
      // are derived aggregates — computed from relations, not stored.
    })),
  });

  await prisma.employee.createMany({
    data: employees.map((e) => ({
      id: e.id,
      employeeCode: e.employeeCode,
      name: e.name,
      branchId: e.branchId,
      role: e.role,
      phone: e.phone,
      email: e.email,
      joiningDate: date(e.joiningDate),
      salary: e.salary,
      status: e.status,
      collectionTarget: e.collectionTarget,
      collectionAchieved: e.collectionAchieved,
      avatarUrl: e.avatarUrl ?? null,
      // assignedCustomerIds is modelled via Customer.assignedEmployeeId.
    })),
  });

  await prisma.user.createMany({
    data: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      branchId: u.branchId,
      avatarUrl: u.avatarUrl ?? null,
      status: u.status,
    })),
  });

  await prisma.customer.createMany({
    data: customers.map((c) => ({
      id: c.id,
      customerCode: c.customerCode,
      name: c.name,
      branchId: c.branchId,
      phone: c.phone,
      alternatePhone: c.alternatePhone ?? null,
      address: c.address,
      aadhaarNumber: c.aadhaarNumber,
      panNumber: c.panNumber,
      occupation: c.occupation,
      monthlyIncome: c.monthlyIncome,
      nomineeName: c.nomineeName,
      nomineePhone: c.nomineePhone,
      joinedDate: date(c.joinedDate),
      status: c.status,
      assignedEmployeeId: c.assignedEmployeeId,
      avatarUrl: c.avatarUrl ?? null,
    })),
  });

  await prisma.chitGroup.createMany({
    data: chitGroups.map((g) => ({
      id: g.id,
      groupName: g.groupName,
      groupCode: g.groupCode,
      branchId: g.branchId,
      chitValue: g.chitValue,
      installmentAmount: g.monthlyInstallment,
      collectionFrequency: g.collectionFrequency,
      durationMonths: g.durationMonths,
      totalMembers: g.totalMembers,
      // currentMembers is derived from the members relation.
      startDate: date(g.startDate),
      endDate: date(g.endDate),
      auctionDate: date(g.auctionDate),
      status: g.status,
      commissionPercentage: g.commissionPercentage,
      foremanCommission: g.foremanCommission,
      collectionEmployeeId: g.collectionEmployeeId,
    })),
  });

  await prisma.chitMember.createMany({
    data: chitMembers.map((m) => ({
      id: m.id,
      chitGroupId: m.chitGroupId,
      customerId: m.customerId,
      agreementNo: m.agreementNo,
      joinedDate: date(m.joinedDate),
      entryPeriod: m.entryPeriod,
      hasWon: m.hasWon,
      wonMonth: m.wonMonth ?? null,
      wonAmount: m.wonAmount ?? null,
      status: m.status,
    })),
  });

  await prisma.payment.createMany({
    data: payments.map((p) => ({
      id: p.id,
      paymentCode: p.paymentCode,
      customerId: p.customerId,
      branchId: p.branchId,
      chitGroupId: p.chitGroupId,
      month: p.month,
      dueAmount: p.dueAmount,
      paidAmount: p.paidAmount,
      paymentDate: dateOrNull(p.paymentDate),
      paymentMode: p.paymentMode,
      paymentCategory: p.paymentCategory,
      receiptNumber: p.receiptNumber,
      billNumber: p.billNumber,
      collectedById: p.collectedBy,
      status: p.status,
      remarks: p.remarks ?? null,
    })),
  });

  // One Receipt row per payment that actually produced a receipt.
  await prisma.receipt.createMany({
    data: payments
      .filter((p) => p.receiptNumber && p.paymentDate && p.paymentMode && p.collectedBy)
      .map((p) => ({
        receiptNumber: p.receiptNumber!,
        paymentId: p.id,
        customerId: p.customerId,
        amount: p.paidAmount,
        date: date(p.paymentDate!),
        mode: p.paymentMode!,
        issuedById: p.collectedBy!,
      })),
  });

  await prisma.auction.createMany({
    data: auctions.map((a) => ({
      id: a.id,
      chitGroupId: a.chitGroupId,
      month: a.month,
      auctionDate: date(a.auctionDate),
      winnerCustomerId: a.winnerCustomerId,
      bidAmount: a.bidAmount,
      discountAmount: a.discountAmount,
      dividendPerMember: a.dividendPerMember,
      status: a.status,
    })),
  });

  await prisma.template.createMany({
    data: templates.map((t) => ({
      id: t.id,
      name: t.name,
      type: t.type,
      content: t.content,
      variables: t.variables,
      createdAt: date(t.createdAt),
      updatedAt: date(t.updatedAt),
    })),
  });

  await prisma.followUp.createMany({
    data: followUps.map((f) => ({
      id: f.id,
      customerId: f.customerId,
      employeeId: f.employeeId,
      branchId: f.branchId,
      note: f.note,
      status: f.status,
      lastContactedDate: dateOrNull(f.lastContactedDate),
      nextFollowUpDate: dateOrNull(f.nextFollowUpDate),
      promiseToPayDate: dateOrNull(f.promiseToPayDate),
      createdAt: date(f.createdAt),
    })),
  });

  await prisma.locationPing.createMany({
    data: locationPings.map((l) => ({
      id: l.id,
      employeeId: l.employeeId,
      branchId: l.branchId,
      lat: l.lat,
      lng: l.lng,
      address: l.address,
      timestamp: date(l.timestamp),
      status: l.status,
    })),
  });

  await prisma.expense.createMany({
    data: expenses.map((e) => ({
      id: e.id,
      expenseCode: e.expenseCode,
      branchId: e.branchId,
      category: e.category,
      title: e.title,
      amount: e.amount,
      date: date(e.date),
      paidTo: e.paidTo,
      paymentMode: e.paymentMode,
      recordedById: e.recordedBy,
      billNumber: e.billNumber ?? null,
      remarks: e.remarks ?? null,
    })),
  });

  await prisma.chitPlan.createMany({
    data: chitPlans.map((p) => ({
      id: p.id,
      chitValue: p.chitValue,
      frequency: p.frequency,
      periods: p.periods,
      durationLabel: p.durationLabel,
      members: p.members,
      totalPayable: p.totalPayable,
      dailyApprox: p.dailyApprox ?? null,
      weeklyApprox: p.weeklyApprox ?? null,
      featured: p.featured ?? false,
      schedule: p.schedule as unknown as Prisma.InputJsonValue,
    })),
  });

  const counts = {
    branches: await prisma.branch.count(),
    users: await prisma.user.count(),
    employees: await prisma.employee.count(),
    customers: await prisma.customer.count(),
    chitGroups: await prisma.chitGroup.count(),
    chitMembers: await prisma.chitMember.count(),
    payments: await prisma.payment.count(),
    receipts: await prisma.receipt.count(),
    auctions: await prisma.auction.count(),
    templates: await prisma.template.count(),
    followUps: await prisma.followUp.count(),
    locationPings: await prisma.locationPing.count(),
    expenses: await prisma.expense.count(),
    chitPlans: await prisma.chitPlan.count(),
  };
  console.log("Seeded:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
