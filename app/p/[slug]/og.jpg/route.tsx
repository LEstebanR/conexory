import { ImageResponse } from "next/og"
import sharp from "sharp"
import fs from "fs"
import path from "path"
import type { ReactElement } from "react"
import { prisma } from "@/lib/prisma"
import { youtubeId, youtubeThumb } from "@/lib/youtube"

export const runtime = "nodejs"

const markBlack = `data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), "public/mark-black.png")).toString("base64")}`

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
// so the frame can match the photo's aspect ratio exactly — no crop, no letterbox.
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

function framedPhoto(dataUrl: string, w: number, h: number): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        width: w,
        height: h,
        borderRadius: 22,
        border: "5px solid #fff",
        boxShadow: "0 22px 55px rgba(0,0,0,0.22)",
        overflow: "hidden",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  )
}

function wordmark(fontSize: number, gap: number, mark: number): ReactElement {
  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={markBlack} alt="" style={{ width: mark, height: mark }} />
      <div style={{ display: "flex", fontSize, fontWeight: 900, color: "#000", letterSpacing: -0.5 }}>
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
      {wordmark(68, 18, 64)}
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

  // Portrait: photo centered, with the mark and the wordmark filling the side
  // gaps (logo left, "Conexory" right) instead of empty space.
  if (isPortrait) {
    const availH = size.height - PAD * 2
    const scale = Math.min(MAX_W / photo.width, availH / photo.height)
    const frameW = Math.round(photo.width * scale)
    const frameH = Math.round(photo.height * scale)

    return render(
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "space-around",
          backgroundImage: BACKGROUND,
          padding: `${PAD}px`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markBlack} alt="" style={{ width: 116, height: 116 }} />
        {framedPhoto(photo.dataUrl, frameW, frameH)}
        <div style={{ display: "flex", fontSize: 60, fontWeight: 900, color: "#000", letterSpacing: -1.5 }}>
          Conexory
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
        {wordmark(28, 11, 26)}
      </div>
    </div>
  )
}
