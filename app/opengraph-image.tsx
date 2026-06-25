import { ImageResponse } from "next/og"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

function loadFont(filename: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), "public/fonts", filename))
}

const markBlack = `data:image/png;base64,${fs.readFileSync(
  path.join(process.cwd(), "public/mark-black.png")
).toString("base64")}`

const PROPERTY_IMAGE = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=680&q=85&fit=crop&crop=center"

export default async function Image() {
  const fontBold = loadFont("inter-bold.woff")
  const fontBlack = loadFont("inter-black.woff")

  const fonts = [
    { name: "Inter", data: fontBold, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: fontBlack, weight: 900 as const, style: "normal" as const },
  ]

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#fff",
        display: "flex",
        fontFamily: "Inter",
        padding: "64px 72px",
        gap: 80,
        alignItems: "center",
      }}
    >
      {/* Left — brand + pitch */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: 0,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
          <img src={markBlack} alt="" style={{ width: 40, height: 40 }} />
          <span
            style={{
              color: "#000",
              fontWeight: 900,
              fontSize: 36,
              letterSpacing: -1,
            }}
          >
            Conexory
          </span>
        </div>

        {/* Headline */}
        <span
          style={{
            color: "#000",
            fontWeight: 900,
            fontSize: 72,
            letterSpacing: -3,
            lineHeight: 1.0,
            marginBottom: 28,
          }}
        >
          Comparte propiedades por WhatsApp en segundos.
        </span>

        {/* Subline */}
        <span
          style={{
            color: "#5e5e5e",
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: -0.3,
            lineHeight: 1.5,
            marginBottom: 48,
          }}
        >
          Ficha profesional · Link único · Gratis para empezar
        </span>

        {/* CTA pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#000",
            borderRadius: 999,
            paddingLeft: 28,
            paddingRight: 28,
            paddingTop: 14,
            paddingBottom: 14,
            alignSelf: "flex-start",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: 22,
              letterSpacing: -0.5,
            }}
          >
            conexory.com
          </span>
        </div>
      </div>

      {/* Right — mock property card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 340,
          borderRadius: 24,
          background: "#fff",
          border: "1px solid #e5e5e5",
          flexShrink: 0,
          padding: 12,
        }}
      >
        {/* Photo area — framed with padding + radius */}
        <div
          style={{
            width: "100%",
            height: 200,
            position: "relative",
            display: "flex",
            overflow: "hidden",
            borderRadius: 16,
          }}
        >
          <img
            src={PROPERTY_IMAGE}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: 16 }}
          />
          {/* Price badge */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              background: "#000",
              borderRadius: 999,
              paddingLeft: 14,
              paddingRight: 14,
              paddingTop: 6,
              paddingBottom: 6,
              display: "flex",
            }}
          >
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 18, letterSpacing: -0.5 }}>
              $450 M
            </span>
          </div>
        </div>

        {/* Card content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "16px 8px 8px",
            gap: 8,
          }}
        >
          <span style={{ color: "#000", fontWeight: 900, fontSize: 20, letterSpacing: -0.5, lineHeight: 1.2 }}>
            Apartamento en El Poblado
          </span>
          <span style={{ color: "#afafaf", fontWeight: 700, fontSize: 15 }}>
            Medellín, Antioquia
          </span>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            {["3 hab", "2 baños", "85 m²"].map((tag) => (
              <div
                key={tag}
                style={{
                  background: "#efefef",
                  border: "1px solid #e5e5e5",
                  borderRadius: 999,
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingTop: 5,
                  paddingBottom: 5,
                  display: "flex",
                }}
              >
                <span style={{ color: "#5e5e5e", fontWeight: 700, fontSize: 13 }}>{tag}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#e5e5e5", marginTop: 8, marginBottom: 4 }} />

          {/* Agent row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#efefef",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#afafaf", fontWeight: 900, fontSize: 14 }}>JA</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{ color: "#000", fontWeight: 700, fontSize: 14 }}>Juan Agudelo</span>
              <span style={{ color: "#afafaf", fontWeight: 700, fontSize: 12 }}>Asesor inmobiliario</span>
            </div>
          </div>

          {/* WhatsApp button */}
          <div
            style={{
              background: "#000",
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 12,
              paddingBottom: 12,
              marginTop: 4,
            }}
          >
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>
              Contactar por WhatsApp
            </span>
          </div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630, fonts }
  )
}
