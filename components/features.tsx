import Image from "next/image"
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

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=500&q=70`

const PHOTOS = {
  laureles: img("1600596542815-ffad4c1539a9"),
  poblado: img("1545324418-cc1a3fa10c00"),
  campestre: img("1570129477492-45c003edd2be"),
  loft: img("1502672260266-1c1ef2d93688"),
  penthouse: img("1493809842364-78817add7ffb"),
}

const gallery = [
  { src: PHOTOS.poblado, title: "Apartamento exclusivo", price: "$420.000.000" },
  { src: PHOTOS.campestre, title: "Casa campestre", price: "$750.000.000" },
  { src: PHOTOS.loft, title: "Loft de diseño", price: "$310.000.000" },
  { src: PHOTOS.penthouse, title: "Penthouse con vista", price: "$1.200.000.000" },
]

function FormMock() {
  return (
    <div className="rounded-2xl border border-hairline bg-white shadow-xl shadow-black/5 p-6 space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="relative aspect-square rounded-xl overflow-hidden">
          <Image src={PHOTOS.laureles} alt="Foto de propiedad" fill sizes="120px" className="object-cover" />
        </div>
        <div className="relative aspect-square rounded-xl overflow-hidden">
          <Image src={PHOTOS.poblado} alt="Foto de propiedad" fill sizes="120px" className="object-cover" />
        </div>
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
      <div className="flex flex-col gap-2.5 rounded-2xl border border-hairline-strong px-4 py-3 sm:flex-row sm:items-center sm:gap-2 sm:rounded-full">
        <div className="flex items-center gap-2 min-w-0 sm:flex-1">
          <Link2 className="w-4 h-4 text-body flex-shrink-0" />
          <span className="text-sm text-ink truncate">conexory.com/p/casa-laureles</span>
        </div>
        <span className="flex items-center justify-center gap-1 bg-canvas-soft rounded-full px-3 py-1.5 text-xs font-semibold text-ink flex-shrink-0">
          <Copy className="w-3 h-3" /> Copiar
        </span>
      </div>
      <div className="h-11 rounded-full bg-ink flex items-center justify-center gap-2 text-sm font-semibold text-white">
        <MessageCircle className="w-4 h-4" />
        Compartir link
      </div>
      {/* OG image preview — split layout matching real design */}
      <div className="rounded-xl overflow-hidden border border-hairline flex h-24">
        <div className="relative w-[45%] flex-shrink-0">
          <Image src={PHOTOS.laureles} alt="Preview de la propiedad" fill sizes="160px" className="object-cover" />
        </div>
        <div className="flex-1 bg-black px-3 py-2.5 flex flex-col justify-between">
          <span className="text-[9px] font-black text-white tracking-tight">Conexory</span>
          <div>
            <p className="text-sm font-black text-white leading-none tracking-tight">$580.000.000</p>
            <p className="text-[10px] text-white/60 mt-0.5">Casa · zona residencial</p>
          </div>
          <div className="flex gap-1 flex-wrap">
            {["3 hab.", "2 baños", "120 m²"].map((f) => (
              <span key={f} className="text-[8px] text-white/70 border border-white/20 rounded-full px-1.5 py-0.5">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function GalleryMock() {
  return (
    <div className="rounded-2xl border border-hairline bg-white shadow-xl shadow-black/5 overflow-hidden">
      {/* Agent header */}
      <div className="px-5 py-4 border-b border-hairline flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center text-white text-sm font-black flex-shrink-0">
          CR
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-ink leading-tight tracking-tight">Carolina Restrepo</p>
          <p className="text-xs text-mute">Asesor inmobiliario · Colombia</p>
        </div>
        <div className="ml-auto flex-shrink-0 text-[10px] font-bold text-white bg-ink px-2.5 py-1 rounded-full">
          4 propiedades
        </div>
      </div>
      {/* Property grid */}
      <div className="grid grid-cols-2 gap-px bg-hairline">
        {gallery.map((p) => (
          <div key={p.title} className="bg-white">
            <div className="relative h-24">
              <Image src={p.src} alt={p.title} fill sizes="200px" className="object-cover" />
            </div>
            <div className="px-3 py-2.5">
              <p className="text-[11px] font-black text-ink truncate leading-tight">{p.title}</p>
              <p className="text-[11px] font-bold text-body mt-0.5">{p.price}</p>
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
      "Cada propiedad tiene su URL única. Compártela por cualquier canal y se ve siempre profesional, con foto, precio y detalles en la preview.",
    points: ["Preview enriquecida en cualquier canal", "Link único por propiedad", "Cambios reflejados al instante"],
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
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
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
