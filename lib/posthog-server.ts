import { after } from "next/server"
import type { PostHog } from "posthog-node"
import { POSTHOG_INGEST_HOST, posthogKey } from "./posthog"

let client: Promise<PostHog | null> | undefined

// Loaded lazily so a missing key never pulls posthog-node into the request.
// flushAt/flushInterval keep the client from batching: serverless functions
// can be frozen right after responding, losing anything still queued.
export function getPostHogServer(): Promise<PostHog | null> {
  const key = posthogKey()
  if (!key) return Promise.resolve(null)
  client ??= import("posthog-node")
    .then(({ PostHog }) => new PostHog(key, { host: POSTHOG_INGEST_HOST, flushAt: 1, flushInterval: 0 }))
    .catch(() => {
      // Forget the failure so the next send retries instead of staying silent
      // for the rest of this warm function's life.
      client = undefined
      return null
    })
  return client
}

// Inside a request, the send runs after the response so a slow PostHog never
// delays it. Outside one (scripts, tests), after() throws and we send inline.
export function sendWithoutBlocking(send: () => Promise<void>): Promise<void> {
  try {
    after(send)
    return Promise.resolve()
  } catch {
    return send()
  }
}

export function resetPostHogServerForTests() {
  client = undefined
}
