-- AlterTable
ALTER TABLE "users" ALTER COLUMN "onboarding" SET DEFAULT '{"welcomeModalSeen": false, "dashboardTourCompleted": false, "firstPropertyCreated": false, "firstPropertyShared": false}';


-- Drop the flags of the removed property and settings tours from existing rows.
UPDATE "users" SET "onboarding" = "onboarding" - 'propertyTourCompleted' - 'settingsTourCompleted';
