"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { APIError } from "better-auth/api"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateAgentSlug } from "@/lib/agent-slug"
import { registerSchema, type RegisterErrors } from "@/lib/schemas/auth.schema"

const AUTH_ERRORS: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: "Ya existe una cuenta con este email. ¿Quieres iniciar sesión?",
  USER_ALREADY_EXISTS: "Ya existe una cuenta con este email. ¿Quieres iniciar sesión?",
  WEAK_PASSWORD: "La contraseña es muy débil. Usa al menos 8 caracteres.",
  TOO_MANY_REQUESTS: "Demasiados intentos. Espera unos minutos.",
  INVALID_EMAIL: "El correo electrónico no es válido.",
}

export type RegisterState = { error?: string; errors?: RegisterErrors }

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
    const errors: RegisterErrors = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "") as keyof RegisterErrors
      if (key && !errors[key]) errors[key] = issue.message
    }
    return { errors }
  }

  const { name, email, password } = parsed.data

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    })
    // Generate agent slug for the new user (best-effort, non-blocking)
    const newUser = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    if (newUser) {
      const slug = await generateAgentSlug(name, prisma)
      const data: { agentSlug: string; referredById?: string } = { agentSlug: slug }

      const ref = formData.get("ref")
      if (typeof ref === "string" && ref.trim()) {
        const referrer = await prisma.user.findUnique({
          where: { agentSlug: ref.trim() },
          select: { id: true },
        })
        if (referrer) data.referredById = referrer.id
      }

      await prisma.user.update({ where: { id: newUser.id }, data })
    }
  } catch (error) {
    if (error instanceof APIError) {
      return {
        error:
          AUTH_ERRORS[error.body?.code ?? ""] ?? "Algo salió mal. Intenta de nuevo.",
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
