import Link from "next/link"
import { Building2, ArrowLeft } from "lucide-react"

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
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-400 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-black text-slate-950 tracking-tight">
              MiAgente
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-slate-950 py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-400 font-bold text-xs uppercase tracking-[0.2em] mb-4">
            Legal
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none mb-4">
            {title}
          </h1>
          <p className="text-slate-400 text-base max-w-xl leading-relaxed mb-6">
            {description}
          </p>
          <div className="inline-flex items-center gap-2 bg-white/6 border border-white/10 rounded-full px-4 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
            <span className="text-xs text-slate-400">
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
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">
                Contenido
              </p>
              <nav className="space-y-0.5">
                {sections.map((section, i) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-start gap-2.5 py-1.5 px-2 rounded-lg text-sm text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-all duration-150 group"
                  >
                    <span className="text-[10px] text-slate-300 group-hover:text-brand-400 font-black mt-0.5 tabular-nums w-5 flex-shrink-0">
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
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            © 2026 MiAgente · Hecho en Colombia 🇨🇴
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
            >
              Términos de uso
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="/login"
              className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
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
        <span className="text-3xl font-black text-brand-400/20 tabular-nums leading-none select-none">
          {String(number).padStart(2, "0")}
        </span>
        <h2 className="text-xl font-black text-slate-950 tracking-tight leading-tight">
          {title}
        </h2>
      </div>
      <div className="space-y-4 text-slate-600 leading-relaxed text-[15px]">
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
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 mt-2" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function LegalSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mt-6 mb-2">
      {children}
    </h3>
  )
}

export function LegalHighlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-50 border border-brand-200 rounded-xl px-5 py-4 text-brand-800 text-sm leading-relaxed">
      {children}
    </div>
  )
}
