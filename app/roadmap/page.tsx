import type { Metadata } from "next"
import Link from "next/link"
import { Building2, ArrowLeft, Circle, Loader2 } from "lucide-react"
import { BRAND_EMAILS } from "@/lib/brand"

export const metadata: Metadata = {
  title: "Roadmap — Conexory",
  description: "Lo que viene en Conexory. Nuestro plan de funcionalidades.",
}

const items = [
  {
    status: "progress",
    label: "En progreso",
    title: "Plan Pro",
    desc: "Hasta 50 propiedades, hasta 20 fotos por propiedad y soporte prioritario.",
  },
  {
    status: "planned",
    label: "Planeado",
    title: "Botón de contacto por WhatsApp",
    desc: "Los interesados podrán contactarte directamente desde la ficha de la propiedad.",
  },
  {
    status: "planned",
    label: "Planeado",
    title: "Galería pública del agente",
    desc: "Una página con todas tus propiedades activas para compartir con nuevos clientes.",
  },
]

const statusConfig = {
  progress: {
    icon: Loader2,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
    badge: "bg-blue-100 text-blue-700",
  },
  planned: {
    icon: Circle,
    color: "text-slate-400",
    bg: "bg-slate-50",
    border: "border-slate-100",
    badge: "bg-slate-100 text-slate-500",
  },
}

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-400 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-black text-slate-950 tracking-tight">
              Conexory
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

      <div className="bg-slate-950 py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-brand-400 font-bold text-xs uppercase tracking-[0.2em] mb-4">
            Roadmap
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Lo que viene en Conexory
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Construido para agentes colombianos. Cada función nace de feedback real.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4">
          {items.map((item) => {
            const cfg = statusConfig[item.status as keyof typeof statusConfig]
            const Icon = cfg.icon
            return (
              <div
                key={item.title}
                className={`flex gap-4 p-5 rounded-2xl border ${cfg.bg} ${cfg.border}`}
              >
                <Icon className={`w-5 h-5 ${cfg.color} flex-shrink-0 mt-0.5`} strokeWidth={2} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-950 text-sm">{item.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                      {item.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center bg-slate-50 rounded-2xl border border-slate-100 p-8">
          <p className="font-black text-slate-950 mb-2">¿Tienes una sugerencia?</p>
          <p className="text-sm text-slate-500 mb-4">
            Las funciones de este roadmap vienen de agentes como tú. Cuéntanos qué necesitas.
          </p>
          <a
            href={`mailto:${BRAND_EMAILS.hola}?subject=Sugerencia para Conexory`}
            className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            Enviar sugerencia
          </a>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-8 text-center">
        <p className="text-xs text-slate-400">
          © 2026 Conexory · Hecho con 🇨🇴 en Colombia
        </p>
      </footer>
    </div>
  )
}
