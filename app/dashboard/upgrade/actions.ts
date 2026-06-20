"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { buildCheckoutUrl, makeSubscriptionReference } from "@/lib/wompi"

// getAppUrl() always prefers the canonical production URL (good for property links),
// but Wompi's redirect-url must point to the *current* deploy so the success
// callback lands on the same app instance being tested.
function getCurrentBaseUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

export async function startSubscription() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  if (session.user.isPremium) redirect("/dashboard")

  const reference = makeSubscriptionReference(session.user.id)
  const redirectUrl = `${getCurrentBaseUrl()}/dashboard?upgrade=success`

  const checkoutUrl = buildCheckoutUrl({
    reference,
    redirectUrl,
    customerEmail: session.user.email,
  })

  redirect(checkoutUrl)
}
