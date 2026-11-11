import { mockRevalidateTag } from "@/test-setup"
import { afterAll, describe, test, expect, mock, spyOn } from "bun:test"
import * as analytics from "@/lib/analytics"

const mockUserUpdate = mock(
  (...args: [{ where: { id: string }; data: { isPremium: boolean } }]) => {
    void args
    return Promise.resolve({})
  }
)
const mockUserUpdateMany = mock(
  (...args: [{ where: { id: string; isPremium: boolean }; data: { isPremium: boolean } }]) => {
    void args
    return Promise.resolve({ count: 1 })
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

const mockSubscriptionFindUnique = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<{ mpPreapprovalId: string | null } | null>(null)
})
const mockPaymentEventUpsert = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})

// spyOn instead of mock.module: a module mock is process-wide and would hand
// this fake to lib/analytics.test.ts if it runs later.
const mockTrackEvent = spyOn(analytics, "trackEvent").mockImplementation(() => Promise.resolve())
afterAll(() => mockTrackEvent.mockRestore())

mock.module("@/lib/prisma", () => ({
  prisma: {
    user: { update: mockUserUpdate, updateMany: mockUserUpdateMany },
    property: { findMany: mockPropertyFindMany, updateMany: mockPropertyUpdateMany },
    subscription: { upsert: mockSubscriptionUpsert, findUnique: mockSubscriptionFindUnique },
    paymentEvent: { upsert: mockPaymentEventUpsert },
  },
}))

type CreatePreapprovalResult = {
  ok: boolean
  preapprovalId?: string
  status?: string
  cardBrand?: string
}
const mockCreatePreapproval = mock(
  (...args: [{ userId: string; email: string; backUrl: string; cardTokenId: string }]) => {
    void args
    return Promise.resolve<CreatePreapprovalResult>({
      ok: true,
      preapprovalId: "preapproval-123",
      status: "in_process",
      cardBrand: "visa",
    })
  }
)

type CardTokenDetails = { ok: boolean; cardLastFour?: string }
const mockGetCardToken = mock((...args: [string]) => {
  void args
  return Promise.resolve<CardTokenDetails>({ ok: true, cardLastFour: "1234" })
})

const mockCancelPreapproval = mock((...args: [string]) => {
  void args
  return Promise.resolve({ ok: true })
})

// Spread the real module so unrelated exports (verifyMercadoPagoWebhook,
// makeExternalReference) stay real for any other test file that imports
// "@/lib/mercadopago" after this one — mock.module replaces it process-wide.
const realMercadoPago = await import("@/lib/mercadopago")
mock.module("@/lib/mercadopago", () => ({
  ...realMercadoPago,
  createPreapproval: mockCreatePreapproval,
  getCardToken: mockGetCardToken,
  cancelPreapproval: mockCancelPreapproval,
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
    mockRevalidateTag.mockClear()
    mockPropertyFindMany.mockImplementation(() =>
      Promise.resolve([{ id: "p1" }, { id: "p2" }, { id: "p3" }])
    )
    mockPropertyUpdateMany.mockClear()
    await downgradeToFree("u1")
    expect(mockPropertyUpdateMany).not.toHaveBeenCalled()
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  test("deactivates properties beyond the free limit, keeping the most recent", async () => {
    mockRevalidateTag.mockClear()
    mockPropertyFindMany.mockImplementation(() =>
      Promise.resolve([{ id: "newest" }, { id: "p2" }, { id: "p3" }, { id: "oldest1" }, { id: "oldest2" }])
    )
    mockPropertyUpdateMany.mockClear()
    await downgradeToFree("u1")
    expect(mockPropertyUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ["oldest1", "oldest2"] } },
      data: { published: false },
    })
    expect(mockRevalidateTag).toHaveBeenCalledWith("public-listings", { expire: 0 })
    mockPropertyFindMany.mockImplementation(() => Promise.resolve([]))
  })
})

describe("startSubscription", () => {
  const input = {
    userId: "u1",
    email: "a@b.com",
    backUrl: "https://conexory.com/dashboard",
    cardTokenId: "card-token-123",
  }

  test("returns preapproval_failed and reports it when Mercado Pago rejects the request", async () => {
    const consoleError = spyOn(console, "error").mockImplementation(() => {})
    mockCreatePreapproval.mockImplementation(() => Promise.resolve({ ok: false, error: "http_400" }))
    const result = await startSubscription(input)
    expect(result).toEqual({ ok: false, reason: "preapproval_failed" })
    expect(consoleError).toHaveBeenCalledWith("Subscription checkout failed: preapproval not created", {
      userId: "u1",
      error: "http_400",
    })
    consoleError.mockRestore()
    mockCreatePreapproval.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        preapprovalId: "preapproval-123",
        status: "in_process",
        cardBrand: "visa",
      })
    )
  })

  test("persists the preapproval as incomplete when Mercado Pago hasn't authorized it yet", async () => {
    mockSubscriptionUpsert.mockClear()
    mockUserUpdateMany.mockClear()
    mockTrackEvent.mockClear()
    await startSubscription(input)
    expect(mockSubscriptionUpsert).toHaveBeenCalledTimes(1)
    const [call] = mockSubscriptionUpsert.mock.calls
    expect(call[0].where).toEqual({ userId: "u1" })
    expect(call[0].create).toMatchObject({
      userId: "u1",
      status: "incomplete",
      mpPreapprovalId: "preapproval-123",
    })
    expect(call[0].create).not.toHaveProperty("currentPeriodEnd", expect.any(Date))
    expect(mockUserUpdateMany).not.toHaveBeenCalled()
    expect(mockTrackEvent).not.toHaveBeenCalled()
  })

  test("returns ok on success", async () => {
    const result = await startSubscription(input)
    expect(result).toEqual({ ok: true })
  })

  test("cancels the previous preapproval when a user subscribes again", async () => {
    mockSubscriptionFindUnique.mockImplementationOnce(() =>
      Promise.resolve({ mpPreapprovalId: "old-preapproval" }),
    )
    mockCancelPreapproval.mockClear()
    mockPaymentEventUpsert.mockClear()

    const result = await startSubscription(input)

    expect(result).toEqual({ ok: true })
    expect(mockCancelPreapproval).toHaveBeenCalledWith("old-preapproval")
    expect(mockPaymentEventUpsert.mock.calls[0][0]).toMatchObject({
      create: { type: "orphan_subscription", status: "cancelled" },
    })
  })

  test("does not cancel anything when there is no previous preapproval", async () => {
    mockSubscriptionFindUnique.mockImplementationOnce(() => Promise.resolve(null))
    mockCancelPreapproval.mockClear()

    await startSubscription(input)

    expect(mockCancelPreapproval).not.toHaveBeenCalled()
  })

  test("does not cancel the preapproval Mercado Pago just returned", async () => {
    mockSubscriptionFindUnique.mockImplementationOnce(() =>
      Promise.resolve({ mpPreapprovalId: "preapproval-123" }),
    )
    mockCancelPreapproval.mockClear()

    await startSubscription(input)

    expect(mockCancelPreapproval).not.toHaveBeenCalled()
  })

  test("keeps the new subscription even if cancelling the old preapproval fails", async () => {
    mockSubscriptionFindUnique.mockImplementationOnce(() =>
      Promise.resolve({ mpPreapprovalId: "old-preapproval" }),
    )
    mockCancelPreapproval.mockImplementationOnce(() => Promise.resolve({ ok: false }))

    const result = await startSubscription(input)

    expect(result).toEqual({ ok: true })
  })

  test("activates isPremium optimistically when Mercado Pago authorizes the card immediately", async () => {
    mockCreatePreapproval.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, preapprovalId: "preapproval-123", status: "authorized", cardBrand: "visa" })
    )
    mockSubscriptionUpsert.mockClear()
    mockUserUpdateMany.mockClear()
    mockTrackEvent.mockClear()
    const result = await startSubscription(input)
    expect(result).toEqual({ ok: true })
    expect(mockUserUpdateMany).toHaveBeenCalledWith({
      where: { id: "u1", isPremium: false },
      data: { isPremium: true },
    })
    expect(mockTrackEvent).toHaveBeenCalledWith("u1", "upgrade_completed", { source: "card" })
    const [call] = mockSubscriptionUpsert.mock.calls
    expect(call[0].create).toMatchObject({
      userId: "u1",
      status: "active",
      mpPreapprovalId: "preapproval-123",
      cardBrand: "visa",
      cardLastFour: "1234",
    })
    expect((call[0].create as { currentPeriodEnd: Date }).currentPeriodEnd).toBeInstanceOf(Date)
  })

  test("doesn't count an upgrade when the user was already Pro", async () => {
    mockCreatePreapproval.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, preapprovalId: "preapproval-123", status: "authorized", cardBrand: "visa" })
    )
    mockUserUpdateMany.mockImplementationOnce(() => Promise.resolve({ count: 0 }))
    mockTrackEvent.mockClear()
    await startSubscription(input)
    expect(mockTrackEvent).not.toHaveBeenCalled()
  })
})
