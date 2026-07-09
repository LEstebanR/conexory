import type { ReactElement } from "react"
import {
  W,
  PAD,
  CANVAS,
  INK,
  BODY,
  type FlyerData,
  has,
  dots,
  bigTitle,
  locationChip,
  brandRow,
  highlightBadge,
  sectionChip,
  featureRow,
  featureList,
  photoCard,
  panel,
  footerBar,
  descriptionText,
  truncate,
  priceValuePanelNode,
} from "./shared"

// Template: Ficha técnica — framed photos on the left, spec column with
// underlined heading, price panel and highlight tag on the right (based on
// reference flyer #7)
export function templateFicha(d: FlyerData): ReactElement {
  const thumbs = d.photos.slice(1, 3)
  const features = has(d, "caracteristicas") ? featureList(d.property).slice(0, 6) : []
  const badge = highlightBadge(d, 18)
  const description = descriptionText(d, 400, 21)
  const colGap = 26
  const rightW = 330
  const leftW = W - PAD * 2 - rightW - colGap

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
      {dots({ top: 40, right: -70 })}

      <div style={{ display: "flex", flexDirection: "column", padding: `${PAD}px ${PAD}px 0`, flexGrow: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 600 }}>
            {bigTitle(d, 58)}
            <span style={{ fontSize: 26, fontWeight: 700, color: BODY, letterSpacing: -0.5, lineHeight: 1.3 }}>
              {truncate(d.property.title, 80)}
            </span>
            {locationChip(d, 21)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14, flexShrink: 0 }}>
            {brandRow(false)}
            {badge}
          </div>
        </div>

        <div style={{ display: "flex", gap: colGap, marginTop: 26, flexGrow: 1, marginBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, width: leftW }}>
            <div style={{ display: "flex", position: "relative", flexGrow: 1, minHeight: 400 }}>
              {photoCard(d.photos[0], { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }, 24)}
            </div>
            {thumbs.length > 0 && (
              <div style={{ display: "flex", gap: 16 }}>
                {thumbs.map((src, i) =>
                  photoCard(
                    src,
                    {
                      width: (leftW - 16 * (thumbs.length - 1)) / thumbs.length,
                      height: 190,
                    },
                    18,
                    i
                  )
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, width: rightW }}>
            {features.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: INK, letterSpacing: 2.5, textTransform: "uppercase" }}>
                  Características
                </span>
                <div style={{ display: "flex", width: 64, height: 5, background: INK, borderRadius: 3, marginTop: 10 }} />
                <div style={{ display: "flex", flexDirection: "column", marginTop: 22 }}>
                  {features.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        paddingBottom: 16,
                        marginBottom: 16,
                        borderBottom: i < features.length - 1 ? "1.5px solid #e2e2e0" : "none",
                      }}
                    >
                      {featureRow(f, 22)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {has(d, "precio") &&
              panel(
                [
                  <span key="l" style={{ fontSize: 20, fontWeight: 700, color: BODY }}>
                    Precio:
                  </span>,
                  <div key="v" style={{ display: "flex", marginTop: 2 }}>
                    {priceValuePanelNode(d, 40)}
                  </div>,
                ],
                { padding: "20px 26px", marginTop: "auto" }
              )}
          </div>
        </div>

        {description && (
          <div style={{ display: "flex", marginBottom: 26 }}>
            {panel(
              [
                sectionChip("Descripción"),
                <div key="text" style={{ display: "flex", marginTop: 18 }}>
                  {description}
                </div>,
              ],
              { flex: 1 }
            )}
          </div>
        )}
      </div>
      {footerBar(d)}
    </div>
  )
}
