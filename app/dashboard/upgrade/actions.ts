"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { buildCheckoutUrl, makeSubscriptionReference } from "@/lib/wompi"
import { getAppUrl } from "@/lib/urls"

export async function startSubscription() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  if (session.user.isPremium) redirect("/dashboard")

  const reference = makeSubscriptionReference(session.user.id)
  const redirectUrl = `${getAppUrl()}/dashboard?upgrade=success`

  const checkoutUrl = buildCheckoutUrl({
    reference,
    redirectUrl,
    customerEmail: session.user.email,
  })

  redirect(checkoutUrl)
}
