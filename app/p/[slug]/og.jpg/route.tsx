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

// A blurred, darkened version of the photo fills the canvas so vertical (or any
// non-16:9) photos can be shown whole on top via object-fit: contain without
// empty bars. Satori can't apply CSS filters, so we pre-blur with sharp.
async function blurredBackdrop(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const out = await sharp(buf)
      .resize(size.width, size.height, { fit: "cover" })
      .blur(40)
      .modulate({ brightness: 0.5 })
      .jpeg({ quality: 60 })
      .toBuffer()
    return `data:image/jpeg;base64,${out.toString("base64")}`
  } catch {
    return null
  }
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
        backgroundColor: "#fff",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markBlack} alt="" style={{ width: 64, height: 64 }} />
        <div style={{ display: "flex", fontSize: 68, fontWeight: 900, color: "#000", letterSpacing: -2 }}>
          Conexory
        </div>
      </div>
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
  const cover = property.images[0] ?? (videoId ? youtubeThumb(videoId) : null)

  if (!cover) {
    return render(brandCard())
  }

  const backdrop = await blurredBackdrop(cover)

  return render(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "#111",
      }}
    >
      {backdrop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backdrop}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            objectFit: "cover",
          }}
        />
      )}

      {/* Photo shown whole, centered, with a margin from the edges */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size.width,
          height: size.height,
          display: "flex",
          padding: 44,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      {/* Conexory wordmark, on a translucent pill for legibility over any photo */}
      <div
        style={{
          position: "absolute",
          left: 44,
          bottom: 40,
          display: "flex",
          alignItems: "center",
          gap: 12,
          backgroundColor: "rgba(0,0,0,0.55)",
          padding: "12px 20px",
          borderRadius: 999,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markWhite} alt="" style={{ width: 30, height: 30 }} />
        <div style={{ display: "flex", fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>
          Conexory
        </div>
      </div>
    </div>
  )
}
