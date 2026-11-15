import { describe, test, expect, mock, beforeEach, afterAll, spyOn } from "bun:test"
import * as mercadopago from "@/lib/mercadopago"
import * as reportErrorModule from "@/lib/report-error"

type Session = { user: { id: string; name: string; email: string } } | null

const defaultSession = { user: { id: "u1", name: "Luis Ramirez", email: "Luis@Example.com" } }

const mockGetSession = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<Session>(defaultSession)
})
const mockSignOut = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({ success: true })
})
mock.module("@/lib/auth", () => ({
  getSession: mockGetSession,
  auth: { api: { signOut: mockSignOut } },
}))

const mockUserFindUnique = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<Record<string, unknown> | null>({
    profilePublished: false,
    agentSlug: "luis-ramirez",
  })
})
const mockUserUpdate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
const mockUserDelete = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
const mockSubscriptionFindUnique = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<{ mpPreapprovalId: string | null; status: string } | null>(null)
})
mock.module("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mockUserFindUnique, update: mockUserUpdate, delete: mockUserDelete },
    subscription: { findUnique: mockSubscriptionFindUnique },
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
const mockList = mock((...args: [{ prefix: string }]) => {
  void args
  return Promise.resolve<{ blobs: { url: string }[] }>({ blobs: [] })
})
mock.module("@vercel/blob", () => ({ ...realBlob, del: mockDel, list: mockList }))

const mockCancelPreapproval = spyOn(mercadopago, "cancelPreapproval").mockImplementation(() =>
  Promise.resolve({ ok: true }),
)
const mockReportError = spyOn(reportErrorModule, "reportError").mockImplementation(() => Promise.resolve())

// Spies patch the shared module objects, so restore them or every later test
// file sees the stubs instead of the real implementations.
afterAll(() => {
  mockCancelPreapproval.mockRestore()
  mockReportError.mockRestore()
})

// @/lib/agent-slug runs for real (already directly tested, pure/DI-based,
// and safe to exercise through the mocked prisma above) — next/headers is
// mocked globally in test-setup.ts.

const {
  updateProfile,
  updateBrandColor,
  toggleProfilePublished,
  deleteAccount,
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
  mockGetSession.mockImplementation(() => Promise.resolve(defaultSession))
  mockUserFindUnique.mockImplementation(() =>
    Promise.resolve({
        profilePublished: false,
      agentSlug: "luis-ramirez",
    })
  )
  mockUserUpdate.mockClear()
  mockDel.mockClear()
  mockDel.mockImplementation(() => Promise.resolve())
  mockList.mockClear()
  mockList.mockImplementation(() => Promise.resolve({ blobs: [] }))
  mockUserDelete.mockClear()
  mockUserDelete.mockImplementation(() => Promise.resolve({}))
  mockSubscriptionFindUnique.mockImplementation(() => Promise.resolve(null))
  mockCancelPreapproval.mockClear()
  mockCancelPreapproval.mockImplementation(() => Promise.resolve({ ok: true }))
  mockReportError.mockClear()
  mockSignOut.mockClear()
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

  test("stores only the handle when the agent pastes a full profile URL", async () => {
    const result = await updateProfile(
      {},
      formData({
        ...validProfileFields,
        instagram: "https://www.instagram.com/cs.inversiones?rpxt=dm44",
        tiktok: "https://www.tiktok.com/@cs.inversiones",
        facebook: "",
      })
    )
    expect(result.success).toBe(true)
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: expect.objectContaining({ instagram: "cs.inversiones", tiktok: "cs.inversiones", facebook: null }),
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

describe("deleteAccount", () => {
  const ownedUser = {
    image: "https://abc.public.blob.vercel-storage.com/avatar.jpg",
    properties: [
      { id: "p1", images: ["https://abc.public.blob.vercel-storage.com/p1-a.jpg"] },
      { id: "p2", images: ["https://abc.public.blob.vercel-storage.com/p2-a.jpg", "https://example.com/external.jpg"] },
    ],
  }

  beforeEach(() => {
    mockUserFindUnique.mockImplementation(() => Promise.resolve(ownedUser))
  })

  function confirm(email = "luis@example.com") {
    return deleteAccount({}, formData({ confirmEmail: email }))
  }

  test("returns an error when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    const result = await confirm()
    expect(result.error).toBeDefined()
    expect(mockUserDelete).not.toHaveBeenCalled()
  })

  test("rejects a confirmation email that doesn't match the account", async () => {
    const result = await confirm("otro@example.com")
    expect(result.error).toBe("El email no coincide con el de tu cuenta.")
    expect(mockUserDelete).not.toHaveBeenCalled()
    expect(mockDel).not.toHaveBeenCalled()
  })

  test("deletes a Free account: blobs, user, session, then redirects to the landing", async () => {
    mockList.mockImplementation(({ prefix }) =>
      Promise.resolve({ blobs: prefix === "flyer/p1-" ? [{ url: "https://abc.public.blob.vercel-storage.com/flyer/p1-1.jpg" }] : [] }),
    )

    await expect(confirm("  LUIS@example.com ")).rejects.toThrow("REDIRECT:/?cuenta=eliminada")

    expect(mockCancelPreapproval).not.toHaveBeenCalled()
    expect(mockDel).toHaveBeenCalledWith([
      "https://abc.public.blob.vercel-storage.com/p1-a.jpg",
      "https://abc.public.blob.vercel-storage.com/p2-a.jpg",
      "https://abc.public.blob.vercel-storage.com/avatar.jpg",
      "https://abc.public.blob.vercel-storage.com/flyer/p1-1.jpg",
    ])
    expect(mockUserDelete).toHaveBeenCalledWith({ where: { id: "u1" } })
    expect(mockSignOut).toHaveBeenCalled()
  })

  test("cancels an active Pro preapproval before deleting", async () => {
    mockSubscriptionFindUnique.mockImplementation(() =>
      Promise.resolve({ mpPreapprovalId: "pre-1", status: "active" }),
    )
    await expect(confirm()).rejects.toThrow("REDIRECT:/?cuenta=eliminada")
    expect(mockCancelPreapproval).toHaveBeenCalledWith("pre-1")
    expect(mockUserDelete).toHaveBeenCalled()
  })

  test("doesn't call Mercado Pago for a subscription that is already canceling", async () => {
    mockSubscriptionFindUnique.mockImplementation(() =>
      Promise.resolve({ mpPreapprovalId: "pre-1", status: "canceling" }),
    )
    await expect(confirm()).rejects.toThrow("REDIRECT:/?cuenta=eliminada")
    expect(mockCancelPreapproval).not.toHaveBeenCalled()
    expect(mockUserDelete).toHaveBeenCalled()
  })

  test("aborts without deleting anything when Mercado Pago cancellation fails", async () => {
    mockSubscriptionFindUnique.mockImplementation(() =>
      Promise.resolve({ mpPreapprovalId: "pre-1", status: "past_due" }),
    )
    mockCancelPreapproval.mockImplementation(() => Promise.resolve({ ok: false, error: "http_500" }))

    const result = await confirm()

    expect(result.error).toContain("no eliminamos tu cuenta")
    expect(mockReportError).toHaveBeenCalled()
    expect(mockDel).not.toHaveBeenCalled()
    expect(mockUserDelete).not.toHaveBeenCalled()
    expect(mockSignOut).not.toHaveBeenCalled()
  })

  test("still deletes the account when Blob cleanup fails, and reports it", async () => {
    mockDel.mockImplementation(() => Promise.reject(new Error("blob down")))
    await expect(confirm()).rejects.toThrow("REDIRECT:/?cuenta=eliminada")
    expect(mockReportError).toHaveBeenCalledWith("deleteAccount: Blob cleanup failed", expect.any(Error), { userId: "u1", blobCount: 3 })
    expect(mockUserDelete).toHaveBeenCalled()
  })

  test("still deletes photos when listing flyers fails", async () => {
    mockList.mockImplementation(() => Promise.reject(new Error("list down")))
    await expect(confirm()).rejects.toThrow("REDIRECT:/?cuenta=eliminada")
    expect(mockReportError).toHaveBeenCalledWith("deleteAccount: listing flyer blobs failed", expect.any(Error), { userId: "u1" })
    expect(mockDel).toHaveBeenCalledWith(expect.arrayContaining(["https://abc.public.blob.vercel-storage.com/avatar.jpg"]))
  })

  test("keeps blobs and the session when the user delete fails", async () => {
    mockUserDelete.mockImplementation(() => Promise.reject(new Error("db down")))
    const result = await confirm()
    expect(result.error).toBeDefined()
    expect(mockReportError).toHaveBeenCalled()
    expect(mockDel).not.toHaveBeenCalled()
    expect(mockSignOut).not.toHaveBeenCalled()
  })
})
