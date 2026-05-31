import { MessageCircle, Link2, MapPin, BedDouble, Bath, Maximize2 } from "lucide-react"

function PropertyCard() {
  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden w-full max-w-[360px]">
      {/* Photo */}
      <div className="relative h-52 bg-gradient-to-br from-brand-200 via-brand-300 to-brand-500 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        {/* Simulated building */}
        <div className="absolute inset-0 flex items-center justify-center opacity-15">
          <div className="grid grid-cols-4 gap-1.5 w-48 mt-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={`bg-white rounded-sm ${i < 4 ? "h-16" : i < 8 ? "h-12" : "h-8"}`} />
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-3 h-3 text-white/70" />
            <span className="text-[11px] text-white/70 font-semibold">Laureles · Medellín</span>
          </div>
          <h3 className="text-lg font-black text-white leading-tight tracking-tight">
            Casa con jardín privado
          </h3>
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-brand-400 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
            En venta
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Price */}
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
            Precio
          </p>
          <p className="text-3xl font-black text-slate-950 tracking-tighter leading-none">
            $580.000.000
          </p>
          <p className="text-sm text-slate-400 font-medium mt-0.5">COP</p>
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 py-4 border-t border-b border-slate-100">
          {[
            { icon: BedDouble, label: "3 hab." },
            { icon: Bath, label: "2 baños" },
            { icon: Maximize2, label: "120 m²" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
              <span className="text-sm text-slate-600 font-semibold">{label}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
          Hermosa casa en Laureles con amplio jardín privado, completamente remodelada.
          Cocina integral, 3 alcobas con closets, 2 baños completos...
        </p>

        {/* CTA buttons */}
        <div className="space-y-2.5 pt-1">
          <div className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] rounded-2xl py-3.5 cursor-pointer hover:bg-[#1fb855] transition-colors">
            <MessageCircle className="w-4.5 h-4.5 text-white" />
            <span className="text-sm font-bold text-white">Contactar por WhatsApp</span>
          </div>
          <div className="w-full flex items-center justify-center gap-2.5 bg-slate-100 rounded-2xl py-3 cursor-pointer hover:bg-slate-200 transition-colors">
            <Link2 className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-600">Copiar link</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PropertyPreview() {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-400/8 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-400/6 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#41b883 1px, transparent 1px), linear-gradient(90deg, #41b883 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div className="space-y-8 order-2 lg:order-1">
            <div>
              <p className="text-brand-400 font-bold text-sm uppercase tracking-[0.2em] mb-5">
                El resultado final
              </p>
              <h2 className="text-5xl sm:text-6xl font-black text-white tracking-tighter leading-none">
                Así ve tu cliente
                <br />
                <span className="text-brand-400">la propiedad.</span>
              </h2>
            </div>

            <p className="text-lg text-slate-400 leading-relaxed">
              Una página limpia y profesional, lista para compartir. Fotos, precio,
              detalles y un botón directo a WhatsApp. Sin ruido. Sin distracciones.
            </p>

            <div className="space-y-5">
              {[
                {
                  emoji: "📸",
                  title: "Galería de fotos",
                  desc: "Hasta 10 fotos en alta calidad",
                },
                {
                  emoji: "💰",
                  title: "Precio y especificaciones",
                  desc: "Habitaciones, baños, área y descripción",
                },
                {
                  emoji: "💬",
                  title: "Contacto directo por WhatsApp",
                  desc: "Sin formularios, sin intermediarios",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                    {item.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{item.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Property card */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <PropertyCard />
          </div>
        </div>
      </div>
    </section>
  )
}
