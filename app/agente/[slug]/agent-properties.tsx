"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Search, MapPin, Building2, ChevronLeft, ChevronRight,
  SlidersHorizontal, ArrowUpDown, Check, Pin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { PROPERTY_TYPE_LABELS as TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/property-types"
import { formatCOP as formatCOPFull, formatCOPMillions } from "@/lib/format"
import type { PropertyFacets, PropertySort } from "@/lib/properties"
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
  transactionType: string | null
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

type Range = [number, number]

const SORT_OPTIONS: { key: PropertySort; label: string }[] = [
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

function RangeSlider({ label, bounds, value, onPreview, onCommit, format }: {
  label: string; bounds: Range; value: Range | null
  onPreview: (v: Range) => void; onCommit: (v: Range) => void; format: (n: number) => string
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
        onValueChange={(v) => onPreview([v[0], v[1]])}
        onValueCommit={(v) => onCommit([v[0], v[1]])}
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

export default function AgentProperties({
  properties,
  total,
  page,
  pageSize,
  facets,
  mapProperties,
  showHeader = true,
}: {
  properties: AgentProperty[]
  total: number
  page: number
  pageSize: number
  facets: PropertyFacets
  mapProperties: MapProperty[]
  showHeader?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // Kept fresh via effect (not during render) so a debounced search commit
  // that fires after another filter/sort change carries that change forward
  // instead of overwriting it with the stale snapshot closed over at typing time.
  const paramsRef = useRef(searchParams)
  useEffect(() => { paramsRef.current = searchParams }, [searchParams])

  const currentQuery = searchParams.get("q") ?? ""
  const [queryInput, setQueryInput] = useState(currentQuery)
  const [syncedQuery, setSyncedQuery] = useState(currentQuery)
  if (currentQuery !== syncedQuery) {
    setSyncedQuery(currentQuery)
    setQueryInput(currentQuery)
  }

  const typeFilter = searchParams.get("type") ?? "all"
  const sort = ((): PropertySort => {
    const s = searchParams.get("sort")
    return s === "price-desc" || s === "price-asc" ? s : "recent"
  })()

  const priceMinParam = searchParams.get("priceMin")
  const priceMaxParam = searchParams.get("priceMax")
  const priceRange: Range | null =
    priceMinParam != null && priceMaxParam != null ? [Number(priceMinParam), Number(priceMaxParam)] : null
  const [previewPriceRange, setPreviewPriceRange] = useState<Range | null>(null)
  const [syncedPriceParams, setSyncedPriceParams] = useState([priceMinParam, priceMaxParam])
  if (syncedPriceParams[0] !== priceMinParam || syncedPriceParams[1] !== priceMaxParam) {
    setSyncedPriceParams([priceMinParam, priceMaxParam])
    setPreviewPriceRange(null)
  }

  const areaMinParam = searchParams.get("areaMin")
  const areaMaxParam = searchParams.get("areaMax")
  const areaRange: Range | null =
    areaMinParam != null && areaMaxParam != null ? [Number(areaMinParam), Number(areaMaxParam)] : null
  const [previewAreaRange, setPreviewAreaRange] = useState<Range | null>(null)
  const [syncedAreaParams, setSyncedAreaParams] = useState([areaMinParam, areaMaxParam])
  if (syncedAreaParams[0] !== areaMinParam || syncedAreaParams[1] !== areaMaxParam) {
    setSyncedAreaParams([areaMinParam, areaMaxParam])
    setPreviewAreaRange(null)
  }

  const minBeds = searchParams.get("beds") ?? ""
  const minBaths = searchParams.get("baths") ?? ""
  const minParking = searchParams.get("parking") ?? ""

  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)
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

  // Reads searchParams via a ref (not the closed-over value) so a debounced
  // search commit that fires after another filter/sort change still carries
  // that change forward instead of overwriting it with a stale snapshot.
  const updateParams = useCallback((
    patch: Record<string, string | null>,
    opts: { resetPage?: boolean; method?: "push" | "replace" } = {}
  ) => {
    const { resetPage = true, method = "replace" } = opts
    const params = new URLSearchParams(paramsRef.current.toString())
    for (const [key, value] of Object.entries(patch)) {
      if (value == null || value === "") params.delete(key)
      else params.set(key, value)
    }
    if (resetPage) params.delete("page")
    const qs = params.toString()
    router[method](qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [pathname, router])

  useEffect(() => {
    if (queryInput === currentQuery) return
    const t = setTimeout(() => updateParams({ q: queryInput || null }), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput])

  const activeFilterCount =
    (typeFilter !== "all" ? 1 : 0) +
    (priceRange ? 1 : 0) +
    (areaRange ? 1 : 0) +
    (minBeds ? 1 : 0) +
    (minBaths ? 1 : 0) +
    (minParking ? 1 : 0)

  function clearAll() {
    updateParams({
      type: null, priceMin: null, priceMax: null, areaMin: null, areaMax: null,
      beds: null, baths: null, parking: null,
    })
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(Math.max(page, 1), totalPages)

  function goToPage(p: number) {
    updateParams({ page: p > 1 ? String(p) : null }, { resetPage: false, method: "push" })
  }

  if (facets.totalCount === 0) return null

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-black text-ink">Propiedades disponibles</h2>
          <span className="text-sm font-bold text-mute">{facets.totalCount}</span>
        </div>
      )}

      {/* Search + filters + sort — only useful with 5+ properties */}
      {facets.totalCount >= 5 && <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
          <input
            type="search" value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
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

              {facets.types.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-mute">Tipo</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => updateParams({ type: e.target.value === "all" ? null : e.target.value })}
                    className={cn(selectClass, "w-full")}
                  >
                    <option value="all">Todos los tipos</option>
                    {facets.types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
              )}

              {facets.priceBounds && facets.priceBounds[0] < facets.priceBounds[1] && (
                <RangeSlider
                  label="Precio" bounds={facets.priceBounds}
                  value={previewPriceRange ?? priceRange}
                  onPreview={setPreviewPriceRange}
                  onCommit={(v) => updateParams({ priceMin: String(v[0]), priceMax: String(v[1]) })}
                  format={priceLabel}
                />
              )}

              {facets.areaBounds && facets.areaBounds[0] < facets.areaBounds[1] && (
                <RangeSlider
                  label="Área" bounds={facets.areaBounds}
                  value={previewAreaRange ?? areaRange}
                  onPreview={setPreviewAreaRange}
                  onCommit={(v) => updateParams({ areaMin: String(v[0]), areaMax: String(v[1]) })}
                  format={areaLabel}
                />
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-mute">Mínimo</label>
                <div className="grid grid-cols-3 gap-2">
                  <MinSelect label="Hab." value={minBeds} set={(v) => updateParams({ beds: v || null })} />
                  <MinSelect label="Baños" value={minBaths} set={(v) => updateParams({ baths: v || null })} />
                  <MinSelect label="Parq." value={minParking} set={(v) => updateParams({ parking: v || null })} />
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
                  onClick={() => { updateParams({ sort: o.key === "recent" ? null : o.key }); setShowSort(false) }}
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
      {(currentQuery || activeFilterCount > 0) && (
        <p className="text-xs text-mute">
          {total === 0 ? "Sin resultados" : `${total} propiedad${total !== 1 ? "es" : ""} encontrada${total !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Property grid */}
      {properties.length > 0 ? (
        <div key={currentPage} className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
          {properties.map((property) => {
            const cover = property.images[0]
            const location = [property.neighborhood, property.city].filter(Boolean).join(", ")
            const typeLabel = TYPE_LABELS[property.type] ?? property.type
            const transactionLabel = property.transactionType
              ? TRANSACTION_TYPE_LABELS[property.transactionType] ?? null
              : null
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
                    <Image
                      src={cover}
                      alt={property.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 228px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-mute" strokeWidth={1.5} />
                    </div>
                  )}
                  <span className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-ink text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                    {typeLabel}
                    {transactionLabel ? ` · ${transactionLabel}` : ""}
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
          <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
            className="flex items-center gap-1 text-sm font-semibold text-ink disabled:text-mute disabled:cursor-not-allowed hover:text-body transition-colors">
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <span className="text-xs text-mute font-medium">{currentPage} / {totalPages}</span>
          <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
            className="flex items-center gap-1 text-sm font-semibold text-ink disabled:text-mute disabled:cursor-not-allowed hover:text-body transition-colors">
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Map — shows every property matching the current filters, not just
          the loaded page, so it doesn't jump around as the user paginates */}
      <div className="pt-4">
        <h2 className="text-base font-black text-ink mb-3">Ubicación de propiedades</h2>
        <div className="relative isolate rounded-2xl overflow-hidden border border-hairline" style={{ height: 340 }}>
          <AgentMap properties={mapProperties} />
        </div>
      </div>
    </div>
  )
}
