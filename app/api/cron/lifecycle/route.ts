import { prisma } from "@/lib/prisma"
import { claimLifecycleEmail, type LifecycleEmailKind } from "@/lib/lifecycle"
import { sendReengagement, sendWinback } from "@/lib/email"
import { reportError } from "@/lib/report-error"

// Daily proactive emails (scheduled in vercel.json). The limit-reached email
// is sent from the property actions instead, at the moment it happens.
export const dynamic = "force-dynamic"

const REENGAGEMENT_AFTER_DAYS = 3
const WINBACK_AFTER_DAYS = 14
// Only users who crossed the threshold inside this window are eligible, so the
// first deploy doesn't email the whole historical backlog, while a few missed
// runs still catch up.
const ELIGIBILITY_WINDOW_DAYS = 7
// Resend's free plan allows 100 emails a day in total; 2 × 30 leaves room
// for transactional mail (password resets, payments) on the same day.
const MAX_SENDS_PER_KIND = 30

type Recipient = { id: string; email: string; name: string }

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET ?? ""
  if (!secret) return false
  return req.headers.get("authorization") === `Bearer ${secret}`
}

function daysBefore(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return new Response(null, { status: 401 })
  }

  const now = new Date()
  const reengaged = await sendOnce("reengagement", await reengagementCandidates(now), sendReengagement)
  const wonBack = await sendOnce("winback", await winbackCandidates(now), sendWinback)

  return Response.json({ ok: true, reengaged, wonBack })
}

function reengagementCandidates(now: Date): Promise<Recipient[]> {
  return prisma.user.findMany({
    where: {
      role: "user",
      isPremium: false,
      lifecycleEmailsOptOut: false,
      createdAt: {
        gte: daysBefore(now, REENGAGEMENT_AFTER_DAYS + ELIGIBILITY_WINDOW_DAYS),
        lte: daysBefore(now, REENGAGEMENT_AFTER_DAYS),
      },
      properties: { none: { published: true } },
      lifecycleEmails: { none: { kind: "reengagement" } },
    },
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: "asc" },
    take: MAX_SENDS_PER_KIND,
  })
}

async function winbackCandidates(now: Date): Promise<Recipient[]> {
  const subs = await prisma.subscription.findMany({
    where: {
      status: { in: ["cancelled", "expired"] },
      endedAt: {
        gte: daysBefore(now, WINBACK_AFTER_DAYS + ELIGIBILITY_WINDOW_DAYS),
        lte: daysBefore(now, WINBACK_AFTER_DAYS),
      },
      user: {
        isPremium: false,
        lifecycleEmailsOptOut: false,
        lifecycleEmails: { none: { kind: "winback" } },
      },
    },
    select: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { endedAt: "asc" },
    take: MAX_SENDS_PER_KIND,
  })
  return subs.map((s) => s.user)
}

async function sendOnce(
  kind: LifecycleEmailKind,
  recipients: Recipient[],
  send: (user: Recipient) => Promise<void>,
): Promise<number> {
  let sent = 0
  for (const user of recipients) {
    if (!(await claimLifecycleEmail(user.id, kind))) continue
    // One failing send must not leave the rest of today's recipients without theirs.
    const ok = await send(user).then(
      () => true,
      (err) => reportError(`Lifecycle email failed: ${kind}`, err, { userId: user.id }).then(() => false),
    )
    if (ok) sent++
  }
  return sent
}
