import { Suspense } from "react"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { Building2 } from "lucide-react"
import {
  getProperties, getPropertyFacets, getPropertiesForMap,
  parsePropertyQuery, withPropertyPage, PROPERTIES_PAGE_SIZE,
} from "@/lib/properties"
import AgentProperties from "@/app/agente/[slug]/agent-properties"

export const metadata: Metadata = {
  title: "Propiedades disponibles — Conexory",
}

export default async function DashboardPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const { filters, sort, page } = parsePropertyQuery(sp)
  const base = { published: true }

  const [{ properties, total }, facets, mapProperties] = await Promise.all([
    getProperties(base, filters, sort, page, PROPERTIES_PAGE_SIZE),
    getPropertyFacets(base),
    getPropertiesForMap(base, filters),
  ])

  if (properties.length === 0 && total > 0 && page > 1) {
    const totalPages = Math.max(1, Math.ceil(total / PROPERTIES_PAGE_SIZE))
    redirect(`/dashboard/propiedades?${withPropertyPage(sp, totalPages)}`)
  }

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

      {facets.totalCount === 0 ? (
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
        <Suspense fallback={null}>
          <AgentProperties
            properties={properties}
            total={total}
            page={page}
            pageSize={PROPERTIES_PAGE_SIZE}
            facets={facets}
            mapProperties={mapProperties}
            showHeader={false}
          />
        </Suspense>
      )}
    </div>
  )
}
