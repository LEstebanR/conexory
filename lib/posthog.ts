export const POSTHOG_INGEST_HOST = "https://us.i.posthog.com"
export const POSTHOG_UI_HOST = "https://us.posthog.com"

// Same-origin path the browser SDK sends to, rewritten to PostHog in
// next.config.ts so ad blockers that match posthog.com don't drop events.
export const POSTHOG_PROXY_PATH = "/ingest"

export function posthogKey(): string | null {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY || null
}

export function posthogRewrites() {
  return [{ source: `${POSTHOG_PROXY_PATH}/:path*`, destination: `${POSTHOG_INGEST_HOST}/:path*` }]
}

// skipTrailingSlashRedirect (needed by the proxy) turns off Next's own
// trailing-slash redirect site-wide; this restores it for every path except
// the proxy, so /precios/ and /precios don't become two indexable pages.
export function trailingSlashRedirects() {
  return [{ source: `/:path((?!${POSTHOG_PROXY_PATH.slice(1)}(?:/|$)).+)/`, destination: "/:path", permanent: true }]
}

export function pathWithoutQuery(url: string): string {
  return url.split(/[?#]/, 1)[0]
}

// Preview and production share one PostHog project, so every event says where
// it came from. NEXT_PUBLIC_ copies are inlined into the browser bundle; the
// plain ones are what the server sees.
export function posthogContext(): { environment: string; release: string | null } {
  const environment = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || "development"
  const sha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA
  return { environment, release: sha ? sha.slice(0, 7) : null }
}
