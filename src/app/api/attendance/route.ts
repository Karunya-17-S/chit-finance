import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// GET - Fetch attendance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    
    const where = employeeId ? { employeeId } : {};
    
    const attendance = await prisma.employeeAttendance.findMany({
      where,
      include: {
        employee: true,
        branch: true,
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
    
    return NextResponse.json(attendance);
  } catch (error) {
    console.error('GET /api/attendance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

// POST - Create attendance record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.employeeId || !body.type) {
      return NextResponse.json(
        { error: 'Employee ID and type are required' },
        { status: 400 }
      );
    }

    const attendance = await prisma.employeeAttendance.create({
      data: {
        employeeId: body.employeeId,
        branchId: body.branchId,
        type: body.type,
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
        date: body.date ? new Date(body.date) : new Date(),
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('POST /api/attendance error:', error);
    return NextResponse.json(
      { error: 'Failed to create attendance record' },
      { status: 500 }
    );
  }
}