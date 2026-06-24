import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { activateCardSubscription } from "@/lib/subscription"

// Wompi's tokenization widget POSTs here (form submit) after the buyer enters
// their card in Wompi's own UI. We receive an id_token, never the card data.
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })

  const redirectTo = (path: string) =>
    Response.redirect(new URL(path, req.url), 303)

  if (!session) return redirectTo("/login")
  if (session.user.isPremium) return redirectTo("/dashboard")

  const form = await req.formData().catch(() => null)

  // The tokenization widget POSTs the card token as `payment_source_token`.
  const idToken = form?.get("payment_source_token")?.toString()

  if (!idToken) {
    return redirectTo("/dashboard/upgrade?error=card")
  }

  const result = await activateCardSubscription({
    userId: session.user.id,
    email: session.user.email,
    token: idToken,
  })

  if (result.ok) return redirectTo("/dashboard?upgrade=processing")
  return redirectTo(`/dashboard/upgrade?error=${result.reason}`)
}
