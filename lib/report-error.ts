import { posthogContext } from "./posthog"
import { getPostHogServer, sendWithoutBlocking } from "./posthog-server"

type Properties = Record<string, unknown>

export async function captureServerError(error: unknown, properties: Properties = {}): Promise<void> {
  try {
    const posthog = await getPostHogServer()
    await posthog?.captureExceptionImmediate(error, undefined, { ...posthogContext(), ...properties })
  } catch (sendError) {
    console.error("[posthog] could not report error:", sendError)
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
