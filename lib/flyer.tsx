import { ImageResponse } from "next/og"
import sharp from "sharp"
import fs from "fs"
import path from "path"
import type { ReactElement } from "react"
import type { Property } from "@prisma/client"
import { getAppUrl } from "@/lib/urls"
import { PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/property-types"
import { DEFAULT_FLYER_OPTIONS, type FlyerOptions } from "@/lib/flyer-options"

// Deterministic flyer templates (4:5, like the reference real-estate flyers),
// rendered with Satori + sharp using only the property's real data.
const W = 1080
const H = 1350
const PAD = 48

const CANVAS = "#f3f3f1"
const INK = "#0a0a0a"
const BODY = "#4a4a4a"
const MUTE = "#9a9a9a"
const PANEL_SHADOW = "0 14px 34px rgba(0,0,0,0.10)"
const PHOTO_SHADOW = "0 18px 40px rgba(0,0,0,0.16)"
const DARK_SHADOW = "0 18px 40px rgba(0,0,0,0.30)"

type Agent = { name: string; image: string | null; phone: string | null }

type FlyerData = {
  property: Property
  agent: Agent
  options: FlyerOptions
  typeLabel: string
  transactionLabel: string | null
  price: string
  publicPath: string
  photos: string[]
}

function loadFont(filename: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), "public/fonts", filename))
}

function loadPublicImage(filename: string): string {
  const buf = fs.readFileSync(path.join(process.cwd(), "public", filename))
  return `data:image/png;base64,${buf.toString("base64")}`
}

const markWhite = loadPublicImage("mark-white.png")
const markBlack = loadPublicImage("mark-black.png")

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

async function photoAsDataUrl(url: string, maxSide: number): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const jpeg = await sharp(buf)
      .rotate()
      .resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 86 })
      .toBuffer()
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Icons (lucide path data, rendered as inline SVG for Satori)
// ---------------------------------------------------------------------------

type IconShape =
  | { type: "path"; d: string }
  | { type: "circle"; cx: number; cy: number; r: number }

const ICONS: Record<string, IconShape[]> = {
  bed: [
    { type: "path", d: "M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" },
    { type: "path", d: "M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" },
    { type: "path", d: "M12 4v6" },
    { type: "path", d: "M2 18h20" },
  ],
  bath: [
    { type: "path", d: "M10 4 8 6" },
    { type: "path", d: "M17 19v2" },
    { type: "path", d: "M2 12h20" },
    { type: "path", d: "M7 19v2" },
    { type: "path", d: "M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" },
  ],
  car: [
    { type: "path", d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" },
    { type: "circle", cx: 7, cy: 17, r: 2 },
    { type: "path", d: "M9 17h6" },
    { type: "circle", cx: 17, cy: 17, r: 2 },
  ],
  ruler: [
    { type: "path", d: "M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" },
    { type: "path", d: "m14.5 12.5 2-2" },
    { type: "path", d: "m11.5 9.5 2-2" },
    { type: "path", d: "m8.5 6.5 2-2" },
    { type: "path", d: "m17.5 15.5 2-2" },
  ],
  land: [
    { type: "path", d: "m12 8 6-3-6-3v10" },
    { type: "path", d: "m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12" },
    { type: "path", d: "m6.49 12.85 11.02 6.3" },
    { type: "path", d: "M17.51 12.85 6.5 19.15" },
  ],
  pin: [
    { type: "path", d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" },
    { type: "circle", cx: 12, cy: 10, r: 3 },
  ],
  shield: [
    { type: "path", d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" },
    { type: "path", d: "m9 12 2 2 4-4" },
  ],
  phone: [
    { type: "path", d: "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" },
  ],
  globe: [
    { type: "circle", cx: 12, cy: 12, r: 10 },
    { type: "path", d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" },
    { type: "path", d: "M2 12h20" },
  ],
  tag: [
    { type: "path", d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" },
    { type: "circle", cx: 7.5, cy: 7.5, r: 0.5 },
  ],
}

function icon(name: keyof typeof ICONS, size: number, color: string): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name].map((shape, i) =>
        shape.type === "path" ? (
          <path key={i} d={shape.d} />
        ) : (
          <circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} />
        )
      )}
    </svg>
  )
}

type Feature = { icon: keyof typeof ICONS; label: string }

function featureList(property: Property): Feature[] {
  const items: (Feature | null)[] = [
    property.bedrooms != null
      ? { icon: "bed" as const, label: `${property.bedrooms} ${property.bedrooms === 1 ? "habitación" : "habitaciones"}` }
      : null,
    property.bathrooms != null
      ? { icon: "bath" as const, label: `${property.bathrooms} ${property.bathrooms === 1 ? "baño" : "baños"}` }
      : null,
    property.area != null ? { icon: "ruler" as const, label: `${property.area} m²` } : null,
    property.landArea != null
      ? { icon: "land" as const, label: `${property.landArea} m² de terreno` }
      : null,
    property.parking != null
      ? { icon: "car" as const, label: `${property.parking} ${property.parking === 1 ? "parqueadero" : "parqueaderos"}` }
      : null,
    property.gatedCommunity ? { icon: "shield" as const, label: "Unidad cerrada" } : null,
  ]
  return items.filter((f): f is Feature => f !== null)
}

// ---------------------------------------------------------------------------
// Shared blocks
// ---------------------------------------------------------------------------

function has(d: FlyerData, info: "precio" | "caracteristicas" | "descripcion" | "contacto") {
  return d.options.include.includes(info)
}

function locationLine(property: Property): string {
  return [property.neighborhood, property.city].filter(Boolean).join(", ")
}

function dots(style: Record<string, unknown>): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        width: 190,
        height: 250,
        backgroundImage: "radial-gradient(circle at 5px 5px, #d2d2d0 4.5px, transparent 4.5px)",
        backgroundSize: "34px 34px",
        ...style,
      }}
    />
  )
}

function bigTitle(d: FlyerData, size: number): ReactElement {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span
        style={{
          fontSize: size,
          fontWeight: 900,
          color: INK,
          letterSpacing: -2,
          lineHeight: 1.02,
          textTransform: "uppercase",
        }}
      >
        {d.typeLabel}
      </span>
      {d.transactionLabel && (
        <span
          style={{
            fontSize: size,
            fontWeight: 900,
            color: "#b4b4b2",
            letterSpacing: -2,
            lineHeight: 1.06,
            textTransform: "uppercase",
          }}
        >
          en {d.transactionLabel}
        </span>
      )}
    </div>
  )
}

function locationChip(d: FlyerData, size = 23): ReactElement | null {
  const location = locationLine(d.property)
  if (!location) return null
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        alignSelf: "flex-start",
        background: INK,
        borderRadius: 50,
        padding: "12px 26px 12px 20px",
      }}
    >
      {icon("pin", size + 3, "#fff")}
      <span style={{ fontSize: size, fontWeight: 700, color: "#fff" }}>
        {truncate(location, 44)}
      </span>
    </div>
  )
}

function brandRow(dark: boolean, size = 26): ReactElement {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dark ? markWhite : markBlack} alt="" style={{ width: size + 2, height: size + 2 }} />
      <span
        style={{
          fontSize: size,
          fontWeight: 900,
          color: dark ? "#fff" : INK,
          letterSpacing: -0.5,
        }}
      >
        conexory
      </span>
    </div>
  )
}

function highlightBadge(d: FlyerData, fontSize = 20): ReactElement | null {
  if (!d.options.highlight) return null
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: INK,
        color: "#fff",
        borderRadius: 50,
        padding: "13px 26px",
        fontSize,
        fontWeight: 900,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        boxShadow: DARK_SHADOW,
      }}
    >
      {icon("tag", fontSize + 4, "#fff")}
      {truncate(d.options.highlight, 30)}
    </div>
  )
}

function priceBox(d: FlyerData, valueSize = 52): ReactElement | null {
  if (!has(d, "precio")) return null
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: INK,
        borderRadius: 22,
        padding: "20px 34px",
        boxShadow: DARK_SHADOW,
      }}
    >
      <span style={{ fontSize: 19, fontWeight: 900, color: MUTE, letterSpacing: 4, textTransform: "uppercase" }}>
        Precio
      </span>
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <span style={{ fontSize: valueSize, fontWeight: 900, color: "#fff", letterSpacing: -1.5, lineHeight: 1.12 }}>
          {d.price}
        </span>
        <span
          style={{
            fontSize: Math.round(valueSize * 0.42),
            fontWeight: 900,
            color: MUTE,
            marginLeft: 10,
            paddingBottom: Math.round(valueSize * 0.12),
          }}
        >
          COP
        </span>
      </div>
    </div>
  )
}

function sectionChip(text: string): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        background: INK,
        color: "#fff",
        borderRadius: 50,
        padding: "10px 24px",
        fontSize: 21,
        fontWeight: 900,
        letterSpacing: 2,
        textTransform: "uppercase",
        alignSelf: "flex-start",
      }}
    >
      {text}
    </div>
  )
}

function featureRow(f: Feature, size = 24): ReactElement {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {icon(f.icon, size + 9, INK)}
      <span style={{ fontSize: size, fontWeight: 700, color: "#242424" }}>{f.label}</span>
    </div>
  )
}

// White-framed photo card: the padding acts as the frame over the gray canvas.
function photoCard(
  src: string,
  outer: Record<string, unknown>,
  radius = 22,
  key?: number
): ReactElement {
  return (
    <div
      key={key}
      style={{
        display: "flex",
        background: "#fff",
        padding: 9,
        borderRadius: radius,
        boxShadow: PHOTO_SHADOW,
        ...outer,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: radius - 9 }}
      />
    </div>
  )
}

function photo(src: string, style: Record<string, unknown>, key?: number): ReactElement {
  // eslint-disable-next-line @next/next/no-img-element
  return <img key={key} src={src} alt="" style={{ objectFit: "cover", ...style }} />
}

function panel(children: ReactElement | (ReactElement | null)[], style: Record<string, unknown> = {}): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        borderRadius: 24,
        padding: "24px 28px",
        boxShadow: PANEL_SHADOW,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function footerGroup(
  iconName: keyof typeof ICONS,
  label: string,
  value: string
): ReactElement {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 54,
          height: 54,
          borderRadius: 27,
          border: "2.5px solid #fff",
          flexShrink: 0,
        }}
      >
        {icon(iconName, 26, "#fff")}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "flex" }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: MUTE }}>{label}</span>
        </div>
        <div style={{ display: "flex" }}>
          <span style={{ fontSize: 23, fontWeight: 900, color: "#fff", letterSpacing: -0.3 }}>
            {value}
          </span>
        </div>
      </div>
    </div>
  )
}

function footerBar(d: FlyerData): ReactElement {
  const contact = has(d, "contacto")
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 30,
        background: INK,
        padding: `22px ${PAD}px`,
        marginTop: "auto",
      }}
    >
      {contact && footerGroup("phone", "Contáctame", d.agent.phone ? `${truncate(d.agent.name, 18)} · ${d.agent.phone}` : truncate(d.agent.name, 30))}
      {contact && <div style={{ display: "flex", width: 2, height: 50, background: "#333" }} />}
      {footerGroup("globe", "Mira la propiedad completa en", truncate(d.publicPath, contact ? 34 : 48))}
      {!contact && (
        <div style={{ display: "flex", marginLeft: "auto" }}>{brandRow(true, 24)}</div>
      )}
    </div>
  )
}

function descriptionText(d: FlyerData, max = 200, size = 23): ReactElement | null {
  if (!has(d, "descripcion") || !d.property.description) return null
  return (
    <span
      style={{
        fontSize: size,
        fontWeight: 700,
        color: BODY,
        lineHeight: 1.5,
      }}
    >
      {truncate(d.property.description.replace(/\s+/g, " "), max)}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Template: Clásica — big title over textured canvas, framed hero photo with
// the price box overlapping its edge, thumb strip, feature and description
// panels (based on reference flyer #8)
// ---------------------------------------------------------------------------

function templateClasica(d: FlyerData): ReactElement {
  const thumbs = d.photos.slice(1, 4)
  const features = has(d, "caracteristicas") ? featureList(d.property).slice(0, 6) : []
  const description = descriptionText(d, 170, 21)
  const badge = highlightBadge(d, 19)
  const priceOverlap = has(d, "precio")

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: CANVAS,
        position: "relative",
      }}
    >
      {dots({ top: -60, right: -40 })}
      {dots({ bottom: 80, left: -90 })}

      <div style={{ display: "flex", flexDirection: "column", padding: `${PAD}px ${PAD}px 0`, flexGrow: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {bigTitle(d, 66)}
            {locationChip(d)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16, flexShrink: 0 }}>
            {brandRow(false)}
            {badge}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            position: "relative",
            marginTop: 28,
            flexGrow: 1,
            minHeight: 330,
            marginBottom: priceOverlap ? 52 : 22,
          }}
        >
          {photoCard(d.photos[0], { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }, 26)}
          {priceOverlap && (
            <div style={{ display: "flex", position: "absolute", bottom: -42, right: 28 }}>
              {priceBox(d, 46)}
            </div>
          )}
        </div>

        {thumbs.length >= 2 && (
          <div style={{ display: "flex", gap: 16 }}>
            {thumbs.map((src, i) =>
              photoCard(
                src,
                {
                  width: (W - PAD * 2 - 16 * (thumbs.length - 1)) / thumbs.length,
                  height: 156,
                },
                18,
                i
              )
            )}
          </div>
        )}

        {(features.length > 0 || description) && (
          <div style={{ display: "flex", gap: 18, marginTop: 22, marginBottom: 24 }}>
            {features.length > 0 &&
              panel(
                [
                  sectionChip("Características"),
                  <div key="grid" style={{ display: "flex", flexWrap: "wrap", marginTop: 18 }}>
                    {features.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          width: description ? "100%" : "50%",
                          paddingBottom: 11,
                        }}
                      >
                        {featureRow(f, 22)}
                      </div>
                    ))}
                  </div>,
                ],
                { flex: 1 }
              )}
            {description &&
              panel(
                [
                  sectionChip("Descripción"),
                  <div key="text" style={{ display: "flex", marginTop: 18 }}>
                    {description}
                  </div>,
                ],
                { flex: 1.25 }
              )}
          </div>
        )}
      </div>
      {footerBar(d)}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Template: Ficha técnica — framed photos on the left, spec column with
// underlined heading, price panel and highlight tag on the right (based on
// reference flyer #7)
// ---------------------------------------------------------------------------

function templateFicha(d: FlyerData): ReactElement {
  const thumbs = d.photos.slice(1, 3)
  const features = has(d, "caracteristicas") ? featureList(d.property).slice(0, 6) : []
  const badge = highlightBadge(d, 18)
  const description = descriptionText(d, 210, 21)
  const colGap = 26
  const rightW = 330
  const leftW = W - PAD * 2 - rightW - colGap

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: CANVAS,
        position: "relative",
      }}
    >
      {dots({ top: 40, right: -70 })}

      <div style={{ display: "flex", flexDirection: "column", padding: `${PAD}px ${PAD}px 0`, flexGrow: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 600 }}>
            {bigTitle(d, 58)}
            <span style={{ fontSize: 26, fontWeight: 700, color: BODY, letterSpacing: -0.5, lineHeight: 1.3 }}>
              {truncate(d.property.title, 80)}
            </span>
            {locationChip(d, 21)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14, flexShrink: 0 }}>
            {brandRow(false)}
            {badge}
          </div>
        </div>

        <div style={{ display: "flex", gap: colGap, marginTop: 26, flexGrow: 1, marginBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, width: leftW }}>
            <div style={{ display: "flex", position: "relative", flexGrow: 1, minHeight: 400 }}>
              {photoCard(d.photos[0], { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }, 24)}
            </div>
            {thumbs.length > 0 && (
              <div style={{ display: "flex", gap: 16 }}>
                {thumbs.map((src, i) =>
                  photoCard(
                    src,
                    {
                      width: (leftW - 16 * (thumbs.length - 1)) / thumbs.length,
                      height: 190,
                    },
                    18,
                    i
                  )
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, width: rightW }}>
            {features.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: INK, letterSpacing: 2.5, textTransform: "uppercase" }}>
                  Características
                </span>
                <div style={{ display: "flex", width: 64, height: 5, background: INK, borderRadius: 3, marginTop: 10 }} />
                <div style={{ display: "flex", flexDirection: "column", marginTop: 22 }}>
                  {features.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        paddingBottom: 16,
                        marginBottom: 16,
                        borderBottom: i < features.length - 1 ? "1.5px solid #e2e2e0" : "none",
                      }}
                    >
                      {featureRow(f, 22)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {has(d, "precio") &&
              panel(
                [
                  <span key="l" style={{ fontSize: 20, fontWeight: 700, color: BODY }}>
                    Precio:
                  </span>,
                  <span key="v" style={{ fontSize: 40, fontWeight: 900, color: INK, letterSpacing: -1.5, marginTop: 2 }}>
                    {d.price}
                  </span>,
                ],
                { padding: "20px 26px", marginTop: "auto" }
              )}
          </div>
        </div>

        {description && (
          <div style={{ display: "flex", marginBottom: 26 }}>
            {panel(
              [
                sectionChip("Descripción"),
                <div key="text" style={{ display: "flex", marginTop: 18 }}>
                  {description}
                </div>,
              ],
              { flex: 1 }
            )}
          </div>
        )}
      </div>
      {footerBar(d)}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Template: Fotos — hero photo with curved sweep and floating badges, title
// and price row, feature strip panel, photo collage (based on reference
// flyers #4 and #5)
// ---------------------------------------------------------------------------

function templateFotos(d: FlyerData): ReactElement {
  const thumbs = d.photos.slice(1, 4)
  const features = has(d, "caracteristicas") ? featureList(d.property).slice(0, 4) : []
  const badge = d.options.highlight
  const location = locationLine(d.property)

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: CANVAS }}>
      <div style={{ display: "flex", position: "relative", flexGrow: 1, minHeight: thumbs.length >= 2 ? 470 : 600 }}>
        {photo(d.photos[0], { width: "100%", height: "100%", borderBottomRightRadius: 130 })}
        {badge && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              position: "absolute",
              top: 28,
              left: 28,
              background: "#fff",
              borderRadius: 50,
              padding: "13px 26px",
              boxShadow: PANEL_SHADOW,
            }}
          >
            {icon("tag", 24, INK)}
            <span style={{ fontSize: 20, fontWeight: 900, color: INK, letterSpacing: 1.5, textTransform: "uppercase" }}>
              {truncate(badge, 30)}
            </span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 28,
            right: 28,
            background: "#fff",
            borderRadius: 50,
            padding: "12px 24px",
            boxShadow: PANEL_SHADOW,
          }}
        >
          {brandRow(false, 22)}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 26, padding: `30px ${PAD}px 34px` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, flexGrow: 1 }}>
          {bigTitle(d, 60)}
          {location && (
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              {icon("pin", 27, INK)}
              <span style={{ fontSize: 25, fontWeight: 700, color: "#242424" }}>
                {truncate(location, 34)}
              </span>
            </div>
          )}
        </div>
        {priceBox(d, 46)}
      </div>

      {features.length > 0 && (
        <div style={{ display: "flex", padding: `0 ${PAD}px` }}>
          {panel(
            [
              <div key="strip" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 26 }}>
                    {i > 0 && <div style={{ display: "flex", width: 1.5, height: 52, background: "#e2e2e0" }} />}
                    <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                      {icon(f.icon, 36, INK)}
                      <span style={{ fontSize: 22, fontWeight: 700, color: "#242424" }}>{f.label}</span>
                    </div>
                  </div>
                ))}
              </div>,
            ],
            { flex: 1, padding: "20px 30px" }
          )}
        </div>
      )}

      {thumbs.length >= 2 && (
        <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
          {thumbs.map((src, i) =>
            photo(src, { width: (W - 10 * (thumbs.length - 1)) / thumbs.length, height: 215 }, i)
          )}
        </div>
      )}

      {footerBar(d)}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Typographic fallback when the property has no photos
// ---------------------------------------------------------------------------

function templateSinFotos(d: FlyerData): ReactElement {
  const features = has(d, "caracteristicas") ? featureList(d.property).slice(0, 6) : []
  const description = descriptionText(d, 260, 26)
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: CANVAS,
        position: "relative",
      }}
    >
      {dots({ top: -60, right: -40 })}
      {dots({ bottom: 140, left: -90 })}

      <div style={{ display: "flex", flexDirection: "column", padding: `${PAD}px ${PAD}px 0`, flexGrow: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {bigTitle(d, 82)}
            {locationChip(d, 26)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
            {brandRow(false)}
            {highlightBadge(d)}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 56 }}>
          <span style={{ fontSize: 44, fontWeight: 900, color: "#1c1c1c", letterSpacing: -1, lineHeight: 1.18 }}>
            {truncate(d.property.title, 70)}
          </span>
          {description && panel([description], { padding: "26px 30px" })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: "auto", paddingBottom: 40 }}>
          {features.length > 0 &&
            panel(
              [
                <div key="grid" style={{ display: "flex", flexWrap: "wrap" }}>
                  {features.map((f, i) => (
                    <div key={i} style={{ display: "flex", width: "50%", padding: "9px 0" }}>
                      {featureRow(f, 24)}
                    </div>
                  ))}
                </div>,
              ],
              { padding: "22px 30px" }
            )}
          <div style={{ display: "flex", alignSelf: "flex-start" }}>{priceBox(d, 56)}</div>
        </div>
      </div>
      {footerBar(d)}
    </div>
  )
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

  const photos = (
    await Promise.all(
      property.images.slice(0, 4).map((url, i) => photoAsDataUrl(url, i === 0 ? 1400 : 800))
    )
  ).filter((p): p is string => p !== null)

  const data: FlyerData = {
    property,
    agent,
    options,
    typeLabel,
    transactionLabel,
    price,
    publicPath,
    photos,
  }

  const node =
    photos.length === 0
      ? templateSinFotos(data)
      : options.template === "ficha"
        ? templateFicha(data)
        : options.template === "fotos"
          ? templateFotos(data)
          : templateClasica(data)

  const fonts = [
    { name: "Inter", data: loadFont("inter-bold.woff"), weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: loadFont("inter-black.woff"), weight: 900 as const, style: "normal" as const },
  ]

  const png = Buffer.from(
    await new ImageResponse(node, { width: W, height: H, fonts }).arrayBuffer()
  )
  return sharp(png).jpeg({ quality: 84, mozjpeg: true }).toBuffer()
}
