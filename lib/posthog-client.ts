import type { CaptureResult, PostHog } from "posthog-js"
import { POSTHOG_PROXY_PATH, POSTHOG_UI_HOST, pathWithoutQuery, posthogContext, posthogKey } from "./posthog"

let loading: Promise<PostHog | null> | undefined

// The SDK is only downloaded once there is an error to send, and configured so
// that it never calls PostHog on its own: no flags, no remote config, no
// external scripts. Every proxied request is billed by Vercel, so a normal page
// load must cost zero. Product analytics (#141) revisits this.
export function loadPostHog(): Promise<PostHog | null> {
  const key = posthogKey()
  if (!key || typeof window === "undefined") return Promise.resolve(null)
  loading ??= import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: POSTHOG_PROXY_PATH,
        ui_host: POSTHOG_UI_HOST,
        advanced_disable_flags: true,
        disable_external_dependency_loading: true,
        capture_exceptions: false,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
        disable_surveys: true,
        persistence: "memory",
        person_profiles: "identified_only",
        request_batching: false,
        before_send: stripUrlQueries,
      })
      posthog.register(posthogContext())
      return posthog
    })
    .catch(() => {
      // A stale tab after a deploy can fail to fetch the chunk; forget the
      // failure so the next error retries instead of staying silent.
      loading = undefined
      return null
    })
  return loading
}

// The SDK records the full page URL and referrer, and some carry secrets in the
// query string (the password-reset token, Mercado Pago's return params).
const URL_PROPERTIES = ["$current_url", "$referrer", "$initial_current_url", "$initial_referrer"]

export function stripUrlQueries(event: CaptureResult | null): CaptureResult | null {
  if (!event) return event
  for (const bag of [event.properties, event.$set, event.$set_once]) {
    if (!bag) continue
    for (const key of URL_PROPERTIES) {
      if (typeof bag[key] === "string") bag[key] = pathWithoutQuery(bag[key])
    }
  }
  return event
}

// Never rejects: the unhandledrejection listener calls this, and a rejection
// here would fire that listener again.
export async function captureClientError(error: unknown, properties?: Record<string, unknown>): Promise<void> {
  try {
    const posthog = await loadPostHog()
    posthog?.captureException(error, properties)
  } catch {
    // Error tracking must never become a source of errors itself.
  }
}

// Errors React catches in an error boundary don't reach these listeners; the
// boundaries report those themselves.
export function captureUncaughtErrors(): void {
  if (!posthogKey()) return
  window.addEventListener("error", (event) => {
    // Cross-origin script errors arrive without an error object or stack: nothing actionable.
    if (event.error) void captureClientError(event.error, { source: "window.error" })
  })
  window.addEventListener("unhandledrejection", (event) => {
    void captureClientError(event.reason, { source: "unhandledrejection" })
  })
}

// Server errors reach the boundary with a digest and a message redacted in
// production; onRequestError already reported the real one on the server.
export function captureBoundaryError(error: Error & { digest?: string }, boundary: string): void {
  if (error.digest) return
  void captureClientError(error, { boundary })
}

export function resetPostHogClientForTests() {
  loading = undefined
}
