import { describe, expect, test } from "bun:test"
import { listingOffer, publicListingSlug } from "./listing-seo"

describe("publicListingSlug", () => {
  test("reads a listing path", () => {
    expect(publicListingSlug("/p/qcj77ot")).toBe("qcj77ot")
  })

  test("ignores the og image and other nested paths", () => {
    expect(publicListingSlug("/p/qcj77ot/og.jpg")).toBeNull()
    expect(publicListingSlug("/precios")).toBeNull()
    expect(publicListingSlug("/")).toBeNull()
  })
})

describe("listingOffer", () => {
  test("marks a sale", () => {
    expect(listingOffer("sale", 1000).businessFunction).toBe("https://schema.org/Sell")
    expect(listingOffer("sale", 1000).priceSpecification).toBeUndefined()
  })

  test("marks a monthly rental", () => {
    const offer = listingOffer("rent", 10_000_000)
    expect(offer.businessFunction).toBe("https://schema.org/LeaseOut")
    expect(offer.priceSpecification).toEqual({
      "@type": "UnitPriceSpecification",
      price: 10_000_000,
      priceCurrency: "COP",
      referenceQuantity: {
        "@type": "QuantitativeValue",
        value: 1,
        unitCode: "MON",
      },
    })
  })

  test("treats a furnished rental as a monthly lease", () => {
    expect(listingOffer("rent_furnished", 1).businessFunction).toBe("https://schema.org/LeaseOut")
  })

  test("leaves exchange and unknown operations unlabeled", () => {
    expect(listingOffer("exchange", 1).businessFunction).toBeUndefined()
    expect(listingOffer(null, 1).businessFunction).toBeUndefined()
  })
})
