"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PropertyCarousel({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const [current, setCurrent] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  if (images.length === 0) return null

  const total = images.length

  function prev() {
    setCurrent((i) => (i === 0 ? total - 1 : i - 1))
  }

  function next() {
    setCurrent((i) => (i === total - 1 ? 0 : i + 1))
  }

  function onTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.targetTouches[0].clientX)
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX === null) return
    const delta = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(delta) > 40) delta > 0 ? next() : prev()
    setTouchStartX(null)
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-200 select-none">
      {/* Image stack */}
      <div
        className="relative aspect-[4/3] sm:aspect-video"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {images.map((url, i) => (
          <img
            key={url}
            src={url}
            alt={i === 0 ? title : ""}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
              i === current ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            draggable={false}
          />
        ))}
      </div>

      {/* Counter badge */}
      {total > 1 && (
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {current + 1} / {total}
        </div>
      )}

      {/* Arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Imagen anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-sm flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>
          <button
            onClick={next}
            aria-label="Siguiente imagen"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-sm flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && total <= 12 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Ir a imagen ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                i === current ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
