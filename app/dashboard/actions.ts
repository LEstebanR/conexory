"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getIsPremium(): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return false
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPremium: true },
  })
  return user?.isPremium ?? false
}

export async function completeOnboarding(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return
  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompleted: true },
  })
}
