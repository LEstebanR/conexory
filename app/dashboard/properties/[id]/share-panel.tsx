"use client"

import { useState } from "react"
import { Copy, Check, MessageCircle, ExternalLink } from "lucide-react"
import { incrementShares } from "./actions"

export default function SharePanel({
  url,
  propertyId,
  title,
  type,
  price,
  location,
  area,
  bedrooms,
  bathrooms,
  parking,
}: {
  url: string
  propertyId: string
  title: string
  type: string
  price: string
  location?: string
  area?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  parking?: number | null
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const features = [
    bedrooms != null ? `${bedrooms} ${bedrooms === 1 ? "habitación" : "habitaciones"}` : null,
    bathrooms != null ? `${bathrooms} ${bathrooms === 1 ? "baño" : "baños"}` : null,
    area != null ? `${area} m²` : null,
    parking != null ? `${parking} ${parking === 1 ? "parqueadero" : "parqueaderos"}` : null,
  ].filter(Boolean).join(" - ")

  // No 👋 emoji: it renders as a broken box on WhatsApp Web. Warmth comes from
  // the tone and *bold*, which work everywhere.
  const message = [
    "Hola, quiero mostrarte esta propiedad que te podría interesar:",
    "",
    `*${title}*`,
    `${type}${location ? ` en ${location}` : ""}`,
    "",
    `Precio: *${price}*`,
    features || null,
    "",
    "Si quieres más detalles o coordinar una visita, escríbeme cuando gustes y con gusto te atenderé.",
    "",
    "También puedes ver todas las fotos e información completa en:",
    url,
  ].filter((line) => line !== null).join("\n")

  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`

  function handleWhatsApp() {
    incrementShares(propertyId).catch(() => {})
  }

  return (
    <div className="bg-ink rounded-2xl p-6 space-y-4">
      <div>
        <p className="text-xs font-bold text-white uppercase tracking-widest mb-1.5">
          Link público
        </p>
        <p className="text-sm text-mute leading-relaxed">
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
              <Check className="w-3.5 h-3.5 text-ink" />
              <span className="text-ink">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copiar
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bc5a] text-white text-sm font-bold transition-colors"
        >
          <MessageCircle className="w-4 h-4 flex-shrink-0" />
          Compartir por WhatsApp
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors"
        >
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
          Ver
        </a>
      </div>
    </div>
  )
}
