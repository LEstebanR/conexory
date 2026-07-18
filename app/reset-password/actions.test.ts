import { describe, test, expect, mock } from "bun:test"

const mockResetPassword = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
mock.module("@/lib/auth", () => ({
  auth: { api: { resetPassword: mockResetPassword } },
}))

// next/headers and next/navigation are mocked globally in test-setup.ts.

const { resetPasswordAction } = await import("./actions")

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

const validFields = { token: "reset-tok", password: "secret123", confirmPassword: "secret123" }

describe("resetPasswordAction", () => {
  test("returns field errors for a missing token and short password", async () => {
    const result = await resetPasswordAction(
      {},
      formData({ token: "", password: "short", confirmPassword: "short" })
    )
    expect(result.errors?.password).toBeDefined()
  })

  test("returns a confirmPassword error when passwords don't match", async () => {
    const result = await resetPasswordAction(
      {},
      formData({ ...validFields, confirmPassword: "different123" })
    )
    expect(result.errors?.confirmPassword).toMatch(/no coinciden/i)
  })

  test("resets the password and redirects to /login on success", async () => {
    await expect(resetPasswordAction({}, formData(validFields))).rejects.toThrow(
      "REDIRECT:/login?passwordReset=true"
    )
    expect(mockResetPassword).toHaveBeenCalledWith(
      expect.objectContaining({ body: { token: "reset-tok", newPassword: "secret123" } })
    )
  })

  test("returns a friendly error when the token is invalid or expired", async () => {
    mockResetPassword.mockImplementationOnce(() => Promise.reject(new Error("invalid token")))
    const result = await resetPasswordAction({}, formData(validFields))
    expect(result.error).toBe("El enlace es inválido o ha expirado. Solicita uno nuevo.")
  })
})
