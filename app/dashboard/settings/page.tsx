import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { Zap, Globe, ExternalLink } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import SettingsForm from "./settings-form"
import { toggleProfilePublished } from "./actions"
import { getAppUrl } from "@/lib/urls"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Configuración — Conexory",
}

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      isPremium: true,
      location: true,
      bio: true,
      phone: true,
      phoneIsWhatsapp: true,
      agentSlug: true,
      profilePublished: true,
    },
  })
  if (!user) redirect("/login")

  const appUrl = getAppUrl()
  const profileUrl = user.agentSlug ? `${appUrl}/agente/${user.agentSlug}` : null

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

        <div className="space-y-4">
          {/* Perfil público */}
          <div className="bg-white rounded-2xl border border-hairline p-6">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-ink" strokeWidth={1.75} />
              <h2 className="text-base font-bold text-ink">Perfil público</h2>
            </div>
            <p className="text-xs text-mute leading-relaxed mb-4">
              {user.profilePublished
                ? "Tu perfil es visible para cualquier persona con el link. Ocultarlo solo lo hace privado — no borra tus datos."
                : "Tu perfil está oculto. Actívalo para compartir tus propiedades con un link."}
            </p>

            {user.profilePublished && profileUrl && (
              <div className="flex items-center gap-2 bg-canvas-soft rounded-xl px-3 py-2 mb-4">
                <span className="text-xs text-body truncate flex-1">{profileUrl.replace(/^https?:\/\//, "")}</span>
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-mute hover:text-ink transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <form action={toggleProfilePublished}>
              <Button
                type="submit"
                variant={user.profilePublished ? "outline" : "default"}
                size="sm"
                className="w-full"
              >
                {user.profilePublished ? "Ocultar perfil público" : "Activar perfil público"}
              </Button>
            </form>
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
    </div>
  )
}
