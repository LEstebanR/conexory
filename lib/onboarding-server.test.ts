import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockExecuteRaw = mock((...args: unknown[]) => {
  void args
  return Promise.resolve(1)
})
mock.module("@/lib/prisma", () => ({
  prisma: { $executeRaw: mockExecuteRaw },
}))

const { setOnboardingFlag } = await import("./onboarding-server")

beforeEach(() => {
  mockExecuteRaw.mockClear()
  mockExecuteRaw.mockImplementation(() => Promise.resolve(1))
})

describe("setOnboardingFlag", () => {
  test("issues a raw update merging the flag as true, only where it is still unset", async () => {
    await setOnboardingFlag("u1", "welcomeModalSeen")
    expect(mockExecuteRaw).toHaveBeenCalledTimes(1)
    const [strings, patch, userId, flag] = mockExecuteRaw.mock.calls[0] as unknown as [
      TemplateStringsArray,
      string,
      string,
      string,
    ]
    expect(patch).toBe(JSON.stringify({ welcomeModalSeen: true }))
    expect(userId).toBe("u1")
    expect(flag).toBe("welcomeModalSeen")
    expect(strings.join("?")).toContain(`COALESCE(("onboarding" ->> ?::text)::boolean, false) = false`)
  })

  test("resolves true when this write flipped the flag", async () => {
    expect(await setOnboardingFlag("u1", "firstPropertyCreated")).toBe(true)
  })

  test("resolves false when the flag was already set", async () => {
    mockExecuteRaw.mockImplementation(() => Promise.resolve(0))
    expect(await setOnboardingFlag("u1", "firstPropertyCreated")).toBe(false)
  })
})
