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
const mockFeedbackCreate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
mock.module("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mockUserFindUnique },
    feedback: { create: mockFeedbackCreate },
  },
}))

const mockSetOnboardingFlag = mock((...args: [unknown, unknown]) => {
  void args
  return Promise.resolve()
})
mock.module("@/lib/onboarding-server", () => ({
  setOnboardingFlag: mockSetOnboardingFlag,
}))

// next/headers is mocked globally in test-setup.ts.

const { getIsPremium, markWelcomeModalSeen, completeDashboardTour, submitFeedback } =
  await import("./actions")

function feedbackForm(fields: Record<string, string>): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) formData.set(key, value)
  return formData
}

beforeEach(() => {
  mockGetSession.mockImplementation(() => Promise.resolve({ user: { id: "u1" } }))
  mockUserFindUnique.mockImplementation(() => Promise.resolve({ isPremium: true }))
  mockSetOnboardingFlag.mockClear()
  mockFeedbackCreate.mockClear()
  mockFeedbackCreate.mockImplementation(() => Promise.resolve({}))
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

describe("submitFeedback", () => {
  test("errors when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    const result = await submitFeedback(null, feedbackForm({ message: "Me encanta la app" }))
    expect(result).toEqual({ error: "Sesión expirada. Vuelve a iniciar sesión." })
    expect(mockFeedbackCreate).not.toHaveBeenCalled()
  })

  test("errors when the message is too short", async () => {
    const result = await submitFeedback(null, feedbackForm({ message: "hi" }))
    expect(result?.error).toBe("Escribe un mensaje")
    expect(mockFeedbackCreate).not.toHaveBeenCalled()
  })

  test("saves feedback with a name", async () => {
    const result = await submitFeedback(
      null,
      feedbackForm({ name: "Luis", message: "Me encanta la app" })
    )
    expect(result).toEqual({ success: true })
    expect(mockFeedbackCreate).toHaveBeenCalledWith({
      data: { userId: "u1", name: "Luis", message: "Me encanta la app" },
    })
  })

  test("saves feedback without a name as null", async () => {
    const result = await submitFeedback(null, feedbackForm({ message: "Sugerencia sin nombre" }))
    expect(result).toEqual({ success: true })
    expect(mockFeedbackCreate).toHaveBeenCalledWith({
      data: { userId: "u1", name: null, message: "Sugerencia sin nombre" },
    })
  })

  test("returns a generic error when saving fails", async () => {
    mockFeedbackCreate.mockImplementation(() => Promise.reject(new Error("DB down")))
    const result = await submitFeedback(null, feedbackForm({ message: "Algo salió mal" }))
    expect(result).toEqual({ error: "No pudimos guardar tu feedback. Intenta de nuevo." })
  })
})
