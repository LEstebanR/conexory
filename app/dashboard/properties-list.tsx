"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, BedDouble, Bath, Square, Share2, ChevronRight, EyeOff, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type PropertyItem = {
  id: string
  slug: string
  title: string
  typeLabel: string
  published: boolean
  shares: number
  price: string
  location: string
  area: number | null
  bedrooms: number | null
  bathrooms: number | null
  image: string | null
}

type Filter = "all" | "active" | "inactive"

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
        <div className="flex items-center gap-1.5 mb-1">
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

      <div className="text-right flex-shrink-0">
        <p className={cn("text-lg sm:text-xl font-black tracking-tighter leading-none", inactive ? "text-mute" : "text-ink")}>
          {item.price}
        </p>
        <p className="text-[10px] text-mute font-medium mt-1">COP</p>
      </div>

      <ChevronRight className="w-4 h-4 text-mute group-hover:text-ink group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </Link>
  )
}

export default function PropertiesList({ items }: { items: PropertyItem[] }) {
  const [filter, setFilter] = useState<Filter>("all")

  const counts = {
    all: items.length,
    active: items.filter((i) => i.published).length,
    inactive: items.filter((i) => !i.published).length,
  }

  const filtered = items.filter((i) =>
    filter === "all" ? true : filter === "active" ? i.published : !i.published
  )

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "active", label: "Activas" },
    { key: "inactive", label: "Inactivas" },
  ]

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-hairline">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "relative px-3 py-2.5 text-sm font-semibold transition-colors -mb-px",
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

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-sm text-mute py-12 text-center">
          No tienes propiedades en esta vista.
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
