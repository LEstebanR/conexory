import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react"
import { X, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type ImageItem = {
  id: string
  preview: string
  url: string | null
  uploading: boolean
  error: boolean
}

export type PhotoGridProps = {
  items: ImageItem[]
  onRemove: (id: string) => void
  addButton: ReactNode
}

export const PHOTO_GRID_CLASS = "grid grid-cols-3 sm:grid-cols-4 gap-2"

export function PhotoTile({
  item,
  index,
  onRemove,
  ref,
  style,
  className,
  dragHandleProps,
}: {
  item: ImageItem
  index: number
  onRemove: (id: string) => void
  ref?: Ref<HTMLDivElement>
  style?: CSSProperties
  className?: string
  dragHandleProps?: HTMLAttributes<HTMLDivElement>
}) {
  return (
    <div
      ref={ref}
      style={style}
      className={cn("relative aspect-square rounded-xl overflow-hidden bg-canvas-soft", className)}
    >
      {dragHandleProps && (
        <div {...dragHandleProps} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      )}

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

export function PhotoGrid({ items, onRemove, addButton }: PhotoGridProps) {
  return (
    <div className={PHOTO_GRID_CLASS}>
      {items.map((item, index) => (
        <PhotoTile key={item.id} item={item} index={index} onRemove={onRemove} />
      ))}
      {addButton}
    </div>
  )
}
