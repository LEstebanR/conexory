-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "gatedCommunity" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "landArea" DOUBLE PRECISION,
ADD COLUMN     "transactionType" TEXT;
