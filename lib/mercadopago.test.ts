import { describe, test, expect } from "bun:test"
import crypto from "crypto"

// MERCADOPAGO_WEBHOOK_SECRET is set by test-setup.ts (bunfig.toml preload)
// before any test file — including this one — gets a chance to import the
// real module.
const { verifyMercadoPagoWebhook, makeExternalReference } = await import("./mercadopago")

function sign(dataId: string, xRequestId: string, ts: string, secret = "test_webhook_secret") {
  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`
  const v1 = crypto.createHmac("sha256", secret).update(manifest).digest("hex")
  return `ts=${ts},v1=${v1}`
}

describe("verifyMercadoPagoWebhook", () => {
  const dataId = "123456"
  const xRequestId = "req-1"
  const ts = "1700000000"

  test("accepts a signature computed with the real secret", () => {
    const xSignature = sign(dataId, xRequestId, ts)
    expect(verifyMercadoPagoWebhook({ xSignature, xRequestId, dataId })).toBe(true)
  })

  test("accepts a mixed-case dataId (lowercased before hashing)", () => {
    const xSignature = sign(dataId, xRequestId, ts)
    expect(
      verifyMercadoPagoWebhook({ xSignature, xRequestId, dataId: dataId.toUpperCase() }),
    ).toBe(true)
  })

  test("rejects a signature computed with the wrong secret", () => {
    const xSignature = sign(dataId, xRequestId, ts, "wrong_secret")
    expect(verifyMercadoPagoWebhook({ xSignature, xRequestId, dataId })).toBe(false)
  })

  test("rejects a tampered dataId (manifest no longer matches)", () => {
    const xSignature = sign(dataId, xRequestId, ts)
    expect(verifyMercadoPagoWebhook({ xSignature, xRequestId, dataId: "999999" })).toBe(false)
  })

  test("rejects when x-signature is missing", () => {
    expect(verifyMercadoPagoWebhook({ xSignature: null, xRequestId, dataId })).toBe(false)
  })

  test("rejects when x-request-id is missing", () => {
    const xSignature = sign(dataId, xRequestId, ts)
    expect(verifyMercadoPagoWebhook({ xSignature, xRequestId: null, dataId })).toBe(false)
  })

  test("rejects when dataId is missing", () => {
    const xSignature = sign(dataId, xRequestId, ts)
    expect(verifyMercadoPagoWebhook({ xSignature, xRequestId, dataId: null })).toBe(false)
  })

  test("rejects a malformed x-signature header", () => {
    expect(verifyMercadoPagoWebhook({ xSignature: "not-a-valid-header", xRequestId, dataId })).toBe(
      false,
    )
  })

  test("rejects a v1 of different length instead of throwing", () => {
    expect(
      verifyMercadoPagoWebhook({ xSignature: `ts=${ts},v1=short`, xRequestId, dataId }),
    ).toBe(false)
  })
})

describe("makeExternalReference", () => {
  test("embeds the userId with a pro- prefix", () => {
    expect(makeExternalReference("user-123")).toMatch(/^pro-user-123-\d+$/)
  })
})

// createPreapproval / getPreapproval / getPayment / cancelPreapproval aren't
// tested here: they're mock.module-replaced by lib/subscription.test.ts and
// the webhook route tests, which need them faked to unit test the callers.
// Bun's mock.module is process-global (not file-scoped), so whichever file
// registers a mock for "@/lib/mercadopago" first wins for every subsequent
// import in the same test run — a real fake here would silently be shadowed.
