"use client"

import { useState, useRef, useEffect, useLayoutEffect } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import imageCompression from "browser-image-compression"
import { ImagePlus, X, Loader2, AlertCircle, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type ImageItem = {
  id: string
  preview: string
  url: string | null
  uploading: boolean
  error: boolean
}

const MAX_SIZE_MB = 20

function SortablePhoto({
  item,
  index,
  onRemove,
}: {
  item: ImageItem
  index: number
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-square rounded-xl overflow-hidden bg-canvas-soft touch-none"
    >
      {/* Drag target — whole tile (excluding the X button) */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.preview} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

      {item.uploading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        </div>
      )}
      {item.error && (
        <div className="absolute inset-0 bg-red-500/50 flex flex-col items-center justify-center gap-1 pointer-events-none">
          <AlertCircle className="w-5 h-5 text-white" />
          <span className="text-[10px] text-white font-bold">Error</span>
        </div>
      )}

      {/* X button — sits above drag listeners */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label="Eliminar foto"
        className="absolute top-1.5 right-1.5 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm"
      >
        <X className="w-4 h-4" strokeWidth={2.5} />
      </button>

      {index === 0 && (
        <div className="absolute top-1.5 left-1.5 z-10 text-[9px] font-bold bg-ink text-white px-1.5 py-0.5 rounded-full pointer-events-none">
          Portada
        </div>
      )}
    </div>
  )
}

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

  // distance:8 prevents accidental drags on click/tap
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const from = prev.findIndex((i) => i.id === active.id)
        const to = prev.findIndex((i) => i.id === over.id)
        return arrayMove(prev, from, to)
      })
    }
  }

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

  const canAdd = items.length < maxImages

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {items.map((item, index) => (
                  <SortablePhoto
                    key={item.id}
                    item={item}
                    index={index}
                    onRemove={remove}
                  />
                ))}

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
            </SortableContext>
          </DndContext>

          <p className="text-xs text-mute">
            Arrastra las fotos para reordenar · La primera es la portada · {items.length}/{maxImages} fotos
          </p>
        </>
      )}
    </div>
  )
}
