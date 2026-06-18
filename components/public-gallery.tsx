"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PublicGallery({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  const total = images.length

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + total) % total),
    [total]
  )

  useEffect(() => {
    if (!lightbox) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(false)
      else if (e.key === "ArrowLeft") go(-1)
      else if (e.key === "ArrowRight") go(1)
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [lightbox, go])

  if (total === 0) return null

  function onTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.targetTouches[0].clientX)
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX === null) return
    const delta = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(delta) > 40) go(delta > 0 ? 1 : -1)
    setTouchStartX(null)
  }

  return (
    <>
      {/* Main stage */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-canvas-soft select-none group">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="Ampliar imágenes"
          className="relative block w-full aspect-[4/3] sm:aspect-[16/10] cursor-zoom-in"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {images.map((url, i) => (
            <Image
              key={url}
              fill
              src={url}
              alt={i === 0 ? title : ""}
              priority={i === 0}
              className={cn(
                "object-cover transition-opacity duration-300",
                i === index ? "opacity-100" : "opacity-0"
              )}
              draggable={false}
              sizes="(max-width: 768px) 100vw, 768px"
            />
          ))}
        </button>

        {/* Expand hint */}
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/55 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
          <Expand className="w-3.5 h-3.5" strokeWidth={2.5} />
          Ver fotos
        </div>

        {/* Counter */}
        {total > 1 && (
          <div className="pointer-events-none absolute top-3 right-3 bg-black/55 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {index + 1} / {total}
          </div>
        )}

        {/* Arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Siguiente imagen"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronRight className="w-5 h-5 text-white" strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={cn(
                "relative flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden transition-all",
                i === index
                  ? "ring-2 ring-ink ring-offset-1"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <Image
                fill
                src={url}
                alt=""
                className="object-cover"
                draggable={false}
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-4 h-14 flex-shrink-0 text-white">
            <span className="text-sm font-bold tabular-nums">
              {index + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Cerrar"
              className="w-10 h-10 -mr-2 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6" strokeWidth={2} />
            </button>
          </div>

          <div
            className="relative flex-1 min-h-0"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <Image
              key={images[index]}
              fill
              src={images[index]}
              alt={title}
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Imagen anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Siguiente imagen"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
