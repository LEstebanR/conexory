"use client"

import { useState } from "react"
import { Copy, Check, ExternalLink } from "lucide-react"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"

export default function PortfolioPanel({ url, name }: { url: string; name: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const firstName = name.split(" ")[0]
  const waMessage = `Hola, te comparto mi portafolio de propiedades. Soy ${firstName} y tengo varias opciones disponibles que pueden interesarte:\n\n${url}`
  const waUrl = `https://wa.me/?text=${encodeURIComponent(waMessage)}`

  // Strip the protocol prefix for the display label
  const displayUrl = url.replace(/^https?:\/\//, "")

  return (
    <div className="rounded-2xl bg-white border border-hairline p-5 space-y-3">
      <p className="text-xs font-bold text-mute uppercase tracking-widest">Tu portafolio público</p>

      <div className="flex items-center gap-1.5 bg-canvas-softer border border-hairline rounded-xl px-4 py-2.5">
        <span className="flex-1 text-sm text-body font-mono truncate min-w-0">{displayUrl}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-canvas-soft hover:bg-hairline text-body hover:text-ink transition-colors"
          title="Ver portafolio"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-80 transition-opacity"
          title="Compartir por WhatsApp"
        >
          <WhatsAppIcon className="w-6 h-6" />
        </a>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-canvas-soft hover:bg-hairline text-body hover:text-ink transition-colors"
          title="Copiar enlace"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}
