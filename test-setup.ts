// Preloaded before every test file (see bunfig.toml [test] preload) so any
// module that reads these at import time — real or mocked — captures the
// same known values regardless of which test file imports it first.
process.env.MERCADOPAGO_ACCESS_TOKEN = "test_access_token_stub"
process.env.MERCADOPAGO_WEBHOOK_SECRET = "test_webhook_secret"

import { mock } from "bun:test"

// Centralized here (rather than per test file) for the same reason as the env
// vars above: mock.module() replaces a module process-wide, not per file, so
// every test file mocking "next/headers"/"next/navigation" independently
// would race to decide the shared behavior. Both are simple enough that one
// shared implementation covers every action test.
mock.module("next/headers", () => ({
  headers: () => Promise.resolve(new Headers()),
}))

mock.module("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`)
  },
}))

mock.module("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(data), {
        status: init?.status ?? 200,
        headers: { "content-type": "application/json" },
      }),
  },
}))
