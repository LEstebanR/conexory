import { FAKE_MP_PORT } from "./config"

// In-memory stand-in for the slice of Mercado Pago's REST API that
// lib/mercadopago.ts calls. Card tokens are "e2e-{brand}-{last4}" (minted by
// the fake browser SDK in e2e/helpers/mercadopago.ts), so brand and last four
// digits are derived from the token instead of stored. /__control/* routes
// let specs set up scenarios Mercado Pago would drive on its own side.

interface Preapproval {
  id: string
  status: string
  external_reference: string
  payer_email: string
  date_created: string
  payment_method_id: string
  last_four_digits: string
  transaction_amount: number
}

interface Payment {
  id: string
  status: string
  external_reference: string
  preapproval_id: string
  transaction_amount: number
  payment_method_id: string
  card: { last_four_digits: string }
}

const preapprovals = new Map<string, Preapproval>()
const payments = new Map<string, Payment>()
const requestLog: string[] = []
// Keyed by payer so a forced failure a test never consumed can't leak into
// the next test's user.
const failingPayers = new Set<string>()
let sequence = 0

function nextId(prefix: string): string {
  sequence += 1
  return `${prefix}${Date.now()}${sequence}`
}

function parseCardToken(token: string): { brand: string; lastFour: string } {
  const [, brand = "visa", lastFour = "0000"] = token.split("-")
  return { brand, lastFour }
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status })
}

const notFound = () => json({ message: "not found" }, 404)

async function handle(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const path = url.pathname
  const method = req.method
  requestLog.push(`${method} ${path}`)

  if (path === "/__health") return json({ ok: true })

  if (method === "GET" && path === "/__control/requests") return json(requestLog)

  if (method === "POST" && path === "/__control/fail-preapproval") {
    failingPayers.add(((await req.json()) as { payerEmail: string }).payerEmail)
    return json({ ok: true })
  }

  if (method === "POST" && path === "/__control/payments") {
    const { preapprovalId, status } = (await req.json()) as { preapprovalId: string; status: string }
    const preapproval = preapprovals.get(preapprovalId)
    if (!preapproval) return notFound()
    const payment: Payment = {
      id: nextId("9"),
      status,
      external_reference: preapproval.external_reference,
      preapproval_id: preapproval.id,
      transaction_amount: preapproval.transaction_amount,
      payment_method_id: preapproval.payment_method_id,
      card: { last_four_digits: preapproval.last_four_digits },
    }
    payments.set(payment.id, payment)
    return json(payment, 201)
  }

  if (method === "POST" && path === "/preapproval") {
    const body = (await req.json()) as {
      external_reference: string
      payer_email: string
      card_token_id: string
      auto_recurring: { transaction_amount: number }
    }
    if (failingPayers.delete(body.payer_email)) return json({ message: "e2e forced failure" }, 400)
    const preapproval: Preapproval = {
      id: nextId("e2epre"),
      status: "authorized",
      external_reference: body.external_reference,
      payer_email: body.payer_email,
      date_created: new Date().toISOString(),
      payment_method_id: parseCardToken(body.card_token_id).brand,
      last_four_digits: parseCardToken(body.card_token_id).lastFour,
      transaction_amount: body.auto_recurring.transaction_amount,
    }
    preapprovals.set(preapproval.id, preapproval)
    return json(preapproval, 201)
  }

  if (method === "GET" && path === "/preapproval/search") {
    const status = url.searchParams.get("status")
    return json({ results: [...preapprovals.values()].filter((p) => p.status === status) })
  }

  const preapprovalMatch = path.match(/^\/preapproval\/([^/]+)$/)
  if (preapprovalMatch) {
    const preapproval = preapprovals.get(preapprovalMatch[1])
    if (!preapproval) return notFound()
    if (method === "GET") return json(preapproval)
    if (method === "PUT") {
      const body = (await req.json()) as { status?: string; card_token_id?: string }
      if (body.status) preapproval.status = body.status
      if (body.card_token_id) {
        const card = parseCardToken(body.card_token_id)
        preapproval.payment_method_id = card.brand
        preapproval.last_four_digits = card.lastFour
      }
      return json(preapproval)
    }
  }

  const cardTokenMatch = path.match(/^\/v1\/card_tokens\/([^/]+)$/)
  if (method === "GET" && cardTokenMatch) {
    return json({ id: cardTokenMatch[1], last_four_digits: parseCardToken(cardTokenMatch[1]).lastFour })
  }

  const paymentMatch = path.match(/^\/v1\/payments\/([^/]+)$/)
  if (method === "GET" && paymentMatch) {
    return payments.get(paymentMatch[1]) ? json(payments.get(paymentMatch[1])) : notFound()
  }

  return notFound()
}

Bun.serve({ hostname: "127.0.0.1", port: FAKE_MP_PORT, fetch: handle })
console.log(`[fake-mercadopago] listening on ${FAKE_MP_PORT}`)
