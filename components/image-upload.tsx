"use client"

import { useState, useRef, useEffect, useLayoutEffect } from "react"
import imageCompression from "browser-image-compression"
import { ImagePlus, X, Loader2, AlertCircle, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type ImageItem = {
  id: string
  preview: string
  url: string | null
  uploading: boolean
  error: boolean
}

const MAX_SIZE_MB = 20

export default function ImageUpload({
  onUrlsChange,
  onUploadingChange,
  initialUrls = [],
  maxImages = 10,
}: {
  onUrlsChange: (urls: string[]) => void
  onUploadingChange: (uploading: boolean) => void
  initialUrls?: string[]
  maxImages?: number
}) {
  const [items, setItems] = useState<ImageItem[]>(() =>
    initialUrls.map((url) => ({
      id: `existing-${url}`,
      preview: url,
      url,
      uploading: false,
      error: false,
    }))
  )
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const onUrlsChangeRef = useRef(onUrlsChange)
  const onUploadingChangeRef = useRef(onUploadingChange)
  useLayoutEffect(() => {
    onUrlsChangeRef.current = onUrlsChange
    onUploadingChangeRef.current = onUploadingChange
  })

  useEffect(() => {
    onUrlsChangeRef.current(items.filter((i) => i.url).map((i) => i.url!))
    onUploadingChangeRef.current(items.some((i) => i.uploading))
  }, [items])

  async function uploadOne(file: File, itemId: string) {
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      })
      const fd = new FormData()
      fd.append("file", compressed, file.name)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, url, uploading: false } : i))
      )
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, uploading: false, error: true } : i))
      )
    }
  }

  function handleFiles(files: File[]) {
    const remaining = maxImages - items.length
    if (remaining <= 0) return

    const valid = files
      .filter((f) => f.type.startsWith("image/") && f.size <= MAX_SIZE_MB * 1024 * 1024)
      .slice(0, remaining)

    if (!valid.length) return

    const newItems: ImageItem[] = valid.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      preview: URL.createObjectURL(f),
      url: null,
      uploading: true,
      error: false,
    }))

    setItems((prev) => [...prev, ...newItems])
    valid.forEach((file, i) => uploadOne(file, newItems[i].id))
  }

  function remove(id: string) {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item && !item.id.startsWith("existing-")) URL.revokeObjectURL(item.preview)
      return prev.filter((i) => i.id !== id)
    })
  }

  function move(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const target = index + dir
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const canAdd = items.length < maxImages

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <div
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFiles(Array.from(e.dataTransfer.files))
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-colors",
            dragging
              ? "border-ink bg-canvas-soft"
              : "border-hairline-strong hover:border-ink hover:bg-canvas-soft/20"
          )}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-canvas-soft">
            <ImagePlus
              className={cn("w-6 h-6", dragging ? "text-ink" : "text-mute")}
              strokeWidth={1.75}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Arrastra las fotos aquí</p>
            <p className="text-xs text-mute mt-0.5">
              PNG, JPG · Máx. {MAX_SIZE_MB} MB · Hasta {maxImages} fotos
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(Array.from(e.target.files))
          e.target.value = ""
        }}
      />

      {items.length > 0 && (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {items.map((item, index) => {
              const busy = item.uploading || item.error
              return (
                <div
                  key={item.id}
                  className="relative aspect-square rounded-xl overflow-hidden bg-canvas-soft"
                >
                  {/* Plain <img> (eager) instead of next/image fill: these are
                      unoptimized previews, and fill's lazy loading sometimes
                      left the tile blank/gray on client navigation. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.preview} alt="" className="absolute inset-0 w-full h-full object-cover" />

                  {item.uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                  {item.error && (
                    <div className="absolute inset-0 bg-red-500/50 flex flex-col items-center justify-center gap-1">
                      <AlertCircle className="w-5 h-5 text-white" />
                      <span className="text-[10px] text-white font-bold">Error</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label="Eliminar foto"
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm"
                  >
                    <X className="w-4 h-4" strokeWidth={2.5} />
                  </button>

                  {index === 0 ? (
                    <div className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-ink text-white px-1.5 py-0.5 rounded-full">
                      Portada
                    </div>
                  ) : null}

                  {!busy && items.length > 1 && (
                    <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        aria-label="Mover a la izquierda"
                        className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors disabled:opacity-0 disabled:pointer-events-none shadow-sm"
                      >
                        <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === items.length - 1}
                        aria-label="Mover a la derecha"
                        className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors disabled:opacity-0 disabled:pointer-events-none shadow-sm"
                      >
                        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {canAdd && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-hairline-strong hover:border-ink hover:bg-canvas-soft/30 flex flex-col items-center justify-center gap-1.5 text-mute hover:text-ink transition-colors"
              >
                <Plus className="w-6 h-6" strokeWidth={2} />
                <span className="text-xs font-semibold">Agregar</span>
              </button>
            )}
          </div>

          <p className="text-xs text-mute">
            La primera foto es la portada. Usa las flechas para reordenar · {items.length}/{maxImages} fotos
          </p>
        </>
      )}
    </div>
  )
}
