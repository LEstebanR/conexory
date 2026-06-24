import { prisma } from "@/lib/prisma"
import {
  createPaymentSource,
  chargeRecurringPayment,
  makeSubscriptionReference,
} from "@/lib/wompi"

export type ActivationResult =
  | { ok: true }
  | { ok: false; reason: "3ds" | "source_failed" | "charge_failed" }

// Shared card-activation flow: turn a tokenized card into a payment source, store
// it, and charge the first month. The webhook flips isPremium / currentPeriodEnd
// once Wompi confirms the charge as APPROVED.
export async function activateCardSubscription({
  userId,
  email,
  token,
}: {
  userId: string
  email: string
  token: string
}): Promise<ActivationResult> {
  const source = await createPaymentSource({ token, customerEmail: email })
  if (!source.ok || !source.paymentSourceId) {
    return { ok: false, reason: "source_failed" }
  }

  // With forced 3DS the source comes back PENDING and needs an in-browser
  // challenge the tokenization widget normally resolves; if it didn't, bail out
  // toward the manual methods instead of charging an unusable card.
  if (source.status && source.status !== "AVAILABLE") {
    return { ok: false, reason: "3ds" }
  }

  // Persist the reusable card before charging so a slow/lost webhook never leaves
  // us without the token needed to bill next month. status "incomplete" keeps the
  // cron from touching it until the first charge is confirmed.
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      status: "incomplete",
      wompiPaymentSourceId: source.paymentSourceId,
    },
    update: {
      status: "incomplete",
      wompiPaymentSourceId: source.paymentSourceId,
      pastDueSince: null,
    },
  })

  const charge = await chargeRecurringPayment({
    paymentSourceId: source.paymentSourceId,
    reference: makeSubscriptionReference(userId),
    customerEmail: email,
  })
  if (!charge.ok) return { ok: false, reason: "charge_failed" }

  return { ok: true }
}
