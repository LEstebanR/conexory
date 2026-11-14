import crypto from "node:crypto"
import { prisma } from "@/lib/prisma"
import { getAppUrl } from "@/lib/urls"

// Prefixed so a signature minted here can never be replayed as some other
// HMAC that happens to share BETTER_AUTH_SECRET.
const PURPOSE = "lifecycle-unsubscribe:"

function sign(userId: string): string {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not set")
  return crypto.createHmac("sha256", secret).update(PURPOSE + userId).digest("base64url")
}

export function unsubscribeToken(userId: string): string {
  return `${userId}.${sign(userId)}`
}

export function verifyUnsubscribeToken(token: string): string | null {
  const separator = token.lastIndexOf(".")
  if (separator <= 0) return null
  const userId = token.slice(0, separator)
  const given = Buffer.from(token.slice(separator + 1))
  const expected = Buffer.from(sign(userId))
  if (given.length !== expected.length) return null
  return crypto.timingSafeEqual(given, expected) ? userId : null
}

export function unsubscribePageUrl(userId: string): string {
  return `${getAppUrl()}/email/baja?token=${encodeURIComponent(unsubscribeToken(userId))}`
}

export function oneClickUnsubscribeUrl(userId: string): string {
  return `${getAppUrl()}/api/email/unsubscribe?token=${encodeURIComponent(unsubscribeToken(userId))}`
}

export async function optOutOfLifecycleEmails(userId: string): Promise<void> {
  await prisma.user.updateMany({
    where: { id: userId },
    data: { lifecycleEmailsOptOut: true },
  })
}
