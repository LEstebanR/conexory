import type { Metadata } from "next"
import { Circle, Loader2, CheckCircle2, ArrowRight } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Reveal from "@/components/reveal"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Roadmap — Conexory",
  description: "Lo que viene en Conexory. Nuestro plan de funcionalidades.",
}

const items = [
  {
    status: "shipped",
    label: "Disponible",
    title: "Compresión de imágenes automática",
    desc: "Las fotos se optimizan al subirlas para que tus links carguen al instante.",
  },
  {
    status: "progress",
    label: "En progreso",
    title: "Plan Pro",
    desc: "Hasta 50 propiedades y hasta 20 fotos por propiedad.",
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
  shipped: { icon: CheckCircle2, iconClass: "text-white", dot: "bg-ink", badge: "bg-ink text-white" },
  progress: { icon: Loader2, iconClass: "text-ink", dot: "bg-canvas-soft", badge: "bg-canvas-soft text-ink" },
  planned: { icon: Circle, iconClass: "text-mute", dot: "bg-canvas-soft", badge: "bg-canvas-soft text-body" },
} as const

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 text-center">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
          <p className="text-body font-semibold text-sm uppercase tracking-[0.2em] mb-5 animate-fade-up">
            Roadmap
          </p>
          <h1
            className="text-4xl sm:text-6xl font-black text-ink tracking-tighter leading-[1.05] animate-fade-up text-balance"
            style={{ animationDelay: "80ms" }}
          >
            Lo que viene
            <br />
            <span className="text-mute">en Conexory.</span>
          </h1>
          <p
            className="text-lg text-body leading-relaxed mt-6 max-w-xl mx-auto animate-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            Construido para agentes colombianos. Cada función nace de feedback real.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-2xl mx-auto w-full px-5 sm:px-6 lg:px-8 pb-12">
        <div className="relative pl-8">
          {/* vertical line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-hairline" />
          <div className="space-y-8">
            {items.map((item, i) => {
              const cfg = statusConfig[item.status as keyof typeof statusConfig]
              const Icon = cfg.icon
              return (
                <Reveal key={item.title} delay={i * 80}>
                  <div className="relative">
                    <span className={`absolute -left-8 top-0.5 w-4 h-4 rounded-full ${cfg.dot} border-2 border-white flex items-center justify-center`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-ink" />
                    </span>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className={`w-4 h-4 ${cfg.iconClass === "text-white" ? "text-ink" : cfg.iconClass}`} strokeWidth={2} />
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${cfg.badge}`}>
                        {item.label}
                      </span>
                    </div>
                    <p className="font-bold text-ink tracking-tight">{item.title}</p>
                    <p className="text-sm text-body leading-relaxed mt-1">{item.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Suggestion CTA */}
      <section className="max-w-2xl mx-auto w-full px-5 sm:px-6 lg:px-8 pb-24">
        <div className="rounded-3xl bg-ink p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            ¿Tienes una sugerencia?
          </h2>
          <p className="text-mute text-sm leading-relaxed mb-6 max-w-md mx-auto">
            Las funciones de este roadmap vienen de agentes como tú. Cuéntanos qué necesitas.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <a href="mailto:hola@conexory.com?subject=Sugerencia para Conexory">
              Enviar sugerencia <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  )
}
