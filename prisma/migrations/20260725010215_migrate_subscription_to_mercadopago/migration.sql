-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "wompiSubId",
DROP COLUMN "wompiReference",
DROP COLUMN "wompiPaymentSourceId",
DROP COLUMN "wompiPaymentSourceType",
ADD COLUMN     "mpPreapprovalId" TEXT,
ADD COLUMN     "mpPayerId" TEXT;
