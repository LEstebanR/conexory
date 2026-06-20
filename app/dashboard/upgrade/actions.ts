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

  // Derive the base URL from the actual request host so the redirect-url
  // matches the exact domain the user is on (branch alias vs deployment URL).
  // Using VERCEL_URL or a fixed env var would send users to a different
  // *.vercel.app subdomain where their session cookie isn't valid.
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
