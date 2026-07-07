import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// GET - Fetch all employees
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        branch: true,
        assignedCustomers: true,
        attendance: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error('GET /api/employees error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

// POST - Add a new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.phone || !body.branchId || !body.email) {
      return NextResponse.json(
        { error: 'Name, phone, email, and branch are required' },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        employeeCode: body.employeeCode || `EMP-${Date.now()}`,
        name: body.name,
        phone: body.phone,
        email: body.email,
        role: body.role || 'collection_employee',
        branchId: body.branchId,
        joiningDate: body.joiningDate ? new Date(body.joiningDate) : new Date(),
        salary: body.salary || 0,
        status: body.status || 'active',
        collectionTarget: body.collectionTarget || 0,
        collectionAchieved: body.collectionAchieved || 0,
        isLoggedIn: false,
      },
      include: {
        branch: true,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('POST /api/employees error:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}