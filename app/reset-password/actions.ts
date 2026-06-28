"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { resetPasswordSchema, type ResetPasswordErrors } from "@/lib/schemas/auth.schema"

export type ResetPasswordState = { error?: string; errors?: ResetPasswordErrors }

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!parsed.success) {
    const errors: ResetPasswordErrors = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "") as keyof ResetPasswordErrors
      if (key && !errors[key]) errors[key] = issue.message
    }
    return { errors }
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
