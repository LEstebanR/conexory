import type { ReactElement } from "react"
import {
  W,
  PAD,
  CANVAS,
  INK,
  PANEL_SHADOW,
  type FlyerData,
  has,
  icon,
  bigTitle,
  brandRow,
  priceBox,
  featureList,
  locationLine,
  photo,
  panel,
  footerBar,
  truncate,
} from "./shared"

// Template: Fotos — hero photo with curved sweep and floating badges, title
// and price row, feature strip panel, photo collage (based on reference
// flyers #4 and #5)
export function templateFotos(d: FlyerData): ReactElement {
  const thumbs = d.photos.slice(1, 4)
  const features = has(d, "caracteristicas") ? featureList(d.property).slice(0, 4) : []
  const badge = d.options.highlight
  const location = locationLine(d.property)

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: CANVAS }}>
      <div style={{ display: "flex", position: "relative", flexGrow: 1, minHeight: thumbs.length >= 2 ? 470 : 600 }}>
        {photo(d.photos[0], { width: "100%", height: "100%", borderBottomRightRadius: 130 })}
        {badge && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              position: "absolute",
              top: 28,
              left: 28,
              background: "#fff",
              borderRadius: 50,
              padding: "13px 26px",
              boxShadow: PANEL_SHADOW,
            }}
          >
            {icon("tag", 24, INK)}
            <span style={{ fontSize: 20, fontWeight: 900, color: INK, letterSpacing: 1.5, textTransform: "uppercase" }}>
              {truncate(badge, 30)}
            </span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 28,
            right: 28,
            background: "#fff",
            borderRadius: 50,
            padding: "12px 24px",
            boxShadow: PANEL_SHADOW,
          }}
        >
          {brandRow(false, 22)}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 26, padding: `30px ${PAD}px 34px` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, flexGrow: 1 }}>
          {bigTitle(d, 60)}
          {location && (
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              {icon("pin", 27, INK)}
              <span style={{ fontSize: 25, fontWeight: 700, color: "#242424" }}>
                {truncate(location, 34)}
              </span>
            </div>
          )}
        </div>
        {priceBox(d, 46)}
      </div>

      {features.length > 0 && (
        <div style={{ display: "flex", padding: `0 ${PAD}px` }}>
          {panel(
            [
              <div key="strip" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 26 }}>
                    {i > 0 && <div style={{ display: "flex", width: 1.5, height: 52, background: "#e2e2e0" }} />}
                    <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                      {icon(f.icon, 36, INK)}
                      <span style={{ fontSize: 22, fontWeight: 700, color: "#242424" }}>{f.label}</span>
                    </div>
                  </div>
                ))}
              </div>,
            ],
            { flex: 1, padding: "20px 30px" }
          )}
        </div>
      )}

      {thumbs.length >= 2 && (
        <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
          {thumbs.map((src, i) =>
            photo(src, { width: (W - 10 * (thumbs.length - 1)) / thumbs.length, height: 215 }, i)
          )}
        </div>
      )}

      {footerBar(d)}
    </div>
  )
}
