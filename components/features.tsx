import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Users,
  Globe,
  MessageCircle,
  Smartphone,
  DollarSign,
} from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Publicación Multi-Portal",
    description:
      "Un click y tu propiedad aparece en Vivanuncios, Fincaraíz y tu web propia. Sin copiar ni pegar.",
    tag: "Más rápido",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    tagColor: "bg-amber-50 text-amber-700",
  },
  {
    icon: Users,
    title: "Gestión de Leads Kanban",
    description:
      "Organiza tus clientes potenciales: Interesados → Negociación → Cerrado. Nunca pierdas un lead.",
    tag: "Más organizado",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    tagColor: "bg-blue-50 text-blue-700",
  },
  {
    icon: Globe,
    title: "Tu Página Web Propia",
    description:
      "Una web profesional con tu nombre en minutos. Tus propiedades se sincronizan en tiempo real.",
    tag: "Incluida gratis",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-50",
    tagColor: "bg-violet-50 text-violet-700",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Integrado",
    description:
      "Contacta leads directamente por WhatsApp desde la plataforma. Sin saltar entre aplicaciones.",
    tag: "Sin fricción",
    iconColor: "text-green-500",
    iconBg: "bg-green-50",
    tagColor: "bg-green-50 text-green-700",
  },
  {
    icon: Smartphone,
    title: "Mobile-First",
    description:
      "Diseñado para el celular. Sube fotos, edita propiedades y revisa leads desde donde estés.",
    tag: "60% en móvil",
    iconColor: "text-brand-500",
    iconBg: "bg-brand-50",
    tagColor: "bg-brand-50 text-brand-700",
  },
  {
    icon: DollarSign,
    title: "Precios en COP",
    description:
      "Desde $49.900 COP/mes. Sin cobros en dólares. Sin sorpresas en tu factura. Sin cláusulas raras.",
    tag: "Accesible",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-50",
    tagColor: "bg-rose-50 text-rose-700",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge className="mb-4">Funciones</Badge>
          <h2 className="text-4xl sm:text-[42px] font-bold text-slate-900 mb-5 leading-tight tracking-tight">
            Todo lo que necesitas.
            <br />
            <span className="text-brand-400">Nada más.</span>
          </h2>
          <p className="text-lg text-slate-600">
            Construido específicamente para el mercado colombiano. Sin funciones
            que nunca vas a usar.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-7 rounded-2xl border border-slate-100 bg-white hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${feature.iconBg} mb-5`}
              >
                <feature.icon
                  className={`w-5.5 h-5.5 ${feature.iconColor}`}
                  strokeWidth={2}
                />
              </div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {feature.title}
                </h3>
                <span
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${feature.tagColor}`}
                >
                  {feature.tag}
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
