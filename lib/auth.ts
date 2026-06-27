import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { Resend } from "resend"
import { prisma } from "@/lib/prisma"

const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // En previews de Vercel la URL es dinámica: si no hay BETTER_AUTH_URL fijo,
  // derivamos la base del deploy actual para que el origin check no falle.
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),

  trustedOrigins: [
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_BRANCH_URL
      ? [`https://${process.env.VERCEL_BRANCH_URL}`]
      : []),
  ],

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "Conexory <noreply@conexory.com>",
        to: user.email,
        subject: "Recupera tu contraseña de Conexory",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
            <div style="margin-bottom:24px">
              <span style="font-size:20px;font-weight:900;color:#000;letter-spacing:-0.5px">Conexory</span>
            </div>
            <h1 style="font-size:22px;font-weight:900;color:#000;margin:0 0 8px">Recupera tu contraseña</h1>
            <p style="font-size:15px;color:#5e5e5e;margin:0 0 24px">
              Haz clic en el botón de abajo para crear una nueva contraseña. El enlace expira en 1 hora.
            </p>
            <a href="${url}" style="display:inline-block;background:#000;color:#fff;font-size:14px;font-weight:700;padding:12px 24px;border-radius:9999px;text-decoration:none">
              Restablecer contraseña
            </a>
            <p style="font-size:13px;color:#afafaf;margin:24px 0 0">
              Si no solicitaste este cambio, ignora este correo.
            </p>
          </div>
        `,
      })
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      // emailVerified is false by default and we don't enforce verification,
      // so don't block linking when the local account has emailVerified=false.
      requireLocalEmailVerified: false,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,   // 7 días
    updateAge: 60 * 60 * 24,        // renueva si la sesión tiene > 1 día
    cookieCache: {
      enabled: false,               // disabled: plan changes (isPremium) must reflect immediately
    },
  },

  user: {
    additionalFields: {
      isPremium: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },

  // Must stay last: lets Server Actions set the session cookie via next/headers.
  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
