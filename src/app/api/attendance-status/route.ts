import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch daily attendance status records, optionally filtered.
// Supports ?date=YYYY-MM-DD, ?branchId=..., ?employeeId=... (any combination).
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get("date");
        const branchId = searchParams.get("branchId");
        const employeeId = searchParams.get("employeeId");

        const where: Record<string, unknown> = {};
        if (date) where.date = new Date(date);
        if (branchId) where.branchId = branchId;
        if (employeeId) where.employeeId = employeeId;

        const records = await prisma.attendance.findMany({
            where,
            orderBy: { date: "desc" },
            take: 1000,
        });

        return NextResponse.json(records);
    } catch (error) {
        console.error("GET /api/attendance-status error:", error);
        return NextResponse.json({ error: "Failed to fetch attendance status" }, { status: 500 });
    }
}

// POST - Mark/update attendance for one employee on one date (upsert).
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.employeeId || !body.branchId || !body.date || !body.status) {
            return NextResponse.json({ error: "employeeId, branchId, date, and status are required" }, { status: 400 });
        }

        const date = new Date(body.date);

        const record = await prisma.attendance.upsert({
            where: {
                employeeId_date: {
                    employeeId: body.employeeId,
                    date,
                },
            },
            update: {
                status: body.status,
                checkIn: body.checkIn ?? null,
                checkOut: body.checkOut ?? null,
                remarks: body.remarks ?? null,
            },
            create: {
                employeeId: body.employeeId,
                branchId: body.branchId,
                date,
                status: body.status,
                checkIn: body.checkIn ?? null,
                checkOut: body.checkOut ?? null,
                remarks: body.remarks ?? null,
            },
        });

        return NextResponse.json(record);
    } catch (error) {
        console.error("POST /api/attendance-status error:", error);
        return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
    }
}