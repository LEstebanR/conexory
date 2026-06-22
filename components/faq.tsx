import Reveal from "@/components/reveal"

const faqs = [
  {
    q: "¿Mis clientes necesitan registrarse para ver la propiedad?",
    a: "No. El link que compartes es completamente público. Tu cliente abre el link en el navegador y ve la ficha al instante, sin crear cuenta ni descargar nada.",
  },
  {
    q: "¿Funciona desde el celular?",
    a: "Sí, 100%. Conexory está diseñado para usarse desde el celular: subís las fotos, escribís el precio y obtenés el link para compartir por WhatsApp, todo sin necesidad de un computador.",
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí. El plan Pro no tiene permanencia. Cancelás en cualquier momento desde tu perfil y no se te cobra el siguiente mes. El plan gratuito es para siempre sin ningún costo.",
  },
  {
    q: "¿Cómo se ve la propiedad cuando la comparto por WhatsApp?",
    a: "WhatsApp muestra automáticamente una preview con la foto principal de la propiedad, el precio y el título. Tu cliente ve la información antes de abrir el link, lo que genera más clics e interés.",
  },
  {
    q: "¿Puedo usar Conexory si tengo muchas propiedades?",
    a: "El plan gratuito incluye hasta 3 propiedades activas, ideal para empezar. Si manejas más propiedades, el plan Pro soporta hasta 50 por $99.999 COP al mes. Para agencias o equipos grandes, contáctanos para un plan personalizado.",
  },
]

export default function FAQ() {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal className="mb-16">
          <p className="text-body font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            Preguntas frecuentes
          </p>
          <h2 className="text-4xl sm:text-5xl font-black text-ink tracking-tighter leading-none">
            Resolvemos tus dudas.
            <br />
            <span className="text-mute">Antes de que las tengas.</span>
          </h2>
        </Reveal>

        <div className="divide-y divide-hairline">
          {faqs.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 40}>
              <details className="group py-6">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <span className="text-base sm:text-lg font-bold text-ink leading-snug">
                    {faq.q}
                  </span>
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-hairline-strong flex items-center justify-center text-ink transition-transform group-open:rotate-45">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-body leading-relaxed pr-10">
                  {faq.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
