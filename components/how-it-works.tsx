import Reveal from "@/components/reveal"

const steps = [
  {
    title: "Sube fotos y el precio",
    description:
      "Lo esencial: fotos, precio y una descripción corta. En menos de un minuto, desde tu celular.",
  },
  {
    title: "Obtén tu link único",
    description:
      "Cada propiedad recibe su propia URL, lista para compartir y con preview profesional.",
  },
  {
    title: "Comparte y vende",
    description:
      "Un tap en WhatsApp y la propiedad llega completa al interesado, con tu contacto directo.",
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

        <div className="grid md:grid-cols-3 gap-x-10 gap-y-12">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 100}>
              <div className="border-t-2 border-ink pt-6">
                <span className="block text-6xl font-black text-ink tracking-tighter tabular-nums leading-none mb-5">
                  0{i + 1}
                </span>
                <h3 className="text-xl font-bold text-ink tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="text-body leading-relaxed">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
