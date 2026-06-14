import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

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
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: "MiAgente <noreply@miagente.co>",
        to: user.email,
        subject: "Recupera tu contraseña — MiAgente",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1e293b">
            <div style="margin-bottom:24px">
              <span style="font-size:20px;font-weight:900;letter-spacing:-0.5px">MiAgente</span>
            </div>
            <h1 style="font-size:22px;font-weight:800;margin:0 0 12px">Recupera tu contraseña</h1>
            <p style="font-size:15px;color:#64748b;margin:0 0 24px;line-height:1.6">
              Recibimos una solicitud para restablecer la contraseña de <strong>${user.email}</strong>.
              Haz clic en el botón para crear una nueva.
            </p>
            <a href="${url}" style="display:inline-block;background:#818cf8;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;margin-bottom:24px">
              Crear nueva contraseña
            </a>
            <p style="font-size:13px;color:#94a3b8;margin:0;line-height:1.6">
              Este enlace expira en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo.
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
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,   // 7 días
    updateAge: 60 * 60 * 24,        // renueva si la sesión tiene > 1 día
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,               // cachea la cookie 5 min para reducir queries
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
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
