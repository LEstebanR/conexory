import { describe, test, expect, mock } from "bun:test"
import { APIError } from "better-auth/api"

const mockSignInEmail = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
mock.module("@/lib/auth", () => ({
  auth: { api: { signInEmail: mockSignInEmail } },
}))

// next/headers and next/navigation are mocked globally in test-setup.ts —
// redirect() throws Error("REDIRECT:<path>") so it's assertable.

const { loginAction } = await import("./actions")

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

const validFields = { email: "agent@example.com", password: "secret123" }

describe("loginAction", () => {
  test("returns field errors for an invalid email and empty password", async () => {
    const result = await loginAction({}, formData({ email: "not-an-email", password: "" }))
    expect(result.errors?.email).toBeDefined()
    expect(result.errors?.password).toBeDefined()
  })

  test("redirects to /dashboard on success by default", async () => {
    await expect(loginAction({}, formData(validFields))).rejects.toThrow("REDIRECT:/dashboard")
  })

  test("redirects to a safe relative redirect param", async () => {
    const fd = formData({ ...validFields, redirect: "/dashboard/upgrade" })
    await expect(loginAction({}, fd)).rejects.toThrow("REDIRECT:/dashboard/upgrade")
  })

  test("ignores an absolute/external redirect param (open-redirect guard)", async () => {
    const fd = formData({ ...validFields, redirect: "https://evil.com" })
    await expect(loginAction({}, fd)).rejects.toThrow("REDIRECT:/dashboard")
  })

  test("maps a known APIError code to a friendly message", async () => {
    mockSignInEmail.mockImplementationOnce(() =>
      Promise.reject(new APIError("UNAUTHORIZED", { code: "INVALID_EMAIL_OR_PASSWORD" }))
    )
    const result = await loginAction({}, formData(validFields))
    expect(result.error).toBe("Email o contraseña incorrectos.")
  })

  test("maps EMAIL_NOT_VERIFIED to its specific message", async () => {
    mockSignInEmail.mockImplementationOnce(() =>
      Promise.reject(new APIError("FORBIDDEN", { code: "EMAIL_NOT_VERIFIED" }))
    )
    const result = await loginAction({}, formData(validFields))
    expect(result.error).toBe("Verifica tu email antes de continuar.")
  })

  test("falls back to a generic message for an unrecognized APIError code", async () => {
    mockSignInEmail.mockImplementationOnce(() =>
      Promise.reject(new APIError("BAD_REQUEST", { code: "SOME_FUTURE_CODE" }))
    )
    const result = await loginAction({}, formData(validFields))
    expect(result.error).toBe("Email o contraseña incorrectos.")
  })

  test("re-throws errors that aren't an APIError", async () => {
    mockSignInEmail.mockImplementationOnce(() => Promise.reject(new Error("network down")))
    await expect(loginAction({}, formData(validFields))).rejects.toThrow("network down")
  })
})
