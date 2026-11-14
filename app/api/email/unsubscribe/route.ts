import { optOutOfLifecycleEmails, verifyUnsubscribeToken } from "@/lib/unsubscribe"

// RFC 8058 one-click target: mail clients POST here directly from their own
// "unsubscribe" button, without a session or a page visit.
export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? ""
  const userId = verifyUnsubscribeToken(token)
  if (!userId) return new Response(null, { status: 400 })
  await optOutOfLifecycleEmails(userId)
  return new Response(null, { status: 200 })
}
