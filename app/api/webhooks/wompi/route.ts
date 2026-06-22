import { prisma } from "@/lib/prisma"
import { verifyWebhookSignature } from "@/lib/wompi"
import { sendSubscriptionConfirmation, sendPaymentFailed } from "@/lib/email"

export async function POST(req: Request) {
  const bodyText = await req.text()
  const checksum = req.headers.get("x-event-secret") ?? ""

  const secretEnv = process.env.WOMPI_EVENTS_SECRET ?? ""
  console.log("[wompi-webhook] secret_set:", secretEnv.length > 0, "secret_len:", secretEnv.length)
  console.log("[wompi-webhook] checksum_len:", checksum.length, "checksum_prefix:", checksum.slice(0, 12))
  console.log("[wompi-webhook] headers:", JSON.stringify(Object.fromEntries(req.headers)))

  if (!verifyWebhookSignature(bodyText, checksum)) {
    return new Response(null, { status: 401 })
  }

  let event: WompiEvent
  try {
    event = JSON.parse(bodyText)
  } catch {
    return new Response("invalid json", { status: 400 })
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
    await handleApproved(userId, transaction.reference)
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

async function handleApproved(userId: string | null, reference: string) {
  if (!userId) return

  const periodEnd = new Date()
  periodEnd.setDate(periodEnd.getDate() + 30)

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
        wompiReference: reference,
        currentPeriodEnd: periodEnd,
      },
      update: {
        status: "active",
        wompiReference: reference,
        currentPeriodEnd: periodEnd,
      },
    }),
  ])

  await sendSubscriptionConfirmation(user.email, user.name).catch(() => null)
}

async function handleDeclined(userId: string | null) {
  if (!userId) return

  const [user] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    }),
    prisma.subscription.updateMany({
      where: { userId },
      data: { status: "past_due" },
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
}
