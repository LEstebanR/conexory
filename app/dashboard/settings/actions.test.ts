import { describe, test, expect, mock, beforeEach } from "bun:test"

type Session = { user: { id: string; name: string } } | null

const mockGetSession = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<Session>({ user: { id: "u1", name: "Luis Ramirez" } })
})
mock.module("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}))

const mockUserFindUnique = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<Record<string, unknown> | null>({
    onboarding: { settingsTourCompleted: false },
    profilePublished: false,
    agentSlug: "luis-ramirez",
  })
})
const mockUserUpdate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
mock.module("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mockUserFindUnique, update: mockUserUpdate } },
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

// @/lib/onboarding and @/lib/agent-slug run for real (both are already
// directly tested, pure/DI-based, and safe to exercise through the mocked
// prisma above) — next/headers is mocked globally in test-setup.ts.

const {
  isSettingsTourPending,
  completeSettingsTour,
  updateProfile,
  updateBrandColor,
  toggleProfilePublished,
} = await import("./actions")

const validProfileFields = {
  name: "Luis Ramirez",
  brandColor: "#0a0a0a",
}

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

beforeEach(() => {
  mockGetSession.mockImplementation(() =>
    Promise.resolve({ user: { id: "u1", name: "Luis Ramirez" } })
  )
  mockUserFindUnique.mockImplementation(() =>
    Promise.resolve({
      onboarding: { settingsTourCompleted: false },
      profilePublished: false,
      agentSlug: "luis-ramirez",
    })
  )
  mockUserUpdate.mockClear()
  mockDel.mockClear()
  mockSetOnboardingFlag.mockClear()
})

describe("isSettingsTourPending / completeSettingsTour", () => {
  test("isSettingsTourPending returns false when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    expect(await isSettingsTourPending()).toBe(false)
  })

  test("isSettingsTourPending reflects the real onboarding flag", async () => {
    expect(await isSettingsTourPending()).toBe(true)
    mockUserFindUnique.mockImplementation(() =>
      Promise.resolve({ onboarding: { settingsTourCompleted: true } })
    )
    expect(await isSettingsTourPending()).toBe(false)
  })

  test("completeSettingsTour does nothing when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    await completeSettingsTour()
    expect(mockSetOnboardingFlag).not.toHaveBeenCalled()
  })

  test("completeSettingsTour sets the flag", async () => {
    await completeSettingsTour()
    expect(mockSetOnboardingFlag).toHaveBeenCalledWith("u1", "settingsTourCompleted")
  })
})

describe("updateProfile", () => {
  test("returns an error when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    const result = await updateProfile({}, formData(validProfileFields))
    expect(result.error).toBeDefined()
  })

  test("rejects an invalid brand color", async () => {
    const result = await updateProfile({}, formData({ ...validProfileFields, brandColor: "not-a-color" }))
    expect(result.error).toBeDefined()
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  test("updates the profile with normalized social handles (strips leading @)", async () => {
    const result = await updateProfile(
      {},
      formData({ ...validProfileFields, instagram: "@lestebanr" })
    )
    expect(result.success).toBe(true)
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: expect.objectContaining({ instagram: "lestebanr" }),
    })
  })

  test("deletes the old blob image when it's replaced with a new one", async () => {
    await updateProfile(
      {},
      formData({
        ...validProfileFields,
        image: "https://blob.vercel-storage.com/new.jpg",
        previousImage: "https://blob.vercel-storage.com/old.jpg",
      })
    )
    expect(mockDel).toHaveBeenCalledWith("https://blob.vercel-storage.com/old.jpg")
  })

  test("doesn't delete the previous image when it's unchanged", async () => {
    await updateProfile(
      {},
      formData({
        ...validProfileFields,
        image: "https://blob.vercel-storage.com/same.jpg",
        previousImage: "https://blob.vercel-storage.com/same.jpg",
      })
    )
    expect(mockDel).not.toHaveBeenCalled()
  })
})

describe("updateBrandColor", () => {
  test("returns an error when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    const result = await updateBrandColor("#123456")
    expect(result.error).toBeDefined()
  })

  test("rejects an invalid color", async () => {
    const result = await updateBrandColor("blue")
    expect(result.error).toBe("Color inválido.")
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  test("updates a valid color", async () => {
    const result = await updateBrandColor("#123456")
    expect(result.error).toBeUndefined()
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { brandColor: "#123456" },
    })
  })
})

describe("toggleProfilePublished", () => {
  test("does nothing when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    await toggleProfilePublished()
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  test("flips profilePublished from false to true and ensures an agent slug", async () => {
    mockUserFindUnique.mockImplementation(() =>
      Promise.resolve({ profilePublished: false, agentSlug: "luis-ramirez" })
    )
    await toggleProfilePublished()
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { profilePublished: true },
    })
  })

  test("generates a slug when the user doesn't have one yet", async () => {
    mockUserFindUnique.mockImplementation((args: unknown) => {
      const where = (args as { where: { id?: string; agentSlug?: string } }).where
      // ensureAgentSlug's own lookup (by id): no slug yet.
      if (where.id) return Promise.resolve({ agentSlug: null, profilePublished: false })
      // generateAgentSlug's collision check (by agentSlug): nothing taken.
      return Promise.resolve(null)
    })
    await toggleProfilePublished()
    const slugUpdateCall = mockUserUpdate.mock.calls.find(
      (call) => "agentSlug" in (call[0] as { data: Record<string, unknown> }).data
    )
    expect(slugUpdateCall).toBeDefined()
  })
})
