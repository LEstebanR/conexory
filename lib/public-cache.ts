import { revalidateTag, unstable_cache } from "next/cache"

export const PUBLIC_LISTINGS_TAG = "public-listings"

// Public surfaces (landing, /p, /agente, /propiedades, OG images, sitemap) are
// hit by crawlers and uptime pings around the clock. Every uncached query
// keeps the Neon compute from autosuspending, so their reads go through this
// cache and every write that changes what they show must call
// invalidatePublicListings(). Cached values are JSON-serialized: return
// numbers/strings, never Prisma Decimal or Date.
export function cachePublicQuery<Args extends unknown[], Result>(
  query: (...args: Args) => Promise<Result>,
  key: string,
): (...args: Args) => Promise<Result> {
  return unstable_cache(query, [key], {
    tags: [PUBLIC_LISTINGS_TAG],
    revalidate: 60 * 60 * 24,
  })
}

export function invalidatePublicListings() {
  revalidateTag(PUBLIC_LISTINGS_TAG, { expire: 0 })
}
