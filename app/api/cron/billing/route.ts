import { prisma } from "@/lib/prisma"
import {
  chargeRecurringPayment,
  makeSubscriptionReference,
} from "@/lib/wompi"
import { downgradeToFree } from "@/lib/subscription"
import { sendRenewalReminder, sendSubscriptionCancelled } from "@/lib/email"

// Daily billing job (scheduled in vercel.json). Wompi doesn't drive the
// recurrence for us, so this route is the heartbeat that charges renewals,
// reminds users beforehand, and downgrades accounts whose payment failed —
// no grace window and no retries, so a failed renewal drops to Free on the
// next run.
export const dynamic = "force-dynamic"

const REMINDER_DAYS = 3

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
      wompiPaymentSourceId: true,
      user: { select: { email: true, name: true } },
    },
  })

  for (const sub of due) {
    if (!sub.currentPeriodEnd) continue
    await sendRenewalReminder(
      sub.user.email,
      sub.user.name,
      sub.currentPeriodEnd,
      !!sub.wompiPaymentSourceId,
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
      status: "active",
      currentPeriodEnd: { lte: now },
    },
    select: {
      id: true,
      userId: true,
      currentPeriodEnd: true,
      wompiPaymentSourceId: true,
      wompiPaymentSourceType: true,
      lastChargeAt: true,
      pastDueSince: true,
      user: { select: { email: true, name: true } },
    },
  })

  for (const sub of due) {
    // No saved card (a half-finished activation or legacy sub): nothing to
    // auto-charge. Mark past_due so the next run's downgradeExpired drops it —
    // no retries.
    if (!sub.wompiPaymentSourceId) {
      if (!sub.pastDueSince) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: "past_due", pastDueSince: now },
        })
        summary.pastDue++
      }
      continue
    }

    // A renewal already attempted this cycle (lastChargeAt is after the period
    // end) is waiting on the webhook — don't re-charge it, or a lost webhook
    // would re-bill the card on every run. There's no retry after a decline:
    // the webhook flips the sub to past_due and the cron downgrades it.
    if (sub.lastChargeAt && sub.currentPeriodEnd && sub.lastChargeAt > sub.currentPeriodEnd) {
      continue
    }

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
  // No grace window: pastDueSince is stamped at the failed renewal charge (at/after
  // currentPeriodEnd), so any past_due sub is downgraded on this very run — or, for
  // a decline that arrived via webhook after this run started, on the next one.
  const expired = await prisma.subscription.findMany({
    where: {
      status: "past_due",
      pastDueSince: { lte: now },
    },
    select: { id: true, userId: true, user: { select: { email: true, name: true } } },
  })

  for (const sub of expired) {
    await downgradeToFree(sub.userId)
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "expired" },
    })
    await sendSubscriptionCancelled(sub.user.email, sub.user.name).catch(() => null)
    summary.downgraded++
  }
}
