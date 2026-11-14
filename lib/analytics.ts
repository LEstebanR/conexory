import { randomUUID } from "node:crypto"
import { posthogContext } from "./posthog"
import type { SignupSource } from "./attribution"
import { getPostHogServer, sendWithoutBlocking } from "./posthog-server"

type FunnelEventProperties = {
  signup_started: Record<string, never>
  signup_completed: { method: "email" | "google"; signup_source: SignupSource | null }
  first_property_created: Record<string, never>
  first_property_shared: Record<string, never>
  upgrade_page_viewed: Record<string, never>
  upgrade_completed: { source: "card" | "webhook" }
}

export type FunnelEvent = keyof FunnelEventProperties

type PropertiesArg<E extends FunnelEvent> =
  FunnelEventProperties[E] extends Record<string, never> ? [] : [properties: FunnelEventProperties[E]]

async function capture(distinctId: string, event: FunnelEvent, properties: Record<string, unknown>): Promise<void> {
  try {
    const posthog = await getPostHogServer()
    await posthog?.captureImmediate({ distinctId, event, properties: { ...posthogContext(), ...properties } })
  } catch (error) {
    console.error(`[posthog] could not track ${event}:`, error)
  }
}

// Only ids and event properties go to PostHog, never names or emails.
export function trackEvent<E extends FunnelEvent>(userId: string, event: E, ...[properties]: PropertiesArg<E>): Promise<void> {
  return sendWithoutBlocking(() => capture(userId, event, properties ?? {}))
}

// For steps before the user exists: a throwaway id, and no person profile so
// each anonymous event doesn't create (and bill) a person in PostHog.
export function trackAnonymousEvent<E extends FunnelEvent>(event: E, ...[properties]: PropertiesArg<E>): Promise<void> {
  return sendWithoutBlocking(() =>
    capture(randomUUID(), event, { ...(properties ?? {}), $process_person_profile: false }),
  )
}

// Google sign-ups arrive already verified; email/password ones start unverified.
export function trackSignupCompleted(
  user: { id: string; emailVerified: boolean },
  signupSource: SignupSource | null = null
): Promise<void> {
  return trackEvent(user.id, "signup_completed", {
    method: user.emailVerified ? "google" : "email",
    signup_source: signupSource,
  })
}
