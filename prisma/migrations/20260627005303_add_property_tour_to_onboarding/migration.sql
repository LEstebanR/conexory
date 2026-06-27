-- Add the propertyTourCompleted flag to the onboarding state default.
ALTER TABLE "users" ALTER COLUMN "onboarding" SET DEFAULT '{"step": 1, "welcomeModalSeen": false, "dashboardTourCompleted": false, "propertyTourCompleted": false}';

-- Existing accounts are already past onboarding, so they must not see the property form tour.
UPDATE "users" SET "onboarding" = "onboarding" || '{"propertyTourCompleted": true}'::jsonb;
