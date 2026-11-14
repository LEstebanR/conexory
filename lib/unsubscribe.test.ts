import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockUserUpdateMany = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({ count: 1 })
})
mock.module("@/lib/prisma", () => ({
  prisma: { user: { updateMany: mockUserUpdateMany } },
}))

const {
  unsubscribeToken,
  verifyUnsubscribeToken,
  unsubscribePageUrl,
  oneClickUnsubscribeUrl,
  optOutOfLifecycleEmails,
} = await import("./unsubscribe")

beforeEach(() => {
  mockUserUpdateMany.mockClear()
})

describe("unsubscribe tokens", () => {
  test("a minted token verifies back to its user", () => {
    expect(verifyUnsubscribeToken(unsubscribeToken("user-1"))).toBe("user-1")
  })

  test("rejects a token whose signature was tampered with", () => {
    const token = unsubscribeToken("user-1")
    const tampered = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A")
    expect(verifyUnsubscribeToken(tampered)).toBeNull()
  })

  test("rejects another user's signature swapped onto a different id", () => {
    const signature = unsubscribeToken("user-1").split(".")[1]
    expect(verifyUnsubscribeToken(`user-2.${signature}`)).toBeNull()
  })

  test("rejects malformed tokens", () => {
    expect(verifyUnsubscribeToken("")).toBeNull()
    expect(verifyUnsubscribeToken("no-separator")).toBeNull()
    expect(verifyUnsubscribeToken(".signature-only")).toBeNull()
    expect(verifyUnsubscribeToken("user-1.short")).toBeNull()
  })

  test("signing fails loudly without a secret", () => {
    const secret = process.env.BETTER_AUTH_SECRET
    delete process.env.BETTER_AUTH_SECRET
    try {
      expect(() => unsubscribeToken("user-1")).toThrow(/BETTER_AUTH_SECRET/)
    } finally {
      process.env.BETTER_AUTH_SECRET = secret
    }
  })
})

describe("unsubscribe URLs", () => {
  test("point at the confirmation page and the one-click endpoint with an encoded token", () => {
    const token = encodeURIComponent(unsubscribeToken("user-1"))
    expect(unsubscribePageUrl("user-1")).toEndWith(`/email/baja?token=${token}`)
    expect(oneClickUnsubscribeUrl("user-1")).toEndWith(`/api/email/unsubscribe?token=${token}`)
  })
})

describe("optOutOfLifecycleEmails", () => {
  test("sets the opt-out flag without failing for a deleted user", async () => {
    mockUserUpdateMany.mockImplementationOnce(() => Promise.resolve({ count: 0 }))
    await optOutOfLifecycleEmails("ghost")
    expect(mockUserUpdateMany).toHaveBeenCalledWith({
      where: { id: "ghost" },
      data: { lifecycleEmailsOptOut: true },
    })
  })
})
