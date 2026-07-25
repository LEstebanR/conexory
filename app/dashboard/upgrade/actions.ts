"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startSubscription } from "@/lib/subscription"
import { updatePreapprovalCard } from "@/lib/mercadopago"
import { getAppUrl } from "@/lib/urls"

// cardLastFour comes from the Payment Brick's additionalData and is only
// guaranteed present once a card number has actually been typed in — it's
// allowed to be empty so a Zod failure there doesn't masquerade as a
// Mercado Pago rejection.
const tokenizedCardSchema = z.object({
  cardTokenId: z.string().min(1),
  cardBrand: z.string().min(1),
  cardLastFour: z.string(),
})
type TokenizedCard = z.infer<typeof tokenizedCardSchema>

export type SubscribeResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "already_premium" | "preapproval_failed" }

// Kicks off a subscription with a card token already generated client-side
// (SubscribeCardForm tokenizes the card via Mercado Pago's Payment Brick
// before calling this — raw card data never reaches our server, only the
// resulting token and the brand/last-four-digits the Brick hands back
// alongside it). The subscription is authorized immediately, no redirect to
// Mercado Pago's own checkout.
//
// Returns a result instead of calling redirect(): this is called imperatively
// from a client event handler (not bound as a <form action>), and redirect()
// works by throwing — a caller awaiting this in a try/catch or .catch() would
// swallow that throw as if it were a real failure. The client decides what to
// do with the result (navigate on success, toast on failure).
export async function subscribeAction(card: TokenizedCard): Promise<SubscribeResult> {
  const parsed = tokenizedCardSchema.safeParse(card)
  if (!parsed.success) return { ok: false, reason: "preapproval_failed" }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { ok: false, reason: "unauthenticated" }
  if (session.user.isPremium) return { ok: false, reason: "already_premium" }

  const result = await startSubscription({
    userId: session.user.id,
    email: session.user.email,
    backUrl: `${getAppUrl()}/dashboard?upgrade=processing`,
    cardTokenId: parsed.data.cardTokenId,
    cardBrand: parsed.data.cardBrand,
    cardLastFour: parsed.data.cardLastFour,
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
export async function changeCardAction(card: TokenizedCard): Promise<ChangeCardResult> {
  const parsed = tokenizedCardSchema.safeParse(card)
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

  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: { cardBrand: parsed.data.cardBrand, cardLastFour: parsed.data.cardLastFour },
  })

  revalidatePath("/dashboard/upgrade")
  return { ok: true }
}
