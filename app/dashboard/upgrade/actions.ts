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

  // Derive base URL from the actual request Host so the Wompi redirect-url
  // lands on the exact same domain the user is on. Using VERCEL_URL would
  // return the deployment-specific subdomain, which is a different cookie
  // domain from the stable branch alias — leaving the user logged out.
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
