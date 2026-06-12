"use client"

import { useState, useRef, useEffect, useLayoutEffect } from "react"
import Image from "next/image"
import imageCompression from "browser-image-compression"
import { ImagePlus, X, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type ImageItem = {
  id: string
  preview: string
  url: string | null
  uploading: boolean
  error: boolean
}

const MAX_IMAGES = 10
const MAX_SIZE_MB = 20

export default function ImageUpload({
  onUrlsChange,
  onUploadingChange,
  initialUrls = [],
}: {
  onUrlsChange: (urls: string[]) => void
  onUploadingChange: (uploading: boolean) => void
  initialUrls?: string[]
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
    const remaining = MAX_IMAGES - items.length
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

  const canAdd = items.length < MAX_IMAGES

  return (
    <div className="space-y-3">
      {canAdd && (
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
              ? "border-brand-400 bg-brand-50"
              : "border-slate-200 hover:border-brand-300 hover:bg-brand-50/20"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
            dragging ? "bg-brand-100" : "bg-slate-100"
          )}>
            <ImagePlus
              className={cn("w-6 h-6", dragging ? "text-brand-500" : "text-slate-400")}
              strokeWidth={1.75}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {items.length === 0 ? "Arrastra las fotos aquí" : "Agregar más fotos"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              PNG, JPG, WebP · Máx. {MAX_SIZE_MB} MB · Hasta {MAX_IMAGES} fotos
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
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group"
            >
              <Image fill unoptimized src={item.preview} alt="" className="object-cover" />

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
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>

              {index === 0 && (
                <div className="absolute bottom-1.5 left-1.5 text-[9px] font-bold bg-black/50 text-white px-1.5 py-0.5 rounded-full">
                  Portada
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
