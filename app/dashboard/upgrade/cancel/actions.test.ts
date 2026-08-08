import { describe, test, expect, mock, beforeEach } from "bun:test"

type Session = { user: { id: string; isPremium: boolean } } | null

const mockGetSession = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<Session>({ user: { id: "u1", isPremium: true } })
})
mock.module("@/lib/auth", () => ({
  getSession: mockGetSession,
  auth: { api: {} },
}))

const mockSubscriptionFindUnique = mock(() =>
  Promise.resolve<{ mpPreapprovalId: string | null } | null>({ mpPreapprovalId: "preapproval-1" })
)
const mockSubscriptionUpdateMany = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({ count: 1 })
})
mock.module("@/lib/prisma", () => ({
  prisma: {
    subscription: { findUnique: mockSubscriptionFindUnique, updateMany: mockSubscriptionUpdateMany },
  },
}))

const mockCancelPreapproval = mock((...args: [string]) => {
  void args
  return Promise.resolve({ ok: true })
})
mock.module("@/lib/mercadopago", () => ({
  cancelPreapproval: mockCancelPreapproval,
}))

mock.module("next/cache", () => ({
  revalidatePath: mock((...args: [unknown]) => void args),
}))

// next/headers and next/navigation are mocked globally in test-setup.ts.

const { cancelSubscription } = await import("./actions")

beforeEach(() => {
  mockGetSession.mockImplementation(() => Promise.resolve({ user: { id: "u1", isPremium: true } }))
  mockSubscriptionFindUnique.mockImplementation(() =>
    Promise.resolve({ mpPreapprovalId: "preapproval-1" })
  )
  mockSubscriptionUpdateMany.mockClear()
  mockCancelPreapproval.mockClear()
  mockCancelPreapproval.mockImplementation(() => Promise.resolve({ ok: true }))
})

describe("cancelSubscription", () => {
  test("redirects to /login when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    await expect(cancelSubscription()).rejects.toThrow("REDIRECT:/login")
    expect(mockSubscriptionUpdateMany).not.toHaveBeenCalled()
  })

  test("redirects to /dashboard when the user isn't Pro", async () => {
    mockGetSession.mockImplementation(() =>
      Promise.resolve({ user: { id: "u1", isPremium: false } })
    )
    await expect(cancelSubscription()).rejects.toThrow("REDIRECT:/dashboard")
    expect(mockSubscriptionUpdateMany).not.toHaveBeenCalled()
  })

  test("cancels the preapproval on Mercado Pago, moves the subscription to canceling, and redirects to upgrade", async () => {
    await expect(cancelSubscription()).rejects.toThrow("REDIRECT:/dashboard/upgrade")
    expect(mockCancelPreapproval).toHaveBeenCalledWith("preapproval-1")
    expect(mockSubscriptionUpdateMany).toHaveBeenCalledWith({
      where: { userId: "u1", status: { in: ["active", "past_due"] } },
      data: { status: "canceling" },
    })
  })

  test("skips calling Mercado Pago when there's no stored preapproval id", async () => {
    mockSubscriptionFindUnique.mockImplementation(() => Promise.resolve({ mpPreapprovalId: null }))
    await expect(cancelSubscription()).rejects.toThrow("REDIRECT:/dashboard/upgrade")
    expect(mockCancelPreapproval).not.toHaveBeenCalled()
    expect(mockSubscriptionUpdateMany).toHaveBeenCalled()
  })

  test("redirects with an error and does not touch local status when Mercado Pago fails to cancel", async () => {
    mockCancelPreapproval.mockImplementation(() => Promise.resolve({ ok: false }))
    await expect(cancelSubscription()).rejects.toThrow(
      "REDIRECT:/dashboard/upgrade?error=cancel_failed"
    )
    expect(mockSubscriptionUpdateMany).not.toHaveBeenCalled()
  })
})
