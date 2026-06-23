"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/lib/auth"

const schema = z.object({
  token: z.string().min(1, "Token inválido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
})

export type ResetPasswordState = { error?: string }

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." }
  }

  try {
    await auth.api.resetPassword({
      body: {
        token: parsed.data.token,
        newPassword: parsed.data.password,
      },
      headers: await headers(),
    })
  } catch {
    return { error: "El enlace es inválido o ha expirado. Solicita uno nuevo." }
  }

  redirect("/login?passwordReset=true")
}
