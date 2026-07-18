"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  Search, MapPin, Building2, ChevronLeft, ChevronRight,
  SlidersHorizontal, ArrowUpDown, Check, Pin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { PROPERTY_TYPE_LABELS as TYPE_LABELS } from "@/lib/property-types"
import { formatCOP as formatCOPFull, formatCOPMillions } from "@/lib/format"
import type { MapProperty } from "./agent-map"

const AgentMap = dynamic(() => import("./agent-map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-canvas-soft animate-pulse rounded-2xl" />,
})

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
  parking: number | null
  shares: number
  latitude: number | null
  longitude: number | null
  createdAt: number
  pinnedAt: number | null
}

type SortKey = "recent" | "price-desc" | "price-asc"
type Range = [number, number]

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Más recientes" },
  { key: "price-desc", label: "Precio: mayor a menor" },
  { key: "price-asc", label: "Precio: menor a mayor" },
]

const selectClass =
  "h-9 rounded-full border border-hairline-strong bg-white pl-3.5 pr-8 text-sm font-semibold text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-ink/30 focus:border-ink transition-colors appearance-none bg-[length:16px] bg-[right_0.6rem_center] bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%23afafaf%22 stroke-width=%222%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/></svg>')]"

function formatCOP(amount: number): string {
  return amount >= 1_000_000 ? formatCOPMillions(amount) : formatCOPFull(amount)
}

function priceLabel(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  return `$${Math.round(n).toLocaleString("es-CO")}`
}

function areaLabel(n: number): string { return `${Math.round(n)} m²` }

function niceStep(range: number): number {
  if (range <= 0) return 1
  const raw = range / 100
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  return Math.max(1, Math.round(raw / mag) * mag)
}

function RangeSlider({ label, bounds, value, onChange, format }: {
  label: string; bounds: Range; value: Range | null
  onChange: (v: Range) => void; format: (n: number) => string
}) {
  const current = value ?? bounds
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-mute">{label}</label>
        <span className="text-xs font-bold text-ink tabular-nums">
          {format(current[0])} – {format(current[1])}
        </span>
      </div>
      <Slider
        min={bounds[0]} max={bounds[1]}
        step={niceStep(bounds[1] - bounds[0])}
        value={current}
        onValueChange={(v) => onChange([v[0], v[1]])}
        className="py-1"
      />
    </div>
  )
}

function MinSelect({ label, value, set }: { label: string; value: string; set: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <span className="text-[11px] text-mute font-medium block">{label}</span>
      <select value={value} onChange={(e) => set(e.target.value)}
        aria-label={`${label} mínimo`} className={cn(selectClass, "w-full pl-3 pr-7 text-[13px]")}>
        <option value="">Cualq.</option>
        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
      </select>
    </div>
  )
}

const PAGE_SIZE = 6

export default function AgentProperties({ properties }: { properties: AgentProperty[] }) {
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sort, setSort] = useState<SortKey>("recent")
  const [priceRange, setPriceRange] = useState<Range | null>(null)
  const [areaRange, setAreaRange] = useState<Range | null>(null)
  const [minBeds, setMinBeds] = useState("")
  const [minBaths, setMinBaths] = useState("")
  const [minParking, setMinParking] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [page, setPage] = useState(1)
  const filterRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showFilters && !showSort) return
    function onDown(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false)
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSort(false)
    }
    window.addEventListener("mousedown", onDown)
    return () => window.removeEventListener("mousedown", onDown)
  }, [showFilters, showSort])

  const types = useMemo(() => {
    const seen = new Map<string, string>()
    for (const p of properties) if (!seen.has(p.type)) seen.set(p.type, TYPE_LABELS[p.type] ?? p.type)
    return [...seen.entries()]
  }, [properties])

  const priceBounds = useMemo<Range>(() => {
    const vals = properties.map((p) => p.price)
    return [Math.min(...vals), Math.max(...vals)]
  }, [properties])

  const areaBounds = useMemo<Range | null>(() => {
    const vals = properties.map((p) => p.area).filter((a): a is number => a != null)
    return vals.length ? [Math.min(...vals), Math.max(...vals)] : null
  }, [properties])

  const activeFilterCount =
    (typeFilter !== "all" ? 1 : 0) +
    (priceRange ? 1 : 0) +
    (areaRange ? 1 : 0) +
    (minBeds ? 1 : 0) +
    (minBaths ? 1 : 0) +
    (minParking ? 1 : 0)

  function clearAll() {
    setTypeFilter("all"); setPriceRange(null); setAreaRange(null)
    setMinBeds(""); setMinBaths(""); setMinParking(""); setPage(1)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const minB = minBeds ? Number(minBeds) : null
    const minBa = minBaths ? Number(minBaths) : null
    const minPk = minParking ? Number(minParking) : null

    const result = properties.filter((p) => {
      if (typeFilter !== "all" && p.type !== typeFilter) return false
      if (priceRange && (p.price < priceRange[0] || p.price > priceRange[1])) return false
      if (areaRange && (p.area == null || p.area < areaRange[0] || p.area > areaRange[1])) return false
      if (minB != null && (p.bedrooms == null || p.bedrooms < minB)) return false
      if (minBa != null && (p.bathrooms == null || p.bathrooms < minBa)) return false
      if (minPk != null && (p.parking == null || p.parking < minPk)) return false
      if (q && ![p.title, p.city, p.neighborhood ?? "", p.state ?? ""].some((s) => s.toLowerCase().includes(q))) return false
      return true
    })

    result.sort((a, b) => {
      if (sort === "price-desc") return b.price - a.price
      if (sort === "price-asc") return a.price - b.price
      // "recent" (default): pinned properties float first, tie-broken by when
      // they were pinned, then everything falls back to recency. Explicit
      // price sorts ignore pin — a shopper comparing prices wants pure price order.
      const aPinned = a.pinnedAt != null
      const bPinned = b.pinnedAt != null
      if (aPinned !== bPinned) return aPinned ? -1 : 1
      if (aPinned && bPinned) return (b.pinnedAt as number) - (a.pinnedAt as number)
      return b.createdAt - a.createdAt
    })
    return result
  }, [properties, query, typeFilter, sort, priceRange, areaRange, minBeds, minBaths, minParking])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const mapProperties: MapProperty[] = properties.map((p) => ({
    id: p.id, slug: p.slug, title: p.title, city: p.city, price: p.price,
    images: p.images, latitude: p.latitude, longitude: p.longitude,
  }))

  if (properties.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-black text-ink">Propiedades disponibles</h2>
        <span className="text-sm font-bold text-mute">{properties.length}</span>
      </div>

      {/* Search + filters + sort — only useful with 5+ properties */}
      {properties.length >= 5 && <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
          <input
            type="search" value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            placeholder="Buscar por título o ubicación"
            className="w-full h-9 pl-10 pr-3 rounded-full border border-hairline-strong bg-white text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-ink/30 focus:border-ink transition-colors"
          />
        </div>

        {/* Filters dropdown */}
        <div className="relative flex-shrink-0" ref={filterRef}>
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            aria-label="Filtros"
            className={cn(
              "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-sm font-semibold transition-colors",
              showFilters || activeFilterCount > 0
                ? "border-ink bg-ink text-white"
                : "border-hairline-strong bg-white text-ink hover:bg-canvas-soft"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-ink text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {showFilters && (
            <div className="absolute right-0 mt-2 z-20 w-[min(22rem,calc(100vw-2rem))] bg-white rounded-2xl border border-hairline shadow-xl shadow-black/10 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink">Filtros</p>
                {activeFilterCount > 0 && (
                  <button type="button" onClick={clearAll} className="text-xs font-semibold text-mute hover:text-ink transition-colors">
                    Limpiar todo
                  </button>
                )}
              </div>

              {types.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-mute">Tipo</label>
                  <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }} className={cn(selectClass, "w-full")}>
                    <option value="all">Todos los tipos</option>
                    {types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
              )}

              {priceBounds[0] < priceBounds[1] && (
                <RangeSlider label="Precio" bounds={priceBounds} value={priceRange}
                  onChange={(v) => { setPriceRange(v); setPage(1) }} format={priceLabel} />
              )}

              {areaBounds && areaBounds[0] < areaBounds[1] && (
                <RangeSlider label="Área" bounds={areaBounds} value={areaRange}
                  onChange={(v) => { setAreaRange(v); setPage(1) }} format={areaLabel} />
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-mute">Mínimo</label>
                <div className="grid grid-cols-3 gap-2">
                  <MinSelect label="Hab." value={minBeds} set={(v) => { setMinBeds(v); setPage(1) }} />
                  <MinSelect label="Baños" value={minBaths} set={(v) => { setMinBaths(v); setPage(1) }} />
                  <MinSelect label="Parq." value={minParking} set={(v) => { setMinParking(v); setPage(1) }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative flex-shrink-0" ref={sortRef}>
          <button
            type="button"
            onClick={() => setShowSort((s) => !s)}
            aria-label="Ordenar"
            className={cn(
              "inline-flex items-center justify-center h-9 px-3.5 rounded-full border text-sm font-semibold transition-colors",
              showSort || sort !== "recent"
                ? "border-ink bg-ink text-white"
                : "border-hairline-strong bg-white text-ink hover:bg-canvas-soft"
            )}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {showSort && (
            <div className="absolute right-0 mt-2 z-20 w-52 bg-white rounded-2xl border border-hairline shadow-xl shadow-black/10 py-1.5 overflow-hidden">
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => { setSort(o.key); setPage(1); setShowSort(false) }}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-left hover:bg-canvas-soft transition-colors"
                >
                  <span className={cn("font-medium", sort === o.key ? "text-ink font-semibold" : "text-body")}>
                    {o.label}
                  </span>
                  {sort === o.key && <Check className="w-3.5 h-3.5 text-ink flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>}

      {/* Results count */}
      {(query || activeFilterCount > 0) && (
        <p className="text-xs text-mute">
          {filtered.length === 0 ? "Sin resultados" : `${filtered.length} propiedad${filtered.length !== 1 ? "es" : ""} encontrada${filtered.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Property grid */}
      {paginated.length > 0 ? (
        <div key={currentPage} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {paginated.map((property) => {
            const cover = property.images[0]
            const location = [property.neighborhood, property.city].filter(Boolean).join(", ")
            const typeLabel = TYPE_LABELS[property.type] ?? property.type
            const hasStats = property.area != null || property.bedrooms != null || property.bathrooms != null

            return (
              <Link key={property.id} href={`/p/${property.slug}`} target="_blank" rel="noopener noreferrer"
                className="group rounded-2xl overflow-hidden border border-hairline hover:border-hairline-strong bg-white transition-all hover:shadow-md hover:shadow-black/5"
              >
                <div className="relative aspect-[4/3] bg-canvas-soft overflow-hidden">
                  {property.pinnedAt != null && (
                    <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 bg-ink text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      <Pin className="w-2.5 h-2.5" />
                      Destacada
                    </span>
                  )}
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-mute" strokeWidth={1.5} />
                    </div>
                  )}
                  <span className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-ink text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                    {typeLabel}
                  </span>
                </div>

                <div className="p-4">
                  <p className="text-sm font-black text-ink leading-snug line-clamp-2 group-hover:underline decoration-1 underline-offset-2">{property.title}</p>
                  {location && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <MapPin className="w-3 h-3 text-mute flex-shrink-0" strokeWidth={2} />
                      <span className="text-xs text-mute truncate">{location}</span>
                    </div>
                  )}
                  <p className="text-lg font-black text-ink tracking-tight mt-2.5">{formatCOP(property.price)}</p>
                  {hasStats && (
                    <p className="text-xs text-mute mt-1">
                      {[
                        property.bedrooms != null && `${property.bedrooms} hab`,
                        property.bathrooms != null && `${property.bathrooms} baño${property.bathrooms !== 1 ? "s" : ""}`,
                        property.area != null && `${property.area} m²`,
                      ].filter(Boolean).join(" · ")}
                    </p>
                  )}
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
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="flex items-center gap-1 text-sm font-semibold text-ink disabled:text-mute disabled:cursor-not-allowed hover:text-body transition-colors">
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <span className="text-xs text-mute font-medium">{currentPage} / {totalPages}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="flex items-center gap-1 text-sm font-semibold text-ink disabled:text-mute disabled:cursor-not-allowed hover:text-body transition-colors">
            Siguiente <ChevronRight className="w-4 h-4" />
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
