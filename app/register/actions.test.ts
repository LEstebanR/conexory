import { describe, test, expect, mock } from "bun:test"
import { APIError } from "better-auth/api"

const mockSignUpEmail = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
mock.module("@/lib/auth", () => ({
  auth: { api: { signUpEmail: mockSignUpEmail } },
}))

const mockUserFindUnique = mock((args: { where: { email?: string; agentSlug?: string } }) => {
  if (args.where.email) return Promise.resolve<{ id: string } | null>({ id: "new-user" })
  return Promise.resolve<{ id: string } | null>(null)
})
const mockUserUpdate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
mock.module("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mockUserFindUnique, update: mockUserUpdate } },
}))

const mockGenerateAgentSlug = mock((...args: [string, unknown]) => {
  void args
  return Promise.resolve("luis-ramirez")
})
mock.module("@/lib/agent-slug", () => ({
  generateAgentSlug: mockGenerateAgentSlug,
}))

// next/headers and next/navigation are mocked globally in test-setup.ts.

const { registerAction } = await import("./actions")

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

const validFields = {
  name: "Luis Ramirez",
  email: "luis@example.com",
  password: "secret123",
  confirmPassword: "secret123",
  terms: "on",
}

describe("registerAction", () => {
  test("returns field errors for invalid input", async () => {
    const result = await registerAction(
      {},
      formData({ ...validFields, name: "", password: "short", confirmPassword: "short", terms: "" })
    )
    expect(result.errors?.name).toBeDefined()
    expect(result.errors?.password).toBeDefined()
    expect(result.errors?.terms).toBeDefined()
  })

  test("returns a confirmPassword error when passwords don't match", async () => {
    const result = await registerAction(
      {},
      formData({ ...validFields, confirmPassword: "different123" })
    )
    expect(result.errors?.confirmPassword).toMatch(/no coinciden/i)
  })

  test("signs up, generates an agent slug, and redirects to /dashboard", async () => {
    mockUserUpdate.mockClear()
    await expect(registerAction({}, formData(validFields))).rejects.toThrow("REDIRECT:/dashboard")
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "new-user" },
      data: { agentSlug: "luis-ramirez" },
    })
  })

  test("links referredById when a valid ref slug is provided", async () => {
    mockUserFindUnique.mockImplementation((args) => {
      if (args.where.email) return Promise.resolve({ id: "new-user" })
      if (args.where.agentSlug === "referrer-slug") return Promise.resolve({ id: "referrer-id" })
      return Promise.resolve(null)
    })
    mockUserUpdate.mockClear()
    await expect(
      registerAction({}, formData({ ...validFields, ref: "referrer-slug" }))
    ).rejects.toThrow("REDIRECT:/dashboard")
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "new-user" },
      data: { agentSlug: "luis-ramirez", referredById: "referrer-id" },
    })
    mockUserFindUnique.mockImplementation((args) => {
      if (args.where.email) return Promise.resolve({ id: "new-user" })
      return Promise.resolve(null)
    })
  })

  test("ignores an unknown ref slug without failing", async () => {
    mockUserUpdate.mockClear()
    await expect(
      registerAction({}, formData({ ...validFields, ref: "does-not-exist" }))
    ).rejects.toThrow("REDIRECT:/dashboard")
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "new-user" },
      data: { agentSlug: "luis-ramirez" },
    })
  })

  test("maps EMAIL_ALREADY_EXISTS to a friendly message", async () => {
    mockSignUpEmail.mockImplementationOnce(() =>
      Promise.reject(new APIError("UNPROCESSABLE_ENTITY", { code: "EMAIL_ALREADY_EXISTS" }))
    )
    const result = await registerAction({}, formData(validFields))
    expect(result.error).toMatch(/ya existe una cuenta/i)
  })

  test("re-throws errors that aren't an APIError", async () => {
    mockSignUpEmail.mockImplementationOnce(() => Promise.reject(new Error("network down")))
    await expect(registerAction({}, formData(validFields))).rejects.toThrow("network down")
  })
})
