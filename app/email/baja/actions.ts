"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { optOutOfLifecycleEmails, verifyUnsubscribeToken } from "@/lib/unsubscribe"

const UnsubscribeSchema = z.object({ token: z.string().min(1).max(512) })

export async function unsubscribe(formData: FormData) {
  const parsed = UnsubscribeSchema.safeParse({ token: formData.get("token") })
  const userId = parsed.success ? verifyUnsubscribeToken(parsed.data.token) : null
  if (!userId) redirect("/email/baja")
  await optOutOfLifecycleEmails(userId)
  redirect("/email/baja?listo=1")
}
