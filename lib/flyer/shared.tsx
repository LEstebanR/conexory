import sharp from "sharp"
import fs from "fs"
import path from "path"
import type { ReactElement } from "react"
import type { Property } from "@prisma/client"
import type { FlyerOptions, FlyerInfo } from "@/lib/flyer-options"
import { formatCOP, formatCOPMillionsValue } from "@/lib/format"

// Bump when template rendering logic changes so cached flyers (keyed in part
// on this) get regenerated instead of serving a stale pre-deploy image.
// v2: brand color support (+ contrast-safe text), top-right logo removed,
// footer contact block is phone-only.
// v3: secondary color for text-on-light instead of an auto-darkened accent.
// v4: big title (type + transaction line) is fully primary-colored; the
// transaction line no longer uses a fixed gray; ficha's property-title
// subtitle uses the secondary color.
// v5: "Precio"/"Contáctame"/"Mira la propiedad..." labels use the secondary
// color (contrast-adjusted against the accent bg) instead of fixed gray;
// every icon is always black, regardless of the chosen colors.
export const FLYER_RENDER_VERSION = 5

// Above this amount the full peso figure ("$ 12.500.000.000") no longer fits
// the price boxes, so every template switches to the compact "$ 12.500 M"
// form instead. Note: "M" is millones — Colombian Spanish "billón" means
// 10^12 (not the English "billion" = 10^9), so we never use that word here.
const PRICE_ABBREVIATION_THRESHOLD = 1_000_000_000

// Deterministic flyer templates (4:5, like the reference real-estate flyers),
// rendered with Satori + sharp using only the property's real data.
export const W = 1080
export const H = 1350
export const PAD = 48

export const CANVAS = "#f3f3f1"
export const INK = "#0a0a0a"
export const BODY = "#4a4a4a"
export const MUTE = "#9a9a9a"
export const PANEL_SHADOW = "0 14px 34px rgba(0,0,0,0.10)"
export const PHOTO_SHADOW = "0 18px 40px rgba(0,0,0,0.16)"
export const DARK_SHADOW = "0 18px 40px rgba(0,0,0,0.30)"

export type Agent = { name: string; image: string | null; phone: string | null }

export type FlyerData = {
  property: Property
  agent: Agent
  options: FlyerOptions
  typeLabel: string
  transactionLabel: string | null
  publicPath: string
  photos: string[]
  // The color the agent picked, used as-is for solid fills (chips, price box,
  // footer bar) — paired with accentOnColor for whatever text/icon sits on
  // top of those fills.
  accentColor: string
  accentOnColor: string
  // accentColor itself, darkened just enough to stay legible when drawn as
  // the big headline text directly on the light canvas.
  primaryTextColor: string
  // The agent's secondary color (or accentColor if they didn't set one),
  // darkened if needed — used for subtitle-level text/icons on the light
  // canvas or a white panel (transaction label, card subtitles, section
  // headings, feature icons).
  accentTextColor: string
  // Secondary color again, but nudged (lighter or darker) to stay legible
  // against accentColor itself — for the small uppercase labels ("Precio",
  // "Contáctame", "Mira la propiedad completa en") that sit on the
  // accent-colored price box / footer bar rather than the light canvas.
  secondaryOnAccentColor: string
}

// ---------------------------------------------------------------------------
// Accent color contrast — an agent can pick any hex, including very light
// ones that would make white-on-accent or accent-on-canvas text unreadable.
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")
  return `#${c(r)}${c(g)}${c(b)}`
}

function srgbToLinear(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}

function contrastRatio(l1: number, l2: number): number {
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (lighter + 0.05) / (darker + 0.05)
}

// White or near-black text on top of `bgHex`, whichever reads better.
export function readableOn(bgHex: string): string {
  const l = relativeLuminance(bgHex)
  return contrastRatio(l, 1) >= contrastRatio(l, 0) ? "#ffffff" : INK
}

function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return [h, s, l]
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let [r, g, b] = [0, 0, 0]
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255)
}

// Nudges `hex`'s HSL lightness — darker if `bgLuminance` is light, lighter if
// `bgLuminance` is dark — until it contrasts enough to read as text on that
// background. Leaves already-legible colors untouched.
export function ensureContrastAgainst(hex: string, bgLuminance: number, minRatio = 3.2): string {
  if (contrastRatio(relativeLuminance(hex), bgLuminance) >= minRatio) return hex

  const [h, s, l0] = hexToHsl(hex)
  const darken = bgLuminance >= 0.5
  let l = l0
  for (let i = 0; i < 40; i++) {
    l = darken ? l - 0.04 : l + 0.04
    if (l < 0.02 || l > 0.98) break
    const candidate = hslToHex(h, s, l)
    if (contrastRatio(relativeLuminance(candidate), bgLuminance) >= minRatio) return candidate
  }
  return darken ? INK : "#ffffff"
}

// Darkens `hex` until it contrasts enough against a near-white surface
// (canvas/panels) to read as text — the common case for titles/headings.
export function ensureTextContrast(hex: string, minRatio = 3.2): string {
  return ensureContrastAgainst(hex, 1, minRatio)
}

export function loadFont(filename: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), "public/fonts", filename))
}

function loadPublicImage(filename: string): string {
  const buf = fs.readFileSync(path.join(process.cwd(), "public", filename))
  return `data:image/png;base64,${buf.toString("base64")}`
}

const markWhite = loadPublicImage("mark-white.png")
const markBlack = loadPublicImage("mark-black.png")

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(" ")
  const atWord = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut
  return atWord.trimEnd().replace(/[.,;:]$/, "") + "…"
}

export async function photoAsDataUrl(url: string, maxSide: number): Promise<string | null> {
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

export function icon(name: keyof typeof ICONS, size: number, color: string): ReactElement {
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

export type Feature = { icon: keyof typeof ICONS; label: string }

export function featureList(property: Property): Feature[] {
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

export function has(d: FlyerData, info: FlyerInfo) {
  return d.options.include.includes(info)
}

export { formatCOP }

export function locationLine(property: Property): string {
  return [property.neighborhood, property.city].filter(Boolean).join(", ")
}

export function dots(style: Record<string, unknown>): ReactElement {
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

export function bigTitle(d: FlyerData, size: number): ReactElement {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span
        style={{
          fontSize: size,
          fontWeight: 900,
          color: d.primaryTextColor,
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
            color: d.primaryTextColor,
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

export function locationChip(d: FlyerData, size = 23): ReactElement | null {
  const location = locationLine(d.property)
  if (!location) return null
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        alignSelf: "flex-start",
        background: d.accentColor,
        borderRadius: 50,
        padding: "12px 26px 12px 20px",
      }}
    >
      {icon("pin", size + 3, INK)}
      <span style={{ fontSize: size, fontWeight: 700, color: d.accentOnColor }}>
        {truncate(location, 44)}
      </span>
    </div>
  )
}

// Only remaining call site is the footer's no-contact fallback, on top of
// the accent-colored bar — `onColor` picks whichever of white/black text
// reads there, and swaps in the matching logo mark.
export function brandRow(onColor: string, size = 26): ReactElement {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={onColor === "#ffffff" ? markWhite : markBlack} alt="" style={{ width: size + 2, height: size + 2 }} />
      <span style={{ fontSize: size, fontWeight: 900, color: onColor, letterSpacing: -0.5 }}>
        conexory
      </span>
    </div>
  )
}

// maxWidth bounds the pill so long highlights wrap onto a second line
// instead of overflowing the canvas or getting cut off after ~30 chars.
export function highlightBadge(d: FlyerData, fontSize = 20, maxWidth = 460): ReactElement | null {
  if (!d.options.highlight) return null
  const maxChars = Math.round((maxWidth / (fontSize * 0.62)) * 2)
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: d.accentColor,
        color: d.accentOnColor,
        borderRadius: 28,
        padding: "13px 26px",
        maxWidth,
        boxShadow: DARK_SHADOW,
      }}
    >
      <div style={{ display: "flex", flexShrink: 0 }}>{icon("tag", fontSize + 4, INK)}</div>
      <span
        style={{
          fontSize,
          fontWeight: 900,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          lineHeight: 1.3,
        }}
      >
        {truncate(d.options.highlight, maxChars)}
      </span>
    </div>
  )
}

// Renders the price value, switching to the compact "$X M" form above
// PRICE_ABBREVIATION_THRESHOLD so it never overflows its box. Both branches
// round the amount once up front so the threshold check and the displayed
// digits always agree (a price of $999.999.999,60 rounds to $1.000.000.000
// either way, instead of taking the "full price" branch with a 10-digit
// string).
function priceValueNode(
  d: FlyerData,
  size: number,
  color: string,
  suffixColor: string
): ReactElement {
  const amount = Math.round(Number(d.property.price))
  if (amount >= PRICE_ABBREVIATION_THRESHOLD) {
    return (
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <span style={{ fontSize: size, fontWeight: 900, color, letterSpacing: -1.5, lineHeight: 1.12 }}>
          {formatCOPMillionsValue(amount)}
        </span>
        <span
          style={{
            fontSize: Math.round(size * 0.46),
            fontWeight: 900,
            color: suffixColor,
            marginLeft: 6,
            paddingBottom: Math.round(size * 0.06),
          }}
        >
          M
        </span>
      </div>
    )
  }
  return (
    <span style={{ fontSize: size, fontWeight: 900, color, letterSpacing: -1.5, lineHeight: 1.12 }}>
      {formatCOP(amount)}
    </span>
  )
}

export function priceBox(d: FlyerData, valueSize = 52): ReactElement | null {
  if (!has(d, "precio")) return null
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: d.accentColor,
        borderRadius: 22,
        padding: "20px 34px",
        boxShadow: DARK_SHADOW,
      }}
    >
      <span style={{ fontSize: 19, fontWeight: 900, color: d.secondaryOnAccentColor, letterSpacing: 4, textTransform: "uppercase" }}>
        Precio
      </span>
      {priceValueNode(d, valueSize, d.accentOnColor, MUTE)}
    </div>
  )
}

// Ficha técnica's price panel is white-on-black text instead of a black box,
// so it needs the same value logic with different colors.
export function priceValuePanelNode(d: FlyerData, size: number): ReactElement {
  return priceValueNode(d, size, d.accentTextColor, BODY)
}

export function sectionChip(text: string, bg: string, onColor: string): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        background: bg,
        color: onColor,
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

export function featureRow(f: Feature, size = 24): ReactElement {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {icon(f.icon, size + 9, INK)}
      <span style={{ fontSize: size, fontWeight: 700, color: "#242424" }}>{f.label}</span>
    </div>
  )
}

// White-framed photo card: the padding acts as the frame over the gray canvas.
export function photoCard(
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

export function photo(src: string, style: Record<string, unknown>, key?: number): ReactElement {
  // eslint-disable-next-line @next/next/no-img-element
  return <img key={key} src={src} alt="" style={{ objectFit: "cover", ...style }} />
}

export function panel(children: ReactElement | (ReactElement | null)[], style: Record<string, unknown> = {}): ReactElement {
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
  value: string,
  onColor: string,
  labelColor: string
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
          border: `2.5px solid ${onColor}`,
          flexShrink: 0,
        }}
      >
        {icon(iconName, 26, INK)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "flex" }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: labelColor }}>{label}</span>
        </div>
        <div style={{ display: "flex" }}>
          <span style={{ fontSize: 23, fontWeight: 900, color: onColor, letterSpacing: -0.3 }}>
            {value}
          </span>
        </div>
      </div>
    </div>
  )
}

export function footerBar(d: FlyerData): ReactElement {
  // "Contáctame" only makes sense with a phone to show — no name fallback,
  // so an agent who enabled contact but never saved a phone just falls back
  // to the brandRow, same as the "no contact" case below.
  const showContactBlock = has(d, "contacto") && !!d.agent.phone
  const onColor = d.accentOnColor
  const labelColor = d.secondaryOnAccentColor
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 30,
        background: d.accentColor,
        padding: `22px ${PAD}px`,
        marginTop: "auto",
      }}
    >
      {showContactBlock && footerGroup("phone", "Contáctame", d.agent.phone as string, onColor, labelColor)}
      {showContactBlock && <div style={{ display: "flex", width: 2, height: 50, background: "#333" }} />}
      {footerGroup("globe", "Mira la propiedad completa en", truncate(d.publicPath, showContactBlock ? 34 : 48), onColor, labelColor)}
      {!showContactBlock && (
        <div style={{ display: "flex", marginLeft: "auto" }}>{brandRow(onColor, 24)}</div>
      )}
    </div>
  )
}

export function descriptionText(d: FlyerData, max = 200, size = 23): ReactElement | null {
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
