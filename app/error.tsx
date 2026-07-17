"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SUPPORT_EMAIL } from "@/lib/urls"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-5 py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-canvas-soft flex items-center justify-center mb-6">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-mute" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h1 className="text-2xl font-black text-ink tracking-tight mb-2">
        Algo salió mal
      </h1>
      <p className="text-body text-sm max-w-xs leading-relaxed mb-8">
        Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button onClick={reset} variant="default">
          <RefreshCw className="w-4 h-4 mr-2" />
          Intentar de nuevo
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al dashboard
          </Link>
        </Button>
      </div>
      {error.digest && (
        <p className="text-[11px] text-mute mt-6 font-mono">
          Código: {error.digest}
        </p>
      )}
      <p className="text-xs text-mute mt-6">
        Si el problema persiste, escríbenos a{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-ink font-semibold hover:opacity-70 transition-opacity">
          {SUPPORT_EMAIL}
        </a>
      </p>
    </main>
  )
}
