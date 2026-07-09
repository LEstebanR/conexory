import type { ReactElement } from "react"
import {
  W,
  PAD,
  CANVAS,
  type FlyerData,
  has,
  dots,
  bigTitle,
  locationChip,
  brandRow,
  highlightBadge,
  priceBox,
  sectionChip,
  featureRow,
  featureList,
  photoCard,
  panel,
  footerBar,
  descriptionText,
} from "./shared"

// Template: Clásica — big title over textured canvas, framed hero photo with
// the price box overlapping its edge, thumb strip, feature and description
// panels (based on reference flyer #8)
export function templateClasica(d: FlyerData): ReactElement {
  const thumbs = d.photos.slice(1, 4)
  const features = has(d, "caracteristicas") ? featureList(d.property).slice(0, 6) : []
  const description = descriptionText(d, 300, 21)
  const badge = highlightBadge(d, 19)
  const priceOverlap = has(d, "precio")

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: CANVAS,
        position: "relative",
      }}
    >
      {dots({ top: -60, right: -40 })}
      {dots({ bottom: 80, left: -90 })}

      <div style={{ display: "flex", flexDirection: "column", padding: `${PAD}px ${PAD}px 0`, flexGrow: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {bigTitle(d, 66)}
            {locationChip(d)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16, flexShrink: 0 }}>
            {brandRow(false)}
            {badge}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            position: "relative",
            marginTop: 28,
            flexGrow: 1,
            minHeight: 330,
            marginBottom: priceOverlap ? 52 : 22,
          }}
        >
          {photoCard(d.photos[0], { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }, 26)}
          {priceOverlap && (
            <div style={{ display: "flex", position: "absolute", bottom: -42, right: 28 }}>
              {priceBox(d, 46)}
            </div>
          )}
        </div>

        {thumbs.length >= 2 && (
          <div style={{ display: "flex", gap: 16 }}>
            {thumbs.map((src, i) =>
              photoCard(
                src,
                {
                  width: (W - PAD * 2 - 16 * (thumbs.length - 1)) / thumbs.length,
                  height: 156,
                },
                18,
                i
              )
            )}
          </div>
        )}

        {(features.length > 0 || description) && (
          <div style={{ display: "flex", gap: 18, marginTop: 22, marginBottom: 24 }}>
            {features.length > 0 &&
              panel(
                [
                  sectionChip("Características"),
                  <div key="grid" style={{ display: "flex", flexWrap: "wrap", marginTop: 18 }}>
                    {features.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          width: description ? "100%" : "50%",
                          paddingBottom: 11,
                        }}
                      >
                        {featureRow(f, 22)}
                      </div>
                    ))}
                  </div>,
                ],
                { flex: 1 }
              )}
            {description &&
              panel(
                [
                  sectionChip("Descripción"),
                  <div key="text" style={{ display: "flex", marginTop: 18 }}>
                    {description}
                  </div>,
                ],
                { flex: 1.25 }
              )}
          </div>
        )}
      </div>
      {footerBar(d)}
    </div>
  )
}
