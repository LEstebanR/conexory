"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Home,
  Building2,
  Briefcase,
  ShoppingBag,
  Trees,
  Warehouse,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import ImageUpload from "@/components/image-upload"
import { photoLimit } from "@/lib/plans"
import { updateProperty } from "./actions"

const PROPERTY_TYPES = [
  { id: "apartment", label: "Apartamento", icon: Building2 },
  { id: "house", label: "Casa", icon: Home },
  { id: "office", label: "Oficina", icon: Briefcase },
  { id: "commercial", label: "Local", icon: ShoppingBag },
  { id: "lot", label: "Lote", icon: Trees },
  { id: "warehouse", label: "Bodega", icon: Warehouse },
]

function formatCOP(digits: string): string {
  if (!digits) return ""
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-hairline p-6 space-y-4">
      <h2 className="text-sm font-bold text-ink uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  )
}

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-ink">
      {children}
      {optional && <span className="ml-1.5 text-xs font-normal text-mute">Opcional</span>}
    </label>
  )
}

export type InitialData = {
  id: string
  title: string
  type: string
  price: string
  city: string
  neighborhood: string
  area: string
  bedrooms: string
  bathrooms: string
  parking: string
  description: string
  images: string[]
  videoUrl: string
}

export default function EditForm({ initial, isPremium }: { initial: InitialData; isPremium: boolean }) {
  const [type, setType] = useState(initial.type)
  const [title, setTitle] = useState(initial.title)
  const [price, setPrice] = useState(initial.price)
  const [city, setCity] = useState(initial.city)
  const [neighborhood, setNeighborhood] = useState(initial.neighborhood)
  const [area, setArea] = useState(initial.area)
  const [bedrooms, setBedrooms] = useState(initial.bedrooms)
  const [bathrooms, setBathrooms] = useState(initial.bathrooms)
  const [parking, setParking] = useState(initial.parking)
  const [description, setDescription] = useState(initial.description)
  const [videoUrl, setVideoUrl] = useState(initial.videoUrl)
  const [imageUrls, setImageUrls] = useState<string[]>(initial.images)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError("")
    if (!type) { setError("Selecciona el tipo de propiedad."); return }

    startTransition(async () => {
      const result = await updateProperty(initial.id, {
        title, type, price, city, neighborhood,
        area, bedrooms, bathrooms, parking, description,
        images: imageUrls,
        videoUrl,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      router.push(`/dashboard/properties/${initial.id}`)
    })
  }

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-3xl w-full mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/dashboard/properties/${initial.id}`}
          className="p-2 rounded-xl text-mute hover:bg-canvas-soft hover:text-ink transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-ink tracking-tight">Editar propiedad</h1>
          <p className="text-sm text-body">Los cambios se reflejan en el link público al instante</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <SectionCard title="Tipo de propiedad">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {PROPERTY_TYPES.map((pt) => {
              const Icon = pt.icon
              const isSelected = type === pt.id
              return (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setType(pt.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 py-4 rounded-xl text-xs font-medium transition-all border-2",
                    isSelected
                      ? "bg-canvas-soft text-ink border-ink"
                      : "bg-white text-body border-hairline hover:border-hairline-strong hover:bg-canvas-softer"
                  )}
                >
                  <Icon
                    className={cn("w-5 h-5", isSelected ? "text-ink" : "text-mute")}
                    strokeWidth={isSelected ? 2.25 : 1.75}
                  />
                  {pt.label}
                </button>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard title="Fotos y video">
          <ImageUpload
            onUrlsChange={setImageUrls}
            onUploadingChange={setIsUploading}
            initialUrls={initial.images}
            maxImages={photoLimit(isPremium)}
          />
          <div className="space-y-1.5 pt-4 border-t border-hairline">
            <FieldLabel optional>Video de YouTube</FieldLabel>
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="h-11"
              inputMode="url"
            />
            <p className="text-xs text-mute">
              Pega el enlace del video y aparecerá de primero en el carrusel.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Información básica">
          <div className="space-y-1.5">
            <FieldLabel>Título del anuncio</FieldLabel>
            <Input
              placeholder="Ej: Apartamento moderno con vista al parque"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11"
              required
              maxLength={120}
            />
            <p className="text-xs text-mute text-right">{title.length}/120</p>
          </div>

          <div className="space-y-1.5">
            <FieldLabel>Precio</FieldLabel>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-mute select-none">$</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="2.800.000"
                value={formatCOP(price)}
                onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                className="w-full h-11 pl-7 rounded-xl border border-hairline-strong text-sm font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-ink/30 focus:border-ink transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FieldLabel>Ciudad</FieldLabel>
              <Input placeholder="Bogotá" value={city} onChange={(e) => setCity(e.target.value)} className="h-11" required />
            </div>
            <div className="space-y-1.5">
              <FieldLabel optional>Barrio / Zona</FieldLabel>
              <Input placeholder="Chapinero" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="h-11" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Detalles">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <FieldLabel optional>Área (m²)</FieldLabel>
              <Input placeholder="65" value={area} onChange={(e) => setArea(e.target.value)} className="h-11" type="number" min="0" />
            </div>
            <div className="space-y-1.5">
              <FieldLabel optional>Habitaciones</FieldLabel>
              <Input placeholder="2" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="h-11" type="number" min="0" />
            </div>
            <div className="space-y-1.5">
              <FieldLabel optional>Baños</FieldLabel>
              <Input placeholder="1" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="h-11" type="number" min="0" />
            </div>
            <div className="space-y-1.5">
              <FieldLabel optional>Parqueaderos</FieldLabel>
              <Input placeholder="1" value={parking} onChange={(e) => setParking(e.target.value)} className="h-11" type="number" min="0" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Descripción">
          <div className="space-y-1.5">
            <FieldLabel optional>Descripción libre</FieldLabel>
            <textarea
              placeholder="Describe la propiedad: características, acabados, ubicación..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={1000}
              className="w-full rounded-xl border border-hairline-strong px-4 py-3 text-sm text-ink placeholder:text-mute resize-none focus:outline-none focus:ring-2 focus:ring-ink/30 focus:border-ink transition-colors"
            />
            <p className="text-xs text-mute text-right">{description.length}/1000</p>
          </div>
        </SectionCard>

        {error && (
          <p className="text-sm text-red-500 font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="sticky bottom-0 z-10 -mx-6 lg:-mx-8 px-6 lg:px-8 pt-8 pb-4 pointer-events-none bg-gradient-to-t from-canvas-softer from-50% to-transparent">
          <div className="flex gap-3 max-w-3xl mx-auto pointer-events-auto rounded-full bg-white/70 backdrop-blur-md border border-hairline shadow-lg shadow-black/5 p-1.5">
            <Button type="button" variant="outline" className="flex-1 border-transparent bg-transparent shadow-none" asChild>
              <Link href={`/dashboard/properties/${initial.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending || isUploading} className="flex-1 font-bold">
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
              ) : isUploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo fotos...</>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
