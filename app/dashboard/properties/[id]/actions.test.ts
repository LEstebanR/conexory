import { describe, test, expect, mock, beforeEach } from "bun:test"

type Session = { user: { id: string; isPremium: boolean; role: string; name: string } } | null

const mockGetSession = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<Session>({
    user: { id: "u1", isPremium: true, role: "user", name: "Luis" },
  })
})
mock.module("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}))

const mockPropertyCount = mock((...args: [unknown]) => {
  void args
  return Promise.resolve(0)
})
const mockPropertyFindUnique = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<Record<string, unknown> | null>(null)
})
const mockPropertyUpdate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
const mockPropertyUpdateMany = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({ count: 1 })
})
const mockPropertyDelete = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
const mockUserFindUnique = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<{ aiMessagesUsedToday: number; aiMessagesResetAt: Date | null } | null>({
    aiMessagesUsedToday: 0,
    aiMessagesResetAt: null,
  })
})
const mockUserUpdate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})

mock.module("@/lib/prisma", () => ({
  prisma: {
    property: {
      count: mockPropertyCount,
      findUnique: mockPropertyFindUnique,
      update: mockPropertyUpdate,
      updateMany: mockPropertyUpdateMany,
      delete: mockPropertyDelete,
    },
    user: { findUnique: mockUserFindUnique, update: mockUserUpdate },
  },
}))

mock.module("next/cache", () => ({
  revalidatePath: mock((...args: [unknown]) => void args),
}))

const mockDel = mock((...args: [unknown]) => {
  void args
  return Promise.resolve()
})
// Spread the real module so unrelated exports (put, needed by
// api/upload/route.test.ts) stay real — mock.module() replaces
// "@vercel/blob" process-wide, not just for this file.
const realBlob = await import("@vercel/blob")
mock.module("@vercel/blob", () => ({ ...realBlob, del: mockDel }))

const mockSetOnboardingFlag = mock((...args: [unknown, unknown]) => {
  void args
  return Promise.resolve()
})
mock.module("@/lib/onboarding-server", () => ({
  setOnboardingFlag: mockSetOnboardingFlag,
}))

const mockGenerateShareMessageWithAI = mock((...args: [unknown, unknown, unknown, unknown]) => {
  void args
  return Promise.resolve<string | null>("Hola, te comparto esta propiedad")
})
mock.module("@/lib/share-message", () => ({
  generateShareMessage: mockGenerateShareMessageWithAI,
}))

// next/headers is mocked globally in test-setup.ts.

const {
  togglePublished,
  togglePinned,
  toggleShowContact,
  incrementShares,
  generateShareMessage,
  deleteProperty,
} = await import("./actions")

const authedSession: Session = { user: { id: "u1", isPremium: true, role: "user", name: "Luis" } }

beforeEach(() => {
  mockGetSession.mockImplementation(() => Promise.resolve(authedSession))
  mockPropertyCount.mockClear()
  mockPropertyCount.mockImplementation(() => Promise.resolve(0))
  mockPropertyFindUnique.mockImplementation(() => Promise.resolve(null))
  mockPropertyUpdate.mockClear()
  mockPropertyUpdateMany.mockImplementation(() => Promise.resolve({ count: 1 }))
  mockPropertyDelete.mockClear()
  mockUserFindUnique.mockImplementation(() =>
    Promise.resolve({ aiMessagesUsedToday: 0, aiMessagesResetAt: null })
  )
  mockUserUpdate.mockClear()
  mockDel.mockClear()
  mockSetOnboardingFlag.mockClear()
  mockGenerateShareMessageWithAI.mockClear()
  mockGenerateShareMessageWithAI.mockImplementation(() =>
    Promise.resolve("Hola, te comparto esta propiedad")
  )
})

describe("togglePublished", () => {
  test("returns an error when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    const result = await togglePublished("p1", true)
    expect(result.success).toBe(false)
  })

  test("unpublishes without checking the active-property limit", async () => {
    const result = await togglePublished("p1", false)
    expect(result.success).toBe(true)
    expect(mockPropertyCount).not.toHaveBeenCalled()
  })

  test("blocks publishing past the plan's active-property limit", async () => {
    mockGetSession.mockImplementation(() =>
      Promise.resolve({ user: { id: "u1", isPremium: false, role: "user", name: "Luis" } })
    )
    mockPropertyCount.mockImplementation(() => Promise.resolve(3))
    const result = await togglePublished("p1", true)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/límite/i)
    expect(mockPropertyUpdate).not.toHaveBeenCalled()
  })

  test("publishes when under the limit", async () => {
    mockPropertyCount.mockImplementation(() => Promise.resolve(0))
    const result = await togglePublished("p1", true)
    expect(result.success).toBe(true)
    expect(mockPropertyUpdate).toHaveBeenCalledWith({
      where: { id: "p1", userId: "u1" },
      data: { published: true },
    })
  })
})

describe("togglePinned", () => {
  test("returns an error when the property doesn't belong to the user", async () => {
    mockPropertyFindUnique.mockImplementation(() => Promise.resolve(null))
    const result = await togglePinned("p1")
    expect(result.success).toBe(false)
  })

  test("blocks pinning past the pinned limit", async () => {
    mockPropertyFindUnique.mockImplementation(() => Promise.resolve({ pinnedAt: null }))
    mockPropertyCount.mockImplementation(() => Promise.resolve(3))
    const result = await togglePinned("p1")
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/fijadas/i)
  })

  test("pins an unpinned property", async () => {
    mockPropertyFindUnique.mockImplementation(() => Promise.resolve({ pinnedAt: null }))
    mockPropertyCount.mockImplementation(() => Promise.resolve(0))
    const result = await togglePinned("p1")
    expect(result.success).toBe(true)
    const [call] = mockPropertyUpdate.mock.calls
    expect((call[0] as { data: { pinnedAt: Date | null } }).data.pinnedAt).toBeInstanceOf(Date)
  })

  test("unpins a pinned property without checking the limit", async () => {
    mockPropertyFindUnique.mockImplementation(() => Promise.resolve({ pinnedAt: new Date() }))
    const result = await togglePinned("p1")
    expect(result.success).toBe(true)
    expect(mockPropertyCount).not.toHaveBeenCalled()
    expect(mockPropertyUpdate).toHaveBeenCalledWith({
      where: { id: "p1", userId: "u1" },
      data: { pinnedAt: null },
    })
  })
})

describe("toggleShowContact", () => {
  test("throws when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    await expect(toggleShowContact("p1", true)).rejects.toThrow("No autenticado")
  })

  test("updates showContact for the owner's property", async () => {
    await toggleShowContact("p1", true)
    expect(mockPropertyUpdate).toHaveBeenCalledWith({
      where: { id: "p1", userId: "u1" },
      data: { showContact: true },
    })
  })
})

describe("incrementShares", () => {
  test("does nothing when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    await incrementShares("p1")
    expect(mockPropertyUpdateMany).not.toHaveBeenCalled()
  })

  test("increments the share counter and sets the onboarding flag", async () => {
    await incrementShares("p1")
    expect(mockPropertyUpdateMany).toHaveBeenCalledWith({
      where: { id: "p1", userId: "u1" },
      data: { shares: { increment: 1 } },
    })
    expect(mockSetOnboardingFlag).toHaveBeenCalledWith("u1", "firstPropertyShared")
  })

  test("doesn't set the onboarding flag when the property isn't the user's", async () => {
    mockPropertyUpdateMany.mockImplementation(() => Promise.resolve({ count: 0 }))
    await incrementShares("p1")
    expect(mockSetOnboardingFlag).not.toHaveBeenCalled()
  })
})

describe("generateShareMessage", () => {
  const input = { propertyId: "p1", kind: "intro" }

  test("returns an error when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    const result = await generateShareMessage(input)
    expect("error" in result).toBe(true)
  })

  test("requires Pro access", async () => {
    mockGetSession.mockImplementation(() =>
      Promise.resolve({ user: { id: "u1", isPremium: false, role: "user", name: "Luis" } })
    )
    const result = await generateShareMessage(input)
    expect("error" in result && result.error).toMatch(/Pro/)
  })

  test("rejects an invalid kind", async () => {
    const result = await generateShareMessage({ propertyId: "p1", kind: "not-a-real-kind" })
    expect("error" in result && result.error).toBe("Solicitud inválida")
  })

  test("blocks generation once the daily limit is reached (non-admin)", async () => {
    mockUserFindUnique.mockImplementation(() =>
      Promise.resolve({ aiMessagesUsedToday: 10, aiMessagesResetAt: new Date() })
    )
    const result = await generateShareMessage(input)
    expect("error" in result && result.error).toMatch(/límite/i)
    expect(mockGenerateShareMessageWithAI).not.toHaveBeenCalled()
  })

  test("resets the counter once a new UTC day starts", async () => {
    const yesterday = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    mockUserFindUnique.mockImplementation(() =>
      Promise.resolve({ aiMessagesUsedToday: 10, aiMessagesResetAt: yesterday })
    )
    mockPropertyFindUnique.mockImplementation(() => Promise.resolve({ id: "p1", title: "Casa" }))
    mockUserUpdate.mockClear()
    const result = await generateShareMessage(input)
    expect("message" in result).toBe(true)
    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ aiMessagesUsedToday: 1 }) })
    )
  })

  test("returns an error when the property isn't found", async () => {
    mockPropertyFindUnique.mockImplementation(() => Promise.resolve(null))
    const result = await generateShareMessage(input)
    expect("error" in result && result.error).toBe("Propiedad no encontrada")
  })

  test("returns a fallback message when the AI call fails", async () => {
    mockPropertyFindUnique.mockImplementation(() => Promise.resolve({ id: "p1", title: "Casa" }))
    mockGenerateShareMessageWithAI.mockImplementation(() => Promise.resolve(null))
    const result = await generateShareMessage(input)
    expect("error" in result).toBe(true)
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  test("generates a message, increments the counter, and returns usedToday/limit", async () => {
    mockPropertyFindUnique.mockImplementation(() => Promise.resolve({ id: "p1", title: "Casa" }))
    mockUserFindUnique.mockImplementation(() =>
      Promise.resolve({ aiMessagesUsedToday: 2, aiMessagesResetAt: new Date() })
    )
    const result = await generateShareMessage(input)
    expect("message" in result && result.message).toBe("Hola, te comparto esta propiedad")
    expect("usedToday" in result && result.usedToday).toBe(3)
    expect("limit" in result && result.limit).toBe(10)
  })

  test("bypasses the limit and doesn't track usage for an admin", async () => {
    mockGetSession.mockImplementation(() =>
      Promise.resolve({ user: { id: "u1", isPremium: false, role: "admin", name: "Luis" } })
    )
    mockPropertyFindUnique.mockImplementation(() => Promise.resolve({ id: "p1", title: "Casa" }))
    mockUserUpdate.mockClear()
    const result = await generateShareMessage(input)
    expect("message" in result).toBe(true)
    expect("usedToday" in result).toBe(false)
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  test("catches an unexpected exception and returns a generic error", async () => {
    mockPropertyFindUnique.mockImplementation(() => {
      throw new Error("db down")
    })
    const result = await generateShareMessage(input)
    expect("error" in result).toBe(true)
  })
})

describe("deleteProperty", () => {
  test("throws when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    await expect(deleteProperty("p1")).rejects.toThrow("No autenticado")
  })

  test("throws when the property isn't the user's", async () => {
    mockPropertyFindUnique.mockImplementation(() => Promise.resolve(null))
    await expect(deleteProperty("p1")).rejects.toThrow("Propiedad no encontrada")
  })

  test("deletes blob images before deleting the property", async () => {
    mockPropertyFindUnique.mockImplementation(() =>
      Promise.resolve({ images: ["https://blob.example.com/a.jpg"] })
    )
    await deleteProperty("p1")
    expect(mockDel).toHaveBeenCalledWith(["https://blob.example.com/a.jpg"])
    expect(mockPropertyDelete).toHaveBeenCalledWith({ where: { id: "p1", userId: "u1" } })
  })

  test("skips the blob deletion when there are no images", async () => {
    mockPropertyFindUnique.mockImplementation(() => Promise.resolve({ images: [] }))
    mockDel.mockClear()
    await deleteProperty("p1")
    expect(mockDel).not.toHaveBeenCalled()
    expect(mockPropertyDelete).toHaveBeenCalled()
  })
})
