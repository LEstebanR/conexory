import type { Metadata } from "next"
import { ListingUnavailable } from "@/components/not-found-shell"

export const metadata: Metadata = {
  title: "Propiedad no encontrada",
  description: "Esta propiedad no existe o el enlace ya no está disponible.",
  openGraph: {
    title: { absolute: "Propiedad no encontrada — Conexory" },
    description: "Esta propiedad no existe o el enlace ya no está disponible.",
    locale: "es_CO",
    siteName: "Conexory",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: { absolute: "Propiedad no encontrada — Conexory" },
    description: "Esta propiedad no existe o el enlace ya no está disponible.",
  },
}

export default function PropertyNotFound() {
  return <ListingUnavailable />
}
