import { describe, test, expect, mock, beforeEach } from "bun:test"

type Session = { user: { id: string; isPremium: boolean } } | null

const mockGetSession = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<Session>({ user: { id: "u1", isPremium: true } })
})
mock.module("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}))

const mockSubscriptionUpdateMany = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({ count: 1 })
})
mock.module("@/lib/prisma", () => ({
  prisma: { subscription: { updateMany: mockSubscriptionUpdateMany } },
}))

mock.module("next/cache", () => ({
  revalidatePath: mock((...args: [unknown]) => void args),
}))

// next/headers and next/navigation are mocked globally in test-setup.ts.

const { cancelSubscription } = await import("./actions")

beforeEach(() => {
  mockGetSession.mockImplementation(() => Promise.resolve({ user: { id: "u1", isPremium: true } }))
  mockSubscriptionUpdateMany.mockClear()
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

  test("moves the active/past_due subscription to canceling and redirects to upgrade", async () => {
    await expect(cancelSubscription()).rejects.toThrow("REDIRECT:/dashboard/upgrade")
    expect(mockSubscriptionUpdateMany).toHaveBeenCalledWith({
      where: { userId: "u1", status: { in: ["active", "past_due"] } },
      data: { status: "canceling" },
    })
  })
})
