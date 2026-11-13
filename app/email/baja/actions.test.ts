import { describe, test, expect, mock, beforeEach } from "bun:test"
import { unsubscribeToken } from "@/lib/unsubscribe"

const mockUserUpdateMany = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({ count: 1 })
})
mock.module("@/lib/prisma", () => ({
  prisma: { user: { updateMany: mockUserUpdateMany } },
}))

// next/navigation is mocked globally in test-setup.ts: redirect() throws REDIRECT:<path>
const { unsubscribe } = await import("./actions")

function form(token?: string): FormData {
  const data = new FormData()
  if (token !== undefined) data.set("token", token)
  return data
}

beforeEach(() => {
  mockUserUpdateMany.mockClear()
})

describe("unsubscribe action", () => {
  test("opts the user out and shows the confirmation", async () => {
    await expect(unsubscribe(form(unsubscribeToken("u1")))).rejects.toThrow("REDIRECT:/email/baja?listo=1")
    expect(mockUserUpdateMany).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { lifecycleEmailsOptOut: true },
    })
  })

  test("sends an invalid or missing token back to the page without opting anyone out", async () => {
    await expect(unsubscribe(form("u1.forged"))).rejects.toThrow("REDIRECT:/email/baja")
    await expect(unsubscribe(form())).rejects.toThrow("REDIRECT:/email/baja")
    expect(mockUserUpdateMany).not.toHaveBeenCalled()
  })
})
