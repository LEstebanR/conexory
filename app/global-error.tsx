"use client"

import { useEffect } from "react"
import { SUPPORT_EMAIL } from "@/lib/urls"
import { captureBoundaryError } from "@/lib/posthog-client"
import type { ErrorBoundaryProps } from "@/components/error-fallback"
import "./globals.css"

// Replaces the root layout when it fails, so it brings its own html and body.
// Kept free of shared UI on purpose: Next ships this boundary with every page.
export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error(error)
    captureBoundaryError(error, "global")
  }, [error])

  return (
    <html lang="es">
      <body className="min-h-screen bg-canvas flex flex-col items-center justify-center px-5 py-12 text-center antialiased">
        <title>Algo salió mal — Conexory</title>
        <h1 className="text-2xl font-black text-ink tracking-tight mb-2">Algo salió mal</h1>
        <p className="text-body text-sm max-w-xs leading-relaxed mb-8">
          Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
        </p>
        <button
          type="button"
          onClick={reset}
          className="h-11 px-6 rounded-full bg-ink text-white text-sm font-semibold hover:bg-elevated transition-colors"
        >
          Intentar de nuevo
        </button>
        {error.digest && <p className="text-[11px] text-mute mt-6 font-mono">Código: {error.digest}</p>}
        <p className="text-xs text-mute mt-6">
          Si el problema persiste, escríbenos a{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-ink font-semibold hover:opacity-70 transition-opacity">
            {SUPPORT_EMAIL}
          </a>
        </p>
      </body>
    </html>
  )
}
