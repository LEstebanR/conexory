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

const markBlack = `data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), "public/mark-black.png")).toString("base64")}`

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
          background: "#fff",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
        }}
      >
        <img src={markBlack} alt="" style={{ width: 56, height: 56 }} />
        <span style={{ color: "#000", fontFamily: "Inter", fontWeight: 900, fontSize: 60, letterSpacing: -2 }}>
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
      {/* Left panel — framed photo or initials */}
      <div
        style={{
          width: 460,
          height: 630,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          padding: 44,
        }}
      >
        {agent.image ? (
          <div style={{ display: "flex", width: "100%", height: "100%", borderRadius: 28, overflow: "hidden" }}>
            <img
              src={agent.image}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 28 }}
            />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              borderRadius: 28,
              background: "#efefef",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "#000",
                fontWeight: 900,
                fontSize: 140,
                letterSpacing: -4,
                opacity: 0.14,
                lineHeight: 1,
              }}
            >
              {initials}
            </span>
          </div>
        )}
      </div>

      {/* Right panel — content */}
      <div
        style={{
          flex: 1,
          height: 630,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px 72px 48px 28px",
        }}
      >
        {/* Top: name + subtitle + bio */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              color: "#000",
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
              color: "#afafaf",
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
                color: "#5e5e5e",
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
          <div style={{ width: "100%", height: 1, background: "#e5e5e5" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#efefef",
                  border: "1px solid #e5e5e5",
                  borderRadius: 50,
                  paddingLeft: 22,
                  paddingRight: 22,
                  paddingTop: 12,
                  paddingBottom: 12,
                }}
              >
                <span style={{ color: "#5e5e5e", fontWeight: 900, fontSize: 20, letterSpacing: -0.3 }}>
                  {count} {propLabel}
                </span>
              </div>
              <span
                style={{
                  color: "#afafaf",
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
              <img src={markBlack} alt="" style={{ width: 26, height: 26 }} />
              <span style={{ color: "#000", fontWeight: 900, fontSize: 22, letterSpacing: -0.5 }}>
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
