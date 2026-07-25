import { describe, test, expect, mock } from "bun:test"

const mockUserUpdate = mock(
  (...args: [{ where: { id: string }; data: { isPremium: boolean } }]) => {
    void args
    return Promise.resolve({})
  }
)
const mockPropertyFindMany = mock(() => Promise.resolve<{ id: string }[]>([]))
const mockPropertyUpdateMany = mock(
  (...args: [{ where: { id: { in: string[] } }; data: { published: boolean } }]) => {
    void args
    return Promise.resolve({ count: 0 })
  }
)
const mockSubscriptionUpsert = mock(
  (
    ...args: [
      {
        where: { userId: string }
        create: Record<string, unknown>
        update: Record<string, unknown>
      },
    ]
  ) => {
    void args
    return Promise.resolve({})
  }
)

mock.module("@/lib/prisma", () => ({
  prisma: {
    user: { update: mockUserUpdate },
    property: { findMany: mockPropertyFindMany, updateMany: mockPropertyUpdateMany },
    subscription: { upsert: mockSubscriptionUpsert },
  },
}))

type CreatePreapprovalResult = {
  ok: boolean
  preapprovalId?: string
  initPoint?: string
}
const mockCreatePreapproval = mock(
  (...args: [{ userId: string; email: string; backUrl: string }]) => {
    void args
    return Promise.resolve<CreatePreapprovalResult>({
      ok: true,
      preapprovalId: "preapproval-123",
      initPoint: "https://mercadopago.com.co/checkout/pending-init",
    })
  }
)

// Spread the real module so unrelated exports (verifyMercadoPagoWebhook,
// makeExternalReference) stay real for any other test file that imports
// "@/lib/mercadopago" after this one — mock.module replaces it process-wide.
const realMercadoPago = await import("@/lib/mercadopago")
mock.module("@/lib/mercadopago", () => ({
  ...realMercadoPago,
  createPreapproval: mockCreatePreapproval,
}))

const { downgradeToFree, startSubscription } = await import("./subscription")

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

describe("startSubscription", () => {
  const input = { userId: "u1", email: "a@b.com", backUrl: "https://conexory.com/dashboard" }

  test("returns preapproval_failed when Mercado Pago rejects the request", async () => {
    mockCreatePreapproval.mockImplementation(() => Promise.resolve({ ok: false }))
    const result = await startSubscription(input)
    expect(result).toEqual({ ok: false, reason: "preapproval_failed" })
    mockCreatePreapproval.mockImplementation(() =>
      Promise.resolve({ ok: true, preapprovalId: "preapproval-123", initPoint: "https://mercadopago.com.co/checkout/pending-init" })
    )
  })

  test("persists the preapproval as incomplete", async () => {
    mockSubscriptionUpsert.mockClear()
    await startSubscription(input)
    expect(mockSubscriptionUpsert).toHaveBeenCalledTimes(1)
    const [call] = mockSubscriptionUpsert.mock.calls
    expect(call[0].where).toEqual({ userId: "u1" })
    expect(call[0].create).toMatchObject({
      userId: "u1",
      status: "incomplete",
      mpPreapprovalId: "preapproval-123",
    })
  })

  test("returns the initPoint to redirect the buyer to on success", async () => {
    const result = await startSubscription(input)
    expect(result).toEqual({ ok: true, initPoint: "https://mercadopago.com.co/checkout/pending-init" })
  })
})
