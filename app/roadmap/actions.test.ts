import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockSuggestionCreate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
mock.module("@/lib/prisma", () => ({
  prisma: { suggestion: { create: mockSuggestionCreate } },
}))

const mockSendSuggestionNotification = mock((...args: [unknown, unknown]) => {
  void args
  return Promise.resolve()
})
// Spread the real module so unrelated exports (used by the wompi webhook and
// billing cron tests) stay real — mock.module() replaces "@/lib/email"
// process-wide, not just for this file.
const realEmail = await import("@/lib/email")
mock.module("@/lib/email", () => ({
  ...realEmail,
  sendSuggestionNotification: mockSendSuggestionNotification,
}))

const { submitSuggestion } = await import("./actions")

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

beforeEach(() => {
  mockSuggestionCreate.mockClear()
  mockSuggestionCreate.mockImplementation(() => Promise.resolve({}))
  mockSendSuggestionNotification.mockClear()
})

describe("submitSuggestion", () => {
  test("returns a field error when the content is too short", async () => {
    const result = await submitSuggestion(null, formData({ content: "too short" }))
    expect(result?.error).toBeDefined()
    expect(mockSuggestionCreate).not.toHaveBeenCalled()
  })

  test("returns a field error for an invalid email", async () => {
    const result = await submitSuggestion(
      null,
      formData({ content: "Deberían agregar modo oscuro", email: "not-an-email" })
    )
    expect(result?.error).toBeDefined()
  })

  test("saves the suggestion and notifies the team", async () => {
    const result = await submitSuggestion(
      null,
      formData({ content: "Deberían agregar modo oscuro", email: "user@example.com" })
    )
    expect(result).toEqual({ success: true })
    expect(mockSuggestionCreate).toHaveBeenCalledWith({
      data: { content: "Deberían agregar modo oscuro", email: "user@example.com" },
    })
    expect(mockSendSuggestionNotification).toHaveBeenCalledWith(
      "Deberían agregar modo oscuro",
      "user@example.com"
    )
  })

  test("stores a null email when none is provided", async () => {
    await submitSuggestion(null, formData({ content: "Deberían agregar modo oscuro" }))
    expect(mockSuggestionCreate).toHaveBeenCalledWith({
      data: { content: "Deberían agregar modo oscuro", email: null },
    })
  })

  test("returns an error if saving fails", async () => {
    mockSuggestionCreate.mockImplementation(() => Promise.reject(new Error("db down")))
    const result = await submitSuggestion(null, formData({ content: "Deberían agregar modo oscuro" }))
    expect(result?.error).toBe("No pudimos guardar tu sugerencia. Intenta de nuevo.")
  })

  test("still succeeds even if the notification email fails", async () => {
    mockSendSuggestionNotification.mockImplementation(() => Promise.reject(new Error("resend down")))
    const result = await submitSuggestion(null, formData({ content: "Deberían agregar modo oscuro" }))
    expect(result).toEqual({ success: true })
  })
})
