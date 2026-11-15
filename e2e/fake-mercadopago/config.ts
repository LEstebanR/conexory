export const FAKE_MP_PORT = 4010
// 127.0.0.1, not localhost: the fake only binds IPv4 and Node may resolve
// localhost to ::1 first.
export const FAKE_MP_URL = `http://127.0.0.1:${FAKE_MP_PORT}`

export const FAKE_MP_ENV = {
  MERCADOPAGO_API_BASE: FAKE_MP_URL,
  MERCADOPAGO_ACCESS_TOKEN: "e2e-fake-access-token",
  MERCADOPAGO_WEBHOOK_SECRET: "e2e-fake-webhook-secret",
  NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: "TEST-e2e-fake-public-key",
}

export const E2E_DEV_SERVER_ENV = { ...FAKE_MP_ENV, DISABLE_EMAIL_DELIVERY: "1" }
