import { ImageResponse } from "next/og"
import sharp from "sharp"
import fs from "fs"
import path from "path"
import type { ReactElement } from "react"
import { prisma } from "@/lib/prisma"
import { youtubeId, youtubeThumb } from "@/lib/youtube"

export const runtime = "nodejs"

const markWhite = `data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), "public/mark-white.png")).toString("base64")}`

const size = { width: 1200, height: 630 }

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

async function render(node: ReactElement): Promise<Response> {
  const png = Buffer.from(await new ImageResponse(node, size).arrayBuffer())
  try {
    const jpeg = await sharp(png).jpeg({ quality: 85, mozjpeg: true }).toBuffer()
    return new Response(new Uint8Array(jpeg), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400" },
    })
  } catch {
    return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } })
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await params
  const property = await prisma.property.findUnique({ where: { slug } })

  if (!property || !property.published) {
    return render(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#000",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markWhite} alt="" style={{ width: 64, height: 64 }} />
          <div style={{ display: "flex", fontSize: 68, fontWeight: 900, color: "#fff", letterSpacing: -2 }}>
            Conexory
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#444", letterSpacing: 3, textTransform: "uppercase" }}>
          conexory.com
        </div>
      </div>
    )
  }

  const type = TYPE_LABELS[property.type] ?? property.type
  const price = formatCOP(Number(property.price))
  const location = [property.neighborhood, property.city].filter(Boolean).join(", ")
  const title = property.title.length > 48 ? property.title.slice(0, 48) + "…" : property.title

  const featureItems = [
    property.bedrooms != null ? `${property.bedrooms} hab.` : null,
    property.bathrooms != null
      ? `${property.bathrooms} ${property.bathrooms === 1 ? "baño" : "baños"}`
      : null,
    property.area != null ? `${property.area} m²` : null,
    property.parking != null ? `${property.parking} parq.` : null,
  ].filter(Boolean) as string[]

  const videoId = youtubeId(property.videoUrl)
  const cover = property.images[0] ?? (videoId ? youtubeThumb(videoId) : null)

  if (cover) {
    return render(
      <div style={{ display: "flex", width: "100%", height: "100%", backgroundColor: "#000" }}>
        {/* Photo — left 57% */}
        <div style={{ display: "flex", position: "relative", width: "57%", height: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Fade to black on right edge so the panel blends */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "25%",
              background: "linear-gradient(to right, transparent, #000)",
            }}
          />
        </div>

        {/* Info panel — right 43% */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "43%",
            height: "100%",
            backgroundColor: "#000",
            padding: "52px 60px 52px 44px",
          }}
        >
          {/* Wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={markWhite} alt="" style={{ width: 28, height: 28 }} />
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: -0.5,
              }}
            >
              Conexory
            </div>
          </div>

          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Type label */}
            <div
              style={{
                display: "flex",
                fontSize: 14,
                fontWeight: 700,
                color: "#555",
                letterSpacing: 3,
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              {type}
            </div>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                height: 1,
                backgroundColor: "#222",
                marginBottom: 20,
              }}
            />

            {/* Price */}
            <div
              style={{
                display: "flex",
                fontSize: 54,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: -2,
                lineHeight: 1,
              }}
            >
              {price}
            </div>

            {/* Title */}
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                color: "#999",
                marginTop: 16,
                lineHeight: 1.3,
              }}
            >
              {title}
            </div>

            {/* Location */}
            {location && (
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  color: "#4a4a4a",
                  marginTop: 8,
                }}
              >
                {location}
              </div>
            )}

            {/* Feature chips */}
            {featureItems.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 22,
                }}
              >
                {featureItems.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#ccc",
                      backgroundColor: "#111",
                      border: "1px solid #2a2a2a",
                      padding: "6px 15px",
                      borderRadius: 999,
                    }}
                  >
                    {f}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* URL */}
          <div style={{ display: "flex", fontSize: 16, color: "#333", letterSpacing: 0.5 }}>
            conexory.com
          </div>
        </div>
      </div>
    )
  }

  // No-photo fallback — full black, typographic layout
  return render(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
        padding: "60px 80px",
      }}
    >
      {/* Wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markWhite} alt="" style={{ width: 30, height: 30 }} />
        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: -1,
          }}
        >
          Conexory
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Type + location */}
        <div
          style={{
            display: "flex",
            fontSize: 16,
            fontWeight: 700,
            color: "#444",
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          {type}
          {location ? `  ·  ${location}` : ""}
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            height: 1,
            backgroundColor: "#1c1c1c",
            marginBottom: 26,
          }}
        />

        {/* Price */}
        <div
          style={{
            display: "flex",
            fontSize: 100,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: -4,
            lineHeight: 0.95,
          }}
        >
          {price}
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 40,
            fontWeight: 700,
            color: "#666",
            marginTop: 24,
            lineHeight: 1.2,
          }}
        >
          {property.title.length > 55 ? property.title.slice(0, 55) + "…" : property.title}
        </div>

        {/* Feature chips */}
        {featureItems.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
            {featureItems.map((f) => (
              <div
                key={f}
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#bbb",
                  backgroundColor: "#111",
                  border: "1px solid #222",
                  padding: "8px 20px",
                  borderRadius: 999,
                }}
              >
                {f}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* URL */}
      <div style={{ display: "flex", fontSize: 18, color: "#333", letterSpacing: 0.5 }}>
        conexory.com
      </div>
    </div>
  )
}
