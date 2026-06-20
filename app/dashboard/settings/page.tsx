import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { Zap } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
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
    select: { name: true, email: true, image: true, isPremium: true, location: true, bio: true, phone: true, phoneIsWhatsapp: true },
  })
  if (!user) redirect("/login")

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-5xl w-full mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-mute mb-1">Cuenta</p>
        <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tighter">
          Configuración
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Perfil — ocupa 2 columnas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-hairline p-6 sm:p-8">
          <h2 className="text-base font-bold text-ink mb-6">Perfil</h2>
          <SettingsForm
            name={user.name}
            email={user.email}
            image={user.image ?? null}
            location={user.location ?? ""}
            bio={user.bio ?? ""}
            phone={user.phone ?? ""}
            phoneIsWhatsapp={user.phoneIsWhatsapp}
          />
        </div>

        {/* Plan */}
        <div className="bg-white rounded-2xl border border-hairline p-6">
          <h2 className="text-base font-bold text-ink mb-1">Plan actual</h2>
          <div className="flex items-center gap-2 mt-3 mb-5">
            {user.isPremium ? (
              <span className="text-xs font-black uppercase tracking-wider bg-ink text-white px-2.5 py-1 rounded-full">
                Pro
              </span>
            ) : (
              <span className="text-xs font-bold text-mute uppercase tracking-wider bg-canvas-soft px-2.5 py-1 rounded-full">
                Gratuito
              </span>
            )}
          </div>
          {user.isPremium ? (
            <>
              <p className="text-xs text-mute leading-relaxed mb-5">
                50 propiedades activas · 20 fotos por propiedad
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/upgrade">Gestionar suscripción</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-mute leading-relaxed mb-5">
                3 propiedades activas · 10 fotos por propiedad
              </p>
              <Button size="sm" className="w-full" asChild>
                <Link href="/dashboard/upgrade">
                  <Zap className="w-3.5 h-3.5" />
                  Activar Pro
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
