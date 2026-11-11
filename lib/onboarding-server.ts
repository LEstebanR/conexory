import { prisma } from "@/lib/prisma"
import type { OnboardingFlag } from "@/lib/onboarding"

// Atomic JSONB merge so concurrent flag writes (e.g. closing the welcome modal
// while the dashboard tour finishes) never clobber each other — each UPDATE
// re-reads the current value under the row lock instead of read-modify-write.
// Resolves to true only for the write that flipped the flag, so callers can
// act once on "the first time" even under concurrent requests.
export async function setOnboardingFlag(userId: string, flag: OnboardingFlag): Promise<boolean> {
  const patch = JSON.stringify({ [flag]: true })
  const updated = await prisma.$executeRaw`
    UPDATE "users"
    SET "onboarding" = "onboarding" || ${patch}::jsonb
    WHERE "id" = ${userId}
      AND COALESCE(("onboarding" ->> ${flag}::text)::boolean, false) = false
  `
  return updated > 0
}
