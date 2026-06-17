"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { z } from "zod"
import { APIError } from "better-auth/api"
import { auth } from "@/lib/auth"

const AUTH_ERRORS: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: "Ya existe una cuenta con este email. ¿Quieres iniciar sesión?",
  USER_ALREADY_EXISTS: "Ya existe una cuenta con este email. ¿Quieres iniciar sesión?",
  WEAK_PASSWORD: "La contraseña es muy débil. Usa al menos 8 caracteres.",
  TOO_MANY_REQUESTS: "Demasiados intentos. Espera unos minutos.",
  INVALID_EMAIL: "El correo electrónico no es válido.",
}

const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Ingresa tu nombre completo."),
    email: z.email("El correo electrónico no es válido."),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string(),
    terms: z.literal("on", { message: "Debes aceptar los términos para continuar." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  })

export type RegisterState = { error?: string }

export async function registerAction(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    terms: formData.get("terms"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." }
  }

  const { name, email, password } = parsed.data

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    })
  } catch (error) {
    if (error instanceof APIError) {
      return {
        error:
          AUTH_ERRORS[error.body?.code ?? ""] ?? "Algo salió mal. Intenta de nuevo.",
      }
    }
    throw error
  }

  redirect("/dashboard")
}
