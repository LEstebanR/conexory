import crypto from "crypto"

const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY ?? ""
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY ?? ""
const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET ?? ""
const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET ?? ""

export const PRO_AMOUNT_CENTS = 9_999_900 // $99.999 COP
const CURRENCY = "COP"

// Wompi has no hosted "plans/subscriptions" product: recurring billing is done by
// tokenizing the card into a payment source and charging it from the server every
// cycle. The public key prefix decides the environment (pub_prod_* → production).
function wompiApiBase(): string {
  return WOMPI_PUBLIC_KEY.startsWith("pub_prod")
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1"
}

function resolvePath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

// Wompi signs each event with a checksum in the body (the secret is never sent in
// a header): SHA256 of the concatenated values of signature.properties (paths into
// `data`, in order) + timestamp + events secret.
export function verifyWompiEvent(event: {
  data: unknown
  signature?: { properties: string[]; checksum: string }
  timestamp?: number
}): boolean {
  if (!WOMPI_EVENTS_SECRET) return false
  const sig = event.signature
  if (!sig?.properties || !sig.checksum || event.timestamp == null) return false

  const concatenated = sig.properties
    .map((path) => String(resolvePath(event.data, path) ?? ""))
    .join("")
  const computed = crypto
    .createHash("sha256")
    .update(`${concatenated}${event.timestamp}${WOMPI_EVENTS_SECRET}`)
    .digest("hex")

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed.toLowerCase()),
      Buffer.from(sig.checksum.toLowerCase()),
    )
  } catch {
    return false
  }
}

export function makeSubscriptionReference(userId: string): string {
  return `pro-${userId}-${Date.now()}`
}

// Every transaction / payment source must carry fresh acceptance tokens (the
// user's acceptance of Wompi's terms and personal-data processing). They are
// short-lived, so fetch them right before use.
async function fetchAcceptanceTokens(): Promise<{
  acceptance: string
  personalAuth: string
} | null> {
  const res = await fetch(`${wompiApiBase()}/merchants/${WOMPI_PUBLIC_KEY}`, {
    cache: "no-store",
  })
  if (!res.ok) return null
  const json = (await res.json()) as {
    data?: {
      presigned_acceptance?: { acceptance_token?: string }
      presigned_personal_data_auth?: { acceptance_token?: string }
    }
  }
  const acceptance = json.data?.presigned_acceptance?.acceptance_token
  const personalAuth =
    json.data?.presigned_personal_data_auth?.acceptance_token
  if (!acceptance || !personalAuth) return null
  return { acceptance, personalAuth }
}

export type PaymentSourceType = "CARD" | "NEQUI"

export interface PaymentSourceResult {
  ok: boolean
  paymentSourceId?: number
  status?: string
  error?: string
}

// Turns a single-use token (produced by Wompi's tokenization widget — our server
// never sees the card/Nequi credentials) into a reusable payment source we can
// charge every month. Must run server-side: it uses the private key. The widget
// runs 3DS (card) / approval (Nequi) during tokenization, so the source normally
// comes back AVAILABLE.
export async function createPaymentSource({
  token,
  customerEmail,
  type,
}: {
  token: string
  customerEmail: string
  type: PaymentSourceType
}): Promise<PaymentSourceResult> {
  if (!WOMPI_PRIVATE_KEY) return { ok: false, error: "missing_private_key" }

  const tokens = await fetchAcceptanceTokens()
  if (!tokens) {
    console.error("[wompi] createPaymentSource: acceptance tokens failed")
    return { ok: false, error: "acceptance_token_failed" }
  }

  const res = await fetch(`${wompiApiBase()}/payment_sources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
    },
    body: JSON.stringify({
      type,
      token,
      customer_email: customerEmail,
      acceptance_token: tokens.acceptance,
      accept_personal_auth: tokens.personalAuth,
    }),
    cache: "no-store",
  })

  const raw = await res.text()
  const json = (() => {
    try {
      return JSON.parse(raw) as {
        data?: { id?: number; status?: string }
        error?: { reason?: string }
      }
    } catch {
      return null
    }
  })()

  if (!res.ok || !json?.data?.id) {
    console.error(
      "[wompi] createPaymentSource failed:",
      res.status,
      raw.slice(0, 500),
    )
    return { ok: false, error: json?.error?.reason ?? `http_${res.status}` }
  }

  return { ok: true, paymentSourceId: json.data.id, status: json.data.status }
}

export interface RecurringChargeResult {
  ok: boolean
  transactionId?: string
  status?: string
  error?: string
}

// Charges a previously tokenized card (payment source) for the monthly Pro fee.
// The transaction starts PENDING and resolves asynchronously via the webhook, so
// callers should treat a successful POST as "charge initiated", not "paid".
export async function chargeRecurringPayment({
  paymentSourceId,
  reference,
  customerEmail,
  type,
}: {
  paymentSourceId: number
  reference: string
  customerEmail: string
  type: PaymentSourceType
}): Promise<RecurringChargeResult> {
  if (!WOMPI_PRIVATE_KEY) return { ok: false, error: "missing_private_key" }

  const tokens = await fetchAcceptanceTokens()
  if (!tokens) return { ok: false, error: "acceptance_token_failed" }

  const signature = crypto
    .createHash("sha256")
    .update(`${reference}${PRO_AMOUNT_CENTS}${CURRENCY}${WOMPI_INTEGRITY_SECRET}`)
    .digest("hex")

  const res = await fetch(`${wompiApiBase()}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
    },
    body: JSON.stringify({
      acceptance_token: tokens.acceptance,
      amount_in_cents: PRO_AMOUNT_CENTS,
      currency: CURRENCY,
      customer_email: customerEmail,
      reference,
      payment_source_id: paymentSourceId,
      recurrent: true,
      // Card charges require an installment count (1 for a monthly sub); Nequi
      // has no installments and the payment source already implies the method.
      ...(type === "CARD" ? { payment_method: { installments: 1 } } : {}),
      signature,
    }),
    cache: "no-store",
  })

  const raw = await res.text()
  const json = (() => {
    try {
      return JSON.parse(raw) as {
        data?: { id?: string; status?: string }
        error?: { reason?: string }
      }
    } catch {
      return null
    }
  })()

  if (!res.ok) {
    console.error("[wompi] chargeRecurringPayment failed:", res.status, raw.slice(0, 500))
    return { ok: false, error: json?.error?.reason ?? `http_${res.status}` }
  }

  return {
    ok: true,
    transactionId: json?.data?.id,
    status: json?.data?.status,
  }
}
