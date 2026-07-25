import { describe, test, expect, mock, beforeEach } from "bun:test"

type Session = { user: { id: string; email: string; isPremium: boolean } } | null

const mockGetSession = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<Session>({ user: { id: "u1", email: "a@b.com", isPremium: false } })
})
mock.module("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
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

// next/headers is mocked globally in test-setup.ts.

const { subscribeAction } = await import("./actions")

beforeEach(() => {
  mockGetSession.mockImplementation(() =>
    Promise.resolve({ user: { id: "u1", email: "a@b.com", isPremium: false } })
  )
  mockStartSubscription.mockClear()
  mockStartSubscription.mockImplementation(() => Promise.resolve({ ok: true }))
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
