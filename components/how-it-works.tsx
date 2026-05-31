import { Camera, LinkIcon, Send } from "lucide-react"

const steps = [
  {
    icon: Camera,
    number: "01",
    title: "Sube fotos y el precio",
    description:
      "Solo lo esencial: las fotos, el precio y una descripción. Sin campos innecesarios, sin formularios eternos. En menos de un minuto.",
    detail: "Fotos · Precio · Descripción",
    color: "text-brand-400",
    bg: "bg-brand-50",
    border: "border-brand-200",
  },
  {
    icon: LinkIcon,
    number: "02",
    title: "Obtén tu link único",
    description:
      "Cada propiedad tiene su propia URL lista para compartir. Luce profesional, carga rápido y se ve perfecto en WhatsApp.",
    detail: "miagente.co/p/tu-propiedad",
    color: "text-slate-800",
    bg: "bg-slate-50",
    border: "border-slate-200",
  },
  {
    icon: Send,
    number: "03",
    title: "Comparte y recibe interesados",
    description:
      "Un tap en WhatsApp y la propiedad llega completa al interesado. Fotos, precio, detalles y tu contacto directo.",
    detail: "WhatsApp · Instagram · Email",
    color: "text-[#25D366]",
    bg: "bg-green-50",
    border: "border-green-200",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20">
          <p className="text-brand-400 font-bold text-sm uppercase tracking-[0.2em] mb-4">
            Cómo funciona
          </p>
          <h2 className="text-5xl sm:text-6xl font-black text-slate-950 tracking-tighter leading-none">
            Más simple,
            <br />
            <span className="text-brand-400">imposible.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Desktop arrow connectors */}
          <div className="hidden md:block absolute top-14 left-[34%] right-[34%] z-0">
            <div className="flex items-center justify-between h-px">
              {[0, 1].map((i) => (
                <div key={i} className="flex-1 flex items-center gap-1">
                  <div className="flex-1 h-px bg-slate-200" />
                  <svg width="8" height="8" viewBox="0 0 8 8" className="text-slate-300">
                    <path d="M0 4h6M4 1l3 3-3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`relative p-7 rounded-3xl border-2 ${step.border} bg-white group hover:shadow-lg transition-all duration-300`}
            >
              {/* Step number */}
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center border ${step.border}`}>
                  <step.icon className={`w-6 h-6 ${step.color}`} strokeWidth={2} />
                </div>
                <span className={`text-6xl font-black ${step.color} opacity-20 leading-none tabular-nums`}>
                  {i + 1}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-950 tracking-tight mb-3">
                {step.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                {step.description}
              </p>
              <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${step.color} uppercase tracking-wider`}>
                {step.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Time badge */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full px-6 py-3">
            <span className="text-2xl font-black text-brand-400 tracking-tighter">⚡</span>
            <p className="text-sm font-semibold text-slate-700">
              Tiempo total promedio:{" "}
              <span className="text-brand-500">menos de 60 segundos</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
