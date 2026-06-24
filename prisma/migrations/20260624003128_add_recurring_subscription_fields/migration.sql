-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "lastChargeAt" TIMESTAMP(3),
ADD COLUMN     "pastDueSince" TIMESTAMP(3),
ADD COLUMN     "renewalReminderSentAt" TIMESTAMP(3),
ADD COLUMN     "wompiPaymentSourceId" INTEGER;
