"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function resendVerificationEmailAction(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await auth.api.sendVerificationEmail({
      body: { email, callbackURL: "/dashboard" },
      headers: await headers(),
    })
    return { success: true }
  } catch {
    return { success: false, error: "No se pudo reenviar el correo. Intenta de nuevo." }
  }
}
