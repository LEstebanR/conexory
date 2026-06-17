import {
  Camera,
  Link2,
  LayoutGrid,
  Check,
  ImagePlus,
  MessageCircle,
  Copy,
} from "lucide-react"
import Reveal from "@/components/reveal"

function FormMock() {
  return (
    <div className="rounded-2xl border border-hairline bg-white shadow-xl shadow-black/5 p-6 space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="aspect-square rounded-xl bg-gradient-to-br from-brand-100 to-brand-300" />
        <div className="aspect-square rounded-xl bg-gradient-to-br from-brand-200 to-brand-400" />
        <div className="aspect-square rounded-xl border-2 border-dashed border-hairline-strong flex items-center justify-center">
          <ImagePlus className="w-5 h-5 text-mute" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-2.5 w-16 rounded-full bg-canvas-soft" />
        <div className="h-11 rounded-lg border border-hairline-strong flex items-center px-3 text-sm font-bold text-ink">
          $580.000.000
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-2.5 w-20 rounded-full bg-canvas-soft" />
        <div className="h-16 rounded-lg border border-hairline-strong p-3 space-y-1.5">
          <div className="h-2 w-full rounded-full bg-canvas-soft" />
          <div className="h-2 w-4/5 rounded-full bg-canvas-soft" />
        </div>
      </div>
      <div className="h-11 rounded-full bg-ink flex items-center justify-center text-sm font-semibold text-white">
        Publicar propiedad
      </div>
    </div>
  )
}

function ShareMock() {
  return (
    <div className="rounded-2xl border border-hairline bg-white shadow-xl shadow-black/5 p-6 space-y-4">
      <div className="flex items-center gap-2 rounded-full border border-hairline-strong px-4 py-3">
        <Link2 className="w-4 h-4 text-body flex-shrink-0" />
        <span className="text-sm text-ink truncate flex-1">conexory.com/p/casa-laureles</span>
        <span className="flex items-center gap-1 bg-canvas-soft rounded-full px-2.5 py-1 text-xs font-semibold text-ink flex-shrink-0">
          <Copy className="w-3 h-3" /> Copiar
        </span>
      </div>
      <div className="h-11 rounded-full bg-ink flex items-center justify-center gap-2 text-sm font-semibold text-white">
        <MessageCircle className="w-4 h-4" />
        Enviar por WhatsApp
      </div>
      <div className="rounded-xl bg-canvas-softer p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-200 to-brand-400 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink truncate">Casa con jardín privado</p>
          <p className="text-xs text-body truncate">$580.000.000 · Laureles, Medellín</p>
          <p className="text-[10px] text-mute mt-0.5">conexory.com</p>
        </div>
      </div>
    </div>
  )
}

function GalleryMock() {
  return (
    <div className="rounded-2xl border border-hairline bg-white shadow-xl shadow-black/5 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center text-white text-sm font-bold">
          CR
        </div>
        <div>
          <div className="h-2.5 w-24 rounded-full bg-ink/80 mb-1.5" />
          <div className="h-2 w-16 rounded-full bg-canvas-soft" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-hairline overflow-hidden">
            <div className={`h-16 bg-gradient-to-br ${i % 2 ? "from-brand-200 to-brand-400" : "from-brand-100 to-brand-300"}`} />
            <div className="p-2 space-y-1.5">
              <div className="h-2 w-3/4 rounded-full bg-canvas-soft" />
              <div className="h-2 w-1/2 rounded-full bg-canvas-softer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const blocks = [
  {
    eyebrow: "Crea en 60 segundos",
    icon: Camera,
    title: "Un formulario, nada más.",
    description:
      "Solo fotos, precio y una breve descripción. Sin campos innecesarios ni formularios eternos. Sube las fotos directo desde la cámara de tu celular y publica al instante.",
    points: ["Sin campos innecesarios", "Funciona 100% desde el celular", "Edita y actualiza cuando quieras"],
    mock: <FormMock />,
  },
  {
    eyebrow: "Comparte donde sea",
    icon: Link2,
    title: "Un link, una preview perfecta.",
    description:
      "Cada propiedad tiene su URL única. Compártela por WhatsApp, Instagram o email y se ve siempre profesional, con foto, precio y detalles en la preview.",
    points: ["Preview enriquecida en WhatsApp", "Link único por propiedad", "Cambios reflejados al instante"],
    mock: <ShareMock />,
  },
  {
    eyebrow: "Luce profesional",
    icon: LayoutGrid,
    title: "Tu portafolio en una página.",
    description:
      "Todas tus propiedades activas en un solo lugar, con tu nombre y tu foto. Una galería que comparte tu marca personal y genera confianza con cada cliente.",
    points: ["Tu marca personal", "Todas tus propiedades activas", "Una sola URL para compartir"],
    mock: <GalleryMock />,
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal className="max-w-2xl mb-20">
          <p className="text-body font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            Funciones
          </p>
          <h2 className="text-4xl sm:text-5xl font-black text-ink tracking-tighter leading-none">
            Todo lo que necesitas.
            <br />
            <span className="text-mute">Nada que no uses.</span>
          </h2>
        </Reveal>

        <div className="space-y-24">
          {blocks.map((block, i) => {
            const reversed = i % 2 === 1
            return (
              <Reveal key={block.title}>
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                  {/* Copy */}
                  <div className={reversed ? "lg:order-2" : ""}>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-ink mb-6">
                      <block.icon className="w-6 h-6 text-white" strokeWidth={1.75} />
                    </div>
                    <p className="text-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">
                      {block.eyebrow}
                    </p>
                    <h3 className="text-3xl sm:text-4xl font-black text-ink tracking-tight leading-tight mb-4">
                      {block.title}
                    </h3>
                    <p className="text-body leading-relaxed mb-6 max-w-md">
                      {block.description}
                    </p>
                    <ul className="space-y-3">
                      {block.points.map((point) => (
                        <li key={point} className="flex items-center gap-3 text-sm font-medium text-ink">
                          <span className="w-5 h-5 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mock */}
                  <div className={reversed ? "lg:order-1" : ""}>{block.mock}</div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
