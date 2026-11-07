import type { PostHog } from "posthog-node"
import { POSTHOG_INGEST_HOST, posthogKey } from "./posthog"

type Properties = Record<string, unknown>

let client: Promise<PostHog | null> | undefined

// Loaded lazily so a missing key never pulls posthog-node into the request.
// flushAt/flushInterval keep the client from batching: serverless functions
// can be frozen right after responding, losing anything still queued.
function getClient(): Promise<PostHog | null> {
  const key = posthogKey()
  if (!key) return Promise.resolve(null)
  client ??= import("posthog-node")
    .then(({ PostHog }) => new PostHog(key, { host: POSTHOG_INGEST_HOST, flushAt: 1, flushInterval: 0 }))
    .catch(() => null)
  return client
}

export async function captureServerError(error: unknown, properties: Properties = {}): Promise<void> {
  try {
    const posthog = await getClient()
    await posthog?.captureExceptionImmediate(error, undefined, properties)
  } catch (sendError) {
    console.error("[posthog] could not report error:", sendError)
  }
}

export async function reportError(message: string, error?: unknown, context: Properties = {}): Promise<void> {
  console.error(message, ...(error === undefined ? [] : [error]), context)
  await captureServerError(error instanceof Error ? error : new Error(message), {
    message,
    ...context,
    ...(error === undefined || error instanceof Error ? {} : { detail: error }),
  })
}

export function resetReportErrorClientForTests() {
  client = undefined
}
