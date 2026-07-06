-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('salary', 'rent', 'utilities', 'commission', 'marketing', 'travel', 'office_supplies', 'maintenance', 'legal_compliance', 'miscellaneous');

-- AlterTable
ALTER TABLE "chit_members" ADD COLUMN     "entry_period" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "expense_code" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "date" DATE NOT NULL,
    "paid_to" TEXT NOT NULL,
    "payment_mode" "PaymentMode" NOT NULL,
    "recorded_by" TEXT NOT NULL,
    "bill_number" TEXT,
    "remarks" TEXT,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chit_plans" (
    "id" TEXT NOT NULL,
    "chit_value" DECIMAL(14,2) NOT NULL,
    "frequency" "CollectionFrequency" NOT NULL,
    "periods" INTEGER NOT NULL,
    "duration_label" TEXT NOT NULL,
    "members" INTEGER,
    "total_payable" DECIMAL(14,2) NOT NULL,
    "daily_approx" DECIMAL(10,2),
    "weekly_approx" DECIMAL(10,2),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "schedule" JSONB NOT NULL,

    CONSTRAINT "chit_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expenses_expense_code_key" ON "expenses"("expense_code");

-- CreateIndex
CREATE INDEX "expenses_branch_id_date_idx" ON "expenses"("branch_id", "date");

-- CreateIndex
CREATE INDEX "expenses_category_idx" ON "expenses"("category");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
