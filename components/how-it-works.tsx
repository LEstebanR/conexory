import { Badge } from "@/components/ui/badge"
import { UserPlus, Upload, Rocket } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Crea tu cuenta en 2 minutos",
    description:
      "Regístrate con email, completa tu perfil con nombre, WhatsApp y ciudad principal. Sin verificaciones largas.",
    detail: "Email + WhatsApp + Ciudad",
  },
  {
    icon: Upload,
    number: "02",
    title: "Sube tu primera propiedad",
    description:
      "Fotos, precio, descripción y tipo en una sola pantalla. Nuestro asistente te guía en cada paso.",
    detail: "Fotos, precio, descripción",
  },
  {
    icon: Rocket,
    number: "03",
    title: "Publica en todos los portales",
    description:
      "Un click y tu propiedad aparece en Vivanuncios, Fincaraíz y tu web propia. Empieza a recibir leads hoy.",
    detail: "Vivanuncios · Fincaraíz · Tu web",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge className="mb-4">Cómo funciona</Badge>
          <h2 className="text-4xl sm:text-[42px] font-bold text-slate-900 mb-5 leading-tight tracking-tight">
            De cero a publicado
            <br />
            <span className="text-brand-400">en 3 pasos</span>
          </h2>
          <p className="text-lg text-slate-600">
            Sin tutoriales de 30 minutos. Sin soporte técnico. Solo entra y
            empieza a vender.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-[52px] left-[calc(16.7%+2px)] right-[calc(16.7%+2px)] h-px">
            <div className="h-full bg-gradient-to-r from-brand-200 via-brand-300 to-brand-200 opacity-60" />
          </div>

          {steps.map((step, i) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              {/* Icon circle */}
              <div className="relative mb-7 z-10">
                <div className="w-[104px] h-[104px] rounded-2xl bg-white border-2 border-brand-100 flex items-center justify-center shadow-md">
                  <step.icon
                    className="w-10 h-10 text-brand-400"
                    strokeWidth={1.5}
                  />
                </div>
                {/* Step number badge */}
                <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-brand-400 text-white flex items-center justify-center text-xs font-bold shadow-md">
                  {i + 1}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">
                  Paso {step.number}
                </p>
                <h3 className="text-xl font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[260px] mx-auto">
                  {step.description}
                </p>
                <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-600 font-medium shadow-sm">
                  {step.detail}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA below */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm">
            Tiempo promedio de onboarding:{" "}
            <span className="font-bold text-brand-500">menos de 2 minutos</span>
          </p>
        </div>
      </div>
    </section>
  )
}
