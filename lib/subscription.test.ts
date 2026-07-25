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
  status?: string
}
const mockCreatePreapproval = mock(
  (...args: [{ userId: string; email: string; backUrl: string; cardTokenId: string }]) => {
    void args
    return Promise.resolve<CreatePreapprovalResult>({
      ok: true,
      preapprovalId: "preapproval-123",
      status: "in_process",
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
  const input = {
    userId: "u1",
    email: "a@b.com",
    backUrl: "https://conexory.com/dashboard",
    cardTokenId: "card-token-123",
    cardBrand: "visa",
    cardLastFour: "1234",
  }

  test("returns preapproval_failed when Mercado Pago rejects the request", async () => {
    mockCreatePreapproval.mockImplementation(() => Promise.resolve({ ok: false }))
    const result = await startSubscription(input)
    expect(result).toEqual({ ok: false, reason: "preapproval_failed" })
    mockCreatePreapproval.mockImplementation(() =>
      Promise.resolve({ ok: true, preapprovalId: "preapproval-123", status: "in_process" })
    )
  })

  test("persists the preapproval as incomplete when Mercado Pago hasn't authorized it yet", async () => {
    mockSubscriptionUpsert.mockClear()
    mockUserUpdate.mockClear()
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
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  test("returns ok on success", async () => {
    const result = await startSubscription(input)
    expect(result).toEqual({ ok: true })
  })

  test("activates isPremium optimistically when Mercado Pago authorizes the card immediately", async () => {
    mockCreatePreapproval.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, preapprovalId: "preapproval-123", status: "authorized" })
    )
    mockSubscriptionUpsert.mockClear()
    mockUserUpdate.mockClear()
    const result = await startSubscription(input)
    expect(result).toEqual({ ok: true })
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { isPremium: true },
    })
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
})
