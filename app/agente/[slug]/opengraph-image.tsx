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
      image: true,
      profilePublished: true,
    },
  })
}

// Google profile photo URLs (lh3.googleusercontent.com/...=s96-c) embed a
// pixel size in the URL — the default is tiny, so bump it before rendering
// at AVATAR_SIZE or the circle upscales a 96px thumbnail into a blur.
function highResAvatar(url: string): string {
  try {
    if (new URL(url).hostname !== "lh3.googleusercontent.com") return url
  } catch {
    return url
  }
  return url.replace(/=s\d+-c/, "=s600-c")
}

const AVATAR_SIZE = 560
const avatarFrame = {
  display: "flex" as const,
  width: AVATAR_SIZE,
  height: AVATAR_SIZE,
  borderRadius: AVATAR_SIZE / 2,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  border: "1px solid rgba(0,0,0,0.08)",
  boxShadow: "0 10px 28px rgba(0,0,0,0.10)",
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const agent = await getAgent(slug)

  const fontBlack = loadFont("inter-black.woff")
  const fonts = [{ name: "Inter", data: fontBlack, weight: 900 as const, style: "normal" as const }]

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

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {agent.image ? (
        <div style={{ ...avatarFrame, overflow: "hidden" }}>
          <img
            src={highResAvatar(agent.image)}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: AVATAR_SIZE / 2 }}
          />
        </div>
      ) : (
        <div style={avatarFrame}>
          <img src={markBlack} alt="" style={{ width: 240, height: 240 }} />
        </div>
      )}
    </div>,
    { width: 1200, height: 630, fonts }
  )
}
