-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "showContact" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "phoneIsWhatsapp" BOOLEAN NOT NULL DEFAULT false;
