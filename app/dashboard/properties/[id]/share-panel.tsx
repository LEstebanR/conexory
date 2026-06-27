"use client"

import { useState } from "react"
import { Copy, Check, MessageCircle, ExternalLink, AlertCircle } from "lucide-react"
import { incrementShares } from "./actions"

export default function SharePanel({
  url,
  urlNoContact,
  propertyId,
  showContact,
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
  urlNoContact: string
  propertyId: string
  showContact: boolean
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
  const [copiedNoContact, setCopiedNoContact] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleCopyNoContact() {
    await navigator.clipboard.writeText(urlNoContact)
    setCopiedNoContact(true)
    setTimeout(() => setCopiedNoContact(false), 2000)
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

  const messageNoContact = [
    "Te comparto esta propiedad que podría interesarte:",
    "",
    `*${title}*`,
    `${type}${location ? ` en ${location}` : ""}`,
    "",
    `Precio: *${price}*`,
    features || null,
    "",
    "Puedes ver todas las fotos e información completa en:",
    urlNoContact,
  ].filter((line) => line !== null).join("\n")

  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
  const waUrlNoContact = `https://wa.me/?text=${encodeURIComponent(messageNoContact)}`

  function handleWhatsApp() {
    incrementShares(propertyId).catch(() => {})
  }

  return (
    <div className="bg-ink rounded-2xl p-6 space-y-5">

      {/* Enlace con tus datos */}
      <div className="space-y-2.5">
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${showContact ? "text-white" : "text-white/40"}`}>
            Enlace con tus datos
          </p>
          <p className="text-xs text-mute leading-relaxed">
            Muestra tu nombre y contacto al cliente.
          </p>
        </div>

        {!showContact && (
          <div className="flex items-start gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-mute flex-shrink-0 mt-px" />
            <p className="text-xs text-mute leading-relaxed">
              Activa la tarjeta de contacto en esta propiedad para que tus datos aparezcan en este enlace.
            </p>
          </div>
        )}

        <div className={`flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 ${!showContact ? "opacity-40 pointer-events-none" : ""}`}>
          <span className="flex-1 text-sm text-white/60 font-mono truncate min-w-0">{url}</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Ver"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsApp}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Compartir por WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Copiar"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#4ade80]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="border-t border-white/10" />

      {/* Enlace de vitrina */}
      <div className="space-y-2.5">
        <div>
          <p className="text-xs font-bold text-white uppercase tracking-widest mb-0.5">
            Sin mis datos
          </p>
          <p className="text-xs text-mute leading-relaxed">
            Sin tus datos de contacto. Ideal para portales y redes sociales.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
          <span className="flex-1 text-sm text-white/60 font-mono truncate min-w-0">{urlNoContact}</span>
          <a
            href={urlNoContact}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Ver"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={waUrlNoContact}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Compartir por WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={handleCopyNoContact}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Copiar"
          >
            {copiedNoContact ? <Check className="w-3.5 h-3.5 text-[#4ade80]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

    </div>
  )
}
