import { Resend } from "resend"

// Instantiated lazily inside each function so the build doesn't require
// RESEND_API_KEY at module-load time (Next.js collects route data during build).
const FROM = "Conexory <Conexory@gmail.com>"
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

export async function sendSubscriptionConfirmation(email: string, name: string) {
  const firstName = name.split(" ")[0]
  await resend().emails.send({
    from: FROM,
    to: email,
    subject: "¡Bienvenido a Conexory Pro!",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#000">
        <h1 style="font-size:28px;font-weight:900;margin-bottom:8px">
          Hola, ${firstName} 👋
        </h1>
        <p style="color:#5e5e5e;margin-bottom:24px">
          Tu suscripción al plan Pro de Conexory está activa.
          Ahora puedes publicar hasta 50 propiedades con 20 fotos cada una.
        </p>
        <a href="https://conexory.com/dashboard"
           style="display:inline-block;background:#000;color:#fff;padding:12px 24px;
                  border-radius:999px;text-decoration:none;font-weight:700">
          Ir al dashboard
        </a>
        <p style="color:#afafaf;font-size:12px;margin-top:32px">
          Conexory · Colombia · Si tienes dudas escríbenos a Conexory@gmail.com
        </p>
      </div>
    `,
  })
}

export async function sendRenewalReminder(
  email: string,
  name: string,
  periodEnd: Date,
) {
  const firstName = name.split(" ")[0]
  const date = periodEnd.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
  })
  await resend().emails.send({
    from: FROM,
    to: email,
    subject: "Tu plan Pro de Conexory se renueva pronto",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#000">
        <h1 style="font-size:28px;font-weight:900;margin-bottom:8px">
          Hola, ${firstName}
        </h1>
        <p style="color:#5e5e5e;margin-bottom:24px">
          El ${date} renovaremos tu plan Pro de Conexory por $99.999 COP
          con la tarjeta que tienes registrada. No tienes que hacer nada para
          continuar; si quieres cancelar, puedes hacerlo desde el dashboard.
        </p>
        <a href="https://conexory.com/dashboard"
           style="display:inline-block;background:#000;color:#fff;padding:12px 24px;
                  border-radius:999px;text-decoration:none;font-weight:700">
          Ir al dashboard
        </a>
        <p style="color:#afafaf;font-size:12px;margin-top:32px">
          Conexory · Colombia · Si tienes dudas escríbenos a Conexory@gmail.com
        </p>
      </div>
    `,
  })
}

export async function sendPaymentFailed(email: string, name: string) {
  const firstName = name.split(" ")[0]
  await resend().emails.send({
    from: FROM,
    to: email,
    subject: "Problema con tu pago de Conexory Pro",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#000">
        <h1 style="font-size:28px;font-weight:900;margin-bottom:8px">
          Hola, ${firstName}
        </h1>
        <p style="color:#5e5e5e;margin-bottom:24px">
          No pudimos procesar el cobro mensual de tu plan Pro.
          Por favor actualiza tu método de pago para no perder el acceso.
        </p>
        <a href="https://conexory.com/dashboard/upgrade"
           style="display:inline-block;background:#000;color:#fff;padding:12px 24px;
                  border-radius:999px;text-decoration:none;font-weight:700">
          Renovar plan Pro
        </a>
        <p style="color:#afafaf;font-size:12px;margin-top:32px">
          Conexory · Colombia · Si tienes dudas escríbenos a Conexory@gmail.com
        </p>
      </div>
    `,
  })
}
