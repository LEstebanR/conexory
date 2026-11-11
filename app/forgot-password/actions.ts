"use server"

import { headers } from "next/headers"
import { APIError } from "better-auth/api"
import { auth } from "@/lib/auth"
import { reportError } from "@/lib/report-error"
import { forgotPasswordSchema, type ForgotPasswordErrors } from "@/lib/schemas/auth.schema"

export type ForgotPasswordState = { error?: string; errors?: ForgotPasswordErrors; success?: boolean }

export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") })
  if (!parsed.success) {
    return { errors: { email: parsed.error.issues[0]?.message ?? "Correo inválido." } }
  }

  try {
    await auth.api.requestPasswordReset({
      body: {
        email: parsed.data.email,
        redirectTo: "/reset-password",
      },
      headers: await headers(),
    })
  } catch (err) {
    // better-auth always returns 200 (even for unknown emails) to avoid enumeration.
    // Only hard errors reach here — surface a generic message.
    if (!(err instanceof APIError && err.statusCode < 500)) {
      await reportError("Password reset request failed", err)
    }
    return { error: "No se pudo enviar el correo. Inténtalo de nuevo." }
  }

  return { success: true }
}
