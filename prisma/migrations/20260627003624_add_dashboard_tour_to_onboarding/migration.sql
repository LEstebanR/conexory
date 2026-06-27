-- Add the dashboardTourCompleted flag to the onboarding state default.
ALTER TABLE "users" ALTER COLUMN "onboarding" SET DEFAULT '{"step": 1, "welcomeModalSeen": false, "dashboardTourCompleted": false}';

-- Existing accounts are already past onboarding, so they must not see the dashboard tour.
UPDATE "users" SET "onboarding" = "onboarding" || '{"dashboardTourCompleted": true}'::jsonb;
