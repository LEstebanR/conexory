"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, BedDouble, Bath, Square, Share2, ChevronRight, EyeOff, Building2, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

export type PropertyItem = {
  id: string
  slug: string
  title: string
  type: string
  typeLabel: string
  published: boolean
  shares: number
  price: string
  priceValue: number
  location: string
  area: number | null
  bedrooms: number | null
  bathrooms: number | null
  parking: number | null
  image: string | null
  createdAt: number
}

type Filter = "all" | "active" | "inactive"
type SortKey = "recent" | "price-desc" | "price-asc" | "shares"

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Más recientes" },
  { key: "price-desc", label: "Precio: mayor a menor" },
  { key: "price-asc", label: "Precio: menor a mayor" },
  { key: "shares", label: "Más compartidas" },
]

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

function niceStep(range: number): number {
  if (range <= 0) return 1
  const raw = range / 100
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  return Math.max(1, Math.round(raw / mag) * mag)
}

function priceLabel(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    return `$${Number.isInteger(m) ? m : m.toFixed(1)}M`
  }
  return `$${groupThousands(String(Math.round(n)))}`
}

function areaLabel(n: number): string {
  return `${Math.round(n)} m²`
}

type Range = [number, number]

function RangeSlider({
  label,
  bounds,
  value,
  onChange,
  format,
}: {
  label: string
  bounds: Range
  value: Range | null
  onChange: (v: Range) => void
  format: (n: number) => string
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
        min={bounds[0]}
        max={bounds[1]}
        step={niceStep(bounds[1] - bounds[0])}
        value={current}
        onValueChange={(v) => onChange([v[0], v[1]])}
        className="py-1"
      />
    </div>
  )
}

function Thumbnail({ item }: { item: PropertyItem }) {
  if (item.image) {
    return (
      <div className="relative w-20 h-16 sm:w-24 sm:h-[72px] rounded-xl overflow-hidden flex-shrink-0">
        <Image src={item.image} alt={item.title} fill sizes="96px" className="object-cover" />
      </div>
    )
  }
  return (
    <div className="w-20 h-16 sm:w-24 sm:h-[72px] rounded-xl bg-canvas-soft flex items-center justify-center flex-shrink-0">
      <Building2 className="w-6 h-6 text-mute" strokeWidth={1.5} />
    </div>
  )
}

function Row({ item }: { item: PropertyItem }) {
  const inactive = !item.published
  return (
    <Link
      href={`/dashboard/properties/${item.id}`}
      className="group flex items-center gap-4 p-3 sm:p-4 rounded-2xl border border-hairline bg-white hover:border-ink hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-200"
    >
      <Thumbnail item={item} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <div className="flex items-center flex-wrap gap-1.5 min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-canvas-soft text-ink">
              <span className={cn("w-1.5 h-1.5 rounded-full", inactive ? "bg-mute" : "bg-ink")} />
              {item.typeLabel}
            </span>
            {inactive && (
              <span className="inline-flex items-center gap-1 bg-warning-50 text-warning-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-warning-200">
                <EyeOff className="w-2.5 h-2.5" />
                Inactiva
              </span>
            )}
          </div>
          <p className={cn("flex-shrink-0 text-base sm:text-lg font-black tracking-tighter leading-none", inactive ? "text-mute" : "text-ink")}>
            {item.price}
          </p>
        </div>
        <h3 className={cn("font-bold tracking-tight truncate", inactive ? "text-body" : "text-ink")}>
          {item.title}
        </h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-mute">
          {item.location && (
            <span className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{item.location}</span>
            </span>
          )}
          {item.area != null && (
            <span className="hidden sm:flex items-center gap-1">
              <Square className="w-3 h-3" /> {item.area} m²
            </span>
          )}
          {item.bedrooms != null && (
            <span className="hidden sm:flex items-center gap-1">
              <BedDouble className="w-3 h-3" /> {item.bedrooms}
            </span>
          )}
          {item.bathrooms != null && (
            <span className="hidden sm:flex items-center gap-1">
              <Bath className="w-3 h-3" /> {item.bathrooms}
            </span>
          )}
          {item.shares > 0 && (
            <span className="flex items-center gap-1">
              <Share2 className="w-3 h-3" /> {item.shares}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-mute group-hover:text-ink group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </Link>
  )
}

const selectClass =
  "h-9 rounded-full border border-hairline-strong bg-white pl-3.5 pr-8 text-sm font-semibold text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-ink/30 focus:border-ink transition-colors appearance-none bg-[length:16px] bg-[right_0.6rem_center] bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%23afafaf%22 stroke-width=%222%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/></svg>')]"

function MinSelect({
  label,
  value,
  set,
}: {
  label: string
  value: string
  set: (v: string) => void
}) {
  return (
    <div className="space-y-1">
      <span className="text-[11px] text-mute font-medium block">{label}</span>
      <select
        value={value}
        onChange={(e) => set(e.target.value)}
        aria-label={`${label} mínimo`}
        className={cn(selectClass, "w-full pl-3 pr-7 text-[13px]")}
      >
        <option value="">Cualq.</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>{n}+</option>
        ))}
      </select>
    </div>
  )
}

export default function PropertiesList({ items }: { items: PropertyItem[] }) {
  const [filter, setFilter] = useState<Filter>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sort, setSort] = useState<SortKey>("recent")
  const [query, setQuery] = useState("")
  const [priceRange, setPriceRange] = useState<Range | null>(null)
  const [areaRange, setAreaRange] = useState<Range | null>(null)
  const [minBeds, setMinBeds] = useState("")
  const [minBaths, setMinBaths] = useState("")
  const [minParking, setMinParking] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showFilters) return
    function onDown(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilters(false)
      }
    }
    window.addEventListener("mousedown", onDown)
    return () => window.removeEventListener("mousedown", onDown)
  }, [showFilters])

  const counts = {
    all: items.length,
    active: items.filter((i) => i.published).length,
    inactive: items.filter((i) => !i.published).length,
  }

  const types = useMemo(() => {
    const seen = new Map<string, string>()
    for (const i of items) if (!seen.has(i.type)) seen.set(i.type, i.typeLabel)
    return [...seen.entries()]
  }, [items])

  const priceBounds = useMemo<Range>(() => {
    const vals = items.map((i) => i.priceValue)
    return [Math.min(...vals), Math.max(...vals)]
  }, [items])

  const areaBounds = useMemo<Range | null>(() => {
    const vals = items.map((i) => i.area).filter((a): a is number => a != null)
    return vals.length ? [Math.min(...vals), Math.max(...vals)] : null
  }, [items])

  const activeCount =
    (typeFilter !== "all" ? 1 : 0) +
    (priceRange ? 1 : 0) +
    (areaRange ? 1 : 0) +
    (minBeds ? 1 : 0) +
    (minBaths ? 1 : 0) +
    (minParking ? 1 : 0)

  function clearAll() {
    setTypeFilter("all")
    setPriceRange(null)
    setAreaRange(null)
    setMinBeds("")
    setMinBaths("")
    setMinParking("")
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const minB = minBeds ? Number(minBeds) : null
    const minBa = minBaths ? Number(minBaths) : null
    const minPk = minParking ? Number(minParking) : null
    const result = items.filter((i) => {
      if (filter === "active" && !i.published) return false
      if (filter === "inactive" && i.published) return false
      if (typeFilter !== "all" && i.type !== typeFilter) return false
      if (priceRange && (i.priceValue < priceRange[0] || i.priceValue > priceRange[1])) return false
      if (areaRange && (i.area == null || i.area < areaRange[0] || i.area > areaRange[1])) return false
      if (minB != null && (i.bedrooms == null || i.bedrooms < minB)) return false
      if (minBa != null && (i.bathrooms == null || i.bathrooms < minBa)) return false
      if (minPk != null && (i.parking == null || i.parking < minPk)) return false
      if (q && !i.title.toLowerCase().includes(q) && !i.location.toLowerCase().includes(q))
        return false
      return true
    })
    result.sort((a, b) => {
      switch (sort) {
        case "price-desc": return b.priceValue - a.priceValue
        case "price-asc": return a.priceValue - b.priceValue
        case "shares": return b.shares - a.shares
        default: return b.createdAt - a.createdAt
      }
    })
    return result
  }, [items, filter, typeFilter, sort, query, priceRange, areaRange, minBeds, minBaths, minParking])

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "active", label: "Activas" },
    { key: "inactive", label: "Inactivas" },
  ]

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-hairline overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "relative px-3 py-2.5 text-sm font-semibold transition-colors -mb-px flex-shrink-0",
              filter === tab.key
                ? "text-ink border-b-2 border-ink"
                : "text-mute hover:text-ink border-b-2 border-transparent"
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs font-bold text-mute">{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      {/* Search + filters + sort — only worthwhile with more than one item */}
      {items.length > 1 && (
      <>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título o ubicación"
            className="w-full h-9 pl-10 pr-3 rounded-full border border-hairline-strong bg-white text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-ink/30 focus:border-ink transition-colors"
          />
        </div>

        <div className="relative flex-shrink-0" ref={filterRef}>
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            aria-label="Filtros"
            className={cn(
              "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-sm font-semibold transition-colors",
              showFilters || activeCount > 0
                ? "border-ink bg-ink text-white"
                : "border-hairline-strong bg-white text-ink hover:bg-canvas-soft"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {activeCount > 0 && (
              <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-ink text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          {showFilters && (
            <div className="absolute right-0 mt-2 z-20 w-[min(22rem,calc(100vw-2rem))] bg-white rounded-2xl border border-hairline shadow-xl shadow-black/10 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink">Filtros</p>
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs font-semibold text-mute hover:text-ink transition-colors"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              {types.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-mute">Tipo</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className={cn(selectClass, "w-full")}
                  >
                    <option value="all">Todos los tipos</option>
                    {types.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              )}

              {priceBounds[0] < priceBounds[1] && (
                <RangeSlider
                  label="Precio"
                  bounds={priceBounds}
                  value={priceRange}
                  onChange={setPriceRange}
                  format={priceLabel}
                />
              )}

              {areaBounds && areaBounds[0] < areaBounds[1] && (
                <RangeSlider
                  label="Área"
                  bounds={areaBounds}
                  value={areaRange}
                  onChange={setAreaRange}
                  format={areaLabel}
                />
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-mute">Mínimo</label>
                <div className="grid grid-cols-3 gap-2">
                  <MinSelect label="Hab." value={minBeds} set={setMinBeds} />
                  <MinSelect label="Baños" value={minBaths} set={setMinBaths} />
                  <MinSelect label="Parq." value={minParking} set={setMinParking} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative flex-shrink-0 hidden sm:block">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Ordenar"
            className={cn(selectClass, "pl-9")}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sort on mobile (no room on the controls line) */}
      <div className="relative w-full mb-4 sm:hidden">
        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute pointer-events-none" />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Ordenar"
          className={cn(selectClass, "w-full pl-9")}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </div>
      </>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-sm text-mute py-12 text-center">
          No se encontraron propiedades con estos filtros.
        </p>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <Row key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
