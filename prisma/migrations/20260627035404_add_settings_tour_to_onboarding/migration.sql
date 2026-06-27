-- Add the settingsTourCompleted flag to the onboarding state default.
ALTER TABLE "users" ALTER COLUMN "onboarding" SET DEFAULT '{"step": 1, "welcomeModalSeen": false, "dashboardTourCompleted": false, "propertyTourCompleted": false, "settingsTourCompleted": false}';

-- Existing accounts are already past onboarding, so they must not see the settings tour.
UPDATE "users" SET "onboarding" = "onboarding" || '{"settingsTourCompleted": true}'::jsonb;
