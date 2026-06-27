"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { setWelcomeModalSeen, setDashboardTourCompleted } from "@/lib/onboarding-server"

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
  await setWelcomeModalSeen(session.user.id)
}

export async function completeDashboardTour(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return
  await setDashboardTourCompleted(session.user.id)
}
