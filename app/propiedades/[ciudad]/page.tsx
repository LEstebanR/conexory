import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import AgentProperties from "@/app/agente/[slug]/agent-properties"
import { getAppUrl } from "@/lib/urls"
import { buildCityTitle, buildCityDescription } from "@/lib/city-seo"
import {
  getProperties, getPropertyFacets, getPropertiesForMap, parsePropertyQuery,
  withPropertyPage, getCityIndex, pickDisplayCity, MIN_CITY_LISTINGS, PROPERTIES_PAGE_SIZE,
} from "@/lib/properties"

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ ciudad: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const { ciudad } = await params
  const cityIndex = await getCityIndex()
  const group = cityIndex.find((g) => g.slug === ciudad)
  if (!group) return {}

  const sp = await searchParams
  const { filters } = parsePropertyQuery(sp)
  const cityLabel = pickDisplayCity(group.cities)

  return {
    title: buildCityTitle(cityLabel, filters.type, filters.transactionType),
    description: buildCityDescription(cityLabel, filters.type, filters.transactionType),
    alternates: { canonical: `/propiedades/${ciudad}` },
    ...(group.count < MIN_CITY_LISTINGS ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function CityPropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ ciudad: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { ciudad } = await params
  const cityIndex = await getCityIndex()
  const group = cityIndex.find((g) => g.slug === ciudad)
  if (!group) notFound()

  const cityLabel = pickDisplayCity(group.cities)
  const base = { published: true, city: { in: group.cities } }

  const sp = await searchParams
  const { filters, sort, page } = parsePropertyQuery(sp)

  const facets = await getPropertyFacets(base)

  const [{ properties, total }, mapProperties] = await Promise.all([
    getProperties(base, filters, sort, page, PROPERTIES_PAGE_SIZE),
    getPropertiesForMap(base, filters),
  ])

  if (properties.length === 0 && total > 0 && page > 1) {
    const totalPages = Math.max(1, Math.ceil(total / PROPERTIES_PAGE_SIZE))
    redirect(`/propiedades/${ciudad}?${withPropertyPage(sp, totalPages)}`)
  }

  const appUrl = getAppUrl()
  const title = buildCityTitle(cityLabel, filters.type, filters.transactionType)

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: appUrl },
      { "@type": "ListItem", position: 2, name: "Propiedades", item: `${appUrl}/propiedades` },
      { "@type": "ListItem", position: 3, name: cityLabel, item: `${appUrl}/propiedades/${ciudad}` },
    ],
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      <section className="pt-12 pb-6 px-5">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-black text-ink tracking-tight leading-tight">{title}</h1>
          <p className="text-sm text-mute font-medium mt-1">
            {facets.totalCount} {facets.totalCount === 1 ? "propiedad publicada" : "propiedades publicadas"}
          </p>
        </div>
      </section>

      <section className="flex-1">
        <div className="max-w-lg mx-auto w-full px-5 pb-10">
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
        </div>
      </section>

      <Footer />
    </div>
  )
}
