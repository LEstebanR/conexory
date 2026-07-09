"use client"

import { useState, type ReactNode } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Download, RefreshCw, Loader2, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FlyerModal({
  propertyId,
  slug,
  children,
}: {
  propertyId: string
  slug: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  async function load(regen: boolean) {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/flyer.jpg${regen ? "?regen=1" : ""}`
      )
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
    if (next && !imageUrl && !loading) void load(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-white rounded-2xl shadow-2xl shadow-black/10 p-6 sm:p-7 animate-fade-up">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Dialog.Title className="text-lg font-black text-ink tracking-tight">
                Flyer de la propiedad
              </Dialog.Title>
              <Dialog.Description className="text-sm text-body mt-0.5">
                Listo para compartir en WhatsApp o Instagram.
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

          <div className="aspect-[9/16] max-h-[55vh] mx-auto rounded-xl overflow-hidden bg-canvas-softer flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-3 text-mute">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-xs font-medium">Generando flyer…</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 px-8 text-center">
                <AlertCircle className="w-6 h-6 text-mute" />
                <p className="text-sm text-body">
                  No pudimos generar el flyer. Inténtalo de nuevo.
                </p>
                <Button variant="secondary" size="sm" onClick={() => load(false)}>
                  Reintentar
                </Button>
              </div>
            ) : imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Flyer de la propiedad" className="w-full h-full object-cover" />
            ) : null}
          </div>

          <div className="flex gap-3 mt-5">
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
            <Button
              variant="secondary"
              size="icon"
              className="h-11 w-11 flex-shrink-0"
              onClick={() => load(true)}
              disabled={loading}
              title="Generar de nuevo"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
