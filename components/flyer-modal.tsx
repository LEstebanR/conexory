"use client"

import { useState, type ReactNode } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Download, Loader2, X, AlertCircle, ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ColorInput } from "@/components/ui/color-input"
import {
  DEFAULT_FLYER_OPTIONS,
  FLYER_HIGHLIGHT_MAX_LENGTH,
  FLYER_INFO_IDS,
  FLYER_INFO_LABELS,
  FLYER_TEMPLATE_IDS,
  FLYER_TEMPLATE_LABELS,
  type FlyerInfo,
  type FlyerTemplate,
} from "@/lib/flyer-options"

export default function FlyerModal({
  propertyId,
  slug,
  showContact,
  agentBrandColor,
  children,
}: {
  propertyId: string
  slug: string
  showContact: boolean
  agentBrandColor: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"options" | "preview">("options")
  const [template, setTemplate] = useState<FlyerTemplate>(DEFAULT_FLYER_OPTIONS.template)
  const [highlight, setHighlight] = useState("")
  const [include, setInclude] = useState<FlyerInfo[]>(() =>
    showContact ? DEFAULT_FLYER_OPTIONS.include : DEFAULT_FLYER_OPTIONS.include.filter((i) => i !== "contacto")
  )
  const [accentColor, setAccentColor] = useState(agentBrandColor)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  function toggleInclude(info: FlyerInfo) {
    if (info === "contacto" && !showContact) return
    setInclude((prev) =>
      prev.includes(info) ? prev.filter((i) => i !== info) : [...prev, info]
    )
  }

  async function generate() {
    setStep("preview")
    setLoading(true)
    setError(false)
    try {
      const params = new URLSearchParams({ template, include: include.join(","), accentColor })
      if (highlight.trim()) params.set("highlight", highlight.trim().slice(0, FLYER_HIGHLIGHT_MAX_LENGTH))
      const res = await fetch(`/api/properties/${propertyId}/flyer.jpg?${params}`)
      if (!res.ok) throw new Error("flyer request failed")
      const blob = await res.blob()
      setImageUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(blob)
      })
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) setStep("options")
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl shadow-black/10 p-6 sm:p-7 animate-fade-up">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Dialog.Title className="text-lg font-black text-ink tracking-tight">
                Flyer de la propiedad
              </Dialog.Title>
              <Dialog.Description className="text-sm text-body mt-0.5">
                {step === "options"
                  ? "Elige cómo quieres tu flyer."
                  : "Listo para compartir en WhatsApp o Instagram."}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                className="p-2 -mr-2 -mt-1 rounded-xl text-mute hover:bg-canvas-soft hover:text-ink transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {step === "options" ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-bold text-ink uppercase tracking-widest">Plantilla</p>
                <div className="flex flex-wrap gap-2">
                  {FLYER_TEMPLATE_IDS.map((id) => (
                    <button
                      key={id}
                      onClick={() => setTemplate(id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                        template === id
                          ? "bg-ink text-white"
                          : "bg-canvas-soft text-body hover:bg-surface-pressed hover:text-ink"
                      }`}
                    >
                      {FLYER_TEMPLATE_LABELS[id]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-ink uppercase tracking-widest">
                  Información a incluir
                </p>
                <div className="flex flex-wrap gap-2">
                  {FLYER_INFO_IDS.map((id) => {
                    const disabled = id === "contacto" && !showContact
                    return (
                      <button
                        key={id}
                        onClick={() => toggleInclude(id)}
                        disabled={disabled}
                        title={disabled ? "Activa la tarjeta de contacto en esta propiedad para incluir tus datos" : undefined}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                          disabled
                            ? "bg-canvas-soft text-mute opacity-50 cursor-not-allowed"
                            : include.includes(id)
                              ? "bg-ink text-white"
                              : "bg-canvas-soft text-body hover:bg-surface-pressed hover:text-ink"
                        }`}
                      >
                        {FLYER_INFO_LABELS[id]}
                      </button>
                    )
                  })}
                </div>
                {!showContact && (
                  <div className="flex items-start gap-2 bg-canvas-softer border border-hairline rounded-xl px-3.5 py-2.5">
                    <AlertCircle className="w-3.5 h-3.5 text-mute flex-shrink-0 mt-px" />
                    <p className="text-xs text-mute leading-relaxed">
                      Tus datos de contacto están ocultos en esta propiedad, así que no se incluirán en el flyer.
                      Actívalos en &quot;Enlace con tus datos&quot; para poder agregarlos.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-ink uppercase tracking-widest">Color de marca</p>
                <ColorInput value={accentColor} onChange={setAccentColor} />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-ink uppercase tracking-widest">
                  ¿Qué quieres destacar?{" "}
                  <span className="text-mute font-medium normal-case tracking-normal">(opcional)</span>
                </p>
                <input
                  type="text"
                  value={highlight}
                  onChange={(e) => setHighlight(e.target.value)}
                  maxLength={FLYER_HIGHLIGHT_MAX_LENGTH}
                  placeholder="Ej: recién remodelado, vista a la ciudad, piscina…"
                  className="w-full bg-canvas-softer border border-hairline rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-1 focus:ring-ink/30 transition-colors"
                />
              </div>

              <Button className="w-full" onClick={generate}>
                <Sparkles className="w-4 h-4" />
                Generar flyer
              </Button>
            </div>
          ) : (
            <>
              <div className="aspect-[4/5] max-h-[55vh] mx-auto rounded-xl overflow-hidden bg-canvas-softer flex items-center justify-center">
                {loading ? (
                  <div className="flex flex-col items-center gap-3 px-8 text-center text-mute">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <p className="text-xs font-medium leading-relaxed">Generando tu flyer…</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center gap-3 px-8 text-center">
                    <AlertCircle className="w-6 h-6 text-mute" />
                    <p className="text-sm text-body">
                      No pudimos generar el flyer. Inténtalo de nuevo.
                    </p>
                    <Button variant="secondary" size="sm" onClick={generate}>
                      Reintentar
                    </Button>
                  </div>
                ) : imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt="Flyer de la propiedad"
                    className="w-full h-full object-contain"
                  />
                ) : null}
              </div>

              <div className="flex gap-3 mt-5">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-11 w-11 flex-shrink-0"
                  onClick={() => setStep("options")}
                  disabled={loading}
                  title="Cambiar opciones"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                {imageUrl && !loading ? (
                  <Button asChild className="flex-1">
                    <a href={imageUrl} download={`flyer-${slug}.jpg`}>
                      <Download className="w-4 h-4" />
                      Descargar
                    </a>
                  </Button>
                ) : (
                  <Button className="flex-1" disabled>
                    <Download className="w-4 h-4" />
                    Descargar
                  </Button>
                )}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
