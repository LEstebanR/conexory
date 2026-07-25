import { describe, test, expect, mock, beforeEach } from "bun:test"

type Session = { user: { id: string; email: string; isPremium: boolean } } | null

const mockGetSession = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<Session>({ user: { id: "u1", email: "a@b.com", isPremium: false } })
})
mock.module("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}))

type StartSubscriptionResult =
  | { ok: true; initPoint: string }
  | { ok: false; reason: "preapproval_failed" }
const mockStartSubscription = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<StartSubscriptionResult>({
    ok: true,
    initPoint: "https://mercadopago.com.co/checkout/pending-init",
  })
})
mock.module("@/lib/subscription", () => ({
  startSubscription: mockStartSubscription,
}))

mock.module("@/lib/urls", () => ({
  getAppUrl: () => "https://conexory.com",
}))

// next/headers and next/navigation are mocked globally in test-setup.ts.

const { subscribeAction } = await import("./actions")

beforeEach(() => {
  mockGetSession.mockImplementation(() =>
    Promise.resolve({ user: { id: "u1", email: "a@b.com", isPremium: false } })
  )
  mockStartSubscription.mockClear()
  mockStartSubscription.mockImplementation(() =>
    Promise.resolve({ ok: true, initPoint: "https://mercadopago.com.co/checkout/pending-init" })
  )
})

describe("subscribeAction", () => {
  test("redirects to /login when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    await expect(subscribeAction()).rejects.toThrow("REDIRECT:/login")
    expect(mockStartSubscription).not.toHaveBeenCalled()
  })

  test("redirects to /dashboard when already Pro", async () => {
    mockGetSession.mockImplementation(() =>
      Promise.resolve({ user: { id: "u1", email: "a@b.com", isPremium: true } })
    )
    await expect(subscribeAction()).rejects.toThrow("REDIRECT:/dashboard")
    expect(mockStartSubscription).not.toHaveBeenCalled()
  })

  test("starts the subscription with the app's back_url and redirects to Mercado Pago's initPoint", async () => {
    await expect(subscribeAction()).rejects.toThrow(
      "REDIRECT:https://mercadopago.com.co/checkout/pending-init"
    )
    expect(mockStartSubscription).toHaveBeenCalledWith({
      userId: "u1",
      email: "a@b.com",
      backUrl: "https://conexory.com/dashboard?upgrade=processing",
    })
  })

  test("redirects with an error when Mercado Pago rejects the preapproval", async () => {
    mockStartSubscription.mockImplementation(() =>
      Promise.resolve({ ok: false, reason: "preapproval_failed" })
    )
    await expect(subscribeAction()).rejects.toThrow(
      "REDIRECT:/dashboard/upgrade?error=preapproval_failed"
    )
  })
})
