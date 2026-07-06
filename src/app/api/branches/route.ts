import { prisma } from "@/lib/prisma";

// Always resolve at request time — this reads live DB data.
export const dynamic = "force-dynamic";

/**
 * GET /api/branches — branches with the aggregates the UI shows
 * (customer count, active groups, current-month collection, pending amount).
 * These are computed from relations rather than stored, so they never go stale.
 */
export async function GET() {
  const currentMonth = "2026-07";

  const [branches, customerCounts, activeGroupCounts, monthCollections, pendingAmounts] = await Promise.all([
    prisma.branch.findMany({ orderBy: { code: "asc" } }),
    prisma.customer.groupBy({ by: ["branchId"], _count: { id: true } }),
    prisma.chitGroup.groupBy({ by: ["branchId"], where: { status: "active" }, _count: { id: true } }),
    prisma.payment.groupBy({ by: ["branchId"], where: { month: currentMonth }, _sum: { paidAmount: true } }),
    prisma.payment.groupBy({
      by: ["branchId"],
      where: { status: { in: ["pending", "overdue", "partial"] } },
      _sum: { dueAmount: true, paidAmount: true },
    }),
  ]);

  const data = branches.map((b) => {
    const pending = pendingAmounts.find((p) => p.branchId === b.id);
    const pendingAmount = Number(pending?._sum.dueAmount ?? 0) - Number(pending?._sum.paidAmount ?? 0);
    return {
      ...b,
      totalCustomers: customerCounts.find((c) => c.branchId === b.id)?._count.id ?? 0,
      activeChitGroups: activeGroupCounts.find((g) => g.branchId === b.id)?._count.id ?? 0,
      monthlyCollection: Number(monthCollections.find((m) => m.branchId === b.id)?._sum.paidAmount ?? 0),
      pendingAmount,
    };
  });

  return Response.json({ branches: data });
}
