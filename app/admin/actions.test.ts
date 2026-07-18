import { describe, test, expect, mock, beforeEach } from "bun:test"

type Session = { user: { role: string } } | null

const mockGetSession = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<Session>({ user: { role: "admin" } })
})
mock.module("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}))

const mockUserUpdate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
mock.module("@/lib/prisma", () => ({
  prisma: { user: { update: mockUserUpdate } },
}))

mock.module("next/cache", () => ({
  revalidatePath: mock((...args: [unknown]) => void args),
}))

// next/headers is mocked globally in test-setup.ts.

const { toggleUserIsPremium, updatePremiumUntil } = await import("./actions")

const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
const pastDate = "2020-01-01"

beforeEach(() => {
  mockGetSession.mockImplementation(() => Promise.resolve({ user: { role: "admin" } }))
  mockUserUpdate.mockClear()
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
