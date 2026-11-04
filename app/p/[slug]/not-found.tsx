import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Home } from "lucide-react"

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
  return (
    <div className="min-h-screen bg-canvas-softer flex flex-col">
      <header className="bg-white border-b border-hairline px-4 sm:px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center shadow-sm">
            <Image src="/mark-white.png" alt="Conexory" width={18} height={18} className="w-4.5 h-4.5" />
          </div>
          <span className="text-sm font-bold text-ink">Conexory</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-canvas-soft flex items-center justify-center mb-6">
          <Home className="w-9 h-9 text-mute" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-ink mb-3">
          Esta propiedad ya no está disponible
        </h1>
        <p className="text-body text-base leading-relaxed max-w-sm mb-8">
          Es posible que ya se haya vendido o arrendado. Si te enviaron este link, pídele al agente uno nuevo o mira otras propiedades publicadas.
        </p>
        <Link
          href="/propiedades"
          className="inline-flex items-center bg-ink hover:bg-elevated text-white text-base font-medium px-6 py-3 rounded-full transition-colors"
        >
          Ver propiedades
        </Link>
      </main>

      <footer className="border-t border-hairline bg-white py-5 px-4 text-center">
        <p className="text-xs text-body">
          Ficha creada con{" "}
          <Link href="/" className="text-ink font-semibold hover:underline">
            Conexory
          </Link>
        </p>
      </footer>
    </div>
  )
}
