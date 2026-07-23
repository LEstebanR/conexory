import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { PROPERTY_TYPE_LABELS } from "@/lib/property-types"
import type { AgentProperty } from "@/app/agente/[slug]/agent-properties"
import type { MapProperty } from "@/app/agente/[slug]/agent-map"

export const PROPERTIES_PAGE_SIZE = 6

export type PropertySort = "recent" | "price-desc" | "price-asc"

export interface PropertyFilters {
  type?: string
  priceMin?: number
  priceMax?: number
  areaMin?: number
  areaMax?: number
  minBeds?: number
  minBaths?: number
  minParking?: number
  query?: string
}

export interface PropertyFacets {
  totalCount: number
  uniqueCityCount: number
  priceBounds: [number, number] | null
  areaBounds: [number, number] | null
  types: [string, string][]
}

const PROPERTY_SELECT = {
  id: true,
  slug: true,
  title: true,
  type: true,
  transactionType: true,
  price: true,
  city: true,
  state: true,
  neighborhood: true,
  images: true,
  area: true,
  bedrooms: true,
  bathrooms: true,
  parking: true,
  shares: true,
  latitude: true,
  longitude: true,
  createdAt: true,
  pinnedAt: true,
} satisfies Prisma.PropertySelect

type PropertyRow = Prisma.PropertyGetPayload<{ select: typeof PROPERTY_SELECT }>

function toAgentProperty(p: PropertyRow): AgentProperty {
  return {
    ...p,
    price: Number(p.price),
    createdAt: p.createdAt.getTime(),
    pinnedAt: p.pinnedAt ? p.pinnedAt.getTime() : null,
  }
}

function buildWhere(base: Prisma.PropertyWhereInput, filters: PropertyFilters): Prisma.PropertyWhereInput {
  const conditions: Prisma.PropertyWhereInput[] = [base]

  if (filters.type) conditions.push({ type: filters.type })

  if (filters.priceMin != null || filters.priceMax != null) {
    conditions.push({
      price: {
        ...(filters.priceMin != null ? { gte: filters.priceMin } : {}),
        ...(filters.priceMax != null ? { lte: filters.priceMax } : {}),
      },
    })
  }

  if (filters.areaMin != null || filters.areaMax != null) {
    conditions.push({
      area: {
        ...(filters.areaMin != null ? { gte: filters.areaMin } : {}),
        ...(filters.areaMax != null ? { lte: filters.areaMax } : {}),
      },
    })
  }

  if (filters.minBeds != null) conditions.push({ bedrooms: { gte: filters.minBeds } })
  if (filters.minBaths != null) conditions.push({ bathrooms: { gte: filters.minBaths } })
  if (filters.minParking != null) conditions.push({ parking: { gte: filters.minParking } })

  const q = filters.query?.trim()
  if (q) {
    conditions.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { neighborhood: { contains: q, mode: "insensitive" } },
        { state: { contains: q, mode: "insensitive" } },
      ],
    })
  }

  return { AND: conditions }
}

function buildOrderBy(sort: PropertySort): Prisma.PropertyOrderByWithRelationInput[] {
  if (sort === "price-desc") return [{ price: "desc" }]
  if (sort === "price-asc") return [{ price: "asc" }]
  return [{ pinnedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }]
}

export async function getProperties(
  base: Prisma.PropertyWhereInput,
  filters: PropertyFilters,
  sort: PropertySort,
  page: number,
  pageSize: number = PROPERTIES_PAGE_SIZE
): Promise<{ properties: AgentProperty[]; total: number }> {
  const where = buildWhere(base, filters)
  const orderBy = buildOrderBy(sort)
  const safePage = Math.max(1, page)

  const [rows, total] = await prisma.$transaction([
    prisma.property.findMany({
      where,
      orderBy,
      select: PROPERTY_SELECT,
      skip: (safePage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.property.count({ where }),
  ])

  return { properties: rows.map(toAgentProperty), total }
}

export async function getPropertiesForMap(
  base: Prisma.PropertyWhereInput,
  filters: PropertyFilters
): Promise<MapProperty[]> {
  const where = buildWhere(base, filters)
  const rows = await prisma.property.findMany({
    where,
    select: {
      id: true, slug: true, title: true, city: true, state: true, price: true,
      images: true, latitude: true, longitude: true,
    },
  })
  return rows.map((p) => ({ ...p, price: Number(p.price) }))
}

// Facets describe the *unfiltered* scope (all published properties in base) —
// used for filter-bar bounds/options and header stats, so they don't shift as
// the user filters. `total` from getProperties is the filtered/paginated count.
export async function getPropertyFacets(base: Prisma.PropertyWhereInput): Promise<PropertyFacets> {
  const [agg, cities, types, totalCount] = await Promise.all([
    prisma.property.aggregate({
      where: base,
      _min: { price: true, area: true },
      _max: { price: true, area: true },
    }),
    prisma.property.findMany({ where: base, select: { city: true }, distinct: ["city"] }),
    prisma.property.findMany({ where: base, select: { type: true }, distinct: ["type"] }),
    prisma.property.count({ where: base }),
  ])

  const priceBounds: [number, number] | null =
    agg._min.price != null && agg._max.price != null
      ? [Number(agg._min.price), Number(agg._max.price)]
      : null

  const areaBounds: [number, number] | null =
    agg._min.area != null && agg._max.area != null
      ? [agg._min.area, agg._max.area]
      : null

  return {
    totalCount,
    uniqueCityCount: cities.length,
    priceBounds,
    areaBounds,
    types: types.map((t): [string, string] => [t.type, PROPERTY_TYPE_LABELS[t.type] ?? t.type]),
  }
}

export type SearchParamsRecord = Record<string, string | string[] | undefined>

// Rebuilds a query string from resolved searchParams with `page` overridden —
// used to redirect to the last valid page when a stale/out-of-range page
// (e.g. an old bookmark, or a filter that shrank the result set) is requested.
export function withPropertyPage(searchParams: SearchParamsRecord, page: number): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (value == null) continue
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, v)
    } else {
      params.set(key, value)
    }
  }
  params.set("page", String(page))
  return params.toString()
}

export function parsePropertyQuery(searchParams: SearchParamsRecord): {
  filters: PropertyFilters
  sort: PropertySort
  page: number
} {
  const get = (key: string): string | undefined => {
    const v = searchParams[key]
    return Array.isArray(v) ? v[0] : v
  }
  const num = (key: string): number | undefined => {
    const v = get(key)
    if (!v) return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }

  const sortParam = get("sort")
  const sort: PropertySort =
    sortParam === "price-desc" || sortParam === "price-asc" ? sortParam : "recent"

  const pageParam = num("page")
  const page = pageParam != null && pageParam >= 1 ? Math.floor(pageParam) : 1

  return {
    filters: {
      type: get("type") || undefined,
      priceMin: num("priceMin"),
      priceMax: num("priceMax"),
      areaMin: num("areaMin"),
      areaMax: num("areaMax"),
      minBeds: num("beds"),
      minBaths: num("baths"),
      minParking: num("parking"),
      query: get("q") || undefined,
    },
    sort,
    page,
  }
}
