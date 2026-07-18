import type { Metadata } from "next"
import { Building2 } from "lucide-react"
import { getPublishedProperties } from "@/lib/properties"
import AgentProperties from "@/app/agente/[slug]/agent-properties"

export const metadata: Metadata = {
  title: "Propiedades disponibles — Conexory",
}

export default async function DashboardPropertiesPage() {
  const items = await getPublishedProperties()

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-5xl w-full mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tighter">
          Propiedades disponibles
        </h1>
        <p className="text-sm text-body mt-1">
          Todas las propiedades publicadas por agentes en Conexory.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <span className="inline-flex w-12 h-12 rounded-2xl bg-canvas-soft items-center justify-center">
            <Building2 className="w-5 h-5 text-mute" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Todavía no hay propiedades publicadas</p>
            <p className="text-xs text-mute mt-0.5">Vuelve pronto — nuestros agentes están cargando sus fichas.</p>
          </div>
        </div>
      ) : (
        <AgentProperties properties={items} showHeader={false} />
      )}
    </div>
  )
}
