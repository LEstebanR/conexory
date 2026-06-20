import Link from "next/link"
import Image from "next/image"
import { Mail } from "lucide-react"

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
    <footer className="bg-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <Image
                  src="/mark-black.png"
                  alt="Conexory"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Conexory
              </span>
            </Link>
            <p className="text-mute text-sm leading-relaxed max-w-xs">
              La forma más rápida de crear y compartir propiedades en Colombia.
              Construido por agentes, para agentes.
            </p>
            <a
              href="mailto:Conexory@gmail.com"
              aria-label="Email"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-mute hover:text-white hover:bg-white/10 transition-colors"
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
                      className="text-sm text-mute hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-mute">
            © 2026 Conexory · Hecho en Colombia
          </p>
          <p className="text-xs text-white/30">
            En proceso de registro · Bogotá D.C.
          </p>
        </div>
      </div>
    </footer>
  )
}
