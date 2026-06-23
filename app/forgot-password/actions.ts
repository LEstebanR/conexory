"use server"

import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/lib/auth"

const schema = z.object({
  email: z.email("El correo electrónico no es válido."),
})

export type ForgotPasswordState = { error?: string; success?: boolean }

export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = schema.safeParse({ email: formData.get("email") })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." }
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
