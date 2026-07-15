import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { prisma } from "@/lib/prisma"
import { sendResetPasswordEmail, sendWelcome } from "@/lib/email"

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
      await sendResetPasswordEmail(user.email, user.name, url)
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
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
    },
  },

  // Fires for both email/password and Google OAuth sign-up (a new User row is
  // created either way). Best-effort: never block account creation on Resend.
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await sendWelcome(user.email, user.name).catch(() => null)
        },
      },
    },
  },

  // Must stay last: lets Server Actions set the session cookie via next/headers.
  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
