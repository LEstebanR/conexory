"use client"

import { useState } from "react"
import { Copy, Check, MessageCircle, ExternalLink } from "lucide-react"
import { incrementShares } from "./actions"

export default function SharePanel({
  url,
  title,
  propertyId,
}: {
  url: string
  title: string
  propertyId: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleWhatsApp() {
    incrementShares(propertyId).catch(() => {})
  }

  const waText = encodeURIComponent(`¡Mira esta propiedad! 🏠\n\n${title}\n\n${url}`)
  const waUrl = `https://wa.me/?text=${waText}`

  return (
    <div className="bg-slate-950 rounded-2xl p-6 space-y-4">
      <div>
        <p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-1.5">
          Link público
        </p>
        <p className="text-sm text-slate-400 leading-relaxed">
          Comparte este link con tus clientes. Funciona en cualquier dispositivo, sin que necesiten crear cuenta.
        </p>
      </div>

      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
        <span className="flex-1 text-sm text-white font-mono truncate min-w-0">{url}</span>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all bg-white/10 hover:bg-white/20 text-white"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-brand-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copiar
            </>
          )}
        </button>
      </div>

      <div className="flex gap-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-[#25D366] hover:bg-[#20bc5a] text-white text-sm font-bold transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Compartir por WhatsApp
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Ver
        </a>
      </div>
    </div>
  )
}
