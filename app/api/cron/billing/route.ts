import { prisma } from "@/lib/prisma"
import { downgradeToFree } from "@/lib/subscription"
import { sendRenewalReminder, sendSubscriptionCancelled } from "@/lib/email"

// Daily billing job (scheduled in vercel.json). Mercado Pago drives the
// recurring charges itself (unlike Wompi) and reports outcomes via
// /api/webhooks/mercadopago, so this route no longer charges anything — it's
// left with the parts Mercado Pago doesn't do for us: reminding users before
// a renewal, and downgrading accounts whose cancellation/decline already
// landed via webhook.
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
  const summary = { reminded: 0, downgraded: 0, canceled: 0, manualExpired: 0 }

  await sendReminders(now, summary)
  await expireCanceled(now, summary)
  await downgradeExpired(now, summary)
  await expireManualPro(now, summary)

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
      mpPreapprovalId: true,
      user: { select: { email: true, name: true } },
    },
  })

  for (const sub of due) {
    if (!sub.currentPeriodEnd) continue
    await sendRenewalReminder(
      sub.user.email,
      sub.user.name,
      sub.currentPeriodEnd,
      !!sub.mpPreapprovalId,
    ).catch(() => null)
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { renewalReminderSentAt: now },
    })
    summary.reminded++
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

// Admin-granted manual Pro with a premiumUntil date that has passed.
// If the user also has an active subscription, keep isPremium and just clear
// the manual date so the real subscription continues uninterrupted.
async function expireManualPro(
  now: Date,
  summary: { manualExpired: number },
) {
  const expired = await prisma.user.findMany({
    where: { isPremium: true, premiumUntil: { lte: now } },
    select: {
      id: true,
      subscription: { select: { status: true } },
    },
  })

  for (const user of expired) {
    const hasActiveSub =
      user.subscription?.status === "active" ||
      user.subscription?.status === "canceling"

    if (hasActiveSub) {
      await prisma.user.update({
        where: { id: user.id },
        data: { premiumUntil: null },
      })
    } else {
      await downgradeToFree(user.id)
      await prisma.user.update({
        where: { id: user.id },
        data: { premiumUntil: null },
      })
    }
    summary.manualExpired++
  }
}
