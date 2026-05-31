import { Camera, Link2, MessageCircle, LayoutGrid, RefreshCw, Smartphone } from "lucide-react"

const features = [
  {
    icon: Camera,
    title: "Formulario ultrarrápido",
    description:
      "Solo fotos, precio y descripción. Sin campos innecesarios. En 60 segundos tienes tu propiedad lista.",
    tag: "< 60 seg",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    border: "border-amber-100",
    tagBg: "bg-amber-50 text-amber-700",
    big: true,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp en 1 tap",
    description:
      "Botón directo integrado. Un tap y tu propiedad llega al interesado con fotos, precio y tu contacto. Sin copiar nada.",
    tag: "Lo más usado",
    iconColor: "text-[#25D366]",
    iconBg: "bg-green-50",
    border: "border-green-100",
    tagBg: "bg-green-50 text-green-700",
    big: true,
  },
  {
    icon: Link2,
    title: "Link único por propiedad",
    description:
      "Cada propiedad tiene su propia URL. Compártela por Instagram, email o donde quieras.",
    tag: "Tu URL propia",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    border: "border-blue-100",
    tagBg: "bg-blue-50 text-blue-700",
    big: false,
  },
  {
    icon: LayoutGrid,
    title: "Tu galería de propiedades",
    description:
      "Todas tus propiedades en una sola página con tu nombre y foto de perfil. Luce profesional.",
    tag: "Incluida",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-50",
    border: "border-violet-100",
    tagBg: "bg-violet-50 text-violet-700",
    big: false,
  },
  {
    icon: RefreshCw,
    title: "Actualización instantánea",
    description:
      "Cambia el precio o las fotos y el link refleja los cambios al instante. Sin re-publicar.",
    tag: "Tiempo real",
    iconColor: "text-brand-500",
    iconBg: "bg-brand-50",
    border: "border-brand-100",
    tagBg: "bg-brand-50 text-brand-700",
    big: false,
  },
  {
    icon: Smartphone,
    title: "100% desde el celular",
    description:
      "Diseñado para trabajar desde donde estás. Sube fotos directo desde la cámara, sin desktop.",
    tag: "Mobile-first",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-50",
    border: "border-rose-100",
    tagBg: "bg-rose-50 text-rose-700",
    big: false,
  },
]

export default function Features() {
  const bigFeatures = features.filter((f) => f.big)
  const smallFeatures = features.filter((f) => !f.big)

  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <p className="text-brand-400 font-bold text-sm uppercase tracking-[0.2em] mb-4">
            Funciones
          </p>
          <h2 className="text-5xl sm:text-6xl font-black text-slate-950 tracking-tighter leading-none">
            Todo lo que necesitas.
            <br />
            <span className="text-slate-400">Nada que no uses.</span>
          </h2>
        </div>

        {/* Big feature cards (top row) */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {bigFeatures.map((feature) => (
            <div
              key={feature.title}
              className={`p-8 rounded-3xl border-2 ${feature.border} bg-white hover:shadow-md transition-all duration-300`}
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.iconBg} mb-6`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} strokeWidth={1.75} />
              </div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-xl font-black text-slate-950 tracking-tight">{feature.title}</h3>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${feature.tagBg}`}>
                  {feature.tag}
                </span>
              </div>
              <p className="text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Small feature cards (bottom row) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {smallFeatures.map((feature) => (
            <div
              key={feature.title}
              className={`p-6 rounded-3xl border ${feature.border} bg-white hover:shadow-md transition-all duration-300`}
            >
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${feature.iconBg} mb-4`}>
                <feature.icon className={`w-5 h-5 ${feature.iconColor}`} strokeWidth={2} />
              </div>
              <h3 className="text-sm font-black text-slate-950 tracking-tight mb-2">{feature.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
