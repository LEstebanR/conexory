import { Resend } from "resend"

// Instantiated lazily inside each function so the build doesn't require
// RESEND_API_KEY at module-load time (Next.js collects route data during build).
const FROM = "Conexory <Conexory@gmail.com>"

function resend() {
  return new Resend(process.env.RESEND_API_KEY)
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
