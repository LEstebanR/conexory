import { prisma } from "@/lib/prisma"
import { verifyWompiEvent } from "@/lib/wompi"
import { sendSubscriptionConfirmation, sendPaymentFailed } from "@/lib/email"

export async function POST(req: Request) {
  const bodyText = await req.text()

  let event: WompiEvent
  try {
    event = JSON.parse(bodyText)
  } catch {
    return new Response("invalid json", { status: 400 })
  }

  if (!verifyWompiEvent(event)) {
    return new Response(null, { status: 401 })
  }

  const eventType = event.event
  const transaction = event.data?.transaction
  const subscription = event.data?.subscription

  // Use the most specific external ID available
  const externalId =
    transaction?.id ?? subscription?.id ?? `${eventType}-${Date.now()}`

  // Idempotency: if already processed, return 200 silently
  try {
    await prisma.paymentEvent.create({
      data: {
        externalId,
        type: eventType,
        status: transaction?.status ?? subscription?.status ?? "UNKNOWN",
        amountCents: transaction?.amount_in_cents ?? null,
        payload: event as object,
      },
    })
  } catch (e: unknown) {
    if (isUniqueConstraintError(e)) return new Response(null, { status: 200 })
    throw e
  }

  // Resolve userId from the reference field (format: "pro-{userId}-{timestamp}")
  const reference: string =
    transaction?.reference ?? subscription?.reference ?? ""
  const userId = referenceToUserId(reference)

  // Link event to user if we can resolve it
  if (userId) {
    await prisma.paymentEvent
      .update({ where: { externalId }, data: { userId } })
      .catch(() => null)
  }

  if (eventType === "transaction.updated" && transaction?.status === "APPROVED") {
    await handleApproved(userId, transaction)
  } else if (
    eventType === "transaction.updated" &&
    (transaction?.status === "DECLINED" || transaction?.status === "VOIDED")
  ) {
    await handleDeclined(userId)
  } else if (eventType === "subscription.cancelled") {
    await handleCancelled(userId)
  }

  return new Response(null, { status: 200 })
}

async function handleApproved(userId: string | null, transaction: WompiTransaction) {
  if (!userId) return

  const existing = await prisma.subscription.findUnique({
    where: { userId },
    select: { currentPeriodEnd: true, status: true },
  })

  // Extend from the later of now / current period end so renewals charged a few
  // days early don't lose the remaining days of the running period.
  const base =
    existing?.currentPeriodEnd && existing.currentPeriodEnd > new Date()
      ? existing.currentPeriodEnd
      : new Date()
  const periodEnd = new Date(base)
  periodEnd.setDate(periodEnd.getDate() + 30)

  const isRenewal =
    existing?.status === "active" &&
    !!existing.currentPeriodEnd &&
    existing.currentPeriodEnd > new Date()

  const paymentSourceId = transaction.payment_source_id ?? undefined

  const [user] = await Promise.all([
    prisma.user.update({
      where: { id: userId },
      data: { isPremium: true },
      select: { email: true, name: true },
    }),
    prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        status: "active",
        wompiReference: transaction.reference,
        wompiPaymentSourceId: paymentSourceId,
        currentPeriodEnd: periodEnd,
        lastChargeAt: new Date(),
      },
      update: {
        status: "active",
        wompiReference: transaction.reference,
        currentPeriodEnd: periodEnd,
        pastDueSince: null,
        renewalReminderSentAt: null,
        lastChargeAt: new Date(),
        // Only overwrite the stored payment source when Wompi gives us one, so a
        // renewal charge that omits it doesn't wipe the token we already hold.
        ...(paymentSourceId !== undefined
          ? { wompiPaymentSourceId: paymentSourceId }
          : {}),
      },
    }),
  ])

  if (!isRenewal) {
    await sendSubscriptionConfirmation(user.email, user.name).catch(() => null)
  }
}

async function handleDeclined(userId: string | null) {
  if (!userId) return

  const [user] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    }),
    prisma.subscription.updateMany({
      // Stamp pastDueSince only on the first failure so the grace window is
      // measured from when the trouble started, not from each retry.
      where: { userId, pastDueSince: null },
      data: { status: "past_due", pastDueSince: new Date() },
    }),
  ])

  if (user) {
    await sendPaymentFailed(user.email, user.name).catch(() => null)
  }
}

async function handleCancelled(userId: string | null) {
  if (!userId) return

  await Promise.all([
    prisma.user.update({
      where: { id: userId },
      data: { isPremium: false },
    }),
    prisma.subscription.updateMany({
      where: { userId },
      data: { status: "cancelled", currentPeriodEnd: null },
    }),
  ])
}

function referenceToUserId(reference: string): string | null {
  // reference format: "pro-{userId}-{timestamp}"
  const match = reference.match(/^pro-([^-]+(?:-[^-]+)*)-\d+$/)
  if (!match) return null
  // userId is a cuid like "cm..." — extract everything between "pro-" and the last "-{timestamp}"
  const parts = reference.split("-")
  if (parts.length < 3) return null
  return parts.slice(1, -1).join("-")
}

function isUniqueConstraintError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === "P2002"
  )
}

// Minimal Wompi event types
interface WompiTransaction {
  id: string
  reference: string
  status: string
  amount_in_cents: number
  payment_source_id?: number | null
}

interface WompiSubscription {
  id: string
  reference: string
  status: string
}

interface WompiEvent {
  event: string
  data: {
    transaction?: WompiTransaction
    subscription?: WompiSubscription
  }
  signature?: {
    properties: string[]
    checksum: string
  }
  timestamp?: number
}
