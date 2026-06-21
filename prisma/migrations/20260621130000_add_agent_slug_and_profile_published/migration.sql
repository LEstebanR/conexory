-- AlterTable
ALTER TABLE "users" ADD COLUMN "agentSlug" TEXT,
ADD COLUMN "profilePublished" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "users_agentSlug_key" ON "users"("agentSlug");
