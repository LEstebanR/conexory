import { test, expect, type Page } from "@playwright/test"
import { prisma } from "@/lib/prisma"
import { registerUser, type E2EUser } from "./helpers/auth"
import {
  devServerUsesFakeMercadoPago,
  fakeMercadoPago,
  sendMercadoPagoWebhook,
  setCardToken,
  stubMercadoPagoSdk,
} from "./helpers/mercadopago"

// Mercado Pago is stubbed here, so this does NOT exercise the real contract
// with their API — only our side of it (UI, server actions, DB, signed
// webhooks). The server talks to e2e/fake-mercadopago/server.ts via
// MERCADOPAGO_API_BASE and the browser gets a fake cardForm.
//
// Why not their sandbox (LES-264, #133): POST /preapproval with a
// card_token_id 404s there with "Card token service not found". Ruled out:
// buyer/seller test-user pairing, fresh test users under the same app, every
// current test card (including the Suscripciones docs' ones), tokenizing with
// the public key and with the access token. /v1/card_tokens itself works
// (201); only the tokenized (non-redirect) preapproval fails, and the same
// flow works in production.
//
// The fake's response shapes encode lib/mercadopago.ts's own assumptions
// about Mercado Pago's payloads, so a drift on their side won't show here.

let fakeWired: boolean | undefined

test.beforeEach(async ({ baseURL }) => {
  fakeWired ??= await devServerUsesFakeMercadoPago(baseURL!)
  // In CI Playwright always starts the dev server wired to the fake, so a
  // miss there must fail loudly instead of skipping.
  test.skip(
    !process.env.CI && !fakeWired,
    "The reused dev server isn't wired to the fake Mercado Pago: start it with `bun run dev:e2e`, or stop it so Playwright starts one."
  )
})

const VISA = { brand: "visa", lastFour: "4242" }
const MASTERCARD = { brand: "master", lastFour: "5555" }

async function submitCard(page: Page, card: { brand: string; lastFour: string }, submit: RegExp) {
  await setCardToken(page, card)
  const button = page.getByRole("button", { name: submit })
  await expect(button).toBeEnabled()
  await button.click()
}

async function subscribeThroughUi(page: Page, card = VISA) {
  await stubMercadoPagoSdk(page)
  await page.goto("/dashboard/upgrade")
  await page.getByRole("button", { name: /suscribirme/i }).click()
  await expect(page.getByText("Confirma tu tarjeta")).toBeVisible()
  await submitCard(page, card, /^confirmar/i)
}

async function subscribedUser(page: Page, prefix: string): Promise<E2EUser & { preapprovalId: string }> {
  const user = await registerUser(page, { prefix })
  await subscribeThroughUi(page)
  await page.waitForURL(/\/dashboard\?upgrade=processing/)
  const { mpPreapprovalId } = await prisma.subscription.findUniqueOrThrow({
    where: { userId: user.userId },
    select: { mpPreapprovalId: true },
  })
  return { ...user, preapprovalId: mpPreapprovalId! }
}

function subscriptionOf(userId: string) {
  return prisma.subscription.findUniqueOrThrow({ where: { userId } })
}

test("suscribirse con tarjeta activa Pro de inmediato", async ({ page }) => {
  const user = await registerUser(page, { prefix: "subscribe" })

  await subscribeThroughUi(page, VISA)
  await page.waitForURL(/\/dashboard\?upgrade=processing/)

  const subscription = await subscriptionOf(user.userId)
  expect(subscription.status).toBe("active")
  expect(subscription.mpPreapprovalId).toBeTruthy()
  expect(subscription.cardBrand).toBe("visa")
  expect(subscription.cardLastFour).toBe("4242")
  expect(subscription.lastChargeAt).toBeNull()

  const { isPremium } = await prisma.user.findUniqueOrThrow({ where: { id: user.userId } })
  expect(isPremium).toBe(true)

  await page.goto("/dashboard/upgrade")
  await expect(page.getByRole("heading", { name: "Plan Pro activo" })).toBeVisible()
  await expect(page.getByText("···· 4242")).toBeVisible()
})

test("si Mercado Pago rechaza la suscripción, el usuario sigue en Free", async ({ page }) => {
  const user = await registerUser(page, { prefix: "subscribe-fail" })
  await fakeMercadoPago.failPreapprovalFor(user.email)

  await subscribeThroughUi(page)

  await expect(page.getByText("No pudimos iniciar la suscripción con Mercado Pago.")).toBeVisible()
  expect(await prisma.subscription.findUnique({ where: { userId: user.userId } })).toBeNull()
  const { isPremium } = await prisma.user.findUniqueOrThrow({ where: { id: user.userId } })
  expect(isPremium).toBe(false)
})

test("el webhook del primer cobro aprobado lo registra", async ({ page, baseURL }) => {
  const user = await subscribedUser(page, "first-charge")
  const payment = await fakeMercadoPago.createPayment(user.preapprovalId, "approved")

  const res = await sendMercadoPagoWebhook(baseURL!, { type: "payment", dataId: payment.id })
  expect(res.status).toBe(200)

  const subscription = await subscriptionOf(user.userId)
  expect(subscription.status).toBe("active")
  expect(subscription.lastChargeAt).not.toBeNull()

  const event = await prisma.paymentEvent.findUniqueOrThrow({
    where: { externalId: `payment-${payment.id}-approved` },
  })
  expect(event.userId).toBe(user.userId)
})

test("cambiar la tarjeta actualiza marca y últimos dígitos", async ({ page }) => {
  const user = await subscribedUser(page, "change-card")

  await page.goto("/dashboard/upgrade")
  await page.getByRole("button", { name: "Cambiar tarjeta" }).click()
  await expect(page.getByText("Nueva tarjeta")).toBeVisible()
  await submitCard(page, MASTERCARD, /^guardar tarjeta/i)

  await expect(page.getByText("Tarjeta actualizada")).toBeVisible()
  await expect(page.getByText("···· 5555")).toBeVisible()

  const subscription = await subscriptionOf(user.userId)
  expect(subscription.cardBrand).toBe("master")
  expect(subscription.cardLastFour).toBe("5555")
  expect(subscription.mpPreapprovalId).toBe(user.preapprovalId)
})

test("cancelar desde la app corta el cobro en Mercado Pago y mantiene Pro hasta fin de período", async ({
  page,
  baseURL,
}) => {
  const user = await subscribedUser(page, "cancel")

  await page.goto("/dashboard/upgrade/cancel")
  await page.getByRole("button", { name: "Sí, cancelar mi suscripción" }).click()
  await page.waitForURL(/\/dashboard\/upgrade$/)
  await expect(page.getByRole("heading", { name: "Suscripción cancelada" })).toBeVisible()

  expect((await subscriptionOf(user.userId)).status).toBe("canceling")
  expect((await fakeMercadoPago.getPreapproval(user.preapprovalId))?.status).toBe("cancelled")
  const { isPremium } = await prisma.user.findUniqueOrThrow({ where: { id: user.userId } })
  expect(isPremium).toBe(true)

  // Mercado Pago's follow-up notification for the cancellation above.
  const res = await sendMercadoPagoWebhook(baseURL!, {
    type: "subscription_preapproval",
    dataId: user.preapprovalId,
  })
  expect(res.status).toBe(200)
  expect((await subscriptionOf(user.userId)).status).toBe("canceling")
})

test("cancelar desde Mercado Pago llega por webhook y deja la suscripción cancelándose", async ({
  page,
  baseURL,
}) => {
  const user = await subscribedUser(page, "cancel-mp")
  await fakeMercadoPago.setPreapprovalStatus(user.preapprovalId, "cancelled")

  const res = await sendMercadoPagoWebhook(baseURL!, {
    type: "subscription_preapproval",
    dataId: user.preapprovalId,
  })
  expect(res.status).toBe(200)
  expect((await subscriptionOf(user.userId)).status).toBe("canceling")

  await page.goto("/dashboard/upgrade")
  await expect(page.getByRole("heading", { name: "Suscripción cancelada" })).toBeVisible()
})
