"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { z } from "zod"
import { APIError } from "better-auth/api"
import { auth } from "@/lib/auth"

const AUTH_ERRORS: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Email o contraseña incorrectos.",
  EMAIL_NOT_VERIFIED: "Verifica tu email antes de continuar.",
  TOO_MANY_REQUESTS: "Demasiados intentos. Espera unos minutos.",
}

const loginSchema = z.object({
  email: z.email("El correo electrónico no es válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
})

export type LoginState = { error?: string }

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." }
  }

  try {
    await auth.api.signInEmail({
      body: parsed.data,
      headers: await headers(),
    })
  } catch (error) {
    if (error instanceof APIError) {
      return {
        error:
          AUTH_ERRORS[error.body?.code ?? ""] ??
          "Email o contraseña incorrectos.",
      }
    }
    throw error
  }

  redirect("/dashboard")
}
