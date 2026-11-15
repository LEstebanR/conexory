const LEASE_TYPES = new Set(["rent", "rent_furnished"])

// Set by the proxy when it rewrites a missing listing to the root 404, so that
// page can show the listing-specific message while keeping a real 404 status.
export const MISSING_LISTING_HEADER = "x-missing-listing"

export function publicListingSlug(pathname: string): string | null {
  const match = /^\/p\/([^/]+)\/?$/.exec(pathname)
  if (!match) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

export function listingOffer(transactionType: string | null, price: number) {
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    price,
    priceCurrency: "COP",
    availability: "https://schema.org/InStock",
  }

  if (transactionType === "sale") {
    offer.businessFunction = "https://schema.org/Sell"
    return offer
  }

  if (transactionType && LEASE_TYPES.has(transactionType)) {
    offer.businessFunction = "https://schema.org/LeaseOut"
    offer.priceSpecification = {
      "@type": "UnitPriceSpecification",
      price,
      priceCurrency: "COP",
      referenceQuantity: {
        "@type": "QuantitativeValue",
        value: 1,
        unitCode: "MON",
      },
    }
  }

  return offer
}
