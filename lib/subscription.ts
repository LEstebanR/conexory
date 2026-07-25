import { prisma } from "@/lib/prisma"
import { FREE_PROPERTY_LIMIT } from "@/lib/plans"
import { createPreapproval } from "@/lib/mercadopago"

// Drop a user to Free: clear the premium flag and deactivate properties beyond
// the Free limit (keeping the most recent ones). Used both when a canceled plan
// reaches its period end and when an unpaid one exhausts its grace window.
export async function downgradeToFree(userId: string) {
  const activeProperties = await prisma.property.findMany({
    where: { userId, published: true },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  })
  const idsToDeactivate = activeProperties
    .slice(FREE_PROPERTY_LIMIT)
    .map((p) => p.id)

  await Promise.all([
    prisma.user.update({ where: { id: userId }, data: { isPremium: false } }),
    idsToDeactivate.length > 0
      ? prisma.property.updateMany({
          where: { id: { in: idsToDeactivate } },
          data: { published: false },
        })
      : Promise.resolve(),
  ])
}

export type StartSubscriptionResult =
  | { ok: true }
  | { ok: false; reason: "preapproval_failed" }

// Kicks off a subscription with a card already tokenized client-side
// (cardTokenId) and persists the preapproval id so the webhook (which only
// carries an id, not a full payload) can find the right user later.
//
// Mercado Pago's first charge on an "authorized" preapproval settles
// asynchronously — anywhere from a few minutes to about an hour — which
// would otherwise leave a buyer who just handed over a validated card
// staring at "confirming your payment" for a long time. Since the card was
// already validated moments earlier (that's what "authorized" means here),
// we activate isPremium optimistically instead of waiting for the webhook.
// lastChargeAt stays null until the webhook confirms a real charge — the
// webhook uses that (not just status/currentPeriodEnd) to tell "this is the
// first confirmation" from "this is a renewal", so it still sends the
// welcome-to-Pro email once, and handleDeclined downgrades back to Free if
// that first real charge ends up rejected.
export async function startSubscription({
  userId,
  email,
  backUrl,
  cardTokenId,
}: {
  userId: string
  email: string
  backUrl: string
  cardTokenId: string
}): Promise<StartSubscriptionResult> {
  const result = await createPreapproval({ userId, email, backUrl, cardTokenId })
  if (!result.ok || !result.preapprovalId) {
    return { ok: false, reason: "preapproval_failed" }
  }

  const authorized = result.status === "authorized"
  const periodEnd = new Date()
  periodEnd.setDate(periodEnd.getDate() + 30)

  await Promise.all([
    prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        status: authorized ? "active" : "incomplete",
        mpPreapprovalId: result.preapprovalId,
        currentPeriodEnd: authorized ? periodEnd : null,
      },
      update: {
        status: authorized ? "active" : "incomplete",
        mpPreapprovalId: result.preapprovalId,
        currentPeriodEnd: authorized ? periodEnd : null,
        pastDueSince: null,
      },
    }),
    authorized ? prisma.user.update({ where: { id: userId }, data: { isPremium: true } }) : Promise.resolve(),
  ])

  return { ok: true }
}
