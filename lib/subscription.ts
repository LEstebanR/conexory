import { prisma } from "@/lib/prisma"
import { FREE_PROPERTY_LIMIT } from "@/lib/plans"
import {
  createPaymentSource,
  chargeRecurringPayment,
  makeSubscriptionReference,
  type PaymentSourceType,
} from "@/lib/wompi"

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

export type ActivationResult =
  | { ok: true }
  | { ok: false; reason: "pending" | "source_failed" | "charge_failed" }

// Shared activation flow: turn a tokenized card/Nequi into a payment source,
// store it (with its type, so renewals charge it the right way), and charge the
// first month. The webhook flips isPremium / currentPeriodEnd once Wompi confirms
// the charge as APPROVED.
export async function activateSubscription({
  userId,
  email,
  token,
  type,
}: {
  userId: string
  email: string
  token: string
  type: PaymentSourceType
}): Promise<ActivationResult> {
  const source = await createPaymentSource({ token, customerEmail: email, type })
  if (!source.ok || !source.paymentSourceId) {
    return { ok: false, reason: "source_failed" }
  }

  // The source should come back AVAILABLE (the widget handles card 3DS / Nequi
  // approval). If it's still PENDING we can't charge it, so bail out cleanly.
  if (source.status && source.status !== "AVAILABLE") {
    return { ok: false, reason: "pending" }
  }

  // Persist the reusable source before charging so a slow/lost webhook never
  // leaves us without the token needed to bill next month. status "incomplete"
  // keeps the cron from touching it until the first charge is confirmed.
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      status: "incomplete",
      wompiPaymentSourceId: source.paymentSourceId,
      wompiPaymentSourceType: type,
    },
    update: {
      status: "incomplete",
      wompiPaymentSourceId: source.paymentSourceId,
      wompiPaymentSourceType: type,
      pastDueSince: null,
    },
  })

  const charge = await chargeRecurringPayment({
    paymentSourceId: source.paymentSourceId,
    reference: makeSubscriptionReference(userId),
    customerEmail: email,
    type,
  })
  if (!charge.ok) return { ok: false, reason: "charge_failed" }

  return { ok: true }
}
