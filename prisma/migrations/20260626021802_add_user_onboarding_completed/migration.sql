-- AlterTable
ALTER TABLE "users" ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- Existing accounts have already used the product, so mark them as onboarded
-- to keep the welcome banner and guided tour from showing up for them.
UPDATE "users" SET "onboardingCompleted" = true;
