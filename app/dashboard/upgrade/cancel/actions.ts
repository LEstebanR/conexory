"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cancelPreapproval } from "@/lib/mercadopago"

// Cancel = stop future auto-charges but honor the period already paid: the user
// stays Pro until currentPeriodEnd, then the billing cron downgrades them. We
// don't touch isPremium, currentPeriodEnd or their properties here.
//
// Unlike Wompi (where we drove every charge, so a local status flip was
// enough to stop billing), Mercado Pago keeps charging on its own schedule
// until told otherwise — so this must also cancel the preapproval on Mercado
// Pago's side, and bail out with an error (instead of flipping local status)
// if that call fails, so we never tell the user "cancelled" while Mercado
// Pago might still charge them next cycle.
export async function cancelSubscription() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  if (!session.user.isPremium) redirect("/dashboard")

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: { mpPreapprovalId: true },
  })
  if (subscription?.mpPreapprovalId) {
    const result = await cancelPreapproval(subscription.mpPreapprovalId)
    if (!result.ok) redirect("/dashboard/upgrade?error=cancel_failed")
  }

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
