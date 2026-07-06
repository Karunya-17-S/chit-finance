-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'customer';

-- AlterTable: passbook number (unique) on customers
ALTER TABLE "customers" ADD COLUMN "passbook_number" TEXT NOT NULL;

-- AlterTable: optional chit plan link on chit_groups
ALTER TABLE "chit_groups" ADD COLUMN "chit_plan_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "customers_passbook_number_key" ON "customers"("passbook_number");

-- AddForeignKey
ALTER TABLE "chit_groups" ADD CONSTRAINT "chit_groups_chit_plan_id_fkey" FOREIGN KEY ("chit_plan_id") REFERENCES "chit_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
