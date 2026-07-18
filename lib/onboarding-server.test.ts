import { describe, test, expect, mock } from "bun:test"

const mockExecuteRaw = mock((...args: unknown[]) => {
  void args
  return Promise.resolve(1)
})
mock.module("@/lib/prisma", () => ({
  prisma: { $executeRaw: mockExecuteRaw },
}))

const { setOnboardingFlag } = await import("./onboarding-server")

describe("setOnboardingFlag", () => {
  test("issues a raw update merging the flag as true into the onboarding JSONB", async () => {
    mockExecuteRaw.mockClear()
    await setOnboardingFlag("u1", "welcomeModalSeen")
    expect(mockExecuteRaw).toHaveBeenCalledTimes(1)
    const [, patch, userId] = mockExecuteRaw.mock.calls[0] as unknown as [unknown, string, string]
    expect(patch).toBe(JSON.stringify({ welcomeModalSeen: true }))
    expect(userId).toBe("u1")
  })
})
