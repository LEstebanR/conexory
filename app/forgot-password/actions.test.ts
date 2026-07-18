import { describe, test, expect, mock } from "bun:test"

const mockRequestPasswordReset = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
mock.module("@/lib/auth", () => ({
  auth: { api: { requestPasswordReset: mockRequestPasswordReset } },
}))

// next/headers is mocked globally in test-setup.ts.

const { forgotPasswordAction } = await import("./actions")

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

describe("forgotPasswordAction", () => {
  test("returns a field error for an invalid email", async () => {
    const result = await forgotPasswordAction({}, formData({ email: "not-an-email" }))
    expect(result.errors?.email).toBeDefined()
    expect(result.success).toBeUndefined()
  })

  test("returns success and requests the reset with the reset-password redirect", async () => {
    const result = await forgotPasswordAction({}, formData({ email: "agent@example.com" }))
    expect(result.success).toBe(true)
    expect(mockRequestPasswordReset).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { email: "agent@example.com", redirectTo: "/reset-password" },
      })
    )
  })

  test("returns a generic error message if the request fails (never leaks enumeration info)", async () => {
    mockRequestPasswordReset.mockImplementationOnce(() => Promise.reject(new Error("smtp down")))
    const result = await forgotPasswordAction({}, formData({ email: "agent@example.com" }))
    expect(result.error).toBe("No se pudo enviar el correo. Inténtalo de nuevo.")
    expect(result.success).toBeUndefined()
  })
})
