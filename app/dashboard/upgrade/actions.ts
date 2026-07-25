"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { startSubscription } from "@/lib/subscription"
import { getAppUrl } from "@/lib/urls"

const subscribeSchema = z.object({ cardTokenId: z.string().min(1) })

// Kicks off a subscription with a card token already generated client-side
// (SubscribeCardForm tokenizes the card via Mercado Pago's SDK before calling
// this — raw card data never reaches our server). The subscription is
// authorized immediately, no redirect to Mercado Pago's own checkout: they
// land on /dashboard, where UpgradeSuccessToast polls for isPremium until the
// webhook (async, driven by Mercado Pago) confirms the first charge.
export async function subscribeAction(cardTokenId: string) {
  const parsed = subscribeSchema.safeParse({ cardTokenId })
  if (!parsed.success) redirect("/dashboard/upgrade?error=preapproval_failed")

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  if (session.user.isPremium) redirect("/dashboard")

  const result = await startSubscription({
    userId: session.user.id,
    email: session.user.email,
    backUrl: `${getAppUrl()}/dashboard?upgrade=processing`,
    cardTokenId: parsed.data.cardTokenId,
  })

  if (!result.ok) redirect(`/dashboard/upgrade?error=${result.reason}`)

  redirect("/dashboard?upgrade=processing")
}
