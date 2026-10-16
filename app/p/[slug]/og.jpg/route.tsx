import { ImageResponse } from "next/og"
import sharp from "sharp"
import fs from "fs"
import path from "path"
import type { ReactElement } from "react"
import { getPublicProperty } from "@/lib/public-pages"
import { youtubeId, youtubeThumb } from "@/lib/youtube"
import { formatCOPCompact } from "@/lib/format"
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPE_LABELS_EN as TYPE_LABELS_EN,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS_EN as TRANSACTION_LABELS_EN,
} from "@/lib/property-types"


export const runtime = "nodejs"

const markBlack = `data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), "public/mark-black.png")).toString("base64")}`

const size = { width: 1200, height: 630 }
const fonts = [
  {
    name: "Inter",
    data: fs.readFileSync(path.join(process.cwd(), "public/fonts", "inter-bold.woff")),
    weight: 700 as const,
    style: "normal" as const,
  },
]

// Soft, neutral, monochrome gradient — elegant without competing with the photo.
const BACKGROUND = "linear-gradient(145deg, #fbfbfb 0%, #efefef 52%, #e2e2e2 100%)"

const CACHE_CONTROL = "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800"

function imageResponse(body: Buffer, contentType: string): Response {
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": CACHE_CONTROL,
      // max-age alone is a browser hint. These tell the Vercel CDN to store the
      // JPEG and keep serving it while a cold render runs, so WhatsApp doesn't
      // time out on a multi-second miss after the entry expires.
      "CDN-Cache-Control": CACHE_CONTROL,
      "Vercel-CDN-Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}

async function render(node: ReactElement): Promise<Response> {
  const png = Buffer.from(await new ImageResponse(node, { ...size, fonts }).arrayBuffer())
  try {
    const jpeg = await sharp(png).jpeg({ quality: 85, mozjpeg: true }).toBuffer()
    return imageResponse(jpeg, "image/jpeg")
  } catch {
    return imageResponse(png, "image/png")
  }
}

// A portrait photo cropped to fill a landscape card keeps only a thin middle
// band and usually loses the subject. Show it whole over a blurred copy of
// itself instead, the same treatment the public gallery uses.
async function fitToCard(jpeg: Buffer): Promise<Buffer> {
  const meta = await sharp(jpeg).metadata()
  if (!meta.width || !meta.height || meta.width / meta.height >= 1.2) return jpeg
  const backdrop = await sharp(jpeg).resize(size.width, size.height, { fit: "cover" }).blur(40).modulate({ brightness: 0.85 }).toBuffer()
  const whole = await sharp(jpeg).resize(size.width, size.height, { fit: "inside" }).toBuffer()
  return sharp(backdrop).composite([{ input: whole, gravity: "center" }]).jpeg({ quality: 90 }).toBuffer()
}

// Returns the photo as a base64 JPEG plus its (orientation-corrected) dimensions.
async function loadPhoto(
  url: string
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const jpeg = await sharp(buf).rotate().jpeg({ quality: 90 }).toBuffer()
    const meta = await sharp(jpeg).metadata()
    if (!meta.width || !meta.height) return null
    return {
      dataUrl: `data:image/jpeg;base64,${jpeg.toString("base64")}`,
      width: meta.width,
      height: meta.height,
    }
  } catch {
    return null
  }
}

// Google avatar URLs embed a tiny default size; ask for one big enough to stay sharp.
function highResAvatar(url: string): string {
  try {
    if (new URL(url).hostname !== "lh3.googleusercontent.com") return url
  } catch {
    return url
  }
  return url.replace(/=s\d+-c/, "=s200-c")
}

type Agent = { name: string; avatar: string | null }

function agentChip(agent: Agent): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "#fff",
        borderRadius: 999,
        padding: agent.avatar ? "8px 26px 8px 8px" : "14px 28px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
      }}
    >
      {agent.avatar && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={agent.avatar} alt="" style={{ width: 52, height: 52, borderRadius: 999, objectFit: "cover" }} />
      )}
      <div style={{ display: "flex", fontSize: 28, color: "#000" }}>{agent.name}</div>
    </div>
  )
}

function offerPill(offer: string): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        background: "#000",
        color: "#fff",
        borderRadius: 999,
        padding: "16px 34px",
        fontSize: 40,
      }}
    >
      {offer}
    </div>
  )
}

// The photo fills the frame; the agent and the offer sit centered at the
// bottom, so WhatsApp's square center crop of small thumbnails keeps them.
function photoCard(photo: string, offer: string, agent: Agent | null): ReactElement {
  return (
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", background: "#000" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 330,
          backgroundImage: "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        {agent && agentChip(agent)}
        {offerPill(offer)}
      </div>
    </div>
  )
}

function textCard(lines: { kind: string; price: string; location: string }, agent: Agent | null): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#fff",
        gap: 18,
        padding: 60,
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", fontSize: 40, color: "#5e5e5e" }}>{lines.kind}</div>
      <div style={{ display: "flex", fontSize: 104, color: "#000", lineHeight: 1.05 }}>{lines.price}</div>
      {lines.location && <div style={{ display: "flex", fontSize: 40, color: "#000" }}>{lines.location}</div>}
      {agent && <div style={{ display: "flex", marginTop: 18 }}>{agentChip(agent)}</div>}
    </div>
  )
}

function wordmark(fontSize: number, gap: number, mark: number): ReactElement {
  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={markBlack} alt="" style={{ width: mark, height: mark }} />
      <div style={{ display: "flex", fontSize, color: "#000" }}>Conexory</div>
    </div>
  )
}

function brandCard(): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundImage: BACKGROUND,
        gap: 16,
      }}
    >
      {wordmark(68, 18, 64)}
      <div style={{ display: "flex", fontSize: 20, color: "#5e5e5e" }}>
        conexory.com
      </div>
    </div>
  )
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await params
  const search = new URL(req.url).searchParams
  const property = await getPublicProperty(slug)

  if (!property || !property.published) {
    return render(brandCard())
  }

  const english = search.get("lang") === "en" && property.englishAvailable
  const showAgent = property.showContact && search.get("c") !== "0"
  const agentAvatar = showAgent && property.user.image ? await loadPhoto(highResAvatar(property.user.image)) : null
  const agent: Agent | null = showAgent ? { name: property.user.name, avatar: agentAvatar?.dataUrl ?? null } : null

  const rent = property.transactionType === "rent" || property.transactionType === "rent_furnished"
  const price = `${formatCOPCompact(property.price)}${rent ? (english ? " / month" : " / mes") : ""}`
  const operation = property.transactionType
    ? (english ? TRANSACTION_LABELS_EN : TRANSACTION_TYPE_LABELS)[property.transactionType] ?? null
    : null
  const offer = [operation, price, property.city].filter(Boolean).join(" · ")

  const videoId = youtubeId(property.videoUrl)
  const coverUrl = property.images[0] ?? (videoId ? youtubeThumb(videoId) : null)
  const photo = coverUrl ? await loadPhoto(coverUrl) : null

  if (!photo) {
    const typeLabel = (english ? TYPE_LABELS_EN : PROPERTY_TYPE_LABELS)[property.type] ?? property.type
    const kind = [typeLabel, operation?.toLowerCase()].filter(Boolean).join(english ? " · " : " en ")
    const location = [property.neighborhood, property.city].filter(Boolean).join(", ")
    return render(textCard({ kind, price, location }, agent))
  }

  const card = await fitToCard(Buffer.from(photo.dataUrl.split(",")[1], "base64"))
  return render(photoCard(`data:image/jpeg;base64,${card.toString("base64")}`, offer, agent))
}
