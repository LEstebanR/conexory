import type { ReactElement } from "react"
import {
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
  featureRow,
  featureList,
  panel,
  footerBar,
  descriptionText,
  truncate,
} from "./shared"

// Typographic fallback when the property has no photos
export function templateSinFotos(d: FlyerData): ReactElement {
  const features = has(d, "caracteristicas") ? featureList(d.property).slice(0, 6) : []
  const description = descriptionText(d, 520, 26)
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
      {dots({ bottom: 140, left: -90 })}

      <div style={{ display: "flex", flexDirection: "column", padding: `${PAD}px ${PAD}px 0`, flexGrow: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {bigTitle(d, 82)}
            {locationChip(d, 26)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
            {brandRow(false)}
            {highlightBadge(d, 18, 320)}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 56 }}>
          <span style={{ fontSize: 44, fontWeight: 900, color: "#1c1c1c", letterSpacing: -1, lineHeight: 1.18 }}>
            {truncate(d.property.title, 70)}
          </span>
          {description && panel([description], { padding: "26px 30px" })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: "auto", paddingBottom: 40 }}>
          {features.length > 0 &&
            panel(
              [
                <div key="grid" style={{ display: "flex", flexWrap: "wrap" }}>
                  {features.map((f, i) => (
                    <div key={i} style={{ display: "flex", width: "50%", padding: "9px 0" }}>
                      {featureRow(f, 24)}
                    </div>
                  ))}
                </div>,
              ],
              { padding: "22px 30px" }
            )}
          <div style={{ display: "flex", alignSelf: "flex-start" }}>{priceBox(d, 56)}</div>
        </div>
      </div>
      {footerBar(d)}
    </div>
  )
}
