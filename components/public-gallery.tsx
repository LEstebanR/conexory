"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Expand, Play, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { youtubeEmbedUrl, youtubeThumb } from "@/lib/youtube"

type Slide =
  | { kind: "video"; id: string }
  | { kind: "image"; url: string }

export default function PublicGallery({
  images,
  title,
  videoId,
}: {
  images: string[]
  title: string
  videoId?: string | null
}) {
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const activeThumbRef = useRef<HTMLButtonElement>(null)

  const slides: Slide[] = [
    ...images.map((url) => ({ kind: "image", url }) as const),
    ...(videoId ? [{ kind: "video", id: videoId } as const] : []),
  ]
  const total = slides.length

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

  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    })
  }, [index])

  if (total === 0) return null

  const active = slides[index]

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
        <div
          className="relative aspect-[4/3] sm:aspect-[16/10]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.kind === "video" ? `v-${slide.id}` : slide.url}
              className={cn(
                "absolute inset-0 transition-opacity duration-300",
                i === index ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              {slide.kind === "video" ? (
                <div className="w-full h-full bg-black">
                  {i === index && (
                    <iframe
                      src={youtubeEmbedUrl(slide.id)}
                      title={title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setLightbox(true)}
                  aria-label="Ampliar imágenes"
                  className="relative block w-full h-full cursor-zoom-in"
                >
                  <Image
                    fill
                    src={slide.url}
                    alt=""
                    aria-hidden
                    priority={i === 0}
                    className="object-cover scale-110 blur-2xl opacity-50"
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                  <Image
                    fill
                    src={slide.url}
                    alt={i === 0 ? title : ""}
                    priority={i === 0}
                    className="object-contain"
                    draggable={false}
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Expand hint — only on image slides */}
        {active.kind === "image" && (
          <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/55 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <Expand className="w-3.5 h-3.5" strokeWidth={2.5} />
            Ver fotos
          </div>
        )}

        {/* Counter */}
        {total > 1 && (
          <div className="pointer-events-none absolute top-3 right-3 bg-black/55 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {index + 1} / {total}
          </div>
        )}

        {/* Arrows — always visible so navigation is obvious on desktop */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {slides.map((slide, i) => (
            <button
              key={slide.kind === "video" ? `v-${slide.id}` : slide.url}
              ref={i === index ? activeThumbRef : null}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={slide.kind === "video" ? "Ver video" : `Ver imagen ${i + 1}`}
              className={cn(
                "relative flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden transition-all",
                i === index
                  ? "ring-2 ring-ink ring-offset-1"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <Image
                fill
                src={slide.kind === "video" ? youtubeThumb(slide.id) : slide.url}
                alt=""
                className="object-cover"
                draggable={false}
                sizes="80px"
              />
              {slide.kind === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-3 h-3 text-ink fill-ink ml-0.5" />
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox — portaled to <body> so a transformed ancestor (Reveal)
          can't trap `position: fixed`; otherwise it wouldn't be full screen
          and backdrop-blur wouldn't blur the page. */}
      {lightbox && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full h-full sm:w-[90vw] sm:h-[90vh]"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {active.kind === "video" ? (
              <iframe
                src={youtubeEmbedUrl(active.id)}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full rounded-xl"
              />
            ) : (
              <Image
                key={active.url}
                fill
                src={active.url}
                alt={title}
                className="object-contain drop-shadow-2xl"
                sizes="100vw"
                priority
              />
            )}
          </div>

          <span className="absolute top-4 left-4 text-sm font-bold text-white tabular-nums bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {index + 1} / {total}
          </span>
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Cerrar"
            className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" strokeWidth={2} />
          </button>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Siguiente"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  )
}
