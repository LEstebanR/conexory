import crypto from "crypto"
import type { Page } from "@playwright/test"
import { FAKE_MP_ENV, FAKE_MP_URL } from "../fake-mercadopago/config"

// Replaces https://sdk.mercadopago.com/js/v2 in the browser. The real cardForm
// mounts Mercado Pago iframes and tokenizes against their API; this one mounts
// nothing and hands back the token the spec chose ("e2e-{brand}-{last4}"),
// which the fake server (e2e/fake-mercadopago/server.ts) understands.
const FAKE_SDK = `
window.MercadoPago = class {
  cardForm({ form, callbacks }) {
    const el = document.getElementById(form.id)
    const onSubmit = (event) => callbacks.onSubmit(event)
    el.addEventListener("submit", onSubmit)
    setTimeout(() => callbacks.onFormMounted())
    return {
      getCardFormData: () => ({ token: window.__E2E_CARD_TOKEN__ }),
      unmount: () => el.removeEventListener("submit", onSubmit),
    }
  }
}
`

export async function stubMercadoPagoSdk(page: Page) {
  await page.route(/^https:\/\/sdk\.mercadopago\.com\/js\/v2/, (route) =>
    route.fulfill({ contentType: "application/javascript", body: FAKE_SDK })
  )
}

export async function setCardToken(page: Page, card: { brand: string; lastFour: string }) {
  await page.evaluate((token) => {
    ;(window as unknown as { __E2E_CARD_TOKEN__: string }).__E2E_CARD_TOKEN__ = token
  }, `e2e-${card.brand}-${card.lastFour}`)
}

async function control<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${FAKE_MP_URL}/__control/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`fake Mercado Pago ${path} failed: ${res.status}`)
  return (await res.json()) as T
}

async function preapproval(id: string, update?: { status: string }) {
  const res = await fetch(`${FAKE_MP_URL}/preapproval/${id}`, {
    method: update ? "PUT" : "GET",
    headers: { "Content-Type": "application/json" },
    body: update ? JSON.stringify(update) : undefined,
  })
  if (!res.ok) throw new Error(`fake Mercado Pago preapproval ${id} failed: ${res.status}`)
  return (await res.json()) as { id: string; status: string }
}

export const fakeMercadoPago = {
  failPreapprovalFor: (payerEmail: string) => control("fail-preapproval", { payerEmail }),
  createPayment: (preapprovalId: string, status: string) =>
    control<{ id: string }>("payments", { preapprovalId, status }),
  setPreapprovalStatus: (preapprovalId: string, status: string) => preapproval(preapprovalId, { status }),
  getPreapproval: (preapprovalId: string) => preapproval(preapprovalId),
  requests: () => control<string[]>("requests"),
}

// Mirrors verifyMercadoPagoWebhook() in lib/mercadopago.ts.
function signWebhook(dataId: string, requestId: string) {
  const ts = Math.floor(Date.now() / 1000).toString()
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`
  const v1 = crypto
    .createHmac("sha256", FAKE_MP_ENV.MERCADOPAGO_WEBHOOK_SECRET)
    .update(manifest)
    .digest("hex")
  return `ts=${ts},v1=${v1}`
}

export async function sendMercadoPagoWebhook(
  baseURL: string,
  { type, dataId }: { type: "payment" | "subscription_preapproval"; dataId: string }
): Promise<Response> {
  const requestId = `e2e-${Date.now()}`
  return fetch(`${baseURL}/api/webhooks/mercadopago`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-signature": signWebhook(dataId, requestId),
      "x-request-id": requestId,
    },
    body: JSON.stringify({ type, data: { id: dataId } }),
  })
}

// A dev server reused locally (playwright.config.ts) may have been started
// without FAKE_MP_ENV, so its Mercado Pago calls would go to the real API. A
// signed probe proves both halves: the server accepts our webhook secret
// (else 401) and looks the preapproval up on the fake (else it never shows
// up in the fake's request log).
export async function devServerUsesFakeMercadoPago(baseURL: string): Promise<boolean> {
  const probeId = `e2eprobe${Date.now()}`
  const res = await sendMercadoPagoWebhook(baseURL, { type: "subscription_preapproval", dataId: probeId })
  if (res.status !== 200) return false
  const requests = await fakeMercadoPago.requests().catch((): string[] => [])
  return requests.includes(`GET /preapproval/${probeId}`)
}
