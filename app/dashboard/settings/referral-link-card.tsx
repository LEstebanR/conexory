"use client"

import { useState } from "react"
import { Copy, Check, Users } from "lucide-react"

export default function ReferralLinkCard({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-hairline p-6">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-ink" strokeWidth={1.75} />
        <h2 className="text-base font-bold text-ink">Refiere y gana</h2>
      </div>
      <p className="text-xs text-mute leading-relaxed mb-4">
        Comparte tu link. Cuando alguien se registre con él y pase a Pro, recibes un descuento.
      </p>

      <div className="flex items-center gap-2 bg-canvas-soft rounded-xl px-3 py-2">
        <span className="text-xs text-body truncate flex-1">
          {url.replace(/^https?:\/\//, "")}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-shrink-0 text-mute hover:text-ink transition-colors"
          aria-label="Copiar link de referido"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-ink" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}
