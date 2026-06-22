"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Search, MapPin, Building2, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react"
import type { MapProperty } from "./agent-map"

const AgentMap = dynamic(() => import("./agent-map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-canvas-soft animate-pulse rounded-2xl" />,
})

const TYPE_LABELS: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  office: "Oficina",
  commercial: "Local comercial",
  lot: "Lote",
  warehouse: "Bodega",
}

const TYPE_OPTIONS = [
  { value: "", label: "Todos los tipos" },
  { value: "apartment", label: "Apartamento" },
  { value: "house", label: "Casa" },
  { value: "office", label: "Oficina" },
  { value: "commercial", label: "Local comercial" },
  { value: "lot", label: "Lote" },
  { value: "warehouse", label: "Bodega" },
]

export interface AgentProperty {
  id: string
  slug: string
  title: string
  type: string
  price: number
  city: string
  state: string | null
  neighborhood: string | null
  images: string[]
  area: number | null
  bedrooms: number | null
  bathrooms: number | null
  shares: number
  latitude: number | null
  longitude: number | null
}

function formatCOP(amount: number): string {
  if (amount >= 1_000_000_000) {
    const b = amount / 1_000_000_000
    return `$${b.toLocaleString("es-CO", { maximumFractionDigits: 1 })} B`
  }
  if (amount >= 1_000_000) {
    return `$${Math.round(amount / 1_000_000).toLocaleString("es-CO")} M`
  }
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount)
}

const PAGE_SIZE = 5

export default function AgentProperties({ properties }: { properties: AgentProperty[] }) {
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [bedroomsFilter, setBedroomsFilter] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    const minP = minPrice ? Number(minPrice.replace(/\D/g, "")) : null
    const maxP = maxPrice ? Number(maxPrice.replace(/\D/g, "")) : null
    const beds = bedroomsFilter ? Number(bedroomsFilter) : null

    return properties.filter((p) => {
      if (q && ![p.title, p.city, p.neighborhood ?? "", p.state ?? ""].some((s) => s.toLowerCase().includes(q))) return false
      if (typeFilter && p.type !== typeFilter) return false
      if (beds !== null && (p.bedrooms == null || p.bedrooms < beds)) return false
      if (minP !== null && p.price < minP) return false
      if (maxP !== null && p.price > maxP) return false
      return true
    })
  }, [properties, query, typeFilter, bedroomsFilter, minPrice, maxPrice])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const hasActiveFilters = typeFilter || bedroomsFilter || minPrice || maxPrice

  function clearFilters() {
    setTypeFilter("")
    setBedroomsFilter("")
    setMinPrice("")
    setMaxPrice("")
    setPage(1)
  }

  const mapProperties: MapProperty[] = properties.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    city: p.city,
    price: p.price,
    latitude: p.latitude,
    longitude: p.longitude,
  }))

  if (properties.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-black text-ink">Propiedades disponibles</h2>
        <span className="text-sm font-bold text-mute">{properties.length}</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1) }}
          placeholder="Buscar por título, ciudad o zona…"
          className="w-full h-11 rounded-full border border-hairline bg-white pl-9 pr-4 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink"
        />
      </div>

      {/* Filter toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 text-xs font-semibold text-body hover:text-ink transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filtros
          {hasActiveFilters && (
            <span className="w-4 h-4 rounded-full bg-ink text-white text-[10px] font-black flex items-center justify-center">
              {[typeFilter, bedroomsFilter, minPrice, maxPrice].filter(Boolean).length}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-mute hover:text-ink transition-colors"
          >
            <X className="w-3 h-3" /> Limpiar
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="rounded-2xl border border-hairline bg-white p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Type */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-ink mb-1.5">Tipo de propiedad</label>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
                className="w-full h-10 rounded-lg border border-hairline bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Hab. mínimas</label>
              <select
                value={bedroomsFilter}
                onChange={(e) => { setBedroomsFilter(e.target.value); setPage(1) }}
                className="w-full h-10 rounded-lg border border-hairline bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
              >
                <option value="">Cualquiera</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}+</option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Precio mín. (M COP)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1) }}
                placeholder="Ej. 200"
                className="w-full h-10 rounded-lg border border-hairline bg-white px-3 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-ink mb-1.5">Precio máx. (M COP)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1) }}
                placeholder="Ej. 800"
                className="w-full h-10 rounded-lg border border-hairline bg-white px-3 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results count when filtering */}
      {(query || hasActiveFilters) && (
        <p className="text-xs text-mute">
          {filtered.length === 0
            ? "Sin resultados"
            : `${filtered.length} propiedad${filtered.length !== 1 ? "es" : ""} encontrada${filtered.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Property list */}
      {paginated.length > 0 ? (
        <div className="space-y-3">
          {paginated.map((property) => {
            const cover = property.images[0]
            const location = [property.neighborhood, property.city].filter(Boolean).join(", ")
            const typeLabel = TYPE_LABELS[property.type] ?? property.type
            const hasStats = property.area != null || property.bedrooms != null || property.bathrooms != null

            return (
              <Link
                key={property.id}
                href={`/p/${property.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-3 bg-white rounded-2xl border border-hairline hover:border-hairline-strong overflow-hidden transition-all hover:shadow-sm p-3"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-canvas-soft flex-shrink-0 relative">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-mute" strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <span className="inline-block text-[10px] font-bold bg-canvas-soft text-body px-2 py-0.5 rounded-full mb-1.5">
                      {typeLabel}
                    </span>
                    <p className="text-sm font-black text-ink leading-snug line-clamp-2 group-hover:underline decoration-1 underline-offset-2">
                      {property.title}
                    </p>
                    {location && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-mute flex-shrink-0" strokeWidth={2} />
                        <span className="text-xs text-mute truncate">{location}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-base font-black text-ink tracking-tight mt-1.5">
                      {formatCOP(property.price)}
                    </p>
                    {hasStats && (
                      <p className="text-xs text-mute mt-0.5">
                        {[
                          property.bedrooms != null && `${property.bedrooms} hab`,
                          property.bathrooms != null && `${property.bathrooms} baño${property.bathrooms !== 1 ? "s" : ""}`,
                          property.area != null && `${property.area} m²`,
                        ].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="py-10 text-center">
          <p className="text-sm text-mute">No hay propiedades que coincidan con tu búsqueda.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 text-sm font-semibold text-ink disabled:text-mute disabled:cursor-not-allowed hover:text-body transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <span className="text-xs text-mute font-medium">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 text-sm font-semibold text-ink disabled:text-mute disabled:cursor-not-allowed hover:text-body transition-colors"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Map */}
      <div className="pt-4">
        <h2 className="text-base font-black text-ink mb-3">Ubicación de propiedades</h2>
        <div className="rounded-2xl overflow-hidden border border-hairline" style={{ height: 340 }}>
          <AgentMap properties={mapProperties} />
        </div>
      </div>
    </div>
  )
}
