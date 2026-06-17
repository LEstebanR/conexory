import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import Sidebar from "@/components/dashboard/sidebar"

export const metadata: Metadata = {
  title: "Dashboard — Conexory",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect("/login")

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  }

  return (
    <div className="min-h-screen bg-canvas-softer">
      <Sidebar user={user} />

      {/* Content — offset sidebar on desktop, add top padding on mobile */}
      <div className="lg:pl-60 pt-14 lg:pt-0 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  )
}
