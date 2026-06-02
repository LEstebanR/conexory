import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://inmobiliaria-link-app.vercel.app"),
  title: "MiAgente — Comparte tus propiedades en segundos",
  description:
    "La forma más rápida de publicar y compartir propiedades en Colombia. Crea tu ficha en 60 segundos y compártela por WhatsApp con un link único.",
  keywords:
    "compartir propiedades Colombia, publicar propiedades WhatsApp, agentes inmobiliarios, ficha de propiedad, link propiedad",
  openGraph: {
    title: "MiAgente — Crea. Comparte. Vende.",
    description:
      "Crea la ficha de tu propiedad en 60 segundos y compártela por WhatsApp. Diseñado para agentes colombianos.",
    type: "website",
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
