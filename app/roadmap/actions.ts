"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { sendSuggestionNotification } from "@/lib/email"

const schema = z.object({
  content: z
    .string()
    .trim()
    .min(10, "La sugerencia debe tener al menos 10 caracteres")
    .max(1000, "La sugerencia es demasiado larga"),
  email: z
    .string()
    .trim()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
})

export type SuggestionState = { error?: string; success?: boolean } | null

export async function submitSuggestion(
  _prev: SuggestionState,
  formData: FormData,
): Promise<SuggestionState> {
  const result = schema.safeParse({
    content: formData.get("content"),
    email: formData.get("email") ?? "",
  })

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const email = result.data.email || null

  try {
    await prisma.suggestion.create({
      data: { content: result.data.content, email },
    })
  } catch {
    return { error: "No pudimos guardar tu sugerencia. Intenta de nuevo." }
  }

  // Notifying the team is best-effort: the suggestion is already persisted, so a
  // failed email must not turn a successful submission into an error for the user.
  await sendSuggestionNotification(result.data.content, email).catch(() => null)

  return { success: true }
}
