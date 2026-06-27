import { prisma } from "@/lib/prisma"
import type { OnboardingFlag } from "@/lib/onboarding"

// Atomic JSONB merge so concurrent flag writes (e.g. closing the welcome modal
// while the dashboard tour finishes) never clobber each other — each UPDATE
// re-reads the current value under the row lock instead of read-modify-write.
export async function setOnboardingFlag(userId: string, flag: OnboardingFlag): Promise<void> {
  const patch = JSON.stringify({ [flag]: true })
  await prisma.$executeRaw`
    UPDATE "users"
    SET "onboarding" = "onboarding" || ${patch}::jsonb
    WHERE "id" = ${userId}
  `
}
