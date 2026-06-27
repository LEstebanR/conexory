-- Replace the flat onboardingCompleted flag with a structured onboarding state.
ALTER TABLE "users" ADD COLUMN "onboarding" JSONB NOT NULL DEFAULT '{"step": 1, "welcomeModalSeen": false}';

-- Existing accounts have already used the product, so mark them as fully onboarded
-- (past the last step + welcome modal seen) to keep the modal and stepper hidden.
UPDATE "users" SET "onboarding" = '{"step": 3, "welcomeModalSeen": true}';

ALTER TABLE "users" DROP COLUMN "onboardingCompleted";
