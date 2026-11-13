import { Resend } from "resend"
import type { ReactElement } from "react"
import { getAppUrl, SUPPORT_EMAIL } from "@/lib/urls"
import { SubscriptionConfirmationEmail } from "@/emails/subscription-confirmation"
import { PaymentFailedEmail } from "@/emails/payment-failed"
import { SubscriptionCancelledEmail } from "@/emails/subscription-cancelled"
import { RenewalReminderEmail } from "@/emails/renewal-reminder"
import { ResetPasswordEmail } from "@/emails/reset-password"
import { VerifyEmailEmail } from "@/emails/verify-email"
import { WelcomeEmail } from "@/emails/welcome"
import { formatColombiaDate } from "@/lib/dates"
import { reportError } from "@/lib/report-error"

// Instantiated lazily inside each function so the build doesn't require
// RESEND_API_KEY at module-load time (Next.js collects route data during build).
// Must be a verified Resend domain — gmail.com can't be verified, so sending
// from it returns 403.
const FROM = "Conexory <no-reply@conexory.com>"

function resend() {
  return new Resend(process.env.RESEND_API_KEY)
}

type Message = { to: string; subject: string; react: ReactElement }

// Resend reports failures in the returned { error } instead of throwing, so
// without this check a failed reset or verification email leaves no trace.
// The recipient stays out of the report.
async function deliver(template: string, message: Message) {
  // Only SUPPORT_EMAIL receives mail on conexory.com: a reply to no-reply@
  // would bounce, so replies are routed to support.
  const { error } = await resend().emails.send({ from: FROM, replyTo: SUPPORT_EMAIL, ...message })
  if (error) {
    await reportError(`Email failed to send: ${template}`, undefined, {
      template,
      errorName: error.name,
      errorMessage: redactEmails(error.message),
    })
  }
}

function redactEmails(text: string) {
  return text.replace(/[^\s@<>"']+@[^\s@<>"']+/g, "[email]")
}

export async function sendWelcome(email: string, name: string) {
  const appUrl = getAppUrl()
  await deliver("welcome", {
    to: email,
    subject: "Bienvenido a Conexory",
    react: WelcomeEmail({ name, appUrl }),
  })
}

export async function sendSubscriptionConfirmation(email: string, name: string) {
  const appUrl = getAppUrl()
  await deliver("subscription_confirmation", {
    to: email,
    subject: "¡Bienvenido a Conexory Pro!",
    react: SubscriptionConfirmationEmail({ name, appUrl }),
  })
}

export async function sendPaymentFailed(email: string, name: string) {
  const appUrl = getAppUrl()
  await deliver("payment_failed", {
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
  const date = formatColombiaDate(periodEnd, {
    day: "numeric",
    month: "long",
  })
  await deliver("renewal_reminder", {
    to: email,
    subject: "Tu plan Pro de Conexory se renueva pronto",
    react: RenewalReminderEmail({ name, date, hasPaymentMethod, appUrl }),
  })
}

export async function sendSubscriptionCancelled(email: string, name: string) {
  const appUrl = getAppUrl()
  await deliver("subscription_cancelled", {
    to: email,
    subject: "Tu plan Pro de Conexory fue cancelado",
    react: SubscriptionCancelledEmail({ name, appUrl }),
  })
}

export async function sendResetPasswordEmail(email: string, name: string, url: string) {
  const appUrl = getAppUrl()
  await deliver("reset_password", {
    to: email,
    subject: "Recupera tu contraseña de Conexory",
    react: ResetPasswordEmail({ name, url, appUrl }),
  })
}

export async function sendVerificationEmail(email: string, name: string, url: string) {
  const appUrl = getAppUrl()
  await deliver("verify_email", {
    to: email,
    subject: "Confirma tu correo de Conexory",
    react: VerifyEmailEmail({ name, url, appUrl }),
  })
}
