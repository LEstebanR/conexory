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

const markWhite = `data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), "public/mark-white.png")).toString("base64")}`

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

  const initials = agent.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const count = agent.properties.length
  const propLabel = count === 1 ? "propiedad activa" : "propiedades activas"

  const bio = agent.bio
    ? agent.bio.length > 130
      ? agent.bio.slice(0, 127) + "…"
      : agent.bio
    : null

  const subtitle = ["Asesor inmobiliario", agent.location].filter(Boolean).join("  ·  ")

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        fontFamily: "Inter",
      }}
    >
      {/* Left panel — full-height photo or initials */}
      <div
        style={{
          width: 420,
          height: 630,
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {agent.image ? (
          <img
            src={agent.image}
            alt=""
            width={420}
            height={630}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span
            style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: 140,
              letterSpacing: -4,
              opacity: 0.12,
              lineHeight: 1,
            }}
          >
            {initials}
          </span>
        )}
      </div>

      {/* Right panel — content */}
      <div
        style={{
          flex: 1,
          height: 630,
          background: "#000",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px 72px 48px 64px",
        }}
      >
        {/* Top: name + subtitle + bio */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: 76,
              letterSpacing: -2.5,
              lineHeight: 1.05,
              marginBottom: 16,
            }}
          >
            {agent.name}
          </span>
          <span
            style={{
              color: "#555",
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: -0.3,
              marginBottom: bio ? 28 : 0,
            }}
          >
            {subtitle}
          </span>
          {bio && (
            <span
              style={{
                color: "#777",
                fontWeight: 700,
                fontSize: 25,
                lineHeight: 1.55,
              }}
            >
              &ldquo;{bio}&rdquo;
            </span>
          )}
        </div>

        {/* Bottom: divider + stats + Conexory mark */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ width: "100%", height: 1, background: "#222" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
                  paddingTop: 12,
                  paddingBottom: 12,
                }}
              >
                <span style={{ color: "#ccc", fontWeight: 900, fontSize: 20, letterSpacing: -0.3 }}>
                  {count} {propLabel}
                </span>
              </div>
              <span
                style={{
                  color: "#444",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                en Conexory
              </span>
            </div>

            {/* Conexory mark */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src={markWhite} alt="" style={{ width: 26, height: 26 }} />
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 22, letterSpacing: -0.5 }}>
                Conexory
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630, fonts }
  )
}
