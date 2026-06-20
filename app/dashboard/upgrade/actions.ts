"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { buildCheckoutUrl, makeSubscriptionReference } from "@/lib/wompi"

export async function startSubscription() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  if (!session) redirect("/login")

  if (session.user.isPremium) redirect("/dashboard")

  // Use request Host (not VERCEL_URL) — each deploy has a different subdomain and they don't share cookies.
  const host = headersList.get("host") ?? "localhost:3000"
  const proto = process.env.VERCEL_ENV ? "https" : "http"
  const baseUrl = `${proto}://${host}`

  const reference = makeSubscriptionReference(session.user.id)
  const redirectUrl = `${baseUrl}/dashboard?upgrade=success`

  const checkoutUrl = buildCheckoutUrl({
    reference,
    redirectUrl,
    customerEmail: session.user.email,
  })

  redirect(checkoutUrl)
}
