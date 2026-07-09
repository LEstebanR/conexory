import { ImageResponse } from "next/og"
import sharp from "sharp"
import fs from "fs"
import path from "path"
import type { ReactElement } from "react"
import { GoogleGenAI } from "@google/genai"
import type { Property } from "@prisma/client"
import { getAppUrl } from "@/lib/urls"
import { PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/property-types"
import {
  DEFAULT_FLYER_OPTIONS,
  FLYER_STYLE_PROMPTS,
  type FlyerOptions,
} from "@/lib/flyer-options"

// AI path: Gemini image generation via Vercel AI Gateway (free monthly
// credits; switching to direct Google billing later is just an env change).
// Fallback path: deterministic Satori poster when the AI call is not
// available or fails.
const AI_GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions"
const FLYER_IMAGE_MODEL = "google/gemini-2.5-flash-image"
const AI_TIMEOUT_MS = 45_000
const MAX_INPUT_PHOTOS = 4

// Fallback poster: vertical 9:16 for WhatsApp statuses.
const W = 1080
const H = 1920
const PHOTO_H = 1010
const PAD = 64

const GEMINI_TIMEOUT_MS = 8000

type Agent = { name: string; image: string | null; phone: string | null }
type FlyerCopy = { tagline: string; detail: string }

function loadFont(filename: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), "public/fonts", filename))
}

function loadPublicImage(filename: string): string {
  const buf = fs.readFileSync(path.join(process.cwd(), "public", filename))
  return `data:image/png;base64,${buf.toString("base64")}`
}

const markWhite = loadPublicImage("mark-white.png")

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

function propertyFacts(property: Property, typeLabel: string, price: string): string {
  const location = [property.neighborhood, property.city, property.state]
    .filter(Boolean)
    .join(", ")
  return [
    `- Tipo: ${typeLabel}`,
    `- Título: ${property.title}`,
    `- Ubicación: ${location}`,
    `- Precio: ${price}`,
    property.bedrooms != null ? `- Habitaciones: ${property.bedrooms}` : null,
    property.bathrooms != null ? `- Baños: ${property.bathrooms}` : null,
    property.parking != null ? `- Parqueaderos: ${property.parking}` : null,
    property.area != null ? `- Área: ${property.area} m²` : null,
    property.landArea != null ? `- Área de terreno: ${property.landArea} m²` : null,
    property.gatedCommunity ? "- Unidad cerrada" : null,
  ]
    .filter(Boolean)
    .join("\n")
}

// ---------------------------------------------------------------------------
// AI image generation (Nano Banana via AI Gateway)
// ---------------------------------------------------------------------------

function buildImagePrompt(
  property: Property,
  agent: Agent,
  options: FlyerOptions,
  typeLabel: string,
  transactionLabel: string | null,
  price: string,
  publicPath: string
): string {
  const include = new Set(options.include)
  const title = transactionLabel
    ? `${typeLabel} en ${transactionLabel}`.toUpperCase()
    : `${typeLabel} disponible`.toUpperCase()

  const contactLines = include.has("contacto")
    ? [
        `- Agente: ${agent.name}`,
        agent.phone ? `- Teléfono / WhatsApp: ${agent.phone}` : null,
        `- Más información: ${publicPath}`,
      ]
    : [`- Más información: ${publicPath}`]

  const dataSections = [
    `Datos de la propiedad:\n${propertyFacts(property, typeLabel, price)}`,
    include.has("descripcion") && property.description
      ? `Descripción de la propiedad (úsala para los textos, resúmela si es larga):\n${truncate(property.description, 700)}`
      : null,
    `Datos de contacto:\n${contactLines.filter(Boolean).join("\n")}`,
  ]
    .filter(Boolean)
    .join("\n\n")

  const highlighted = [
    include.has("precio") ? `el precio (${price}) bien visible` : null,
    include.has("caracteristicas")
      ? "los datos clave (habitaciones, baños, área) con iconos"
      : null,
    options.highlight ? `y destaca especialmente: ${options.highlight}` : null,
  ]
    .filter(Boolean)
    .join(", ")

  return `ROL: Actúa como diseñador gráfico experto en marketing inmobiliario, composición visual premium y anuncios para redes sociales.

TAREA: Crea una imagen promocional (flyer) para vender esta propiedad usando las fotos reales adjuntas, el logo de la marca y los datos de contacto. Diseña una pieza visual atractiva, profesional y clara, enfocada en captar compradores interesados y motivarlos a solicitar más información o agendar una visita.

CONTEXTO: Usa únicamente las fotos de la propiedad adjuntas, el logo adjunto (la última imagen es el logo de la marca "conexory") y la información proporcionada abajo. No inventes datos, precios, direcciones, beneficios, nombres de agentes ni características que no estén en la información. Mantén el logo sin deformarlo y usa las mejores fotos de la propiedad como elemento visual principal.

RAZONAMIENTO: Organiza la imagen con jerarquía clara: foto principal destacada, texto principal llamativo, datos clave de la propiedad, llamada a la acción y contacto visible. El diseño debe verse limpio, moderno, confiable y comercial, sin saturar la imagen con demasiado texto. Todos los textos en español correcto, sin errores ortográficos ni palabras inventadas.

ESTILO: ${FLYER_STYLE_PROMPTS[options.style]}

FORMATO DE SALIDA: Imagen vertical en formato 4:5 para redes sociales. Incluye: logo de la marca, foto principal de la propiedad${property.images.length > 1 ? " y una cuadrícula pequeña con las demás fotos" : ""}, título "${title}", ${highlighted || "los datos clave de la propiedad"}, CTA "Agenda tu visita" y datos de contacto visibles.

${dataSections}`
}

async function photoAsDataUrl(url: string, maxSide: number): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const jpeg = await sharp(buf)
      .rotate()
      .resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 88 })
      .toBuffer()
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`
  } catch {
    return null
  }
}

async function generateAiFlyerJpeg(
  property: Property,
  agent: Agent,
  options: FlyerOptions,
  typeLabel: string,
  transactionLabel: string | null,
  price: string,
  publicPath: string
): Promise<Buffer | null> {
  const apiKey = process.env.AI_GATEWAY_API_KEY
  if (!apiKey || property.images.length === 0) return null

  try {
    const photos = (
      await Promise.all(
        property.images.slice(0, MAX_INPUT_PHOTOS).map((url) => photoAsDataUrl(url, 1024))
      )
    ).filter((p): p is string => p !== null)
    if (photos.length === 0) return null

    const prompt = buildImagePrompt(
      property,
      agent,
      options,
      typeLabel,
      transactionLabel,
      price,
      publicPath
    )

    const res = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
      body: JSON.stringify({
        model: FLYER_IMAGE_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              ...photos.map((url) => ({ type: "image_url", image_url: { url } })),
              { type: "image_url", image_url: { url: loadPublicImage("logo.png") } },
            ],
          },
        ],
      }),
    })
    if (!res.ok) {
      console.error("[flyer] AI gateway error", res.status, (await res.text()).slice(0, 300))
      return null
    }

    const json = await res.json()
    const dataUrl: string | undefined =
      json?.choices?.[0]?.message?.images?.[0]?.image_url?.url
    const base64 = dataUrl?.split(",")[1]
    if (!base64) return null

    return await sharp(Buffer.from(base64, "base64"))
      .resize({ width: 1080, withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer()
  } catch (error) {
    console.error("[flyer] AI generation failed", error)
    return null
  }
}

// ---------------------------------------------------------------------------
// Deterministic fallback (Satori poster)
// ---------------------------------------------------------------------------

function fallbackCopy(property: Property, typeLabel: string): FlyerCopy {
  const location = [property.neighborhood, property.city].filter(Boolean).join(", ")
  return {
    tagline: property.title,
    detail: `${typeLabel} en ${location}`,
  }
}

async function generateCopy(
  property: Property,
  options: FlyerOptions,
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
Estilo: ${FLYER_STYLE_PROMPTS[options.style]}
${options.highlight ? `Destaca especialmente: ${options.highlight}` : ""}
No uses comillas ni numeración. Solo las dos líneas separadas por salto de línea.

Propiedad:
${propertyFacts(property, typeLabel, price)}
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

async function renderFallbackFlyer(
  property: Property,
  agent: Agent,
  options: FlyerOptions,
  typeLabel: string,
  transactionLabel: string | null,
  price: string,
  publicPath: string
): Promise<Buffer> {
  const chipLabel = [typeLabel, property.city].filter(Boolean).join(" · ")
  const features = featuresLine(property)
  const description =
    options.include.includes("descripcion") && property.description
      ? truncate(property.description.replace(/\s+/g, " "), 220)
      : null

  const [copy, photo] = await Promise.all([
    generateCopy(property, options, typeLabel, price),
    property.images[0] ? photoAsDataUrl(property.images[0], 1400) : Promise.resolve(null),
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
      {description && (
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#afafaf",
            lineHeight: 1.5,
            marginTop: 22,
          }}
        >
          {description}
        </span>
      )}
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
      {heading(description ? 58 : 68)}
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
      {heading(description ? 72 : 84, true)}
      {priceBand(transactionLabel, price, features)}
      {footer(agent, publicPath)}
    </div>
  )

  const png = Buffer.from(
    await new ImageResponse(node, { width: W, height: H, fonts }).arrayBuffer()
  )
  return sharp(png).jpeg({ quality: 82, mozjpeg: true }).toBuffer()
}

// ---------------------------------------------------------------------------

export async function generateFlyerJpeg(
  property: Property,
  agent: Agent,
  options: FlyerOptions = DEFAULT_FLYER_OPTIONS
): Promise<Buffer> {
  const typeLabel = PROPERTY_TYPE_LABELS[property.type] ?? property.type
  const transactionLabel = property.transactionType
    ? TRANSACTION_TYPE_LABELS[property.transactionType] ?? null
    : null
  const price = formatCOP(Number(property.price))
  const publicPath = `${getAppUrl().replace(/^https?:\/\//, "")}/p/${property.slug}`

  const ai = await generateAiFlyerJpeg(
    property,
    agent,
    options,
    typeLabel,
    transactionLabel,
    price,
    publicPath
  )
  if (ai) return ai

  return renderFallbackFlyer(
    property,
    agent,
    options,
    typeLabel,
    transactionLabel,
    price,
    publicPath
  )
}
