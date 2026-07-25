"use server"

import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { startSubscription } from "@/lib/subscription"
import { getAppUrl } from "@/lib/urls"

const subscribeSchema = z.object({ cardTokenId: z.string().min(1) })

export type SubscribeResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "already_premium" | "preapproval_failed" }

// Kicks off a subscription with a card token already generated client-side
// (SubscribeCardForm tokenizes the card via Mercado Pago's SDK before calling
// this — raw card data never reaches our server). The subscription is
// authorized immediately, no redirect to Mercado Pago's own checkout.
//
// Returns a result instead of calling redirect(): this is called imperatively
// from a client event handler (not bound as a <form action>), and redirect()
// works by throwing — a caller awaiting this in a try/catch or .catch() would
// swallow that throw as if it were a real failure. The client decides what to
// do with the result (navigate on success, toast on failure).
export async function subscribeAction(cardTokenId: string): Promise<SubscribeResult> {
  const parsed = subscribeSchema.safeParse({ cardTokenId })
  if (!parsed.success) return { ok: false, reason: "preapproval_failed" }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { ok: false, reason: "unauthenticated" }
  if (session.user.isPremium) return { ok: false, reason: "already_premium" }

  const result = await startSubscription({
    userId: session.user.id,
    email: session.user.email,
    backUrl: `${getAppUrl()}/dashboard?upgrade=processing`,
    cardTokenId: parsed.data.cardTokenId,
  })

  if (!result.ok) return { ok: false, reason: result.reason }

  return { ok: true }
}
