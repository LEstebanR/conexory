import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import Sidebar from "@/components/dashboard/sidebar"

export const metadata: Metadata = {
  title: "Admin — Conexory",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect("/login")
  if (session.user.role !== "admin") redirect("/dashboard")

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
    isPremium: session.user.isPremium,
    role: session.user.role,
  }

  return (
    <div className="min-h-screen bg-canvas-softer">
      <Sidebar user={user} />

      <div className="lg:pl-60 pt-14 lg:pt-0 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  )
}
