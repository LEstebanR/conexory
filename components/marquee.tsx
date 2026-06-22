const cities = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Bucaramanga",
  "Pereira",
  "Santa Marta",
  "Manizales",
  "Cúcuta",
]

export default function Marquee() {
  const items = [...cities, ...cities]

  return (
    <section className="py-12 bg-white border-y border-hairline">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-mute mb-8">
        Agentes que ya comparten desde
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee gap-12 pr-12">
          {items.map((city, i) => (
            <span
              key={`${city}-${i}`}
              className="text-2xl sm:text-3xl font-black tracking-tighter text-brand-300 whitespace-nowrap"
            >
              {city}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
