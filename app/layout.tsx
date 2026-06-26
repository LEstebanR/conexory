import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { getAppUrl } from "@/lib/urls"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const APP_URL = getAppUrl()

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Conexory — Comparte tus propiedades por WhatsApp en segundos",
    template: "%s — Conexory",
  },
  description:
    "La herramienta más rápida para asesores inmobiliarios en Colombia. Publica tu propiedad en 60 segundos y compártela por WhatsApp con un link único y profesional.",
  keywords: [
    "asesor inmobiliario Colombia",
    "compartir propiedades WhatsApp",
    "publicar propiedades online",
    "ficha de propiedad digital",
    "link propiedad inmobiliaria",
    "CRM inmobiliario Colombia",
    "vender propiedades WhatsApp",
    "inmobiliaria digital Colombia",
  ],
  authors: [{ name: "Conexory" }],
  creator: "Conexory",
  publisher: "Conexory",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "Conexory — Crea. Comparte. Vende.",
    description:
      "Crea la ficha de tu propiedad en 60 segundos y compártela por WhatsApp. Diseñado para asesores inmobiliarios colombianos.",
    type: "website",
    locale: "es_CO",
    siteName: "Conexory",
  },
  twitter: {
    card: "summary_large_image",
    title: "Conexory — Comparte propiedades por WhatsApp",
    description:
      "Crea la ficha de tu propiedad en 60 segundos y compártela por WhatsApp. Diseñado para agentes colombianos.",
  },
  alternates: {
    canonical: APP_URL,
  },
  verification: {
    google: "3L9SqbwkEe2EMtjeK8_ife3MMmCukkGx1us6Z0f65WA",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
