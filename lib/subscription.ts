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
// carries an id, not a full payload) can find the right user later. The
// preapproval is created "authorized" — Mercado Pago charges the first
// installment asynchronously (within about an hour) and drives every future
// recurring charge itself, notifying us via webhook instead of us
// cron-charging a stored token.
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

  // status "incomplete" until the webhook confirms the first charge — mirrors
  // the Wompi flow so downstream cron logic (expireCanceled, downgradeExpired)
  // didn't need to change.
  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, status: "incomplete", mpPreapprovalId: result.preapprovalId },
    update: { status: "incomplete", mpPreapprovalId: result.preapprovalId, pastDueSince: null },
  })

  return { ok: true }
}
