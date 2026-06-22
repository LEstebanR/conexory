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
    ? agent.bio.length > 90
      ? agent.bio.slice(0, 87) + "…"
      : agent.bio
    : null

  const subtitle = ["Asesor inmobiliario", agent.location].filter(Boolean).join("  ·  ")

  return new ImageResponse(
    <div
      style={{
        background: "#000",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "56px 88px 60px",
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      {/* Conexory mark — top right, absolute */}
      <div
        style={{
          position: "absolute",
          top: 52,
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
          <span style={{ color: "#000", fontWeight: 900, fontSize: 16, lineHeight: 1 }}>C</span>
        </div>
        <span style={{ color: "#fff", fontWeight: 900, fontSize: 20, letterSpacing: -0.5 }}>
          Conexory
        </span>
      </div>

      {/* Central block — avatar + text, vertically centered */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
          gap: 56,
        }}
      >
        {/* Avatar */}
        {agent.image ? (
          <img
            src={agent.image}
            alt=""
            width={156}
            height={156}
            style={{
              borderRadius: "50%",
              border: "4px solid #2a2a2a",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 156,
              height: 156,
              borderRadius: "50%",
              background: "#1a1a1a",
              border: "4px solid #2a2a2a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 52, lineHeight: 1 }}>
              {initials}
            </span>
          </div>
        )}

        {/* Text column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: 0,
          }}
        >
          {/* Name */}
          <span
            style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: 64,
              letterSpacing: -2.5,
              lineHeight: 1.05,
              marginBottom: 14,
            }}
          >
            {agent.name}
          </span>

          {/* Role + location */}
          <span
            style={{
              color: "#666",
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: -0.3,
              marginBottom: bio ? 24 : 0,
            }}
          >
            {subtitle}
          </span>

          {/* Bio */}
          {bio && (
            <span
              style={{
                color: "#444",
                fontWeight: 700,
                fontSize: 20,
                lineHeight: 1.5,
              }}
            >
              &ldquo;{bio}&rdquo;
            </span>
          )}
        </div>
      </div>

      {/* Bottom bar — divider + property count */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div style={{ width: "100%", height: 1, background: "#1f1f1f" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
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
          <span
            style={{
              color: "#333",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            en Conexory
          </span>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630, fonts }
  )
}
