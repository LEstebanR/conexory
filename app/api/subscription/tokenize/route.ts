import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { activateSubscription } from "@/lib/subscription"

// Wompi's tokenization widget POSTs here (form submit) after the buyer enters
// their card/Nequi in Wompi's own UI. We receive a token, never the credentials.
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })

  const redirectTo = (path: string) =>
    Response.redirect(new URL(path, req.url), 303)

  if (!session) return redirectTo("/login")
  if (session.user.isPremium) return redirectTo("/dashboard")

  const form = await req.formData().catch(() => null)

  // The widget POSTs the token as `payment_source_token` and the method under
  // `payment_source_type` (CARD or NEQUI).
  const idToken = form?.get("payment_source_token")?.toString()
  const type =
    form?.get("payment_source_type")?.toString() === "NEQUI" ? "NEQUI" : "CARD"

  if (!idToken) {
    return redirectTo("/dashboard/upgrade?error=card")
  }

  const result = await activateSubscription({
    userId: session.user.id,
    email: session.user.email,
    token: idToken,
    type,
  })

  if (result.ok) return redirectTo("/dashboard?upgrade=processing")
  return redirectTo(`/dashboard/upgrade?error=${result.reason}`)
}
