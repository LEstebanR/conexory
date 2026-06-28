"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
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
  } catch {
    // better-auth always returns 200 (even for unknown emails) to avoid enumeration.
    // Only hard errors reach here — surface a generic message.
    return { error: "No se pudo enviar el correo. Inténtalo de nuevo." }
  }

  return { success: true }
}
