import { test, expect } from "@playwright/test"
import { prisma } from "@/lib/prisma"
import { startSubscription } from "@/lib/subscription"
import { registerUser, type E2EUser } from "./helpers/auth"
import { tokenizeTestCard, sendMercadoPagoWebhook } from "./helpers/mercadopago"

// Skipped (LES-264): createPreapproval() 500s against the sandbox with the
// existing test buyer (registered under a different application id than our
// sandbox app). Needs a buyer+seller pair created under the same Mercado
// Pago application ("Cuentas de prueba") before re-enabling.
test.describe.serial("suscripción Pro con Mercado Pago sandbox", () => {
  test.skip(true, "LES-264: blocked on Mercado Pago sandbox buyer/seller pairing")

  let user: E2EUser
  let preapprovalId: string

  test("tokenizar tarjeta y suscribirse activa Pro de inmediato", async ({ page }) => {
    user = await registerUser(page, { prefix: "subscribe" })

    await page.goto("/dashboard/upgrade")
    await expect(page.getByRole("heading", { name: "Pasa a Pro" })).toBeVisible()
    await page.getByRole("button", { name: /suscribirme/i }).click()
    await expect(page.getByText("Confirma tu tarjeta")).toBeVisible()

    // startSubscription doesn't depend on headers()/cookies, so it's
    // callable directly here instead of through subscribeAction.
    const cardTokenId = await tokenizeTestCard()
    const result = await startSubscription({
      userId: user.userId,
      email: user.email,
      // Must be a real HTTPS URL for Mercado Pago's validation; never
      // actually visited in this token-based (non-redirect) flow.
      backUrl: "https://conexory.com/dashboard?upgrade=processing",
      cardTokenId,
    })
    expect(result.ok).toBe(true)

    const subscription = await prisma.subscription.findUniqueOrThrow({
      where: { userId: user.userId },
      select: { status: true, mpPreapprovalId: true },
    })
    expect(subscription.status).toBe("active")
    expect(subscription.mpPreapprovalId).toBeTruthy()
    preapprovalId = subscription.mpPreapprovalId!

    const dbUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.userId },
      select: { isPremium: true },
    })
    expect(dbUser.isPremium).toBe(true)

    await page.goto("/dashboard/upgrade")
    await expect(page.getByText("Plan Pro activo")).toBeVisible()
  })

  test("cancelar pasa a canceling y el webhook firmado responde 200", async ({ page, baseURL }) => {
    await page.goto("/login")
    await page.locator("#email").fill(user.email)
    await page.locator("#password").fill(user.password)
    await page.getByRole("button", { name: "Iniciar sesión" }).click()
    await page.waitForURL("**/dashboard")

    await page.goto("/dashboard/upgrade/cancel")
    await page.getByRole("button", { name: "Sí, cancelar mi suscripción" }).click()
    await page.waitForURL("**/dashboard/upgrade")

    const canceled = await prisma.subscription.findUniqueOrThrow({
      where: { userId: user.userId },
      select: { status: true },
    })
    expect(canceled.status).toBe("canceling")

    // Simulates the async notification Mercado Pago would send after the
    // cancellation above, with a genuine HMAC signature.
    const res = await sendMercadoPagoWebhook(baseURL!, {
      type: "subscription_preapproval",
      dataId: preapprovalId,
    })
    expect(res.status).toBe(200)
  })
})
