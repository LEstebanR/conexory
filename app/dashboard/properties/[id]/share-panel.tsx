"use client"

import { useState } from "react"
import { Copy, Check, ExternalLink, AlertCircle, ImageIcon } from "lucide-react"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import FlyerModal from "@/components/flyer-modal"
import { incrementShares } from "./actions"

type TemplateId = "intro" | "followup" | "price_drop"

const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: "intro", label: "Presentación" },
  { id: "followup", label: "Seguimiento" },
  { id: "price_drop", label: "Precio reducido" },
]

function buildBody(
  templateId: TemplateId,
  ctx: { title: string; type: string; location?: string; price: string; features: string }
): string {
  const detailLines = [
    `*${ctx.title}*`,
    `${ctx.type}${ctx.location ? ` en ${ctx.location}` : ""}`,
    "",
    `${templateId === "price_drop" ? "Nuevo precio" : "Precio"}: *${ctx.price}*`,
    ctx.features || null,
  ].filter((l): l is string => l !== null)

  switch (templateId) {
    case "intro":
      return [
        "Hola, quiero mostrarte esta propiedad que te podría interesar:",
        "",
        ...detailLines,
        "",
        "Si quieres más detalles o coordinar una visita, escríbeme cuando gustes y con gusto te atenderé.",
        "",
        "También puedes ver todas las fotos e información completa en:",
      ].join("\n")

    case "followup":
      return [
        "Hola, quería saber si tuviste oportunidad de ver la propiedad que te compartí:",
        "",
        ...detailLines,
        "",
        "Te comparto el enlace nuevamente por si necesitas:",
      ].join("\n")

    case "price_drop":
      return [
        "Buenas noticias — bajamos el precio de esta propiedad que te habíamos mostrado:",
        "",
        ...detailLines,
        "",
        "Ver los detalles actualizados en:",
      ].join("\n")
  }
}

export default function SharePanel({
  url,
  urlNoContact,
  propertyId,
  slug,
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
  slug: string
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
  const [template, setTemplate] = useState<TemplateId>("intro")

  const features = [
    bedrooms != null ? `${bedrooms} ${bedrooms === 1 ? "habitación" : "habitaciones"}` : null,
    bathrooms != null ? `${bathrooms} ${bathrooms === 1 ? "baño" : "baños"}` : null,
    area != null ? `${area} m²` : null,
    parking != null ? `${parking} ${parking === 1 ? "parqueadero" : "parqueaderos"}` : null,
  ].filter(Boolean).join(" - ")

  const ctx = { title, type, location, price, features }

  const [body, setBody] = useState(() => buildBody("intro", ctx))

  function handleTemplateChange(id: TemplateId) {
    setTemplate(id)
    setBody(buildBody(id, ctx))
  }

  const waUrl = `https://wa.me/?text=${encodeURIComponent(body + "\n" + url)}`
  const waUrlNoContact = `https://wa.me/?text=${encodeURIComponent(body + "\n" + urlNoContact)}`

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

  function handleWhatsApp() {
    incrementShares(propertyId).catch(() => {})
  }

  return (
    <div className="bg-white rounded-2xl border border-hairline p-6 space-y-5">

      {/* Mensaje */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-ink uppercase tracking-widest">Mensaje</p>

        {/* Template chips */}
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTemplateChange(t.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                template === t.id
                  ? "bg-ink text-white"
                  : "bg-canvas-soft text-body hover:bg-surface-pressed hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Editable body */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="w-full bg-canvas-softer border border-hairline rounded-xl px-4 py-3 text-sm text-ink placeholder:text-mute resize-none focus:outline-none focus:ring-1 focus:ring-ink/30 transition-colors leading-relaxed"
        />
        <p className="text-xs text-mute leading-relaxed -mt-1">
          El enlace de la propiedad se añade automáticamente al final según el botón que uses.
        </p>
      </div>

      <div className="border-t border-hairline" />

      {/* Enlace con tus datos */}
      <div className="space-y-2.5">
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${showContact ? "text-ink" : "text-mute"}`}>
            Enlace con tus datos
          </p>
          <p className="text-xs text-mute leading-relaxed">
            Muestra tu nombre y contacto al cliente.
          </p>
        </div>

        {!showContact && (
          <div className="flex items-start gap-2 bg-canvas-softer border border-hairline rounded-xl px-3.5 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-mute flex-shrink-0 mt-px" />
            <p className="text-xs text-mute leading-relaxed">
              Activa la tarjeta de contacto en esta propiedad para que tus datos aparezcan en este enlace.
            </p>
          </div>
        )}

        <div className={`flex items-center gap-1.5 bg-canvas-softer border border-hairline rounded-xl px-4 py-2.5 ${!showContact ? "opacity-40 pointer-events-none" : ""}`}>
          <span className="flex-1 text-sm text-body font-mono truncate min-w-0">{url}</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-canvas-soft hover:bg-surface-pressed text-ink transition-colors"
            title="Ver"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsApp}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-80 transition-opacity"
            title="Compartir por WhatsApp"
          >
            <WhatsAppIcon className="w-6 h-6" />
          </a>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-canvas-soft hover:bg-surface-pressed text-ink transition-colors"
            title="Copiar enlace"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-ink" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="border-t border-hairline" />

      {/* Sin mis datos */}
      <div className="space-y-2.5">
        <div>
          <p className="text-xs font-bold text-ink uppercase tracking-widest mb-0.5">
            Sin mis datos
          </p>
          <p className="text-xs text-mute leading-relaxed">
            Sin tus datos de contacto. Ideal para portales y redes sociales.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-canvas-softer border border-hairline rounded-xl px-4 py-2.5">
          <span className="flex-1 text-sm text-body font-mono truncate min-w-0">{urlNoContact}</span>
          <a
            href={urlNoContact}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-canvas-soft hover:bg-surface-pressed text-ink transition-colors"
            title="Ver"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={waUrlNoContact}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-80 transition-opacity"
            title="Compartir por WhatsApp"
          >
            <WhatsAppIcon className="w-6 h-6" />
          </a>
          <button
            onClick={handleCopyNoContact}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-canvas-soft hover:bg-surface-pressed text-ink transition-colors"
            title="Copiar enlace"
          >
            {copiedNoContact ? <Check className="w-3.5 h-3.5 text-ink" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="border-t border-hairline" />

      {/* Flyer */}
      <div className="space-y-2.5">
        <div>
          <p className="text-xs font-bold text-ink uppercase tracking-widest mb-0.5">
            Flyer
          </p>
          <p className="text-xs text-mute leading-relaxed">
            Imagen lista para descargar y compartir en WhatsApp o Instagram.
          </p>
        </div>

        <FlyerModal propertyId={propertyId} slug={slug} showContact={showContact}>
          <button className="flex items-center justify-center gap-2 w-full bg-ink text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-elevated transition-colors">
            <ImageIcon className="w-4 h-4" />
            Generar flyer
          </button>
        </FlyerModal>
      </div>

    </div>
  )
}
