import { beforeEach, describe, expect, mock, test } from "bun:test"
import { setupIncrementalCache } from "@/lib/test-utils/incremental-cache"

const row = {
  id: "p1",
  slug: "apto-poblado",
  title: "Apartamento en El Poblado",
  type: "apartment",
  transactionType: "sale",
  price: { toString: () => "450000000" },
  city: "Medellín",
  state: "Antioquia",
  neighborhood: "El Poblado",
  images: ["https://example.com/1.jpg"],
  area: 80,
  bedrooms: 3,
  bathrooms: 2,
  parking: 1,
  shares: 4,
  latitude: 6.2,
  longitude: -75.5,
  createdAt: new Date("2026-10-01T12:00:00Z"),
  pinnedAt: null as Date | null,
}

type Args = { where?: unknown; orderBy?: unknown; skip?: number; take?: number }
const findMany = mock((args: Args) => {
  void args
  return Promise.resolve<unknown[]>([row])
})
const count = mock((args: Args) => {
  void args
  return Promise.resolve(1)
})
const aggregate = mock(() =>
  Promise.resolve<{
    _min: { price: { toString: () => string } | null; area: number | null }
    _max: { price: { toString: () => string } | null; area: number | null }
  }>({
    _min: { price: { toString: () => "100000000" }, area: 40 },
    _max: { price: { toString: () => "900000000" }, area: 200 },
  })
)
const groupBy = mock(() =>
  Promise.resolve([
    { city: "Medellín", _count: { _all: 3 } },
    { city: "medellin", _count: { _all: 2 } },
    { city: "Bogotá D.C.", _count: { _all: 1 } },
    { city: "...", _count: { _all: 5 } },
  ])
)
const $transaction = mock((queries: Promise<unknown>[]) => Promise.all(queries))

mock.module("@/lib/prisma", () => ({
  prisma: { property: { findMany, count, aggregate, groupBy }, $transaction },
}))

const {
  getProperties,
  getPropertiesForMap,
  getPropertyFacets,
  getCityIndex,
  parsePropertyQuery,
  pickDisplayCity,
  withPropertyPage,
} = await import("./properties")

setupIncrementalCache()

beforeEach(() => {
  findMany.mockClear()
  findMany.mockImplementation(() => Promise.resolve([row]))
  count.mockClear()
  aggregate.mockClear()
  groupBy.mockClear()
})

const base = { published: true }

describe("parsePropertyQuery", () => {
  test("defaults to the first page of the most recent listings with no filters", () => {
    expect(parsePropertyQuery({})).toEqual({
      filters: {
        type: undefined,
        transactionType: undefined,
        priceMin: undefined,
        priceMax: undefined,
        areaMin: undefined,
        areaMax: undefined,
        minBeds: undefined,
        minBaths: undefined,
        minParking: undefined,
        query: undefined,
      },
      sort: "recent",
      page: 1,
    })
  })

  test("maps the Spanish URL params onto filters", () => {
    const { filters, sort, page } = parsePropertyQuery({
      type: "house",
      transaccion: "rent",
      priceMin: "1000000",
      priceMax: "3000000",
      areaMin: "50",
      areaMax: "120",
      beds: "2",
      baths: "1",
      parking: "1",
      q: "laureles",
      sort: "price-asc",
      page: "3",
    })
    expect(filters).toEqual({
      type: "house",
      transactionType: "rent",
      priceMin: 1000000,
      priceMax: 3000000,
      areaMin: 50,
      areaMax: 120,
      minBeds: 2,
      minBaths: 1,
      minParking: 1,
      query: "laureles",
    })
    expect(sort).toBe("price-asc")
    expect(page).toBe(3)
  })

  test("ignores tampered values instead of crashing the page", () => {
    const { filters, sort, page } = parsePropertyQuery({
      priceMin: "abc",
      beds: "Infinity",
      sort: "random",
      page: "-2",
    })
    expect(filters.priceMin).toBeUndefined()
    expect(filters.minBeds).toBeUndefined()
    expect(sort).toBe("recent")
    expect(page).toBe(1)
  })

  test("floors fractional pages and takes the first value of repeated params", () => {
    const { filters, page } = parsePropertyQuery({ page: "2.7", type: ["lot", "house"] })
    expect(page).toBe(2)
    expect(filters.type).toBe("lot")
  })
})

describe("withPropertyPage", () => {
  test("keeps the active filters and overrides only the page", () => {
    const qs = new URLSearchParams(withPropertyPage({ type: "house", page: "9", q: undefined }, 2))
    expect(qs.get("type")).toBe("house")
    expect(qs.get("page")).toBe("2")
    expect(qs.has("q")).toBe(false)
  })

  test("preserves repeated params", () => {
    const qs = new URLSearchParams(withPropertyPage({ type: ["lot", "house"] }, 1))
    expect(qs.getAll("type")).toEqual(["lot", "house"])
  })
})

describe("pickDisplayCity", () => {
  test("prefers a capitalized spelling over an all-lowercase typo", () => {
    expect(pickDisplayCity(["medellin", "Medellín"])).toBe("Medellín")
  })

  test("falls back to the longest variant when none is capitalized", () => {
    expect(pickDisplayCity(["bogota", "bogota dc"])).toBe("bogota dc")
  })
})

describe("getProperties", () => {
  test("returns serializable cards with numeric prices and timestamps", async () => {
    const { properties, total } = await getProperties(base, {}, "recent", 1)
    expect(total).toBe(1)
    expect(properties[0].price).toBe(450000000)
    expect(properties[0].createdAt).toBe(row.createdAt.getTime())
    expect(properties[0].pinnedAt).toBeNull()
  })

  test("orders pinned listings first, then the newest", async () => {
    await getProperties(base, {}, "recent", 1)
    expect(findMany.mock.calls[0][0].orderBy).toEqual([
      { pinnedAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ])
  })

  test("sorts by price when asked", async () => {
    await getProperties(base, {}, "price-desc", 1)
    await getProperties(base, {}, "price-asc", 1)
    expect(findMany.mock.calls[0][0].orderBy).toEqual([{ price: "desc" }])
    expect(findMany.mock.calls[1][0].orderBy).toEqual([{ price: "asc" }])
  })

  test("paginates and never asks for a page before the first", async () => {
    await getProperties(base, {}, "recent", 3, 6)
    await getProperties(base, {}, "recent", 0, 6)
    expect(findMany.mock.calls[0][0]).toMatchObject({ skip: 12, take: 6 })
    expect(findMany.mock.calls[1][0]).toMatchObject({ skip: 0, take: 6 })
  })

  test("combines every filter with the base scope", async () => {
    await getProperties(
      base,
      {
        type: "apartment",
        transactionType: "rent",
        priceMin: 1,
        priceMax: 2,
        areaMin: 3,
        areaMax: 4,
        minBeds: 2,
        minBaths: 1,
        minParking: 1,
        query: "  poblado  ",
      },
      "recent",
      1
    )
    expect(findMany.mock.calls[0][0].where).toEqual({
      AND: [
        base,
        { type: "apartment" },
        { transactionType: "rent" },
        { price: { gte: 1, lte: 2 } },
        { area: { gte: 3, lte: 4 } },
        { bedrooms: { gte: 2 } },
        { bathrooms: { gte: 1 } },
        { parking: { gte: 1 } },
        {
          OR: [
            { title: { contains: "poblado", mode: "insensitive" } },
            { city: { contains: "poblado", mode: "insensitive" } },
            { neighborhood: { contains: "poblado", mode: "insensitive" } },
            { state: { contains: "poblado", mode: "insensitive" } },
          ],
        },
      ],
    })
    expect(count.mock.calls[0][0].where).toEqual(findMany.mock.calls[0][0].where)
  })

  test("supports open-ended ranges and skips a blank search", async () => {
    await getProperties(base, { priceMin: 5, areaMax: 90, query: "   " }, "recent", 1)
    expect(findMany.mock.calls[0][0].where).toEqual({
      AND: [base, { price: { gte: 5 } }, { area: { lte: 90 } }],
    })
  })
})

describe("getPropertiesForMap", () => {
  test("returns every matching listing with a numeric price", async () => {
    const pins = await getPropertiesForMap(base, { type: "house" })
    expect(pins[0].price).toBe(450000000)
    expect(findMany.mock.calls[0][0].where).toEqual({ AND: [base, { type: "house" }] })
    expect(findMany.mock.calls[0][0].take).toBeUndefined()
  })
})

describe("getPropertyFacets", () => {
  test("describes the unfiltered scope for the filter bar", async () => {
    findMany
      .mockImplementationOnce(() => Promise.resolve([{ city: "Medellín" }, { city: "Bogotá" }]))
      .mockImplementationOnce(() => Promise.resolve([{ type: "apartment" }, { type: "legacy" }]))
    count.mockImplementationOnce(() => Promise.resolve(7))

    expect(await getPropertyFacets(base)).toEqual({
      totalCount: 7,
      uniqueCityCount: 2,
      priceBounds: [100000000, 900000000],
      areaBounds: [40, 200],
      types: [
        ["apartment", "Apartamento"],
        ["legacy", "legacy"],
      ],
    })
  })

  test("has no bounds when there are no listings", async () => {
    aggregate.mockImplementationOnce(() =>
      Promise.resolve({ _min: { price: null, area: null }, _max: { price: null, area: null } })
    )
    findMany.mockImplementation(() => Promise.resolve([]))
    count.mockImplementationOnce(() => Promise.resolve(0))

    const facets = await getPropertyFacets(base)
    expect(facets.priceBounds).toBeNull()
    expect(facets.areaBounds).toBeNull()
  })
})

describe("getCityIndex", () => {
  test("merges spelling variants of a city into one page and drops unsluggable names", async () => {
    expect(await getCityIndex()).toEqual([
      { slug: "medellin", cities: ["Medellín", "medellin"], count: 5 },
      { slug: "bogota-dc", cities: ["Bogotá D.C."], count: 1 },
    ])
    expect(groupBy).toHaveBeenCalledWith(expect.objectContaining({ where: { published: true } }))
  })
})
