-- Data migration: partner/founder accounts were flagged isPremium manually
-- (no real Wompi subscription yet) and never got a premiumUntil date. Give
-- them a far-future date so they read as "Pro" with an expiry in the admin
-- panel and are never auto-downgraded by the billing cron's expireManualPro.
UPDATE "users"
SET "premiumUntil" = '2099-12-31 00:00:00'
WHERE "isPremium" = true AND "premiumUntil" IS NULL;
