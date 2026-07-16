import { ImageResponse } from "next/og"
import sharp from "sharp"
import type { Property } from "@prisma/client"
import { PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/property-types"
import { DEFAULT_FLYER_OPTIONS, type FlyerOptions } from "@/lib/flyer-options"
import { getAppUrl } from "@/lib/urls"
import {
  W,
  H,
  INK,
  readableOn,
  ensureTextContrast,
  ensureContrastAgainst,
  relativeLuminance,
  type Agent,
  type FlyerData,
  loadFont,
  photoAsDataUrl,
  FLYER_RENDER_VERSION,
} from "./shared"
import { templateClasica } from "./clasica"
import { templateFicha } from "./ficha"
import { templateFotos } from "./fotos"
import { templateSinFotos } from "./sin-fotos"

export { FLYER_RENDER_VERSION }

// Read once at module load, not per request — matches the markWhite/markBlack
// pattern in shared.tsx instead of blocking the event loop on every render.
const fontBold = loadFont("inter-bold.woff")
const fontBlack = loadFont("inter-black.woff")

export async function generateFlyerJpeg(
  property: Property,
  agent: Agent,
  options: FlyerOptions = DEFAULT_FLYER_OPTIONS
): Promise<Buffer> {
  const typeLabel = PROPERTY_TYPE_LABELS[property.type] ?? property.type
  const transactionLabel = property.transactionType
    ? TRANSACTION_TYPE_LABELS[property.transactionType] ?? null
    : null
  const publicPath = `${getAppUrl().replace(/^https?:\/\//, "")}/p/${property.slug}`

  const photos = (
    await Promise.all(
      property.images.slice(0, 4).map((url, i) => photoAsDataUrl(url, i === 0 ? 1400 : 800))
    )
  ).filter((p): p is string => p !== null)

  const accentColor = options.accentColor || INK
  // Falls back to accentColor (auto-darkened if needed) when the agent
  // hasn't picked a secondary — keeps old callers / cached options working.
  const secondaryColor = options.secondaryColor || accentColor

  const data: FlyerData = {
    property,
    agent,
    options,
    typeLabel,
    transactionLabel,
    publicPath,
    photos,
    accentColor,
    accentOnColor: readableOn(accentColor),
    primaryTextColor: ensureTextContrast(accentColor),
    accentTextColor: ensureTextContrast(secondaryColor),
    secondaryOnAccentColor: ensureContrastAgainst(secondaryColor, relativeLuminance(accentColor)),
  }

  const node =
    photos.length === 0
      ? templateSinFotos(data)
      : options.template === "ficha"
        ? templateFicha(data)
        : options.template === "fotos"
          ? templateFotos(data)
          : templateClasica(data)

  const fonts = [
    { name: "Inter", data: fontBold, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: fontBlack, weight: 900 as const, style: "normal" as const },
  ]

  const png = Buffer.from(
    await new ImageResponse(node, { width: W, height: H, fonts }).arrayBuffer()
  )
  return sharp(png).jpeg({ quality: 84, mozjpeg: true }).toBuffer()
}
