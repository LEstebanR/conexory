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
import dynamic from "next/dynamic"
import { createProperty } from "./actions"
import ImageUpload from "@/components/image-upload"
import LocationSelect from "@/components/location-select"
import { useSession } from "@/lib/auth-client"
import { photoLimit } from "@/lib/plans"

const MapPicker = dynamic(() => import("@/components/map-picker"), { ssr: false })

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

export default function NewPropertyPage() {
  const [type, setType] = useState("")
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("") // dígitos puros sin puntos
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [area, setArea] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [parking, setParking] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [showContact, setShowContact] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { data: session } = useSession()
  const maxImages = photoLimit(Boolean(session?.user.isPremium))

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError("")

    if (!type) {
      setError("Selecciona el tipo de propiedad.")
      return
    }

    startTransition(async () => {
      const result = await createProperty({
        title,
        type,
        price,
        state,
        city,
        neighborhood,
        area,
        bedrooms,
        bathrooms,
        parking,
        description,
        images: imageUrls,
        videoUrl,
        latitude,
        longitude,
        showContact,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      router.push(`/dashboard/properties/${result.id}`)
    })
  }

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-3xl w-full mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl text-mute hover:bg-canvas-soft hover:text-ink transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-ink tracking-tight">Nueva propiedad</h1>
          <p className="text-sm text-body">Completa los datos y obtén tu link para compartir</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de propiedad */}
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

        {/* Fotos */}
        <SectionCard title="Fotos y video">
          <ImageUpload
            onUrlsChange={setImageUrls}
            onUploadingChange={setIsUploading}
            maxImages={maxImages}
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
              Pega el enlace del video y aparecerá en el carrusel de la propiedad.
            </p>
          </div>
        </SectionCard>

        {/* Información básica */}
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
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-mute select-none">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="2.800.000"
                value={formatCOP(price)}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "")
                  setPrice(digits)
                }}
                className="w-full h-11 pl-7 pr-16 rounded-xl border border-hairline-strong text-sm font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-ink/30 focus:border-ink transition-colors"
                required
              />
            </div>
          </div>

          <LocationSelect
            onStateChange={setState}
            onCityChange={setCity}
            required
          />

          <div className="space-y-1.5">
            <FieldLabel optional>Barrio / Zona</FieldLabel>
            <Input
              placeholder="Chapinero"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="h-11"
            />
          </div>
        </SectionCard>

        {/* Detalles */}
        <SectionCard title="Detalles">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <FieldLabel optional>Área (m²)</FieldLabel>
              <Input
                placeholder="65"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="h-11"
                type="number"
                inputMode="decimal"
                min="0"
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel optional>Habitaciones</FieldLabel>
              <Input
                placeholder="2"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="h-11"
                type="number"
                inputMode="numeric"
                min="0"
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel optional>Baños</FieldLabel>
              <Input
                placeholder="1"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="h-11"
                type="number"
                inputMode="numeric"
                min="0"
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel optional>Parqueaderos</FieldLabel>
              <Input
                placeholder="1"
                value={parking}
                onChange={(e) => setParking(e.target.value)}
                className="h-11"
                type="number"
                inputMode="numeric"
                min="0"
              />
            </div>
          </div>
        </SectionCard>

        {/* Descripción */}
        <SectionCard title="Descripción">
          <div className="space-y-1.5">
            <FieldLabel optional>Descripción libre</FieldLabel>
            <textarea
              placeholder="Describe la propiedad: características, acabados, ubicación, puntos de interés cercanos..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={1000}
              className="w-full rounded-xl border border-hairline-strong px-4 py-3 text-sm text-ink placeholder:text-mute resize-none focus:outline-none focus:ring-2 focus:ring-ink/30 focus:border-ink transition-colors"
            />
            <p className="text-xs text-mute text-right">{description.length}/1000</p>
          </div>
        </SectionCard>

        {/* Ubicación en mapa */}
        <SectionCard title="Ubicación en mapa">
          <p className="text-xs text-mute -mt-1">
            Opcional. Permite mostrar la ubicación exacta en la ficha pública.
          </p>
          <MapPicker
            latitude={latitude}
            longitude={longitude}
            suggestedCity={[city, state].filter(Boolean).join(", ")}
            onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng) }}
          />
        </SectionCard>

        {/* Datos de contacto */}
        <SectionCard title="Datos de contacto">
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                className="sr-only"
                checked={showContact}
                onChange={(e) => setShowContact(e.target.checked)}
              />
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${showContact ? "bg-ink border-ink" : "bg-white border-hairline-strong group-hover:border-ink"}`}
              >
                {showContact && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Mostrar mis datos de contacto</p>
              <p className="text-xs text-mute leading-relaxed mt-0.5">
                Tu nombre, teléfono y correo aparecerán al final del link público. Útil para compartir en redes como Instagram.
              </p>
            </div>
          </label>
        </SectionCard>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Button type="button" variant="outline" className="flex-1" asChild>
            <Link href="/dashboard">Cancelar</Link>
          </Button>
          <Button
            type="submit"
            disabled={isPending || isUploading}
            className="flex-1 font-bold shadow-sm "
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publicando...
              </>
            ) : isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo fotos...
              </>
            ) : (
              "Publicar propiedad"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
