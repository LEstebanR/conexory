import type { Metadata } from "next"
import { requireAdmin } from "@/lib/require-admin"
import Sidebar from "@/components/dashboard/sidebar"

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAdmin()

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
