import { ImageResponse } from "next/og"
import sharp from "sharp"
import fs from "fs"
import path from "path"
import type { ReactElement } from "react"
import { prisma } from "@/lib/prisma"
import { youtubeId, youtubeThumb } from "@/lib/youtube"

export const runtime = "nodejs"

const markBlack = `data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), "public/mark-black.png")).toString("base64")}`
const markWhite = `data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), "public/mark-white.png")).toString("base64")}`

const size = { width: 1200, height: 630 }
const PAD = 44
const BRAND_H = 76
const MAX_W = size.width - PAD * 2
const MAX_H = size.height - PAD - BRAND_H

// Soft, neutral, monochrome gradient — elegant without competing with the photo.
const BACKGROUND = "linear-gradient(145deg, #fbfbfb 0%, #efefef 52%, #e2e2e2 100%)"

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

// Returns the photo as a base64 JPEG plus its (orientation-corrected) dimensions
// and the raw buffer, so the frame can match the photo's aspect ratio exactly
// and a blurred backdrop can be derived for portrait shots.
async function loadPhoto(
  url: string
): Promise<{ dataUrl: string; width: number; height: number; buffer: Buffer } | null> {
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
      buffer: jpeg,
    }
  } catch {
    return null
  }
}

// A blurred, darkened cover of the photo fills the side gaps for portrait shots,
// so they read as intentional rather than floating on empty space. Satori can't
// blur, so it's pre-rendered with sharp.
async function blurredBackdrop(buffer: Buffer): Promise<string | null> {
  try {
    const out = await sharp(buffer)
      .resize(size.width, size.height, { fit: "cover" })
      .blur(60)
      .modulate({ brightness: 0.45 })
      .jpeg({ quality: 55 })
      .toBuffer()
    return `data:image/jpeg;base64,${out.toString("base64")}`
  } catch {
    return null
  }
}

function framedPhoto(dataUrl: string, w: number, h: number): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        width: w,
        height: h,
        borderRadius: 22,
        border: "5px solid #fff",
        boxShadow: "0 22px 55px rgba(0,0,0,0.28)",
        overflow: "hidden",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  )
}

function wordmark(src: string, color: string, fontSize: number, gap: number, mark: number): ReactElement {
  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" style={{ width: mark, height: mark }} />
      <div style={{ display: "flex", fontSize, fontWeight: 900, color, letterSpacing: -0.5 }}>
        Conexory
      </div>
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
      {wordmark(markBlack, "#000", 68, 18, 64)}
      <div style={{ display: "flex", fontSize: 20, color: "#afafaf", letterSpacing: 3, textTransform: "uppercase" }}>
        conexory.com
      </div>
    </div>
  )
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await params
  const property = await prisma.property.findUnique({ where: { slug } })

  if (!property || !property.published) {
    return render(brandCard())
  }

  const videoId = youtubeId(property.videoUrl)
  const coverUrl = property.images[0] ?? (videoId ? youtubeThumb(videoId) : null)
  const photo = coverUrl ? await loadPhoto(coverUrl) : null

  if (!photo) {
    return render(brandCard())
  }

  const isPortrait = photo.height > photo.width

  // Portrait: blurred backdrop fills the side gaps; brand sits on a pill overlay.
  if (isPortrait) {
    const backdrop = await blurredBackdrop(photo.buffer)
    const availH = size.height - PAD * 2
    const scale = Math.min(MAX_W / photo.width, availH / photo.height)
    const frameW = Math.round(photo.width * scale)
    const frameH = Math.round(photo.height * scale)

    return render(
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", backgroundColor: "#111" }}>
        {backdrop && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backdrop}
            alt=""
            style={{ position: "absolute", top: 0, left: 0, width: size.width, height: size.height, objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {framedPhoto(photo.dataUrl, frameW, frameH)}
        </div>
        <div
          style={{
            position: "absolute",
            left: 36,
            bottom: 32,
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "11px 19px",
            borderRadius: 999,
          }}
        >
          {wordmark(markWhite, "#fff", 27, 10, 25)}
        </div>
      </div>
    )
  }

  // Landscape / square: framed photo on the neutral gradient with a brand bar.
  const scale = Math.min(MAX_W / photo.width, MAX_H / photo.height)
  const frameW = Math.round(photo.width * scale)
  const frameH = Math.round(photo.height * scale)

  return render(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundImage: BACKGROUND,
        padding: `${PAD}px ${PAD}px 0`,
      }}
    >
      <div style={{ display: "flex", flexGrow: 1, alignItems: "center", justifyContent: "center" }}>
        {framedPhoto(photo.dataUrl, frameW, frameH)}
      </div>
      <div style={{ display: "flex", height: BRAND_H, alignItems: "center", justifyContent: "center" }}>
        {wordmark(markBlack, "#000", 28, 11, 26)}
      </div>
    </div>
  )
}
