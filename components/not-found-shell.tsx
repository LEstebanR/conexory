import type { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { Home, MapPinOff } from "lucide-react"
import { attributedHref } from "@/lib/attribution"

type Props = {
  icon: ReactNode
  eyebrow?: string
  title: string
  description: string
  cta: { href: string; label: string }
  fromListing?: boolean
}

function NotFoundShell({ icon, eyebrow, title, description, cta, fromListing = false }: Props) {
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
          {icon}
        </div>
        {eyebrow && <p className="text-xs font-bold text-ink uppercase tracking-widest mb-3">{eyebrow}</p>}
        <h1 className="text-2xl font-bold text-ink mb-3">{title}</h1>
        <p className="text-body text-base leading-relaxed max-w-sm mb-8">{description}</p>
        <Link
          href={cta.href}
          className="inline-flex items-center bg-ink hover:bg-elevated text-white text-base font-medium px-6 py-3 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
        >
          {cta.label}
        </Link>
      </main>

      <footer className="border-t border-hairline bg-white py-5 px-4 text-center">
        <p className="text-xs text-body">
          {fromListing && "Ficha creada con "}
          <Link
            href={fromListing ? attributedHref("/", "property_page") : "/"}
            className="text-ink font-semibold hover:underline"
          >
            Conexory
          </Link>
        </p>
      </footer>
    </div>
  )
}

export function ListingUnavailable() {
  return (
    <NotFoundShell
      icon={<Home className="w-9 h-9 text-mute" strokeWidth={1.5} />}
      title="Esta propiedad ya no está disponible"
      description="Es posible que ya se haya vendido o arrendado. Si te enviaron este link, pídele al agente uno nuevo o mira otras propiedades publicadas."
      cta={{ href: "/propiedades", label: "Ver propiedades" }}
      fromListing
    />
  )
}

export function PageNotFound() {
  return (
    <NotFoundShell
      icon={<MapPinOff className="w-9 h-9 text-mute" strokeWidth={1.5} />}
      eyebrow="Error 404"
      title="Página no encontrada"
      description="La página que buscas no existe o fue movida."
      cta={{ href: "/", label: "Ir al inicio" }}
    />
  )
}
