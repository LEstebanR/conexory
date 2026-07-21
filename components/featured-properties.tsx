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
      className="group flex-shrink-0 w-64 sm:w-72 rounded-2xl overflow-hidden border border-hairline bg-white shadow-sm hover:shadow-xl hover:shadow-black/10 transition-shadow duration-300"
    >
      <div className="relative aspect-[4/3] bg-canvas-soft overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={property.title}
            fill
            sizes="288px"
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
          <p className="text-white/60 text-xs mt-0.5 truncate">{location}</p>
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

  const items = [...properties, ...properties]

  return (
    <section id="featured" className="py-24 bg-canvas-softer overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl mb-14">
          <p className="text-body font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            Propiedades destacadas
          </p>
          <h2 className="text-4xl sm:text-5xl font-black text-ink tracking-tighter leading-none">
            Así lucen las fichas
            <br />
            <span className="text-mute">de nuestros agentes.</span>
          </h2>
        </Reveal>
      </div>

      <div className="relative [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="flex w-max gap-5 px-5 animate-[marquee_50s_linear_infinite] hover:[animation-play-state:paused]">
          {items.map((property, i) => (
            <PropertyCard key={`${property.id}-${i}`} property={property} />
          ))}
        </div>
      </div>
    </section>
  )
}
