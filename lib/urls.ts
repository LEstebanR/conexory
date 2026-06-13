// Canonical public URL, resolved server-side. Prefers the production domain
// even from a preview so shared property links stay stable, not ephemeral.
// (better-auth's origin check is separate — it needs the current deploy host.)
export function getAppUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}
