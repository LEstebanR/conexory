import { prisma } from "@/lib/prisma"
import {
  chargeRecurringPayment,
  makeSubscriptionReference,
} from "@/lib/wompi"
import { downgradeToFree } from "@/lib/subscription"
import { sendRenewalReminder, sendPaymentFailed } from "@/lib/email"

// Daily billing job (scheduled in vercel.json). Wompi doesn't drive the
// recurrence for us, so this route is the heartbeat that charges renewals,
// reminds users beforehand, and downgrades accounts whose grace window ran out.
export const dynamic = "force-dynamic"

const REMINDER_DAYS = 3
const GRACE_DAYS = 5
// A charge starts PENDING and resolves via webhook; don't re-attempt while one is
// still in flight from a recent run.
const RECHARGE_COOLDOWN_DAYS = 2

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET ?? ""
  if (!secret) return false
  return req.headers.get("authorization") === `Bearer ${secret}`
}

function daysFromNow(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return new Response(null, { status: 401 })
  }

  const now = new Date()
  const summary = { reminded: 0, charged: 0, pastDue: 0, downgraded: 0, canceled: 0 }

  await sendReminders(now, summary)
  await chargeRenewals(now, summary)
  await expireCanceled(now, summary)
  await downgradeExpired(now, summary)

  return Response.json({ ok: true, ...summary })
}

// Plans the user canceled: keep them Pro until the paid period ends, then drop
// to Free on/after currentPeriodEnd (never before — see the timezone note below).
async function expireCanceled(
  now: Date,
  summary: { canceled: number },
) {
  const due = await prisma.subscription.findMany({
    where: { status: "canceling", currentPeriodEnd: { lt: now } },
    select: { id: true, userId: true },
  })

  for (const sub of due) {
    await downgradeToFree(sub.userId)
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "cancelled" },
    })
    summary.canceled++
  }
}

async function sendReminders(
  now: Date,
  summary: { reminded: number },
) {
  const due = await prisma.subscription.findMany({
    where: {
      status: "active",
      renewalReminderSentAt: null,
      currentPeriodEnd: { gt: now, lte: daysFromNow(REMINDER_DAYS) },
    },
    select: {
      id: true,
      currentPeriodEnd: true,
      user: { select: { email: true, name: true } },
    },
  })

  for (const sub of due) {
    if (!sub.currentPeriodEnd) continue
    await sendRenewalReminder(
      sub.user.email,
      sub.user.name,
      sub.currentPeriodEnd,
    ).catch(() => null)
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { renewalReminderSentAt: now },
    })
    summary.reminded++
  }
}

async function chargeRenewals(
  now: Date,
  summary: { charged: number; pastDue: number },
) {
  const due = await prisma.subscription.findMany({
    where: {
      status: { in: ["active", "past_due"] },
      currentPeriodEnd: { lte: now },
    },
    select: {
      id: true,
      userId: true,
      wompiPaymentSourceId: true,
      wompiPaymentSourceType: true,
      lastChargeAt: true,
      pastDueSince: true,
      user: { select: { email: true, name: true } },
    },
  })

  for (const sub of due) {
    // No saved card (a half-finished activation or legacy sub): nothing to
    // auto-charge. Open the grace window and nudge them to subscribe again.
    if (!sub.wompiPaymentSourceId) {
      if (!sub.pastDueSince) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: "past_due", pastDueSince: now },
        })
        await sendPaymentFailed(sub.user.email, sub.user.name).catch(() => null)
        summary.pastDue++
      }
      continue
    }

    const recentlyAttempted =
      sub.lastChargeAt &&
      now.getTime() - sub.lastChargeAt.getTime() <
        RECHARGE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
    if (recentlyAttempted) continue

    const result = await chargeRecurringPayment({
      paymentSourceId: sub.wompiPaymentSourceId,
      reference: makeSubscriptionReference(sub.userId),
      customerEmail: sub.user.email,
      type: sub.wompiPaymentSourceType === "NEQUI" ? "NEQUI" : "CARD",
    })

    // Stamp the attempt so the next run won't re-charge while the webhook with
    // the real outcome (APPROVED/DECLINED) is still pending.
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { lastChargeAt: now },
    })

    if (result.ok) summary.charged++
  }
}

async function downgradeExpired(
  now: Date,
  summary: { downgraded: number },
) {
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - GRACE_DAYS)

  const expired = await prisma.subscription.findMany({
    where: {
      status: "past_due",
      pastDueSince: { lte: cutoff },
      // Never cancel before the paid period has actually ended. Users are in
      // Colombia (UTC-5, no DST); since GRACE_DAYS (5 days) dwarfs that 5-hour
      // offset, a user never loses Pro before their local due date — at worst
      // they get a few extra days, never fewer.
      currentPeriodEnd: { lt: now },
    },
    select: { id: true, userId: true },
  })

  for (const sub of expired) {
    await downgradeToFree(sub.userId)
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "expired" },
    })
    summary.downgraded++
  }
}
