import Link from "next/link"
import { Building2, Mail } from "lucide-react"
import { BRAND_EMAILS } from "@/lib/brand"

const links = {
  Producto: [
    { label: "Funciones", href: "/#features" },
    { label: "Precios", href: "/precios" },
    { label: "Roadmap", href: "/roadmap" },
    { label: "Blog", href: "/blog" },
  ],
  Legal: [
    { label: "Términos de uso", href: "/terms" },
    { label: "Privacidad", href: "/privacy" },
    { label: "Cookies", href: "/cookies" },
    { label: "Contacto", href: "/contacto" },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <div className="w-8 h-8 rounded-xl bg-brand-400 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Conexory
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              La forma más rápida de crear y compartir propiedades en Colombia.
              Construido por agentes, para agentes.
            </p>
            <a
              href={`mailto:${BRAND_EMAILS.hola}`}
              aria-label="Email"
              className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © 2026 Conexory · Hecho con 🇨🇴 en Colombia
          </p>
          <p className="text-xs text-slate-700">
            En proceso de registro · Bogotá D.C.
          </p>
        </div>
      </div>
    </footer>
  )
}
