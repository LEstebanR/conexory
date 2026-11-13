import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

const constructorCalls: unknown[][] = []

class FakePostHog {
  constructor(...args: unknown[]) {
    constructorCalls.push(args)
  }
}

mock.module("posthog-node", () => ({ PostHog: FakePostHog }))

const { getPostHogServer, resetPostHogServerForTests } = await import("./posthog-server")

const originalKey = process.env.NEXT_PUBLIC_POSTHOG_KEY

beforeEach(() => {
  process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test"
  resetPostHogServerForTests()
  constructorCalls.length = 0
})

afterAll(() => {
  if (originalKey === undefined) delete process.env.NEXT_PUBLIC_POSTHOG_KEY
  else process.env.NEXT_PUBLIC_POSTHOG_KEY = originalKey
  resetPostHogServerForTests()
})

describe("getPostHogServer", () => {
  test("returns null without loading the SDK when there is no key", async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = ""

    expect(await getPostHogServer()).toBeNull()
    expect(constructorCalls).toHaveLength(0)
  })

  test("creates a single unbatched client pointed at PostHog", async () => {
    const first = await getPostHogServer()
    const second = await getPostHogServer()

    expect(first).toBeInstanceOf(FakePostHog)
    expect(second).toBe(first)
    expect(constructorCalls).toEqual([["phc_test", { host: "https://us.i.posthog.com", flushAt: 1, flushInterval: 0 }]])
  })
})
