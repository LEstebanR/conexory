"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startSubscription } from "@/lib/subscription"
import { updatePreapprovalCard } from "@/lib/mercadopago"
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

export type ChangeCardResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "no_subscription" | "update_failed" }

// Swaps the card Mercado Pago charges for future renewals, tokenized
// client-side the same way as subscribeAction. Doesn't touch isPremium or
// the local subscription status — the card is just how the existing
// subscription gets paid, not whether it exists.
export async function changeCardAction(cardTokenId: string): Promise<ChangeCardResult> {
  const parsed = subscribeSchema.safeParse({ cardTokenId })
  if (!parsed.success) return { ok: false, reason: "update_failed" }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { ok: false, reason: "unauthenticated" }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: { mpPreapprovalId: true },
  })
  if (!subscription?.mpPreapprovalId) return { ok: false, reason: "no_subscription" }

  const result = await updatePreapprovalCard(subscription.mpPreapprovalId, parsed.data.cardTokenId)
  if (!result.ok) return { ok: false, reason: "update_failed" }

  // Mercado Pago confirms the new brand immediately, but never hands us the
  // last four digits outside of an actual Payment object — clear the stale
  // ones so the UI doesn't keep showing the old card's digits under the new
  // brand. They're filled back in once the next real charge lands.
  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: { cardBrand: result.cardBrand, cardLastFour: null },
  })

  revalidatePath("/dashboard/upgrade")
  return { ok: true }
}
