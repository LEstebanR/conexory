import { prisma } from "@/lib/prisma"
import { parseOnboarding } from "@/lib/onboarding"

export async function setWelcomeModalSeen(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboarding: true },
  })
  const onboarding = parseOnboarding(user?.onboarding)
  if (onboarding.welcomeModalSeen) return
  await prisma.user.update({
    where: { id: userId },
    data: { onboarding: { ...onboarding, welcomeModalSeen: true } },
  })
}

export async function setDashboardTourCompleted(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboarding: true },
  })
  const onboarding = parseOnboarding(user?.onboarding)
  if (onboarding.dashboardTourCompleted) return
  await prisma.user.update({
    where: { id: userId },
    data: { onboarding: { ...onboarding, dashboardTourCompleted: true } },
  })
}

export async function setPropertyTourCompleted(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboarding: true },
  })
  const onboarding = parseOnboarding(user?.onboarding)
  if (onboarding.propertyTourCompleted) return
  await prisma.user.update({
    where: { id: userId },
    data: { onboarding: { ...onboarding, propertyTourCompleted: true } },
  })
}

export async function setSettingsTourCompleted(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboarding: true },
  })
  const onboarding = parseOnboarding(user?.onboarding)
  if (onboarding.settingsTourCompleted) return
  await prisma.user.update({
    where: { id: userId },
    data: { onboarding: { ...onboarding, settingsTourCompleted: true } },
  })
}

export async function advanceOnboardingStep(
  userId: string,
  completedStep: number,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboarding: true },
  })
  const onboarding = parseOnboarding(user?.onboarding)
  if (onboarding.step !== completedStep) return
  await prisma.user.update({
    where: { id: userId },
    data: { onboarding: { ...onboarding, step: completedStep + 1 } },
  })
}
