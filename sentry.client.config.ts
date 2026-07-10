import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: !!process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Replay only on errors to keep quota low
  integrations: [Sentry.replayIntegration()],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
})
