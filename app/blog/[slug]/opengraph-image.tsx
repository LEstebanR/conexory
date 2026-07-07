import { ImageResponse } from "next/og"
import fs from "fs"
import path from "path"
import { getPost } from "@/lib/blog"

export const runtime = "nodejs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

function loadFont(filename: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), "public/fonts", filename))
}

const markWhite = `data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), "public/mark-white.png")).toString("base64")}`

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)

  const fontBold = loadFont("inter-bold.woff")
  const fontBlack = loadFont("inter-black.woff")

  const fonts = [
    { name: "Inter", data: fontBold, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: fontBlack, weight: 900 as const, style: "normal" as const },
  ]

  if (!post) {
    return new ImageResponse(
      <div
        style={{
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
        }}
      >
        <img src={markWhite} alt="" style={{ width: 56, height: 56 }} />
        <span style={{ color: "#fff", fontFamily: "Inter", fontWeight: 900, fontSize: 60, letterSpacing: -2 }}>
          Conexory
        </span>
      </div>,
      { width: 1200, height: 630, fonts }
    )
  }

  const title =
    post.title.length > 120 ? post.title.slice(0, 117) + "…" : post.title
  const titleSize = title.length > 70 ? 56 : 68

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "Inter",
        padding: "64px 72px",
      }}
    >
      {/* Top: brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <img src={markWhite} alt="" style={{ width: 36, height: 36 }} />
        <span style={{ color: "#fff", fontWeight: 900, fontSize: 30, letterSpacing: -0.8 }}>
          Conexory
        </span>
        <span
          style={{
            color: "#afafaf",
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginLeft: 6,
          }}
        >
          Blog
        </span>
      </div>

      {/* Middle: title */}
      <span
        style={{
          color: "#fff",
          fontWeight: 900,
          fontSize: titleSize,
          letterSpacing: -2,
          lineHeight: 1.1,
        }}
      >
        {title}
      </span>

      {/* Bottom: date + reading time */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ color: "#afafaf", fontWeight: 700, fontSize: 26 }}>
          {formatDate(post.date)}
        </span>
        <span style={{ color: "#5e5e5e", fontWeight: 700, fontSize: 26 }}>·</span>
        <span style={{ color: "#afafaf", fontWeight: 700, fontSize: 26 }}>
          {post.readingTime} min de lectura
        </span>
      </div>
    </div>,
    { width: 1200, height: 630, fonts }
  )
}
