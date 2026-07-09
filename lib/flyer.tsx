import { ImageResponse } from "next/og"
import sharp from "sharp"
import fs from "fs"
import path from "path"
import type { ReactElement } from "react"
import { GoogleGenAI } from "@google/genai"
import type { Property } from "@prisma/client"
import { getAppUrl } from "@/lib/urls"
import { PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/property-types"

// Vertical 9:16 — full-screen poster for WhatsApp statuses and Instagram stories.
const W = 1080
const H = 1920
const PHOTO_H = 1010
const PAD = 64

const GEMINI_TIMEOUT_MS = 8000

type Agent = { name: string; image: string | null }
type FlyerCopy = { tagline: string; detail: string }

function loadFont(filename: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), "public/fonts", filename))
}

const markWhite = `data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), "public/mark-white.png")).toString("base64")}`

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text
}

function fallbackCopy(property: Property, typeLabel: string): FlyerCopy {
  const location = [property.neighborhood, property.city].filter(Boolean).join(", ")
  return {
    tagline: property.title,
    detail: `${typeLabel} en ${location}`,
  }
}

async function generateCopy(
  property: Property,
  typeLabel: string,
  price: string
): Promise<FlyerCopy> {
  const fallback = fallbackCopy(property, typeLabel)
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) return fallback

  try {
    const ai = new GoogleGenAI({ apiKey })
    // gemini-2.0-flash (from the original spec) no longer has free-tier
    // quota; 2.5-flash does. Thinking is disabled to keep latency ~1-2 s.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Eres copywriter inmobiliario colombiano. Escribe exactamente dos líneas de texto para un afiche de venta:
LÍNEA 1 (tagline, máx 8 palabras, impactante, orientada a vender): describe el mayor atractivo de esta propiedad.
LÍNEA 2 (detalle, máx 14 palabras): contexto de ubicación o característica diferencial.
No uses comillas ni numeración. Solo las dos líneas separadas por salto de línea.

Propiedad:
- Tipo: ${typeLabel}
- Título: ${property.title}
- Ciudad: ${property.city}${property.neighborhood ? `, ${property.neighborhood}` : ""}
- Precio: ${price}
- Habitaciones: ${property.bedrooms ?? "N/A"}
- Baños: ${property.bathrooms ?? "N/A"}
- Área: ${property.area ? property.area + " m²" : "N/A"}
- Descripción del agente: ${property.description ?? "Sin descripción"}`,
      config: {
        abortSignal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
        thinkingConfig: { thinkingBudget: 0 },
      },
    })

    const lines = (response.text ?? "")
      .split("\n")
      .map((l) => l.replace(/^["'\d.\-*\s]+|["'\s]+$/g, ""))
      .filter(Boolean)

    if (lines.length === 0) return fallback
    return { tagline: lines[0], detail: lines[1] ?? fallback.detail }
  } catch {
    return fallback
  }
}

async function loadPhoto(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const jpeg = await sharp(buf)
      .rotate()
      .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 88 })
      .toBuffer()
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`
  } catch {
    return null
  }
}

function chip(label: string, fontSize = 30): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        background: "#000",
        color: "#fff",
        borderRadius: 60,
        padding: "20px 38px",
        fontSize,
        fontWeight: 900,
        letterSpacing: 2.5,
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
  )
}

function featuresLine(property: Property): string {
  return [
    property.bedrooms != null ? `${property.bedrooms} hab` : null,
    property.bathrooms != null ? `${property.bathrooms} baños` : null,
    property.parking != null ? `${property.parking} parq` : null,
    property.area != null ? `${property.area} m²` : null,
  ]
    .filter(Boolean)
    .join("   ·   ")
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function priceBand(
  transactionLabel: string | null,
  price: string,
  features: string
): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#000",
        padding: `52px ${PAD}px`,
      }}
    >
      {transactionLabel && (
        <span
          style={{
            fontSize: 30,
            fontWeight: 900,
            color: "#afafaf",
            letterSpacing: 5,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          {transactionLabel}
        </span>
      )}
      <span style={{ fontSize: 96, fontWeight: 900, color: "#fff", letterSpacing: -3, lineHeight: 1 }}>
        {price}
      </span>
      {features && (
        <span style={{ fontSize: 34, fontWeight: 700, color: "rgba(255,255,255,0.65)", marginTop: 26 }}>
          {features}
        </span>
      )}
    </div>
  )
}

function footer(agent: Agent, publicPath: string): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `44px ${PAD}px 56px`,
        marginTop: "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 22, minWidth: 0 }}>
        {agent.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={agent.image}
            alt=""
            style={{ width: 84, height: 84, borderRadius: 60, objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              width: 84,
              height: 84,
              borderRadius: 60,
              background: "#efefef",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 900,
              color: "#5e5e5e",
            }}
          >
            {initials(agent.name)}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: "#000", letterSpacing: -0.5 }}>
            {truncate(agent.name, 28)}
          </span>
          <span style={{ fontSize: 26, fontWeight: 700, color: "#afafaf" }}>{publicPath}</span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#000",
          borderRadius: 60,
          padding: "16px 28px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markWhite} alt="" style={{ width: 28, height: 28 }} />
        <span style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>
          conexory
        </span>
      </div>
    </div>
  )
}

export async function generateFlyerJpeg(property: Property, agent: Agent): Promise<Buffer> {
  const typeLabel = PROPERTY_TYPE_LABELS[property.type] ?? property.type
  const transactionLabel = property.transactionType
    ? TRANSACTION_TYPE_LABELS[property.transactionType] ?? null
    : null
  const price = formatCOP(Number(property.price))
  const publicPath = `${getAppUrl().replace(/^https?:\/\//, "")}/p/${property.slug}`
  const location = [property.neighborhood, property.city].filter(Boolean).join(", ")
  const chipLabel = [typeLabel, location ? property.city : null].filter(Boolean).join(" · ")
  const features = featuresLine(property)

  const [copy, photo] = await Promise.all([
    generateCopy(property, typeLabel, price),
    property.images[0] ? loadPhoto(property.images[0]) : Promise.resolve(null),
  ])

  const fonts = [
    { name: "Inter", data: loadFont("inter-bold.woff"), weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: loadFont("inter-black.woff"), weight: 900 as const, style: "normal" as const },
  ]

  const heading = (taglineSize: number, centered = false): ReactElement => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: `56px ${PAD}px`,
        ...(centered ? { flexGrow: 1, justifyContent: "center" } : {}),
      }}
    >
      <span
        style={{
          fontSize: taglineSize,
          fontWeight: 900,
          color: "#000",
          letterSpacing: -2,
          lineHeight: 1.1,
        }}
      >
        {truncate(copy.tagline, 70)}
      </span>
      <span
        style={{
          fontSize: 38,
          fontWeight: 700,
          color: "#5e5e5e",
          lineHeight: 1.4,
          marginTop: 24,
        }}
      >
        {truncate(copy.detail, 95)}
      </span>
    </div>
  )

  const node = photo ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "#fff",
        fontFamily: "Inter",
      }}
    >
      <div style={{ display: "flex", width: W, height: PHOTO_H, position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ display: "flex", position: "absolute", top: 48, left: PAD }}>
          {chip(truncate(chipLabel, 36))}
        </div>
      </div>
      {heading(68)}
      {priceBand(transactionLabel, price, features)}
      {footer(agent, publicPath)}
    </div>
  ) : (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundImage: "linear-gradient(160deg, #fbfbfb 0%, #efefef 52%, #e2e2e2 100%)",
        fontFamily: "Inter",
      }}
    >
      <div style={{ display: "flex", padding: `${PAD}px ${PAD}px 0` }}>
        {chip(truncate(chipLabel, 36))}
      </div>
      {heading(84, true)}
      {priceBand(transactionLabel, price, features)}
      {footer(agent, publicPath)}
    </div>
  )

  const png = Buffer.from(
    await new ImageResponse(node, { width: W, height: H, fonts }).arrayBuffer()
  )
  return sharp(png).jpeg({ quality: 82, mozjpeg: true }).toBuffer()
}
