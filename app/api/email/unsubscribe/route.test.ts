import { describe, test, expect, mock, beforeEach } from "bun:test"
import { unsubscribeToken } from "@/lib/unsubscribe"

const mockUserUpdateMany = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({ count: 1 })
})
mock.module("@/lib/prisma", () => ({
  prisma: { user: { updateMany: mockUserUpdateMany } },
}))

const { POST } = await import("./route")

function post(token?: string): Request {
  const query = token === undefined ? "" : `?token=${encodeURIComponent(token)}`
  return new Request(`https://conexory.com/api/email/unsubscribe${query}`, { method: "POST" })
}

beforeEach(() => {
  mockUserUpdateMany.mockClear()
})

describe("POST /api/email/unsubscribe", () => {
  test("opts the user out with a valid one-click token", async () => {
    const res = await POST(post(unsubscribeToken("u1")))
    expect(res.status).toBe(200)
    expect(mockUserUpdateMany).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { lifecycleEmailsOptOut: true },
    })
  })

  test("rejects a forged or missing token", async () => {
    expect((await POST(post("u1.forged"))).status).toBe(400)
    expect((await POST(post())).status).toBe(400)
    expect(mockUserUpdateMany).not.toHaveBeenCalled()
  })
})
