"use server"

import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { setOnboardingFlag } from "@/lib/onboarding-server"

export async function getIsPremium(): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return false
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPremium: true },
  })
  return user?.isPremium ?? false
}

export async function markWelcomeModalSeen(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return
  await setOnboardingFlag(session.user.id, "welcomeModalSeen")
}

export async function completeDashboardTour(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return
  await setOnboardingFlag(session.user.id, "dashboardTourCompleted")
}

const feedbackSchema = z.object({
  name: z.string().trim().max(120).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(3, "Escribe un mensaje")
    .max(2000, "El mensaje es demasiado largo"),
})

export type FeedbackState = { error?: string; success?: boolean } | null

export async function submitFeedback(
  _prev: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: "Sesión expirada. Vuelve a iniciar sesión." }

  const result = feedbackSchema.safeParse({
    name: formData.get("name") ?? "",
    message: formData.get("message"),
  })
  if (!result.success) return { error: result.error.issues[0].message }

  try {
    await prisma.feedback.create({
      data: {
        userId: session.user.id,
        name: result.data.name || null,
        message: result.data.message,
      },
    })
  } catch {
    return { error: "No pudimos guardar tu feedback. Intenta de nuevo." }
  }

  return { success: true }
}
