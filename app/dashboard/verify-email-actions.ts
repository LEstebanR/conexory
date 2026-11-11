"use server"

import { headers } from "next/headers"
import { APIError } from "better-auth/api"
import { auth } from "@/lib/auth"
import { reportError } from "@/lib/report-error"

export async function resendVerificationEmailAction(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await auth.api.sendVerificationEmail({
      body: { email, callbackURL: "/dashboard" },
      headers: await headers(),
    })
    return { success: true }
  } catch (err) {
    if (!(err instanceof APIError && err.statusCode < 500)) {
      await reportError("Verification email resend failed", err)
    }
    return { success: false, error: "No se pudo reenviar el correo. Intenta de nuevo." }
  }
}
