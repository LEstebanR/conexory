import { ImageResponse } from "next/og"
import { prisma } from "@/lib/prisma"
import { youtubeId, youtubeThumb } from "@/lib/youtube"

export const alt = "Propiedad en Conexory"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const TYPE_LABELS: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  office: "Oficina",
  commercial: "Local comercial",
  lot: "Lote",
  warehouse: "Bodega",
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 800, color: "#fff", letterSpacing: -1 }}>
      Conexory
    </div>
  )
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const property = await prisma.property.findUnique({ where: { slug } })

  if (!property || !property.published) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "#000" }}>
          <Wordmark />
        </div>
      ),
      size
    )
  }

  const type = TYPE_LABELS[property.type] ?? property.type
  const price = formatCOP(Number(property.price))
  const location = [property.neighborhood, property.city].filter(Boolean).join(", ")
  const subtitle = `${type}${location ? ` en ${location}` : ""}`

  const features = [
    property.bedrooms != null
      ? `${property.bedrooms} ${property.bedrooms === 1 ? "habitación" : "habitaciones"}`
      : null,
    property.bathrooms != null
      ? `${property.bathrooms} ${property.bathrooms === 1 ? "baño" : "baños"}`
      : null,
    property.area != null ? `${property.area} m²` : null,
    property.parking != null
      ? `${property.parking} ${property.parking === 1 ? "parqueadero" : "parqueaderos"}`
      : null,
  ]
    .filter(Boolean)
    .join("   ·   ")

  const videoId = youtubeId(property.videoUrl)
  const cover = property.images[0] ?? (videoId ? youtubeThumb(videoId) : null)

  if (cover) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", backgroundColor: "#000" }}>
          <img src={cover} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(to top, rgba(0,0,0,0.9) 8%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.45))" }} />
          <div style={{ position: "absolute", top: 50, left: 60, display: "flex" }}>
            <Wordmark />
          </div>
          <div style={{ position: "absolute", left: 60, right: 60, bottom: 54, display: "flex", flexDirection: "column", color: "#fff" }}>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 600, color: "#e2e2e2" }}>{subtitle}</div>
            <div style={{ display: "flex", fontSize: 76, fontWeight: 800, letterSpacing: -2, marginTop: 6 }}>{price}</div>
            <div style={{ display: "flex", fontSize: 38, fontWeight: 600, marginTop: 4 }}>{property.title}</div>
          </div>
        </div>
      ),
      size
    )
  }

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", backgroundColor: "#000", padding: 64 }}>
        <Wordmark />
        <div style={{ display: "flex", flexDirection: "column", color: "#fff" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600, color: "#afafaf" }}>{subtitle}</div>
          <div style={{ display: "flex", fontSize: 88, fontWeight: 800, letterSpacing: -2, marginTop: 10 }}>{price}</div>
          <div style={{ display: "flex", fontSize: 42, fontWeight: 600, marginTop: 8 }}>{property.title}</div>
          {features ? (
            <div style={{ display: "flex", fontSize: 28, color: "#afafaf", marginTop: 18 }}>{features}</div>
          ) : null}
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#5e5e5e" }}>conexory.com</div>
      </div>
    ),
    size
  )
}
