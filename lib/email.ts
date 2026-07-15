import { Resend } from "resend"
import { getAppUrl } from "@/lib/urls"
import { SubscriptionConfirmationEmail } from "@/emails/subscription-confirmation"
import { PaymentFailedEmail } from "@/emails/payment-failed"
import { SubscriptionCancelledEmail } from "@/emails/subscription-cancelled"
import { RenewalReminderEmail } from "@/emails/renewal-reminder"
import { ResetPasswordEmail } from "@/emails/reset-password"
import { WelcomeEmail } from "@/emails/welcome"

// Instantiated lazily inside each function so the build doesn't require
// RESEND_API_KEY at module-load time (Next.js collects route data during build).
// Must be a verified Resend domain — gmail.com can't be verified, so sending
// from it returns 403. conexory.com is verified; the team still *receives* at
// the gmail inbox below.
const FROM = "Conexory <no-reply@conexory.com>"
const TEAM_INBOX = "Conexory@gmail.com"

function resend() {
  return new Resend(process.env.RESEND_API_KEY)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export async function sendSuggestionNotification(content: string, email?: string | null) {
  await resend().emails.send({
    from: FROM,
    to: TEAM_INBOX,
    replyTo: email || undefined,
    subject: "Nueva sugerencia desde el roadmap",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#000">
        <h1 style="font-size:22px;font-weight:900;margin-bottom:16px">
          Nueva sugerencia 💡
        </h1>
        <p style="color:#000;font-size:15px;line-height:1.6;white-space:pre-wrap;background:#f3f3f3;border-radius:12px;padding:16px;margin:0 0 16px">${escapeHtml(content)}</p>
        <p style="color:#5e5e5e;font-size:14px;margin:0">
          ${email ? `De: <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>` : "Sin email de contacto."}
        </p>
        <p style="color:#afafaf;font-size:12px;margin-top:32px">
          Conexory · Roadmap
        </p>
      </div>
    `,
  })
}

export async function sendWelcome(email: string, name: string) {
  const appUrl = getAppUrl()
  await resend().emails.send({
    from: FROM,
    to: email,
    subject: "Bienvenido a Conexory",
    react: WelcomeEmail({ name, appUrl }),
  })
}

export async function sendSubscriptionConfirmation(email: string, name: string) {
  const appUrl = getAppUrl()
  await resend().emails.send({
    from: FROM,
    to: email,
    subject: "¡Bienvenido a Conexory Pro!",
    react: SubscriptionConfirmationEmail({ name, appUrl }),
  })
}

export async function sendPaymentFailed(email: string, name: string) {
  const appUrl = getAppUrl()
  await resend().emails.send({
    from: FROM,
    to: email,
    subject: "No pudimos cobrar tu plan Pro de Conexory",
    react: PaymentFailedEmail({ name, appUrl }),
  })
}

export async function sendRenewalReminder(
  email: string,
  name: string,
  periodEnd: Date,
  hasPaymentMethod: boolean,
) {
  const appUrl = getAppUrl()
  const date = periodEnd.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
  })
  await resend().emails.send({
    from: FROM,
    to: email,
    subject: "Tu plan Pro de Conexory se renueva pronto",
    react: RenewalReminderEmail({ name, date, hasPaymentMethod, appUrl }),
  })
}

export async function sendSubscriptionCancelled(email: string, name: string) {
  const appUrl = getAppUrl()
  await resend().emails.send({
    from: FROM,
    to: email,
    subject: "Tu plan Pro de Conexory fue cancelado",
    react: SubscriptionCancelledEmail({ name, appUrl }),
  })
}

export async function sendResetPasswordEmail(email: string, name: string, url: string) {
  const appUrl = getAppUrl()
  await resend().emails.send({
    from: FROM,
    to: email,
    subject: "Recupera tu contraseña de Conexory",
    react: ResetPasswordEmail({ name, url, appUrl }),
  })
}
