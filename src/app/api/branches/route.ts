import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Always resolve at request time — this reads live DB data.
export const dynamic = "force-dynamic";

/**
 * GET /api/branches — branches with the aggregates the UI shows
 * (customer count, active groups, current-month collection, pending amount).
 * These are computed from relations rather than stored, so they never go stale.
 *
 * By default returns only active (non-deleted) branches.
 * ?deleted=true returns only soft-deleted branches (for the recovery archive).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const showDeleted = searchParams.get("deleted") === "true";

  // Current month bucket, e.g. "2026-07" — based on the real system clock.
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [branches, customerCounts, activeGroupCounts, monthCollections, pendingAmounts] = await Promise.all([
    prisma.branch.findMany({
      where: showDeleted ? { deletedAt: { not: null } } : { deletedAt: null },
      orderBy: { code: "asc" },
    }),
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

  return NextResponse.json({ branches: data });
}

// POST - Create a new branch.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.code || !body.location) {
      return NextResponse.json({ error: "Name, code, and location are required" }, { status: 400 });
    }

    const branch = await prisma.branch.create({
      data: {
        name: body.name,
        code: body.code,
        location: body.location,
        address: body.address || "",
        managerName: body.managerName || "",
        phone: body.phone || "",
        email: body.email || "",
        openingDate: body.openingDate ? new Date(body.openingDate) : new Date(),
        status: body.status || "active",
      },
    });

    return NextResponse.json(branch);
  } catch (error) {
    console.error("POST /api/branches error:", error);
    return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
  }
}

// PUT - Update a branch. Pass { restore: true } to clear a soft-delete instead of a normal field update.
export async function PUT(request: NextRequest) {
  try {
    const { id, restore, ...data } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Branch ID is required" }, { status: 400 });
    }

    if (restore) {
      const branch = await prisma.branch.update({
        where: { id },
        data: { deletedAt: null },
      });
      return NextResponse.json(branch);
    }

    const branch = await prisma.branch.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        location: data.location,
        address: data.address,
        managerName: data.managerName,
        phone: data.phone,
        email: data.email,
        openingDate: data.openingDate ? new Date(data.openingDate) : undefined,
        status: data.status,
      },
    });

    return NextResponse.json(branch);
  } catch (error) {
    console.error("PUT /api/branches error:", error);
    return NextResponse.json({ error: "Failed to update branch" }, { status: 500 });
  }
}

// DELETE - Soft delete: sets deletedAt instead of removing the row.
// Recoverable for 10 days via PUT with { restore: true }; a separate cleanup
// job (or the archive page load) can purge rows older than that window.
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Branch ID is required" }, { status: 400 });
    }

    const branch = await prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, branch });
  } catch (error) {
    console.error("DELETE /api/branches error:", error);
    return NextResponse.json({ error: "Failed to delete branch" }, { status: 500 });
  }
}