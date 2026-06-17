const stats = [
  { value: "60 seg", label: "Para crear una propiedad" },
  { value: "1 link", label: "Para compartir con el mundo" },
  { value: "0", label: "Portales donde registrarse" },
  { value: "100%", label: "Desde tu celular" },
]

export default function Stats() {
  return (
    <section className="py-14 bg-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:divide-x lg:divide-white/10">
          {stats.map((stat, i) => (
            <div key={stat.label} className={`text-center ${i > 0 ? "lg:pl-8" : ""}`}>
              <p className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-mute font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
