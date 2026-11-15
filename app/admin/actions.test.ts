import { describe, test, expect, mock, beforeEach } from "bun:test"

type Session = { user: { role: string } } | null

const mockGetSession = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<Session>({ user: { role: "admin" } })
})
mock.module("@/lib/auth", () => ({
  getSession: mockGetSession,
  auth: { api: {} },
}))

const mockUserUpdate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
const mockSubscriptionFindUnique = mock(() =>
  Promise.resolve<{ userId: string } | null>({ userId: "u1" })
)
const mockSubscriptionUpdate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
const mockFeedbackUpdateMany = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({ count: 1 })
})
mock.module("@/lib/prisma", () => ({
  prisma: {
    user: { update: mockUserUpdate },
    feedback: { updateMany: mockFeedbackUpdateMany },
    subscription: { findUnique: mockSubscriptionFindUnique, update: mockSubscriptionUpdate },
  },
}))

const mockRevalidatePath = mock((...args: [unknown]) => void args)
mock.module("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}))

// next/headers is mocked globally in test-setup.ts.

const {
  toggleUserIsPremium,
  updatePremiumUntil,
  updateSubscriptionPeriodEnd,
  setFeedbackResolved,
} = await import("./actions")

const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
const pastDate = "2020-01-01"

beforeEach(() => {
  mockGetSession.mockImplementation(() => Promise.resolve({ user: { role: "admin" } }))
  mockUserUpdate.mockClear()
  mockSubscriptionFindUnique.mockClear()
  mockSubscriptionFindUnique.mockImplementation(() => Promise.resolve({ userId: "u1" }))
  mockSubscriptionUpdate.mockClear()
  mockFeedbackUpdateMany.mockClear()
  mockRevalidatePath.mockClear()
  mockFeedbackUpdateMany.mockImplementation(() => Promise.resolve({ count: 1 }))
})

describe("toggleUserIsPremium", () => {
  test("rejects a non-admin session", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve({ user: { role: "user" } }))
    const result = await toggleUserIsPremium("u1", true, futureDate)
    expect(result).toEqual({ success: false, error: "No autorizado" })
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  test("rejects an unauthenticated request", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    const result = await toggleUserIsPremium("u1", true, futureDate)
    expect(result.success).toBe(false)
  })

  test("rejects activation with a past expiry date", async () => {
    const result = await toggleUserIsPremium("u1", true, pastDate)
    expect(result.success).toBe(false)
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  test("rejects activation with no expiry date at all", async () => {
    const result = await toggleUserIsPremium("u1", true, null)
    expect(result.success).toBe(false)
  })

  test("activates with the given future date", async () => {
    const result = await toggleUserIsPremium("u1", true, futureDate)
    expect(result).toEqual({ success: true })
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { isPremium: true, premiumUntil: new Date(futureDate) },
    })
  })

  test("deactivates and clears premiumUntil", async () => {
    const result = await toggleUserIsPremium("u1", false)
    expect(result).toEqual({ success: true })
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { isPremium: false, premiumUntil: null },
    })
  })
})

describe("updatePremiumUntil", () => {
  test("rejects a non-admin session", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve({ user: { role: "user" } }))
    const result = await updatePremiumUntil("u1", futureDate)
    expect(result).toEqual({ success: false, error: "No autorizado" })
  })

  test("rejects a past date", async () => {
    const result = await updatePremiumUntil("u1", pastDate)
    expect(result.success).toBe(false)
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  test("updates the expiry date without touching isPremium", async () => {
    const result = await updatePremiumUntil("u1", futureDate)
    expect(result).toEqual({ success: true })
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { premiumUntil: new Date(futureDate) },
    })
  })
})

describe("updateSubscriptionPeriodEnd", () => {
  test("rejects a non-admin session", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve({ user: { role: "user" } }))
    const result = await updateSubscriptionPeriodEnd("u1", futureDate)
    expect(result).toEqual({ success: false, error: "No autorizado" })
    expect(mockSubscriptionUpdate).not.toHaveBeenCalled()
  })

  test("rejects a past date", async () => {
    const result = await updateSubscriptionPeriodEnd("u1", pastDate)
    expect(result.success).toBe(false)
    expect(mockSubscriptionUpdate).not.toHaveBeenCalled()
  })

  test("rejects a user with no subscription", async () => {
    mockSubscriptionFindUnique.mockImplementation(() => Promise.resolve(null))
    const result = await updateSubscriptionPeriodEnd("u1", futureDate)
    expect(result).toEqual({ success: false, error: "Este usuario no tiene una suscripción" })
    expect(mockSubscriptionUpdate).not.toHaveBeenCalled()
  })

  test("updates currentPeriodEnd for an existing subscription", async () => {
    const result = await updateSubscriptionPeriodEnd("u1", futureDate)
    expect(result).toEqual({ success: true })
    expect(mockSubscriptionUpdate).toHaveBeenCalledWith({
      where: { userId: "u1" },
      data: { currentPeriodEnd: new Date(futureDate) },
    })
  })
})

describe("setFeedbackResolved", () => {
  test("rejects a non-admin session", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve({ user: { role: "user" } }))
    const result = await setFeedbackResolved("f1", true)
    expect(result).toEqual({ success: false, error: "No autorizado" })
    expect(mockFeedbackUpdateMany).not.toHaveBeenCalled()
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  test("rejects an empty id", async () => {
    const result = await setFeedbackResolved("", true)
    expect(result).toEqual({ success: false, error: "Solicitud inválida" })
    expect(mockFeedbackUpdateMany).not.toHaveBeenCalled()
  })

  test("marks feedback as resolved with the current date", async () => {
    const result = await setFeedbackResolved("f1", true)
    expect(result).toEqual({ success: true })
    const call = mockFeedbackUpdateMany.mock.calls[0][0] as {
      where: { id: string }
      data: { resolvedAt: Date | null }
    }
    expect(call.where).toEqual({ id: "f1" })
    expect(call.data.resolvedAt).toBeInstanceOf(Date)
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/feedback")
  })

  test("marks feedback as pending again", async () => {
    const result = await setFeedbackResolved("f1", false)
    expect(result).toEqual({ success: true })
    expect(mockFeedbackUpdateMany).toHaveBeenCalledWith({
      where: { id: "f1" },
      data: { resolvedAt: null },
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/feedback")
  })

  test("reports feedback that no longer exists", async () => {
    mockFeedbackUpdateMany.mockImplementation(() => Promise.resolve({ count: 0 }))
    const result = await setFeedbackResolved("missing", true)
    expect(result).toEqual({ success: false, error: "Este feedback ya no existe" })
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })
})
