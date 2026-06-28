"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { APIError } from "better-auth/api"
import { auth } from "@/lib/auth"
import { loginSchema, type LoginErrors } from "@/lib/schemas/auth.schema"

const AUTH_ERRORS: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Email o contraseña incorrectos.",
  EMAIL_NOT_VERIFIED: "Verifica tu email antes de continuar.",
  TOO_MANY_REQUESTS: "Demasiados intentos. Espera unos minutos.",
}

export type LoginState = { error?: string; errors?: LoginErrors }

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    const errors: LoginErrors = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "") as keyof LoginErrors
      if (key && !errors[key]) errors[key] = issue.message
    }
    return { errors }
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

  const redirectTo = formData.get("redirect")
  const destination =
    typeof redirectTo === "string" && redirectTo.startsWith("/")
      ? redirectTo
      : "/dashboard"
  redirect(destination)
}
