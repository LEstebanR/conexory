import Image from "next/image"
import Link from "next/link"
import { Building2 } from "lucide-react"
import Reveal from "@/components/reveal"
import { formatCOP } from "@/lib/format"
import { PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/property-types"

export type FeaturedProperty = {
  id: string
  slug: string
  title: string
  price: number
  type: string
  transactionType: string | null
  city: string
  neighborhood: string | null
  images: string[]
}

const VISIBLE_COUNT = 6

function PropertyCard({ property }: { property: FeaturedProperty }) {
  const typeLabel = PROPERTY_TYPE_LABELS[property.type] ?? property.type
  const transactionLabel = property.transactionType
    ? TRANSACTION_TYPE_LABELS[property.transactionType] ?? null
    : null
  const location = [property.neighborhood, property.city].filter(Boolean).join(", ")
  const image = property.images[0]

  return (
    <Link
      href={`/p/${property.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-2xl overflow-hidden border border-hairline bg-white shadow-sm hover:shadow-xl hover:shadow-black/10 transition-shadow duration-300"
    >
      <div className="relative aspect-[4/3] bg-canvas-soft overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mute">
            <Building2 className="w-8 h-8" strokeWidth={1.5} />
          </div>
        )}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-ink text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
          {typeLabel}
          {transactionLabel ? ` · ${transactionLabel}` : ""}
        </span>
      </div>
      <div className="bg-ink px-4 py-3.5">
        <p className="text-white text-sm font-black truncate tracking-tight">{property.title}</p>
        {location && (
          <p className="text-white/80 text-xs mt-0.5 truncate">{location}</p>
        )}
        <p className="text-white text-base font-black mt-1.5 tracking-tight">
          {formatCOP(property.price)}
        </p>
      </div>
    </Link>
  )
}

export default function FeaturedProperties({ properties }: { properties: FeaturedProperty[] }) {
  if (properties.length === 0) return null

  return (
    <section id="featured" className="py-24 bg-canvas-softer">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl mb-14">
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-ink tracking-tight leading-none">
            Así lucen las fichas
            <br />
            <span className="text-mute">de nuestros agentes.</span>
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.slice(0, VISIBLE_COUNT).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  )
}
