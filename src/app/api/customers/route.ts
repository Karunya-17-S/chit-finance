import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch all customers
export async function GET() {
    try {
        const customers = await prisma.customer.findMany({
            include: {
                branch: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return NextResponse.json(customers);
    } catch (error) {
        console.error("GET /api/customers error:", error);
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
    }
}

// POST - Add a new customer
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name || !body.phone || !body.branchId) {
            return NextResponse.json({ error: "Name, phone, and branch are required" }, { status: 400 });
        }

        const seq = Date.now();
        const customer = await prisma.customer.create({
            data: {
                customerCode: body.customerCode || `CUST-${seq}`,
                // Required + unique in the schema — customer self-login depends on this existing.
                passbookNumber: body.passbookNumber?.trim() || `SVCF-PB-${seq}`,
                name: body.name,
                phone: body.phone,
                alternatePhone: body.alternatePhone,
                address: body.address,
                aadhaarNumber: body.aadhaarNumber,
                panNumber: body.panNumber,
                occupation: body.occupation,
                monthlyIncome: body.monthlyIncome,
                nomineeName: body.nomineeName,
                nomineePhone: body.nomineePhone,
                joinedDate: body.joinedDate ? new Date(body.joinedDate) : new Date(),
                branchId: body.branchId,
                assignedEmployeeId: body.assignedEmployeeId || null,
                status: body.status || "active",
                avatarUrl: body.avatarUrl || null,
            },
        });

        return NextResponse.json(customer);
    } catch (error) {
        console.error("POST /api/customers error:", error);
        return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
    }
}

// PUT - Update a customer
export async function PUT(request: NextRequest) {
    try {
        const { id, ...data } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
        }

        const customer = await prisma.customer.update({
            where: { id },
            data: {
                name: data.name,
                phone: data.phone,
                alternatePhone: data.alternatePhone,
                address: data.address,
                aadhaarNumber: data.aadhaarNumber,
                panNumber: data.panNumber,
                occupation: data.occupation,
                monthlyIncome: data.monthlyIncome,
                nomineeName: data.nomineeName,
                nomineePhone: data.nomineePhone,
                joinedDate: data.joinedDate ? new Date(data.joinedDate) : undefined,
                branchId: data.branchId,
                assignedEmployeeId: data.assignedEmployeeId,
                status: data.status,
                avatarUrl: data.avatarUrl,
                // passbookNumber intentionally not editable here — changing it would break
                // a customer's existing login credential.
            },
        });

        return NextResponse.json(customer);
    } catch (error) {
        console.error("PUT /api/customers error:", error);
        return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
    }
}

// DELETE - Delete a customer
// NOTE: this is a hard delete — will fail with a foreign-key error if the customer
// has payments, chit memberships, receipts, etc. Same soft-delete treatment we did
// for branches is worth applying here later.
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
        }

        await prisma.customer.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/customers error:", error);
        return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
    }
}