import type { Page } from "@playwright/test"
import { prisma } from "@/lib/prisma"

export interface E2EUser {
  name: string
  email: string
  password: string
  userId: string
}

const E2E_PASSWORD = "E2ETestPass123!"

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@e2e.conexory.test`
}

export async function registerUser(
  page: Page,
  { prefix, name = "E2E Test" }: { prefix: string; name?: string }
): Promise<E2EUser> {
  const email = uniqueEmail(prefix)

  await page.goto("/register")
  await page.locator("#name").fill(name)
  await page.locator("#email").fill(email)
  await page.locator("#password").fill(E2E_PASSWORD)
  await page.locator("#confirm-password").fill(E2E_PASSWORD)
  // Checkbox is sr-only; force skips the visibility check.
  await page.locator('input[name="terms"]').check({ force: true })
  await page.getByRole("button", { name: /crear cuenta gratis/i }).click()

  await page.waitForURL("**/dashboard")

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
    select: { id: true },
  })

  // No inbox to click a real verification link from — flip the same DB
  // field it would set (app/dashboard/verify-email-gate.tsx).
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      onboarding: {
        welcomeModalSeen: true,
        dashboardTourCompleted: true,
        propertyTourCompleted: true,
        settingsTourCompleted: true,
        firstPropertyCreated: false,
        firstPropertyShared: false,
      },
    },
  })
  await page.reload()

  await page.waitForLoadState("networkidle")

  return { name, email, password: E2E_PASSWORD, userId: user.id }
}
