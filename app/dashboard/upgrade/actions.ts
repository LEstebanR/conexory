"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { startSubscription } from "@/lib/subscription"
import { getAppUrl } from "@/lib/urls"

// Kicks off a subscription and sends the buyer to Mercado Pago's own hosted
// page to enter their card — we never render card fields ourselves. They
// land back on /dashboard, where UpgradeSuccessToast polls for isPremium
// until the webhook (async, driven by Mercado Pago) confirms the charge.
export async function subscribeAction() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  if (session.user.isPremium) redirect("/dashboard")

  const result = await startSubscription({
    userId: session.user.id,
    email: session.user.email,
    backUrl: `${getAppUrl()}/dashboard?upgrade=processing`,
  })

  if (!result.ok) redirect(`/dashboard/upgrade?error=${result.reason}`)

  redirect(result.initPoint)
}
