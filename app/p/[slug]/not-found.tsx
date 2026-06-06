import Link from "next/link"
import { Building2, Home } from "lucide-react"

export default function PropertyNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 px-4 sm:px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-7 h-7 rounded-lg bg-brand-400 flex items-center justify-center shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-black text-slate-950 tracking-tight">MiAgente</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
          <Home className="w-9 h-9 text-slate-400" strokeWidth={1.5} />
        </div>
        <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-3">Error 404</p>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight mb-3">
          Propiedad no encontrada
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-8">
          Esta propiedad no existe o el enlace ya no está disponible. Es posible que el agente lo haya eliminado.
        </p>
        <Link
          href="/"
          className="inline-flex items-center bg-brand-400 hover:bg-brand-500 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
        >
          Publicar mi propiedad
        </Link>
      </main>

      <footer className="border-t border-slate-100 bg-white py-5 px-4 text-center">
        <p className="text-xs text-slate-400">
          Publicado con{" "}
          <Link href="/" className="text-brand-500 font-semibold hover:underline">
            MiAgente
          </Link>
        </p>
      </footer>
    </div>
  )
}
