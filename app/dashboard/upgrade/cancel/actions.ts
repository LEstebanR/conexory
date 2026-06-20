"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function cancelSubscription() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  if (!session.user.isPremium) redirect("/dashboard")

  await Promise.all([
    prisma.user.update({
      where: { id: session.user.id },
      data: { isPremium: false },
    }),
    prisma.subscription.updateMany({
      where: { userId: session.user.id },
      data: { status: "cancelled", currentPeriodEnd: null },
    }),
  ])

  revalidatePath("/dashboard", "layout")
  redirect("/dashboard")
}
