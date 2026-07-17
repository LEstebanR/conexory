-- AlterTable
ALTER TABLE "users" ADD COLUMN "aiMessagesUsedToday" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "aiMessagesResetAt" TIMESTAMP(3);
