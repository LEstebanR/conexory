import Image from "next/image"
import { ImagePlus, Link2, Copy, MessageCircle } from "lucide-react"
import Reveal from "@/components/reveal"

const PHOTO_A = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=70"
const PHOTO_B = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=70"

function UploadVisual() {
  return (
    <div className="rounded-2xl bg-white border border-hairline p-4 space-y-3 shadow-sm">
      <div className="grid grid-cols-3 gap-1.5">
        <div className="relative aspect-square rounded-xl overflow-hidden">
          <Image src={PHOTO_A} alt="" fill sizes="96px" className="object-cover" />
        </div>
        <div className="relative aspect-square rounded-xl overflow-hidden">
          <Image src={PHOTO_B} alt="" fill sizes="96px" className="object-cover" />
        </div>
        <div className="aspect-square rounded-xl border-2 border-dashed border-hairline-strong flex items-center justify-center">
          <ImagePlus className="w-5 h-5 text-mute" />
        </div>
      </div>
      <div className="h-10 rounded-lg border border-hairline-strong flex items-center px-3 text-sm font-black text-ink">
        $580.000.000
      </div>
      <div className="h-10 rounded-full bg-ink flex items-center justify-center text-xs font-semibold text-white">
        Publicar propiedad
      </div>
    </div>
  )
}

function LinkVisual() {
  return (
    <div className="rounded-2xl bg-white border border-hairline p-4 space-y-3 shadow-sm">
      <div className="flex items-center gap-2 rounded-full border border-hairline-strong px-3 py-2.5">
        <Link2 className="w-3.5 h-3.5 text-mute flex-shrink-0" />
        <span className="text-xs text-ink flex-1 truncate font-medium">conexory.com/p/casa-laureles</span>
        <span className="flex items-center gap-1 text-[10px] font-semibold bg-canvas-soft px-2.5 py-1 rounded-full flex-shrink-0">
          <Copy className="w-2.5 h-2.5" /> Copiar
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-10 rounded-full bg-ink flex items-center justify-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-semibold text-white">WhatsApp</span>
        </div>
        <div className="h-10 rounded-full border border-hairline-strong flex items-center justify-center">
          <span className="text-xs font-semibold text-ink">Correo</span>
        </div>
      </div>
      <div className="rounded-xl bg-canvas-softer px-3 py-2 text-center">
        <p className="text-[10px] text-mute font-medium">También funciona en Instagram, Telegram y más</p>
      </div>
    </div>
  )
}

function PreviewVisual() {
  return (
    <div className="rounded-2xl overflow-hidden border border-hairline shadow-sm">
      <div className="flex h-[104px]">
        <div className="relative w-[48%] flex-shrink-0">
          <Image src={PHOTO_A} alt="" fill sizes="180px" className="object-cover" />
        </div>
        <div className="flex-1 bg-black px-3 py-2.5 flex flex-col justify-between">
          <span className="text-[9px] font-black text-white tracking-tight">Conexory</span>
          <div>
            <p className="text-sm font-black text-white leading-none tracking-tight">$580M</p>
            <p className="text-[9px] text-white/60 mt-0.5">Casa · zona residencial</p>
          </div>
          <div className="flex gap-1 flex-wrap">
            {["3 hab.", "2 baños", "120 m²"].map((f) => (
              <span key={f} className="text-[7px] text-white/70 border border-white/20 rounded-full px-1.5 py-0.5">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white px-3 py-2.5 border-t border-hairline">
        <p className="text-[11px] font-bold text-ink leading-tight">Casa con jardín privado</p>
        <p className="text-[9px] text-mute mt-0.5">conexory.com</p>
      </div>
    </div>
  )
}

const steps = [
  {
    number: "01",
    title: "Sube fotos y el precio",
    description: "Lo esencial: fotos, precio y una descripción corta. En menos de un minuto, desde tu celular.",
    visual: <UploadVisual />,
  },
  {
    number: "02",
    title: "Obtén tu link único",
    description: "Cada propiedad recibe su propia URL, lista para compartir con una preview profesional en cualquier canal.",
    visual: <LinkVisual />,
  },
  {
    number: "03",
    title: "Comparte y vende",
    description: "Envía el link por donde quieras, con un mensaje de WhatsApp generado por IA si lo necesitas. La propiedad llega completa al interesado, con tu contacto directo.",
    visual: <PreviewVisual />,
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-canvas-softer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl mb-16">
          <p className="text-body font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            Cómo funciona
          </p>
          <h2 className="text-4xl sm:text-5xl font-black text-ink tracking-tighter leading-none">
            Tres pasos.
            <br />
            <span className="text-mute">Menos de 60 segundos.</span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 100}>
              <div className="bg-white rounded-3xl p-6 border border-hairline flex flex-col gap-5 h-full">
                {/* Visual */}
                <div>{step.visual}</div>
                {/* Step info */}
                <div className="border-t border-hairline pt-5">
                  <span className="block text-5xl font-black text-ink tracking-tighter tabular-nums leading-none mb-4 opacity-15">
                    {step.number}
                  </span>
                  <h3 className="text-lg font-black text-ink tracking-tight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-body leading-relaxed">{step.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
