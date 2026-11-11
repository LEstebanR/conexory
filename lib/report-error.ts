import { randomUUID } from "node:crypto"
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

// A browser still running a previous deploy posts an action id the new build
// no longer has. Not a bug in our code, so it's counted, not raised as an issue.
export function isServerActionVersionSkew(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith("Failed to find Server Action")
}

async function captureVersionSkew(properties: Properties): Promise<void> {
  try {
    const posthog = await getPostHogServer()
    await posthog?.captureImmediate({
      distinctId: randomUUID(),
      event: "server_action_version_skew",
      properties: { ...posthogContext(), ...properties, $process_person_profile: false },
    })
  } catch (sendError) {
    console.error("[posthog] could not report version skew:", sendError)
  }
}

export function captureRequestError(error: unknown, properties: Properties = {}): Promise<void> {
  return isServerActionVersionSkew(error) ? captureVersionSkew(properties) : captureServerError(error, properties)
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
