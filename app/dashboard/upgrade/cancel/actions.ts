"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Cancel = stop future auto-charges but honor the period already paid: the user
// stays Pro until currentPeriodEnd, then the billing cron downgrades them. We
// don't touch isPremium, currentPeriodEnd or their properties here.
export async function cancelSubscription() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  if (!session.user.isPremium) redirect("/dashboard")

  await prisma.subscription.updateMany({
    where: {
      userId: session.user.id,
      status: { in: ["active", "past_due"] },
    },
    data: { status: "canceling" },
  })

  revalidatePath("/dashboard", "layout")
  redirect("/dashboard/upgrade")
}
