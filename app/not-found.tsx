import type { Metadata } from "next"
import { headers } from "next/headers"
import { ListingUnavailable, PageNotFound } from "@/components/not-found-shell"
import { MISSING_LISTING_HEADER } from "@/lib/listing-seo"

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "La página que buscas no existe o fue movida.",
  openGraph: {
    title: { absolute: "Página no encontrada — Conexory" },
    description: "La página que buscas no existe o fue movida.",
    locale: "es_CO",
    siteName: "Conexory",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: { absolute: "Página no encontrada — Conexory" },
    description: "La página que buscas no existe o fue movida.",
  },
}

export default async function NotFound() {
  const missingListing = (await headers()).get(MISSING_LISTING_HEADER) === "1"
  return missingListing ? <ListingUnavailable /> : <PageNotFound />
}
