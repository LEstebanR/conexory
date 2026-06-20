import crypto from "crypto"

const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY ?? ""
const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET ?? ""
const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET ?? ""

const CHECKOUT_BASE = "https://checkout.wompi.co/p/"

export const PRO_AMOUNT_CENTS = 9_999_900 // $99.999 COP
const CURRENCY = "COP"

export function buildCheckoutUrl({
  reference,
  redirectUrl,
  customerEmail,
}: {
  reference: string
  redirectUrl: string
  customerEmail: string
}): string {
  const integrityInput = `${reference}${PRO_AMOUNT_CENTS}${CURRENCY}${WOMPI_INTEGRITY_SECRET}`
  const integrityHash = crypto
    .createHash("sha256")
    .update(integrityInput)
    .digest("hex")

  // Build the URL manually: URLSearchParams encodes colons in keys (%3A) but
  // Wompi's checkout expects literal colons in parameter names like
  // "signature:integrity" and "customer-data:email".
  const parts = [
    `public-key=${encodeURIComponent(WOMPI_PUBLIC_KEY)}`,
    `currency=${CURRENCY}`,
    `amount-in-cents=${PRO_AMOUNT_CENTS}`,
    `reference=${encodeURIComponent(reference)}`,
    `signature:integrity=${integrityHash}`,
    `redirect-url=${encodeURIComponent(redirectUrl)}`,
    `customer-data:email=${encodeURIComponent(customerEmail)}`,
  ]

  return `${CHECKOUT_BASE}?${parts.join("&")}`
}

export function verifyWebhookSignature(_bodyText: string, checksum: string): boolean {
  if (!WOMPI_EVENTS_SECRET || !checksum) return false

  // Wompi sends the plain events secret in the x-event-secret header.
  // Hash both sides to a fixed length before comparing to avoid timing leaks.
  const expected = crypto.createHash("sha256").update(WOMPI_EVENTS_SECRET).digest("hex")
  const received = crypto.createHash("sha256").update(checksum).digest("hex")

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))
  } catch {
    return false
  }
}

export function makeSubscriptionReference(userId: string): string {
  return `pro-${userId}-${Date.now()}`
}
