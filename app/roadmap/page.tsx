import type { Metadata } from "next"
import Link from "next/link"
import { Building2, ArrowLeft, Circle, Loader2 } from "lucide-react"

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
    color: "text-ink",
    bg: "bg-canvas-soft",
    border: "border-hairline",
    badge: "bg-ink text-white",
  },
  planned: {
    icon: Circle,
    color: "text-mute",
    bg: "bg-canvas-softer",
    border: "border-hairline",
    badge: "bg-canvas-soft text-body",
  },
}

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-hairline">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
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

      <div className="bg-ink py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-mute font-bold text-xs uppercase tracking-[0.2em] mb-4">
            Roadmap
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Lo que viene en Conexory
          </h1>
          <p className="text-mute text-base leading-relaxed">
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
                    <p className="font-bold text-ink text-sm">{item.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                      {item.label}
                    </span>
                  </div>
                  <p className="text-sm text-body leading-relaxed">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center bg-canvas-softer rounded-2xl border border-hairline p-8">
          <p className="font-black text-ink mb-2">¿Tienes una sugerencia?</p>
          <p className="text-sm text-body mb-4">
            Las funciones de este roadmap vienen de agentes como tú. Cuéntanos qué necesitas.
          </p>
          <a
            href="mailto:hola@conexory.com?subject=Sugerencia para Conexory"
            className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-ink text-white text-sm font-bold hover:bg-elevated transition-colors"
          >
            Enviar sugerencia
          </a>
        </div>
      </main>

      <footer className="border-t border-hairline py-8 text-center">
        <p className="text-xs text-mute">
          © 2026 Conexory · Hecho en Colombia
        </p>
      </footer>
    </div>
  )
}
