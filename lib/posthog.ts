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
