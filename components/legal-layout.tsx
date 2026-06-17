import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export interface LegalSection {
  id: string
  title: string
}

interface LegalLayoutProps {
  title: string
  description: string
  lastUpdated: string
  sections: LegalSection[]
  children: React.ReactNode
}

export default function LegalLayout({
  title,
  description,
  lastUpdated,
  sections,
  children,
}: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-hairline">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center">
              <Image src="/mark-white.png" alt="Conexory" width={18} height={18} className="w-4.5 h-4.5" />
            </div>
            <span className="text-base font-black text-ink tracking-tight">
              Conexory
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-body hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-ink py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-mute font-bold text-xs uppercase tracking-[0.2em] mb-4">
            Legal
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none mb-4">
            {title}
          </h1>
          <p className="text-mute text-base max-w-xl leading-relaxed mb-6">
            {description}
          </p>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-xs text-mute">
              Última actualización:{" "}
              <span className="text-white font-semibold">{lastUpdated}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-[200px_1fr] xl:grid-cols-[220px_1fr] gap-12 lg:gap-16 items-start">
          {/* TOC — sticky sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <p className="text-[10px] font-bold text-mute uppercase tracking-[0.15em] mb-4">
                Contenido
              </p>
              <nav className="space-y-0.5">
                {sections.map((section, i) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-start gap-2.5 py-1.5 px-2 rounded-lg text-sm text-body hover:text-ink hover:bg-canvas-soft transition-all duration-150 group"
                  >
                    <span className="text-[10px] text-mute group-hover:text-ink font-black mt-0.5 tabular-nums w-5 flex-shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-snug">{section.title}</span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-hairline py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-mute">
            © 2026 Conexory · Hecho en Colombia
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-xs text-mute hover:text-ink transition-colors"
            >
              Términos de uso
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-mute hover:text-ink transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="/login"
              className="text-xs text-mute hover:text-ink transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ── Helpers exportados para usar en las páginas ── */

export function LegalSection({
  id,
  number,
  title,
  children,
}: {
  id: string
  number: number
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-20">
      <div className="flex items-baseline gap-3 mb-5">
        <span className="text-3xl font-black text-ink/20 tabular-nums leading-none select-none">
          {String(number).padStart(2, "0")}
        </span>
        <h2 className="text-xl font-black text-ink tracking-tight leading-tight">
          {title}
        </h2>
      </div>
      <div className="space-y-4 text-body leading-relaxed text-[15px]">
        {children}
      </div>
    </section>
  )
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-ink flex-shrink-0 mt-2" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function LegalSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-black text-ink uppercase tracking-wider mt-6 mb-2">
      {children}
    </h3>
  )
}

export function LegalHighlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-canvas-soft border border-hairline-strong rounded-xl px-5 py-4 text-ink text-sm leading-relaxed">
      {children}
    </div>
  )
}
