import { describe, test, expect, mock, beforeEach } from "bun:test"

type Session = { user: { id: string; email: string; isPremium: boolean } } | null

const mockGetSession = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<Session>({ user: { id: "u1", email: "a@b.com", isPremium: false } })
})
mock.module("@/lib/auth", () => ({
  getSession: mockGetSession,
  auth: { api: {} },
}))

type StartSubscriptionResult = { ok: true } | { ok: false; reason: "preapproval_failed" }
const mockStartSubscription = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<StartSubscriptionResult>({ ok: true })
})
mock.module("@/lib/subscription", () => ({
  startSubscription: mockStartSubscription,
}))

mock.module("@/lib/urls", () => ({
  getAppUrl: () => "https://conexory.com",
}))

mock.module("next/cache", () => ({
  revalidatePath: mock((...args: [unknown]) => void args),
}))

const mockSubscriptionFindUnique = mock(() =>
  Promise.resolve<{ mpPreapprovalId: string | null } | null>({ mpPreapprovalId: "preapproval-123" })
)
const mockSubscriptionUpdate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
mock.module("@/lib/prisma", () => ({
  prisma: { subscription: { findUnique: mockSubscriptionFindUnique, update: mockSubscriptionUpdate } },
}))

type UpdatePreapprovalCardResult = { ok: boolean; cardBrand?: string }
const mockUpdatePreapprovalCard = mock((...args: [string, string]) => {
  void args
  return Promise.resolve<UpdatePreapprovalCardResult>({ ok: true, cardBrand: "visa" })
})
type CardTokenDetails = { ok: boolean; cardLastFour?: string }
const mockGetCardToken = mock((...args: [string]) => {
  void args
  return Promise.resolve<CardTokenDetails>({ ok: true, cardLastFour: "1234" })
})
// Spread the real module so unrelated exports (createPreapproval, getPayment,
// verifyMercadoPagoWebhook, etc.) stay real for any other test file that
// imports "@/lib/mercadopago" after this one — mock.module replaces it
// process-wide, not per file (see lib/subscription.test.ts for the same
// pattern).
const realMercadoPago = await import("@/lib/mercadopago")
mock.module("@/lib/mercadopago", () => ({
  ...realMercadoPago,
  updatePreapprovalCard: mockUpdatePreapprovalCard,
  getCardToken: mockGetCardToken,
}))

// next/headers is mocked globally in test-setup.ts.

const { subscribeAction, changeCardAction } = await import("./actions")

beforeEach(() => {
  mockGetSession.mockImplementation(() =>
    Promise.resolve({ user: { id: "u1", email: "a@b.com", isPremium: false } })
  )
  mockStartSubscription.mockClear()
  mockStartSubscription.mockImplementation(() => Promise.resolve({ ok: true }))
  mockSubscriptionFindUnique.mockClear()
  mockSubscriptionFindUnique.mockImplementation(() =>
    Promise.resolve({ mpPreapprovalId: "preapproval-123" })
  )
  mockUpdatePreapprovalCard.mockClear()
  mockUpdatePreapprovalCard.mockImplementation(() => Promise.resolve({ ok: true, cardBrand: "visa" }))
  mockGetCardToken.mockClear()
  mockGetCardToken.mockImplementation(() => Promise.resolve({ ok: true, cardLastFour: "1234" }))
  mockSubscriptionUpdate.mockClear()
})

describe("subscribeAction", () => {
  test("returns preapproval_failed when the card token is missing", async () => {
    expect(await subscribeAction("")).toEqual({ ok: false, reason: "preapproval_failed" })
    expect(mockStartSubscription).not.toHaveBeenCalled()
  })

  test("returns unauthenticated when there's no session", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    expect(await subscribeAction("card-token-123")).toEqual({ ok: false, reason: "unauthenticated" })
    expect(mockStartSubscription).not.toHaveBeenCalled()
  })

  test("returns already_premium when the user already has Pro", async () => {
    mockGetSession.mockImplementation(() =>
      Promise.resolve({ user: { id: "u1", email: "a@b.com", isPremium: true } })
    )
    expect(await subscribeAction("card-token-123")).toEqual({ ok: false, reason: "already_premium" })
    expect(mockStartSubscription).not.toHaveBeenCalled()
  })

  test("starts the subscription with the tokenized card and returns ok", async () => {
    expect(await subscribeAction("card-token-123")).toEqual({ ok: true })
    expect(mockStartSubscription).toHaveBeenCalledWith({
      userId: "u1",
      email: "a@b.com",
      backUrl: "https://conexory.com/dashboard?upgrade=processing",
      cardTokenId: "card-token-123",
    })
  })

  test("returns preapproval_failed when Mercado Pago rejects the preapproval", async () => {
    mockStartSubscription.mockImplementation(() =>
      Promise.resolve({ ok: false, reason: "preapproval_failed" })
    )
    expect(await subscribeAction("card-token-123")).toEqual({
      ok: false,
      reason: "preapproval_failed",
    })
  })
})

describe("changeCardAction", () => {
  test("returns update_failed when the card token is missing", async () => {
    expect(await changeCardAction("")).toEqual({ ok: false, reason: "update_failed" })
    expect(mockUpdatePreapprovalCard).not.toHaveBeenCalled()
  })

  test("returns unauthenticated when there's no session", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    expect(await changeCardAction("card-token-123")).toEqual({ ok: false, reason: "unauthenticated" })
    expect(mockUpdatePreapprovalCard).not.toHaveBeenCalled()
  })

  test("returns no_subscription when the user has no stored preapproval id", async () => {
    mockSubscriptionFindUnique.mockImplementation(() => Promise.resolve({ mpPreapprovalId: null }))
    expect(await changeCardAction("card-token-123")).toEqual({ ok: false, reason: "no_subscription" })
    expect(mockUpdatePreapprovalCard).not.toHaveBeenCalled()
  })

  test("updates the card on the stored preapproval and returns ok", async () => {
    expect(await changeCardAction("card-token-123")).toEqual({ ok: true })
    expect(mockUpdatePreapprovalCard).toHaveBeenCalledWith("preapproval-123", "card-token-123")
  })

  test("stores the brand from the update response and the last four digits from the token lookup", async () => {
    await changeCardAction("card-token-123")
    expect(mockSubscriptionUpdate).toHaveBeenCalledWith({
      where: { userId: "u1" },
      data: { cardBrand: "visa", cardLastFour: "1234" },
    })
  })

  test("returns update_failed when Mercado Pago rejects the update", async () => {
    mockUpdatePreapprovalCard.mockImplementation(() => Promise.resolve({ ok: false }))
    expect(await changeCardAction("card-token-123")).toEqual({ ok: false, reason: "update_failed" })
  })
})
