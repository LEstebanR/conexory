import { describe, test, expect } from "bun:test"
import crypto from "crypto"

// WOMPI_EVENTS_SECRET is set by test-setup.ts (bunfig.toml preload) before any
// test file — including this one — gets a chance to import the real module.
const { verifyWompiEvent, makeSubscriptionReference } = await import("./wompi")

function sign(data: unknown, properties: string[], timestamp: number, secret = "test_events_secret") {
  const resolve = (obj: unknown, path: string): unknown =>
    path.split(".").reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key]
      return undefined
    }, obj)
  const concatenated = properties.map((p) => String(resolve(data, p) ?? "")).join("")
  const checksum = crypto
    .createHash("sha256")
    .update(`${concatenated}${timestamp}${secret}`)
    .digest("hex")
  return { properties, checksum }
}

describe("verifyWompiEvent", () => {
  const data = { transaction: { id: "tx-1", status: "APPROVED" } }
  const properties = ["transaction.id", "transaction.status"]
  const timestamp = 1700000000

  test("accepts an event with a valid checksum", () => {
    const event = { data, signature: sign(data, properties, timestamp), timestamp }
    expect(verifyWompiEvent(event)).toBe(true)
  })

  test("rejects a tampered payload (checksum no longer matches)", () => {
    const signature = sign(data, properties, timestamp)
    const tampered = { data: { transaction: { id: "tx-1", status: "DECLINED" } }, signature, timestamp }
    expect(verifyWompiEvent(tampered)).toBe(false)
  })

  test("rejects a checksum signed with the wrong secret", () => {
    const signature = sign(data, properties, timestamp, "wrong_secret")
    const event = { data, signature, timestamp }
    expect(verifyWompiEvent(event)).toBe(false)
  })

  test("rejects when the signature block is missing", () => {
    expect(verifyWompiEvent({ data, timestamp })).toBe(false)
  })

  test("rejects when the timestamp is missing", () => {
    const signature = sign(data, properties, timestamp)
    expect(verifyWompiEvent({ data, signature })).toBe(false)
  })

  test("rejects a checksum of different length instead of throwing", () => {
    const event = {
      data,
      signature: { properties, checksum: "short" },
      timestamp,
    }
    expect(verifyWompiEvent(event)).toBe(false)
  })
})

describe("makeSubscriptionReference", () => {
  test("embeds the userId with a pro- prefix", () => {
    expect(makeSubscriptionReference("user-123")).toMatch(/^pro-user-123-\d+$/)
  })
})

// createPaymentSource / chargeRecurringPayment aren't tested here: they're
// mock.module-replaced by lib/subscription.test.ts, which needs them faked to
// unit test activateSubscription. Bun's mock.module is process-global (not
// file-scoped), so whichever file registers a mock for "@/lib/wompi" first
// wins for every subsequent import in the same test run — a real fake there
// would silently be shadowed by that mock when the suite runs together.
