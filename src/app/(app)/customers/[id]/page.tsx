/**
 * Seeds the database with mock data
 * Run with: npm run db:seed
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seeding...");

  // Clean up existing data
  console.log("🧹 Cleaning up existing data...");
  
  await prisma.followUp.deleteMany({});
  await prisma.receipt.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.auction.deleteMany({});
  await prisma.chitMember.deleteMany({});
  await prisma.chitGroup.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.branch.deleteMany({});

  console.log("✅ Cleanup complete");

  // 1. Create Branches
  console.log("🏢 Creating branches...");
  
  const branch1 = await prisma.branch.create({
    data: {
      id: "br-001",
      code: "BR001",
      location: "Chennai Main",
      address: "123 Anna Salai, Chennai - 600001",
      phone: "9876543210",
      status: "active",
    },
  });

  const branch2 = await prisma.branch.create({
    data: {
      id: "br-002",
      code: "BR002",
      location: "Coimbatore",
      address: "456 Race Course Road, Coimbatore - 641018",
      phone: "9876543211",
      status: "active",
    },
  });

  console.log(`✅ Created ${2} branches`);

  // 2. Create Employees
  console.log("👨‍💼 Creating employees...");

  const emp1 = await prisma.employee.create({
    data: {
      id: "emp-001",
      employeeCode: "EMP001",
      name: "Ramesh Kumar",
      phone: "9876543212",
      email: "ramesh@shreevaari.com",
      role: "collection_employee",
      branchId: branch1.id,
      joiningDate: new Date("2024-01-01"),
      status: "active",
      collectionTarget: 100000,
      collectionAchieved: 0,
      isLoggedIn: false,
    },
  });

  const emp2 = await prisma.employee.create({
    data: {
      id: "emp-002",
      employeeCode: "EMP002",
      name: "Suresh Kumar",
      phone: "9876543213",
      email: "suresh@shreevaari.com",
      role: "collection_employee",
      branchId: branch1.id,
      joiningDate: new Date("2024-01-15"),
      status: "active",
      collectionTarget: 80000,
      collectionAchieved: 0,
      isLoggedIn: false,
    },
  });

  const emp3 = await prisma.employee.create({
    data: {
      id: "emp-003",
      employeeCode: "EMP003",
      name: "Priya Rajan",
      phone: "9876543214",
      email: "priya@shreevaari.com",
      role: "branch_admin",
      branchId: branch2.id,
      joiningDate: new Date("2024-02-01"),
      status: "active",
      collectionTarget: 0,
      collectionAchieved: 0,
      isLoggedIn: false,
    },
  });

  console.log(`✅ Created ${3} employees`);

  // 3. Create Users
  console.log("👤 Creating users...");

  await prisma.user.create({
    data: {
      id: "user-001",
      name: "Admin User",
      email: "admin@shreevaari.com",
      password: "$2a$10$hashedpassword123", // In real app, use bcrypt
      role: "admin",
      branchId: branch1.id,
    },
  });

  await prisma.user.create({
    data: {
      id: "user-002",
      name: "Ramesh Kumar",
      email: "ramesh@shreevaari.com",
      password: "$2a$10$hashedpassword123",
      role: "collection_employee",
      branchId: branch1.id,
    },
  });

  console.log(`✅ Created ${2} users`);

  // 4. Create Customers
  console.log("👤 Creating customers...");

  const cust1 = await prisma.customer.create({
    data: {
      id: "cust-001",
      customerCode: "CUST001",
      name: "Mohan Raj",
      phone: "9876543215",
      alternatePhone: "9876543216",
      address: "789 Gandhi Street, Chennai",
      aadhaarNumber: "1234-5678-9012",
      panNumber: "ABCDE1234F",
      occupation: "Business",
      monthlyIncome: 50000,
      nomineeName: "Sita Raj",
      nomineePhone: "9876543217",
      branchId: branch1.id,
      joinedDate: new Date("2024-01-01"),
      status: "active",
      assignedEmployeeId: emp1.id,
    },
  });

  const cust2 = await prisma.customer.create({
    data: {
      id: "cust-002",
      customerCode: "CUST002",
      name: "Priya Sharma",
      phone: "9876543218",
      alternatePhone: "9876543219",
      address: "101 Nehru Street, Coimbatore",
      aadhaarNumber: "5678-9012-3456",
      panNumber: "FGHIJ5678K",
      occupation: "Teacher",
      monthlyIncome: 30000,
      nomineeName: "Rahul Sharma",
      nomineePhone: "9876543220",
      branchId: branch2.id,
      joinedDate: new Date("2024-01-15"),
      status: "active",
      assignedEmployeeId: emp3.id,
    },
  });

  const cust3 = await prisma.customer.create({
    data: {
      id: "cust-003",
      customerCode: "CUST003",
      name: "Karthik Kumar",
      phone: "9876543221",
      alternatePhone: null,
      address: "222 Market Street, Chennai",
      aadhaarNumber: "9012-3456-7890",
      panNumber: "KLMNO9012P",
      occupation: "Doctor",
      monthlyIncome: 80000,
      nomineeName: "Lakshmi Kumar",
      nomineePhone: "9876543222",
      branchId: branch1.id,
      joinedDate: new Date("2024-02-01"),
      status: "active",
      assignedEmployeeId: emp2.id,
    },
  });

  console.log(`✅ Created ${3} customers`);

  // 5. Create Chit Groups
  console.log("📊 Creating chit groups...");

  const chitGroup1 = await prisma.chitGroup.create({
    data: {
      id: "chit-001",
      name: "Silver Jubilee Chit",
      description: "Monthly chit for small business owners",
      totalAmount: 500000,
      numberOfMembers: 10,
      monthlyInstallment: 50000,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-01"),
      status: "active",
      branchId: branch1.id,
    },
  });

  const chitGroup2 = await prisma.chitGroup.create({
    data: {
      id: "chit-002",
      name: "Gold Standard Chit",
      description: "Quarterly chit for investors",
      totalAmount: 1000000,
      numberOfMembers: 20,
      monthlyInstallment: 50000,
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-12-15"),
      status: "active",
      branchId: branch2.id,
    },
  });

  console.log(`✅ Created ${2} chit groups`);

  // 6. Create Chit Members
  console.log("📝 Creating chit members...");

  await prisma.chitMember.create({
    data: {
      id: "cm-001",
      chitGroupId: chitGroup1.id,
      customerId: cust1.id,
      joinedDate: new Date("2024-01-01"),
      status: "active",
    },
  });

  await prisma.chitMember.create({
    data: {
      id: "cm-002",
      chitGroupId: chitGroup1.id,
      customerId: cust3.id,
      joinedDate: new Date("2024-02-01"),
      status: "active",
    },
  });

  await prisma.chitMember.create({
    data: {
      id: "cm-003",
      chitGroupId: chitGroup2.id,
      customerId: cust2.id,
      joinedDate: new Date("2024-01-15"),
      status: "active",
    },
  });

  console.log(`✅ Created ${3} chit members`);

  // 7. Create Payments
  console.log("💰 Creating payments...");

  const chitMember1 = await prisma.chitMember.findFirst({
    where: { customerId: cust1.id },
  });

  const chitMember2 = await prisma.chitMember.findFirst({
    where: { customerId: cust2.id },
  });

  if (chitMember1) {
    await prisma.payment.create({
      data: {
        id: "pay-001",
        chitMemberId: chitMember1.id,
        customerId: cust1.id,
        branchId: branch1.id,
        amount: 50000,
        paidDate: new Date("2024-01-01"),
        dueDate: new Date("2024-01-31"),
        status: "completed",
        paymentMode: "cash",
        referenceNo: "REC-001",
        notes: "First installment",
      },
    });
  }

  if (chitMember2) {
    await prisma.payment.create({
      data: {
        id: "pay-002",
        chitMemberId: chitMember2.id,
        customerId: cust2.id,
        branchId: branch2.id,
        amount: 50000,
        paidDate: new Date("2024-01-15"),
        dueDate: new Date("2024-02-15"),
        status: "pending",
        paymentMode: "bank_transfer",
        referenceNo: null,
        notes: "Awaiting payment",
      },
    });
  }

  console.log(`✅ Created ${2} payments`);

  // 8. Create Auctions
  console.log("🔨 Creating auctions...");

  await prisma.auction.create({
    data: {
      id: "auc-001",
      chitGroupId: chitGroup1.id,
      auctionDate: new Date("2024-01-15"),
      amount: 45000,
      status: "completed",
    },
  });

  await prisma.auction.create({
    data: {
      id: "auc-002",
      chitGroupId: chitGroup1.id,
      auctionDate: new Date("2024-02-15"),
      amount: 43000,
      status: "scheduled",
    },
  });

  console.log(`✅ Created ${2} auctions`);

  // 9. Create Follow-ups
  console.log("📞 Creating follow-ups...");

  await prisma.followUp.create({
    data: {
      id: "fu-001",
      customerId: cust2.id,
      employeeId: emp3.id,
      followUpDate: new Date("2024-02-01"),
      notes: "Customer needs to be reminded about payment",
      status: "pending",
    },
  });

  await prisma.followUp.create({
    data: {
      id: "fu-002",
      customerId: cust1.id,
      employeeId: emp1.id,
      followUpDate: new Date("2024-02-05"),
      notes: "Follow up on new chit offer",
      status: "completed",
    },
  });

  console.log(`✅ Created ${2} follow-ups`);

  // Final counts
  const counts = {
    branches: await prisma.branch.count(),
    users: await prisma.user.count(),
    employees: await prisma.employee.count(),
    customers: await prisma.customer.count(),
    chitGroups: await prisma.chitGroup.count(),
    chitMembers: await prisma.chitMember.count(),
    payments: await prisma.payment.count(),
    auctions: await prisma.auction.count(),
    followUps: await prisma.followUp.count(),
  };

  console.log("\n📊 Final Counts:", counts);
  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());