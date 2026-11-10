import { after } from "next/server"
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
    .catch(() => {
      // Forget the failure so the next error retries instead of staying silent
      // for the rest of this warm function's life.
      client = undefined
      return null
    })
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

// Inside a request, the send runs after the response so a slow PostHog never
// delays it. Outside one (scripts, tests), after() throws and we send inline.
function sendWithoutBlocking(send: () => Promise<void>): Promise<void> {
  try {
    after(send)
    return Promise.resolve()
  } catch {
    return send()
  }
}

export async function reportError(message: string, error?: unknown, context: Properties = {}): Promise<void> {
  console.error(message, ...(error === undefined ? [] : [error]), context)
  await sendWithoutBlocking(() =>
    captureServerError(error instanceof Error ? error : new Error(message), {
      message,
      ...context,
      ...(error === undefined || error instanceof Error ? {} : { detail: error }),
    }),
  )
}

export function resetReportErrorClientForTests() {
  client = undefined
}
