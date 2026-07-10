"use client"

import { useEffect, useRef, useState } from "react"
import { Copy, Check, ExternalLink, AlertCircle, Sparkles, Undo2, Loader2, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import FlyerModal from "@/components/flyer-modal"
import {
  SHARE_INFO_IDS,
  SHARE_INFO_LABELS,
  SHARE_MESSAGE_KINDS,
  SHARE_MESSAGE_KIND_LABELS,
  type ShareInfo,
  type ShareMessageKind,
} from "@/lib/share-message-options"
import { incrementShares, generateShareMessage } from "./actions"

type TemplateCtx = {
  title: string
  type: string
  location?: string
  price: string
  bedrooms?: number | null
  bathrooms?: number | null
  area?: number | null
  landArea?: number | null
  parking?: number | null
  gatedCommunity?: boolean
  include: ShareInfo[]
}

// Static templates: only used as fallback when the AI call fails.
function buildBody(templateId: ShareMessageKind, ctx: TemplateCtx): string {
  const has = (info: ShareInfo) => ctx.include.includes(info)
  const featureParts = [
    has("habitaciones") && ctx.bedrooms != null
      ? `${ctx.bedrooms} ${ctx.bedrooms === 1 ? "habitación" : "habitaciones"}`
      : null,
    has("banos") && ctx.bathrooms != null
      ? `${ctx.bathrooms} ${ctx.bathrooms === 1 ? "baño" : "baños"}`
      : null,
    has("area") && ctx.area != null ? `${ctx.area} m²` : null,
    has("terreno") && ctx.landArea != null ? `${ctx.landArea} m² de terreno` : null,
    has("parqueaderos") && ctx.parking != null
      ? `${ctx.parking} ${ctx.parking === 1 ? "parqueadero" : "parqueaderos"}`
      : null,
    has("cerrada") && ctx.gatedCommunity ? "unidad cerrada" : null,
  ].filter((l): l is string => l !== null)

  const detailLines = [
    `*${ctx.title}*`,
    `${ctx.type}${has("ubicacion") && ctx.location ? ` en ${ctx.location}` : ""}`,
    "",
    has("precio")
      ? `${templateId === "price_drop" ? "Nuevo precio" : "Precio"}: *${ctx.price}*`
      : null,
    featureParts.length > 0 ? featureParts.join(" - ") : null,
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

    case "visit":
      return [
        "Hola, me encantaría mostrarte esta propiedad en persona:",
        "",
        ...detailLines,
        "",
        "¿Qué día y hora te quedan bien para una visita? Me ajusto a tu agenda.",
        "",
        "Mientras tanto puedes ver todas las fotos aquí:",
      ].join("\n")

    case "opportunity":
      return [
        "Hola, te comparto una oportunidad que vale la pena mirar:",
        "",
        ...detailLines,
        "",
        "Si te interesa, escríbeme y te cuento todos los detalles.",
        "",
        "Mira todas las fotos aquí:",
      ].join("\n")

    case "investor":
      return [
        "Hola, te comparto una propiedad interesante como inversión:",
        "",
        ...detailLines,
        "",
        "Si quieres, revisamos juntos los números y coordinamos una visita.",
        "",
        "Toda la información completa aquí:",
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
  landArea,
  bedrooms,
  bathrooms,
  parking,
  gatedCommunity,
  description,
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
  landArea?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  parking?: number | null
  gatedCommunity?: boolean
  description?: string | null
}) {
  const [copied, setCopied] = useState(false)
  const [copiedNoContact, setCopiedNoContact] = useState(false)
  const [template, setTemplate] = useState<ShareMessageKind>("intro")

  // Only offer toggles for data the property actually has.
  const infoAvailability: Record<ShareInfo, boolean> = {
    precio: true,
    habitaciones: bedrooms != null,
    banos: bathrooms != null,
    parqueaderos: parking != null,
    area: area != null,
    terreno: landArea != null,
    cerrada: !!gatedCommunity,
    ubicacion: !!location,
    descripcion: !!description,
  }
  const availableInfo = SHARE_INFO_IDS.filter((info) => infoAvailability[info])

  const [include, setInclude] = useState<ShareInfo[]>(availableInfo)

  const ctx = {
    title,
    type,
    location,
    price,
    bedrooms,
    bathrooms,
    area,
    landArea,
    parking,
    gatedCommunity,
    include,
  }

  const [body, setBody] = useState("")
  const [generating, setGenerating] = useState(false)
  const [typing, setTyping] = useState(false)
  const [previousBody, setPreviousBody] = useState<string | null>(null)
  const typingTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (typingTimer.current !== null) window.clearTimeout(typingTimer.current)
    }
  }, [])

  function typeOut(full: string) {
    if (typingTimer.current !== null) window.clearTimeout(typingTimer.current)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setBody(full)
      return
    }
    setTyping(true)
    setBody("")
    let shown = 0
    const step = () => {
      shown = Math.min(full.length, shown + 3)
      setBody(full.slice(0, shown))
      if (shown < full.length) {
        typingTimer.current = window.setTimeout(step, 12)
      } else {
        typingTimer.current = null
        setTyping(false)
      }
    }
    step()
  }

  function toggleInclude(info: ShareInfo) {
    setInclude((prev) =>
      prev.includes(info) ? prev.filter((i) => i !== info) : [...prev, info]
    )
  }

  function handleTemplateChange(kind: ShareMessageKind) {
    setTemplate(kind)
    setPreviousBody(null)
    setBody("")
  }

  async function handleGenerate() {
    if (generating || typing) return
    setGenerating(true)
    const current = body
    try {
      const result = await generateShareMessage({ propertyId, kind: template, include })
      if ("error" in result) {
        // Fallback: the static template appears only when the AI call fails.
        typeOut(buildBody(template, ctx))
        toast.error("No pudimos generar con IA — te dejamos una plantilla base.")
        return
      }
      setPreviousBody(current.trim() ? current : null)
      typeOut(result.message)
    } catch {
      typeOut(buildBody(template, ctx))
      toast.error("No pudimos generar con IA — te dejamos una plantilla base.")
    } finally {
      setGenerating(false)
    }
  }

  function handleUndoGenerate() {
    if (previousBody === null) return
    setBody(previousBody)
    setPreviousBody(null)
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
        <div className="space-y-1.5">
          <span className="text-xs text-mute font-medium">Tipo:</span>
          <div className="flex flex-wrap gap-2">
            {SHARE_MESSAGE_KINDS.map((kind) => (
              <button
                key={kind}
                onClick={() => handleTemplateChange(kind)}
                disabled={generating || typing}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:pointer-events-none ${
                  template === kind
                    ? "bg-ink text-white"
                    : "bg-canvas-soft text-body hover:bg-surface-pressed hover:text-ink"
                }`}
              >
                {SHARE_MESSAGE_KIND_LABELS[kind]}
              </button>
            ))}
          </div>
        </div>

        {/* Info toggles */}
        <div className="space-y-1.5">
          <span className="text-xs text-mute font-medium">Incluir:</span>
          <div className="flex flex-wrap gap-2">
            {availableInfo.map((info) => (
              <button
                key={info}
                onClick={() => toggleInclude(info)}
                disabled={generating || typing}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:pointer-events-none ${
                  include.includes(info)
                    ? "bg-ink text-white"
                    : "bg-canvas-soft text-mute hover:bg-surface-pressed hover:text-ink"
                }`}
              >
                {SHARE_INFO_LABELS[info]}
              </button>
            ))}
          </div>
        </div>

        {/* Editable body */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          readOnly={typing}
          placeholder={generating ? "Generando mensaje…" : "Elige el tipo de mensaje y pulsa Generar con IA."}
          className="w-full bg-canvas-softer border border-hairline rounded-xl px-4 py-3 text-sm text-ink placeholder:text-mute resize-none focus:outline-none focus:ring-1 focus:ring-ink/30 transition-colors leading-relaxed"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating || typing}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full bg-ink text-white hover:bg-elevated transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            {generating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {generating ? "Generando…" : "Generar con IA"}
          </button>
          {previousBody !== null && !generating && !typing && (
            <button
              onClick={handleUndoGenerate}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-body hover:bg-canvas-soft hover:text-ink transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Deshacer
            </button>
          )}
        </div>
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
