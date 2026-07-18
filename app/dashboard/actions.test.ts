import { describe, test, expect, mock, beforeEach } from "bun:test"

type Session = { user: { id: string } } | null

const mockGetSession = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<Session>({ user: { id: "u1" } })
})
mock.module("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}))

const mockUserFindUnique = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<{ isPremium: boolean } | null>({ isPremium: true })
})
mock.module("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mockUserFindUnique } },
}))

const mockSetOnboardingFlag = mock((...args: [unknown, unknown]) => {
  void args
  return Promise.resolve()
})
mock.module("@/lib/onboarding-server", () => ({
  setOnboardingFlag: mockSetOnboardingFlag,
}))

// next/headers is mocked globally in test-setup.ts.

const { getIsPremium, markWelcomeModalSeen, completeDashboardTour } = await import("./actions")

beforeEach(() => {
  mockGetSession.mockImplementation(() => Promise.resolve({ user: { id: "u1" } }))
  mockUserFindUnique.mockImplementation(() => Promise.resolve({ isPremium: true }))
  mockSetOnboardingFlag.mockClear()
})

describe("getIsPremium", () => {
  test("returns false when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    expect(await getIsPremium()).toBe(false)
  })

  test("returns false when the user row can't be found", async () => {
    mockUserFindUnique.mockImplementation(() => Promise.resolve(null))
    expect(await getIsPremium()).toBe(false)
  })

  test("returns the user's isPremium flag", async () => {
    expect(await getIsPremium()).toBe(true)
  })
})

describe("markWelcomeModalSeen", () => {
  test("does nothing when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    await markWelcomeModalSeen()
    expect(mockSetOnboardingFlag).not.toHaveBeenCalled()
  })

  test("sets the welcomeModalSeen flag", async () => {
    await markWelcomeModalSeen()
    expect(mockSetOnboardingFlag).toHaveBeenCalledWith("u1", "welcomeModalSeen")
  })
})

describe("completeDashboardTour", () => {
  test("does nothing when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    await completeDashboardTour()
    expect(mockSetOnboardingFlag).not.toHaveBeenCalled()
  })

  test("sets the dashboardTourCompleted flag", async () => {
    await completeDashboardTour()
    expect(mockSetOnboardingFlag).toHaveBeenCalledWith("u1", "dashboardTourCompleted")
  })
})
