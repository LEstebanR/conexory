import { afterEach, beforeEach, describe, expect, mock, setSystemTime, spyOn, test } from "bun:test"
import { IncrementalCache } from "next/dist/server/lib/incremental-cache"
import { nodeFs } from "next/dist/server/lib/node-fs-methods"
import { mockRevalidateTag } from "@/test-setup"

const property = {
  id: "featured-1",
  slug: "featured-apartment",
  title: "Apartamento",
  price: { toString: () => "350000000" },
  type: "apartment",
  transactionType: "sale",
  city: "Medellín",
  neighborhood: null,
  images: ["https://example.com/photo.jpg"],
}
const findMany = mock((...args: [unknown]) => {
  void args
  return Promise.resolve([property])
})
mock.module("@/lib/prisma", () => ({ prisma: { property: { findMany } } }))

const { getFeaturedProperties, invalidateFeaturedProperties } = await import("./featured-properties")
const cacheGlobal = globalThis as typeof globalThis & { __incrementalCache?: IncrementalCache }
let previousCache: IncrementalCache | undefined
let cache: IncrementalCache

beforeEach(() => {
  previousCache = cacheGlobal.__incrementalCache
  cache = new IncrementalCache({
    dev: false,
    requestHeaders: {},
    fs: nodeFs,
    serverDistDir: "/unused-featured-cache-test",
    flushToDisk: false,
    maxMemoryCacheSize: 1024 * 1024,
    fetchCacheKeyPrefix: crypto.randomUUID(),
    getPrerenderManifest: () => ({
      version: 4,
      routes: {},
      dynamicRoutes: {},
      notFoundRoutes: [],
      preview: { previewModeId: "test", previewModeSigningKey: "test", previewModeEncryptionKey: "test" },
    }),
  })
  cacheGlobal.__incrementalCache = cache
  findMany.mockClear()
  findMany.mockImplementation(() => Promise.resolve([property]))
  mockRevalidateTag.mockClear()
})

afterEach(() => {
  cacheGlobal.__incrementalCache = previousCache
  setSystemTime()
})

describe("featured properties cache", () => {
  test("reuses the public cards across calls and serializes prices consistently", async () => {
    const first = await getFeaturedProperties()
    const second = await getFeaturedProperties()
    expect(findMany).toHaveBeenCalledTimes(1)
    expect(first).toEqual(second)
    expect(second[0].price).toBe(350000000)
    expect(findMany.mock.calls[0]).toEqual([
      expect.objectContaining({ where: { published: true }, take: 10 }),
    ])
  })

  test("refreshes after 24 hours, not on every minute of monitoring", async () => {
    await getFeaturedProperties()
    const start = performance.now()
    const clock = spyOn(performance, "now")
    try {
      clock.mockReturnValue(start + 23 * 60 * 60 * 1000)
      await getFeaturedProperties()
      expect(findMany).toHaveBeenCalledTimes(1)
      clock.mockReturnValue(start + 25 * 60 * 60 * 1000)
      await getFeaturedProperties()
      expect(findMany).toHaveBeenCalledTimes(2)
    } finally {
      clock.mockRestore()
    }
  })

  test("drops withdrawn cards on the first read after invalidation", async () => {
    await getFeaturedProperties()
    setSystemTime(Date.now() + 1000)
    findMany.mockImplementation(() => Promise.resolve([]))
    invalidateFeaturedProperties()
    expect(mockRevalidateTag).toHaveBeenCalledWith("featured-properties", { expire: 0 })
    await cache.revalidateTag("featured-properties", { expire: 0 })
    expect(await getFeaturedProperties()).toEqual([])
    expect(findMany).toHaveBeenCalledTimes(2)
  })

  test("does not cache a database failure as an empty list", async () => {
    findMany.mockImplementationOnce(() => Promise.reject(new Error("Database unavailable")))
    await expect(getFeaturedProperties()).rejects.toThrow("Database unavailable")
    expect(await getFeaturedProperties()).toHaveLength(1)
    expect(findMany).toHaveBeenCalledTimes(2)
  })
})
