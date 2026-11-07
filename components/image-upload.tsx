"use client"

import { useState, useRef, useEffect, useLayoutEffect, createContext, use } from "react"
import dynamic from "next/dynamic"
import imageCompression from "browser-image-compression"
import { ImagePlus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { PhotoGrid, type ImageItem, type PhotoGridProps } from "./photo-grid"

const MAX_SIZE_MB = 20

// next/dynamic's `loading` receives no props, so the fallback reads the photos from context
// to render the same grid (without drag-and-drop) while the dnd-kit chunk downloads.
const PhotoGridFallbackContext = createContext<PhotoGridProps | null>(null)

function PhotoGridFallback() {
  const props = use(PhotoGridFallbackContext)
  return props ? <PhotoGrid {...props} /> : null
}

const SortablePhotoGrid = dynamic(() => import("./sortable-photo-grid"), {
  ssr: false,
  loading: () => <PhotoGridFallback />,
})

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
  const [dropActive, setDropActive] = useState(false)
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

  const gridProps: PhotoGridProps = {
    items,
    onRemove: remove,
    addButton: items.length < maxImages && (
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="aspect-square rounded-xl border-2 border-dashed border-hairline-strong hover:border-ink hover:bg-canvas-soft/30 flex flex-col items-center justify-center gap-1.5 text-mute hover:text-ink transition-colors"
      >
        <Plus className="w-6 h-6" strokeWidth={2} />
        <span className="text-xs font-semibold">Agregar</span>
      </button>
    ),
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <div
          onDragEnter={() => setDropActive(true)}
          onDragLeave={() => setDropActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            setDropActive(false)
            handleFiles(Array.from(e.dataTransfer.files))
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-colors",
            dropActive
              ? "border-ink bg-canvas-soft"
              : "border-hairline-strong hover:border-ink hover:bg-canvas-soft/20"
          )}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-canvas-soft">
            <ImagePlus
              className={cn("w-6 h-6", dropActive ? "text-ink" : "text-mute")}
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
          <PhotoGridFallbackContext value={gridProps}>
            <SortablePhotoGrid {...gridProps} onReorder={setItems} />
          </PhotoGridFallbackContext>

          <p className="text-xs text-mute">
            Arrastra las fotos para reordenar · La primera es la portada · {items.length}/{maxImages} fotos
          </p>
        </>
      )}
    </div>
  )
}
