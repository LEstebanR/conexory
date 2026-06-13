import type { Metadata } from "next"
import { Inter } from "next/font/google"
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
    default: "MiAgente — Comparte tus propiedades por WhatsApp en segundos",
    template: "%s — MiAgente",
  },
  description:
    "La herramienta más rápida para agentes inmobiliarios en Colombia. Publica tu propiedad en 60 segundos y compártela por WhatsApp con un link único y profesional.",
  keywords: [
    "agente inmobiliario Colombia",
    "compartir propiedades WhatsApp",
    "publicar propiedades online",
    "ficha de propiedad digital",
    "link propiedad inmobiliaria",
    "CRM inmobiliario Colombia",
    "vender propiedades WhatsApp",
    "inmobiliaria digital Colombia",
  ],
  authors: [{ name: "MiAgente" }],
  creator: "MiAgente",
  publisher: "MiAgente",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "MiAgente — Crea. Comparte. Vende.",
    description:
      "Crea la ficha de tu propiedad en 60 segundos y compártela por WhatsApp. Diseñado para agentes inmobiliarios colombianos.",
    type: "website",
    locale: "es_CO",
    siteName: "MiAgente",
  },
  twitter: {
    card: "summary_large_image",
    title: "MiAgente — Comparte propiedades por WhatsApp",
    description:
      "Crea la ficha de tu propiedad en 60 segundos y compártela por WhatsApp. Diseñado para agentes colombianos.",
  },
  alternates: {
    canonical: APP_URL,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  )
}
