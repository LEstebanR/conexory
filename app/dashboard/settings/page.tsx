import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import SettingsForm from "./settings-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Configuración — Conexory",
}

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true, isPremium: true },
  })
  if (!user) redirect("/login")

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-xl w-full">
      <h1 className="text-3xl font-black text-ink tracking-tighter mb-8">Configuración</h1>

      <section className="bg-white border border-hairline rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-bold text-ink mb-5">Perfil</h2>
        <SettingsForm name={user.name} email={user.email} image={user.image ?? null} />
      </section>

      <section className="bg-white border border-hairline rounded-2xl p-6">
        <h2 className="text-sm font-bold text-ink mb-1">Plan</h2>
        <p className="text-xs text-mute mb-4">
          {user.isPremium ? "Plan Pro activo" : "Plan gratuito"}
        </p>
        <Link
          href="/dashboard/upgrade"
          className="text-sm font-semibold text-ink hover:opacity-70 transition-opacity"
        >
          {user.isPremium ? "Gestionar suscripción →" : "Activar Pro →"}
        </Link>
      </section>
    </div>
  )
}
