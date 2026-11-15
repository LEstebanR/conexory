import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

type SessionLike = { user: { role?: string | null } } | null
type AppSession = NonNullable<Awaited<ReturnType<typeof getSession>>>

// Layouts don't re-run on client navigation (partial rendering), so every
// admin page checks the role itself, next to its data, instead of trusting
// app/admin/layout.tsx alone.
export async function requireAdmin(): Promise<AppSession>
export async function requireAdmin<S extends SessionLike>(
  loadSession: () => Promise<S>
): Promise<NonNullable<S>>
export async function requireAdmin(
  loadSession: () => Promise<SessionLike> = getSession
): Promise<NonNullable<SessionLike>> {
  const session = await loadSession()
  if (!session) redirect("/login")
  if (session.user.role !== "admin") redirect("/dashboard")
  return session
}
