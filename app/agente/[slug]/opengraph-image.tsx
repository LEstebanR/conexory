import { ImageResponse } from "next/og"
import fs from "fs"
import path from "path"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

function loadFont(filename: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), "public/fonts", filename))
}

async function getAgent(slug: string) {
  return prisma.user.findUnique({
    where: { agentSlug: slug },
    select: {
      name: true,
      image: true,
      location: true,
      bio: true,
      profilePublished: true,
      properties: {
        where: { published: true },
        select: { id: true },
      },
    },
  })
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const agent = await getAgent(slug)

  const fontBold = loadFont("inter-bold.woff")
  const fontBlack = loadFont("inter-black.woff")

  const fonts = [
    { name: "Inter", data: fontBold, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: fontBlack, weight: 900 as const, style: "normal" as const },
  ]

  if (!agent || !agent.profilePublished) {
    return new ImageResponse(
      <div
        style={{
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#fff", fontFamily: "Inter", fontWeight: 900, fontSize: 48 }}>
          Conexory
        </span>
      </div>,
      { width: 1200, height: 630, fonts }
    )
  }

  const initials = agent.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const count = agent.properties.length
  const propLabel = count === 1 ? "propiedad activa" : "propiedades activas"

  const bio = agent.bio
    ? agent.bio.length > 100
      ? agent.bio.slice(0, 97) + "…"
      : agent.bio
    : null

  const subtitle = [
    "Asesor inmobiliario",
    agent.location,
  ]
    .filter(Boolean)
    .join("  ·  ")

  return new ImageResponse(
    <div
      style={{
        background: "#000",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "72px 88px 64px",
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      {/* Conexory mark — top right */}
      <div
        style={{
          position: "absolute",
          top: 56,
          right: 88,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            background: "#fff",
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#000", fontWeight: 900, fontSize: 16, lineHeight: 1 }}>
            C
          </span>
        </div>
        <span style={{ color: "#fff", fontWeight: 900, fontSize: 20, letterSpacing: -0.5 }}>
          Conexory
        </span>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 52, flex: 1, marginTop: 8 }}>

        {/* Avatar */}
        <div style={{ display: "flex", flexShrink: 0, marginTop: 4 }}>
          {agent.image ? (
            <img
              src={agent.image}
              alt=""
              width={128}
              height={128}
              style={{
                borderRadius: "50%",
                border: "3px solid #333",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 128,
                height: 128,
                borderRadius: "50%",
                background: "#1a1a1a",
                border: "3px solid #333",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 44, lineHeight: 1 }}>
                {initials}
              </span>
            </div>
          )}
        </div>

        {/* Text content */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 0 }}>
          {/* Name */}
          <span
            style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: 60,
              letterSpacing: -2.5,
              lineHeight: 1.05,
              marginBottom: 12,
            }}
          >
            {agent.name}
          </span>

          {/* Role + location */}
          <span
            style={{
              color: "#666",
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: -0.3,
              marginBottom: bio ? 28 : 40,
            }}
          >
            {subtitle}
          </span>

          {/* Bio */}
          {bio && (
            <span
              style={{
                color: "#4a4a4a",
                fontWeight: 700,
                fontSize: 20,
                lineHeight: 1.5,
                marginBottom: 40,
              }}
            >
              &ldquo;{bio}&rdquo;
            </span>
          )}

          {/* Divider */}
          <div style={{ display: "flex", width: "100%", height: 1, background: "#1f1f1f", marginBottom: 28 }} />

          {/* Properties count */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#111",
                border: "1px solid #2a2a2a",
                borderRadius: 50,
                paddingLeft: 22,
                paddingRight: 22,
                paddingTop: 10,
                paddingBottom: 10,
              }}
            >
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 18, letterSpacing: -0.3 }}>
                {count} {propLabel}
              </span>
            </div>
            <span style={{ color: "#333", fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: "uppercase" }}>
              en Conexory
            </span>
          </div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630, fonts }
  )
}
