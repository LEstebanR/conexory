import Link from "next/link"
import { Building2, MapPinOff } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas-softer flex flex-col">
      <header className="bg-white border-b border-hairline px-4 sm:px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-black text-ink tracking-tight">Conexory</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-canvas-soft flex items-center justify-center mb-6">
          <MapPinOff className="w-9 h-9 text-mute" strokeWidth={1.5} />
        </div>
        <p className="text-xs font-bold text-ink uppercase tracking-widest mb-3">Error 404</p>
        <h1 className="text-2xl font-black text-ink tracking-tight mb-3">
          Página no encontrada
        </h1>
        <p className="text-body text-sm leading-relaxed max-w-xs mb-8">
          La página que buscas no existe o fue movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center bg-ink hover:bg-elevated text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
        >
          Ir al inicio
        </Link>
      </main>

      <footer className="border-t border-hairline bg-white py-5 px-4 text-center">
        <p className="text-xs text-mute">
          <Link href="/" className="text-ink font-semibold hover:underline">
            Conexory
          </Link>
        </p>
      </footer>
    </div>
  )
}
