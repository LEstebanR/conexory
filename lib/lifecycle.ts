import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { FREE_PROPERTY_LIMIT } from "@/lib/plans"
import { sendPropertyLimitReached } from "@/lib/email"
import { sendWithoutBlocking } from "@/lib/after"
import { reportError } from "@/lib/report-error"

export type LifecycleEmailKind = "property_limit_reached" | "reengagement" | "winback"

// The row is written before the email goes out: the unique (userId, kind)
// makes a concurrent run lose the race instead of double-sending. The trade-off
// is at-most-once — a send that fails after the claim is never retried.
export async function claimLifecycleEmail(userId: string, kind: LifecycleEmailKind): Promise<boolean> {
  try {
    await prisma.lifecycleEmail.create({ data: { userId, kind } })
    return true
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return false
    throw err
  }
}

export function notifyIfReachedFreeLimit(
  userId: string,
  activeCountAfter: number,
  proAccess: boolean,
): Promise<void> {
  if (proAccess || activeCountAfter !== FREE_PROPERTY_LIMIT) return Promise.resolve()
  return sendWithoutBlocking(() =>
    sendLimitReachedOnce(userId).catch((err) => reportError("Limit-reached email failed", err, { userId })),
  )
}

async function sendLimitReachedOnce(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, isPremium: true, lifecycleEmailsOptOut: true },
  })
  if (!user || user.isPremium || user.lifecycleEmailsOptOut) return
  if (!(await claimLifecycleEmail(user.id, "property_limit_reached"))) return
  await sendPropertyLimitReached(user)
}
