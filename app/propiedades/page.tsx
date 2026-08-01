import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, MapPin } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { getCityIndex, pickDisplayCity, MIN_CITY_LISTINGS } from "@/lib/properties"

export const metadata: Metadata = {
  title: "Propiedades por ciudad",
  description: "Explora propiedades publicadas por agentes inmobiliarios en Conexory, organizadas por ciudad.",
  alternates: { canonical: "/propiedades" },
}

export default async function PropertiesIndexPage() {
  const cityIndex = await getCityIndex()
  const cities = cityIndex
    .filter((g) => g.count >= MIN_CITY_LISTINGS)
    .map((g) => ({ slug: g.slug, label: pickDisplayCity(g.cities), count: g.count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Navbar />

      <section className="pt-12 pb-6 px-5">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-black text-ink tracking-tight leading-tight">Propiedades por ciudad</h1>
          <p className="text-sm text-mute font-medium mt-1">
            Explora las propiedades activas publicadas por agentes en Conexory.
          </p>
        </div>
      </section>

      <section className="flex-1">
        <div className="max-w-lg mx-auto w-full px-5 pb-10 space-y-2.5">
          {cities.length === 0 && (
            <p className="text-sm text-mute">Todavía no hay suficientes propiedades publicadas por ciudad.</p>
          )}
          {cities.map(({ slug, label, count }) => (
            <Link
              key={slug}
              href={`/propiedades/${slug}`}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-hairline bg-white hover:border-ink transition-colors"
            >
              <span className="flex items-center gap-2 min-w-0">
                <MapPin className="w-4 h-4 text-mute flex-shrink-0" strokeWidth={2} />
                <span className="text-sm font-bold text-ink truncate">{label}</span>
                <span className="text-xs text-mute font-medium flex-shrink-0">{count}</span>
              </span>
              <ArrowUpRight className="w-4 h-4 text-mute flex-shrink-0" strokeWidth={2} />
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
