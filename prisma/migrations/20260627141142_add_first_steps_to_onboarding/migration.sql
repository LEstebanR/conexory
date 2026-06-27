-- Persist the "Primeros pasos" stepper progress (create / share) so deleting
-- properties never re-shows the stepper.
ALTER TABLE "users" ALTER COLUMN "onboarding" SET DEFAULT '{"welcomeModalSeen": false, "dashboardTourCompleted": false, "propertyTourCompleted": false, "settingsTourCompleted": false, "firstPropertyCreated": false, "firstPropertyShared": false}';

-- Existing accounts are already past onboarding, so mark both steps done.
UPDATE "users" SET "onboarding" = "onboarding" || '{"firstPropertyCreated": true, "firstPropertyShared": true}'::jsonb;
