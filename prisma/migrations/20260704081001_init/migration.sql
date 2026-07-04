-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('main_admin', 'branch_admin', 'collection_employee', 'accountant', 'viewer');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('branch_admin', 'collection_employee', 'accountant', 'viewer');

-- CreateEnum
CREATE TYPE "ChitGroupStatus" AS ENUM ('active', 'completed', 'pending');

-- CreateEnum
CREATE TYPE "CollectionFrequency" AS ENUM ('daily', 'weekly', 'monthly');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('cash', 'upi', 'bank_transfer', 'cheque');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('paid', 'partial', 'pending', 'overdue');

-- CreateEnum
CREATE TYPE "PaymentCategory" AS ENUM ('installment', 'deposit');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('scheduled', 'completed');

-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('payment_reminder', 'due_reminder', 'overdue_warning', 'receipt_message', 'auction_notification', 'new_group_invite', 'festival_greeting', 'branch_announcement');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('new', 'follow_up', 'promise_to_pay', 'paid', 'overdue', 'risk');

-- CreateEnum
CREATE TYPE "LocationStatus" AS ENUM ('checked_in', 'moving', 'collecting', 'idle');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "branch_id" TEXT,
    "avatar_url" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "manager_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "opening_date" DATE NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "employee_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "role" "EmployeeRole" NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "joining_date" DATE NOT NULL,
    "salary" DECIMAL(12,2) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "collection_target" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "collection_achieved" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "avatar_url" TEXT,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "customer_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "alternate_phone" TEXT,
    "address" TEXT NOT NULL,
    "aadhaar_number" TEXT NOT NULL,
    "pan_number" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "monthly_income" DECIMAL(12,2) NOT NULL,
    "nominee_name" TEXT NOT NULL,
    "nominee_phone" TEXT NOT NULL,
    "joined_date" DATE NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "assigned_employee_id" TEXT,
    "avatar_url" TEXT,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chit_groups" (
    "id" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "group_code" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "chit_value" DECIMAL(14,2) NOT NULL,
    "installment_amount" DECIMAL(12,2) NOT NULL,
    "collection_frequency" "CollectionFrequency" NOT NULL DEFAULT 'monthly',
    "duration_months" INTEGER NOT NULL,
    "total_members" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "auction_date" DATE NOT NULL,
    "status" "ChitGroupStatus" NOT NULL DEFAULT 'pending',
    "commission_percentage" DECIMAL(5,2) NOT NULL,
    "foreman_commission" DECIMAL(12,2) NOT NULL,
    "collection_employee_id" TEXT,

    CONSTRAINT "chit_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chit_members" (
    "id" TEXT NOT NULL,
    "chit_group_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "agreement_no" TEXT NOT NULL,
    "joined_date" DATE NOT NULL,
    "has_won" BOOLEAN NOT NULL DEFAULT false,
    "won_month" INTEGER,
    "won_amount" DECIMAL(14,2),
    "status" "Status" NOT NULL DEFAULT 'active',

    CONSTRAINT "chit_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "payment_code" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "chit_group_id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "due_amount" DECIMAL(12,2) NOT NULL,
    "paid_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "payment_date" DATE,
    "payment_mode" "PaymentMode",
    "payment_category" "PaymentCategory" NOT NULL DEFAULT 'installment',
    "receipt_number" TEXT,
    "bill_number" TEXT,
    "collected_by" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "remarks" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auctions" (
    "id" TEXT NOT NULL,
    "chit_group_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "auction_date" DATE NOT NULL,
    "winner_customer_id" TEXT,
    "bid_amount" DECIMAL(14,2) NOT NULL,
    "discount_amount" DECIMAL(14,2) NOT NULL,
    "dividend_per_member" DECIMAL(12,2) NOT NULL,
    "status" "AuctionStatus" NOT NULL DEFAULT 'scheduled',

    CONSTRAINT "auctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" TEXT NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "date" DATE NOT NULL,
    "mode" "PaymentMode" NOT NULL,
    "issued_by" TEXT NOT NULL,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TemplateType" NOT NULL,
    "content" TEXT NOT NULL,
    "variables" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_ups" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'new',
    "last_contacted_date" DATE,
    "next_follow_up_date" DATE,
    "promise_to_pay_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_pings" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" "LocationStatus" NOT NULL,

    CONSTRAINT "location_pings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "branches_code_key" ON "branches"("code");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_code_key" ON "employees"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_branch_id_idx" ON "employees"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_customer_code_key" ON "customers"("customer_code");

-- CreateIndex
CREATE INDEX "customers_branch_id_idx" ON "customers"("branch_id");

-- CreateIndex
CREATE INDEX "customers_assigned_employee_id_idx" ON "customers"("assigned_employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "chit_groups_group_code_key" ON "chit_groups"("group_code");

-- CreateIndex
CREATE INDEX "chit_groups_branch_id_idx" ON "chit_groups"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "chit_members_chit_group_id_customer_id_key" ON "chit_members"("chit_group_id", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "chit_members_chit_group_id_agreement_no_key" ON "chit_members"("chit_group_id", "agreement_no");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_code_key" ON "payments"("payment_code");

-- CreateIndex
CREATE INDEX "payments_branch_id_month_idx" ON "payments"("branch_id", "month");

-- CreateIndex
CREATE INDEX "payments_customer_id_idx" ON "payments"("customer_id");

-- CreateIndex
CREATE INDEX "payments_chit_group_id_idx" ON "payments"("chit_group_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "auctions_chit_group_id_month_key" ON "auctions"("chit_group_id", "month");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_receipt_number_key" ON "receipts"("receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_payment_id_key" ON "receipts"("payment_id");

-- CreateIndex
CREATE INDEX "follow_ups_branch_id_status_idx" ON "follow_ups"("branch_id", "status");

-- CreateIndex
CREATE INDEX "location_pings_employee_id_timestamp_idx" ON "location_pings"("employee_id", "timestamp");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_assigned_employee_id_fkey" FOREIGN KEY ("assigned_employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chit_groups" ADD CONSTRAINT "chit_groups_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chit_groups" ADD CONSTRAINT "chit_groups_collection_employee_id_fkey" FOREIGN KEY ("collection_employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chit_members" ADD CONSTRAINT "chit_members_chit_group_id_fkey" FOREIGN KEY ("chit_group_id") REFERENCES "chit_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chit_members" ADD CONSTRAINT "chit_members_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_chit_group_id_fkey" FOREIGN KEY ("chit_group_id") REFERENCES "chit_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_collected_by_fkey" FOREIGN KEY ("collected_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_chit_group_id_fkey" FOREIGN KEY ("chit_group_id") REFERENCES "chit_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_winner_customer_id_fkey" FOREIGN KEY ("winner_customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_pings" ADD CONSTRAINT "location_pings_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_pings" ADD CONSTRAINT "location_pings_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
