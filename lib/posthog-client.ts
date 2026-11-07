import type { PostHog } from "posthog-js"
import { POSTHOG_PROXY_PATH, POSTHOG_UI_HOST, posthogKey } from "./posthog"

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
      })
      return posthog
    })
    .catch(() => null)
  return loading
}

export async function captureClientError(error: unknown, properties?: Record<string, unknown>): Promise<void> {
  const posthog = await loadPostHog()
  posthog?.captureException(error, properties)
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

export function resetPostHogClientForTests() {
  loading = undefined
}
