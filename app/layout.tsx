import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "MiAgente — CRM Inmobiliario para Colombia",
  description:
    "El CRM inmobiliario más simple para agentes colombianos. Publica en Vivanuncios y Fincaraíz con un click, gestiona tus leads y ten tu propia web profesional.",
  keywords:
    "CRM inmobiliario, agentes inmobiliarios Colombia, Vivanuncios, Fincaraíz, gestión propiedades",
  openGraph: {
    title: "MiAgente — Vende y arrienda más. Sin complicaciones.",
    description:
      "El CRM inmobiliario diseñado para agentes colombianos. Publica en múltiples portales con un click.",
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
