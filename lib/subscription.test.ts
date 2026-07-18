import { describe, test, expect, mock } from "bun:test"

const mockUserUpdate = mock((_args: { where: { id: string }; data: { isPremium: boolean } }) =>
  Promise.resolve({})
)
const mockPropertyFindMany = mock(() => Promise.resolve<{ id: string }[]>([]))
const mockPropertyUpdateMany = mock(
  (_args: { where: { id: { in: string[] } }; data: { published: boolean } }) =>
    Promise.resolve({ count: 0 })
)
const mockSubscriptionUpsert = mock(
  (_args: {
    where: { userId: string }
    create: Record<string, unknown>
    update: Record<string, unknown>
  }) => Promise.resolve({})
)

mock.module("@/lib/prisma", () => ({
  prisma: {
    user: { update: mockUserUpdate },
    property: { findMany: mockPropertyFindMany, updateMany: mockPropertyUpdateMany },
    subscription: { upsert: mockSubscriptionUpsert },
  },
}))

type PaymentSourceResult = {
  ok: boolean
  paymentSourceId?: number
  status?: string
}
const mockCreatePaymentSource = mock(
  (_args: { token: string; customerEmail: string; type: string }) =>
    Promise.resolve<PaymentSourceResult>({ ok: true, paymentSourceId: 123, status: "AVAILABLE" })
)
const mockChargeRecurringPayment = mock(
  (_args: { paymentSourceId: number; reference: string; customerEmail: string; type: string }) =>
    Promise.resolve<{ ok: boolean }>({ ok: true })
)

// Spread the real module so unrelated exports (verifyWompiEvent,
// makeSubscriptionReference) stay real for any other test file that imports
// "@/lib/wompi" after this one — mock.module replaces it process-wide, not
// just for this file.
const realWompi = await import("@/lib/wompi")
mock.module("@/lib/wompi", () => ({
  ...realWompi,
  createPaymentSource: mockCreatePaymentSource,
  chargeRecurringPayment: mockChargeRecurringPayment,
}))

const { downgradeToFree, activateSubscription } = await import("./subscription")

describe("downgradeToFree", () => {
  test("clears isPremium", async () => {
    mockUserUpdate.mockClear()
    await downgradeToFree("u1")
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { isPremium: false },
    })
  })

  test("does not deactivate properties when at or under the free limit", async () => {
    mockPropertyFindMany.mockImplementation(() =>
      Promise.resolve([{ id: "p1" }, { id: "p2" }, { id: "p3" }])
    )
    mockPropertyUpdateMany.mockClear()
    await downgradeToFree("u1")
    expect(mockPropertyUpdateMany).not.toHaveBeenCalled()
  })

  test("deactivates properties beyond the free limit, keeping the most recent", async () => {
    mockPropertyFindMany.mockImplementation(() =>
      Promise.resolve([{ id: "newest" }, { id: "p2" }, { id: "p3" }, { id: "oldest1" }, { id: "oldest2" }])
    )
    mockPropertyUpdateMany.mockClear()
    await downgradeToFree("u1")
    expect(mockPropertyUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ["oldest1", "oldest2"] } },
      data: { published: false },
    })
    mockPropertyFindMany.mockImplementation(() => Promise.resolve([]))
  })
})

describe("activateSubscription", () => {
  const input = { userId: "u1", email: "a@b.com", token: "tok", type: "CARD" as const }

  test("returns source_failed when the payment source creation fails", async () => {
    mockCreatePaymentSource.mockImplementation(() => Promise.resolve({ ok: false }))
    const result = await activateSubscription(input)
    expect(result).toEqual({ ok: false, reason: "source_failed" })
    mockCreatePaymentSource.mockImplementation(() =>
      Promise.resolve({ ok: true, paymentSourceId: 123, status: "AVAILABLE" })
    )
  })

  test("returns pending when the source isn't immediately available", async () => {
    mockCreatePaymentSource.mockImplementation(() =>
      Promise.resolve({ ok: true, paymentSourceId: 123, status: "PENDING" })
    )
    const result = await activateSubscription(input)
    expect(result).toEqual({ ok: false, reason: "pending" })
    mockCreatePaymentSource.mockImplementation(() =>
      Promise.resolve({ ok: true, paymentSourceId: 123, status: "AVAILABLE" })
    )
  })

  test("persists the source as incomplete before charging", async () => {
    mockSubscriptionUpsert.mockClear()
    await activateSubscription(input)
    expect(mockSubscriptionUpsert).toHaveBeenCalledTimes(1)
    const [call] = mockSubscriptionUpsert.mock.calls
    expect(call[0].where).toEqual({ userId: "u1" })
    expect(call[0].create).toMatchObject({
      userId: "u1",
      status: "incomplete",
      wompiPaymentSourceId: 123,
      wompiPaymentSourceType: "CARD",
    })
  })

  test("returns charge_failed when the first charge is declined", async () => {
    mockChargeRecurringPayment.mockImplementation(() => Promise.resolve({ ok: false }))
    const result = await activateSubscription(input)
    expect(result).toEqual({ ok: false, reason: "charge_failed" })
    mockChargeRecurringPayment.mockImplementation(() => Promise.resolve({ ok: true }))
  })

  test("returns ok when the source is created and the first charge succeeds", async () => {
    const result = await activateSubscription(input)
    expect(result).toEqual({ ok: true })
  })

  test("does not attempt to charge when the source failed", async () => {
    mockCreatePaymentSource.mockImplementation(() => Promise.resolve({ ok: false }))
    mockChargeRecurringPayment.mockClear()
    await activateSubscription(input)
    expect(mockChargeRecurringPayment).not.toHaveBeenCalled()
    mockCreatePaymentSource.mockImplementation(() =>
      Promise.resolve({ ok: true, paymentSourceId: 123, status: "AVAILABLE" })
    )
  })
})
