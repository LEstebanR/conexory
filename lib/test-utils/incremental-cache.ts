import { afterEach, beforeEach } from "bun:test"
import { IncrementalCache } from "next/dist/server/lib/incremental-cache"
import { nodeFs } from "next/dist/server/lib/node-fs-methods"

const cacheGlobal = globalThis as typeof globalThis & { __incrementalCache?: IncrementalCache }

// unstable_cache needs a request-scoped IncrementalCache that only exists
// inside a Next.js server. Each test gets a fresh in-memory one so cached
// public queries don't leak results between tests.
export function setupIncrementalCache(): { current: () => IncrementalCache } {
  let previous: IncrementalCache | undefined
  let cache: IncrementalCache

  beforeEach(() => {
    previous = cacheGlobal.__incrementalCache
    cache = new IncrementalCache({
      dev: false,
      requestHeaders: {},
      fs: nodeFs,
      serverDistDir: "/unused-test-cache",
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
  })

  afterEach(() => {
    cacheGlobal.__incrementalCache = previous
  })

  return { current: () => cache }
}
