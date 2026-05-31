import { Building2, X, Globe, Mail } from "lucide-react"

const socials = [
  { icon: X, label: "X (Twitter)" },
  { icon: Globe, label: "Web" },
  { icon: Mail, label: "Email" },
]

const links = {
  Producto: ["Funciones", "Precios", "Roadmap", "Blog"],
  Legal: ["Términos de uso", "Privacidad", "Cookies", "Contacto"],
}

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-400 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                MiAgente
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              El CRM inmobiliario más simple del mercado colombiano. Construido
              por agentes, para agentes.
            </p>
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © 2026 MiAgente · Hecho con 🇨🇴 en Colombia
          </p>
          <p className="text-xs text-slate-700">
            En proceso de registro · Bogotá D.C.
          </p>
        </div>
      </div>
    </footer>
  )
}
