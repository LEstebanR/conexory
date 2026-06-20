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

  // Keep the 3 most recent active properties; deactivate the rest
  const activeProperties = await prisma.property.findMany({
    where: { userId: session.user.id, published: true },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  })
  const idsToDeactivate = activeProperties.slice(3).map((p) => p.id)

  await Promise.all([
    prisma.user.update({
      where: { id: session.user.id },
      data: { isPremium: false },
    }),
    prisma.subscription.updateMany({
      where: { userId: session.user.id },
      data: { status: "cancelled", currentPeriodEnd: null },
    }),
    idsToDeactivate.length > 0
      ? prisma.property.updateMany({
          where: { id: { in: idsToDeactivate } },
          data: { published: false },
        })
      : Promise.resolve(),
  ])

  revalidatePath("/dashboard", "layout")
  redirect("/dashboard")
}
