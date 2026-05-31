const stats = [
  { value: "< 2 min", label: "Para publicar una propiedad" },
  { value: "3 portales", label: "Publicación simultánea" },
  { value: "60% menos", label: "Que Wasi o Properati" },
  { value: "Mobile-first", label: "Diseñado para el celular" },
]

export default function Stats() {
  return (
    <section className="py-14 bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-brand-400 leading-none mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
