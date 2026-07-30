import crypto from "crypto"

const PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ?? ""
const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET ?? ""

const API_BASE = "https://api.mercadopago.com"

// Mercado Pago's sandbox test card; approves when cardholderName is "APRO".
export const TEST_CARD = {
  cardNumber: "5031755734530604",
  cardholderName: "APRO",
  expirationMonth: 11,
  expirationYear: 2030,
  securityCode: "123",
  identificationType: "CC",
  identificationNumber: "12345678",
}

export async function tokenizeTestCard(): Promise<string> {
  const res = await fetch(`${API_BASE}/v1/card_tokens?public_key=${encodeURIComponent(PUBLIC_KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      card_number: TEST_CARD.cardNumber,
      cardholder: {
        name: TEST_CARD.cardholderName,
        identification: {
          type: TEST_CARD.identificationType,
          number: TEST_CARD.identificationNumber,
        },
      },
      expiration_month: TEST_CARD.expirationMonth,
      expiration_year: TEST_CARD.expirationYear,
      security_code: TEST_CARD.securityCode,
    }),
  })

  const json = (await res.json()) as { id?: string; message?: string }
  if (!res.ok || !json.id) {
    throw new Error(`tokenizeTestCard failed: ${res.status} ${JSON.stringify(json)}`)
  }
  return json.id
}

// Mirrors verifyMercadoPagoWebhook() in lib/mercadopago.ts.
function signWebhook(dataId: string, requestId: string) {
  const ts = Math.floor(Date.now() / 1000).toString()
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`
  const v1 = crypto.createHmac("sha256", WEBHOOK_SECRET).update(manifest).digest("hex")
  return `ts=${ts},v1=${v1}`
}

export async function sendMercadoPagoWebhook(
  baseURL: string,
  { type, dataId }: { type: "payment" | "subscription_preapproval"; dataId: string }
): Promise<Response> {
  const requestId = `e2e-${Date.now()}`
  const signature = signWebhook(dataId, requestId)

  return fetch(`${baseURL}/api/webhooks/mercadopago`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-signature": signature,
      "x-request-id": requestId,
    },
    body: JSON.stringify({ type, data: { id: dataId } }),
  })
}
